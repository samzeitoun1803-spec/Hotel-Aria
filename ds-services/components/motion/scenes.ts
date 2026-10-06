import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { HEAD } from "@/lib/motion";

/**
 * Mise en scène d'une section.
 * Préparée paresseusement par ScrollScenes à l'approche de l'écran, une étape à la fois :
 * le travail (découpage des titres, création des déclencheurs) est réparti en tâches
 * de quelques millisecondes au lieu d'un long blocage.
 *
 * Les sections déclarent leurs intentions par attributs (data-reveal, data-rail,
 * data-node, data-roll…) ; sans JavaScript ou avec « réduire les animations »,
 * le CSS affiche directement l'état final.
 */

const COBALT = "#2545FF";

type Query = <T extends Element = HTMLElement>(sel: string) => T[];
type Step = (q: Query) => void;

export type Scene = {
  context: gsap.Context;
  /** Exécute l'étape suivante ; renvoie vrai quand la section est entièrement prête. */
  next: () => boolean;
};

/**
 * Prépare une section étape par étape (voir ScrollScenes : chaque tâche s'arrête
 * après quelques millisecondes, le navigateur reste disponible pour l'utilisateur).
 */
export function createScene(root: HTMLElement): Scene {
  const context = gsap.context(() => {}, root);
  const q: Query = <T extends Element = HTMLElement>(sel: string) => {
    const found = Array.from(root.querySelectorAll<T>(sel));
    return root.matches(sel) ? [root as unknown as T, ...found] : found;
  };
  let index = 0;
  return {
    context,
    next() {
      const step = STEPS[index++];
      if (step) context.add(() => step(q));
      if (index < STEPS.length) return false;
      root.dataset.sceneReady = "";
      return true;
    },
  };
}

const STEPS: Step[] = [
  /* ── La colonne : le segment passe sous tension au passage du point de contact ── */
  (q) =>
    q("[data-rail]").forEach((rail) => {
      const live = rail.querySelector(".rail-live");
      if (!live) return;
      gsap.fromTo(
        live,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: rail, start: `top ${HEAD}`, end: `bottom ${HEAD}`, scrub: true },
        },
      );
    }),

  /* ── Nœuds : s'allument quand le courant les atteint ── */
  (q) =>
    q("[data-node]").forEach((node) => {
      ScrollTrigger.create({
        trigger: node,
        start: `center ${HEAD}`,
        onEnter: () => node.classList.add("is-live"),
        onLeaveBack: () => node.classList.remove("is-live"),
      });
    }),

  /* ── Dérivations : une impulsion parcourt le filet à l'arrivée du courant ── */
  (q) =>
    q("[data-sweep]").forEach((item) => {
      ScrollTrigger.create({
        trigger: item,
        start: `top ${HEAD}`,
        once: true,
        onEnter: () => item.classList.add("is-swept"),
      });
    }),

  /* ── Titres : révélation ligne par ligne, par masque ;
        les mots signature reçoivent ensuite l'énergie (cobalt → couleur finale). ── */
  (q) =>
    q("[data-reveal='lines']").forEach((el) => {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        linesClass: "split-line",
        autoSplit: true,
        // aria-label n'est autorisé que sur un élément de titre (pas sur un <span> générique).
        aria: /^H[1-6]$/.test(el.tagName) ? "auto" : "none",
        onSplit(self) {
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 86%", once: true } });
          tl.from(self.lines, { yPercent: 112, duration: 1.15, stagger: 0.09, ease: "power4.out" }, 0);
          const sigs = el.querySelectorAll<HTMLElement>("[data-energize]");
          if (sigs.length) {
            const finalColor = getComputedStyle(sigs[0]).color;
            tl.fromTo(sigs, { color: COBALT }, { color: finalColor, duration: 1, ease: "power2.out" }, 0.8);
          }
          gsap.set(el, { visibility: "visible" });
          return tl;
        },
      });
    }),

  /* ── Signature isolée : balayage cobalt de gauche à droite, puis stabilisation ── */
  (q) =>
    q("[data-reveal='energize']").forEach((el) => {
      const finalColor = getComputedStyle(el).color;
      gsap
        .timeline({ scrollTrigger: { trigger: el, start: "top 86%", once: true } })
        .fromTo(
          el,
          { clipPath: "inset(-25% 100% -30% -8%)", color: COBALT },
          { clipPath: "inset(-25% -8% -30% -8%)", duration: 1.05, ease: "power3.inOut" },
        )
        .to(el, { color: finalColor, duration: 0.9, ease: "power2.out" }, "-=0.25");
      gsap.set(el, { visibility: "visible" });
    }),

  /* ── Apparitions simples ── */
  (q) =>
    q("[data-reveal='fade']").forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    }),

  /* ── Section navy : les mots s'allument au fil de la lecture.
        Point de départ à 38 % d'opacité : le texte reste lisible (contraste ≥ 3:1). ── */
  (q) =>
    q("[data-reveal='words']").forEach((el) => {
      SplitText.create(el, {
        type: "words",
        wordsClass: "split-word",
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: "visible" });
          return gsap.fromTo(
            self.words,
            { opacity: 0.38 },
            {
              opacity: 1,
              stagger: 0.12,
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 74%", end: "bottom 46%", scrub: 0.4 },
            },
          );
        },
      });
    }),

  /* ── Ligne qui traverse lentement une section ── */
  (q) =>
    q("[data-traverse]").forEach((el) => {
      const track = el.querySelector(".traverse-track");
      const section = el.closest("section") ?? el;
      if (!track) return;
      gsap.fromTo(
        track,
        { xPercent: -22 },
        {
          xPercent: 100,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top 70%", end: "bottom 30%", scrub: 0.6 },
        },
      );
    }),

  /* ── Réalisations : masque, parallaxe à peine perceptible ── */
  (q) =>
    q("[data-reveal='figure']").forEach((fig) => {
      gsap.fromTo(
        fig,
        { clipPath: "inset(100% 0% 0% 0% round 22px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 22px)",
          duration: 1.5,
          ease: "expo.out",
          scrollTrigger: { trigger: fig, start: "top 86%", once: true },
        },
      );
      gsap.set(fig, { visibility: "visible" });
      const layer = fig.querySelector("[data-parallax]");
      if (layer) {
        gsap.fromTo(
          layer,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: "none",
            scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }
    }),

  /* ── Repères : compteurs à rouleaux ── */
  (q) =>
    q("[data-roll]").forEach((el) => {
      const cols = el.querySelectorAll(".roll-col");
      gsap.set(cols, { y: 0, yPercent: 0 });
      gsap.to(cols, {
        yPercent: -90,
        duration: 1.7,
        stagger: 0.1,
        ease: "power4.inOut",
        scrollTrigger: { trigger: el, start: "top 86%", once: true },
      });
    }),

  /* ── Frise 2014 → aujourd'hui ── */
  (q) =>
    q("[data-timeline]").forEach((el) => {
      const live = el.querySelector(".tl-live");
      const track = el.querySelector(".tl-pulse-track");
      const ticks = Array.from(el.querySelectorAll<HTMLElement>(".tl-tick"));
      const positions = ticks.map((t) => Number(t.dataset.pos ?? 0));
      gsap
        .timeline({
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            end: "top 28%",
            scrub: 0.5,
            onUpdate: (self) => {
              ticks.forEach((t, i) => t.classList.toggle("is-live", self.progress >= positions[i] - 0.001));
              el.classList.toggle("is-complete", self.progress > 0.995);
            },
          },
        })
        .fromTo(live, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0)
        .fromTo(track, { xPercent: 0 }, { xPercent: 100, ease: "none" }, 0);
    }),

  /* ── Plan de Nice : tracé à l'entrée ── */
  (q) =>
    q("[data-map]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        once: true,
        onEnter: () => el.classList.add("is-drawn"),
      });
    }),

  /* ── Animations d'ambiance : seulement quand l'élément est à l'écran ── */
  (q) =>
    q("[data-map], [data-onscreen]").forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => el.classList.toggle("is-onscreen", self.isActive),
      });
    }),
];
