import type { ServiceId } from "@/data/services";

/**
 * Glyphes schématiques propres à chaque domaine d'intervention.
 * Ils se tracent au survol de la ligne de service (voir .svc-row dans globals.css).
 *  01 installation  — une dérivation nouvelle se crée sur la ligne
 *  02 rénovation    — un tronçon ancien (pointillé) est remplacé
 *  03 mise à niveau — la ligne monte d'un palier à l'autre
 *  04 intervention  — un point d'intervention précis sur la ligne
 */

type GlyphDef = { base: string[]; draw: string[]; nodes: [number, number][]; extra?: "ring" };

const glyphs: Record<ServiceId, GlyphDef> = {
  installation: {
    base: ["M8 24H80"],
    draw: ["M56 24V8"],
    nodes: [
      [8, 24],
      [80, 24],
      [56, 8],
    ],
  },
  renovation: {
    base: ["M8 24H30", "M62 24H80"],
    draw: ["M30 24H62"],
    nodes: [
      [8, 24],
      [80, 24],
    ],
  },
  "mise-a-niveau": {
    base: [],
    draw: ["M8 32H30V22H52V12H80"],
    nodes: [
      [8, 32],
      [80, 12],
    ],
  },
  intervention: {
    base: ["M8 24H80"],
    draw: [],
    nodes: [
      [8, 24],
      [80, 24],
    ],
    extra: "ring",
  },
};

export function ServiceGlyph({ id }: { id: ServiceId }) {
  const g = glyphs[id];
  return (
    <svg className="glyph" viewBox="0 0 88 40" width="88" height="40" fill="none" aria-hidden="true" focusable="false">
      {id === "renovation" ? <path d="M30 24H62" className="glyph-old" /> : null}
      {g.base.map((d) => (
        <path key={d} d={d} className="glyph-base" />
      ))}
      {g.draw.map((d) => (
        <path key={d} d={d} className="glyph-draw" pathLength={1} />
      ))}
      {g.extra === "ring" ? (
        <>
          <circle cx="44" cy="24" r="7" className="glyph-ring" pathLength={1} />
          <circle cx="44" cy="24" r="2.2" className="glyph-node glyph-node-mid" />
        </>
      ) : null}
      {g.nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.6" className="glyph-node" />
      ))}
    </svg>
  );
}
