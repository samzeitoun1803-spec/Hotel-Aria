import type { TripDraft } from './types'

export type Errors = Partial<Record<keyof TripDraft, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isEmail = (v: string) => EMAIL.test(v.trim())

/** Accepte 06 12 34 56 78, +33 6 12 34 56 78, 0033…, et les numéros internationaux. */
export const isPhone = (v: string) => {
  const raw = v.trim()
  if (!/^[+()\d\s.\-]+$/.test(raw)) return false
  const digits = raw.replace(/\D/g, '')
  if (raw.startsWith('+') || raw.startsWith('00')) return digits.length >= 8 && digits.length <= 15
  return digits.length === 10 && digits.startsWith('0')
}

const todayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const stepValidators: Array<(d: TripDraft) => Errors> = [
  // 01 — Destination
  (d) =>
    d.destinations.length || d.destinationNote.trim() || d.undecided
      ? {}
      : { destinations: 'Choisissez une destination, écrivez la vôtre, ou indiquez que vous ne savez pas encore.' },

  // 02 — Dates
  (d) => {
    if (d.dateMode === 'flexible') return {}
    if (d.dateMode === 'approx') return d.month ? {} : { month: 'Indiquez le mois de départ envisagé.' }
    const e: Errors = {}
    if (!d.departDate) e.departDate = 'Indiquez une date de départ.'
    else if (d.departDate < todayIso()) e.departDate = 'La date de départ est déjà passée.'
    if (!d.returnDate) e.returnDate = 'Indiquez une date de retour.'
    else if (d.departDate && d.returnDate <= d.departDate) e.returnDate = 'Le retour doit suivre le départ.'
    return e
  },

  // 03 — Voyageurs
  (d) => (d.adults >= 1 ? {} : { adults: 'Au moins un adulte voyage.' }),

  // 04 — Budget
  (d) => (d.budget ? {} : { budget: 'Choisissez une fourchette — même approximative.' }),

  // 05 — Style
  (d) => (d.styles.length || d.services.length ? {} : { styles: 'Choisissez au moins une envie ou un type de voyage.' }),

  // 06 — Coordonnées
  (d) => {
    const e: Errors = {}
    if (!d.firstName.trim()) e.firstName = 'Votre prénom, s’il vous plaît.'
    if (!d.lastName.trim()) e.lastName = 'Votre nom, s’il vous plaît.'
    if (!d.email.trim()) e.email = 'Votre adresse e-mail, pour vous répondre.'
    else if (!isEmail(d.email)) e.email = 'Cette adresse e-mail semble incomplète.'
    if (d.contactPref === 'phone' && !d.phone.trim()) e.phone = 'Indiquez un numéro pour être rappelé.'
    else if (d.phone.trim() && !isPhone(d.phone)) e.phone = 'Ce numéro semble incomplet (ex. 06 12 34 56 78).'
    if (!d.consent) e.consent = 'Votre accord est nécessaire pour que nous puissions vous recontacter.'
    return e
  },
]

export const firstInvalidStep = (d: TripDraft) => stepValidators.findIndex((v) => Object.keys(v(d)).length > 0)
