"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Transition d'entrée entre pages (navigations client uniquement).
 * Au premier chargement, rien ne bouge : le contenu s'affiche immédiatement
 * (l'intro du hero, en CSS, prend le relais). Lors des navigations suivantes,
 * la page entrante glisse de quelques pixels et s'éclaircit.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    // Montage initial (< 2 s après le début du chargement) : pas de transition.
    if (!el || performance.now() < 2000) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, []);

  return (
    <div ref={ref} className="page">
      {children}
    </div>
  );
}
