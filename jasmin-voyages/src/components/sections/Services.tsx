import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useState, type PointerEvent } from 'react'
import { featuredType, travelTypes } from '../../content/travelTypes'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMedia'
import { ease } from '../../lib/motion'
import { useTrip } from '../../lib/trip/TripContext'
import { Arrow } from '../ui/Arrow'
import { PillButton } from '../ui/Button'
import { MaskText } from '../ui/MaskText'
import { Photo } from '../ui/Photo'
import { Reveal } from '../ui/Reveal'
import { SectionTag } from '../ui/SectionTag'

export function Services() {
  const { startRequest } = useTrip()
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const preview = fine && !reduced

  const listRef = useRef<HTMLUListElement>(null)
  const [hovered, setHovered] = useState<number | null>(null)
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const x = useSpring(px, { stiffness: 160, damping: 22, mass: 0.6 })
  const y = useSpring(py, { stiffness: 160, damping: 22, mass: 0.6 })

  const onMove = (e: PointerEvent) => {
    const r = listRef.current?.getBoundingClientRect()
    if (!r) return
    px.set(e.clientX - r.left)
    py.set(e.clientY - r.top)
  }

  return (
    <section id="inspirations" aria-labelledby="services-titre" className="section-y relative bg-ivory">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <SectionTag index="04">Inspirations</SectionTag>
            <MaskText as="h2" id="services-titre" lines={['Des voyages qui', 'vous ressemblent.']} className="t-display mt-8" />
          </div>
          <Reveal className="lg:col-span-4" delay={0.15}>
            <p className="max-w-[24rem] text-stone lg:ml-auto">
              Un grand voyage ou trois jours pour souffler. Un billet seul ou un itinéraire complet. Nous partons toujours de vous.
            </p>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          {/* La carte argile — l'offre mise en avant, unique sur la page */}
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-[calc(7rem+var(--demo-bar))]">
              <article className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-clay p-8 text-paper md:min-h-[520px] md:p-[53px_59px]">
                <div className="flex items-start justify-between gap-6">
                  <p className="t-meta text-paper/80">{featuredType.kicker}</p>
                  <span aria-hidden className="font-display text-[5rem] font-bold leading-[0.7] tracking-[-0.06em] text-paper/15">01</span>
                </div>
                <div>
                  <h3 className="t-h1 text-[clamp(2.4rem,4.4vw,4rem)]">{featuredType.title}</h3>
                  <p className="mt-5 max-w-[30rem] text-[1.0625rem] leading-[1.61] text-paper/85">{featuredType.line}</p>
                  <PillButton
                    variant="ivory"
                    size="lg"
                    arrow
                    magnetic
                    className="mt-9"
                    onClick={() => startRequest({ services: [featuredType.service] }, 'univers:sur-mesure')}
                  >
                    Dessiner le mien
                  </PillButton>
                </div>
              </article>
            </Reveal>
          </div>

          {/* Index éditorial des univers */}
          <div className="relative lg:col-span-7">
            <ul ref={listRef} className="relative" onPointerMove={preview ? onMove : undefined} onPointerLeave={() => setHovered(null)}>
              {travelTypes.map((t, i) => (
                <li key={t.id} className="border-t border-line last:border-b">
                  <button
                    type="button"
                    onPointerEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    onClick={() => startRequest({ services: [t.service], ...(t.styles ? { styles: t.styles } : {}) }, `univers:${t.id}`)}
                    className="group flex w-full items-center gap-5 py-6 text-left md:gap-8 md:py-7"
                  >
                    <span aria-hidden className="t-meta w-7 shrink-0 self-start pt-3 text-stone">
                      {String(i + 2).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="t-h2 block transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-2 group-focus-visible:translate-x-2">
                          {t.title}
                        </span>
                        {t.note && (
                          <span className="t-meta inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-[0.68rem]">
                            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-clay" />
                            {t.note}
                          </span>
                        )}
                      </span>
                      <span className="mt-2 block text-[1rem] leading-snug text-stone transition-colors duration-500 group-hover:text-ink">{t.line}</span>
                      <span className="sr-only"> — faire une demande</span>
                    </span>
                    {/* Vignette sur mobile */}
                    <Photo image={t.image} decorative sizes="72px" className="h-[84px] w-[66px] shrink-0 md:hidden" />
                    <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-full border border-ink/15 transition-colors duration-500 group-hover:border-ink group-hover:bg-ink group-hover:text-ivory md:grid">
                      <Arrow className="text-base" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            {/* Aperçu flottant qui suit le pointeur */}
            {preview && (
              <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 hidden md:block" style={{ x, y }}>
                <AnimatePresence>
                  {hovered !== null && (
                    <motion.div
                      key="preview"
                      className="relative -ml-[150px] -mt-[200px] h-[260px] w-[200px] overflow-hidden"
                      initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.85, rotate: 3 }}
                      transition={{ duration: 0.45, ease: ease.expo }}
                    >
                      <AnimatePresence initial={false}>
                        <motion.div
                          key={hovered}
                          className="absolute inset-0"
                          initial={{ clipPath: 'inset(100% 0 0 0)' }}
                          animate={{ clipPath: 'inset(0% 0 0 0)' }}
                          transition={{ duration: 0.6, ease: ease.quart }}
                        >
                          <Photo image={travelTypes[hovered].image} decorative sizes="200px" className="h-full w-full" />
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
