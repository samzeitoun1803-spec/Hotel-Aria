import type { CSSProperties } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rail } from "@/components/ui/Rail";
import { company } from "@/data/company";

/**
 * Depuis 2014 — une frise minimale. Aucun événement intermédiaire n'est inventé :
 * seules les années sont graduées, comme une règle d'architecte.
 */
export function Timeline() {
  const start = company.founded;
  const end = new Date().getFullYear();
  const span = Math.max(1, end - start);
  const years = Array.from({ length: span - 1 }, (_, i) => start + i + 1);

  return (
    <section id="a-propos" className="section timeline surface-paper" aria-labelledby="about-title" data-scene>
      <Rail />
      <div className="container-x">
        <Eyebrow node>À propos · Depuis {start}</Eyebrow>

        <div className="about-grid">
          <h2 id="about-title" className="t-section about-title" data-reveal="lines">
            <span className="ln">Plus de dix ans</span> <span className="ln">d’activité à Nice.</span>
          </h2>
          <p className="t-body about-text" data-reveal="fade">
            {company.name} est une {company.legalForm} niçoise créée en juillet {start} et dirigée par{" "}
            {company.manager}. Son activité&nbsp;: les travaux d’électricité et de rénovation.
          </p>
        </div>

        <div className="tl" data-timeline>
          <span className="tl-year tl-start tabular-nums">{start}</span>
          <div className="tl-track" aria-hidden="true">
            <span className="tl-base" />
            <span className="tl-live" />
            <span className="tl-clip">
              <span className="tl-pulse-track">
                <span className="tl-pulse" />
              </span>
            </span>
            {years.map((y) => {
              const pos = (y - start) / span;
              return (
                <span
                  key={y}
                  className="tl-tick"
                  data-pos={pos.toFixed(4)}
                  style={{ "--pos": pos } as CSSProperties}
                >
                  <span className="tl-tick-label tabular-nums">’{String(y).slice(2)}</span>
                </span>
              );
            })}
          </div>
          <span className="tl-year tl-end">Aujourd’hui</span>
        </div>
      </div>
    </section>
  );
}
