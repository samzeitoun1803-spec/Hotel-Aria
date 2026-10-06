import { useMotionValue, useSpring } from 'framer-motion'
import { useCallback, type PointerEvent } from 'react'
import { useFinePointer, usePrefersReducedMotion } from './useMedia'

/** Effet magnétique discret : l'élément suit le pointeur de quelques pixels. */
export function useMagnetic(strength = 0.28, max = 10) {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.6 })
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.6 })

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => {
      if (!enabled) return
      const r = e.currentTarget.getBoundingClientRect()
      const dx = (e.clientX - (r.left + r.width / 2)) * strength
      const dy = (e.clientY - (r.top + r.height / 2)) * strength
      mx.set(Math.max(-max, Math.min(max, dx)))
      my.set(Math.max(-max, Math.min(max, dy)))
    },
    [enabled, strength, max, mx, my],
  )
  const onPointerLeave = useCallback(() => {
    mx.set(0)
    my.set(0)
  }, [mx, my])

  return { style: enabled ? { x, y } : undefined, onPointerMove, onPointerLeave }
}
