import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useRef } from 'react'
import { agency } from '../../content/agency'
import { destinations, getDestination } from '../../content/destinations'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { ease } from '../../lib/motion'
import { useScrollLock } from '../../lib/scroll'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'
import { PillButton, PillLink } from '../ui/Button'
import { Photo } from '../ui/Photo'

/** Fiche destination plein écran. */
export function DestinationDialog() {
  const { destinationSlug } = useTrip()
  useScrollLock(!!destinationSlug)
  return <AnimatePresence>{destinationSlug && <Dialog key="destination" slug={destinationSlug} />}</AnimatePresence>
}

function Dialog({ slug }: { slug: string }) {
  const { closeDestination, openDestination, startRequest } = useTrip()
  const ref = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const close = useCallback(() => closeDestination(), [closeDestination])
  useFocusTrap(ref, true, close)

  const d = getDestination(slug)
  if (!d) return null
  const i = destinations.indexOf(d)
  const prev = destinations[(i - 1 + destinations.length) % destinations.length]
  const next = destinations[(i + 1) % destinations.length]

  const go = (s: string) => {
    openDestination(s)
    scrollRef.current?.scrollTo({ top: 0 })
    contentRef.current?.scrollTo({ top: 0 })
  }

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-titre"
      className="fixed inset-0 z-[70] bg-ivory"
      initial={{ clipPath: 'inset(100% 0 0 0)' }}
      animate={{ clipPath: 'inset(0% 0 0 0)' }}
      exit={{ clipPath: 'inset(0 0 100% 0)' }}
      transition={{ duration: 0.9, ease: ease.quart }}
    >
      <div ref={scrollRef} data-lenis-prevent className="h-full overflow-y-auto overscroll-contain lg:grid lg:grid-cols-2 lg:overflow-hidden">
        {/* Image */}
        <div className="relative h-[52svh] lg:h-full" data-theme="dark">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={d.slug}
              className="absolute inset-0"
              initial={{ clipPath: 'inset(0 0 0 100%)' }}
              animate={{ clipPath: 'inset(0 0 0 0%)' }}
              exit={{ opacity: 0.6 }}
              transition={{ duration: 0.9, ease: ease.quart }}
            >
              <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: ease.expo }}>
                <Photo image={d.image} sizes="(min-width: 1024px) 50vw, 100vw" className="h-full w-full" priority />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,20,0.45),rgba(12,18,20,0)_40%,rgba(12,18,20,0.5))]" />
          <div className="t-meta absolute inset-x-5 top-5 flex items-center gap-3 text-ivory md:inset-x-8 md:top-7">
            <span>NCE</span>
            <Arrow className="text-sm" />
            <span>{d.iata}</span>
            <span className="text-ivory/60">— {d.city}</span>
          </div>
          <p className="t-meta absolute bottom-5 left-5 text-ivory/80 md:bottom-7 md:left-8">
            {String(i + 1).padStart(2, '0')} / {String(destinations.length).padStart(2, '0')}
          </p>
        </div>

        {/* Contenu */}
        <div ref={contentRef} className="relative lg:h-full lg:overflow-y-auto lg:overscroll-contain" data-lenis-prevent>
          <div className="sticky top-0 z-10 flex justify-end bg-gradient-to-b from-ivory via-ivory/90 to-transparent px-5 pb-6 pt-5 md:px-10 md:pt-7 max-lg:fixed max-lg:right-0 max-lg:top-0 max-lg:bg-none">
            <button
              type="button"
              onClick={close}
              aria-label="Fermer la fiche destination"
              className="group grid h-12 w-12 place-items-center rounded-full bg-ink text-ivory"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:rotate-90">
                <path d="M3 3l10 10M13 3 3 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={d.slug}
              className="px-5 pb-16 pt-10 md:px-10 lg:px-14 lg:pt-2 xl:px-20"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6, ease: ease.expo, delay: 0.15 }}
            >
              <h2 id="destination-titre" className="t-display">
                {d.name}
                <span className="text-clay">.</span>
              </h2>
              <p className="t-lead mt-5 max-w-[30ch] font-medium">{d.tagline}</p>
              <p className="mt-6 max-w-[52ch] text-stone">{d.intro}</p>

              <dl className="mt-10 grid grid-cols-2 gap-6 border-y border-line py-6">
                <div>
                  <dt className="t-meta text-stone">Meilleure période</dt>
                  <dd className="mt-2 font-semibold leading-snug">{d.season}</dd>
                </div>
                <div>
                  <dt className="t-meta text-stone">Arrivée</dt>
                  <dd className="mt-2 font-semibold leading-snug">
                    {d.city} ({d.iata})
                  </dd>
                </div>
              </dl>

              <h3 className="t-h4 mt-12">Ce que nous aimons y faire</h3>
              <ol className="mt-4">
                {d.ideas.map((idea, k) => (
                  <li key={idea} className="flex gap-5 border-b border-line py-4">
                    <span className="t-meta pt-1 text-stone">0{k + 1}</span>
                    <span>{idea}</span>
                  </li>
                ))}
              </ol>

              <h3 className="t-h4 mt-12">Une esquisse d’itinéraire</h3>
              <ol className="relative mt-6 space-y-5 pl-7">
                <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-line" />
                <li className="relative flex items-baseline justify-between gap-4">
                  <span aria-hidden className="absolute -left-7 top-[0.45em] h-[11px] w-[11px] rounded-full border border-ink bg-ivory" />
                  <span className="font-semibold">Départ de Nice</span>
                  <span className="t-meta text-stone">NCE</span>
                </li>
                {d.sketch.map(([place, nights]) => (
                  <li key={place} className="relative flex items-baseline justify-between gap-4">
                    <span aria-hidden className="absolute -left-7 top-[0.45em] h-[11px] w-[11px] rounded-full bg-ink" />
                    <span className="font-semibold">{place}</span>
                    <span className="t-meta text-stone">{nights}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 text-[0.92rem] text-stone">À titre d’inspiration : chaque voyage est ensuite dessiné avec vous, à votre rythme et selon votre budget.</p>

              <div className="mt-10 flex flex-wrap gap-3">
                <PillButton size="lg" arrow magnetic onClick={() => startRequest({ destinations: [d.name], undecided: false }, `destination:${d.slug}`)}>
                  Imaginer ce voyage
                </PillButton>
                <PillLink size="lg" variant="ghost" href={agency.phone.href}>
                  Appeler l’agence
                </PillLink>
              </div>

              <nav aria-label="Autres destinations" className="mt-16 grid grid-cols-2 border-t border-line pt-6">
                <button type="button" onClick={() => go(prev.slug)} className="group flex flex-col items-start gap-1 text-left">
                  <span className="t-meta flex items-center gap-2 text-stone">
                    <Arrow direction="left" className="text-sm" /> Précédente
                  </span>
                  <span className="t-h4">{prev.name}</span>
                </button>
                <button type="button" onClick={() => go(next.slug)} className="group flex flex-col items-end gap-1 text-right">
                  <span className="t-meta flex items-center gap-2 text-stone">
                    Suivante <Arrow className="text-sm" />
                  </span>
                  <span className="t-h4">{next.name}</span>
                </button>
              </nav>
            </motion.article>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
