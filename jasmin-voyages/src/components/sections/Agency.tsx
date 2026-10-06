import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { agency, mapsLinks } from '../../content/agency'
import { useNiceTime } from '../../hooks/useNiceTime'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'
import { PillButton, PillLink } from '../ui/Button'
import { MaskText } from '../ui/MaskText'
import { Reveal } from '../ui/Reveal'
import { SectionTag } from '../ui/SectionTag'
import { Todo } from '../ui/Todo'

export function Agency() {
  const { startRequest } = useTrip()
  const time = useNiceTime()

  return (
    <section id="agence" aria-labelledby="agence-titre" className="section-y relative overflow-hidden bg-sand">
      <div className="wrap">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col lg:col-span-6">
            <SectionTag index="07">L’agence</SectionTag>
            <MaskText as="h2" id="agence-titre" lines={['Le monde entier.', 'Depuis Nice.']} className="t-display mt-8 text-[clamp(3rem,7.2vw,7.4rem)]" />

            <Reveal className="mt-10 max-w-[30rem]" delay={0.1}>
              <p className="t-lead">
                Derrière ce site, une vraie agence. Des conseillers que l’on peut rencontrer, appeler, revenir voir.
              </p>
              <p className="mt-5 text-stone">
                Vous ne pouvez pas la manquer : la devanture bleue de la rue Trachel. Entrez, asseyez-vous, et parlons de votre prochain voyage.
              </p>
            </Reveal>

            <Reveal className="mt-12 grid gap-8 border-t border-ink/15 pt-8 sm:grid-cols-2" delay={0.15}>
              <div>
                <p className="t-meta text-stone">Adresse</p>
                <address className="mt-3 font-semibold not-italic leading-snug">
                  {agency.name}
                  <br />
                  {agency.street}
                  <br />
                  {agency.postalCode} {agency.city}
                </address>
              </div>
              <div>
                <p className="t-meta text-stone">Nous joindre</p>
                <a href={agency.phone.href} className="mt-3 block font-semibold hover:text-clay-deep">
                  {agency.phone.display}
                </a>
                {agency.landline ? (
                  <a href={agency.landline.href} className="block font-semibold hover:text-clay-deep">
                    {agency.landline.display}
                  </a>
                ) : (
                  <p className="text-stone">
                    Fixe : <Todo />
                  </p>
                )}
                <a href={`mailto:${agency.email}`} className="mt-1 block break-all text-stone hover:text-ink">
                  {agency.email}
                </a>
              </div>
              <div>
                <p className="t-meta text-stone">Horaires</p>
                {agency.hours ? (
                  <dl className="mt-3 space-y-1">
                    {agency.hours.map(([d, h]) => (
                      <div key={d} className="flex justify-between gap-4">
                        <dt>{d}</dt>
                        <dd className="font-semibold">{h}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-3">
                    <Todo />
                  </p>
                )}
              </div>
              <div>
                <p className="t-meta text-stone">À Nice, il est</p>
                <p className="mt-3 font-display text-[1.9rem] font-bold leading-none tracking-[-0.03em] tabular">{time}</p>
              </div>
            </Reveal>

            <Reveal className="mt-10 flex flex-wrap gap-3" delay={0.2}>
              <PillLink href={mapsLinks.directions} target="_blank" rel="noreferrer" size="lg" arrow="up-right" magnetic>
                Venir à l’agence
              </PillLink>
              <PillButton variant="ghost" size="lg" onClick={() => startRequest(undefined, 'agence')}>
                Nous contacter
              </PillButton>
            </Reveal>
          </div>

          <div className="lg:col-span-6">
            <Reveal className="lg:sticky lg:top-28" delay={0.1}>
              <NiceMap />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Plan stylisé façon carte marine — la carte interactive ne se charge qu'à la demande. */
function NiceMap() {
  const [live, setLive] = useState(false)

  return (
    <figure className="relative">
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e6dccb] sm:aspect-square lg:aspect-[4/5]">
        <AnimatePresence mode="wait" initial={false}>
          {live ? (
            <motion.iframe
              key="live"
              title="Carte interactive : Jasmin Voyages, 13 Bis Rue Trachel, Nice"
              src={mapsLinks.embed}
              className="absolute inset-0 h-full w-full border-0 grayscale-[0.35]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.div key="chart" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
              <Chart />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <span className="t-meta text-stone">{live ? 'Carte interactive — Google Maps' : `Plan stylisé — ${agency.coordinates.label}`}</span>
        <span className="flex gap-5">
          <button type="button" onClick={() => setLive((v) => !v)} className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold">
            {live ? 'Revenir au plan' : 'Afficher la carte interactive'}
          </button>
          <a href={mapsLinks.search} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold">
            Google Maps <Arrow direction="up-right" />
          </a>
        </span>
      </figcaption>
    </figure>
  )
}

function Chart() {
  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" role="img" aria-label="Plan stylisé de Nice : la baie des Anges, le Vieux-Nice, le port, et l'agence Jasmin Voyages au centre-ville">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6h6" stroke="#0c1214" strokeOpacity="0.09" strokeWidth="1" />
        </pattern>
        <path id="promenade" d="M8 312 C 90 344, 190 368, 262 362" />
      </defs>

      {/* Quadrillage de carte marine */}
      {[80, 160, 240, 320].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" stroke="#0c1214" strokeOpacity="0.08" strokeDasharray="2 5" />
      ))}
      {[100, 200, 300, 400].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#0c1214" strokeOpacity="0.08" strokeDasharray="2 5" />
      ))}

      {/* La mer */}
      <path d="M0 318 C 80 350, 180 378, 262 370 C 285 368, 296 356, 304 346 L 316 349 L 318 322 L 336 322 L 336 352 C 352 364, 372 392, 400 408 L 400 500 L 0 500 Z" fill="#d7cdbb" />
      <path d="M0 318 C 80 350, 180 378, 262 370 C 285 368, 296 356, 304 346 L 316 349 L 318 322 L 336 322 L 336 352 C 352 364, 372 392, 400 408 L 400 500 L 0 500 Z" fill="url(#hatch)" />
      <path d="M0 318 C 80 350, 180 378, 262 370 C 285 368, 296 356, 304 346 L 316 349 L 318 322 L 336 322 L 336 352 C 352 364, 372 392, 400 408" fill="none" stroke="#0c1214" strokeOpacity="0.55" strokeWidth="1.2" />

      {/* Colline du Château */}
      <circle cx="300" cy="330" r="16" fill="none" stroke="#0c1214" strokeOpacity="0.25" />
      <circle cx="300" cy="330" r="9" fill="none" stroke="#0c1214" strokeOpacity="0.25" />

      {/* Libellés */}
      <g fontFamily="Inter Variable, system-ui, sans-serif" fill="#0c1214" fontWeight="600" letterSpacing="1.6">
        <text fontSize="7.5" fillOpacity="0.55">
          <textPath href="#promenade" startOffset="18%">
            PROMENADE DES ANGLAIS
          </textPath>
        </text>
        <text x="118" y="440" fontSize="9" fillOpacity="0.45" letterSpacing="4">
          BAIE DES ANGES
        </text>
        <text x="232" y="318" fontSize="7" fillOpacity="0.6">VIEUX-NICE</text>
        <text x="342" y="316" fontSize="7" fillOpacity="0.6">PORT</text>
        <text x="14" y="292" fontSize="7" fillOpacity="0.6">AÉROPORT · NCE</text>
        <text x="16" y="28" fontSize="7" fillOpacity="0.45">43°42′N</text>
        <text x="330" y="490" fontSize="7" fillOpacity="0.45">7°16′E</text>
      </g>

      {/* Rose des vents minimale */}
      <g transform="translate(360 44)" stroke="#0c1214" strokeOpacity="0.5" fill="none">
        <circle r="14" />
        <path d="M0 -20 L0 20 M-20 0 L20 0" strokeOpacity="0.25" />
        <path d="M0 -14 L4 0 L0 14 L-4 0 Z" fill="#0c1214" fillOpacity="0.6" stroke="none" />
        <text y="-24" textAnchor="middle" fontSize="7" fill="#0c1214" stroke="none" fontFamily="Inter Variable, sans-serif" fontWeight="700">
          N
        </text>
      </g>

      {/* L'agence */}
      <g transform="translate(212 236)">
        <circle r="7" fill="#b85c3c" className="pulse-ring" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
        <circle r="6" fill="#b85c3c" />
        <circle r="2.2" fill="#fbf9f5" />
        <g transform="translate(14 -42)">
          <rect width="138" height="40" fill="#0c1214" />
          <text x="10" y="17" fontSize="9.5" fill="#f6f2eb" fontFamily="Inter Tight Variable, sans-serif" fontWeight="700" letterSpacing="0.2">
            Jasmin Voyages
          </text>
          <text x="10" y="30" fontSize="7.5" fill="#f6f2eb" fillOpacity="0.7" fontFamily="Inter Variable, sans-serif">
            13 Bis Rue Trachel
          </text>
        </g>
        <path d="M6 -6 L14 -14" stroke="#0c1214" strokeWidth="1" />
      </g>
    </svg>
  )
}
