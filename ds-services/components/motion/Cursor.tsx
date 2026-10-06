"use client";

import { useEffect, useRef } from "react";
import { finePointer, motionAllowed } from "@/lib/motion";

type CursorState = "default" | "link" | "project" | "service" | "hidden";

const LABELS: Partial<Record<CursorState, string>> = {
  project: "Voir",
};

/** Part du chemin parcourue à chaque image : rapide, précis, sans traîner. */
const FOLLOW = 0.42;

/** Zones où le curseur passe en blanc : sections navy, boutons cobalt. */
const LIGHT_ZONES = "[data-theme='dark'], .btn-primary:not([disabled])";

/**
 * Curseur personnalisé — desktop uniquement, jamais sur écran tactile,
 * jamais si l'utilisateur réduit les animations. Il n'intercepte aucun clic
 * (pointer-events: none) et s'efface au-dessus des champs de saisie.
 *  normal  : petit point navy
 *  lien    : cercle un peu plus grand
 *  projet  : « Voir »
 *  service : flèche, sur fond cobalt (le courant)
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!finePointer() || !motionAllowed()) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");
    const label = el.querySelector<HTMLElement>(".cursor-label");

    let state: CursorState = "default";
    let visible = false;
    let raf = 0;
    let scrollRaf = 0;
    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };

    const render = () => {
      pos.x += (target.x - pos.x) * FOLLOW;
      pos.y += (target.y - pos.y) * FOLLOW;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (Math.abs(target.x - pos.x) > 0.1 || Math.abs(target.y - pos.y) > 0.1) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const setState = (next: CursorState, tone: "dark" | "light") => {
      el.dataset.tone = tone;
      if (next === state) return;
      state = next;
      el.dataset.state = next;
      if (label) label.textContent = LABELS[next] ?? "";
    };

    const resolve = (node: Element | null): CursorState => {
      if (!node) return "default";
      const tagged = node.closest<HTMLElement>("[data-cursor]");
      if (tagged?.dataset.cursor) return tagged.dataset.cursor as CursorState;
      if (node.closest("input, textarea, select, [contenteditable='true']")) return "hidden";
      if (node.closest("[disabled], [aria-disabled='true']")) return "default";
      if (node.closest("a, button, label, summary, [role='button']")) return "link";
      return "default";
    };

    const update = (node: Element | null) => {
      setState(resolve(node), node?.closest(LIGHT_ZONES) ? "light" : "dark");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        pos.x = target.x;
        pos.y = target.y;
        el.classList.add("is-visible");
      }
      if (!raf) raf = requestAnimationFrame(render);
      update(e.target as Element | null);
    };
    // Défilement à la molette sans bouger la souris : la page glisse sous le curseur,
    // son état doit suivre ce qui passe dessous.
    const onScroll = () => {
      if (!visible || scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        update(document.elementFromPoint(target.x, target.y));
      });
    };
    const onLeave = () => {
      visible = false;
      el.classList.remove("is-visible");
    };
    const onDown = () => el.classList.add("is-pressed");
    const onUp = () => el.classList.remove("is-pressed");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scrollRaf);
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <div ref={ref} className="cursor" data-state="default" data-tone="dark" aria-hidden="true">
      <span className="cursor-shape">
        <span className="cursor-label" />
        <svg className="cursor-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h11.5M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
        </svg>
      </span>
    </div>
  );
}
