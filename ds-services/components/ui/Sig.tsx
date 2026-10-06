import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Signature typographique : le mot en serif italique qui « reçoit l'énergie ».
 * Réservée à quatre titres (hero, intro, services, contact) — voir la stratégie créative.
 *
 * - dans un titre révélé ligne par ligne : passe du cobalt à sa couleur finale ;
 * - `standalone` : se révèle seul, par un balayage cobalt de gauche à droite ;
 * - `energize={false}` : aucune animation pilotée par le scroll (cas du hero, animé en CSS).
 */
export function Sig({
  children,
  energize = true,
  standalone = false,
  className,
}: {
  children: ReactNode;
  energize?: boolean;
  standalone?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("sig", standalone && "sig-standalone", className)}
      data-energize={energize && !standalone ? "" : undefined}
      data-reveal={energize && standalone ? "energize" : undefined}
    >
      {children}
    </span>
  );
}
