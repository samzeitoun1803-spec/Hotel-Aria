/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TRIP_TRANSPORT?: 'demo' | 'mailto' | 'formsubmit' | 'formspree' | 'api' | 'supabase' | ''
  readonly VITE_FORMSUBMIT_EMAIL?: string
  readonly VITE_FORMSPREE_ID?: string
  readonly VITE_TRIP_API_URL?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
  readonly VITE_SUPABASE_TABLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
