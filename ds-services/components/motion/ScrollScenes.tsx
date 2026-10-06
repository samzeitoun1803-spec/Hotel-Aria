"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onLenis } from "@/lib/lenis-store";
import { HEAD } from "@/lib/motion";
import { setupScene } from "./scenes";

declare global {
  interface Window {
    __dsRevealFallback?: number;
  }
}

/**
 * Animations liées au scroll — chargées après l'intro (voir MotionLayer).
 *  1. relie Lenis à ScrollTrigger ;
 *  2. prépare chaque section [data-scene] à son approche, une par tâche ;
 *  3. porte la tête d'impulsion de « la colonne ».
 */
export function ScrollScenes() {
  const pathname = usePathname();
  const headRef = useRef<HTMLDivElement>(null);

  /* Lenis ↔ ScrollTrigger, polices, filet de sécurité */
  useEffect(() => {
    let offScroll: (() => void) | null = null;
    const unsubscribe = onLenis((lenis) => {
      offScroll?.();
      offScroll = lenis ? lenis.on("scroll", ScrollTrigger.update) : null;
    });
    window.clearTimeout(window.__dsRevealFallback);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      unsubscribe();
      offScroll?.();
    };
  }, []);

  /* Mise en scène paresseuse, section par section */
  useEffect(() => {
    const contexts = new Map<HTMLElement, gsap.Context>();
    const queue: HTMLElement[] = [];
    let timer = 0;

    const drain = () => {
      timer = 0;
      const next = queue.shift();
      if (next && !contexts.has(next)) contexts.set(next, setupScene(next));
      if (queue.length) timer = window.setTimeout(drain, 0);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          io.unobserve(el);
          queue.push(el);
        });
        if (queue.length && !timer) timer = window.setTimeout(drain, 0);
      },
      { rootMargin: "80% 0px 80% 0px" },
    );
    document.querySelectorAll<HTMLElement>("[data-scene]").forEach((el) => io.observe(el));

    return () => {
      window.clearTimeout(timer);
      io.disconnect();
      contexts.forEach((ctx, el) => {
        ctx.revert();
        el.removeAttribute("data-scene-ready");
      });
    };
  }, [pathname]);

  /* Tête d'impulsion : fixée au point de contact, sur l'axe du rail */
  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    const rails = Array.from(document.querySelectorAll<HTMLElement>("[data-rail]"));
    if (rails.length === 0) return;

    const place = () => el.style.setProperty("--rail-x", `${Math.round(rails[0].getBoundingClientRect().left)}px`);
    place();
    window.addEventListener("resize", place);

    const trigger = ScrollTrigger.create({
      trigger: rails[0],
      start: `top ${HEAD}`,
      endTrigger: rails[rails.length - 1],
      end: `bottom ${HEAD}`,
      onToggle: (self) => el.classList.toggle("is-on", self.isActive),
    });

    // La traîne s'étire avec la vitesse de défilement et se rétracte à l'arrêt.
    const tail = el.querySelector<HTMLElement>(".current-head-tail");
    const setTail = tail ? gsap.quickTo(tail, "scaleY", { duration: 0.45, ease: "power3.out" }) : null;
    let offScroll: (() => void) | null = null;
    const unsubscribe = onLenis((lenis) => {
      offScroll?.();
      offScroll =
        lenis && setTail
          ? lenis.on("scroll", ({ velocity }: { velocity: number }) =>
              setTail(Math.min(1, 0.22 + Math.abs(velocity) * 0.035)),
            )
          : null;
    });

    return () => {
      window.removeEventListener("resize", place);
      trigger.kill();
      unsubscribe();
      offScroll?.();
      el.classList.remove("is-on");
    };
  }, [pathname]);

  return (
    <div ref={headRef} className="current-head" aria-hidden="true">
      <span className="current-head-tail" />
      <span className="current-head-dot" />
    </div>
  );
}
