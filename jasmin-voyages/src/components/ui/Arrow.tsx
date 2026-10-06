import { cn } from '../../lib/cn'

/** Flèche éditoriale. Dans un parent `.group`, elle « repart » au survol. */
export function Arrow({ className, direction = 'right' }: { className?: string; direction?: 'right' | 'left' | 'up' | 'down' | 'up-right' }) {
  const rotate = { right: '', left: 'rotate-180', up: '-rotate-90', down: 'rotate-90', 'up-right': '-rotate-45' }[direction]
  return (
    <span aria-hidden className={cn('relative inline-flex h-[1em] w-[1em] shrink-0 overflow-hidden', rotate, className)}>
      <svg viewBox="0 0 20 20" className="absolute inset-0 h-full w-full transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-[120%] group-focus-visible:translate-x-[120%]">
        <path d="M3 10h13M11 4.5 16.5 10 11 15.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
      <svg viewBox="0 0 20 20" className="absolute inset-0 h-full w-full -translate-x-[120%] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-x-0 group-focus-visible:translate-x-0">
        <path d="M3 10h13M11 4.5 16.5 10 11 15.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    </span>
  )
}
