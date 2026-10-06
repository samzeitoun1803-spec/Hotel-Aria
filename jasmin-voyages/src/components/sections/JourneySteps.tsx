import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { images, type SiteImage } from '../../content/images'
import { useIsDesktop } from '../../hooks/useMedia'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'
import { MaskText } from '../ui/MaskText'
import { Photo } from '../ui/Photo'
import { Reveal } from '../ui/Reveal'
import { SectionTag } from '../ui/SectionTag'

const steps: Array<{ n: string; title: string; text: string; image: SiteImage }> = [
  {
    n: '01',
    title: 'Vous rêvez.',
    text: 'Une envie, une date, une photo vue quelque part. Racontez-nous — à l’agence, au téléphone ou ici même.',
    image: images.stepDream,
  },
  {
    n: '02',
    title: 'Nous imaginons.',
    text: 'Un conseiller dessine un itinéraire à votre rythme. Vous ajustez, nous affinons, jusqu’à ce qu’il vous ressemble.',
    image: images.stepDesign,
  },
  {
    n: '03',
    title: 'Vous partez.',
    text: 'Billets, transferts, hébergements, documents : tout est prêt. Il ne vous reste qu’à fermer la valise.',
    image: images.stepDepart,
  },
  {
    n: '04',
    title: 'Vous profitez.',
    text: 'Une question, un imprévu ? Nous restons joignables pendant tout le voyage. Et nous voulons tout savoir au retour.',
    image: images.stepEnjoy,
  },
]

/** Récit épinglé : l'image reste, le texte avance. */
export function JourneySteps() {
  const desktop = useIsDesktop()
  const [active, setActive] = useState(0)
  const refs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    if (!desktop) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index))
        })
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [desktop])

  return (
    <section aria-labelledby="etapes-titre" data-theme="dark" className="relative bg-ink-2 text-ivory">
      <div className="wrap section-y pb-0 lg:pb-0">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionTag index="05" tone="dark">
              Comment ça marche
            </SectionTag>
          </div>
          <div className="lg:col-span-8">
            <MaskText as="h2" id="etapes-titre" lines={['Quatre temps.', 'Un seul interlocuteur.']} className="t-h1" />
          </div>
        </div>
      </div>

      {desktop ? (
        <div className="wrap grid grid-cols-12 gap-8 pb-[12vh]">
          {/* Image épinglée */}
          <div className="col-span-6">
            <div className="sticky top-0 flex h-svh items-center py-[10vh]">
              <div className="relative h-full w-full overflow-hidden">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={{ clipPath: 'inset(100% 0 0 0)' }}
                    animate={{ clipPath: 'inset(0% 0 0 0)' }}
                    transition={{ duration: 1.1, ease: ease.quart }}
                  >
                    <motion.div className="absolute inset-0" initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: ease.expo }}>
                      <Photo image={steps[active].image} sizes="50vw" className="h-full w-full" />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
                <span aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(12,18,20,0)_55%,rgba(12,18,20,0.6))]" />
                <div className="absolute inset-x-6 bottom-6 z-10 flex items-end justify-between">
                  <div className="overflow-hidden font-display text-[7rem] font-bold leading-[0.8] tracking-[-0.06em]">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={active}
                        className="block"
                        initial={{ y: '100%' }}
                        animate={{ y: '0%' }}
                        exit={{ y: '-100%' }}
                        transition={{ duration: 0.8, ease: ease.expo }}
                      >
                        {steps[active].n}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <span className="t-meta pb-2 text-ivory/80">/ 04</span>
                </div>
              </div>
            </div>
          </div>

          {/* Textes qui défilent */}
          <ol className="col-span-5 col-start-8">
            {steps.map((s, i) => (
              <li key={s.n}>
                <div
                  ref={(el) => {
                    refs.current[i] = el
                  }}
                  data-index={i}
                  className="flex min-h-[88svh] flex-col justify-center"
                >
                  {/* Étape inactive : estompée par la couleur (contrastes AA conservés), pas par l'opacité */}
                  <div>
                    <p className="t-meta text-mist">Étape {s.n}</p>
                    <h3 className={cn('t-display mt-6 text-[clamp(3rem,5.8vw,6rem)] transition-colors duration-700', active === i ? 'text-ivory' : 'text-mist/90')}>
                      {s.title}
                    </h3>
                    <p className={cn('mt-6 max-w-[26rem] text-[1.125rem] leading-[1.61] transition-colors duration-700', active === i ? 'text-ivory/75' : 'text-ivory/50')}>
                      {s.text}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <ol className="wrap space-y-16 pb-24 pt-14">
          {steps.map((s) => (
            <li key={s.n}>
              <Reveal>
                <div className="relative">
                  <Photo image={s.image} sizes="100vw" className="aspect-[4/5] w-full sm:aspect-[16/10]" />
                  <span aria-hidden className="absolute bottom-4 left-4 font-display text-[4.5rem] font-bold leading-[0.8] tracking-[-0.06em] text-ivory">
                    {s.n}
                  </span>
                </div>
                <h3 className="t-h1 mt-7">{s.title}</h3>
                <p className="mt-4 text-ivory/70">{s.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
