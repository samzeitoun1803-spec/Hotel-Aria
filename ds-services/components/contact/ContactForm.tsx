"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Contour, type ContourHandle } from "@/components/ui/Contour";
import { Icon } from "@/components/ui/Icon";
import { projectTypes } from "@/data/services";
import { cn } from "@/lib/cn";
import {
  CONTACT_LIMITS,
  hasErrors,
  normalizeContact,
  validateContact,
  type ContactErrors,
  type ContactField,
  type ContactInput,
  type ContactResponse,
} from "@/lib/contact";
import { NNBSP } from "@/lib/typography";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: ContactInput = { name: "", phone: "", email: "", projectType: "", message: "" };

const FAILURE_MESSAGES: Record<string, string> = {
  rate_limited: "Trop de demandes en peu de temps. Réessayez dans quelques minutes.",
  not_configured: "L’envoi en ligne n’est pas encore activé sur ce site. Réessayez prochainement.",
  delivery_failed: "La demande n’a pas pu être transmise. Réessayez dans un instant.",
  network: "La demande n’a pas pu être envoyée. Vérifiez votre connexion, puis réessayez.",
  bad_request: "La demande n’a pas pu être envoyée. Réessayez dans un instant.",
};

const FIELD_ORDER: Array<ContactField | "contact"> = ["name", "phone", "email", "contact", "projectType", "message"];

/** Horloge du piège temporel — appelée uniquement depuis des effets et des gestionnaires d'événements. */
const clock = () => Date.now();

/* ── Champ : libellé, contrôle à contour actif, erreur ─────────────────── */

function Field({
  id,
  label,
  optional,
  error,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  const contour = useRef<ContourHandle>(null);
  return (
    <div className={cn("field", error && "has-error", className)}>
      <label htmlFor={id} className="field-label">
        {label}
        {optional ? <span className="field-optional">facultatif</span> : null}
      </label>
      <div className="field-control" onFocusCapture={() => contour.current?.pulse()}>
        {children}
        <Contour ref={contour} radius={14} segment={0.16} maxSegment={160} className="field-contour" />
      </div>
      {error ? (
        <p id={`${id}-error`} className="field-error">
          <span aria-hidden="true">!</span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/* ── Formulaire ────────────────────────────────────────────────────────── */

export function ContactForm() {
  const uid = useId();
  const ids = {
    name: `${uid}-name`,
    phone: `${uid}-phone`,
    email: `${uid}-email`,
    projectType: `${uid}-type`,
    message: `${uid}-message`,
    contact: `${uid}-contact-hint`,
  };

  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [failure, setFailure] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = clock();
  }, []);

  /* Pré-remplissage : un clic sur un service (data-prefill) choisit le type de projet */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as Element | null)?.closest?.("[data-prefill]") as HTMLElement | null;
      const value = trigger?.dataset.prefill;
      if (value && projectTypes.some((t) => t.value === value)) {
        setValues((prev) => ({ ...prev, projectType: value }));
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const update = (field: ContactField) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (attempted) setErrors(validateContact(normalizeContact(next)));
    if (status === "error") setStatus("idle");
  };

  const focusFirstError = (errs: ContactErrors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const target =
      first === "contact"
        ? document.getElementById(ids.phone)
        : first === "projectType"
          ? formRef.current?.querySelector<HTMLInputElement>("input[name='projectType']")
          : document.getElementById(ids[first]);
    target?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "submitting") return;
    setAttempted(true);
    const input = normalizeContact(values);
    const errs = validateContact(input);
    setErrors(errs);
    if (hasErrors(errs)) {
      focusFirstError(errs);
      return;
    }

    setStatus("submitting");
    setFailure(null);
    const honeypot = (formRef.current?.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";

    try {
      const [res] = await Promise.all([
        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, website: honeypot, elapsed: clock() - startedAt.current }),
        }),
        // Laisser l'impulsion de chargement se lire, même si le serveur répond très vite.
        new Promise((r) => setTimeout(r, 900)),
      ]);
      const data = (await res.json().catch(() => ({ ok: false, code: "bad_request" }))) as ContactResponse;
      if (data.ok) {
        setStatus("success");
      } else if (data.code === "validation") {
        setErrors(data.errors);
        setStatus("idle");
        focusFirstError(data.errors);
      } else {
        setFailure(FAILURE_MESSAGES[data.code] ?? FAILURE_MESSAGES.bad_request);
        setStatus("error");
      }
    } catch {
      setFailure(FAILURE_MESSAGES.network);
      setStatus("error");
    }
  };

  const reset = () => {
    setValues(EMPTY);
    setErrors({});
    setAttempted(false);
    setStatus("idle");
    setFailure(null);
    startedAt.current = clock();
    requestAnimationFrame(() => document.getElementById(ids.name)?.focus());
  };

  const describedBy = (field: ContactField, extra?: string) =>
    [errors[field] ? `${ids[field]}-error` : null, extra].filter(Boolean).join(" ") || undefined;

  const locked = status === "submitting" || status === "success";

  return (
    <form ref={formRef} className="contact-form" noValidate onSubmit={onSubmit} data-status={status}>
      <fieldset className="contact-fields" disabled={locked}>
        <legend className="sr-only">Votre demande</legend>

        <Field id={ids.name} label="Nom" error={errors.name}>
          <input
            id={ids.name}
            name="name"
            type="text"
            autoComplete="name"
            maxLength={CONTACT_LIMITS.name}
            value={values.name}
            onChange={update("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            required
          />
        </Field>

        <div className="field-pair">
          <Field id={ids.phone} label="Téléphone" optional error={errors.phone}>
            <input
              id={ids.phone}
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={CONTACT_LIMITS.phone}
              value={values.phone}
              onChange={update("phone")}
              aria-invalid={errors.phone || errors.contact ? true : undefined}
              aria-describedby={describedBy("phone", ids.contact)}
            />
          </Field>
          <Field id={ids.email} label="E-mail" optional error={errors.email}>
            <input
              id={ids.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={CONTACT_LIMITS.email}
              value={values.email}
              onChange={update("email")}
              aria-invalid={errors.email || errors.contact ? true : undefined}
              aria-describedby={describedBy("email", ids.contact)}
            />
          </Field>
        </div>
        <p id={ids.contact} className={cn("field-hint", errors.contact && "is-error")} role={errors.contact ? "alert" : undefined}>
          {errors.contact ? (
            <>
              <span aria-hidden="true">!</span>
              {errors.contact}
            </>
          ) : (
            `Téléphone ou e-mail${NNBSP}: au moins l’un des deux.`
          )}
        </p>

        <fieldset className={cn("field chips-field", errors.projectType && "has-error")}>
          <legend className="field-label">
            Type de projet <span className="field-optional">facultatif</span>
          </legend>
          <div className="chips">
            {projectTypes.map((t) => (
              <label key={t.value} className="chip">
                <input
                  type="radio"
                  name="projectType"
                  value={t.value}
                  checked={values.projectType === t.value}
                  onChange={() => {
                    setValues((prev) => ({ ...prev, projectType: t.value }));
                    if (status === "error") setStatus("idle");
                  }}
                  onClick={() => {
                    // un second clic désélectionne (le champ est facultatif)
                    if (values.projectType === t.value) setValues((prev) => ({ ...prev, projectType: "" }));
                  }}
                />
                <span className="chip-node" aria-hidden="true" />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
          {errors.projectType ? (
            <p className="field-error">
              <span aria-hidden="true">!</span>
              {errors.projectType}
            </p>
          ) : null}
        </fieldset>

        <Field id={ids.message} label="Message" error={errors.message} className="field-message">
          <textarea
            id={ids.message}
            name="message"
            rows={5}
            maxLength={CONTACT_LIMITS.message}
            value={values.message}
            onChange={update("message")}
            placeholder="Quelques lignes sur votre projet : lieu, type de local, travaux envisagés…"
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={describedBy("message")}
            required
          />
        </Field>

        {/* Piège à robots : invisible pour les humains, ignoré par les lecteurs d'écran */}
        <div className="hp" aria-hidden="true">
          <label htmlFor={`${uid}-website`}>Site web</label>
          <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </fieldset>

      <p className="contact-notice">
        Vos informations servent uniquement à répondre à votre demande.{" "}
        <Link href="/confidentialite" className="link-inline">
          Politique de confidentialité
        </Link>
        .
      </p>

      <div className="submit-row" data-status={status}>
        <Button type="submit" loading={status === "submitting"} disabled={locked} magnetic={status === "idle"}>
          {/* Les deux libellés occupent la même case : le bouton ne change pas de largeur */}
          <span className="submit-label" data-sending={status === "submitting" ? "" : undefined}>
            <span aria-hidden={status === "submitting"}>Envoyer ma demande</span>
            <span aria-hidden={status !== "submitting"}>Envoi en cours</span>
          </span>
        </Button>
        <span className="submit-wire" aria-hidden="true">
          <span className="submit-wire-live" />
          <span className="submit-wire-pulse" />
        </span>
        <span className="submit-node" aria-hidden="true" />
        <p className="submit-result" role="status" aria-live="polite">
          {status === "success" ? (
            <>
              <Icon name="check" size={16} strokeWidth={1.6} className="submit-check" />
              Demande envoyée
            </>
          ) : null}
        </p>
      </div>

      {status === "success" ? (
        <div className="submit-after">
          <p>Merci. Votre demande a bien été transmise à DS SERVICES.</p>
          <button type="button" className="link-u" onClick={reset}>
            Envoyer une autre demande
          </button>
        </div>
      ) : null}

      {status === "error" && failure ? (
        <p className="submit-error" role="alert">
          <span aria-hidden="true">!</span>
          {failure}
        </p>
      ) : null}
    </form>
  );
}
