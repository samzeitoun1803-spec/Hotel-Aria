import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Rail } from "@/components/ui/Rail";
import { Sig } from "@/components/ui/Sig";
import { company } from "@/data/company";
import { NBSP } from "@/lib/typography";

/** Le manifeste. Beaucoup de vide, une phrase, une précision. */
export function Intro() {
  return (
    <section id="intro" className="section intro" aria-labelledby="intro-title" data-scene>
      <Rail />
      <div className="container-x">
        <Eyebrow node>
          {company.name} · Depuis {company.founded}
        </Eyebrow>

        <div className="intro-grid">
          <h2 id="intro-title" className="intro-statement">
            <span className="intro-a t-statement" data-reveal="lines">
              <span className="ln">Un travail électrique</span>{" "}
              <span className="ln">{`ne${NBSP}se voit pas toujours.`}</span>
            </span>
            <Sig standalone className="intro-b t-statement-sig">
              <span className="intro-b-1">Sa qualité,</span>
              <span className="intro-b-2">si.</span>
            </Sig>
          </h2>

          <div className="intro-aside" data-reveal="fade">
            <p className="t-body">
              Entreprise d’électricité installée rue Rossini depuis {company.founded}, {company.name} réalise
              des travaux d’installation électrique et de rénovation, dans tous types de locaux, à Nice.
            </p>
            <a href="#services" className="link-u">
              Voir les services
              <Icon name="arrow-right" size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
