/**
 * Contrôle avant mise en ligne : liste ce que DS SERVICES doit encore fournir.
 *
 *   npm run check:content               rapport
 *   npm run check:content -- --strict   code de sortie 1 s'il reste un manque (CI, déploiement)
 *
 * Sources :
 *   data/company.ts    champs restés à null (affichés « [À compléter] » sur le site)
 *   data/projects.ts   réalisations encore provisoires
 *   environnement      URL publique et envoi du formulaire (process.env, puis .env*)
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const strict = process.argv.includes("--strict");

/* ── Données ────────────────────────────────────────────────────────────── */

async function loadData() {
  try {
    // Node ≥ 22.18 lit directement les fichiers TypeScript (types effacés).
    const { company, companyFieldLabels } = await import("../data/company.ts");
    const { projects } = await import("../data/projects.ts");
    return {
      missing: Object.entries(companyFieldLabels)
        .filter(([key]) => company[key] == null)
        .map(([key, label]) => ({ key, label })),
      placeholders: projects.filter((p) => p.isPlaceholder).length,
      total: projects.length,
    };
  } catch {
    // Versions plus anciennes : lecture du texte source.
    const src = readFileSync(join(root, "data/company.ts"), "utf8");
    const labelsBlock = src.slice(src.indexOf("companyFieldLabels"));
    const labels = Object.fromEntries(
      [...labelsBlock.matchAll(/^\s+(\w+): "([^"]+)",$/gm)].map((m) => [m[1], m[2]]),
    );
    const valuesBlock = src.slice(src.indexOf("export const company"), src.indexOf("companyFieldLabels"));
    const nulls = [...valuesBlock.matchAll(/^\s+(\w+): null,$/gm)].map((m) => m[1]);
    const projectsSrc = readFileSync(join(root, "data/projects.ts"), "utf8");
    return {
      missing: nulls.map((key) => ({ key, label: labels[key] ?? key })),
      placeholders: (projectsSrc.match(/isPlaceholder: true/g) ?? []).length,
      total: (projectsSrc.match(/isPlaceholder: (true|false)/g) ?? []).length,
    };
  }
}

/* ── Environnement ──────────────────────────────────────────────────────── */

function loadEnv() {
  const files = [".env", ".env.production", ".env.local", ".env.production.local"];
  const env = {};
  for (const file of files) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  // Les variables réellement exportées l'emportent (hébergeur, CI).
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  return env;
}

/* ── Rapport ────────────────────────────────────────────────────────────── */

const { missing, placeholders, total } = await loadData();
const env = loadEnv();
const has = (key) => Boolean(env[key]?.trim());

const transport =
  has("RESEND_API_KEY") && has("CONTACT_TO_EMAIL") && has("CONTACT_FROM_EMAIL")
    ? "Resend (e-mail)"
    : has("CONTACT_WEBHOOK_URL")
      ? "webhook"
      : null;
const dryRun = env.CONTACT_DRY_RUN === "true";

let issues = 0;
const ok = (text) => console.log(`  ✓ ${text}`);
const todo = (text) => {
  issues += 1;
  console.log(`  ✗ ${text}`);
};

console.log("\nDS SERVICES — contrôle des contenus avant mise en ligne\n");

console.log("Informations de l'entreprise (data/company.ts)");
if (missing.length === 0) ok("tout est renseigné");
for (const { key, label } of missing) todo(`${label}  →  company.${key}`);

console.log("\nRéalisations (data/projects.ts)");
if (placeholders === 0) ok(`${total} réalisation(s) avec photographie réelle`);
else todo(`${placeholders} sur ${total} encore provisoire(s) : photographies de chantiers à fournir`);

console.log("\nMise en ligne (variables d'environnement)");
if (has("NEXT_PUBLIC_SITE_URL")) ok(`URL publique : ${env.NEXT_PUBLIC_SITE_URL}`);
else todo("NEXT_PUBLIC_SITE_URL : nom de domaine à renseigner (canonical, sitemap, Open Graph)");
if (transport) ok(`formulaire de contact : ${transport}`);
else todo("formulaire de contact : aucun transport (Resend ou webhook), les demandes ne seraient pas transmises");
if (dryRun) todo("CONTACT_DRY_RUN=true : les demandes sont simulées, à désactiver en production");

console.log(
  issues === 0
    ? "\nTout est prêt.\n"
    : `\n${issues} point(s) à compléter. Les champs manquants s'affichent « [À compléter] » sur le site.\n`,
);

if (strict && issues > 0) process.exit(1);
