import type { Mood, Region } from './destinations'

export const regionOptions: Array<{ id: Region; label: string; phrase: string }> = [
  { id: 'europe', label: 'Europe', phrase: 'en Europe' },
  { id: 'asie', label: 'Asie', phrase: 'en Asie' },
  { id: 'afrique', label: 'Afrique', phrase: 'en Afrique' },
  { id: 'ameriques', label: 'Amériques', phrase: 'aux Amériques' },
  { id: 'iles', label: 'Îles', phrase: 'sur une île' },
]

export const moodOptions: Array<{ id: Mood; label: string; phrase: string; style: string }> = [
  { id: 'detente', label: 'Se détendre', phrase: 'pour se ressourcer', style: 'Détente' },
  { id: 'decouverte', label: 'Découvrir', phrase: 'de découverte', style: 'Découverte' },
  { id: 'aventure', label: 'Aventure', phrase: 'd’aventure', style: 'Aventure' },
  { id: 'romantique', label: 'Romantique', phrase: 'romantique', style: 'Romantique' },
  { id: 'famille', label: 'Famille', phrase: 'en famille', style: 'Famille' },
]

export const monthNames = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
]
export const monthShort = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

export const budgetOptions = [
  { id: 'lt1500', label: 'Moins de 1 500 €', max: 1500 },
  { id: '1500-3000', label: '1 500 – 3 000 €', max: 3000 },
  { id: '3000-5000', label: '3 000 – 5 000 €', max: 5000 },
  { id: '5000-8000', label: '5 000 – 8 000 €', max: 8000 },
  { id: '8000+', label: 'Plus de 8 000 €', max: Infinity },
  { id: 'unknown', label: 'Je ne sais pas encore', max: NaN },
] as const

export type BudgetId = (typeof budgetOptions)[number]['id']

export const budgetFromAmount = (amount: number): BudgetId =>
  (budgetOptions.find((b) => amount <= b.max)?.id ?? '8000+') as BudgetId

export const durationOptions = ['Un week-end', 'Une semaine', 'Dix jours', 'Deux semaines', 'Trois semaines et plus']

export const styleOptions = ['Détente', 'Découverte', 'Aventure', 'Romantique', 'Famille', 'Culture', 'Gastronomie', 'Bien-être']

export const serviceOptions = ['Voyage sur mesure', 'Circuit', 'Séjour', 'Croisière ou ferry', 'Billet seul']
