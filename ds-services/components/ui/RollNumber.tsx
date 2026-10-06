import { cn } from "@/lib/cn";

/** Dix chiffres qui se terminent par la valeur cible : le rouleau défile jusqu'à elle. */
function sequence(target: number): number[] {
  return Array.from({ length: 10 }, (_, i) => (target + i + 1) % 10);
}

/**
 * Nombre à rouleaux (type compteur mécanique).
 * Rendu final par défaut (sans JavaScript ou sans animation) ;
 * ScrollScenes rembobine puis fait défiler les rouleaux à l'entrée dans l'écran.
 */
export function RollNumber({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("roll", className)} data-roll>
      <span className="sr-only">{value}</span>
      <span className="roll-digits" aria-hidden="true">
        {value.split("").map((char, i) =>
          /\d/.test(char) ? (
            <span className="roll-slot" key={i}>
              <span className="roll-col">
                {sequence(Number(char)).map((d, j) => (
                  <span key={j}>{d}</span>
                ))}
              </span>
            </span>
          ) : (
            <span className="roll-char" key={i}>
              {char}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
