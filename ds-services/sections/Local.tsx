import { NiceMap } from "@/components/art/NiceMap";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Rail } from "@/components/ui/Rail";
import { company, mapsUrl } from "@/data/company";

/** Nice · 06000 — « Ancrés ici. » Un plan de rues abstrait, pas une carte postale. */
export function Local() {
  return (
    <section id="nice" className="section local" aria-labelledby="local-title" data-scene>
      <Rail />
      <div className="container-x local-grid">
        <div className="local-text">
          <Eyebrow node>
            {company.city} · {company.postalCode}
          </Eyebrow>
          <h2 id="local-title" className="t-section local-title" data-reveal="lines">
            Ancrés ici.
          </h2>
          <div className="local-details" data-reveal="fade">
            <address className="local-address">
              <span>{company.streetAddress}</span>
              <span>
                {company.postalCode} {company.city}
              </span>
            </address>
            <p className="local-district">{company.district}</p>
            <a href={mapsUrl} className="link-u" target="_blank" rel="noopener noreferrer">
              Itinéraire
              <Icon name="arrow-up-right" size={14} />
              <span className="sr-only"> (ouvre Google Maps dans un nouvel onglet)</span>
            </a>
          </div>
        </div>

        <div className="local-map" data-map>
          <NiceMap />
        </div>
      </div>
    </section>
  );
}
