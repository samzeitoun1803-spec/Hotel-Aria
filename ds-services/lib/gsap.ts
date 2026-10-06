"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.defaults({ ease: "power4.out", duration: 1 });
  // Les barres d'outils mobiles ne doivent pas provoquer de recalculs en rafale.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

export { gsap, ScrollTrigger, SplitText };
