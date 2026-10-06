import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMedia'

/**
 * Curseur compagnon (bureau uniquement).
 * Le curseur natif reste visible : ce cercle le suit avec un léger retard et
 * se transforme en bulle de libellé sur les éléments marqués `data-cursor="…"`.
 */
export function Cursor() {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const sx = useSpring(x, { stiffness: 380, damping: 34, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 380, damping: 34, mass: 0.5 })

  const [label, setLabel] = useState<string | null>(null)
  const [mode, setMode] = useState<'idle' | 'link' | 'hidden'>('hidden')
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (!enabled) return
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target as HTMLElement | null
      const labelled = t?.closest<HTMLElement>('[data-cursor]')
      const field = t?.closest('input, textarea, select, iframe, [data-cursor-hide]')
      const link = t?.closest('a, button, [role="button"], label')
      setLabel(labelled?.dataset.cursor ?? null)
      setMode(field ? 'hidden' : link ? 'link' : 'idle')
      setDark(!!t?.closest('[data-theme="dark"]'))
    }
    const onLeave = () => setMode('hidden')
    const onDown = () => setLabel(null)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [enabled, x, y])

  if (!enabled) return null

  const size = label ? 92 : mode === 'link' ? 10 : 34
  const ring = dark ? 'rgba(246,242,235,0.55)' : 'rgba(12,18,20,0.4)'

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[90]" style={{ x: sx, y: sy }}>
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        animate={{
          width: size,
          height: size,
          opacity: mode === 'hidden' && !label ? 0 : 1,
          backgroundColor: label ? '#f6f2eb' : mode === 'link' ? (dark ? '#f6f2eb' : '#0c1214') : 'rgba(0,0,0,0)',
          borderColor: label || mode === 'link' ? 'rgba(0,0,0,0)' : ring,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ borderWidth: 1, borderStyle: 'solid' }}
      >
        <AnimatePresence>
          {label && (
            <motion.span
              key={label}
              className="t-meta text-[0.72rem] text-ink"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
