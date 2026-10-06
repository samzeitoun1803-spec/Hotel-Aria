import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type CSSProperties } from 'react'
import { agency } from '../../content/agency'
import { images } from '../../content/images'
import { usePrefersReducedMotion } from '../../hooks/useMedia'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'
import { PillButton, TextLink } from '../ui/Button'
import { MaskText } from '../ui/MaskText'
import { Photo } from '../ui/Photo'

const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Délai d'une animation d'entrée CSS. */
const delay = (s: number): CSSProperties => ({ animationDelay: `${s}s` })

/**
 * Hero — le hublot.
 *
 * La géométrie du hublot est entièrement décrite en CSS (voir `.hero-stage` dans index.css) :
 * elle est juste dès le premier affichage, même avant le JavaScript.
 * Au chargement, le volet se lève (animations CSS). Au défilement, une seule variable `--p`
 * (0 → 1) ouvre le hublot jusqu'au plein écran : on passe de l'agence au voyage.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion()
  const { startRequest } = useTrip()
  const trackRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const expand = useTransform(scrollYProgress, [0, 0.58], [0, 1], { clamp: true })
  const p = useTransform(expand, inOut)

  const imageScale = useTransform(p, [0, 1], [1.18, 1])
  const textOpacity = useTransform(expand, [0, 0.4], [1, 0])
  const textY = useTransform(expand, [0, 0.5], [0, -48])
  const textPointer = useTransform(textOpacity, (o) => (o < 0.1 ? 'none' : 'auto'))
  const textVisibility = useTransform(textOpacity, (o) => (o < 0.01 ? 'hidden' : 'visible'))
  const ringOpacity = useTransform(expand, [0, 0.12], [1, 0])
  const veil = useTransform(expand, [0.45, 1], [0, 1])
  const captionOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1])
  const captionY = useTransform(scrollYProgress, [0.5, 0.75], [40, 0])

  return (
    <section
      id="top"
      ref={trackRef}
      aria-label="Jasmin Voyages, agence de voyages à Nice"
      className={reduced ? 'relative' : 'relative h-[230svh]'}
    >
      <div className="hero-stage sticky top-0 h-svh min-h-[560px] overflow-hidden bg-[linear-gradient(180deg,var(--color-sky)_0%,#ebeae3_45%,var(--color-ivory)_78%)]">
        {/* ── Emplacement et cerclage du hublot ─────────────── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="hero-slot">
            <motion.span style={reduced ? undefined : { opacity: ringOpacity }} className="absolute -inset-[10px] block">
              <span className="a-ring block h-full w-full rounded-full border border-ink/12" style={delay(0.7)} />
            </motion.span>
          </div>
        </div>

        {/* ── Le paysage, vu du hublot ───────────────────────── */}
        <motion.div className="hero-window absolute inset-0 z-10" style={reduced ? undefined : ({ '--p': p } as never)} data-theme="dark">
          <motion.div className="absolute inset-0" style={reduced ? undefined : { scale: imageScale }}>
            <div className="a-settle absolute inset-0" style={delay(0.2)}>
              <Photo image={images.hero} priority sizes="100vw" className="h-full w-full" />
            </div>
          </motion.div>

          {/* Volet du hublot qui se lève au chargement */}
          <div aria-hidden className="a-shade absolute inset-0 bg-[linear-gradient(180deg,#e9e6dd,#d9d4c8)]" style={delay(0.55)}>
            <span className="absolute inset-x-0 bottom-[7%] mx-auto h-[3px] w-[18%] rounded-full bg-ink/15" />
          </div>

          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,18,20,0.15)_0%,rgba(12,18,20,0)_35%,rgba(12,18,20,0.55)_100%)]"
            style={{ opacity: reduced ? 0 : veil }}
          />

          {!reduced && (
            <motion.div style={{ opacity: captionOpacity, y: captionY }} className="absolute inset-x-0 bottom-0 px-[var(--pad)] pb-8 text-ivory md:pb-12">
              <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <p className="t-display max-w-[11ch]">Votre histoire commence ailleurs.</p>
                <div className="t-meta flex items-center gap-4 text-ivory/80">
                  <span>Nice</span>
                  <Arrow className="text-base" />
                  <span>Le monde</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* ── Texte : le mot-symbole passe devant le paysage ── */}
        <motion.div
          style={reduced ? undefined : { opacity: textOpacity, y: textY, pointerEvents: textPointer, visibility: textVisibility }}
          className="relative z-20 flex h-full w-full flex-col px-[var(--pad)] pb-5 pt-[calc(5.5rem+var(--demo-bar))] md:pt-[calc(7rem+var(--demo-bar))] lg:pb-8"
        >
          <div className="flex items-start justify-between gap-8">
            <div className="a-fade t-meta max-w-[44vw] space-y-1.5 text-stone lg:max-w-[12rem] xl:max-w-none" style={delay(0.9)}>
              <p className="text-ink">Agence de voyages sur mesure</p>
              <p>Nice — France</p>
              <p className="hidden sm:block">{agency.coordinates.label}</p>
            </div>
            <p className="a-fade-up hidden max-w-[19rem] text-[1.0625rem] leading-[1.55] text-ink/80 lg:block" style={delay(1.05)}>
              Racontez-nous votre envie. Nous dessinons le voyage, vous le vivez — depuis notre agence de la rue Trachel.
            </p>
          </div>

          {/* Bloc bas : titre + mot-symbole */}
          <div className="relative mt-auto">
            {/* Mobile & tablette : titre au-dessus du mot-symbole */}
            <div className="mb-7 lg:hidden">
              <MaskText trigger="mount" delay={0.55} as="p" lines={['Le monde', 'vous attend.']} className="t-h1 text-[clamp(2.4rem,9.5vw,4rem)]" />
              <p className="a-fade-up mt-4 max-w-[30rem] text-[1rem] leading-[1.55] text-ink/75 [@media(max-height:720px)]:hidden" style={delay(0.9)}>
                Racontez-nous votre envie. Nous dessinons le voyage, vous le vivez.
              </p>
              <HeroActions onStart={() => startRequest()} delay={1} compact />
            </div>

            {/* Bureau : titre logé à droite de « JASMIN », au-dessus de « VOYAGES. » */}
            <div
              className="absolute right-0 hidden lg:block"
              style={{ bottom: 'calc(var(--fs) * 0.84 + 0.4rem)', width: 'min(36rem, calc(100% - var(--fs) * 3.42 - 2.75rem))' }}
            >
              <MaskText
                trigger="mount"
                delay={0.65}
                as="p"
                lines={['Le monde', 'vous attend.']}
                className="font-display text-[clamp(2.4rem,4.3vw,4.4rem)] font-bold leading-[0.95] tracking-[-0.04em]"
              />
              <HeroActions onStart={() => startRequest()} delay={1.05} />
            </div>

            <h1 className="t-wordmark text-[length:var(--fs)]">
              <span className="sr-only">Jasmin Voyages, agence de voyages sur mesure à Nice</span>
              <span aria-hidden className="block">
                <MaskText trigger="mount" delay={0.15} stagger={0.1} duration={1.3} as="span" className="block" lines={['Jasmin', <>Voyages<span className="text-clay">.</span></>]} />
              </span>
            </h1>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function HeroActions({ onStart, delay: d, compact }: { onStart: () => void; delay: number; compact?: boolean }) {
  return (
    <div className="a-fade-up mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 lg:mt-7" style={delay(d)}>
      <PillButton size="lg" arrow magnetic onClick={onStart}>
        Créer mon voyage
      </PillButton>
      <TextLink href="#destinations" className={compact ? 'text-[0.98rem] [@media(max-height:720px)]:hidden' : 'text-[0.98rem]'}>
        Découvrir les destinations
      </TextLink>
    </div>
  )
}
