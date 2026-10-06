import { agency, mapsLinks } from '../../content/agency'
import { useNiceTime } from '../../hooks/useNiceTime'
import { useScrollApi } from '../../lib/scroll'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'
import { MaskText } from '../ui/MaskText'
import { Todo } from '../ui/Todo'
import { navLinks } from './Navbar'

export function Footer() {
  const { openLegal, startRequest } = useTrip()
  const { scrollTo } = useScrollApi()
  const time = useNiceTime()
  const socials = [
    ['Instagram', agency.social.instagram],
    ['Facebook', agency.social.facebook],
  ] as const

  return (
    <footer data-theme="dark" className="relative overflow-hidden bg-ink text-ivory">
      <div className="wrap pt-24 lg:pt-32">
        {/* Appel final */}
        <div className="flex flex-col gap-8 border-b border-line-dark pb-16 md:flex-row md:items-end md:justify-between">
          <p className="t-h2 max-w-[18ch]">Et si le prochain voyage commençait aujourd’hui ?</p>
          <button
            type="button"
            onClick={() => startRequest(undefined, 'footer')}
            className="group inline-flex h-14 items-center gap-3 self-start rounded-full bg-ivory px-7 text-[1.0625rem] font-semibold text-ink transition-colors hover:bg-white md:self-auto"
          >
            Créer mon voyage <Arrow />
          </button>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <p className="t-meta text-mist">L’agence</p>
            <address className="mt-5 text-[1.25rem] not-italic leading-snug">
              {agency.street}
              <br />
              {agency.postalCode} {agency.city}
              <br />
              {agency.country}
            </address>
            <a href={mapsLinks.directions} target="_blank" rel="noreferrer" className="group mt-5 inline-flex items-center gap-2 text-mist hover:text-ivory">
              Itinéraire <Arrow direction="up-right" />
            </a>
          </div>

          <div className="lg:col-span-3">
            <p className="t-meta text-mist">Contact</p>
            <a href={agency.phone.href} className="mt-5 block text-[1.25rem] hover:text-clay-soft">
              {agency.phone.display}
            </a>
            <a href={`mailto:${agency.email}`} className="mt-1 block break-all text-[1.05rem] text-ivory/80 hover:text-ivory">
              {agency.email}
            </a>
            <p className="t-meta mt-6 text-mist">
              Nice — <span className="tabular text-ivory">{time}</span>
            </p>
          </div>

          <nav aria-label="Pied de page" className="lg:col-span-2">
            <p className="t-meta text-mist">Explorer</p>
            <ul className="mt-5 space-y-2">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="text-[1.25rem] text-mist transition-colors hover:text-ivory">
                    {l.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#demande" className="text-[1.25rem] text-mist transition-colors hover:text-ivory">
                  Demande de voyage
                </a>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="t-meta text-mist">Suivre</p>
            <ul className="mt-5 space-y-2">
              {socials.map(([name, url]) => (
                <li key={name}>
                  {url ? (
                    <a href={url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-[1.25rem] text-mist hover:text-ivory">
                      {name} <Arrow direction="up-right" />
                    </a>
                  ) : (
                    <span className="text-[1.25rem] text-mist">
                      {name} <Todo className="text-[0.85rem]" />
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Le mot-symbole, en grand */}
      <div className="wrap" aria-hidden>
        <MaskText
          as="div"
          stagger={0.12}
          duration={1.3}
          className="t-wordmark text-[18.6vw] leading-[0.82] lg:text-[18.2vw]"
          lines={['Jasmin', <>Voyages<span className="text-clay">.</span></>]}
        />
      </div>

      <div className="wrap flex flex-col gap-5 border-t border-line-dark py-7 text-[0.9rem] text-mist md:flex-row md:items-center md:justify-between">
        <p className="t-meta flex items-center gap-3 text-ivory">
          Nice <Arrow className="text-sm" /> Le monde
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          <li>© {new Date().getFullYear()} {agency.name}</li>
          <li>
            <button type="button" onClick={() => openLegal('mentions')} className="hover:text-ivory">
              Mentions légales
            </button>
          </li>
          <li>
            <button type="button" onClick={() => openLegal('confidentialite')} className="hover:text-ivory">
              Confidentialité
            </button>
          </li>
          <li>
            <button type="button" onClick={() => scrollTo(0)} className="group inline-flex items-center gap-2 hover:text-ivory">
              Retour au départ <Arrow direction="up" className="text-sm" />
            </button>
          </li>
        </ul>
      </div>
    </footer>
  )
}
