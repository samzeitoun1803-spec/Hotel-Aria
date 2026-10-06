import { cn } from '../../lib/cn'

/** Repère éditorial de section : « 02 — Destinations ». */
export function SectionTag({ index, children, className, tone = 'light' }: { index: string; children: string; className?: string; tone?: 'light' | 'dark' }) {
  return (
    <p className={cn('t-meta flex items-center gap-3', tone === 'light' ? 'text-stone' : 'text-mist', className)}>
      <span className={tone === 'light' ? 'text-ink' : 'text-ivory'}>{index}</span>
      <span aria-hidden className={cn('h-px w-8', tone === 'light' ? 'bg-ink/30' : 'bg-ivory/30')} />
      <span>{children}</span>
    </p>
  )
}
