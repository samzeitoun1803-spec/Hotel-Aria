import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rail } from "@/components/ui/Rail";
import { fr } from "@/lib/typography";

/** Rupture navy. Les mots s'allument au fil du scroll ; une ligne traverse lentement la section. */
export function Expertise() {
  return (
    <section
      id="expertise"
      className="section expertise surface-ink"
      data-theme="dark"
      aria-labelledby="expertise-title"
      data-scene
    >
      <Rail />
      <div className="container-x">
        <Eyebrow node>Expertise</Eyebrow>

        <h2 id="expertise-title" className="t-mega expertise-title" data-reveal="words">
          <span className="exp-line exp-line-1">De l’énergie.</span>
          <span className="exp-line exp-line-2">De la précision.</span>
          <span className="exp-line exp-line-3">Du savoir-faire.</span>
        </h2>

        <div className="traverse" data-traverse aria-hidden="true">
          <span className="traverse-base" />
          <span className="traverse-node" />
          <span className="traverse-clip">
            <span className="traverse-track">
              <span className="traverse-pulse" />
            </span>
          </span>
        </div>

        <div className="exp-foot">
          <p className="t-lead exp-text" data-reveal="fade">
            {fr(
              "Une installation électrique se juge dans le temps : à la lisibilité d’un tableau, à la logique d’un câblage, au soin d’une finition.",
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
