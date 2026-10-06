import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useMedia'
import { MaskText } from '../ui/MaskText'
import { Reveal } from '../ui/Reveal'
import { SectionTag } from '../ui/SectionTag'

const features = [
  {
    title: 'Conseil humain',
    text: 'Un conseiller, pas un algorithme. Quelqu’un qui vous écoute, pose les bonnes questions, et se souvient de vous au voyage suivant.',
  },
  {
    title: 'Sur mesure',
    text: 'Votre rythme, vos envies, votre budget. Rien n’est imposé, tout s’ajuste.',
  },
  {
    title: 'Sérénité',
    text: 'Un interlocuteur avant, pendant et après le départ. Un seul numéro à composer.',
  },
  {
    title: 'Expertise',
    text: 'Des destinations choisies avec expérience, des partenaires de confiance, des conseils qui ne s’inventent pas.',
  },
]

const START = 12_847
const fmt = new Intl.NumberFormat('fr-FR')

/** « Des milliers d'options → la bonne » : le compteur se resserre au défilement. */
export function WhyJasmin() {
  const reduced = usePrefersReducedMotion()
  const counterRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: counterRef, offset: ['start 0.9', 'center 0.4'] })
  const value = useTransform(scrollYProgress, (p) => {
    const t = Math.min(1, Math.max(0, p))
    const eased = 1 - Math.pow(1 - t, 3)
    return fmt.format(Math.max(1, Math.round(START * (1 - eased))))
  })
  const [done, setDone] = useState(reduced)
  useMotionValueEvent(scrollYProgress, 'change', (p) => setDone(p >= 0.995))

  return (
    <section aria-labelledby="pourquoi-titre" className="section-y relative bg-ivory">
      <div className="wrap">
        <SectionTag index="06">Pourquoi une agence</SectionTag>

        <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-8">
          <h2 id="pourquoi-titre" className="lg:col-span-8">
            <MaskText as="span" className="t-h1 block text-stone" lines={['Internet vous donne', 'des milliers d’options.']} />
            <MaskText as="span" className="t-h1 mt-2 block" delay={0.25} lines={['Nous vous aidons', 'à choisir la bonne.']} />
          </h2>

          <div ref={counterRef} className="flex flex-col justify-end lg:col-span-4" aria-hidden>
            <div className="border-t border-ink pt-5">
              <p className="t-meta text-stone">Résultats pour « voyage sur mesure »</p>
              <motion.p className="mt-3 font-display text-[clamp(4rem,8vw,7.5rem)] font-bold leading-[0.85] tracking-[-0.05em] tabular">
                {reduced ? '1' : value}
              </motion.p>
              <p className="mt-3 h-6 text-[1rem] font-semibold">
                <motion.span key={String(done)} data-reveal initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-block">
                  {done ? 'Le vôtre.' : 'options, et aucune ne vous connaît.'}
                </motion.span>
              </p>
            </div>
          </div>
        </div>

        {/* Grille 2×2 alignée à droite, filets au-dessus des titres */}
        <div className="mt-20 grid gap-x-16 gap-y-14 md:grid-cols-2 lg:mt-28 lg:ml-[33.333%]">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 2) * 0.1} className="border-t border-line pt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="t-h4">{f.title}</h3>
                <span className="t-meta text-stone">0{i + 1}</span>
              </div>
              <p className="mt-4 max-w-[30rem] text-[1.0625rem] leading-[1.61] text-stone">{f.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
