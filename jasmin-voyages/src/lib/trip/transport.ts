import { agency } from '../../content/agency'
import type { TripRequestPayload } from './types'

/**
 * Transports d'envoi des demandes de voyage.
 *
 * Le site ne dépend d'aucun backend : choisissez le transport via
 * la variable d'environnement VITE_TRIP_TRANSPORT (voir .env.example).
 * Pour brancher un CRM, ajoutez simplement un transport ici.
 */

export type TransportResult = { kind: 'sent' } | { kind: 'mail-client' }

type Transport = (payload: TripRequestPayload) => Promise<TransportResult>

const env = import.meta.env

const postJson = async (url: string, body: unknown, headers: Record<string, string> = {}) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

const transports: Record<string, Transport> = {
  /** Aucune donnée envoyée — simule un aller-retour réseau. */
  demo: async (payload) => {
    await new Promise((r) => setTimeout(r, 1100))
    console.info('[Jasmin Voyages] Demande (mode démo, rien n’a été envoyé) :\n' + payload.summary)
    return { kind: 'sent' }
  },

  /** Ouvre la messagerie du visiteur, pré-remplie vers l'agence. */
  mailto: async (payload) => {
    const subject = `Demande de voyage — ${payload.contact.firstName} ${payload.contact.lastName}`.trim()
    const href = `mailto:${agency.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(payload.summary)}`
    window.location.href = href
    return { kind: 'mail-client' }
  },

  /** https://formspree.io — VITE_FORMSPREE_ID */
  formspree: async (payload) => {
    if (!env.VITE_FORMSPREE_ID) throw new Error('VITE_FORMSPREE_ID manquant')
    await postJson(`https://formspree.io/f/${env.VITE_FORMSPREE_ID}`, {
      _subject: `Demande de voyage — ${payload.contact.firstName} ${payload.contact.lastName}`,
      email: payload.contact.email,
      message: payload.summary,
      ...payload,
    })
    return { kind: 'sent' }
  },

  /** Votre API : reçoit la charge utile complète en JSON — VITE_TRIP_API_URL */
  api: async (payload) => {
    if (!env.VITE_TRIP_API_URL) throw new Error('VITE_TRIP_API_URL manquant')
    await postJson(env.VITE_TRIP_API_URL, payload)
    return { kind: 'sent' }
  },

  /** Supabase (REST, sans SDK) — table avec colonnes : source, submitted_at, summary, payload (jsonb). */
  supabase: async (payload) => {
    const url = env.VITE_SUPABASE_URL
    const key = env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Configuration Supabase manquante')
    const table = env.VITE_SUPABASE_TABLE || 'trip_requests'
    await postJson(
      `${url.replace(/\/$/, '')}/rest/v1/${table}`,
      { source: payload.source, submitted_at: payload.submittedAt, summary: payload.summary, payload },
      { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'return=minimal' },
    )
    return { kind: 'sent' }
  },
}

/** En développement : démo. En production sans configuration : mailto (aucune demande perdue). */
export const transportName = env.VITE_TRIP_TRANSPORT || (env.DEV ? 'demo' : 'mailto')

export const sendTripRequest: Transport = (payload) => (transports[transportName] ?? transports.mailto)(payload)
