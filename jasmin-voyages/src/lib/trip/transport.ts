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
  /**
   * https://formsubmit.co — envoie la demande par e-mail à l'agence, sans compte ni serveur.
   * À la toute première demande, FormSubmit envoie un e-mail d'activation à l'adresse de l'agence :
   * il suffit de cliquer sur « Activate Form » pour que les demandes suivantes arrivent.
   */
  formsubmit: async (payload) => {
    const to = env.VITE_FORMSUBMIT_EMAIL || agency.email
    const body: Record<string, string> = {
      _subject: `Demande de voyage — ${payload.contact.firstName} ${payload.contact.lastName}`.trim(),
      _template: 'table',
      _captcha: 'false',
    }
    for (const [k, v] of payload.fields) if (k !== 'E-mail') body[k] = v
    if (payload.contact.email) body.email = payload.contact.email // adresse de réponse
    const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    const json = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string }
    if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || `HTTP ${res.status}`)
    return { kind: 'sent' }
  },

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

/** En développement : démo. En production sans configuration : FormSubmit, e-mail direct à l'agence. */
export const transportName = env.VITE_TRIP_TRANSPORT || (env.DEV ? 'demo' : 'formsubmit')

/** Service tiers qui transmet les demandes (mentionné dans la politique de confidentialité). */
export const transportProcessor: string | null =
  ({ formsubmit: 'FormSubmit (formsubmit.co)', formspree: 'Formspree (formspree.io)', supabase: 'Supabase (supabase.com)' } as Record<string, string>)[
    transportName
  ] ?? null

export const sendTripRequest: Transport = (payload) => (transports[transportName] ?? transports.mailto)(payload)
