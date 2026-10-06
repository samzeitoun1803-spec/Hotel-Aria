/**
 * Petite bibliothèque de dessin pour les illustrations du site.
 * Tout est généré en SVG (format carré S × S), de façon déterministe (graines fixes),
 * puis rendu en WebP par render.mjs. Aucune image externe.
 */

export const S = 2400

const f = (n) => Math.round(n * 10) / 10

/* ── Hasard déterministe ─────────────────────────────────────────── */

export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ── Chemins ─────────────────────────────────────────────────────── */

/** Courbe lissée (Catmull-Rom → Bézier) passant par les points. */
export function smooth(pts) {
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`
  }
  return d
}

export const poly = (pts) => `M${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' L')}`

/** Ferme une ligne de crête jusqu'en bas de l'image. */
export const toBottom = (d, pts, bottom = S + 20) => `${d} L${f(pts.at(-1)[0])},${bottom} L${f(pts[0][0])},${bottom} Z`

/** Ligne de crête par déplacement du point milieu. */
export function ridge(seed, { x0 = -80, x1 = S + 80, y = 1400, amp = 300, rough = 0.52, levels = 8, shape = null } = {}) {
  const r = rng(seed)
  let pts = [
    [x0, y + (r() - 0.5) * amp * 0.5],
    [x1, y + (r() - 0.5) * amp * 0.5],
  ]
  let a = amp
  for (let l = 0; l < levels; l++) {
    const next = []
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i]
      const [bx, by] = pts[i + 1]
      next.push(pts[i], [(ax + bx) / 2, (ay + by) / 2 + (r() - 0.5) * a])
    }
    next.push(pts.at(-1))
    pts = next
    a *= rough
  }
  return shape ? pts.map(([x, py]) => [x, py + shape(x)]) : pts
}

/** Bosse gaussienne (négative = vers le haut). */
export const bump = (cx, w, h) => (x) => -h * Math.exp(-(((x - cx) / w) ** 2))
export const sum = (...fns) => (x) => fns.reduce((s, fn) => s + fn(x), 0)

/** Massif : crête bruitée, rendue en lignes droites (rocheux) ou lissée (collines). */
export function range(seed, fill, opts = {}, smoothIt = false) {
  const pts = ridge(seed, opts)
  return `<path d="${toBottom(smoothIt ? smooth(pts) : poly(pts), pts)}" fill="${fill}"/>`
}

/* ── Dégradés ────────────────────────────────────────────────────── */

export function linear(id, stops, { x1 = 0, y1 = 0, x2 = 0, y2 = 1, units } = {}) {
  const u = units ? ` gradientUnits="${units}"` : ''
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${u}>${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</linearGradient>`
}

export function radial(id, stops, { cx = 0.5, cy = 0.5, r = 0.5, units } = {}) {
  const u = units ? ` gradientUnits="${units}"` : ''
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${u}>${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join('')}</radialGradient>`
}

export const blurFilter = (id, sd) =>
  `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${sd}"/></filter>`

/* ── Éléments d'atmosphère ───────────────────────────────────────── */

/** Ciel : dégradé vertical sur tout le cadre. */
export function sky(id, stops) {
  return { defs: linear(id, stops), body: `<rect width="${S}" height="${S}" fill="url(#${id})"/>` }
}

/** Soleil (ou lune) avec halo. */
export function sun(id, cx, cy, r, core, glow, glowR = r * 6, glowA = 0.55) {
  return {
    defs: radial(`${id}-g`, [
      [0, glow, glowA],
      [0.25, glow, glowA * 0.45],
      [1, glow, 0],
    ]),
    body: `<circle cx="${cx}" cy="${cy}" r="${glowR}" fill="url(#${id}-g)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${core}"/>`,
  }
}

/** Voile de brume horizontal (perspective atmosphérique). */
export function haze(id, y0, y1, color, a0 = 0, a1 = 0.6) {
  return {
    defs: linear(id, [
      [0, color, a0],
      [1, color, a1],
    ]),
    body: `<rect x="0" y="${y0}" width="${S}" height="${y1 - y0}" fill="url(#${id})"/>`,
  }
}

/** Étoiles. */
export function stars(seed, { n = 260, y0 = 0, y1 = 1200, color = '#fff' } = {}) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const s = r() ** 3 * 3.2 + 0.8
    out += `<circle cx="${f(r() * S)}" cy="${f(y0 + r() ** 1.4 * (y1 - y0))}" r="${f(s)}" fill="${color}" opacity="${f(0.25 + r() * 0.7)}"/>`
  }
  return out
}

/**
 * Rangée de nuages « mer de nuages » : bosses serrées, sommets éclairés, bases dans l'ombre.
 */
export function cloudRow(seed, id, { y, rMin, rMax, light, shade, x0 = -260, x1 = S + 260, density = 0.62, lift = 0.85, blur = 0 }) {
  const r = rng(seed)
  let x = x0
  let circles = ''
  while (x < x1) {
    const rad = rMin + r() * (rMax - rMin)
    const cy = y - r() * rad * lift
    circles += `<ellipse cx="${f(x)}" cy="${f(cy)}" rx="${f(rad * 1.18)}" ry="${f(rad)}"/>`
    x += rad * density * 2
  }
  const top = y - rMax * 1.9
  const bottom = y + rMax * 0.25
  const defs =
    linear(`${id}-l`, [
      [0, light],
      [0.38, light],
      [0.78, shade],
      [1, shade],
    ], { x1: 0, y1: top, x2: 0, y2: bottom, units: 'userSpaceOnUse' }) + (blur ? blurFilter(`${id}-b`, blur) : '')
  const body = `<g fill="url(#${id}-l)"${blur ? ` filter="url(#${id}-b)"` : ''}>${circles}<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${S - y + 40}"/></g>`
  return { defs, body }
}

/** Traînées de nuages fins (cirrus, nuages du soir). */
export function streaks(seed, id, { y, x0 = 0, x1 = S, n = 7, h = 26, color = '#fff', opacity = 0.5, blur = 18, spreadY = 120 }) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const w = (x1 - x0) * (0.25 + r() * 0.45)
    const cx = x0 + r() * (x1 - x0)
    const cy = y + (r() - 0.5) * spreadY
    out += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(w / 2)}" ry="${f(h * (0.5 + r()))}" opacity="${f(opacity * (0.5 + r() * 0.5))}"/>`
  }
  return { defs: blurFilter(`${id}-b`, blur), body: `<g fill="${color}" filter="url(#${id}-b)">${out}</g>` }
}

/** Nuage isolé (cumulus allongé). */
export function cloud(seed, id, { cx, cy, w, h, light, shade, blur = 6 }) {
  const r = rng(seed)
  let circles = ''
  const n = 9
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const px = cx - w / 2 + t * w
    const rad = h * (0.45 + Math.sin(Math.PI * t) * 0.55) * (0.8 + r() * 0.4)
    circles += `<circle cx="${f(px)}" cy="${f(cy - rad * 0.35)}" r="${f(rad)}"/>`
  }
  circles += `<rect x="${f(cx - w / 2)}" y="${f(cy - h * 0.2)}" width="${f(w)}" height="${f(h * 0.45)}" rx="${f(h * 0.22)}"/>`
  const defs =
    linear(`${id}-l`, [
      [0, light],
      [1, shade],
    ], { x1: 0, y1: cy - h * 1.2, x2: 0, y2: cy + h * 0.3, units: 'userSpaceOnUse' }) + blurFilter(`${id}-b`, blur)
  return { defs, body: `<g fill="url(#${id}-l)" filter="url(#${id}-b)">${circles}</g>` }
}

/** Reflets scintillants sur l'eau, concentrés autour d'une colonne x. */
export function shimmer(seed, { cx, y0, y1, spread = 260, n = 160, color = '#fff', maxW = 140, opacity = 0.7 }) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const t = r()
    const y = y0 + t ** 1.6 * (y1 - y0)
    const persp = 0.3 + ((y - y0) / (y1 - y0)) * 1.2
    const x = cx + (r() - 0.5) * 2 * spread * persp * (0.4 + r())
    const w = (8 + r() * maxW) * persp
    out += `<rect x="${f(x - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(1.5 + persp * 2.2)}" rx="2" fill="${color}" opacity="${f(opacity * (0.25 + r() * 0.75) * (1 - Math.abs(x - cx) / (spread * 3)))}"/>`
  }
  return out
}

/** Fines lignes de vagues sur toute la largeur. */
export function ripples(seed, { y0, y1, n = 70, color = '#fff', opacity = 0.18 }) {
  const r = rng(seed)
  let out = ''
  for (let i = 0; i < n; i++) {
    const t = i / n
    const y = y0 + t ** 1.5 * (y1 - y0)
    const w = 80 + r() * 380 * (0.4 + t)
    out += `<rect x="${f(r() * S - w / 2)}" y="${f(y)}" width="${f(w)}" height="${f(1 + t * 3)}" rx="2" fill="${color}" opacity="${f(opacity * (0.4 + r() * 0.6))}"/>`
  }
  return out
}

/* ── Silhouettes ─────────────────────────────────────────────────── */

/** Forme effilée le long d'une courbe quadratique (tronc, feuille, branche). */
export function taper(p0, c, p1, w0, w1, { n = 28, profile = null, wobble = 0 } = {}) {
  const L = []
  const R = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0]
    const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]
    const dx = 2 * (1 - t) * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0])
    const dy = 2 * (1 - t) * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1])
    const len = Math.hypot(dx, dy) || 1
    const nx = -dy / len
    const ny = dx / len
    let w = profile ? profile(t) : w0 + (w1 - w0) * t
    if (wobble) w *= 1 + wobble * Math.sin(t * 70)
    L.push([x + (nx * w) / 2, y + (ny * w) / 2])
    R.push([x - (nx * w) / 2, y - (ny * w) / 2])
  }
  return `${smooth(L)} L${smooth(R.reverse()).slice(1)} Z`
}

/** Palmier. */
export function palm(seed, x, y, h, { lean = 0.12, color = '#000', fronds = 9 } = {}) {
  const r = rng(seed)
  const tx = x + lean * h
  const ty = y - h
  const c = [x + lean * h * 0.15 + (r() - 0.5) * h * 0.08, y - h * 0.55]
  let d = taper([x, y], c, [tx, ty], h * 0.05, h * 0.022, { wobble: 0.05 })
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI / 2 + (i / (fronds - 1) - 0.5) * Math.PI * 1.55 + (r() - 0.5) * 0.25
    const len = h * (0.38 + r() * 0.14)
    const ex = tx + Math.cos(a) * len
    const ey = ty + Math.sin(a) * len * 0.55 + len * 0.42
    const cx = tx + Math.cos(a) * len * 0.55
    const cy = ty + Math.sin(a) * len * 0.6 - len * 0.12
    const fw = h * (0.07 + r() * 0.02)
    d += ' ' + taper([tx, ty], [cx, cy], [ex, ey], 0, 0, { profile: (t) => fw * Math.sin(Math.PI * Math.min(1, t * 1.05)) ** 0.7 * (1 - t * 0.35) })
  }
  // couronne
  d += ` M${f(tx - h * 0.03)},${f(ty)} a${f(h * 0.03)},${f(h * 0.025)} 0 1,0 ${f(h * 0.06)},0 a${f(h * 0.03)},${f(h * 0.025)} 0 1,0 ${f(-h * 0.06)},0`
  return `<path d="${d}" fill="${color}"/>`
}

/** Acacia à cime plate. */
export function acacia(seed, x, y, h, color) {
  const r = rng(seed)
  let d = taper([x, y], [x + h * 0.02, y - h * 0.4], [x - h * 0.05, y - h * 0.62], h * 0.05, h * 0.03)
  d += ' ' + taper([x - h * 0.02, y - h * 0.45], [x - h * 0.2, y - h * 0.6], [x - h * 0.42, y - h * 0.78], h * 0.03, h * 0.012)
  d += ' ' + taper([x, y - h * 0.5], [x + h * 0.18, y - h * 0.62], [x + h * 0.38, y - h * 0.8], h * 0.03, h * 0.012)
  let canopy = ''
  const n = 14
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const cx = x - h * 0.75 + t * h * 1.5 + (r() - 0.5) * h * 0.06
    const rx = h * (0.12 + r() * 0.1) * (0.6 + Math.sin(Math.PI * t) * 0.6)
    const ry = rx * (0.28 + r() * 0.14)
    const cy = y - h * 0.84 - Math.sin(Math.PI * t) * h * 0.06 + (r() - 0.5) * h * 0.03
    canopy += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"/>`
  }
  return `<g fill="${color}"><path d="${d}"/>${canopy}</g>`
}

/** Girafe (profil, tournée vers la droite). Hauteur ≈ 650 × s. */
export function giraffe(x, y, s, color, flip = false) {
  const g = (px, py) => `${f(px)},${f(py)}`
  const legs = [
    [-95, -255, -88, 0],
    [-62, -262, -60, 0],
    [58, -278, 66, 0],
    [90, -270, 96, 0],
  ]
    .map(([ax, ay, bx, by]) => `M${g(ax - 9, ay)} L${g(ax + 9, ay)} L${g(bx + 6, by)} L${g(bx - 6, by)} Z`)
    .join(' ')
  const d =
    legs +
    ` M${g(-130, -300)} C${g(-120, -360)} ${g(40, -390)} ${g(110, -360)} C${g(140, -345)} ${g(130, -270)} ${g(90, -258)} L${g(-110, -250)} C${g(-140, -255)} ${g(-140, -285)} ${g(-130, -300)} Z` +
    ` M${g(70, -352)} L${g(118, -372)} L${g(214, -640)} L${g(190, -652)} Z` +
    ` M${g(180, -650)} C${g(200, -680)} ${g(250, -670)} ${g(268, -640)} C${g(262, -628)} ${g(225, -625)} ${g(196, -628)} Z` +
    ` M${g(196, -660)} L${g(192, -700)} L${g(200, -700)} L${g(206, -662)} Z M${g(210, -660)} L${g(212, -698)} L${g(220, -698)} L${g(218, -660)} Z` +
    ` M${g(-128, -300)} L${g(-160, -200)} L${g(-152, -198)} L${g(-122, -290)} Z`
  return `<path transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" d="${d}" fill="${color}"/>`
}

/** Pagode à cinq toits. */
export function pagoda(cx, base, s, color) {
  let d = ''
  let y = base
  const tiers = 5
  for (let i = 0; i < tiers; i++) {
    const k = 1 - i * 0.11
    const w = 118 * k * s
    const rw = 340 * k * s
    const bodyH = (i === 0 ? 96 : 50) * s
    const rh = 36 * s
    // corps
    d += ` M${f(cx - w / 2)},${f(y)} L${f(cx + w / 2)},${f(y)} L${f(cx + w / 2)},${f(y - bodyH)} L${f(cx - w / 2)},${f(y - bodyH)} Z`
    y -= bodyH
    // toit aux extrémités relevées
    d += ` M${f(cx - rw / 2)},${f(y - rh * 0.55)} Q${f(cx - rw * 0.32)},${f(y + rh * 0.15)} ${f(cx - w * 0.55)},${f(y + rh * 0.12)} L${f(cx + w * 0.55)},${f(y + rh * 0.12)} Q${f(cx + rw * 0.32)},${f(y + rh * 0.15)} ${f(cx + rw / 2)},${f(y - rh * 0.55)} Q${f(cx + rw * 0.28)},${f(y - rh * 0.35)} ${f(cx + w * 0.3)},${f(y - rh)} L${f(cx - w * 0.3)},${f(y - rh)} Q${f(cx - rw * 0.28)},${f(y - rh * 0.35)} ${f(cx - rw / 2)},${f(y - rh * 0.55)} Z`
    y -= rh
  }
  // flèche (sōrin)
  d += ` M${f(cx - 5 * s)},${f(y)} L${f(cx + 5 * s)},${f(y)} L${f(cx + 3 * s)},${f(y - 170 * s)} L${f(cx - 3 * s)},${f(y - 170 * s)} Z`
  for (let i = 0; i < 6; i++) d += ` M${f(cx - 14 * s)},${f(y - 30 * s - i * 18 * s)} h${f(28 * s)} v${f(5 * s)} h${f(-28 * s)} Z`
  return `<path d="${d}" fill="${color}"/>`
}

/** Branche fleurie (cerisier) partant d'un coin. */
export function blossomBranch(seed, { x, y, len, angle, color, petals, petals2 }) {
  const r = rng(seed)
  let d = ''
  let flowers = ''
  const grow = (px, py, a, l, w, depth) => {
    const ex = px + Math.cos(a) * l
    const ey = py + Math.sin(a) * l
    const c = [px + Math.cos(a + 0.25) * l * 0.5, py + Math.sin(a + 0.25) * l * 0.5]
    d += ' ' + taper([px, py], c, [ex, ey], w, w * 0.45)
    if (depth > 0) {
      const n = depth > 2 ? 2 : 3
      for (let i = 0; i < n; i++) {
        const t = 0.45 + r() * 0.5
        const bx = (1 - t) ** 2 * px + 2 * (1 - t) * t * c[0] + t * t * ex
        const by = (1 - t) ** 2 * py + 2 * (1 - t) * t * c[1] + t * t * ey
        grow(bx, by, a + (r() - 0.5) * 1.3, l * (0.45 + r() * 0.25), w * 0.55, depth - 1)
      }
    }
    if (depth <= 1) {
      for (let i = 0; i < 9; i++) {
        const t = r()
        const fx = px + (ex - px) * t + (r() - 0.5) * 60
        const fy = py + (ey - py) * t + (r() - 0.5) * 60
        const fr = 9 + r() * 13
        flowers += `<circle cx="${f(fx)}" cy="${f(fy)}" r="${f(fr)}" fill="${r() > 0.4 ? petals : petals2}" opacity="${f(0.75 + r() * 0.25)}"/>`
      }
    }
  }
  grow(x, y, angle, len, 34, 3)
  return `<path d="${d}" fill="${color}"/>${flowers}`
}

/** Sapin. */
export function pine(x, y, h, color) {
  const w = h * 0.36
  let d = `M${f(x - h * 0.02)},${f(y)} L${f(x + h * 0.02)},${f(y)} L${f(x + h * 0.02)},${f(y - h * 0.15)} L${f(x - h * 0.02)},${f(y - h * 0.15)} Z`
  for (let i = 0; i < 4; i++) {
    const by = y - h * 0.1 - i * h * 0.2
    const bw = w * (1 - i * 0.2)
    d += ` M${f(x - bw / 2)},${f(by)} L${f(x)},${f(by - h * 0.38)} L${f(x + bw / 2)},${f(by)} Z`
  }
  return `<path d="${d}" fill="${color}"/>`
}

/** Feuille tropicale allongée (cadrage de premier plan). */
export function leaf(p0, c, p1, width, color) {
  return `<path d="${taper(p0, c, p1, 0, 0, { profile: (t) => width * Math.sin(Math.PI * t) ** 0.65 })}" fill="${color}"/>`
}
