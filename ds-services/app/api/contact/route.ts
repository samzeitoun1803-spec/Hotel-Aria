import { company } from "@/data/company";
import { projectTypeLabel } from "@/data/services";
import {
  MIN_FILL_TIME_MS,
  hasErrors,
  normalizeContact,
  validateContact,
  type ContactInput,
  type ContactResponse,
} from "@/lib/contact";

/**
 * Réception des demandes de devis.
 *
 * Anti-spam (invisible pour l'utilisateur) :
 *  - champ piège « website » rempli → accepté en silence, jamais transmis ;
 *  - envoi trop rapide après l'affichage du formulaire → idem ;
 *  - plus de 3 liens dans le message → idem ;
 *  - limite de 5 demandes / 10 min par adresse IP (mémoire du processus, best effort).
 *
 * Transport (premier configuré, voir .env.example) :
 *  1. Resend (e-mail) — RESEND_API_KEY + CONTACT_TO_EMAIL + CONTACT_FROM_EMAIL
 *  2. Webhook JSON (n8n, Make, Zapier, Slack…) — CONTACT_WEBHOOK_URL
 *  3. Démonstration — CONTACT_DRY_RUN=true, ou automatiquement en développement
 * Sans transport en production : erreur explicite « not_configured ».
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function reply(body: ContactResponse, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return !host || new URL(origin).host === host;
  } catch {
    return false;
  }
}

function formatMessage(input: ContactInput) {
  const subject = `Demande de devis — ${projectTypeLabel(input.projectType)} — ${input.name}`;
  const text = [
    `Nouvelle demande reçue depuis le site ${company.name}.`,
    "",
    `Nom : ${input.name}`,
    `Téléphone : ${input.phone || "—"}`,
    `E-mail : ${input.email || "—"}`,
    `Type de projet : ${projectTypeLabel(input.projectType)}`,
    "",
    "Message :",
    input.message,
  ].join("\n");
  return { subject, text };
}

type Delivery = "sent" | "dry-run" | "not-configured" | "failed";

async function deliver(input: ContactInput): Promise<Delivery> {
  const { subject, text } = formatMessage(input);
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, CONTACT_WEBHOOK_URL, CONTACT_DRY_RUN } =
    process.env;

  try {
    if (RESEND_API_KEY && CONTACT_TO_EMAIL && CONTACT_FROM_EMAIL) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: CONTACT_FROM_EMAIL,
          to: [CONTACT_TO_EMAIL],
          subject,
          text,
          ...(input.email ? { reply_to: input.email } : {}),
        }),
        signal: AbortSignal.timeout(8000),
      });
      return res.ok ? "sent" : "failed";
    }

    if (CONTACT_WEBHOOK_URL) {
      const res = await fetch(CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, text, ...input, receivedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8000),
      });
      return res.ok ? "sent" : "failed";
    }
  } catch {
    return "failed";
  }

  if (CONTACT_DRY_RUN === "true" || process.env.NODE_ENV !== "production") {
    console.info(`[contact] Mode démonstration — demande non transmise : « ${subject} »`);
    return "dry-run";
  }
  return "not-configured";
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return reply({ ok: false, code: "bad_request" }, 403);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return reply({ ok: false, code: "bad_request" }, 400);
  }
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return reply({ ok: false, code: "bad_request" }, 400);
  }
  const body = raw as Record<string, unknown>;

  // Pièges à robots : réponse positive, rien n'est transmis.
  if (typeof body.website === "string" && body.website.trim() !== "") return reply({ ok: true });
  const elapsed = Number(body.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_TIME_MS) return reply({ ok: true });

  if (isRateLimited(clientIp(request))) return reply({ ok: false, code: "rate_limited" }, 429);

  const input = normalizeContact(body);
  const errors = validateContact(input);
  if (hasErrors(errors)) return reply({ ok: false, code: "validation", errors }, 422);

  if ((input.message.match(/https?:\/\//gi) ?? []).length > 3) return reply({ ok: true });

  const result = await deliver(input);
  if (result === "sent") return reply({ ok: true });
  if (result === "dry-run") return reply({ ok: true, dryRun: true });
  if (result === "not-configured") return reply({ ok: false, code: "not_configured" }, 503);
  return reply({ ok: false, code: "delivery_failed" }, 502);
}
