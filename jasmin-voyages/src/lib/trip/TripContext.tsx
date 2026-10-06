import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useScrollApi } from '../scroll'
import { emptyDraft, type TripDraft } from './types'

const STORAGE_KEY = 'jasmin-voyages:draft'

export type LegalKind = 'mentions' | 'confidentialite'

interface TripContextValue {
  draft: TripDraft
  update: (patch: Partial<TripDraft>) => void
  reset: () => void
  step: number
  setStep: (n: number) => void
  /** Origine de la demande, transmise avec le formulaire (ex. 'destination:japon'). */
  source: string
  /** Ouvre le formulaire de demande, éventuellement pré-rempli, et y fait défiler la page. */
  startRequest: (prefill?: Partial<TripDraft>, source?: string) => void

  destinationSlug: string | null
  openDestination: (slug: string) => void
  closeDestination: () => void

  legal: LegalKind | null
  openLegal: (kind: LegalKind) => void
  closeLegal: () => void
}

const TripContext = createContext<TripContextValue | null>(null)

export const useTrip = () => {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip doit être utilisé dans <TripProvider>')
  return ctx
}

const loadDraft = (): TripDraft => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyDraft
    // Le consentement n'est jamais restauré : il doit être redonné explicitement.
    return { ...emptyDraft, ...JSON.parse(raw), consent: false, website: '' }
  } catch {
    return emptyDraft
  }
}

export function TripProvider({ children }: { children: ReactNode }) {
  const { scrollTo } = useScrollApi()
  const [draft, setDraft] = useState<TripDraft>(emptyDraft)
  const restored = useRef(false)
  const [step, setStep] = useState(0)
  const [source, setSource] = useState('formulaire')
  const [destinationSlug, setDestinationSlug] = useState<string | null>(null)
  const [legal, setLegal] = useState<LegalKind | null>(null)

  // Brouillon conservé localement : le visiteur retrouve sa demande s'il revient.
  useEffect(() => {
    setDraft((d) => (d === emptyDraft ? loadDraft() : d))
    restored.current = true
  }, [])

  useEffect(() => {
    if (!restored.current) return
    const t = window.setTimeout(() => {
      try {
        const { consent: _c, website: _w, ...rest } = draft
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rest))
      } catch {
        /* stockage indisponible : sans importance */
      }
    }, 400)
    return () => window.clearTimeout(t)
  }, [draft])

  const update = useCallback((patch: Partial<TripDraft>) => setDraft((d) => ({ ...d, ...patch })), [])

  const reset = useCallback(() => {
    setDraft(emptyDraft)
    setStep(0)
    setSource('formulaire')
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  const startRequest = useCallback(
    (prefill?: Partial<TripDraft>, from = 'formulaire') => {
      if (prefill) setDraft((d) => ({ ...d, ...prefill }))
      setSource(from)
      setStep(0)
      setDestinationSlug(null)
      // Laisse le temps à un éventuel dialogue de se refermer avant de défiler.
      window.setTimeout(() => {
        scrollTo('demande', { offset: -24 })
        window.setTimeout(() => {
          document.getElementById('demande-form')?.focus({ preventScroll: true })
        }, 1300)
      }, prefill ? 60 : 0)
    },
    [scrollTo],
  )

  const value = useMemo<TripContextValue>(
    () => ({
      draft,
      update,
      reset,
      step,
      setStep,
      source,
      startRequest,
      destinationSlug,
      openDestination: setDestinationSlug,
      closeDestination: () => setDestinationSlug(null),
      legal,
      openLegal: setLegal,
      closeLegal: () => setLegal(null),
    }),
    [draft, update, reset, step, source, startRequest, destinationSlug, legal],
  )

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}
