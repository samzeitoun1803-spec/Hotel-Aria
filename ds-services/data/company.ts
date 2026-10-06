/**
 * Source unique de vérité pour les informations de l'entreprise.
 *
 * RÈGLE : aucune donnée commerciale n'est inventée.
 * Tout ce qui n'est pas confirmé reste à `null` — l'interface affiche alors
 * un placeholder visible « [À compléter] » (voir components/ui/Missing.tsx)
 * et `npm run check:content` liste les champs manquants.
 *
 * Données vérifiées : registre du commerce et des sociétés (SIRENE / RCS).
 */

export type Company = {
  name: string;
  legalForm: string;
  /** Adresse complète sur une ligne */
  address: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  country: string;
  countryCode: string;
  /** Quartier — vérifié : la rue Rossini appartient au quartier des Musiciens */
  district: string;
  founded: number;
  /** Mois de création (1-12) */
  foundedMonth: number;
  manager: string;
  siren: string;
  registry: string;
  naf: { code: string; label: string };
  activity: string;

  /* ── À fournir par DS SERVICES ─────────────────────────────── */
  phone: string | null;
  email: string | null;
  /** Capital social (mentions légales) */
  capital: string | null;
  /** Numéro de TVA intracommunautaire (mentions légales) */
  vatNumber: string | null;
  /** Hébergeur du site : nom, adresse, téléphone (mentions légales) */
  host: string | null;
  /** Concepteur du site (crédits) */
  credits: string | null;
  /** Prestataire qui achemine les messages du formulaire, ex. « Resend » (confidentialité) */
  messageProvider: string | null;
  /** Durée de conservation des demandes, validée par DS SERVICES (confidentialité) */
  dataRetention: string | null;
};

export const company: Company = {
  name: "DS SERVICES",
  legalForm: "SARL",
  address: "35 rue Rossini, 06000 Nice",
  streetAddress: "35 rue Rossini",
  postalCode: "06000",
  city: "Nice",
  country: "France",
  countryCode: "FR",
  district: "Quartier des Musiciens",
  founded: 2014,
  foundedMonth: 7,
  manager: "David Sousan",
  siren: "803 488 584",
  registry: "RCS Nice",
  naf: {
    code: "4321A",
    label: "Travaux d’installation électrique dans tous locaux",
  },
  activity: "Travaux d’électricité et de rénovation",

  phone: null,
  email: null,
  capital: null,
  vatNumber: null,
  host: null,
  credits: null,
  messageProvider: null,
  dataRetention: null,
};

/** Libellés lisibles des champs à compléter (utilisés par le script de contrôle). */
export const companyFieldLabels: Partial<Record<keyof Company, string>> = {
  phone: "Téléphone",
  email: "E-mail",
  capital: "Capital social",
  vatNumber: "N° de TVA intracommunautaire",
  host: "Hébergeur du site",
  credits: "Crédits (concepteur du site)",
  messageProvider: "Prestataire d'envoi du formulaire",
  dataRetention: "Durée de conservation des demandes",
};

/** Lien `tel:` normalisé, ou null si le numéro n'est pas encore fourni. */
export function phoneHref(phone: string | null = company.phone): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : null;
}

/** Années d'activité révolues depuis la création (juillet 2014). */
export function yearsOfActivity(now: Date = new Date()): number {
  const years = now.getFullYear() - company.founded;
  return now.getMonth() + 1 >= company.foundedMonth ? years : years - 1;
}

/** Lien d'itinéraire (aucun script tiers chargé sur le site). */
export const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${company.name} ${company.address}`,
)}`;
