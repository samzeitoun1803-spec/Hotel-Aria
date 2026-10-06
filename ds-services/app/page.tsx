import { Contact } from "@/sections/Contact";
import { Expertise } from "@/sections/Expertise";
import { Figures } from "@/sections/Figures";
import { Hero } from "@/sections/Hero";
import { Intro } from "@/sections/Intro";
import { Local } from "@/sections/Local";
import { Projects } from "@/sections/Projects";
import { Services } from "@/sections/Services";
import { Timeline } from "@/sections/Timeline";

/**
 * Accueil — un seul parcours, du hero (la source) au contact (le circuit se ferme).
 * SOURCE → EXPERTISE → INSTALLATION → RÉALISATION → CONTACT
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <Services />
      <Expertise />
      <Figures />
      <Projects />
      <Timeline />
      <Local />
      <Contact />
    </>
  );
}
