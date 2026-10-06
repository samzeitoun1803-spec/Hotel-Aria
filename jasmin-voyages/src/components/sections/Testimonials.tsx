import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { useState, type KeyboardEvent } from 'react'
import { mapsLinks } from '../../content/agency'
import { testimonials, testimonialsAreDemo } from '../../content/testimonials'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'
import { Arrow } from '../ui/Arrow'
import { CircleButton } from '../ui/Button'
import { SectionTag } from '../ui/SectionTag'

export function Testimonials() {
  const [[index, dir], setState] = useState<[number, number]>([0, 1])
  const n = testimonials.length
  const go = (delta: number) => setState(([i]) => [(i + delta + n) % n, delta])
  const t = testimonials[index]

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(1)
    else if (info.offset.x > 60) go(-1)
  }
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }

  return (
    <section aria-labelledby="avis-titre" aria-roledescription="carrousel" data-theme="dark" className="section-y relative overflow-hidden bg-ink text-ivory">
      <div className="wrap">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <SectionTag index="08" tone="dark">
            Ils sont partis
          </SectionTag>
          {testimonialsAreDemo && (
            <p className="t-meta rounded-full border border-dashed border-ivory/35 px-3.5 py-2 text-[0.68rem] text-ivory/80">
              Exemples de démonstration — à remplacer par de vrais avis clients
            </p>
          )}
        </div>
        <h2 id="avis-titre" className="sr-only">
          Avis de voyageurs
        </h2>

        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-1">
            <span aria-hidden className="block font-display text-[6rem] font-bold leading-[0.6] text-clay-soft lg:text-[8rem]">
              “
            </span>
          </div>

          <div className="lg:col-span-10" tabIndex={0} onKeyDown={onKey} aria-label="Avis — utilisez les flèches gauche et droite" role="group">
            <div className="relative min-h-[300px] md:min-h-[340px]">
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.figure
                  key={index}
                  custom={dir}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={onDragEnd}
                  data-cursor="Glisser"
                  className="cursor-grab active:cursor-grabbing"
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: d * 60 }),
                    center: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: d * -60 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.7, ease: ease.expo }}
                  aria-live="polite"
                >
                  <blockquote className="font-display text-[clamp(1.9rem,3.8vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.035em]">
                    {t.quote}
                  </blockquote>
                  <figcaption className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="font-semibold">{t.author}</span>
                    <span aria-hidden className="h-px w-6 bg-ivory/30" />
                    <span className="text-ivory/60">{t.trip}</span>
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-line-dark pt-6">
              <div className="flex items-center gap-4">
                <CircleButton variant="ghost-light" onClick={() => go(-1)} aria-label="Avis précédent">
                  <Arrow direction="left" className="text-base" />
                </CircleButton>
                <CircleButton variant="ghost-light" onClick={() => go(1)} aria-label="Avis suivant">
                  <Arrow className="text-base" />
                </CircleButton>
                <p className="t-meta tabular ml-2 text-mist" aria-live="polite">
                  <span className="text-ivory">{String(index + 1).padStart(2, '0')}</span> / {String(n).padStart(2, '0')}
                </p>
              </div>
              <div className="flex gap-1.5" aria-hidden>
                {testimonials.map((_, i) => (
                  <span key={i} className={cn('h-[2px] transition-all duration-700 ease-[var(--ease-expo)]', i === index ? 'w-10 bg-ivory' : 'w-4 bg-ivory/25')} />
                ))}
              </div>
              <a href={mapsLinks.search} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-[0.95rem] font-semibold text-ivory/85 hover:text-ivory">
                Lire les avis sur Google <Arrow direction="up-right" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
