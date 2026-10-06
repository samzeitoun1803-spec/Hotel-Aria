"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { finePointer, motionAllowed } from "@/lib/motion";

/**
 * Interactions du circuit du hero (le dessin lui-même est rendu côté serveur) :
 *  — micro-impulsion quand le curseur croise un nœud terminal ;
 *  — de rares impulsions « au repos », uniquement si le hero est visible.
 * Toutes les mesures sont lues dans les attributs data-* posés par HeroCircuitSvg.
 */

const COBALT = "#2545FF";
const INK = "#0C1754";

function flashNode(node: SVGElement, delay = 0) {
  node.animate(
    [
      { fill: COBALT, transform: "scale(1.9)" },
      { fill: INK, transform: "scale(1)" },
    ],
    { duration: 700, delay, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
}

function firePulse(svg: SVGSVGElement, circuitId: string, stretch = 1.15) {
  const group = svg.querySelector<SVGGElement>(`.hc-circuit[data-circuit="${circuitId}"]`);
  const pulse = group?.querySelector<SVGPathElement>(".hc-pulse");
  if (!group || !pulse) return;
  const length = Number(group.dataset.len);
  const start = Number(group.dataset.start);
  const pulseDuration = Number(group.dataset.pdur);
  const p = Number(svg.dataset.pulse);
  pulse.animate([{ strokeDashoffset: p }, { strokeDashoffset: -length }], {
    duration: pulseDuration * 1000 * stretch,
    easing: "linear",
  });
  svg
    .querySelectorAll<SVGCircleElement>(`.hc-nodes[data-circuit="${circuitId}"] .hc-node`)
    .forEach((node) => flashNode(node, (Number(node.dataset.t) - start) * 1000 * stretch));
}

export function HeroCircuit({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !motionAllowed()) return;

    const svgs = Array.from(root.querySelectorAll<SVGSVGElement>("svg[data-variant]"));
    const visibleSvg = () => svgs.find((s) => s.getBoundingClientRect().width > 0) ?? null;

    let inView = true;
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(root);

    /* Survol des nœuds terminaux (pointeur fin uniquement) */
    const lastFire = new Map<string, number>();
    const onEnter = (e: Event) => {
      const hit = e.currentTarget as SVGCircleElement;
      const id = hit.dataset.hit;
      const svg = hit.ownerSVGElement;
      if (!id || !svg) return;
      const now = performance.now();
      if (now - (lastFire.get(id) ?? 0) < 900) return;
      lastFire.set(id, now);
      firePulse(svg, id, 0.9);
      hit.parentElement?.querySelector<SVGCircleElement>(".hc-node-ring")?.animate(
        [
          { stroke: COBALT, strokeOpacity: 0.9, transform: "scale(0.6)" },
          { stroke: COBALT, strokeOpacity: 0, transform: "scale(2.4)" },
        ],
        { duration: 800, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    };
    const hits = finePointer()
      ? Array.from(root.querySelectorAll<SVGCircleElement>(".hc-hit"))
      : [];
    hits.forEach((h) => h.addEventListener("pointerenter", onEnter));

    /* Impulsions au repos : rares, jamais hors écran ni onglet masqué */
    let timer = 0;
    const schedule = (delay: number) => {
      timer = window.setTimeout(() => {
        const svg = visibleSvg();
        if (svg && inView && document.visibilityState === "visible") {
          const pool = Array.from(svg.querySelectorAll<SVGGElement>(".hc-circuit[data-terminal]"));
          const pick = pool[Math.floor(Math.random() * pool.length)];
          if (pick?.dataset.circuit) firePulse(svg, pick.dataset.circuit);
        }
        schedule(7000 + Math.random() * 5000);
      }, delay);
    };
    schedule(5200);

    return () => {
      window.clearTimeout(timer);
      io.disconnect();
      hits.forEach((h) => h.removeEventListener("pointerenter", onEnter));
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-circuit">
      {children}
    </div>
  );
}
