export type NavItem = { label: string; id: string };

/** Navigation centrale (desktop). Chaque entrée pointe vers une section du même nom. */
export const mainNav: NavItem[] = [
  { label: "Services", id: "services" },
  { label: "Expertise", id: "expertise" },
  { label: "Réalisations", id: "realisations" },
  { label: "À propos", id: "a-propos" },
];

/** Menu mobile plein écran. */
export const mobileNav: NavItem[] = [...mainNav, { label: "Contact", id: "contact" }];

export const legalNav = [
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
] as const;

/**
 * Lien vers une section de l'accueil : ancre simple sur la page d'accueil,
 * chemin complet ailleurs (pages légales, 404).
 */
export function sectionHref(id: string, onHome: boolean): string {
  return onHome ? `#${id}` : `/#${id}`;
}
