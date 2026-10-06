import type Lenis from "lenis";

/**
 * Accès partagé à l'instance Lenis (smooth scroll), sans contexte React :
 * le menu mobile, la tête de courant ou le formulaire en ont besoin ponctuellement.
 */

let instance: Lenis | null = null;
const listeners = new Set<(lenis: Lenis | null) => void>();

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
  listeners.forEach((fn) => fn(lenis));
}

export function getLenis() {
  return instance;
}

export function onLenis(fn: (lenis: Lenis | null) => void) {
  listeners.add(fn);
  fn(instance);
  return () => {
    listeners.delete(fn);
  };
}

/** Bloque / débloque le défilement (menu plein écran, visionneuse). */
export function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle("scroll-locked", locked);
  if (instance) {
    if (locked) instance.stop();
    else instance.start();
  }
}

/** easeInOutQuart : départ ferme, arrivée douce — un déplacement « précis ». */
const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

/**
 * Défile jusqu'à une cible, avec Lenis si disponible, sinon nativement.
 * La durée dépend de la distance (0,9 s à 1,7 s) : une ancre proche ne traîne pas,
 * une ancre lointaine ne téléporte pas.
 */
export function scrollToTarget(
  target: HTMLElement | number,
  opts: { immediate?: boolean; onComplete?: () => void } = {},
) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const immediate = opts.immediate || reduce;
  const top =
    typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;

  if (instance && !immediate) {
    const distance = Math.abs(top - window.scrollY);
    const duration = Math.min(1.7, Math.max(0.9, distance / 2600));
    instance.scrollTo(top, {
      duration,
      easing: easeInOutQuart,
      force: true,
      onComplete: () => opts.onComplete?.(),
    });
    return;
  }
  if (instance) instance.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: "auto" });
  opts.onComplete?.();
}
