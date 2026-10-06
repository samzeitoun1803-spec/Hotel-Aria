import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  /** Compteur affiché entre parenthèses, ex. (04) */
  count?: string;
  /**
   * Accroche l'eyebrow au rail (la colonne montante) par un nœud et une dérivation.
   * À n'utiliser que pour un eyebrow aligné sur le bord gauche du contenu.
   */
  node?: boolean;
  as?: "p" | "span" | "div" | "h2";
  className?: string;
  id?: string;
};

export function Eyebrow({ children, count, node = false, as: Tag = "p", className, id }: EyebrowProps) {
  return (
    <Tag id={id} className={cn("eyebrow t-eyebrow", node && "has-node", className)} data-node={node ? "" : undefined}>
      {node ? (
        <>
          <span className="eyebrow-node" aria-hidden="true" />
          <span className="eyebrow-tick" aria-hidden="true" />
        </>
      ) : null}
      <span>{children}</span>
      {count ? <span className="eyebrow-count">({count})</span> : null}
    </Tag>
  );
}
