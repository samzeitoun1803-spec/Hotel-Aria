import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Missing } from "@/components/ui/Missing";
import { company, mapsUrl, phoneHref } from "@/data/company";
import { legalNav, mobileNav } from "@/data/navigation";

/**
 * Pied de page navy : une rupture nette, un très grand wordmark.
 * Au survol du wordmark, une impulsion traverse certaines lettres.
 */
export function Footer() {
  const year = new Date().getFullYear();
  const tel = phoneHref();
  return (
    <footer className="site-footer surface-ink" data-theme="dark" data-scene>
      <div className="container-x">
        <div className="footer-top">
          <p className="footer-cta">
            Un projet électrique à Nice&nbsp;?{" "}
            <Link href="/#contact" className="footer-cta-link">
              Demander un devis
              <Icon name="arrow-right" size={16} />
            </Link>
          </p>
          <Link href="/#top" className="footer-back">
            Haut de page
            <Icon name="arrow-up" size={14} />
          </Link>
        </div>

        <div className="footer-wire" data-onscreen aria-hidden="true">
          <span className="footer-wire-pulse" />
        </div>

        <p className="footer-mark">
          <span className="sr-only">{company.name}</span>
          <span className="footer-mark-line" aria-hidden="true">
            DS
          </span>
          <span className="footer-mark-line" aria-hidden="true">
            SERVICES
          </span>
        </p>

        <div className="footer-cols">
          <div className="footer-col">
            <h2 className="footer-heading">Adresse</h2>
            <address>
              {company.streetAddress}
              <br />
              {company.postalCode} {company.city}
            </address>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
              Itinéraire
              <Icon name="arrow-up-right" size={12} />
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </div>

          <nav className="footer-col" aria-label="Plan du site">
            <h2 className="footer-heading">Navigation</h2>
            <ul role="list">
              {mobileNav.map((item) => (
                <li key={item.id}>
                  <Link href={`/#${item.id}`} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="footer-col">
            <h2 className="footer-heading">Contact</h2>
            <ul role="list" className="footer-contact">
              <li>
                <span className="footer-label">Téléphone</span>
                {tel ? (
                  <a href={tel} className="footer-link tabular-nums">
                    {company.phone}
                  </a>
                ) : (
                  <Missing label="Téléphone" className="missing-dark" />
                )}
              </li>
              <li>
                <span className="footer-label">E-mail</span>
                {company.email ? (
                  <a href={`mailto:${company.email}`} className="footer-link">
                    {company.email}
                  </a>
                ) : (
                  <Missing label="E-mail" className="missing-dark" />
                )}
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">Informations</h2>
            <ul role="list">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © {year} {company.name} — {company.legalForm} ·{" "}
            <span className="whitespace-nowrap">
              SIREN <span className="tabular-nums">{company.siren}</span>
            </span>{" "}
            <span className="whitespace-nowrap">· {company.registry}</span>
          </p>
          <p>Électricité &amp; rénovation · {company.city}</p>
        </div>
      </div>
    </footer>
  );
}
