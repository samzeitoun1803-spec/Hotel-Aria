import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface ChipProps {
  selected: boolean
  onClick: () => void
  children: ReactNode
  tone?: 'light' | 'dark'
  size?: 'md' | 'lg'
  className?: string
}

/** Pastille de choix (bouton bascule, `aria-pressed`). */
export function Chip({ selected, onClick, children, tone = 'light', size = 'md', className }: ChipProps) {
  const styles =
    tone === 'light'
      ? selected
        ? 'bg-ink text-ivory border-ink'
        : 'border-ink/18 text-ink hover:border-ink/60 bg-transparent'
      : selected
        ? 'bg-ivory text-ink border-ivory'
        : 'border-ivory/25 text-ivory hover:border-ivory/70'
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-medium tracking-[-0.01em] transition-[background-color,color,border-color] duration-300 ease-[var(--ease-expo)]',
        size === 'lg' ? 'h-14 px-6 text-[1.05rem]' : 'h-11 px-[18px] text-[0.95rem]',
        styles,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'grid place-items-center overflow-hidden transition-[width,opacity] duration-300 ease-[var(--ease-expo)]',
          selected ? 'w-3.5 opacity-100' : 'w-0 opacity-0',
        )}
      >
        <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
          <path d="M2.5 7.4 5.6 10.3 11.5 3.8" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
      {children}
    </button>
  )
}
