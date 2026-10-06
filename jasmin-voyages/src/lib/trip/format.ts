import { budgetOptions, monthNames } from '../../content/options'
import type { TripDraft, TripRequestPayload } from './types'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** 'YYYY-MM' → 'Avril 2027' */
export const formatMonth = (ym: string) => {
  if (!ym) return ''
  const [y, m] = ym.split('-').map(Number)
  return `${capitalize(monthNames[m - 1])} ${y}`
}

/** Les 18 prochains mois, à partir du mois courant. */
export const upcomingMonths = (count = 18) => {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    return { value, label: formatMonth(value) }
  })
}

/** Prochaine occurrence d'un mois (0–11) au format 'YYYY-MM'. */
export const nextOccurrence = (monthIndex: number) => {
  const now = new Date()
  const year = monthIndex < now.getMonth() ? now.getFullYear() + 1 : now.getFullYear()
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`
}

export const formatDate = (iso: string) =>
  iso ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00')) : ''

export const euros = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export const budgetLabel = (id: string) => budgetOptions.find((b) => b.id === id)?.label ?? ''

export const describeDestination = (d: TripDraft) => {
  if (d.undecided && !d.destinations.length && !d.destinationNote) return 'À imaginer ensemble'
  return [...d.destinations, d.destinationNote.trim()].filter(Boolean).join(', ')
}

export const describeDates = (d: TripDraft) => {
  if (d.dateMode === 'flexible') return 'Dates flexibles'
  if (d.dateMode === 'exact') return d.departDate ? `Du ${formatDate(d.departDate)} au ${formatDate(d.returnDate)}` : ''
  return [formatMonth(d.month), d.duration.toLowerCase()].filter(Boolean).join(' · ')
}

export const describeTravelers = (d: TripDraft) => {
  const a = `${d.adults} adulte${d.adults > 1 ? 's' : ''}`
  return d.children ? `${a}, ${d.children} enfant${d.children > 1 ? 's' : ''}` : a
}

export const toPayload = (d: TripDraft, source: string): TripRequestPayload => {
  const fields: Array<[string, string]> = [
    ['Destination', describeDestination(d) || '—'],
    ['Dates', describeDates(d) || '—'],
    ['Voyageurs', describeTravelers(d)],
    ['Budget par personne', budgetLabel(d.budget) || '—'],
    ['Style', [...d.services, ...d.styles].join(', ') || '—'],
    ['Message', d.message.trim() || '—'],
    ['Nom', `${d.firstName} ${d.lastName}`.trim() || '—'],
    ['E-mail', d.email.trim() || '—'],
    ['Téléphone', d.phone.trim() || '—'],
    ['Préférence de contact', { email: 'e-mail', phone: 'téléphone', agency: 'rendez-vous à l’agence' }[d.contactPref]],
    ['Origine de la demande', source],
  ]
  const summary = fields.map(([k, v]) => `${k} : ${v}`).join('\n')

  return {
    source,
    submittedAt: new Date().toISOString(),
    summary,
    fields,
    contact: {
      firstName: d.firstName.trim(),
      lastName: d.lastName.trim(),
      email: d.email.trim(),
      phone: d.phone.trim(),
      preference: d.contactPref,
    },
    trip: {
      destinations: d.destinations,
      destinationNote: d.destinationNote.trim(),
      undecided: d.undecided,
      dates: { mode: d.dateMode, month: d.month, duration: d.duration, depart: d.departDate, return: d.returnDate },
      travelers: { adults: d.adults, children: d.children },
      budgetPerPerson: budgetLabel(d.budget),
      styles: d.styles,
      services: d.services,
      message: d.message.trim(),
    },
  }
}
