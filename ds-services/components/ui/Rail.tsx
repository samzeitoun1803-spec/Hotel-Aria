import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type RailProps = {
  /** Décalage du départ (ex. "var(--hero-line)") — par défaut le haut de la section */
  top?: string;
  /** Décalage de la fin — par défaut le bas de la section */
  bottom?: string;
  /** Termine la colonne par un symbole de terre (fin de circuit) */
  terminal?: boolean;
  className?: string;
};

/**
 * Segment de « la colonne » — la ligne de courant qui traverse le site.
 * Chaque section en porte un segment aligné sur le même axe ; la portion
 * déjà parcourue au scroll passe « sous tension » (voir ScrollScenes).
 */
export function Rail({ top, bottom, terminal = false, className }: RailProps) {
  const style: CSSProperties = {};
  if (top) style.top = top;
  if (bottom) style.bottom = bottom;
  return (
    <div className={cn("rail", className)} style={style} data-rail aria-hidden="true">
      <span className="rail-base" />
      <span className="rail-live" />
      {terminal ? (
        <svg className="rail-terminal" width="15" height="10" viewBox="0 0 15 10">
          <path d="M0.5 0.5h14M3 4.5h9M5.5 8.5h4" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      ) : null}
    </div>
  );
}
