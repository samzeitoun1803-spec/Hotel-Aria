import { ServiceGlyph } from "@/components/art/ServiceGlyph";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Rail } from "@/components/ui/Rail";
import { Sig } from "@/components/ui/Sig";
import { services } from "@/data/services";
import { fr } from "@/lib/typography";

/**
 * Quatre lignes éditoriales — pas de cartes.
 * Chaque ligne est une dérivation de la colonne : elle s'y raccroche par un filet,
 * et un clic ouvre le formulaire avec le type de projet déjà sélectionné.
 */
export function Services() {
  return (
    <section id="services" className="section services surface-paper" aria-labelledby="services-title" data-scene>
      <Rail />
      <div className="container-x">
        <div className="services-head">
          <Eyebrow node count={String(services.length).padStart(2, "0")}>
            Services
          </Eyebrow>
          <h2 id="services-title" className="t-section services-title" data-reveal="lines">
            <span className="ln">Chaque projet commence</span>{" "}
            <span className="ln">
              par une bonne <Sig>connexion.</Sig>
            </span>
          </h2>
          <p className="services-intro t-body" data-reveal="fade">
            Du neuf à l’existant, des chantiers complets aux interventions ponctuelles.
          </p>
        </div>

        <ul className="svc-list" role="list">
          {services.map((service) => (
            <li key={service.id} className="svc-item" data-sweep>
              <a href="#contact" className="svc-row" data-prefill={service.id} data-cursor="service">
                <span className="svc-index tabular-nums">{service.index}</span>
                <span className="svc-title">{service.title}</span>
                <span className="svc-summary">{service.summary}</span>
                <span className="svc-glyph">
                  <ServiceGlyph id={service.id} />
                </span>
                <span className="svc-arrow">
                  <Icon name="arrow-right" size={18} />
                </span>
                <span className="sr-only"> — demander un devis</span>
                <span className="svc-line" aria-hidden="true">
                  <span className="svc-sweep" />
                  <span className="svc-pulse" />
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="services-foot" data-reveal="fade">
          {fr("Un besoin qui n’entre dans aucune case ?")}{" "}
          <a href="#contact" className="link-u" data-prefill="autre">
            Décrivez-le, simplement
            <Icon name="arrow-right" size={14} />
          </a>
        </p>
      </div>
    </section>
  );
}
