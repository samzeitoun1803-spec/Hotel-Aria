import { ContactForm } from "@/components/contact/ContactForm";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { Missing } from "@/components/ui/Missing";
import { Rail } from "@/components/ui/Rail";
import { Sig } from "@/components/ui/Sig";
import { company, mapsUrl, phoneHref } from "@/data/company";
import { NNBSP } from "@/lib/typography";

/** Contact — le circuit se ferme ici. */
export function Contact() {
  const tel = phoneHref();
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title" data-scene>
      <Rail terminal />
      <div className="container-x">
        <Eyebrow node>Contact</Eyebrow>

        <div className="contact-head">
          <h2 id="contact-title" className="t-section contact-title" data-reveal="lines">
            Un projet <br />
            <Sig>en tête{NNBSP}?</Sig>
          </h2>
          <p className="contact-talk" data-reveal="fade">
            Parlons-en.
          </p>
        </div>

        <div className="contact-grid">
          <aside className="contact-info" aria-label="Coordonnées" data-reveal="fade">
            <p className="t-body contact-lead">
              Quelques lignes suffisent pour commencer. Précisez le lieu, le type de local et la nature des
              travaux envisagés.
            </p>

            <dl className="contact-card">
              <div>
                <dt>Entreprise</dt>
                <dd>{company.name}</dd>
              </div>
              <div>
                <dt>Adresse</dt>
                <dd>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="link-inline">
                    {company.streetAddress}
                    <br />
                    {company.postalCode} {company.city}
                    <span className="sr-only"> (ouvre Google Maps dans un nouvel onglet)</span>
                  </a>
                </dd>
              </div>
              <div>
                <dt>Téléphone</dt>
                <dd>
                  {tel ? (
                    <a href={tel} className="link-inline tabular-nums">
                      {company.phone}
                    </a>
                  ) : (
                    <Missing label="Téléphone" />
                  )}
                </dd>
              </div>
              <div>
                <dt>E-mail</dt>
                <dd>
                  {company.email ? (
                    <a href={`mailto:${company.email}`} className="link-inline">
                      {company.email}
                    </a>
                  ) : (
                    <Missing label="E-mail" />
                  )}
                </dd>
              </div>
            </dl>

            {tel ? (
              <a href={tel} className="link-u contact-call">
                Appeler directement
                <Icon name="arrow-right" size={14} />
              </a>
            ) : null}
          </aside>

          <div className="contact-form-wrap">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
