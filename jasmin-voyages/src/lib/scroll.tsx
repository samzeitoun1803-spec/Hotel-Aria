import Lenis from 'lenis'
import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMedia'

interface ScrollApi {
  /** Défile jusqu'à un id de section, ou une position en px. */
  scrollTo: (target: string | number, opts?: { offset?: number; immediate?: boolean }) => void
  /** Bloque / débloque le défilement (menus, dialogues). */
  lock: (locked: boolean) => void
}

const ScrollContext = createContext<ScrollApi>({ scrollTo: () => {}, lock: () => {} })

export const useScrollApi = () => useContext(ScrollContext)

export function ScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const lenisRef = useRef<Lenis | null>(null)
  const locks = useRef(0)

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ autoRaf: true, lerp: 0.11, wheelMultiplier: 0.95, anchors: false, allowNestedScroll: true })
    lenisRef.current = lenis
    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = useCallback<ScrollApi['scrollTo']>(
    (target, opts = {}) => {
      const offset = opts.offset ?? 0
      let y: number
      if (typeof target === 'number') y = target
      else {
        const el = document.getElementById(target)
        if (!el) return
        y = el.getBoundingClientRect().top + window.scrollY
      }
      y += offset
      // Une image plus tard : laisse un menu ou un dialogue libérer le défilement d'abord.
      requestAnimationFrame(() => {
        const lenis = lenisRef.current
        if (lenis && !opts.immediate) {
          lenis.scrollTo(y, { duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4), force: true })
        } else {
          window.scrollTo({ top: y, behavior: opts.immediate || reduced ? 'auto' : 'smooth' })
        }
      })
      if (typeof target === 'string') history.replaceState(null, '', `#${target}`)
    },
    [reduced],
  )

  const lock = useCallback((locked: boolean) => {
    locks.current = Math.max(0, locks.current + (locked ? 1 : -1))
    const isLocked = locks.current > 0
    document.documentElement.style.overflow = isLocked ? 'hidden' : ''
    if (isLocked) lenisRef.current?.stop()
    else lenisRef.current?.start()
  }, [])

  // Liens d'ancrage internes (#section) : défilement fluide, focus de la cible pour l'accessibilité.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = a.getAttribute('href')!.slice(1)
      if (!id) return
      const el = document.getElementById(id)
      if (!el) return
      e.preventDefault()
      scrollTo(id)
      window.setTimeout(() => {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
        el.focus({ preventScroll: true })
      }, 900)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [scrollTo])

  // Arrivée sur une URL avec ancre
  useEffect(() => {
    const id = window.location.hash.slice(1)
    if (id) window.setTimeout(() => scrollTo(id, { immediate: true }), 120)
  }, [scrollTo])

  return <ScrollContext.Provider value={{ scrollTo, lock }}>{children}</ScrollContext.Provider>
}

/** Verrouille le défilement tant que `active` est vrai. */
export function useScrollLock(active: boolean) {
  const { lock } = useScrollApi()
  useEffect(() => {
    if (!active) return
    lock(true)
    return () => lock(false)
  }, [active, lock])
}
