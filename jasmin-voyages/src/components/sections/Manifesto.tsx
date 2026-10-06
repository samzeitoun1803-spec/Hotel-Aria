import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { agency } from '../../content/agency'
import { usePrefersReducedMotion } from '../../hooks/useMedia'
import { Reveal } from '../ui/Reveal'
import { SectionTag } from '../ui/SectionTag'

const TEXT =
  'Un billet vous emmène quelque part. Un voyage vous emmène ailleurs. Depuis la rue Trachel, nous dessinons le vôtre — par les airs, par la mer, pour quelques jours ou pour quelques semaines.'

const univers = [
  {
    label: 'Avions',
    title: 'Par les airs.',
    text: 'Des billets pour le monde entier, et les bons conseils sur les escales, les bagages et les correspondances.',
  },
  {
    label: 'Bateaux',
    title: 'Par la mer.',
    text: `Croisières et ferries vers ${agency.ferryPartner.routes.slice(0, -1).join(', ')} et ${agency.ferryPartner.routes.at(-1)}.`,
    tag: agency.ferryPartner.label,
  },
  {
    label: 'Séjours',
    title: 'Sur place.',
    text: 'Hôtels, circuits et voyages sur mesure, choisis avec vous et suivis par un conseiller jusqu’à votre retour.',
  },
]

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  // Gris lisible (contraste ≥ 3:1 en grand texte) → encre : le texte se « remplit » sans jamais disparaître.
  const color = useTransform(progress, range, ['#8a867e', '#0c1214'])
  return (
    <motion.span style={{ color }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  )
}

export function Manifesto() {
  const reduced = usePrefersReducedMotion()
  // Pré-rendu : le texte est servi entier et lisible ; le remplissage mot à mot s'active une fois le JS chargé.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = TEXT.split(' ')

  return (
    <section aria-labelledby="manifeste-titre" className="section-y relative bg-ivory">
      <div className="wrap">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <SectionTag index="01">Manifeste</SectionTag>
          </div>
          <div className="lg:col-span-9">
            <h2 id="manifeste-titre" className="sr-only">
              Notre manière de voyager
            </h2>
            <p ref={ref} className="t-h2 text-[clamp(1.9rem,3.9vw,3.6rem)] leading-[1.06]">
              {reduced || !mounted
                ? TEXT
                : words.map((w, i) => (
                    <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                      {w}
                    </Word>
                  ))}
            </p>
          </div>
        </div>

        <div className="mt-20 grid gap-x-12 gap-y-14 md:grid-cols-3 lg:mt-32 lg:pl-[25%]">
          {univers.map((u, i) => (
            <Reveal key={u.label} delay={i * 0.1} className="border-t border-line pt-6">
              <p className="t-meta mb-8 text-stone">
                0{i + 1} — {u.label}
              </p>
              <h3 className="t-h4">{u.title}</h3>
              <p className="mt-3 text-[1.0625rem] leading-[1.61] text-stone">{u.text}</p>
              {u.tag && (
                <p className="t-meta mt-5 inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1.5 text-[0.7rem] text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-clay" aria-hidden />
                  {u.tag}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
