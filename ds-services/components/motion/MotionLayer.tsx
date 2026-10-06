"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MOTION_QUERY } from "@/lib/motion";

/* Le moteur d'animation (GSAP, ScrollTrigger, SplitText) vit dans un fragment séparé. */
const ScrollScenes = dynamic(() => import("./ScrollScenes").then((m) => m.ScrollScenes), { ssr: false });

/** Fin de l'intro du hero (CSS) : rien ne doit la perturber. */
const INTRO_END_MS = 2200;

/**
 * Charge les animations au scroll une fois l'intro jouée et le navigateur au repos,
 * ou dès la première interaction (défilement, toucher, clavier).
 * Jamais si l'utilisateur demande à réduire les animations.
 */
export function MotionLayer() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.matchMedia(MOTION_QUERY).matches) return;
    const events = ["wheel", "touchstart", "pointerdown", "keydown", "scroll"] as const;
    let idleId = 0;
    let timer = 0;
    let done = false;

    const cleanup = () => {
      events.forEach((type) => window.removeEventListener(type, go));
      window.clearTimeout(timer);
      if (idleId && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
    };
    function go() {
      if (done) return;
      done = true;
      cleanup();
      setReady(true);
    }

    // Arrivée au milieu de la page (rechargement, lien vers une ancre) : pas d'attente,
    // le contenu visible ne doit pas rester masqué.
    if (window.scrollY > 40 || window.location.hash) {
      go();
      return cleanup;
    }

    events.forEach((type) => window.addEventListener(type, go, { passive: true }));
    const wait = Math.max(0, INTRO_END_MS - performance.now());
    timer = window.setTimeout(() => {
      if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(go, { timeout: 1500 });
      else go();
    }, wait);

    return cleanup;
  }, []);

  return ready ? <ScrollScenes /> : null;
}
