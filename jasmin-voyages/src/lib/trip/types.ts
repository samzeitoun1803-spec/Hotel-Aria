import type { BudgetId } from '../../content/options'

export type DateMode = 'approx' | 'exact' | 'flexible'
export type ContactPref = 'email' | 'phone' | 'agency'

/** Brouillon de demande de voyage — partagé entre toutes les sections du site. */
export interface TripDraft {
  destinations: string[]
  destinationNote: string
  undecided: boolean

  dateMode: DateMode
  month: string // 'YYYY-MM'
  duration: string
  departDate: string // 'YYYY-MM-DD'
  returnDate: string

  adults: number
  children: number

  budget: BudgetId | ''

  styles: string[]
  services: string[]
  message: string

  firstName: string
  lastName: string
  email: string
  phone: string
  contactPref: ContactPref
  consent: boolean

  /** Champ piège anti-spam (doit rester vide) */
  website: string
}

export const emptyDraft: TripDraft = {
  destinations: [],
  destinationNote: '',
  undecided: false,
  dateMode: 'approx',
  month: '',
  duration: '',
  departDate: '',
  returnDate: '',
  adults: 2,
  children: 0,
  budget: '',
  styles: [],
  services: [],
  message: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  contactPref: 'email',
  consent: false,
  website: '',
}

/** Charge utile envoyée au transport (e-mail, CRM, Formspree, Supabase, API…) */
export interface TripRequestPayload {
  source: string
  submittedAt: string
  summary: string
  contact: { firstName: string; lastName: string; email: string; phone: string; preference: ContactPref }
  trip: {
    destinations: string[]
    destinationNote: string
    undecided: boolean
    dates: { mode: DateMode; month: string; duration: string; depart: string; return: string }
    travelers: { adults: number; children: number }
    budgetPerPerson: string
    styles: string[]
    services: string[]
    message: string
  }
}
