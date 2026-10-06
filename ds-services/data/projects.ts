/**
 * Réalisations.
 *
 * ⚠️ PLACEHOLDERS — aucune photographie réelle n'a encore été fournie.
 * Les visuels affichés sont des compositions graphiques (public/realisations/placeholder-*.svg),
 * explicitement signalées « Photographie à venir ». Ne JAMAIS remplacer ces entrées
 * par des images de banque d'images ou générées présentées comme des chantiers DS SERVICES.
 *
 * Pour publier une vraie réalisation :
 *  1. déposer la photo dans /public/realisations/ (JPG/WEBP, ≥ 2400 px de large) ;
 *  2. renseigner `image` (src, width, height), `alt`, `year`, `location` ;
 *  3. passer `isPlaceholder` à false.
 */

export type ProjectLayout = "wide" | "offset" | "full";

export type Project = {
  id: string;
  title: string;
  category: string;
  /** Lieu du chantier, tel que confirmé par DS SERVICES */
  location: string | null;
  year: number | null;
  image: { src: string; width: number; height: number } | null;
  alt: string;
  isPlaceholder: boolean;
  layout: ProjectLayout;
  /** Composition graphique (public/realisations/placeholder-<art>.svg) affichée tant qu'il n'y a pas de photo */
  art: "elevation" | "tableau" | "coupe";
};

export const projects: Project[] = [
  {
    id: "realisation-01",
    title: "Réalisation à documenter",
    category: "Installation électrique",
    location: null,
    year: null,
    image: null,
    alt: "",
    isPlaceholder: true,
    layout: "wide",
    art: "elevation",
  },
  {
    id: "realisation-02",
    title: "Réalisation à documenter",
    category: "Rénovation électrique",
    location: null,
    year: null,
    image: null,
    alt: "",
    isPlaceholder: true,
    layout: "offset",
    art: "tableau",
  },
  {
    id: "realisation-03",
    title: "Réalisation à documenter",
    category: "Mise à niveau",
    location: null,
    year: null,
    image: null,
    alt: "",
    isPlaceholder: true,
    layout: "full",
    art: "coupe",
  },
];

export const hasRealProjects = projects.some((p) => !p.isPlaceholder);
