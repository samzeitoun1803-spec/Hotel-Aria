/**
 * Réglages du site (SEO, URL publique).
 * L'URL publique se règle via NEXT_PUBLIC_SITE_URL (voir .env.example).
 */

const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");

export const site = {
  /** URL publique — null tant que le nom de domaine n'est pas connu. */
  url: envUrl ? envUrl : null,
  locale: "fr_FR",
  language: "fr",
  name: "DS SERVICES",
  title: "Électricien à Nice — installation et rénovation électrique",
  description:
    "DS SERVICES, entreprise d’électricité installée à Nice depuis 2014 : installation électrique, rénovation et mise à niveau d’installations. 35 rue Rossini, 06000 Nice. Demande de devis en ligne.",
  /** Couleur de la barre du navigateur mobile (Warm Canvas). */
  themeColor: "#F9F8F6",
  /** Date de dernière mise à jour des pages légales (AAAA-MM). */
  legalUpdated: "2026-10",
} as const;

/** URL de base utilisée pour les métadonnées absolues. */
export function baseUrl(): string {
  return site.url ?? "http://localhost:3000";
}
