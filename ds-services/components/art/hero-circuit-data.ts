import { PULSE_SPEED } from "@/lib/motion";

/* ──────────────────────────────────────────────────────────────────────
 * Circuit du hero — « schéma de principe, sans échelle ».
 * Un plan d'appartement abstrait (murs doubles, cloisons, portes, axes)
 * sur lequel courent quatre circuits (C1–C4) depuis une source.
 *
 * Tout est décrit par des données : les longueurs, les instants de départ
 * et d'arrivée de l'impulsion sont calculés ici, puis transmis au CSS
 * (variables) pour une animation d'intro indépendante de l'hydratation.
 * ────────────────────────────────────────────────────────────────────── */

export type Pt = [number, number];

export type CircuitDef = {
  id: string;
  points: Pt[];
  /** Départ (s) ou départ depuis un autre circuit, à une distance donnée le long de celui-ci. */
  start: number | { from: string; distance: number };
  label?: { text: string; dx: number; dy: number; anchor?: "start" | "end" };
  /** Nœuds de dérivation intermédiaires (distance le long du tracé). */
  taps?: number[];
  /** Le tracé se termine par un point d'usage (nœud terminal). */
  terminal?: boolean;
  /** Survolable (micro-impulsion au passage du curseur). */
  interactive?: boolean;
  /** Le tracé sort du dessin (vers le cartouche) : pas de nœud terminal. */
  exit?: boolean;
};

type Plan = {
  walls: string[];
  partitions: string[];
  doors: string[];
  glazing: string[];
  axes?: { x: number[]; y: number[]; labelsX: string[]; labelsY: string[]; extent: [number, number, number, number] };
  panel: { x: number; y: number; w: number; h: number };
  source: Pt;
  sourceLabel: { text: string; x: number; y: number; anchor?: "start" | "end" };
  caption?: { text: string; x: number; y: number };
};

export type Variant = {
  viewBox: [number, number];
  speed: number;
  pulse: number;
  plan: Plan;
  circuits: CircuitDef[];
};

/* ── Géométrie ───────────────────────────────────────────────────────── */

export const DESKTOP: Variant = {
  viewBox: [760, 640],
  speed: PULSE_SPEED,
  pulse: 64,
  plan: {
    walls: [
      // mur extérieur (double trait), percé d'une entrée et de deux fenêtres
      "M60 60H150M290 60H700V120M700 220V580H296M236 580H60V60",
      "M68 68H150M290 68H692V120M692 220V572H296M236 572H68V68",
      // tableaux de baie / jambages
      "M150 60V68M290 60V68M692 120H700M692 220H700M236 572V580M296 572V580",
    ],
    glazing: ["M150 64H290", "M696 120V220"],
    partitions: [
      "M400 68V150M400 200V420M400 470V572",
      "M400 300H560M610 300H692",
      "M68 360H170M220 360H400",
    ],
    doors: [
      "M220 360V310", "M220 310A50 50 0 0 0 170 360",
      "M400 470H450", "M450 470A50 50 0 0 0 400 420",
      "M610 300V250", "M610 250A50 50 0 0 0 560 300",
    ],
    axes: {
      x: [60, 400, 700],
      y: [60, 330, 580],
      labelsX: ["A", "B", "C"],
      labelsY: ["1", "2", "3"],
      extent: [40, 612, 40, 736],
    },
    panel: { x: 100, y: 505, w: 40, h: 22 },
    source: [120, 505],
    sourceLabel: { text: "SOURCE", x: 148, y: 549 },
    caption: { text: "PL. 01 — SCHÉMA DE PRINCIPE, SANS ÉCHELLE", x: 700, y: 622 },
  },
  circuits: [
    { id: "t0", points: [[120, 505], [120, 430]], start: 0.4 },
    {
      id: "c1",
      points: [[120, 430], [120, 170], [270, 170]],
      start: { from: "t0", distance: 75 },
      taps: [180],
      terminal: true,
      interactive: true,
      label: { text: "C1", dx: 12, dy: -12 },
    },
    {
      id: "c2",
      points: [[120, 430], [330, 430], [330, 240], [530, 240], [530, 140], [620, 140]],
      start: { from: "t0", distance: 75 },
      taps: [210, 600],
      terminal: true,
      interactive: true,
      label: { text: "C2", dx: 12, dy: -12 },
    },
    {
      id: "c3",
      points: [[330, 430], [330, 510], [560, 510], [560, 410], [630, 410]],
      start: { from: "c2", distance: 210 },
      taps: [310],
      terminal: true,
      interactive: true,
      label: { text: "C3", dx: 12, dy: -12 },
    },
    {
      id: "c4",
      points: [[140, 516], [200, 516], [200, 470], [250, 470]],
      start: 0.4,
      terminal: true,
      interactive: true,
      label: { text: "C4", dx: 12, dy: -12 },
    },
    { id: "feed", points: [[120, 527], [120, 640]], start: 0.4, exit: true },
  ],
};

export const MOBILE: Variant = {
  viewBox: [360, 250],
  speed: 430,
  pulse: 34,
  plan: {
    walls: [
      "M16 16H344V236H160M120 236H16V16",
      "M22 22H338V230H160M120 230H22V22",
      "M120 230V236M160 230V236",
    ],
    glazing: [],
    partitions: ["M190 22V90M190 125V230", "M22 130H70M105 130H190"],
    doors: ["M105 130V95", "M105 95A35 35 0 0 0 70 130"],
    panel: { x: 40, y: 185, w: 26, h: 14 },
    source: [53, 185],
    sourceLabel: { text: "SOURCE", x: 74, y: 214 },
  },
  circuits: [
    { id: "t0", points: [[53, 185], [53, 160]], start: 0.4 },
    {
      id: "c1",
      points: [[53, 160], [53, 60], [140, 60]],
      start: { from: "t0", distance: 25 },
      terminal: true,
      label: { text: "C1", dx: 9, dy: -9 },
    },
    {
      id: "c2",
      points: [[53, 160], [240, 160], [240, 70], [300, 70]],
      start: { from: "t0", distance: 25 },
      taps: [187],
      terminal: true,
      label: { text: "C2", dx: 9, dy: -9 },
    },
    {
      id: "c3",
      points: [[240, 160], [240, 205], [305, 205]],
      start: { from: "c2", distance: 187 },
      terminal: true,
      label: { text: "C3", dx: 9, dy: -9 },
    },
  ],
};

/* ── Calculs ─────────────────────────────────────────────────────────── */

function polyLength(points: Pt[]): number {
  let l = 0;
  for (let i = 1; i < points.length; i++) {
    l += Math.abs(points[i][0] - points[i - 1][0]) + Math.abs(points[i][1] - points[i - 1][1]);
  }
  return l;
}

function pointAt(points: Pt[], distance: number): Pt {
  let rest = distance;
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    const seg = Math.abs(x1 - x0) + Math.abs(y1 - y0);
    if (rest <= seg) {
      const t = seg === 0 ? 0 : rest / seg;
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
    }
    rest -= seg;
  }
  return points[points.length - 1];
}

function toPath(points: Pt[]): string {
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("");
}

export type Resolved = CircuitDef & {
  d: string;
  length: number;
  startAt: number;
  duration: number;
  pulseDuration: number;
  nodes: { x: number; y: number; t: number; kind: "tap" | "end" }[];
};

function resolve(variant: Variant): Resolved[] {
  const byId = new Map(variant.circuits.map((c) => [c.id, c]));
  const startCache = new Map<string, number>();
  const startOf = (c: CircuitDef): number => {
    const cached = startCache.get(c.id);
    if (cached !== undefined) return cached;
    const value =
      typeof c.start === "number"
        ? c.start
        : startOf(byId.get(c.start.from)!) + c.start.distance / variant.speed;
    startCache.set(c.id, value);
    return value;
  };

  return variant.circuits.map((c) => {
    const length = polyLength(c.points);
    const startAt = startOf(c);
    const duration = length / variant.speed;
    const nodes: Resolved["nodes"] = (c.taps ?? []).map((distance) => {
      const [x, y] = pointAt(c.points, distance);
      return { x, y, t: startAt + distance / variant.speed, kind: "tap" as const };
    });
    if (c.terminal) {
      const [x, y] = c.points[c.points.length - 1];
      nodes.push({ x, y, t: startAt + duration, kind: "end" });
    }
    return {
      ...c,
      d: toPath(c.points),
      length,
      startAt,
      duration,
      pulseDuration: (length + variant.pulse) / variant.speed,
      nodes,
    };
  });
}

export const RESOLVED = { desktop: resolve(DESKTOP), mobile: resolve(MOBILE) };

/** Instant (s) où l'impulsion quitte le dessin vers le cartouche (desktop). */
export const FEED_ARRIVAL = (() => {
  const feed = RESOLVED.desktop.find((c) => c.id === "feed")!;
  return feed.startAt + feed.duration;
})();

/** Position horizontale relative de la sortie vers le cartouche (desktop). */
export const FEED_X_RATIO = 120 / DESKTOP.viewBox[0];

