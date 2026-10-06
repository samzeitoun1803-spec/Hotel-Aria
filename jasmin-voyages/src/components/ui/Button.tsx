import { motion } from 'framer-motion'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { useMagnetic } from '../../hooks/useMagnetic'
import { cn } from '../../lib/cn'
import { Arrow } from './Arrow'

type Variant = 'ink' | 'ivory' | 'ghost' | 'ghost-light' | 'clay'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  ink: 'bg-ink text-ivory hover:bg-[#1d2a2e]',
  ivory: 'bg-ivory text-ink hover:bg-white',
  clay: 'bg-clay text-paper hover:bg-clay-deep',
  ghost: 'border border-ink/25 text-ink hover:border-ink',
  'ghost-light': 'border border-ivory/35 text-ivory hover:border-ivory',
}

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-[0.875rem] gap-2',
  md: 'h-12 px-[22px] text-[0.98rem] gap-2.5',
  lg: 'h-14 px-7 text-[1.0625rem] gap-3',
}

interface Common {
  variant?: Variant
  size?: Size
  arrow?: boolean | 'left' | 'down' | 'up-right'
  magnetic?: boolean
  children: ReactNode
  className?: string
}

/** Libellé qui « roule » au survol : la ligne monte, sa copie la remplace. */
function Label({ children }: { children: ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">{children}</span>
      <span aria-hidden className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0">
        {children}
      </span>
    </span>
  )
}

function Inner({ children, arrow }: Pick<Common, 'children' | 'arrow'>) {
  return (
    <>
      {arrow === 'left' && <Arrow direction="left" className="text-[1.05em]" />}
      <Label>{children}</Label>
      {arrow && arrow !== 'left' && <Arrow direction={arrow === true ? 'right' : arrow} className="text-[1.05em]" />}
    </>
  )
}

const base =
  'group relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,opacity] duration-300 disabled:opacity-50'

export function PillButton({
  variant = 'ink',
  size = 'md',
  arrow,
  magnetic,
  children,
  className,
  ...rest
}: Common & Omit<ComponentPropsWithoutRef<typeof motion.button>, 'children'>) {
  const mag = useMagnetic()
  return (
    <motion.button
      type="button"
      {...(magnetic ? mag : {})}
      {...rest}
      className={cn(base, variants[variant], sizes[size], className)}
    >
      <Inner arrow={arrow}>{children}</Inner>
    </motion.button>
  )
}

export function PillLink({
  variant = 'ink',
  size = 'md',
  arrow,
  magnetic,
  children,
  className,
  ...rest
}: Common & Omit<ComponentPropsWithoutRef<typeof motion.a>, 'children'>) {
  const mag = useMagnetic()
  return (
    <motion.a {...(magnetic ? mag : {})} {...rest} className={cn(base, variants[variant], sizes[size], className)}>
      <Inner arrow={arrow}>{children}</Inner>
    </motion.a>
  )
}

/** Lien texte souligné, avec flèche. */
export function TextLink({
  children,
  className,
  arrow = true,
  as = 'a',
  ...rest
}: { children: ReactNode; className?: string; arrow?: boolean | 'up-right'; as?: 'a' | 'button' } & Record<string, unknown>) {
  const Tag = as as 'a'
  return (
    <Tag
      {...(as === 'button' ? { type: 'button' } : {})}
      {...rest}
      className={cn('group inline-flex items-center gap-2 font-semibold tracking-[-0.01em]', className)}
    >
      <span className="relative">
        {children}
        <span aria-hidden className="u-line absolute -bottom-0.5 left-0 h-px w-full bg-current" />
      </span>
      {arrow && <Arrow direction={arrow === true ? 'right' : arrow} className="text-[1.05em]" />}
    </Tag>
  )
}

/** Bouton circulaire (menu, fermer, précédent/suivant). */
export function CircleButton({
  children,
  className,
  variant = 'ink',
  ...rest
}: { children: ReactNode; className?: string; variant?: 'ink' | 'ivory' | 'ghost' | 'ghost-light' } & ComponentPropsWithoutRef<'button'>) {
  const v = {
    ink: 'bg-ink text-ivory hover:bg-[#1d2a2e]',
    ivory: 'bg-ivory text-ink hover:bg-white',
    ghost: 'border border-ink/20 text-ink hover:border-ink',
    'ghost-light': 'border border-ivory/30 text-ivory hover:border-ivory',
  }[variant]
  return (
    <button
      type="button"
      {...rest}
      className={cn('group inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300 disabled:opacity-35', v, className)}
    >
      {children}
    </button>
  )
}
