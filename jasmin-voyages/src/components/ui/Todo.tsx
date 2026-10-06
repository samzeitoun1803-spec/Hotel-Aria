import { cn } from '../../lib/cn'

/** Information manquante, à fournir par l'agence — volontairement visible pour la relecture. */
export function Todo({ children = 'à compléter', className }: { children?: string; className?: string }) {
  return (
    <span className={cn('todo', className)} title="Information à fournir par l’agence (voir A-COMPLETER.md)">
      {children}
    </span>
  )
}
