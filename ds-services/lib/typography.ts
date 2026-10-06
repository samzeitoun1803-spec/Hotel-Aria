/**
 * Typographie française.
 * Espace fine insécable (U+202F) avant « ? », « ! », « ; » et dans les nombres,
 * espace insécable (U+00A0) avant « : » et à l'intérieur des guillemets.
 */
export const NNBSP = " ";
export const NBSP = " ";

/** Applique les espaces insécables de la typographie française à une chaîne. */
export function fr(text: string): string {
  return text
    .replace(/ ([?!;])/g, `${NNBSP}$1`)
    .replace(/ :/g, `${NBSP}:`)
    .replace(/« /g, `«${NBSP}`)
    .replace(/ »/g, `${NBSP}»`);
}
