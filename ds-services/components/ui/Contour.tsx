"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import { MOTION_QUERY } from "@/lib/motion";

export type ContourHandle = {
  /** Fait courir une impulsion autour du contour. `loop` : en continu (chargement). */
  pulse: (opts?: { loop?: boolean }) => Animation | null;
};

type ContourProps = {
  /** Rayon des angles en px ; absent = pill (rayon = demi-hauteur). */
  radius?: number;
  /** Longueur de l'impulsion, en fraction du périmètre. */
  segment?: number;
  /** Longueur maximale de l'impulsion (px). */
  maxSegment?: number;
  className?: string;
  ref?: Ref<ContourHandle>;
};

/**
 * Contour SVG mesuré sur son parent (positionné) : une impulsion peut ainsi suivre
 * exactement la géométrie d'un bouton pill ou d'un champ arrondi, quelle que soit sa taille.
 * Le parent doit être en position relative ; le SVG le recouvre sans capter les clics.
 */
export function Contour({ radius, segment = 0.28, maxSegment = 120, className, ref }: ContourProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<SVGRectElement>(null);
  const perimeter = useRef(0);

  useEffect(() => {
    const svg = svgRef.current;
    const rect = rectRef.current;
    const host = svg?.parentElement;
    if (!svg || !rect || !host) return;
    const measure = () => {
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      if (!w || !h) return;
      const inset = 0.75;
      const rw = w - inset * 2;
      const rh = h - inset * 2;
      const r = Math.min(radius ?? rh / 2, rh / 2, rw / 2);
      rect.setAttribute("x", String(inset));
      rect.setAttribute("y", String(inset));
      rect.setAttribute("width", String(rw));
      rect.setAttribute("height", String(rh));
      rect.setAttribute("rx", String(r));
      perimeter.current = 2 * (rw - 2 * r) + 2 * (rh - 2 * r) + 2 * Math.PI * r;
      rect.style.strokeDasharray = `0 ${perimeter.current}`;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, [radius]);

  useImperativeHandle(
    ref,
    () => ({
      pulse: ({ loop = false } = {}) => {
        const rect = rectRef.current;
        const P = perimeter.current;
        if (!rect || !P || !window.matchMedia(MOTION_QUERY).matches) return null;
        const seg = Math.min(P * segment, maxSegment);
        rect.style.strokeDasharray = `${seg} ${P}`;
        return rect.animate(
          [
            { strokeDashoffset: seg, opacity: 0 },
            { opacity: 1, offset: 0.1 },
            { opacity: 1, offset: 0.84 },
            { strokeDashoffset: -P, opacity: 0 },
          ],
          loop
            ? { duration: 1150, iterations: Infinity, easing: "linear" }
            : { duration: Math.min(900, 380 + P * 0.35), easing: "cubic-bezier(0.65, 0, 0.35, 1)" },
        );
      },
    }),
    [segment, maxSegment],
  );

  return (
    <svg ref={svgRef} className={className ?? "contour"} aria-hidden="true" focusable="false">
      <rect ref={rectRef} />
    </svg>
  );
}
