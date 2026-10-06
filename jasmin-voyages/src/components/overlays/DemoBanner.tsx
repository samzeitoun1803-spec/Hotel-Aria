import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ease } from '../../lib/motion'

type Notice = { kind: 'tel' | 'mail'; value: string }

/** +33663382200 → 06 63 38 22 00 */
const frenchNumber = (raw: string) => {
  const digits = raw.replace(/[^\d+]/g, '').replace(/^\+33/, '0')
  return /^0\d{9}$/.test(digits) ? digits.replace(/(\d{2})(?=\d)/g, '$1 ') : raw
}

/**
 * Maquette uniquement : bandeau permanent « Maquette » en haut de l'écran,
 * et explication des boutons d'appel et d'e-mail (la page de présentation ne peut pas les ouvrir de façon fiable).
 */
export function DemoBanner() {
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="tel:"], a[href^="mailto:"]')
      if (!a) return
      e.preventDefault()
      const href = a.getAttribute('href') ?? ''
      setNotice(
        href.startsWith('tel:')
          ? { kind: 'tel', value: frenchNumber(href.slice(4)) }
          : { kind: 'mail', value: decodeURIComponent(href.slice(7).split('?')[0]) },
      )
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 7000)
    return () => window.clearTimeout(t)
  }, [notice])

  return (
    <>
      <div
        data-demo-bar
        role="note"
        aria-label="Maquette non officielle"
        className="fixed inset-x-0 top-0 z-[55] flex h-[var(--demo-bar)] items-end justify-center bg-ink px-4 pt-[env(safe-area-inset-top,0px)] text-ivory/75"
      >
        <p className="flex h-8 min-w-0 items-center gap-2.5 text-[0.75rem] leading-none sm:text-[0.78rem]">
          <strong className="t-meta shrink-0 text-[0.64rem] text-ivory">Maquette</strong>
          <span aria-hidden className="h-3 w-px shrink-0 bg-ivory/25" />
          <span className="truncate sm:hidden">Non officielle · rien n’est envoyé</span>
          <span className="hidden truncate sm:inline lg:hidden">Proposition de site non officielle · avis fictifs · rien n’est envoyé</span>
          <span className="hidden truncate lg:inline">
            Proposition de site pour Jasmin Voyages · version non officielle · avis fictifs · le formulaire n’envoie aucune donnée
          </span>
        </p>
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-[95] flex justify-center lg:bottom-6">
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.kind + notice.value}
              role="status"
              className="pointer-events-auto flex w-full max-w-[30rem] items-start gap-4 rounded-[1.75rem] border border-ivory/15 bg-ink px-6 py-5 text-ivory"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.5, ease: ease.expo }}
            >
              <div className="min-w-0 flex-1">
                <p className="t-meta text-[0.66rem] text-clay-soft">Maquette</p>
                <p className="mt-2 text-[0.95rem] leading-[1.5] text-ivory/80">
                  {notice.kind === 'tel'
                    ? 'Sur le site en ligne, ce bouton appelle directement l’agence :'
                    : 'Sur le site en ligne, ce bouton ouvre un e-mail à l’agence :'}
                </p>
                <p className="mt-1 select-all break-words font-display text-[1.25rem] font-bold tracking-[-0.02em]">{notice.value}</p>
              </div>
              <button
                type="button"
                onClick={() => setNotice(null)}
                aria-label="Fermer"
                className="-mr-2 -mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
