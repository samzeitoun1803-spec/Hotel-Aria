/**
 * Constantes du langage d'animation (voir docs/strategie-creative.md §5).
 * Trois verbes : tracer, alimenter, révéler.
 */

/** Position verticale du « point de contact » du courant, en fraction de la hauteur d'écran. */
export const HEAD_LINE = 0.62;
/** Même valeur, au format ScrollTrigger. */
export const HEAD = `${Math.round(HEAD_LINE * 100)}%`;

export const EASE = {
  /** Sorties nettes — équivalent de cubic-bezier(0.22, 1, 0.36, 1) */
  current: "power4.out",
  /** Déplacements symétriques */
  precise: "power2.inOut",
  /** Masques et images */
  mask: "expo.out",
} as const;

export const DURATION = {
  micro: 0.35,
  reveal: 1.05,
  mask: 1.25,
} as const;

/** Vitesse de l'impulsion dans le circuit du hero (unités SVG par seconde). */
export const PULSE_SPEED = 820;

export const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";
export const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/** L'utilisateur accepte les animations. Côté client uniquement. */
export const motionAllowed = () => window.matchMedia(MOTION_QUERY).matches;

/** Souris ou pavé tactile : survols, curseur, aimantation. Côté client uniquement. */
export const finePointer = () => window.matchMedia(FINE_POINTER_QUERY).matches;
