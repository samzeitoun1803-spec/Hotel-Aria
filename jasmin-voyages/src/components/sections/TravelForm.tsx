import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { agency } from '../../content/agency'
import { destinations } from '../../content/destinations'
import { budgetOptions, durationOptions, serviceOptions, styleOptions } from '../../content/options'
import { cn } from '../../lib/cn'
import { demoFormNote, isDemo } from '../../lib/demo'
import { ease } from '../../lib/motion'
import { budgetLabel, describeDates, describeDestination, describeTravelers, toPayload, upcomingMonths } from '../../lib/trip/format'
import { sendTripRequest } from '../../lib/trip/transport'
import { useScrollApi } from '../../lib/scroll'
import { useTrip } from '../../lib/trip/TripContext'
import type { DateMode, TripDraft } from '../../lib/trip/types'
import { stepValidators, type Errors } from '../../lib/trip/validation'
import { Arrow } from '../ui/Arrow'
import { PillButton, PillLink, TextLink } from '../ui/Button'
import { Chip } from '../ui/Chip'
import { MaskText } from '../ui/MaskText'
import { Reveal } from '../ui/Reveal'
import { SectionTag } from '../ui/SectionTag'

const STEPS = [
  { short: 'Destination', title: 'Où rêvez-vous d’aller ?' },
  { short: 'Dates', title: 'Quand souhaitez-vous partir ?' },
  { short: 'Voyageurs', title: 'Qui part en voyage ?' },
  { short: 'Budget', title: 'Quel budget envisagez-vous ?' },
  { short: 'Style', title: 'Quel voyage vous ressemble ?' },
  { short: 'Coordonnées', title: 'Comment vous joindre ?' },
]

type Status = 'editing' | 'sending' | 'sent' | 'mail' | 'error'

export function TravelForm() {
  const { draft, update, step, setStep, source, reset, openLegal } = useTrip()
  const { scrollTo } = useScrollApi()
  const cardRef = useRef<HTMLDivElement>(null)
  const [dir, setDir] = useState(1)
  const [showErrors, setShowErrors] = useState(false)
  const [status, setStatus] = useState<Status>('editing')
  const [maxReached, setMaxReached] = useState(0)
  const formRef = useRef<HTMLFormElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  const errors: Errors = useMemo(() => (showErrors ? stepValidators[step](draft) : {}), [showErrors, step, draft])

  useEffect(() => setMaxReached((m) => Math.max(m, step)), [step])

  // Après un changement d'étape : focus sur le titre (lecteurs d'écran), sans défilement.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const t = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 420)
    return () => window.clearTimeout(t)
  }, [step])

  // Garde le haut du formulaire visible quand on change d'étape (utile sur mobile).
  const keepInView = () => {
    const top = cardRef.current?.getBoundingClientRect().top ?? 0
    if (top < 72) scrollTo(window.scrollY + top - 84)
  }

  const goTo = (n: number) => {
    setDir(n > step ? 1 : -1)
    setShowErrors(false)
    setStep(n)
    keepInView()
  }

  const next = async () => {
    const errs = stepValidators[step](draft)
    if (Object.keys(errs).length) {
      setShowErrors(true)
      window.setTimeout(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"], [data-error-anchor]')?.focus({ preventScroll: false })
      }, 30)
      return
    }
    if (step < STEPS.length - 1) return goTo(step + 1)
    if (draft.website) return setStatus('sent') // robot : on ne transmet rien
    setStatus('sending')
    try {
      const res = await sendTripRequest(toPayload(draft, source))
      setStatus(res.kind === 'mail-client' ? 'mail' : 'sent')
      keepInView()
    } catch {
      setStatus('error')
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void next()
  }

  const restart = () => {
    reset()
    setStatus('editing')
    setMaxReached(0)
    setShowErrors(false)
  }

  return (
    <section id="demande" aria-labelledby="demande-titre" className="section-y relative bg-ivory">
      <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(7rem+var(--demo-bar))]">
            <SectionTag index="09">Demande de voyage</SectionTag>
            <MaskText as="h2" id="demande-titre" lines={['Parlez-nous', 'de votre prochain', 'voyage.']} className="t-h1 mt-8" />
            <Reveal delay={0.1}>
              <ul className="mt-10 space-y-3 text-[1.0625rem]">
                {['Six questions, à peine deux minutes.', 'Un conseiller vous recontacte personnellement.', 'Vos réponses ne servent qu’à préparer votre voyage.'].map((l) => (
                  <li key={l} className="flex items-baseline gap-3">
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full bg-ink" />
                    {l}
                  </li>
                ))}
              </ul>
              <div className="mt-12 hidden border-t border-line pt-6 lg:block">
                <p className="t-meta text-stone">Vous préférez parler ?</p>
                <a href={agency.phone.href} className="t-h2 mt-3 block hover:text-clay-deep">
                  {agency.phone.display}
                </a>
                <p className="mt-2 text-stone">
                  Ou passez nous voir au {agency.street}, {agency.city}.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div ref={cardRef} id="demande-carte" className="relative scroll-mt-24 bg-paper p-5 sm:p-8 md:p-12">
            <AnimatePresence mode="wait" initial={false}>
              {status === 'sent' || status === 'mail' ? (
                <Success key="ok" draft={draft} mail={status === 'mail'} onRestart={restart} />
              ) : (
                <motion.form
                  key="form"
                  id="demande-form"
                  ref={formRef}
                  tabIndex={-1}
                  onSubmit={onSubmit}
                  noValidate
                  className="outline-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease: ease.expo }}
                  aria-labelledby="demande-titre"
                >
                  <Progress step={step} maxReached={maxReached} onGo={goTo} />

                  <div className="relative mt-10 min-h-[440px]">
                    <AnimatePresence mode="wait" custom={dir} initial={false}>
                      <motion.div
                        key={step}
                        role="group"
                        aria-labelledby="etape-titre"
                        custom={dir}
                        variants={{
                          enter: (d: number) => ({ opacity: 0, x: d * 48 }),
                          center: { opacity: 1, x: 0 },
                          exit: (d: number) => ({ opacity: 0, x: d * -48 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: ease.expo }}
                        className="min-w-0"
                      >
                        <p className="t-meta text-stone">Étape {String(step + 1).padStart(2, '0')} sur 06</p>
                        <h3 id="etape-titre" ref={headingRef} tabIndex={-1} className="t-h2 mt-4 outline-none">
                          {STEPS[step].title}
                        </h3>
                        <div className="mt-8">
                          {step === 0 && <StepDestination draft={draft} update={update} errors={errors} />}
                          {step === 1 && <StepDates draft={draft} update={update} errors={errors} />}
                          {step === 2 && <StepTravelers draft={draft} update={update} errors={errors} />}
                          {step === 3 && <StepBudget draft={draft} update={update} errors={errors} />}
                          {step === 4 && <StepStyle draft={draft} update={update} errors={errors} />}
                          {step === 5 && <StepContact draft={draft} update={update} errors={errors} onLegal={() => openLegal('confidentialite')} />}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {status === 'error' && (
                    <div role="alert" className="mt-6 border-l-2 border-clay-deep pl-4 text-[0.95rem]">
                      <p className="font-semibold">L’envoi n’a pas abouti.</p>
                      <p className="mt-1 text-stone">
                        Réessayez dans un instant, ou contactez-nous au{' '}
                        <a className="underline" href={agency.phone.href}>
                          {agency.phone.display}
                        </a>{' '}
                        ou à{' '}
                        <a className="underline" href={`mailto:${agency.email}`}>
                          {agency.email}
                        </a>
                        .
                      </p>
                    </div>
                  )}

                  <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
                    {step > 0 ? (
                      <button type="button" onClick={() => goTo(step - 1)} className="group inline-flex h-12 items-center gap-2 pr-3 font-semibold text-stone hover:text-ink">
                        <Arrow direction="left" /> Retour
                      </button>
                    ) : (
                      <span className="hidden text-[0.9rem] text-stone sm:block">Étape suivante : {STEPS[1].short.toLowerCase()}</span>
                    )}
                    <PillButton type="submit" size="lg" arrow={status !== 'sending'} disabled={status === 'sending'} className="ml-auto">
                      {status === 'sending' ? (
                        <span className="inline-flex items-center gap-3">
                          <span aria-hidden className="spin h-4 w-4 rounded-full border-2 border-ivory/30 border-t-ivory" />
                          Envoi en cours
                        </span>
                      ) : step === STEPS.length - 1 ? (
                        'Envoyer ma demande'
                      ) : (
                        'Continuer'
                      )}
                    </PillButton>
                  </div>
                  {isDemo && <p className="mt-4 text-right text-[0.85rem] text-stone">{demoFormNote}</p>}
                  <p className="sr-only" aria-live="polite">
                    Étape {step + 1} sur 6 : {STEPS[step].short}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
          {/* Mobile : l'alternative téléphone, sous le formulaire */}
          <p className="mt-6 text-[0.98rem] text-stone lg:hidden">
            Vous préférez parler ?{' '}
            <a href={agency.phone.href} className="font-semibold text-ink underline underline-offset-4">
              {agency.phone.display}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── Indicateur de progression : 01 — 02 — 03 — 04 — 05 — 06 ─────────── */

function Progress({ step, maxReached, onGo }: { step: number; maxReached: number; onGo: (n: number) => void }) {
  return (
    <div>
      <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Progression">
        {STEPS.map((s, i) => {
          const reachable = i <= maxReached && i !== step
          return (
            <li key={s.short} className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onGo(i)}
                aria-current={i === step ? 'step' : undefined}
                aria-label={`${String(i + 1).padStart(2, '0')} — ${s.short}${i < step ? ' (complétée)' : ''}`}
                className={cn(
                  't-meta tabular grid h-9 min-w-9 place-items-center rounded-full px-2 transition-colors duration-300 disabled:cursor-default',
                  i === step ? 'bg-ink text-ivory' : i <= maxReached ? 'text-ink hover:bg-sand' : 'text-stone/60',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </button>
              {i < STEPS.length - 1 && <span aria-hidden className={cn('h-px w-2.5 sm:w-5', i < step ? 'bg-ink' : 'bg-line')} />}
            </li>
          )
        })}
      </ol>
      <div className="mt-5 h-px w-full bg-line">
        <motion.div className="h-px origin-left bg-clay" animate={{ scaleX: (step + 1) / STEPS.length }} transition={{ duration: 0.8, ease: ease.expo }} />
      </div>
    </div>
  )
}

/* ── Étapes ─────────────────────────────────────────────────────────── */

interface StepProps {
  draft: TripDraft
  update: (p: Partial<TripDraft>) => void
  errors: Errors
}

function ErrorText({ id, children }: { id: string; children?: string }) {
  return (
    <AnimatePresence>
      {children && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mt-3 flex items-start gap-2 text-[0.9rem] text-clay-deep"
        >
          <span aria-hidden className="mt-[0.45em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay-deep" />
          {children}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function toggle(list: string[], v: string) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
}

function StepDestination({ draft, update, errors }: StepProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Destinations" data-error-anchor={errors.destinations ? true : undefined} tabIndex={errors.destinations ? -1 : undefined}>
        {destinations.map((d) => (
          <Chip key={d.slug} selected={draft.destinations.includes(d.name)} onClick={() => update({ destinations: toggle(draft.destinations, d.name), undecided: false })}>
            {d.name}
          </Chip>
        ))}
        <Chip selected={draft.undecided} onClick={() => update({ undecided: !draft.undecided, ...(draft.undecided ? {} : { destinations: [] }) })}>
          Je ne sais pas encore
        </Chip>
      </div>
      <ErrorText id="err-destinations">{errors.destinations}</ErrorText>
      <label htmlFor="f-dest-note" className="t-meta mt-10 block text-stone">
        Ou écrivez librement
      </label>
      <input
        id="f-dest-note"
        className="field"
        placeholder="Islande, la Sicile en ferry, un road-trip en Écosse…"
        value={draft.destinationNote}
        onChange={(e) => update({ destinationNote: e.target.value })}
        aria-describedby={errors.destinations ? 'err-destinations' : undefined}
      />
    </div>
  )
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<[T, string]>; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex w-full flex-wrap gap-1 rounded-[28px] border border-ink/15 p-1 sm:w-auto sm:rounded-full">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={cn(
            'h-11 flex-1 whitespace-nowrap rounded-full px-4 text-[0.92rem] font-medium transition-colors duration-300 sm:flex-none sm:px-5 sm:text-[0.95rem]',
            value === v ? 'bg-ink text-ivory' : 'text-ink/75 hover:text-ink',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function StepDates({ draft, update, errors }: StepProps) {
  const months = useMemo(() => upcomingMonths(18), [])
  const today = new Date().toISOString().slice(0, 10)
  return (
    <div>
      <Segmented<DateMode>
        label="Type de dates"
        value={draft.dateMode}
        onChange={(v) => update({ dateMode: v })}
        options={[
          ['approx', 'Un mois'],
          ['exact', 'Dates précises'],
          ['flexible', 'Flexible'],
        ]}
      />

      <div className="mt-10">
        {draft.dateMode === 'approx' && (
          <div className="space-y-10">
            <div>
              <label htmlFor="f-month" className="t-meta block text-stone">
                Mois de départ
              </label>
              <select
                id="f-month"
                className="field"
                value={draft.month}
                onChange={(e) => update({ month: e.target.value })}
                aria-invalid={!!errors.month}
                aria-describedby={errors.month ? 'err-month' : undefined}
              >
                <option value="">Choisir un mois</option>
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <ErrorText id="err-month">{errors.month}</ErrorText>
            </div>
            <div>
              <p className="t-meta text-stone" id="f-duration">
                Durée envisagée <span className="normal-case tracking-normal">(facultatif)</span>
              </p>
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-labelledby="f-duration">
                {durationOptions.map((d) => (
                  <Chip key={d} selected={draft.duration === d} onClick={() => update({ duration: draft.duration === d ? '' : d })}>
                    {d}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}

        {draft.dateMode === 'exact' && (
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <label htmlFor="f-depart" className="t-meta block text-stone">
                Départ
              </label>
              <input
                id="f-depart"
                type="date"
                min={today}
                className="field"
                value={draft.departDate}
                onChange={(e) => update({ departDate: e.target.value })}
                aria-invalid={!!errors.departDate}
                aria-describedby={errors.departDate ? 'err-depart' : undefined}
              />
              <ErrorText id="err-depart">{errors.departDate}</ErrorText>
            </div>
            <div>
              <label htmlFor="f-return" className="t-meta block text-stone">
                Retour
              </label>
              <input
                id="f-return"
                type="date"
                min={draft.departDate || today}
                className="field"
                value={draft.returnDate}
                onChange={(e) => update({ returnDate: e.target.value })}
                aria-invalid={!!errors.returnDate}
                aria-describedby={errors.returnDate ? 'err-return' : undefined}
              />
              <ErrorText id="err-return">{errors.returnDate}</ErrorText>
            </div>
          </div>
        )}

        {draft.dateMode === 'flexible' && (
          <p className="t-lead max-w-[30rem] text-stone">Parfait. Nous vous suggérerons la meilleure période pour votre destination — climat, affluence et budget compris.</p>
        )}
      </div>
    </div>
  )
}

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  const id = label.toLowerCase()
  return (
    <div className="flex items-center justify-between gap-6 border-b border-line py-5">
      <div>
        <p id={`st-${id}`} className="t-h4">
          {label}
        </p>
        <p className="text-[0.9rem] text-stone">{hint}</p>
      </div>
      <div className="flex items-center gap-4" role="group" aria-labelledby={`st-${id}`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Retirer : ${label}`}
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition-colors hover:border-ink disabled:opacity-30"
        >
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
            <path d="M2 7h10" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        <output className="t-h3 w-8 text-center tabular" aria-live="polite">
          {value}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Ajouter : ${label}`}
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/20 transition-colors hover:border-ink disabled:opacity-30"
        >
          <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
            <path d="M2 7h10M7 2v10" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function StepTravelers({ draft, update, errors }: StepProps) {
  const presets: Array<[string, number, number]> = [
    ['En solo', 1, 0],
    ['À deux', 2, 0],
    ['En famille', 2, 2],
    ['Entre amis', 4, 0],
  ]
  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Raccourcis">
        {presets.map(([l, a, c]) => (
          <Chip key={l} selected={draft.adults === a && draft.children === c} onClick={() => update({ adults: a, children: c })}>
            {l}
          </Chip>
        ))}
      </div>
      <div className="mt-8 border-t border-line">
        <Stepper label="Adultes" hint="12 ans et plus" value={draft.adults} min={1} max={20} onChange={(v) => update({ adults: v })} />
        <Stepper label="Enfants" hint="Moins de 12 ans" value={draft.children} min={0} max={10} onChange={(v) => update({ children: v })} />
      </div>
      <ErrorText id="err-adults">{errors.adults}</ErrorText>
    </div>
  )
}

function StepBudget({ draft, update, errors }: StepProps) {
  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Budget par personne"
        className="grid gap-2 sm:grid-cols-2"
        data-error-anchor={errors.budget ? true : undefined}
        tabIndex={errors.budget ? -1 : undefined}
      >
        {budgetOptions.map((b) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={draft.budget === b.id}
            onClick={() => update({ budget: b.id })}
            className={cn(
              'group flex h-16 items-center justify-between rounded-full border px-6 text-left text-[1.05rem] font-semibold tracking-[-0.01em] transition-colors duration-300',
              draft.budget === b.id ? 'border-ink bg-ink text-ivory' : 'border-ink/15 hover:border-ink/60',
            )}
          >
            {b.label}
            <span className={cn('h-4 w-4 rounded-full border transition-colors', draft.budget === b.id ? 'border-ivory bg-ivory' : 'border-ink/30')} aria-hidden />
          </button>
        ))}
      </div>
      <ErrorText id="err-budget">{errors.budget}</ErrorText>
      <p className="mt-6 text-[0.95rem] text-stone">Par personne, à titre indicatif. Nous ajusterons ensemble.</p>
    </div>
  )
}

function StepStyle({ draft, update, errors }: StepProps) {
  return (
    <div className="space-y-10">
      <div>
        <p className="t-meta text-stone" id="f-services">
          Type de voyage
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-labelledby="f-services" data-error-anchor={errors.styles ? true : undefined} tabIndex={errors.styles ? -1 : undefined}>
          {serviceOptions.map((s) => (
            <Chip key={s} selected={draft.services.includes(s)} onClick={() => update({ services: toggle(draft.services, s) })}>
              {s}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="t-meta text-stone" id="f-styles">
          Vos envies
        </p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-labelledby="f-styles">
          {styleOptions.map((s) => (
            <Chip key={s} selected={draft.styles.includes(s)} onClick={() => update({ styles: toggle(draft.styles, s) })}>
              {s}
            </Chip>
          ))}
        </div>
        <ErrorText id="err-styles">{errors.styles}</ErrorText>
      </div>
      <div>
        <label htmlFor="f-message" className="t-meta block text-stone">
          Quelques mots sur votre voyage <span className="normal-case tracking-normal">(facultatif)</span>
        </label>
        <textarea
          id="f-message"
          rows={3}
          className="field resize-none"
          placeholder="Un anniversaire à fêter, un rêve d’enfant, une contrainte à connaître…"
          value={draft.message}
          onChange={(e) => update({ message: e.target.value })}
          maxLength={1500}
        />
      </div>
    </div>
  )
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="t-meta block text-stone">
        {label}
      </label>
      {children}
      <ErrorText id={`${id}-err`}>{error}</ErrorText>
    </div>
  )
}

function StepContact({ draft, update, errors, onLegal }: StepProps & { onLegal: () => void }) {
  const input = (key: 'firstName' | 'lastName' | 'email' | 'phone', extra: Record<string, string>) => ({
    id: `f-${key}`,
    className: 'field',
    value: draft[key],
    onChange: (e: { target: { value: string } }) => update({ [key]: e.target.value }),
    'aria-invalid': !!errors[key],
    'aria-describedby': errors[key] ? `f-${key}-err` : undefined,
    ...extra,
  })
  return (
    <div className="space-y-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field id="f-firstName" label="Prénom" error={errors.firstName}>
          <input {...input('firstName', { autoComplete: 'given-name' })} />
        </Field>
        <Field id="f-lastName" label="Nom" error={errors.lastName}>
          <input {...input('lastName', { autoComplete: 'family-name' })} />
        </Field>
        <Field id="f-email" label="E-mail" error={errors.email}>
          <input {...input('email', { type: 'email', autoComplete: 'email', inputMode: 'email' })} />
        </Field>
        <Field id="f-phone" label={draft.contactPref === 'phone' ? 'Téléphone' : 'Téléphone (facultatif)'} error={errors.phone}>
          <input {...input('phone', { type: 'tel', autoComplete: 'tel', inputMode: 'tel' })} />
        </Field>
      </div>

      <div>
        <p className="t-meta mb-4 text-stone">Pour la suite, je préfère</p>
        <Segmented
          label="Moyen de contact préféré"
          value={draft.contactPref}
          onChange={(v) => update({ contactPref: v })}
          options={[
            ['email', 'Un e-mail'],
            ['phone', 'Un appel'],
            ['agency', 'Passer à l’agence'],
          ]}
        />
      </div>

      {/* Champ piège anti-robots, invisible pour les humains */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="f-website">Site web</label>
        <input id="f-website" tabIndex={-1} autoComplete="off" value={draft.website} onChange={(e) => update({ website: e.target.value })} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-4">
          <input
            type="checkbox"
            checked={draft.consent}
            onChange={(e) => update({ consent: e.target.checked })}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'f-consent-err' : undefined}
            className="check mt-0.5"
          />
          <span className="text-[0.95rem] leading-relaxed text-stone">
            J’accepte que Jasmin Voyages utilise ces informations pour me recontacter au sujet de ma demande.{' '}
            <button type="button" onClick={onLegal} className="font-semibold text-ink underline underline-offset-2">
              Politique de confidentialité
            </button>
          </span>
        </label>
        <ErrorText id="f-consent-err">{errors.consent}</ErrorText>
      </div>
    </div>
  )
}

/* ── Confirmation ───────────────────────────────────────────────────── */

function Success({ draft, mail, onRestart }: { draft: TripDraft; mail: boolean; onRestart: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 300)
    return () => window.clearTimeout(t)
  }, [])

  const recap: Array<[string, string]> = [
    ['Destination', describeDestination(draft) || '—'],
    ['Dates', describeDates(draft) || '—'],
    ['Voyageurs', describeTravelers(draft)],
    ['Budget', budgetLabel(draft.budget) || '—'],
    ['Style', [...draft.services, ...draft.styles].join(', ') || '—'],
  ]
  const how = { email: 'par e-mail', phone: 'par téléphone', agency: 'pour convenir d’un rendez-vous à l’agence' }[draft.contactPref]

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: ease.expo }} role="status">
      <p className="t-meta flex items-center gap-3 text-stone">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-ivory">
          <svg viewBox="0 0 14 14" className="h-3 w-3">
            <path d="M2.5 7.4 5.6 10.3 11.5 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
        {mail ? 'Demande prête' : isDemo ? 'Envoi simulé' : 'Demande envoyée'}
      </p>
      <h3 ref={ref} tabIndex={-1} className="t-h1 mt-8 outline-none">
        Votre voyage
        <br />
        commence ici.
      </h3>
      <p className="t-lead mt-6 max-w-[34rem] text-stone">
        {mail
          ? `Merci ${draft.firstName}. Votre messagerie vient de s’ouvrir avec votre demande : envoyez le message pour qu’il nous parvienne.`
          : isDemo
            ? `Merci ${draft.firstName}. Maquette : aucune demande n’a été transmise. Sur le site en ligne, elle arrive directement chez ${agency.name}, et un conseiller vous recontacte ${how}.`
            : `Merci ${draft.firstName}. Un conseiller étudie votre demande et vous recontacte ${how}.`}
      </p>

      <dl className="mt-10 border-t border-line">
        {recap.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-line py-3.5 sm:grid-cols-[10rem_1fr]">
            <dt className="t-meta pt-0.5 text-stone">{k}</dt>
            <dd className="font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      {mail && (
        <p className="mt-6 text-[0.92rem] text-stone">
          Rien ne s’est ouvert ? Écrivez-nous directement à{' '}
          <a href={`mailto:${agency.email}`} className="font-semibold text-ink underline underline-offset-2">
            {agency.email}
          </a>
          .
        </p>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
        <PillLink href={agency.phone.href} size="lg" variant="ghost">
          Appeler l’agence
        </PillLink>
        <TextLink as="button" onClick={onRestart}>
          Faire une nouvelle demande
        </TextLink>
      </div>
    </motion.div>
  )
}
