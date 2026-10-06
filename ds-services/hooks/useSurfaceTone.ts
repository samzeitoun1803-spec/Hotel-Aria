"use client";

import { useEffect, useState } from "react";

export type SurfaceTone = "light" | "dark";

/**
 * Ton de la surface qui passe sous une ligne fixe de l'écran, à `probe` pixels du haut :
 * « dark » quand un élément correspondant à `selector` la traverse.
 * `refreshKey` relance la détection (changement de page, par exemple).
 */
export function useSurfaceTone(selector: string, probe: number, refreshKey?: unknown): SurfaceTone {
  const [tone, setTone] = useState<SurfaceTone>("light");

  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (!zones.length) return;
    const under = new Set<Element>();
    let io: IntersectionObserver | null = null;

    const observe = () => {
      io?.disconnect();
      under.clear();
      // Bande d'un pixel à la hauteur de la ligne : seule la surface qui la traverse compte.
      const bottom = Math.max(0, window.innerHeight - probe - 1);
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) under.add(entry.target);
            else under.delete(entry.target);
          });
          setTone(under.size ? "dark" : "light");
        },
        { rootMargin: `-${probe}px 0px -${bottom}px 0px` },
      );
      zones.forEach((zone) => io?.observe(zone));
    };

    observe();
    window.addEventListener("resize", observe);
    return () => {
      io?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [selector, probe, refreshKey]);

  return tone;
}
