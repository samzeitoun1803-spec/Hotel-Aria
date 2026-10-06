import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import { destinations, type Destination } from '../../content/destinations'
import { useIsDesktop, usePrefersReducedMotion } from '../../hooks/useMedia'
import { cn } from '../../lib/cn'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'
import { CircleButton, PillButton } from '../ui/Button'
import { MaskText } from '../ui/MaskText'
import { Photo } from '../ui/Photo'
import { SectionTag } from '../ui/SectionTag'

/** Rythme éditorial : largeurs et hauteurs alternées (bureau). */
const layout = [
  { w: 'lg:w-[30vw]', h: 'lg:h-[72%]', align: 'lg:self-end' },
  { w: 'lg:w-[24vw]', h: 'lg:h-[56%]', align: 'lg:self-start' },
  { w: 'lg:w-[36vw]', h: 'lg:h-[66%]', align: 'lg:self-center' },
  { w: 'lg:w-[26vw]', h: 'lg:h-[74%]', align: 'lg:self-end' },
  { w: 'lg:w-[32vw]', h: 'lg:h-[58%]', align: 'lg:self-start' },
  { w: 'lg:w-[25vw]', h: 'lg:h-[70%]', align: 'lg:self-center' },
  { w: 'lg:w-[34vw]', h: 'lg:h-[62%]', align: 'lg:self-end' },
  { w: 'lg:w-[27vw]', h: 'lg:h-[72%]', align: 'lg:self-start' },
]

export function DestinationGallery() {
  const desktop = useIsDesktop()
  const reduced = usePrefersReducedMotion()
  const pinned = desktop && !reduced
  const { openDestination, startRequest } = useTrip()

  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [dist, setDist] = useState(0)
  const [active, setActive] = useState(0)

  useLayoutEffect(() => {
    if (!pinned) return
    const measure = () => {
      const el = trackRef.current
      if (el) setDist(Math.max(0, el.scrollWidth - window.innerWidth))
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (trackRef.current) ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pinned])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const x = useTransform(scrollYProgress, (v) => -v * dist)
  const bar = useTransform(scrollYProgress, [0, 1], [0.04, 1])

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    if (pinned) setActive(Math.min(destinations.length - 1, Math.max(0, Math.round(v * (destinations.length + 0.6) - 0.6))))
  })

  // Clavier : amène le panneau focalisé dans le champ de vision.
  const reveal = (el: HTMLElement) => {
    if (!pinned || !sectionRef.current || !dist) return
    const target = Math.min(dist, Math.max(0, el.offsetLeft - window.innerWidth * 0.2))
    const top = sectionRef.current.getBoundingClientRect().top + window.scrollY
    window.scrollTo({ top: top + target, behavior: 'auto' })
  }

  // Mobile : progression du carrousel
  const [mobileProgress, setMobileProgress] = useState(0)
  const scrollByPanel = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const panel = el.querySelector<HTMLElement>('button[data-cursor]')
    el.scrollBy({ left: dir * (panel ? panel.offsetWidth + 12 : el.clientWidth * 0.8), behavior: reduced ? 'auto' : 'smooth' })
  }

  return (
    <section
      id="destinations"
      ref={sectionRef}
      aria-labelledby="destinations-titre"
      data-theme="dark"
      className="relative bg-ink text-ivory"
      style={pinned ? { height: `calc(${dist}px + 100svh)` } : undefined}
    >
      <div className={cn(pinned ? 'sticky top-0 flex h-svh flex-col overflow-hidden' : 'section-y')}>
        <div className={cn('wrap flex items-center justify-between', pinned ? 'pt-[calc(7rem+var(--demo-bar))]' : '')}>
          <SectionTag index="02" tone="dark">
            Destinations
          </SectionTag>
          {pinned && (
            <p className="t-meta tabular text-mist" aria-hidden>
              <span className="text-ivory">{String(active + 1).padStart(2, '0')}</span> / {String(destinations.length).padStart(2, '0')}
            </p>
          )}
        </div>

        {/* Mobile : titre au-dessus du carrousel */}
        {!pinned && (
          <div className="wrap mt-10 mb-10">
            <MaskText as="h2" id="destinations-titre" lines={['Où voulez-vous', 'aller ?']} className="t-display" />
            <p className="mt-6 max-w-md text-ivory/70">
              Huit envies parmi mille. Chaque voyage est ensuite dessiné pour vous, au départ de Nice.
            </p>
          </div>
        )}

        <motion.div
          ref={trackRef}
          data-lenis-prevent-horizontal
          style={pinned ? { x } : undefined}
          onScroll={(e) => {
            const el = e.currentTarget
            setMobileProgress(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth))
          }}
          className={cn(
            'flex',
            pinned
              ? 'min-h-0 flex-1 items-stretch gap-[2.2vw] py-[5svh] pl-12 pr-[8vw] will-change-transform'
              : 'no-scrollbar snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-px-5 px-5 pb-2 md:scroll-px-8 md:px-8',
          )}
        >
          {pinned && (
            <div className="flex w-[34vw] shrink-0 flex-col justify-between pr-[3vw]">
              <MaskText as="h2" id="destinations-titre" lines={['Où voulez-', 'vous aller ?']} className="t-display text-[clamp(3rem,6.6vw,7.5rem)]" />
              <div>
                <p className="max-w-[24rem] text-ivory/70">
                  Huit envies parmi mille. Chaque voyage est ensuite dessiné pour vous, au départ de Nice.
                </p>
                <p className="t-meta mt-8 flex items-center gap-3 text-mist">
                  Faites défiler <Arrow className="text-sm" />
                </p>
              </div>
            </div>
          )}

          {destinations.map((d, i) => (
            <DestinationPanel key={d.slug} d={d} index={i} pinned={pinned} onOpen={() => openDestination(d.slug)} onFocus={reveal} />
          ))}

          {/* Fin de parcours */}
          <div
            className={cn(
              'flex shrink-0 snap-start flex-col justify-between border border-line-dark p-7 md:p-9',
              pinned ? 'w-[28vw] self-center lg:h-[60%]' : 'h-[62svh] w-[78vw] max-w-[420px]',
            )}
          >
            <p className="t-meta text-mist">Et ailleurs ?</p>
            <div>
              <p className="t-h2">Votre destination n’est pas ici ?</p>
              <p className="mt-4 text-ivory/70">Dites-nous laquelle. Nous la connaissons sans doute déjà.</p>
              <PillButton variant="ivory" className="mt-8" arrow onClick={() => startRequest(undefined, 'galerie:autre')}>
                Parlez-nous-en
              </PillButton>
            </div>
          </div>
        </motion.div>

        {pinned ? (
          <div className="wrap pb-8">
            <div className="h-px w-full bg-line-dark">
              <motion.div className="h-px origin-left bg-ivory" style={{ scaleX: bar }} />
            </div>
          </div>
        ) : (
          <div className="wrap mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-line-dark" aria-hidden>
              <div className="h-px origin-left bg-ivory transition-transform duration-200" style={{ transform: `scaleX(${Math.max(0.08, mobileProgress)})` }} />
            </div>
            <CircleButton variant="ghost-light" className="h-11 w-11" onClick={() => scrollByPanel(-1)} disabled={mobileProgress <= 0.01} aria-label="Destination précédente">
              <Arrow direction="left" className="text-sm" />
            </CircleButton>
            <CircleButton variant="ghost-light" className="h-11 w-11" onClick={() => scrollByPanel(1)} disabled={mobileProgress >= 0.99} aria-label="Destination suivante">
              <Arrow className="text-sm" />
            </CircleButton>
          </div>
        )}
      </div>
    </section>
  )
}

function DestinationPanel({
  d,
  index,
  pinned,
  onOpen,
  onFocus,
}: {
  d: Destination
  index: number
  pinned: boolean
  onOpen: () => void
  onFocus: (el: HTMLElement) => void
}) {
  const l = layout[index % layout.length]
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      onFocus={(e) => onFocus(e.currentTarget)}
      data-cursor="Découvrir"
      data-reveal
      className={cn(
        'group relative shrink-0 snap-start overflow-hidden text-left',
        pinned ? cn(l.w, l.h, l.align) : 'h-[62svh] max-h-[560px] w-[78vw] max-w-[420px]',
      )}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px -5% 0px -5%' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: pinned ? 0 : 0.05 * index }}
    >
      <Photo
        image={d.image}
        decorative
        sizes="(min-width: 1024px) 36vw, 80vw"
        className="absolute inset-0"
        imgClassName="scale-[1.02] transition-transform duration-[1400ms] ease-[var(--ease-expo)] group-hover:scale-[1.08] group-focus-visible:scale-[1.08]"
      />
      <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,20,0.38)_0%,rgba(12,18,20,0)_26%,rgba(12,18,20,0.18)_48%,rgba(12,18,20,0.88)_100%)]" />

      <span aria-hidden className="t-meta absolute inset-x-5 top-5 z-[2] flex items-center justify-between text-ivory/85 md:inset-x-6 md:top-6">
        <span className="tabular">{String(index + 1).padStart(2, '0')}</span>
        <span className="flex items-center gap-2 tabular">
          NCE <Arrow className="text-[0.8rem]" /> {d.iata}
        </span>
      </span>

      <span className="absolute inset-x-5 bottom-5 z-[2] block md:inset-x-6 md:bottom-6">
        <span className="block font-display text-[clamp(2.6rem,4.6vw,4.9rem)] font-bold leading-[0.9] tracking-[-0.045em] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:-translate-y-1.5">
          {d.name}
          <span className="text-clay-soft">.</span>
        </span>
        <span className="mt-3 block max-w-[26ch] text-[0.98rem] leading-snug text-ivory/80 transition-colors duration-500 group-hover:text-ivory">
          {d.tagline}
        </span>
        <span className="mt-5 flex items-center justify-between border-t border-ivory/25 pt-4">
          <span className="text-[0.92rem] font-semibold">Découvrir</span>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-ivory/35 transition-colors duration-500 group-hover:border-ivory group-hover:bg-ivory group-hover:text-ink">
            <Arrow className="text-[0.9rem]" />
          </span>
        </span>
      </span>
    </motion.button>
  )
}
