import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { destinations, type Mood, type Region } from '../../content/destinations'
import { budgetFromAmount, monthNames, monthShort, moodOptions, regionOptions } from '../../content/options'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'
import { euros, nextOccurrence, toPayload } from '../../lib/trip/format'
import { sendTripRequest } from '../../lib/trip/transport'
import { useTrip } from '../../lib/trip/TripContext'
import { emptyDraft, type TripDraft } from '../../lib/trip/types'
import { isEmail, isPhone } from '../../lib/trip/validation'
import { Arrow } from '../ui/Arrow'
import { PillButton, TextLink } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { MaskText } from '../ui/MaskText'
import { Photo } from '../ui/Photo'
import { SectionTag } from '../ui/SectionTag'

const BUDGET_MIN = 1000
const BUDGET_MAX = 12000

type When = number | 'flexible' | null

/** Module « Votre prochain voyage » : quatre questions, une esquisse, une demande. */
export function TravelFinder() {
  const { startRequest, openDestination } = useTrip()
  const [region, setRegion] = useState<Region | null>(null)
  const [mood, setMood] = useState<Mood | null>(null)
  const [when, setWhen] = useState<When>(null)
  const [budget, setBudget] = useState(4000)
  const [budgetTouched, setBudgetTouched] = useState(false)
  const [view, setView] = useState<'questions' | 'result'>('questions')

  const regionLabel = regionOptions.find((r) => r.id === region)
  const moodLabel = moodOptions.find((m) => m.id === mood)
  const isMax = budget >= BUDGET_MAX

  const sentence = useMemo(() => {
    const parts: Array<{ text: string; filled: boolean }> = [
      { text: 'Un voyage', filled: true },
      { text: moodLabel?.phrase ?? 'quelle envie ?', filled: !!moodLabel },
      { text: regionLabel?.phrase ?? 'où ?', filled: !!regionLabel },
      {
        text: when === null ? 'quand ?' : when === 'flexible' ? 'quand vous le voudrez' : `en ${monthNames[when]}`,
        filled: when !== null,
      },
      {
        text: budgetTouched ? (isMax ? `à partir de ${euros(BUDGET_MAX)} par personne` : `autour de ${euros(budget)} par personne`) : 'quel budget ?',
        filled: budgetTouched,
      },
    ]
    return parts
  }, [moodLabel, regionLabel, when, budget, budgetTouched, isMax])

  const suggestions = useMemo(() => {
    const scored = destinations
      .map((d) => ({
        d,
        score: (region && d.regions.includes(region) ? 3 : 0) + (mood && d.moods.includes(mood) ? 2 : 0) - d.regions.indexOf(region as Region) * 0.1,
      }))
      .sort((a, b) => b.score - a.score)
    const top = scored.filter((s) => s.score > 0).slice(0, 3)
    return (top.length ? top : scored.slice(0, 3)).map((s) => s.d)
  }, [region, mood])

  const toDraft = (): Partial<TripDraft> => ({
    destinations: [],
    destinationNote: regionLabel ? `${regionLabel.label} — pistes : ${suggestions.map((s) => s.name).join(', ')}` : '',
    undecided: !regionLabel,
    styles: moodLabel ? [moodLabel.style] : [],
    dateMode: when === null || when === 'flexible' ? 'flexible' : 'approx',
    month: typeof when === 'number' ? nextOccurrence(when) : '',
    budget: budgetTouched ? budgetFromAmount(budget) : '',
  })

  return (
    <section id="sur-mesure" aria-labelledby="finder-titre" className="section-y relative bg-sand">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-8">
        {/* Colonne gauche : titre + esquisse vivante */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionTag index="03">Sur mesure</SectionTag>
            <MaskText as="h2" id="finder-titre" lines={['Votre prochain', 'voyage commence', 'ici.']} className="t-h1 mt-8" />
            <p className="mt-6 max-w-[26rem] text-stone">Quatre questions, trente secondes. Un conseiller s’occupe du reste.</p>

            <SketchCard sentence={sentence} code={regionLabel ? regionLabel.label.toUpperCase() : '· · ·'} />
          </div>
        </div>

        {/* Colonne droite : questions / résultat */}
        <div className="lg:col-span-6 lg:col-start-7">
          <AnimatePresence mode="wait" initial={false}>
            {view === 'questions' ? (
              <motion.div
                key="q"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.6, ease: ease.expo }}
                className="space-y-12"
              >
                <Question n="01" title="Où ?" id="q-ou">
                  {regionOptions.map((r) => (
                    <Chip key={r.id} selected={region === r.id} onClick={() => setRegion(region === r.id ? null : r.id)}>
                      {r.label}
                    </Chip>
                  ))}
                </Question>

                <Question n="02" title="Pourquoi ?" id="q-pourquoi">
                  {moodOptions.map((m) => (
                    <Chip key={m.id} selected={mood === m.id} onClick={() => setMood(mood === m.id ? null : m.id)}>
                      {m.label}
                    </Chip>
                  ))}
                </Question>

                <Question n="03" title="Quand ?" id="q-quand" grid>
                  <div className="grid w-full grid-cols-4 gap-2 sm:grid-cols-6">
                    {monthShort.map((m, i) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={when === i}
                        aria-label={`${m} (${monthNames[i]})`}
                        onClick={() => setWhen(when === i ? null : i)}
                        className={cn(
                          'h-11 rounded-full border text-[0.9rem] font-medium transition-colors duration-300',
                          when === i ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/60',
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                  <Chip selected={when === 'flexible'} onClick={() => setWhen(when === 'flexible' ? null : 'flexible')} className="mt-3">
                    Mes dates sont flexibles
                  </Chip>
                </Question>

                <div className="border-t border-ink/15 pt-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <label htmlFor="finder-budget" className="flex items-baseline gap-4">
                      <span className="t-meta text-stone">04</span>
                      <span className="t-h3">Budget</span>
                    </label>
                    <output htmlFor="finder-budget" className="t-h4 tabular" aria-live="polite">
                      {isMax ? `${euros(BUDGET_MAX)} +` : euros(budget)}
                      <span className="ml-1 text-[0.85rem] font-medium text-stone">/ pers.</span>
                    </output>
                  </div>
                  <input
                    id="finder-budget"
                    type="range"
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    step={250}
                    value={budget}
                    aria-valuetext={`${isMax ? 'Plus de ' : ''}${euros(budget)} par personne`}
                    onChange={(e) => {
                      setBudget(Number(e.target.value))
                      setBudgetTouched(true)
                    }}
                    className="range mt-6"
                    style={{ ['--fill' as string]: `${((budget - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100}%` }}
                  />
                  <div className="t-meta mt-2 flex justify-between text-stone">
                    <span>{euros(BUDGET_MIN)}</span>
                    <span>{euros(BUDGET_MAX)} +</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 border-t border-ink/15 pt-8">
                  <PillButton size="lg" arrow magnetic onClick={() => setView('result')}>
                    Imaginer mon voyage
                  </PillButton>
                  <p className="text-[0.92rem] text-stone">Aucune réponse n’est obligatoire.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="r"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.6, ease: ease.expo }}
              >
                <button type="button" onClick={() => setView('questions')} className="group t-meta inline-flex items-center gap-2 text-stone hover:text-ink">
                  <Arrow direction="left" className="text-sm" /> Modifier mes réponses
                </button>
                <h3 className="t-h2 mt-6">Voici une première piste.</h3>
                <p className="mt-4 max-w-[34rem] text-stone">
                  Quelques destinations qui correspondent à vos envies. Un conseiller affinera avec vous — ou vous proposera tout autre chose.
                </p>

                <ul className="mt-8 grid gap-3 sm:grid-cols-3">
                  {suggestions.map((d, k) => (
                    <motion.li key={d.slug} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: ease.expo, delay: 0.15 + k * 0.08 }}>
                      <button type="button" onClick={() => openDestination(d.slug)} data-cursor="Voir" className="group block w-full text-left">
                        <Photo image={d.image} decorative sizes="(min-width: 640px) 18vw, 90vw" className="aspect-[4/5] w-full" imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-expo)] group-hover:scale-105" />
                        <span className="mt-3 flex items-center justify-between">
                          <span className="t-h4">{d.name}</span>
                          <Arrow className="text-base" />
                        </span>
                        <span className="mt-1 block text-[0.92rem] leading-snug text-stone">{d.tagline}</span>
                      </button>
                    </motion.li>
                  ))}
                </ul>

                <QuickRequest draft={toDraft()} onRefine={() => startRequest(toDraft(), 'module-voyage')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

function Question({ n, title, id, children, grid }: { n: string; title: string; id: string; children: ReactNode; grid?: boolean }) {
  return (
    <div role="group" aria-labelledby={id} className="border-t border-ink/15 pt-6">
      <p id={id} className="mb-5 flex items-baseline gap-4">
        <span className="t-meta text-stone">{n}</span>
        <span className="t-h3">{title}</span>
      </p>
      <div className={cn(grid ? 'block' : 'flex flex-wrap gap-2')}>{children}</div>
    </div>
  )
}

/** L'esquisse : une carte d'embarquement épurée qui se remplit en direct. */
function SketchCard({ sentence, code }: { sentence: Array<{ text: string; filled: boolean }>; code: string }) {
  return (
    <div className="mt-12 max-w-[30rem] bg-paper p-6 md:p-8" aria-live="polite">
      <div className="t-meta flex items-center justify-between text-stone">
        <span>Votre esquisse</span>
        <span className="tabular">N° JV-{new Date().getFullYear()}</span>
      </div>
      <div className="mt-6 flex items-end justify-between border-b border-dashed border-ink/20 pb-6">
        <div>
          <p className="t-meta text-stone">Départ</p>
          <p className="font-display text-[2rem] font-bold leading-none tracking-[-0.04em] sm:text-[2.6rem]">NCE</p>
          <p className="mt-1 text-[0.85rem] text-stone">Nice</p>
        </div>
        <Arrow className="mb-6 text-xl text-clay" />
        <div className="text-right">
          <p className="t-meta text-stone">Arrivée</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={code}
              className="font-display text-[2rem] font-bold leading-none tracking-[-0.04em] sm:text-[2.6rem]"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.4, ease: ease.expo }}
            >
              {code}
            </motion.p>
          </AnimatePresence>
          <p className="mt-1 text-[0.85rem] text-stone">Le monde</p>
        </div>
      </div>
      <p className="mt-6 text-[1.2rem] font-medium leading-[1.6] tracking-[-0.01em]">
        {sentence.map((p, i) => (
          <span key={i}>
            {p.filled ? (
              <motion.span key={p.text} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                {p.text}
              </motion.span>
            ) : (
              <>
                <span aria-hidden className="inline-block h-[1em] w-[3.4em] translate-y-[0.12em] border-b border-dashed border-ink/30" />
                <span className="sr-only">{p.text}</span>
              </>
            )}
            {i < sentence.length - 1 ? (i >= 2 ? ', ' : ' ') : '.'}
          </span>
        ))}
      </p>
    </div>
  )
}

/** Demande express envoyée depuis le module. */
function QuickRequest({ draft, onRefine }: { draft: Partial<TripDraft>; onRefine: () => void }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({})
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'mail' | 'error'>('idle')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!name.trim()) errs.name = 'Votre prénom, s’il vous plaît.'
    const c = contact.trim()
    if (!c) errs.contact = 'Un e-mail ou un téléphone pour vous répondre.'
    else if (!isEmail(c) && !isPhone(c)) errs.contact = 'E-mail ou numéro de téléphone invalide.'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setState('sending')
    try {
      const full: TripDraft = {
        ...emptyDraft,
        ...draft,
        firstName: name.trim(),
        email: isEmail(c) ? c : '',
        phone: isEmail(c) ? '' : c,
        contactPref: isEmail(c) ? 'email' : 'phone',
        consent: true,
      }
      const res = await sendTripRequest(toPayload(full, 'module-voyage'))
      setState(res.kind === 'mail-client' ? 'mail' : 'sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent' || state === 'mail') {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-10 border-t border-ink/15 pt-8" role="status">
        <p className="t-h3">C’est noté, {name.trim()}.</p>
        <p className="mt-3 max-w-[32rem] text-stone">
          {state === 'mail'
            ? 'Votre messagerie s’est ouverte avec votre esquisse : il ne reste qu’à envoyer le message.'
            : 'Un conseiller vous recontacte personnellement pour en parler.'}
        </p>
        <TextLink as="button" onClick={onRefine} className="mt-6">
          Compléter ma demande
        </TextLink>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="mt-10 border-t border-ink/15 pt-8">
      <p className="t-h4">Recevoir cette esquisse, affinée par un conseiller.</p>
      <div className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        <div>
          <label htmlFor="qr-name" className="sr-only">
            Prénom
          </label>
          <input
            id="qr-name"
            className="field"
            placeholder="Prénom"
            autoComplete="given-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'qr-name-err' : undefined}
          />
          {errors.name && (
            <p id="qr-name-err" className="mt-2 text-[0.85rem] text-clay-deep">
              {errors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="qr-contact" className="sr-only">
            E-mail ou téléphone
          </label>
          <input
            id="qr-contact"
            className="field"
            placeholder="E-mail ou téléphone"
            autoComplete="email"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            aria-invalid={!!errors.contact}
            aria-describedby={errors.contact ? 'qr-contact-err' : undefined}
          />
          {errors.contact && (
            <p id="qr-contact-err" className="mt-2 text-[0.85rem] text-clay-deep">
              {errors.contact}
            </p>
          )}
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <PillButton type="submit" size="lg" arrow disabled={state === 'sending'}>
          {state === 'sending' ? 'Envoi…' : 'Envoyer à un conseiller'}
        </PillButton>
        <TextLink as="button" onClick={onRefine}>
          Ou détailler ma demande
        </TextLink>
      </div>
      {state === 'error' && (
        <p role="alert" className="mt-4 text-[0.92rem] text-clay-deep">
          L’envoi n’a pas abouti. Réessayez, ou appelez-nous directement.
        </p>
      )}
      <p className="mt-5 text-[0.8rem] leading-relaxed text-stone">
        En envoyant, vous acceptez d’être recontacté au sujet de cette demande. Vos informations ne sont utilisées que pour vous répondre.
      </p>
    </form>
  )
}
