import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ease } from '../../lib/motion'

interface MaskTextProps {
  lines: ReactNode[]
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span'
  className?: string
  lineClassName?: string
  delay?: number
  stagger?: number
  duration?: number
  /** 'view' : à l'entrée dans le viewport (Framer Motion). 'mount' : dès le premier affichage (animation CSS, sans attendre le JS). */
  trigger?: 'view' | 'mount'
  id?: string
}

/** Révélation ligne par ligne, chaque ligne glisse hors de son masque. */
export function MaskText({
  lines,
  as = 'div',
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  duration = 1.1,
  trigger = 'view',
  id,
}: MaskTextProps) {
  if (trigger === 'mount') {
    const Plain = as
    return (
      <Plain id={id} className={className}>
        {lines.map((line, i) => (
          <span key={i} className={cn('line-mask', lineClassName)}>
            <span className="a-rise block" style={{ animationDelay: `${delay + i * stagger}s`, animationDuration: `${duration}s` }}>
              {line}
            </span>
          </span>
        ))}
      </Plain>
    )
  }

  const Tag = motion[as]
  return (
    <Tag
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {lines.map((line, i) => (
        <span key={i} className={cn('line-mask', lineClassName)}>
          <motion.span
            data-mask-line
            className="block will-change-transform"
            variants={{
              hidden: { y: '108%' },
              show: { y: '0%', transition: { duration, ease: ease.expo } },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
