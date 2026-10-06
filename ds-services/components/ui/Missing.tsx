import { cn } from "@/lib/cn";

/**
 * Placeholder visible et centralisé pour toute information non encore fournie
 * par DS SERVICES (téléphone, e-mail, mentions légales…).
 * Rechercher « [À compléter] » ou lancer `npm run check:content` pour les retrouver.
 */
export function Missing({ label, className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn("missing", className)}
      title={label ? `${label} — information à fournir par DS SERVICES` : "Information à fournir par DS SERVICES"}
    >
      [À compléter]
    </span>
  );
}
