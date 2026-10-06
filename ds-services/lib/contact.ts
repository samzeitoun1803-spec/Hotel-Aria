/**
 * Validation du formulaire de contact — partagée entre le navigateur et l'API,
 * pour que les messages d'erreur soient identiques des deux côtés.
 */

import { projectTypes } from "@/data/services";

export type ContactField = "name" | "phone" | "email" | "projectType" | "message";

export type ContactInput = Record<ContactField, string>;

/** `contact` = erreur transverse « téléphone ou e-mail ». */
export type ContactErrors = Partial<Record<ContactField | "contact", string>>;

export const CONTACT_LIMITS = {
  name: 120,
  phone: 40,
  email: 160,
  message: 4000,
  messageMin: 10,
} as const;

/** Délai minimal (ms) entre l'affichage du formulaire et l'envoi — piège à robots. */
export const MIN_FILL_TIME_MS = 2500;

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[^\s@<>()[\]\\,;:"]{2,}$/;

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\u0000/g, "").trim().slice(0, max);
}

export function normalizeContact(raw: Record<string, unknown>): ContactInput {
  return {
    name: clean(raw.name, CONTACT_LIMITS.name).replace(/\s+/g, " "),
    phone: clean(raw.phone, CONTACT_LIMITS.phone),
    email: clean(raw.email, CONTACT_LIMITS.email).toLowerCase(),
    projectType: clean(raw.projectType, 40),
    message: clean(raw.message, CONTACT_LIMITS.message + 1),
  };
}

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (input.name.length < 2) errors.name = "Indiquez votre nom.";

  if (input.phone) {
    const digits = input.phone.replace(/\D/g, "");
    if (!/^[+()\d\s.\-]+$/.test(input.phone) || digits.length < 9 || digits.length > 15) {
      errors.phone = "Ce numéro ne semble pas valide.";
    }
  }

  if (input.email && !EMAIL_RE.test(input.email)) {
    errors.email = "Cette adresse e-mail ne semble pas valide.";
  }

  if (!input.phone && !input.email) {
    errors.contact = "Indiquez au moins un téléphone ou un e-mail.";
  }

  if (input.projectType && !projectTypes.some((t) => t.value === input.projectType)) {
    errors.projectType = "Choisissez un type de projet dans la liste.";
  }

  if (!input.message) {
    errors.message = "Décrivez votre projet en quelques mots.";
  } else if (input.message.length < CONTACT_LIMITS.messageMin) {
    errors.message = "Quelques mots de plus aideront à comprendre votre projet.";
  } else if (input.message.length > CONTACT_LIMITS.message) {
    errors.message = "Votre message est trop long (4 000 caractères maximum).";
  }

  return errors;
}

export function hasErrors(errors: ContactErrors): boolean {
  return Object.keys(errors).length > 0;
}

export type ContactResponse =
  | { ok: true; dryRun?: boolean }
  | { ok: false; code: "validation"; errors: ContactErrors }
  | { ok: false; code: "rate_limited" | "not_configured" | "delivery_failed" | "bad_request" };
