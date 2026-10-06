/**
 * Scènes illustrées de Jasmin Voyages.
 * Chaque scène est carrée (S × S) et garde son sujet au centre :
 * elle peut être recadrée en paysage (bureau) comme en portrait (mobile).
 */
import {
  S,
  acacia,
  blurFilter,
  blossomBranch,
  bump,
  cloud,
  cloudRow,
  giraffe,
  haze,
  leaf,
  linear,
  pagoda,
  palm,
  pine,
  poly,
  radial,
  range,
  ridge,
  rng,
  ripples,
  shimmer,
  sky,
  smooth,
  stars,
  streaks,
  sum,
  sun,
  taper,
  toBottom,
} from './lib.mjs'

/** Assemble des morceaux ({defs, body} ou chaîne) en un SVG. */
function svg(...parts) {
  let defs = ''
  let body = ''
  for (const p of parts.flat()) {
    if (!p) continue
    if (typeof p === 'string') body += p
    else {
      defs += p.defs || ''
      body += p.body || ''
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}"><defs>${defs}</defs>${body}</svg>`
}

/** Hauteur d'une ligne de crête à l'abscisse x. */
function yAt(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) {
    if (pts[i][0] <= x && pts[i + 1][0] >= x) {
      const t = (x - pts[i][0]) / (pts[i + 1][0] - pts[i][0])
      return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t
    }
  }
  return pts.at(-1)[1]
}

const fill = (pts, color, smoothIt = true) => `<path d="${toBottom(smoothIt ? smooth(pts) : poly(pts), pts)}" fill="${color}"/>`

/* ════════════════════════════════════════════════════════════════
   HERO — au-dessus des nuages, à l'heure dorée (vu du hublot)
   ════════════════════════════════════════════════════════════════ */
function heroScene(sx, sy) {
  const rows = [
    { y: 1335, rMin: 24, rMax: 46, light: '#f4dcbd', shade: '#d9c3ae' },
    { y: 1405, rMin: 34, rMax: 70, light: '#f6dfc0', shade: '#cbb6a6' },
    { y: 1505, rMin: 52, rMax: 104, light: '#f8e2c3', shade: '#b9aba3' },
    { y: 1650, rMin: 80, rMax: 150, light: '#f7e0c2', shade: '#a59fa2' },
    { y: 1850, rMin: 115, rMax: 215, light: '#f3dcbf', shade: '#928f99' },
    { y: 2110, rMin: 160, rMax: 290, light: '#ecd5bb', shade: '#807f8c' },
    { y: 2420, rMin: 210, rMax: 380, light: '#e4cfb8', shade: '#6f7080' },
  ]
  return svg(
    sky('hs', [
      [0, '#26394c'],
      [0.25, '#4f6c80'],
      [0.43, '#9aa9aa'],
      [0.51, '#d6c8b0'],
      [0.56, '#f0cfa2'],
      [1, '#f3cf9f'],
    ]),
    streaks(11, 'hci', { y: 470, n: 6, h: 18, color: '#eae4d6', opacity: 0.55, blur: 22, spreadY: 260 }),
    streaks(12, 'hci2', { y: 860, n: 5, h: 14, color: '#f6e2c4', opacity: 0.5, blur: 16, spreadY: 160 }),
    sun('hsun', sx, sy, 88, '#fff5df', '#ffe1b0', 1150, 0.8),
    // Alpes au loin, au-dessus de la mer de nuages
    range(31, '#a3a7aa', { y: 1300, amp: 170, rough: 0.56, levels: 7, x0: 1450, x1: 2600, shape: sum(bump(1930, 170, 130), bump(2230, 120, 80)) }),
    haze('hh1', 1080, 1345, '#f2d4ad', 0, 0.7),
    ...rows.map((r, i) => cloudRow(100 + i, `hr${i}`, { ...r, blur: 2 + i * 1.2 })),
    {
      defs: radial('hglow', [
        [0, '#ffe3b8', 0.32],
        [0.45, '#ffe3b8', 0.06],
        [1, '#ffe3b8', 0],
      ], { cx: sx, cy: sy, r: 1400, units: 'userSpaceOnUse' }),
      body: `<rect width="${S}" height="${S}" fill="url(#hglow)"/>`,
    },
  )
}

/** Paysage (bureau) : le soleil se couche dans le hublot, juste au-dessus du mot-symbole. */
const hero = () => heroScene(1030, 1205)
/** Portrait (mobile) : le soleil se place dans le hublot, en haut à droite de l'écran. */
const heroPortrait = () => heroScene(1420, 720)

/* ════════════════════════════════════════════════════════════════
   JAPON — le Fuji au crépuscule, un lac, une pagode, un cerisier
   ════════════════════════════════════════════════════════════════ */
function fujiShape(fx, fy) {
  return `M${fx - 1050},${fy} C${fx - 600},${fy - 120} ${fx - 230},${fy - 560} ${fx - 92},${fy - 720} L${fx - 50},${fy - 710} L${fx - 18},${fy - 726} L${fx + 26},${fy - 712} L${fx + 92},${fy - 722} C${fx + 230},${fy - 560} ${fx + 600},${fy - 120} ${fx + 1050},${fy} Z`
}

function fujiCap(fx, fy, seed) {
  const r = rng(seed)
  const capH = 235
  const halfW = 92 + capH * 0.8
  const pts = []
  for (let i = 0; i <= 18; i++) {
    const t = i / 18
    const x = fx - halfW + t * 2 * halfW
    const finger = i % 2 === 0 ? r() * 25 : 30 + r() * 75
    pts.push([x, fy - 720 + capH * (0.82 + 0.18 * Math.sin(Math.PI * t)) + finger * Math.sin(Math.PI * t) ** 0.6])
  }
  return `M${fx - 92},${fy - 720} L${fx - 50},${fy - 710} L${fx - 18},${fy - 726} L${fx + 26},${fy - 712} L${fx + 92},${fy - 722} L${fx + halfW},${pts.at(-1)[1]} ${poly(pts.reverse()).replace('M', 'L')} Z`
}

function treeCluster(seed, cx, cy, w, color) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < 7; i++) {
    const x = cx + (r() - 0.5) * w
    const rad = w * (0.12 + r() * 0.14)
    out += `<circle cx="${x.toFixed(1)}" cy="${(cy - rad * 0.6 - r() * w * 0.08).toFixed(1)}" r="${rad.toFixed(1)}"/>`
  }
  return `<g fill="${color}">${out}</g>`
}

function japon() {
  const fx = 1300
  const fy = 1640
  const lake = 1700
  const hill1 = ridge(21, { y: 1650, amp: 120, rough: 0.5, levels: 6 })
  const hill2 = ridge(22, { y: 1880, amp: 110, rough: 0.5, levels: 6, x1: 1500, shape: sum(bump(560, 380, 400), bump(120, 240, 160), (x) => (x > 900 ? (x - 900) * 0.9 : 0)) })
  const px = 600
  const py = yAt(hill2, px) + 10
  const mirror = (content) => `<g transform="translate(0 ${2 * lake}) scale(1 -1)" opacity="0.38" filter="url(#jrb)">${content}</g>`
  const fujiBody = `<path d="${fujiShape(fx, fy)}" fill="#6a5a6c"/><path d="${fujiCap(fx, fy, 7)}" fill="#f1e2de"/>`

  return svg(
    sky('js', [
      [0, '#28232f'],
      [0.3, '#56435a'],
      [0.5, '#9c6c75'],
      [0.62, '#d49888'],
      [0.7, '#e9bfa3'],
      [1, '#e9bfa3'],
    ]),
    { defs: '<filter id="jrb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3 9"/></filter>' },
    sun('jsun', 1640, 1250, 170, '#f5b49d', '#f6c1a6', 850, 0.5),
    streaks(41, 'jst', { y: 820, n: 6, h: 22, color: '#c48f93', opacity: 0.55, blur: 14, spreadY: 220 }),
    streaks(42, 'jst2', { y: 1080, n: 4, h: 16, color: '#e7b3a3', opacity: 0.5, blur: 12, spreadY: 120 }),
    fujiBody,
    `<path d="M${fx + 92},${fy - 722} L${fx + 92 + 235 * 0.8},${fy - 720 + 235 * 0.85} L${fx + 120},${fy - 520} Z" fill="#d7c1c2" opacity="0.9"/>`,
    haze('jh1', 1300, 1700, '#e1ae99', 0, 0.55),
    fill(hill1, '#5b4859'),
    // Le lac reflète le ciel, le Fuji et le soleil
    {
      defs: linear('jlake', [
        [0, '#d9a191'],
        [0.25, '#9a6d77'],
        [1, '#2d2533'],
      ]),
      body: `<rect x="0" y="${lake}" width="${S}" height="${S - lake}" fill="url(#jlake)"/>`,
    },
    mirror(fujiBody),
    shimmer(43, { cx: 1640, y0: lake + 10, y1: 2300, spread: 150, n: 120, color: '#f8c9ad', maxW: 130, opacity: 0.6 }),
    ripples(44, { y0: lake + 6, y1: S, n: 90, color: '#f3d2c4', opacity: 0.16 }),
    `<rect x="0" y="${lake - 3}" width="${S}" height="4" fill="#f0c7b0" opacity="0.5"/>`,
    fill(hill2, '#3a2f3f'),
    treeCluster(51, px - 230, yAt(hill2, px - 230) + 18, 200, '#2c2430'),
    treeCluster(52, px + 230, yAt(hill2, px + 230) + 18, 220, '#2c2430'),
    pagoda(px, py, 0.78, '#211a24'),
    // rive au premier plan
    fill(ridge(24, { y: 2270, amp: 60, levels: 6 }), '#1c161f'),
    blossomBranch(5, { x: S + 80, y: 60, len: 900, angle: 2.55, color: '#1c161e', petals: '#f6d3d6', petals2: '#e6a6b3' }),
  )
}

/* ── Aides locales ────────────────────────────────────────────── */

const r1 = (n) => Math.round(n * 10) / 10

/** Bosses de canopée le long d'une crête (jungle, forêts). */
function canopy(seed, pts, color, size = 60) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < pts.length; i += 2) {
    const [x, y] = pts[i]
    const rad = size * (0.6 + r() * 0.8)
    out += `<circle cx="${r1(x)}" cy="${r1(y + rad * 0.35)}" r="${r1(rad)}"/>`
  }
  return `<g fill="${color}">${out}<path d="${toBottom(smooth(pts), pts)}"/></g>`
}

/** Miroir vertical d'un groupe autour d'une ligne d'eau. */
const mirror = (y, content, opacity = 0.35, filter = '') =>
  `<g transform="translate(0 ${2 * y}) scale(1 -1)" opacity="${opacity}"${filter ? ` filter="url(#${filter})"` : ''}>${content}</g>`

/** Oiseaux au loin. */
function birds(seed, { x, y, n = 5, spread = 260, size = 18, color = '#000', opacity = 0.7 }) {
  const r = rng(seed)
  let d = ''
  for (let i = 0; i < n; i++) {
    const bx = x + (r() - 0.5) * spread
    const by = y + (r() - 0.5) * spread * 0.4
    const s = size * (0.6 + r() * 0.6)
    d += ` M${r1(bx - s)},${r1(by)} Q${r1(bx - s * 0.5)},${r1(by - s * 0.55)} ${r1(bx)},${r1(by)} Q${r1(bx + s * 0.5)},${r1(by - s * 0.55)} ${r1(bx + s)},${r1(by)}`
  }
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${size * 0.16}" stroke-linecap="round" opacity="${opacity}"/>`
}

/* ════════════════════════════════════════════════════════════════
   BALI — rizières en terrasses, palmiers, le volcan Agung dans la brume
   ════════════════════════════════════════════════════════════════ */
function candiBentar(cx, base, s, color) {
  // porte balinaise fendue : deux tours à gradins, symétriques
  const half = (dir) => {
    const pts = []
    const w0 = 150 * s
    const gap = 46 * s
    let y = base
    const x0 = cx + dir * gap
    let w = w0
    pts.push([x0, base])
    const steps = 9
    for (let i = 0; i < steps; i++) {
      const h = (i < 2 ? 70 : 46) * s
      pts.push([x0 + dir * w, y], [x0 + dir * w, y - h])
      y -= h
      w *= i < 2 ? 0.94 : 0.84
    }
    pts.push([x0 + dir * w * 0.4, y - 40 * s], [x0, y - 70 * s])
    return poly(pts) + ' Z'
  }
  return `<path d="${half(-1)} ${half(1)}" fill="${color}"/>`
}

function bali() {
  const terraces = []
  const r = rng(61)
  for (let i = 0; i < 11; i++) {
    const t = i / 10
    const y0 = 1560 + t ** 1.35 * 900
    const amp = 40 + t * 70
    const ph = r() * 6
    const pts = []
    for (let x = -100; x <= S + 100; x += 60) {
      pts.push([x, y0 + Math.sin(x / (380 - t * 120) + ph) * amp + Math.sin(x / 140 + ph * 2) * amp * 0.18 - Math.exp(-(((x - 1200) / 700) ** 2)) * (120 - t * 60)])
    }
    terraces.push(pts)
  }
  const greens = ['#7d9a5c', '#6c8a50', '#5f7d47', '#73914f', '#58763f', '#668443', '#4e6b38', '#5b7840', '#475f33', '#3d532c', '#33472a']
  const farHills = ridge(62, { y: 1480, amp: 120, levels: 6, shape: bump(600, 500, 80) })
  const palmLine = ridge(63, { y: 1560, amp: 60, levels: 5 })

  return svg(
    sky('bs', [
      [0, '#93ada3'],
      [0.32, '#c3cdb6'],
      [0.52, '#ecdfb8'],
      [1, '#f2dcae'],
    ]),
    sun('bsun', 1560, 880, 80, '#fff8e6', '#fff0cf', 900, 0.75),
    streaks(64, 'bst', { y: 700, n: 5, h: 20, color: '#f6efdc', opacity: 0.6, blur: 18, spreadY: 300 }),
    // le volcan Agung
    `<path d="M600,1500 C1000,1430 1300,1060 1440,930 L1500,918 L1560,934 C1700,1060 2000,1430 2400,1500 Z" fill="#9aa48e"/>`,
    streaks(65, 'bcl', { y: 1010, x0: 1100, x1: 1900, n: 3, h: 30, color: '#f3ecd6', opacity: 0.8, blur: 16, spreadY: 40 }),
    haze('bh1', 1050, 1520, '#efe2bf', 0, 0.75),
    fill(farHills, '#8a9a76'),
    haze('bh2', 1350, 1560, '#e8dcb6', 0, 0.5),
    // lisière de palmiers
    fill(palmLine, '#4f6745'),
    ...[[180, 1.0], [430, 0.8], [690, 1.15], [1690, 0.95], [1940, 1.2], [2200, 0.85]].map(([x, k], i) =>
      palm(70 + i, x, yAt(palmLine, x) + 20, 420 * k, { lean: i % 2 ? -0.1 : 0.12, color: '#435a3b' }),
    ),
    candiBentar(1200, yAt(palmLine, 1200) + 30, 1.1, '#3a4a33'),
    // rizières : chaque terrasse a un fin liseré d'eau qui reflète le ciel
    ...terraces.map((pts, i) => `<path d="${toBottom(smooth(pts), pts)}" fill="${greens[i]}"/><path d="${smooth(pts)}" fill="none" stroke="#e8e7c4" stroke-width="${3 + i * 0.6}" opacity="${0.55 - i * 0.03}"/>`),
    palm(80, 2260, 2480, 1100, { lean: -0.16, color: '#1f2c1c', fronds: 10 }),
    birds(81, { x: 820, y: 640, n: 6, spread: 300, size: 16, color: '#4c5a4a', opacity: 0.6 }),
  )
}

/* ════════════════════════════════════════════════════════════════
   TANZANIE — le soir sur la savane, le Kilimandjaro, un acacia, des girafes
   ════════════════════════════════════════════════════════════════ */
function tanzanie() {
  const horizon = 1590
  const grass = ridge(91, { y: horizon, amp: 26, rough: 0.6, levels: 8 })
  const r = rng(92)
  let bushes = ''
  for (let i = 0; i < 26; i++) {
    const x = r() * S
    const w = 30 + r() * 90
    bushes += `<ellipse cx="${r1(x)}" cy="${r1(yAt(grass, x) + 4)}" rx="${r1(w)}" ry="${r1(w * 0.32)}"/>`
  }
  return svg(
    sky('ts', [
      [0, '#3a2a30'],
      [0.3, '#7a4f45'],
      [0.5, '#c27d4f'],
      [0.62, '#e6a661'],
      [0.68, '#f2c37c'],
      [1, '#f2c37c'],
    ]),
    sun('tsun', 1230, 1390, 230, '#fbdca2', '#f9c27e', 1300, 0.6),
    streaks(93, 'tst', { y: 930, n: 6, h: 18, color: '#e59a66', opacity: 0.55, blur: 12, spreadY: 260 }),
    // Kilimandjaro au loin, sommet enneigé
    `<path d="M300,${horizon + 10} C760,${horizon - 110} 1010,${horizon - 380} 1210,${horizon - 430} L1690,${horizon - 448} C1900,${horizon - 400} 2160,${horizon - 150} 2600,${horizon + 10} Z" fill="#a8714c"/>`,
    `<path d="M1210,${horizon - 430} L1690,${horizon - 448} C1740,${horizon - 436} 1770,${horizon - 420} 1800,${horizon - 400} L1740,${horizon - 392} L1700,${horizon - 410} L1640,${horizon - 386} L1590,${horizon - 408} L1520,${horizon - 384} L1460,${horizon - 404} L1390,${horizon - 382} L1330,${horizon - 400} L1260,${horizon - 384} Z" fill="#f2d8b0"/>`,
    haze('th1', horizon - 520, horizon + 10, '#f0b878', 0, 0.6),
    // savane
    {
      defs: linear('tground', [
        [0, '#7a4a2a'],
        [0.15, '#4a2c1a'],
        [1, '#1d120b'],
      ], { x1: 0, y1: horizon - 20, x2: 0, y2: S, units: 'userSpaceOnUse' }),
      body: `<path d="${toBottom(poly(grass), grass)}" fill="url(#tground)"/>`,
    },
    `<g fill="#3a2416" opacity="0.9">${bushes}</g>`,
    acacia(94, 820, 1760, 640, '#1c120c'),
    giraffe(1520, 1745, 0.62, '#1c120c'),
    giraffe(1760, 1730, 0.5, '#1c120c', true),
    acacia(95, 2180, 1660, 300, '#2a1a10'),
    birds(96, { x: 600, y: 900, n: 5, spread: 260, size: 18, color: '#3a2420', opacity: 0.65 }),
    // herbes hautes au premier plan
    fill(ridge(97, { y: 2280, amp: 70, rough: 0.7, levels: 9 }), '#150d08', false),
  )
}

/* ════════════════════════════════════════════════════════════════
   MALDIVES — villas sur pilotis, lagon turquoise
   ════════════════════════════════════════════════════════════════ */
function villa(x, y, s) {
  const w = 220 * s
  const h = 70 * s
  const roofH = 120 * s
  let o = ''
  // pilotis
  for (let i = 0; i < 5; i++) o += `<rect x="${r1(x - w / 2 + 10 * s + i * ((w - 20 * s) / 4))}" y="${r1(y)}" width="${r1(5 * s)}" height="${r1(70 * s)}" fill="#4a3a2c"/>`
  o += `<rect x="${r1(x - w / 2 - 30 * s)}" y="${r1(y - 8 * s)}" width="${r1(w + 60 * s)}" height="${r1(12 * s)}" fill="#7d5f43"/>`
  o += `<rect x="${r1(x - w / 2)}" y="${r1(y - 8 * s - h)}" width="${r1(w)}" height="${r1(h)}" fill="#ecdcc4"/>`
  o += `<rect x="${r1(x - w * 0.18)}" y="${r1(y - 8 * s - h * 0.8)}" width="${r1(w * 0.36)}" height="${r1(h * 0.8)}" fill="#6b5543"/>`
  o += `<path d="M${r1(x - w / 2 - 50 * s)},${r1(y - 8 * s - h + 6 * s)} Q${r1(x - w * 0.3)},${r1(y - 8 * s - h - roofH * 0.35)} ${r1(x)},${r1(y - 8 * s - h - roofH)} Q${r1(x + w * 0.3)},${r1(y - 8 * s - h - roofH * 0.35)} ${r1(x + w / 2 + 50 * s)},${r1(y - 8 * s - h + 6 * s)} Z" fill="#9a7650"/>`
  o += `<path d="M${r1(x)},${r1(y - 8 * s - h - roofH)} Q${r1(x + w * 0.3)},${r1(y - 8 * s - h - roofH * 0.35)} ${r1(x + w / 2 + 50 * s)},${r1(y - 8 * s - h + 6 * s)} L${r1(x + w * 0.1)},${r1(y - 8 * s - h + 6 * s)} Z" fill="#7a5a3c"/>`
  return o
}

function maldives() {
  const horizon = 1280
  const villas = [
    [1780, 1500, 0.55],
    [1560, 1545, 0.68],
    [1290, 1610, 0.85],
    [950, 1705, 1.08],
    [520, 1840, 1.4],
  ]
  const row = villas.map(([x, y, k]) => villa(x, y, k)).join('')
  const reflections = villas.map(([x, y, k]) => mirror(y + 62 * k, villa(x, y, k), 0.2)).join('')
  const pier = `<path d="M2000,1470 L1780,1505 L1560,1552 L1290,1620 L950,1720 L520,1860 L-100,2060 L-100,2110 L520,1905 L950,1752 L1290,1645 L1560,1570 L1780,1520 L2000,1482 Z" fill="#8a6a4a"/>`
  return svg(
    sky('ms', [
      [0, '#6aa8b8'],
      [0.3, '#a9d2d2'],
      [0.5, '#e6efe6'],
      [0.535, '#f4ecdc'],
      [1, '#f4ecdc'],
    ]),
    sun('msun', 700, 760, 70, '#fffdf4', '#fffbe9', 800, 0.8),
    streaks(101, 'mst', { y: 1000, n: 6, h: 26, color: '#ffffff', opacity: 0.7, blur: 20, spreadY: 260 }),
    {
      defs: linear('msea', [
        [0, '#2c7f8e'],
        [0.12, '#3a98a3'],
        [0.35, '#5fbcb8'],
        [0.7, '#8fd4c6'],
        [1, '#b9e6d8'],
      ], { x1: 0, y1: horizon, x2: 0, y2: S, units: 'userSpaceOnUse' }),
      body: `<rect x="0" y="${horizon}" width="${S}" height="${S - horizon}" fill="url(#msea)"/>`,
    },
    // îlot et palmiers à l'horizon
    `<ellipse cx="2150" cy="${horizon + 8}" rx="300" ry="22" fill="#e9dfc8"/>`,
    ...[[2030, 0.55], [2120, 0.7], [2210, 0.6], [2290, 0.5]].map(([x, k], i) => palm(110 + i, x, horizon + 6, 260 * k, { lean: i % 2 ? 0.1 : -0.12, color: '#2c5a4c', fronds: 8 })),
    // reflets (sous chaque villa, dans l'eau seulement)
    { defs: `<clipPath id="mwater"><rect x="0" y="${horizon}" width="${S}" height="${S - horizon}"/></clipPath>`, body: `<g clip-path="url(#mwater)">${reflections}</g>` },
    shimmer(111, { cx: 700, y0: horizon + 10, y1: 2300, spread: 260, n: 150, color: '#ffffff', maxW: 160, opacity: 0.55 }),
    ripples(112, { y0: horizon + 10, y1: S, n: 90, color: '#ffffff', opacity: 0.22 }),
    pier,
    row,
  )
}

/* ════════════════════════════════════════════════════════════════
   NEW YORK — la skyline au crépuscule, reflétée dans l'East River
   ════════════════════════════════════════════════════════════════ */
function skyline(seed, { base, minH, maxH, color, windows, density = 0.18, peak = 1200, spread = 900 }) {
  const r = rng(seed)
  let rects = ''
  let lights = ''
  let x = -60
  while (x < S + 60) {
    const w = 50 + r() * 110
    const centrality = Math.exp(-(((x - peak) / spread) ** 2))
    const h = minH + (maxH - minH) * (0.25 + 0.75 * centrality) * (0.45 + r() * 0.75)
    rects += `<rect x="${r1(x)}" y="${r1(base - h)}" width="${r1(w + 2)}" height="${r1(h + 40)}"/>`
    if (r() > 0.55) rects += `<rect x="${r1(x + w * 0.2)}" y="${r1(base - h - h * 0.12)}" width="${r1(w * 0.6)}" height="${r1(h * 0.12 + 2)}"/>`
    if (windows) {
      for (let wy = base - h + 18; wy < base - 10; wy += 22) {
        for (let wx = x + 8; wx < x + w - 10; wx += 16) {
          if (r() < density) lights += `<rect x="${r1(wx)}" y="${r1(wy)}" width="7" height="10"/>`
        }
      }
    }
    x += w + 2
  }
  return `<g fill="${color}">${rects}</g>${windows ? `<g fill="${windows}" opacity="0.85">${lights}</g>` : ''}`
}

function newYork() {
  const water = 1760
  // tours emblématiques (silhouettes stylisées)
  const empire = (x, base, c) =>
    `<path d="M${x - 110},${base} L${x - 110},${base - 620} L${x - 80},${base - 620} L${x - 80},${base - 760} L${x - 50},${base - 760} L${x - 50},${base - 900} L${x - 26},${base - 900} L${x - 26},${base - 980} L${x - 10},${base - 980} L${x - 6},${base - 1120} L${x + 6},${base - 1120} L${x + 10},${base - 980} L${x + 26},${base - 980} L${x + 26},${base - 900} L${x + 50},${base - 900} L${x + 50},${base - 760} L${x + 80},${base - 760} L${x + 80},${base - 620} L${x + 110},${base - 620} L${x + 110},${base} Z" fill="${c}"/>`
  const chrysler = (x, base, c) => {
    let d = `M${x - 70},${base} L${x - 70},${base - 760} L${x + 70},${base - 760} L${x + 70},${base} Z`
    for (let i = 0; i < 5; i++) {
      const w = 62 - i * 12
      const y = base - 760 - i * 46
      d += ` M${x - w},${y} A${w},${w * 1.25} 0 0 1 ${x + w},${y} Z`
    }
    d += ` M${x - 4},${base - 980} L${x},${base - 1110} L${x + 4},${base - 980} Z`
    return `<path d="${d}" fill="${c}"/>`
  }
  const oneWtc = (x, base, c) => `<path d="M${x - 95},${base} L${x - 95},${base - 160} L${x - 40},${base - 1180} L${x + 40},${base - 1180} L${x + 95},${base - 160} L${x + 95},${base} Z M${x - 3},${base - 1180} L${x - 2},${base - 1330} L${x + 2},${base - 1330} L${x + 3},${base - 1180} Z" fill="${c}"/>`

  const far = skyline(121, { base: water, minH: 160, maxH: 520, color: '#4a5566', windows: null, peak: 1300, spread: 1100 })
  const near = skyline(122, { base: water, minH: 120, maxH: 640, color: '#1d232c', windows: '#f2c878', density: 0.16, peak: 1150, spread: 800 })
  const city = `${far}${empire(1130, water, '#262d38')}${chrysler(1520, water, '#2a313c')}${oneWtc(560, water, '#232a35')}${near}`
  return svg(
    sky('ns', [
      [0, '#121824'],
      [0.32, '#2a3546'],
      [0.52, '#6a6f7c'],
      [0.66, '#c8a387'],
      [0.74, '#e6bf95'],
      [1, '#e6bf95'],
    ]),
    stars(123, { n: 90, y0: 0, y1: 700, color: '#f3efe6' }),
    streaks(124, 'nst', { y: 1150, n: 5, h: 20, color: '#d8a88a', opacity: 0.45, blur: 14, spreadY: 200 }),
    haze('nh', 1100, water, '#e2b893', 0, 0.35),
    city,
    {
      defs: linear('nriver', [
        [0, '#3a3c48'],
        [0.4, '#1a1f29'],
        [1, '#0e1218'],
      ], { x1: 0, y1: water, x2: 0, y2: S, units: 'userSpaceOnUse' }) + '<filter id="nrb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2 10"/></filter>',
      body: `<rect x="0" y="${water}" width="${S}" height="${S - water}" fill="url(#nriver)"/>`,
    },
    mirror(water, city, 0.32, 'nrb'),
    shimmer(125, { cx: 1200, y0: water + 8, y1: 2380, spread: 900, n: 240, color: '#f2c27a', maxW: 90, opacity: 0.45 }),
    `<rect x="0" y="${water}" width="${S}" height="3" fill="#e6bf95" opacity="0.4"/>`,
  )
}

/* ════════════════════════════════════════════════════════════════
   GRÈCE — Santorin : maisons blanches, dômes bleus, la caldeira
   ════════════════════════════════════════════════════════════════ */
function grece() {
  const horizon = 1240
  const r = rng(131)
  // falaise de la caldeira : du haut à gauche jusqu'à la mer
  const edge = (x) => 980 + Math.max(0, x / 1450) ** 1.7 * 1450
  const cliffTop = []
  for (let x = -100; x <= 1500; x += 40) cliffTop.push([x, edge(x) + Math.sin(x / 70) * 10])
  const cliffD = `${smooth(cliffTop)} L1500,${S + 20} L-100,${S + 20} Z`
  const cliff = `<path d="${cliffD}" fill="#8c624c"/>`
  let strata = ''
  for (let i = 0; i < 16; i++) {
    const y = 1150 + i * 85
    strata += `<path d="M-100,${y} Q400,${y - 40 + r() * 40} ${1000 + i * 30},${y + 260 + i * 20}" fill="none" stroke="#a5765c" stroke-width="${6 + r() * 8}" opacity="0.45"/>`
  }
  strata = `<clipPath id="gcliff"><path d="${cliffD}"/></clipPath><g clip-path="url(#gcliff)">${strata}</g>`
  // maisons cubiques en terrasses, accrochées à la falaise
  let houses = ''
  const edgeInv = (y) => 1450 * Math.max(0, (y - 980) / 1450) ** (1 / 1.7)
  for (let row = 0; row < 13; row++) {
    for (let i = 0; i < 12; i++) {
      const x = -80 + i * 135 + (row % 2) * 65 + r() * 30
      const top = edge(Math.max(0, x)) + 40 + row * 92
      if (top > 2330 || x + 120 > edgeInv(top + 30)) continue
      const w = 110 + r() * 70
      const h = 70 + r() * 60
      houses += `<rect x="${r1(x)}" y="${r1(top - h)}" width="${r1(w)}" height="${r1(h + 40)}" fill="#f7f4ee"/>`
      houses += `<rect x="${r1(x + w * 0.72)}" y="${r1(top - h)}" width="${r1(w * 0.28)}" height="${r1(h + 40)}" fill="#dfdbd3"/>`
      houses += `<rect x="${r1(x - 6)}" y="${r1(top - h - 8)}" width="${r1(w + 12)}" height="10" fill="#ebe7e0"/>`
      if (r() > 0.4) houses += `<rect x="${r1(x + w * 0.2)}" y="${r1(top - h * 0.55)}" width="${r1(w * 0.16)}" height="${r1(h * 0.34)}" fill="${r() > 0.5 ? '#2f5f9a' : '#7a96b4'}"/>`
      if (r() > 0.8) {
        const dx = x + w * 0.42
        houses += `<rect x="${r1(dx - 34)}" y="${r1(top - h - 34)}" width="68" height="34" fill="#f7f4ee"/><path d="M${r1(dx - 40)},${r1(top - h - 32)} A40,46 0 0 1 ${r1(dx + 40)},${r1(top - h - 32)} Z" fill="#2c5c98"/><rect x="${r1(dx - 2)}" y="${r1(top - h - 104)}" width="4" height="30" fill="#f7f4ee"/>`
      }
      if (r() > 0.9) houses += `<circle cx="${r1(x + r() * w)}" cy="${r1(top - h * 0.15)}" r="${r1(16 + r() * 14)}" fill="#c4497c" opacity="0.9"/>`
    }
  }
  return svg(
    sky('gs', [
      [0, '#9dbbd6'],
      [0.3, '#c9d9e6'],
      [0.48, '#eef0ec'],
      [0.515, '#f5e8d6'],
      [1, '#f5e8d6'],
    ]),
    sun('gsun', 1900, 980, 70, '#fffaf0', '#fff1d6', 700, 0.75),
    streaks(132, 'gst', { y: 600, n: 5, h: 22, color: '#ffffff', opacity: 0.65, blur: 18, spreadY: 300 }),
    {
      defs: linear('gsea', [
        [0, '#4e7ea6'],
        [0.2, '#356a96'],
        [1, '#183554'],
      ], { x1: 0, y1: horizon, x2: 0, y2: S, units: 'userSpaceOnUse' }),
      body: `<rect x="0" y="${horizon}" width="${S}" height="${S - horizon}" fill="url(#gsea)"/>`,
    },
    // Thirassia à l'horizon
    `<path d="M1500,${horizon + 4} C1700,${horizon - 60} 1950,${horizon - 90} 2150,${horizon - 70} C2300,${horizon - 50} 2420,${horizon - 20} 2500,${horizon + 4} Z" fill="#7d8ea3"/>`,
    shimmer(133, { cx: 1900, y0: horizon + 8, y1: 2300, spread: 220, n: 160, color: '#fff6e2', maxW: 140, opacity: 0.6 }),
    ripples(134, { y0: horizon + 8, y1: S, n: 80, color: '#ffffff', opacity: 0.14 }),
    // un voilier
    `<path d="M1980,1680 L2160,1680 L2130,1708 L2000,1708 Z" fill="#f4f1ea"/><path d="M2070,1676 L2070,1500 L2150,1670 Z" fill="#f7f4ee"/><path d="M2062,1676 L2062,1530 L2000,1670 Z" fill="#e6e2da"/>`,
    cliff,
    strata,
    houses,
  )
}

/* ════════════════════════════════════════════════════════════════
   MAROC — les dunes au coucher du soleil, une caravane
   ════════════════════════════════════════════════════════════════ */
function dune(cx, base, w, h, lit, shade, seed) {
  const r = rng(seed)
  const lf = [cx - w * 0.7, base + 40]
  const peak = [cx, base - h]
  const rf = [cx + w * 0.55, base + 40]
  const body = `M${lf[0]},${lf[1]} C${cx - w * 0.4},${base - h * 0.15} ${cx - w * 0.15},${base - h * 0.95} ${peak[0]},${peak[1]} C${cx + w * 0.12},${base - h * 0.8} ${cx + w * 0.35},${base - h * 0.1} ${rf[0]},${rf[1]} L${rf[0]},${S + 20} L${lf[0]},${S + 20} Z`
  const shadow = `M${peak[0]},${peak[1]} C${cx + w * 0.12},${base - h * 0.8} ${cx + w * 0.35},${base - h * 0.1} ${rf[0]},${rf[1]} L${rf[0]},${S + 20} L${cx + w * 0.02},${S + 20} C${cx + w * 0.05},${base} ${cx + w * (0.02 + r() * 0.04)},${base - h * 0.6} ${peak[0]},${peak[1]} Z`
  return `<path d="${body}" fill="${lit}"/><path d="${shadow}" fill="${shade}"/>`
}

function camel(x, y, s, c) {
  return `<path transform="translate(${x} ${y}) scale(${s})" fill="${c}" d="M-60,-70 C-50,-110 -10,-115 0,-90 C10,-118 45,-110 50,-80 L62,-110 L72,-140 L92,-142 L96,-128 L84,-124 L74,-92 C70,-70 60,-58 50,-56 L50,0 L42,0 L40,-50 L-30,-52 L-34,0 L-42,0 L-46,-56 C-58,-58 -64,-64 -60,-70 Z M-20,-112 L-14,-150 L4,-150 L8,-112 Z M-10,-150 a10,10 0 1,0 0.1,0 Z"/>`
}

function maroc() {
  const horizon = 1360
  const r = rng(141)
  let wind = ''
  for (let i = 0; i < 26; i++) {
    const y = 1900 + i * 22 + r() * 10
    wind += `<path d="M${r1(-50 + r() * 300)},${r1(y)} Q${r1(600 + r() * 200)},${r1(y - 30 - r() * 20)} ${r1(1300 + r() * 300)},${r1(y + 10)}" fill="none" stroke="#f0b17c" stroke-width="3" opacity="${r1(0.12 + r() * 0.15)}"/>`
  }
  return svg(
    sky('as', [
      [0, '#3a2738'],
      [0.28, '#7a3f45'],
      [0.46, '#c26a49'],
      [0.56, '#e8a067'],
      [0.6, '#f3c48c'],
      [1, '#f3c48c'],
    ]),
    sun('asun', 1480, 1290, 160, '#fde3b2', '#f8b77a', 1100, 0.6),
    streaks(142, 'ast', { y: 900, n: 5, h: 20, color: '#e88c6a', opacity: 0.5, blur: 12, spreadY: 260 }),
    haze('ah', 1100, horizon + 40, '#f3b980', 0, 0.5),
    dune(1900, horizon + 40, 1500, 150, '#d48a5a', '#a85a3c', 143),
    dune(500, horizon + 90, 1300, 170, '#d07f50', '#a0533a', 144),
    `<g>${[0, 1, 2, 3].map((i) => camel(1180 + i * 92, horizon + 64 - i * 6, 0.62, '#3a1f18')).join('')}</g>`,
    dune(1500, 1720, 1700, 300, '#c97646', '#934632', 145),
    dune(300, 1960, 1500, 330, '#bf6a3d', '#874030', 146),
    dune(2000, 2250, 1600, 360, '#b45f36', '#7a372a', 147),
    wind,
  )
}

/* ════════════════════════════════════════════════════════════════
   COSTA RICA — le volcan Arenal, la jungle, une cascade
   ════════════════════════════════════════════════════════════════ */
function costaRica() {
  const l1 = ridge(151, { y: 1500, amp: 110, levels: 6 })
  const l2 = ridge(152, { y: 1660, amp: 150, levels: 6, shape: bump(500, 400, 160) })
  const l3 = ridge(153, { y: 1880, amp: 140, levels: 6, shape: bump(1900, 500, 120) })
  const l4 = ridge(154, { y: 2140, amp: 120, levels: 6 })
  return svg(
    sky('cs', [
      [0, '#8fb4a8'],
      [0.35, '#c4d6c4'],
      [0.55, '#e8ead6'],
      [1, '#e8ead6'],
    ]),
    sun('csun', 1700, 820, 70, '#fffbea', '#fff6d8', 700, 0.6),
    // Arenal
    `<path d="M380,1560 C820,1480 1060,1000 1160,840 L1240,832 C1340,1000 1580,1480 2020,1560 Z" fill="#587a64"/>`,
    `<path d="M1200,836 L1240,832 C1340,1000 1580,1480 2020,1560 L1500,1560 C1400,1300 1290,1000 1200,836 Z" fill="#4c6c58"/>`,
    streaks(155, 'ccl', { y: 900, x0: 900, x1: 1500, n: 4, h: 34, color: '#f2f4e8', opacity: 0.85, blur: 16, spreadY: 60 }),
    haze('ch', 1000, 1560, '#e6ead6', 0, 0.7),
    canopy(156, l1, '#46705a', 46),
    haze('ch2', 1350, 1640, '#dfe6d0', 0, 0.45),
    canopy(157, l2, '#2f5a43', 58),
    // cascade et sa brume
    { defs: linear('cfall', [[0, '#f4f7f0', 0.5], [0.2, '#f4f7f0', 0.95], [1, '#f4f7f0', 0.85]]), body: `<path d="${taper([560, yAt(l2, 560) - 10], [548, yAt(l2, 560) + 180], [566, yAt(l2, 560) + 380], 22, 46)}" fill="url(#cfall)"/>` },
    { defs: blurFilter('cmist', 24), body: `<ellipse cx="560" cy="${yAt(l2, 560) + 380}" rx="150" ry="50" fill="#eef3ea" opacity="0.8" filter="url(#cmist)"/>` },
    canopy(158, l3, '#204634', 70),
    canopy(159, l4, '#14301f', 84),
    leaf([-60, 2500], [200, 2050], [640, 1980], 200, '#0c1d14'),
    leaf([-80, 2300], [80, 1980], [380, 1760], 150, '#0f2318'),
    leaf([2480, 2480], [2200, 2060], [1760, 2040], 210, '#0c1d14'),
    leaf([2500, 2200], [2320, 1900], [2020, 1760], 140, '#102419'),
    birds(160, { x: 1500, y: 640, n: 4, spread: 260, size: 18, color: '#3f5a4c', opacity: 0.6 }),
  )
}

/* ════════════════════════════════════════════════════════════════
   ÉTAPE 01 — « Vous rêvez » : Nice la nuit, la baie des Anges
   ════════════════════════════════════════════════════════════════ */
function stepDream() {
  const shore = 1520
  const r = rng(171)
  let lamps = ''
  let reflections = ''
  for (let i = 0; i < 70; i++) {
    const t = i / 69
    const x = -40 + t * (S + 80)
    const y = shore - 18 - Math.sin(t * Math.PI) * 60 + Math.sin(t * 20) * 3
    lamps += `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(4 + r() * 2)}"/>`
    if (i % 2 === 0) reflections += `<rect x="${r1(x - 2)}" y="${r1(shore + 6)}" width="4" height="${r1(60 + r() * 160)}" rx="2"/>`
  }
  let windows = ''
  for (let i = 0; i < 260; i++) {
    const t = r()
    const x = t * S
    const y = shore - 40 - Math.sin(t * Math.PI) * 60 - r() * 120
    windows += `<rect x="${r1(x)}" y="${r1(y)}" width="6" height="8"/>`
  }
  const hills = ridge(172, { y: shore - 140, amp: 220, levels: 7, shape: sum(bump(1900, 500, 260), bump(400, 400, 120)) })
  const town = ridge(173, { y: shore - 40, amp: 60, rough: 0.7, levels: 8, shape: (x) => -Math.sin((x / S) * Math.PI) * 60 })
  return svg(
    sky('ds', [
      [0, '#0c1322'],
      [0.35, '#16223a'],
      [0.55, '#2c3a58'],
      [0.62, '#5a5068'],
      [1, '#5a5068'],
    ]),
    stars(174, { n: 320, y0: 0, y1: 1250, color: '#f4efe2' }),
    { defs: radial('dmoon', [[0, '#f6eed6', 0.35], [1, '#f6eed6', 0]]), body: '<circle cx="1720" cy="520" r="420" fill="url(#dmoon)"/>' },
    `<path d="M1720,440 A80,80 0 1,0 1720,600 A100,100 0 0,1 1720,440 Z" fill="#f4ecd4" transform="rotate(-25 1720 520)"/>`,
    fill(hills, '#141c2e'),
    fill(town, '#0f1524'),
    `<g fill="#f5c879" opacity="0.65">${windows}</g>`,
    { defs: blurFilter('dglow', 5), body: `<g fill="#ffcf85" filter="url(#dglow)">${lamps}</g><g fill="#fff0cf">${lamps}</g>` },
    {
      defs: linear('dsea', [
        [0, '#26304a'],
        [0.3, '#151d30'],
        [1, '#0a0f1a'],
      ], { x1: 0, y1: shore, x2: 0, y2: S, units: 'userSpaceOnUse' }),
      body: `<rect x="0" y="${shore}" width="${S}" height="${S - shore}" fill="url(#dsea)"/>`,
    },
    `<g fill="#f5c879" opacity="0.28">${reflections}</g>`,
    shimmer(175, { cx: 1720, y0: shore + 20, y1: 2350, spread: 160, n: 140, color: '#f4ecd4', maxW: 110, opacity: 0.55 }),
    // voilier au mouillage
    `<path d="M560,1980 L780,1980 L750,2010 L590,2010 Z" fill="#05080f"/><path d="M668,1976 L668,1700 L668,1700 L760,1968 Z" fill="#0a0f1a"/><circle cx="668" cy="1696" r="5" fill="#ffd89a"/>`,
  )
}

/* ════════════════════════════════════════════════════════════════
   ÉTAPE 02 — « Nous imaginons » : lac de montagne, reflets parfaits
   ════════════════════════════════════════════════════════════════ */
function stepDesign() {
  const water = 1600
  const peaks = ridge(181, { y: 1180, amp: 420, rough: 0.56, levels: 8, shape: sum(bump(880, 300, 470), bump(1620, 360, 380), bump(260, 260, 200), bump(2250, 240, 230)) })
  const snow = peaks.map(([x, y]) => [x, Math.max(y, Math.min(y + 140, 760 + Math.abs(Math.sin(x / 37)) * 90))])
  const ridge2 = ridge(182, { y: 1400, amp: 260, levels: 7 })
  let forest = ''
  const r = rng(183)
  for (let x = -40; x < S + 40; x += 34 + r() * 30) {
    const h = 120 + r() * 140
    forest += pine(x, water + 6, h, '#1f332d')
  }
  const land = `${fill(peaks, '#6d8486', false)}<path d="${toBottom(poly(snow), snow)}" fill="#e8eeea" opacity="0"/>${fill(ridge2, '#4a6364', false)}${forest}`
  return svg(
    sky('es', [
      [0, '#58808a'],
      [0.32, '#a3c0bf'],
      [0.6, '#e2e7dc'],
      [1, '#e2e7dc'],
    ]),
    streaks(184, 'est', { y: 520, n: 5, h: 24, color: '#ffffff', opacity: 0.55, blur: 18, spreadY: 260 }),
    land,
    // neiges (au-dessus de la roche)
    `<path d="${poly(peaks)} ${poly(snow.slice().reverse()).replace('M', 'L')} Z" fill="#eef2ee"/>`,
    haze('eh', 1150, water, '#dbe5e0', 0, 0.55),
    `${fill(ridge2, '#4a6364', false)}${forest}`,
    {
      defs: linear('elake', [
        [0, '#7b9a9a'],
        [1, '#203436'],
      ], { x1: 0, y1: water, x2: 0, y2: S, units: 'userSpaceOnUse' }) + '<filter id="erb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1 6"/></filter>',
      body: `<rect x="0" y="${water}" width="${S}" height="${S - water}" fill="url(#elake)"/>`,
    },
    mirror(water, `${fill(peaks, '#6d8486', false)}<path d="${poly(peaks)} ${poly(snow.slice().reverse()).replace('M', 'L')} Z" fill="#eef2ee"/>${fill(ridge2, '#4a6364', false)}${forest}`, 0.42, 'erb'),
    ripples(185, { y0: water + 6, y1: S, n: 80, color: '#e8f0ec', opacity: 0.2 }),
    { defs: blurFilter('emist', 20), body: `<rect x="-100" y="${water - 30}" width="${S + 200}" height="60" fill="#eef2ec" opacity="0.5" filter="url(#emist)"/>` },
  )
}

/* ════════════════════════════════════════════════════════════════
   ÉTAPE 03 — « Vous partez » : l'aube sur la côte, un avion qui s'éloigne
   ════════════════════════════════════════════════════════════════ */
function stepDepart() {
  const sea = 1620
  const plane = (x, y, s) =>
    `<path transform="translate(${x} ${y}) rotate(-14) scale(${s})" fill="#20293a" d="M-120,0 C-80,-10 60,-12 110,-6 C126,-4 132,0 126,4 C80,10 -80,10 -120,4 Z M-10,-4 L40,-70 L58,-70 L36,-4 Z M-10,4 L40,64 L56,64 L34,4 Z M-108,-2 L-124,-40 L-112,-40 L-90,-3 Z"/>`
  const coast = ridge(191, { y: sea - 60, amp: 200, levels: 7, x1: 1300, shape: (x) => (x > 650 ? ((x - 650) / 650) ** 1.6 * 520 : 0) - Math.exp(-(((x - 300) / 320) ** 2)) * 180 })
  const cape = fill(coast, '#55657a', false)
  return svg(
    sky('ps', [
      [0, '#2a4562'],
      [0.3, '#6f8ca4'],
      [0.52, '#d9c3ad'],
      [0.64, '#f3caa0'],
      [0.675, '#f6d6b0'],
      [1, '#f6d6b0'],
    ]),
    sun('psun', 1560, sea - 20, 120, '#fff0d2', '#ffd8a8', 1200, 0.75),
    streaks(192, 'pst', { y: 1150, n: 6, h: 18, color: '#f4cfa8', opacity: 0.55, blur: 14, spreadY: 300 }),
    // traînée de condensation puis l'avion
    { defs: linear('ptrail', [[0, '#ffffff', 0], [1, '#ffffff', 0.8]], { x1: 300, y1: 1100, x2: 1250, y2: 860, units: 'userSpaceOnUse' }), body: '<path d="M300,1105 L1250,858 L1252,866 L302,1113 Z" fill="url(#ptrail)"/>' },
    plane(1300, 846, 0.9),
    cape,
    haze('ph', sea - 340, sea, '#f0cfae', 0, 0.45),
    {
      defs: linear('psea', [
        [0, '#7d8ea0'],
        [0.25, '#4f6378'],
        [1, '#1f2b3a'],
      ], { x1: 0, y1: sea, x2: 0, y2: S, units: 'userSpaceOnUse' }),
      body: `<rect x="0" y="${sea}" width="${S}" height="${S - sea}" fill="url(#psea)"/>`,
    },
    shimmer(193, { cx: 1560, y0: sea + 8, y1: 2350, spread: 240, n: 170, color: '#ffe2b8', maxW: 150, opacity: 0.7 }),
    ripples(194, { y0: sea + 6, y1: S, n: 70, color: '#f6dcc0', opacity: 0.14 }),
  )
}

/* ════════════════════════════════════════════════════════════════
   ÉTAPE 04 — « Vous profitez » : coucher de soleil sur la plage
   ════════════════════════════════════════════════════════════════ */
function stepEnjoy() {
  const sea = 1500
  const beach = []
  for (let x = -100; x <= S + 100; x += 80) beach.push([x, 2050 + Math.sin(x / 600) * 60 - x * 0.08])
  const lounger = (x, y, s) =>
    `<path transform="translate(${x} ${y}) scale(${s})" fill="#1c1418" d="M-90,0 L-84,-6 L40,-6 L90,-60 L100,-54 L52,0 Z M-80,0 L-84,30 L-76,30 L-72,0 Z M40,0 L44,30 L52,30 L48,0 Z"/>`
  const parasol = (x, y, s) =>
    `<path transform="translate(${x} ${y}) scale(${s})" fill="#1c1418" d="M-3,0 L3,0 L3,-230 L-3,-230 Z M-160,-200 Q0,-300 160,-200 Q0,-222 -160,-200 Z"/>`
  return svg(
    sky('fs', [
      [0, '#3a2a3a'],
      [0.3, '#7c4552'],
      [0.48, '#cf7a5f'],
      [0.6, '#f0a46d'],
      [0.625, '#f6c78f'],
      [1, '#f6c78f'],
    ]),
    sun('fsun', 1250, sea, 200, '#fde1aa', '#fbbf7c', 1300, 0.7),
    streaks(201, 'fst', { y: 1050, n: 6, h: 20, color: '#e98d6c', opacity: 0.55, blur: 12, spreadY: 280 }),
    {
      defs: linear('fsea', [
        [0, '#d9875f'],
        [0.12, '#8a4d52'],
        [1, '#2a1f2a'],
      ], { x1: 0, y1: sea, x2: 0, y2: S, units: 'userSpaceOnUse' }),
      body: `<rect x="0" y="${sea}" width="${S}" height="${S - sea}" fill="url(#fsea)"/>`,
    },
    shimmer(202, { cx: 1250, y0: sea + 6, y1: 2200, spread: 200, n: 200, color: '#ffd9a0', maxW: 170, opacity: 0.8 }),
    ripples(203, { y0: sea + 6, y1: 2100, n: 60, color: '#f6c08c', opacity: 0.15 }),
    `<path d="${toBottom(smooth(beach), beach)}" fill="#2a1d22"/>`,
    lounger(1600, 2000, 1.4),
    lounger(1880, 1975, 1.4),
    parasol(1760, 1990, 1.4),
    palm(204, 260, 2400, 1500, { lean: 0.3, color: '#160f12', fronds: 10 }),
    palm(205, 560, 2420, 1150, { lean: 0.42, color: '#1a1216', fronds: 9 }),
    birds(206, { x: 1650, y: 980, n: 5, spread: 300, size: 20, color: '#3a2328', opacity: 0.6 }),
  )
}

/* ════════════════════════════════════════════════════════════════
   CROISIÈRES & FERRIES — un ferry au crépuscule sur la Méditerranée
   ════════════════════════════════════════════════════════════════ */
function croisieres() {
  const sea = 1460
  const fx = 1250
  const fy = 1640
  const r = rng(211)
  let windows = ''
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 46; i++) {
      if (r() < 0.62) windows += `<rect x="${r1(fx - 470 + row * 30 + i * 19)}" y="${r1(fy - 118 - row * 52)}" width="10" height="9"/>`
    }
  }
  const ferry = `<path fill="#1a2030" d="M${fx - 600},${fy - 60} L${fx + 560},${fy - 60} L${fx + 640},${fy - 120} L${fx + 610},${fy} L${fx - 560},${fy} Z M${fx - 500},${fy - 60} L${fx - 500},${fy - 260} L${fx + 420},${fy - 260} L${fx + 500},${fy - 60} Z M${fx - 380},${fy - 260} L${fx - 380},${fy - 330} L${fx + 240},${fy - 330} L${fx + 300},${fy - 260} Z M${fx - 200},${fy - 330} L${fx - 180},${fy - 430} L${fx - 70},${fy - 430} L${fx - 60},${fy - 330} Z"/><rect x="${fx - 560}" y="${fy - 46}" width="${1150}" height="10" fill="#e7d9c6" opacity="0.6"/><g fill="#f6d08a">${windows}</g>`
  const islands = `<path d="M-100,${sea + 4} C200,${sea - 120} 500,${sea - 210} 760,${sea - 150} C900,${sea - 120} 1000,${sea - 60} 1120,${sea + 4} Z" fill="#5b6378"/><path d="M1700,${sea + 4} C1850,${sea - 70} 2100,${sea - 110} 2300,${sea - 60} C2400,${sea - 40} 2460,${sea - 10} 2520,${sea + 4} Z" fill="#666e82"/>`
  return svg(
    sky('cs2', [
      [0, '#24334a'],
      [0.3, '#56647c'],
      [0.5, '#b49384'],
      [0.58, '#ecbf95'],
      [0.61, '#f2d0a6'],
      [1, '#f2d0a6'],
    ]),
    sun('csun2', 1820, sea - 40, 120, '#fff1d4', '#ffd6a0', 1100, 0.65),
    streaks(212, 'cst2', { y: 1000, n: 6, h: 18, color: '#d9a58a', opacity: 0.5, blur: 14, spreadY: 300 }),
    islands,
    haze('ch3', sea - 260, sea + 4, '#efc9a2', 0, 0.5),
    {
      defs: linear('csea', [
        [0, '#8a8b98'],
        [0.15, '#4d5870'],
        [1, '#161d2c'],
      ], { x1: 0, y1: sea, x2: 0, y2: S, units: 'userSpaceOnUse' }),
      body: `<rect x="0" y="${sea}" width="${S}" height="${S - sea}" fill="url(#csea)"/>`,
    },
    shimmer(213, { cx: 1820, y0: sea + 6, y1: 2350, spread: 240, n: 170, color: '#ffdcae', maxW: 150, opacity: 0.6 }),
    // sillage
    `<path d="M${fx - 560},${fy} C${fx - 900},${fy + 40} ${fx - 1400},${fy + 160} -100,${fy + 260} L-100,${fy + 300} C${fx - 1400},${fy + 200} ${fx - 900},${fy + 70} ${fx - 560},${fy + 14} Z" fill="#e9dccb" opacity="0.35"/>`,
    ripples(214, { y0: sea + 6, y1: S, n: 70, color: '#f3e3cf', opacity: 0.14 }),
    mirror(fy, ferry, 0.22),
    ferry,
    birds(215, { x: 1700, y: 1050, n: 3, spread: 200, size: 22, color: '#2c3346', opacity: 0.7 }),
  )
}

export const scenes = { hero, heroPortrait, japon, bali, tanzanie, maldives, newYork, grece, maroc, costaRica, stepDream, stepDesign, stepDepart, stepEnjoy, croisieres }

