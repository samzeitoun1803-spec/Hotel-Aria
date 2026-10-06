"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { scrollToTarget, setLenis } from "@/lib/lenis-store";
import { motionAllowed } from "@/lib/motion";

/**
 * Smooth scroll (Lenis) et gestion des ancres :
 * tout lien vers une section de la page courante défile en douceur, met l'URL à jour
 * sans empiler l'historique, puis place le focus sur la section (accessibilité clavier).
 * Désactivé si l'utilisateur préfère réduire les animations.
 */
export function SmoothScroll() {
  useEffect(() => {
    let lenis: Lenis | null = null;

    if (motionAllowed()) {
      // Boucle d'animation propre à Lenis : GSAP n'est chargé qu'ensuite (MotionLayer),
      // et ScrollScenes se branche alors sur l'événement « scroll ».
      lenis = new Lenis({ lerp: 0.115, smoothWheel: true, wheelMultiplier: 0.95, autoRaf: true });
      setLenis(lenis);
    }

    const focusSection = (el: HTMLElement) => {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;

      const id = decodeURIComponent(url.hash.slice(1));
      const target = id === "top" ? document.getElementById("top") ?? document.body : document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      window.history.replaceState(window.history.state, "", id === "top" ? window.location.pathname : url.hash);
      const run = () =>
        scrollToTarget(id === "top" ? 0 : target, {
          onComplete: () => focusSection(target),
        });

      // Depuis le menu plein écran, le défilement est verrouillé : on attend qu'il se libère
      // (Lenis annulerait sinon l'animation en redémarrant).
      const root = document.documentElement;
      if (root.classList.contains("scroll-locked")) {
        const t0 = performance.now();
        const wait = () => {
          if (!root.classList.contains("scroll-locked") || performance.now() - t0 > 900) run();
          else requestAnimationFrame(wait);
        };
        requestAnimationFrame(wait);
      } else {
        run();
      }
    };

    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
