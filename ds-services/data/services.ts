/**
 * Domaines d'intervention.
 *
 * Volontairement généraux tant que la liste exacte des prestations n'est pas
 * confirmée par DS SERVICES (activité déclarée : travaux d'électricité et de
 * rénovation — NAF 4321A). Préciser ici, jamais dans les composants.
 */

export type ServiceId = "installation" | "renovation" | "mise-a-niveau" | "intervention";

export type Service = {
  id: ServiceId;
  index: string;
  title: string;
  /** Titre court (formulaire, menus) */
  shortTitle: string;
  summary: string;
};

export const services: Service[] = [
  {
    id: "installation",
    index: "01",
    title: "Installation électrique",
    shortTitle: "Installation",
    summary: "Pour les locaux neufs ou entièrement réaménagés, du tableau aux points d’usage.",
  },
  {
    id: "renovation",
    index: "02",
    title: "Rénovation électrique",
    shortTitle: "Rénovation",
    summary: "Pour reprendre une installation existante à l’occasion de travaux.",
  },
  {
    id: "mise-a-niveau",
    index: "03",
    title: "Mise à niveau des installations",
    shortTitle: "Mise à niveau",
    summary: "Pour les installations anciennes qui ne répondent plus aux usages d’aujourd’hui.",
  },
  {
    id: "intervention",
    index: "04",
    title: "Interventions électriques",
    shortTitle: "Intervention",
    summary: "Pour une intervention ponctuelle sur une installation existante.",
  },
];

export type ProjectTypeValue = ServiceId | "autre";

/** Options du champ « Type de projet » du formulaire. */
export const projectTypes: { value: ProjectTypeValue; label: string }[] = [
  ...services.map((s) => ({ value: s.id, label: s.shortTitle })),
  { value: "autre", label: "Autre / à préciser" },
];

export function projectTypeLabel(value: string): string {
  const fromServices = services.find((s) => s.id === value);
  if (fromServices) return fromServices.title;
  return value === "autre" ? "Autre / à préciser" : "Non précisé";
}
