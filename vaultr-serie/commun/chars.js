// chars.js — distribution originale : Max (bandeau éponge jamais utilisé), l'IA (visage sur l'écran du téléphone), le coffre-portail
// Origine des personnages = le bassin, y vers le bas, de profil 3/4 tourné vers la droite.
import { clamp, lerp, TAU } from '/core/lib.js';
import { INK, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text, g } from './toon.js';

export const PAL = {
  skin: '#f0c39b', skinS: '#d29e76', hair: '#3b2a24', hood: '#e3a92b', hoodS: '#b9831b', jean: '#2f6f8f', jeanS: '#24566f',
  band: '#e8574e', bandS: '#c23f37', shoe: '#f4f1ea', shoeS: '#cfc8bb', sole: '#e8574e', white: '#ffffff', mouthIn: '#4a1a2a', tongue: '#e8637a',
  ai: '#ff5c9a', aiS: '#e0407e', coin: '#ffd23f', coinS: '#e0a91c', lock: '#ff3b5c', lockS: '#c92340',
  portal: '#ff4f8b', portalA: '#ffb03a', portalB: '#ff7a5c', portalCore: '#fff1d6', bolt: '#ffd23f',
};

// —— visage ——
export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.skin, closed = false, lw = 6, jitter = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), {
    fill: PAL.white, lw, shade: () => {
      dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
      if (lid > 0) {
        const yl = cy - ry + lid * 2 * ry;
        fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 });
        stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw);
      }
    }
  });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, skew = 0, lw = 6 } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k + skew * k], rc = [cx + hw, cy - sm * k - skew * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62;
  const up = quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), dn = quad(rc, [cx, cy + h + sm * k * .6], lc, 14);
  shape([...up, ...dn], {
    fill: PAL.mouthIn, lw, shade: () => {
      if (o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .32 + 6), PAL.white, { boil: .3 });
      fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 });
    }
  });
}
export function hand(x, y, ang, r = 22, { fist = false, lw = 6, thumbUp = false } = {}) {
  push(); translate(x, y); rotate(ang);
  const pts = fist ? spline([[-r * .6, -r * .8], [r * .7, -r * .9], [r * 1.1, -r * .1], [r * .8, r * .8], [-r * .5, r * .9], [-r * .9, 0]])
    : spline([[-r * .5, -r * .85], [r * .5, -r * 1.05], [r * 1.35, -r * .75], [r * 1.05, -r * .3], [r * 1.5, -r * .1], [r * 1.1, r * .3], [r * 1.35, r * .7], [r * .6, r * .95], [-r * .6, r * .8], [-r * .95, 0]]);
  shape(pts, { fill: PAL.skin, lw });
  if (thumbUp) shape(spline([[-r * .1, -r * .7], [-r * .25, -r * 1.9], [r * .25, -r * 2.0], [r * .35, -r * .8]]), { fill: PAL.skin, lw });
  pop();
}
const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// —— poses de Max (points locaux, bassin en [0,0]) ——
const P0 = { neck: [0, -230], head: [0, -335], shF: [35, -205], shB: [-35, -205], elF: [80, -110], haF: [95, -20], elB: [-80, -110], haB: [-90, -20], knF: [30, 150], ftF: [40, 300], knB: [-30, 150], ftB: [-40, 300] };
export const POSE = {
  stand: P0,
  sit: { neck: [-25, -215], head: [-15, -322], shF: [15, -195], shB: [-60, -195], elF: [55, -105], haF: [70, -165], elB: [-30, -100], haB: [30, -160], knF: [165, -5], ftF: [175, 165], knB: [150, -15], ftB: [150, 160] },
  slumpHand: { neck: [-60, -190], head: [-55, -295], shF: [-20, -175], shB: [-95, -170], elF: [40, -120], haF: [70, -60], elB: [-40, -90], haB: [20, -145], knF: [170, 0], ftF: [185, 165], knB: [155, -10], ftB: [160, 160] },
  slump: { neck: [-60, -190], head: [-55, -295], shF: [-20, -175], shB: [-95, -170], elF: [30, -95], haF: [55, -150], elB: [-40, -90], haB: [20, -145], knF: [170, 0], ftF: [185, 165], knB: [155, -10], ftB: [160, 160] },
  cheer: { neck: [0, -232], head: [0, -340], shF: [35, -210], shB: [-35, -210], elF: [95, -300], haF: [115, -395], elB: [-95, -300], haB: [-115, -395], knF: [45, 140], ftF: [50, 290], knB: [-45, 140], ftB: [-55, 290] },
  pushUp: { neck: [225, -40], head: [325, -60], shF: [200, -40], shB: [190, -50], elF: [205, 25], haF: [215, 95], elB: [185, 22], haB: [190, 95], knF: [-150, 50], ftF: [-305, 95], knB: [-150, 45], ftB: [-300, 95] },
  pushDown: { neck: [225, 30], head: [330, 20], shF: [200, 35], shB: [190, 28], elF: [150, 70], haF: [215, 95], elB: [140, 66], haB: [190, 95], knF: [-150, 70], ftF: [-305, 95], knB: [-150, 66], ftB: [-300, 95] },
  plank: { neck: [225, -45], head: [325, -60], shF: [205, -40], shB: [195, -48], elF: [205, 90], haF: [300, 92], elB: [190, 90], haB: [285, 92], knF: [-150, 50], ftF: [-305, 92], knB: [-150, 46], ftB: [-300, 92] },
};
export function runPose(ph) {   // cycle de course de profil
  const s = Math.sin(ph * TAU), c = Math.cos(ph * TAU);
  return {
    neck: [22, -228], head: [40, -332], shF: [50, -205], shB: [0, -205],
    elF: [50 - 70 * s, -120], haF: [100 - 90 * s, -150 - 30 * Math.max(0, s)], elB: [0 + 70 * s, -120], haB: [50 + 90 * s, -150 - 30 * Math.max(0, -s)],
    knF: [60 + 70 * s, 120 - 40 * Math.max(0, s)], ftF: [20 + 110 * s, 270 - 70 * Math.max(0, c)],
    knB: [60 - 70 * s, 120 - 40 * Math.max(0, -s)], ftB: [20 - 110 * s, 270 - 70 * Math.max(0, -c)],
  };
}
export function mixPose(a, b, k) { const o = {}; for (const key in a) o[key] = [lerp(a[key][0], b[key][0], k), lerp(a[key][1], b[key][1], k)]; return o; }

// Max entier. P : { x, y, s, pose, face:{ lid, look, o, sm, brow, jitter, sweat, closed }, phone:{ on, screen }, thumb }
export function max(P) {
  const J = P.pose, F = P.face || {};
  push(); translate(P.x, P.y); scale(P.s || 1);
  const limb = (a, b, w0, w1, col, bend = 0) => shape(noodle(a, b, bend, w0, w1), { fill: col });
  // bras arrière, jambe arrière
  limb(J.shB, J.elB, 54, 48, PAL.hoodS); limb(J.elB, J.haB, 48, 42, PAL.hoodS);
  if (!P.phone?.hideBackHand) hand(J.haB[0], J.haB[1], Math.atan2(J.haB[1] - J.elB[1], J.haB[0] - J.elB[0]), 22);
  limb([-10, 10], J.knB, 66, 60, PAL.jeanS); limb(J.knB, J.ftB, 58, 52, PAL.jeanS);
  shoe(J.ftB, J.knB);
  // torse (sweat trop grand) + capuche
  const hip = [0, 0];
  shape(ell(J.neck[0] - 35, J.neck[1] + 10, 70, 46, 30), { fill: PAL.hoodS });
  shape(noodle(hip, J.neck, -8, 190, 165), { fill: PAL.hood, shade: () => fillOnly(noodle([hip[0] - 40, hip[1]], [J.neck[0] - 40, J.neck[1]], -8, 90, 70), PAL.hoodS, { boil: .4 }) });
  stroke(quad([J.neck[0] - 10, J.neck[1] + 70], [J.neck[0] + 30, J.neck[1] + 110], [J.neck[0] + 10, J.neck[1] + 150]), 5);
  // ventre (il s'est un peu laissé aller)
  if (P.belly) shape(ell(J.neck[0] * .3 + 48, J.neck[1] * .3 - 4, 92 * P.belly, 84 * P.belly, 30), { fill: PAL.hood, shade: () => fillOnly(ell(J.neck[0] * .3 + 30, J.neck[1] * .3 + 40, 80 * P.belly, 50 * P.belly, 24), PAL.hoodS, { boil: .4 }) });
  // jambe avant
  limb([10, 12], J.knF, 68, 62, PAL.jean); limb(J.knF, J.ftF, 60, 54, PAL.jean);
  shoe(J.ftF, J.knF);
  // tête
  head(J.head, F);
  // bras avant (+ téléphone tenu)
  limb(J.shF, J.elF, 56, 50, PAL.hood); limb(J.elF, J.haF, 50, 44, PAL.hood);
  if (P.phone?.on) phoneSmall(J.haF[0] + 8, J.haF[1] - 46, P.phone.a || -.15, P.phone.lit);
  hand(J.haF[0], J.haF[1], Math.atan2(J.haF[1] - J.elF[1], J.haF[0] - J.elF[0]), 23, { thumbUp: P.thumb });
  if (F.sweat) { sweat(J.head[0] - 70, J.head[1] - 60, 1.2); sweat(J.head[0] + 90, J.head[1] - 40, 1); }
  pop();
}
function shoe(ft, kn) {
  const ang = Math.atan2(ft[1] - kn[1], ft[0] - kn[0]) - Math.PI / 2;
  push(); translate(ft[0], ft[1]); rotate(ang * .4);
  shape(spline([[-26, -18], [40, -22], [62, 0], [56, 20], [-30, 20]]), { fill: PAL.shoe, shade: () => fillOnly(rect(-40, 10, 120, 20), PAL.sole, { boil: .3 }) });
  pop();
}
function head(c, F) {
  push(); translate(c[0], c[1]); rotate(F.tilt || 0);
  shape(ell(-62, 10, 18, 26, 20), { fill: PAL.skin });   // oreille
  shape(spline([[-92, -10], [-85, -78], [-20, -108], [60, -100], [98, -40], [96, 40], [70, 95], [0, 108], [-70, 85]]), {
    fill: PAL.skin, shade: () => fillOnly(ell(-70, 30, 60, 90, 24), PAL.skinS, { boil: .4 })
  });
  // cheveux en bataille
  shape(spline([[-95, -20], [-100, -95], [-55, -135], [-10, -118], [20, -140], [55, -110], [95, -95], [92, -55], [40, -70], [-20, -60], [-60, -40]]), { fill: PAL.hair });
  // bandeau éponge (jamais utilisé)
  shape(spline([[-98, -48], [-20, -64], [60, -66], [100, -56], [100, -30], [60, -40], [-20, -38], [-98, -22]]), {
    fill: PAL.band, shade: () => fillOnly(rect(-120, -50, 240, 6), PAL.white, { boil: .3 })
  });
  // sourcils
  const br = F.brow || 0;
  stroke([[2, -14 - br * 10], [38, -20 + br * 6]], 7); stroke([[56, -20 + br * 6], [92, -14 - br * 10]], 7);
  // yeux (se touchent de 3/4)
  const ey = F.big ? 1.25 : 1;
  eye(22, 14, 25 * ey, 30 * ey, { lid: F.lid ?? .45, look: F.look || [0, 0], pupil: F.big ? 4 : 4.5, jitter: F.jitter || 0, closed: F.closed });
  eye(72, 14, 25 * ey, 30 * ey, { lid: F.lid ?? .45, look: F.look || [0, 0], pupil: F.big ? 4 : 4.5, jitter: F.jitter || 0, closed: F.closed });
  // cernes
  if (!F.big && !F.closed) { stroke(arc(22, 40, 20, 8, .3, 2.8, 8), 4); stroke(arc(72, 40, 20, 8, .3, 2.8, 8), 4); }
  shape(spline([[86, 18], [112, 40], [92, 50]]), { fill: PAL.skin, lw: 6 });   // nez
  mouth(58, 72, 46, { o: F.o || 0, sm: F.sm || 0, skew: F.skew || 0, w: F.w || 1 });
  pop();
}
export function phoneSmall(x, y, a, lit = 1) {
  push(); translate(x, y); rotate(a);
  shape(rr(-34, -62, 68, 124, 14), { fill: '#1e1a2e', lw: 6, shade: () => fillOnly(rr(-27, -54, 54, 108, 8), lit ? '#f7f3ff' : '#2a2540', { boil: .2 }) });
  pop();
}

// —— l'IA : un visage rond sur l'écran ——
export function aiFace(cx, cy, r, { o = 0, look = [0, 0], blink = false, sm = .3, lid = .15 } = {}) {
  shape(spline(Array.from({ length: 10 }, (_, i) => { const a = i / 10 * TAU; return [cx + Math.cos(a) * r * (1 + .03 * Math.sin(i * 2.3)), cy + Math.sin(a) * r * (1 + .03 * Math.cos(i * 1.7))]; })), {
    fill: PAL.ai, shade: () => fillOnly(ell(cx + r * .35, cy + r * .4, r * .7, r * .6, 30), PAL.aiS, { boil: .4 })
  });
  eye(cx - r * .3, cy - r * .1, r * .26, r * .3, { lid: blink ? .98 : lid, look, pupil: Math.max(3, r * .05), skin: PAL.ai, lw: 6 });
  eye(cx + r * .3, cy - r * .1, r * .26, r * .3, { lid: blink ? .98 : lid, look, pupil: Math.max(3, r * .05), skin: PAL.ai, lw: 6 });
  mouth(cx, cy + r * .45, r * .5, { o, sm });
}

// —— pièce ——
export function coin(x, y, r = 34, spin = 0) {
  const sx = Math.max(.15, Math.abs(Math.cos(spin)));
  push(); translate(x, y); scale(sx, 1);
  shape(ell(0, 0, r, r, 28), { fill: PAL.coin, shade: () => fillOnly(ell(r * .25, r * .3, r * .8, r * .7, 24), PAL.coinS, { boil: .3 }) });
  if (sx > .45) text('€', 0, 2, { font: `800 ${r * 1.15}px "Baloo 2"`, fill: INK });
  pop();
}

// —— cadenas ——
export function padlock(x, y, s, shut) {
  push(); translate(x, y); scale(s);
  stroke(arc(0, -40 - (1 - shut) * 60, 55, 70, Math.PI, TAU, 20), 22, { line: INK });
  stroke(arc(0, -40 - (1 - shut) * 60, 55, 70, Math.PI, TAU, 20), 12, { line: PAL.lock });
  shape(rr(-90, -40, 180, 150, 28), { fill: PAL.lock, shade: () => fillOnly(rect(20, -40, 80, 160), PAL.lockS, { boil: .3 }) });
  shape(ell(0, 25, 18, 18, 16), { fill: INK }); shape(rr(-8, 30, 16, 45, 6), { fill: INK });
  pop();
}

// —— le coffre-portail : seule chose qui brille ——
export function portal(cx, cy, R, k, t, { wash = true } = {}) {
  if (k <= 0.01) return;
  push(); translate(cx, cy); scale(k * .78, k);
  const lump = Array.from({ length: 22 }, (_, i) => { const a = i / 22 * TAU; const r = R * (1 + .05 * Math.sin(i * 3.1 + t * 2)); return [Math.cos(a) * r, Math.sin(a) * r]; });
  shape(spline(ell(0, 0, R * 1.18, R * 1.18, 40)), { fill: PAL.portal + '33', stroke: false, boil: 0 });   // anneau translucide plat
  shape(spline(lump), {
    fill: PAL.portal, lw: 8, shade: () => {
      for (let i = 0; i < 6; i++) {
        const a0 = i / 6 * TAU + t * 2.2, pts = [];
        for (let j = 0; j <= 18; j++) { const u = j / 18, a = a0 + u * 2.6; pts.push([Math.cos(a) * R * u, Math.sin(a) * R * u]); }
        for (let j = 18; j >= 0; j--) { const u = j / 18, a = a0 + .32 + u * 2.6; pts.push([Math.cos(a) * R * u * .96, Math.sin(a) * R * u * .96]); }
        fillOnly(pts, i % 2 ? PAL.portalA : PAL.portalB, { boil: .5 });
      }
      fillOnly(ell(0, 0, R * .3, R * .3, 26), PAL.portalCore, { boil: .4 });
    }
  });
  // verrous de coffre autour de l'anneau
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + .1; push(); translate(Math.cos(a) * R * 1.02, Math.sin(a) * R * 1.02); rotate(a); shape(rr(-14, -9, 28, 18, 7), { fill: PAL.bolt, lw: 5 }); pop(); }
  // étincelles en orbite
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + t * 1.3; dot(Math.cos(a) * R * 1.3, Math.sin(a) * R * 1.3, 5, PAL.portalCore); }
  pop();
  if (wash) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .07 * clamp(k); g.fillStyle = PAL.portal; g.fillRect(0, 0, 1080, 1920); g.globalAlpha = 1; }
}

// —— l'IA : petite mascotte ronde, meilleur pote de Max (assise sur le coussin) ——
// M : { x, y (bas du corps), r, o (bouche), look, blink, sm, lid, tilt, armL (lève la main gauche 0..1), glow (antenne allumée 0..1) }
export function mascot(M) {
  const r = M.r || 110, look = M.look || [0, 0];
  push(); translate(M.x, M.y); rotate(M.tilt || 0);
  // petits pieds qui pendent du coussin
  shape(ell(-r * .4, -r * .02, r * .2, r * .14, 16), { fill: PAL.aiS }); shape(ell(r * .35, -r * .02, r * .2, r * .14, 16), { fill: PAL.aiS });
  // bras droit (posé)
  shape(ell(r * .98, -r * .62, r * .17, r * .26, 16), { fill: PAL.ai });
  // corps : une boule douce un peu aplatie en bas
  const body = Array.from({ length: 14 }, (_, i) => { const a = i / 14 * TAU; return [Math.cos(a) * r * (1 + .02 * Math.sin(i * 2.1)), -r * .95 + Math.sin(a) * r * (Math.sin(a) > 0 ? .92 : 1.02)]; });
  shape(spline(body), { fill: PAL.ai, shade: () => { fillOnly(ell(r * .38, -r * .5, r * .78, r * .62, 30), PAL.aiS, { boil: .4 }); fillOnly(ell(-r * .45, -r * 1.45, r * .2, r * .11, 14), '#ff9cc2', { boil: .3 }); } });
  // antenne
  stroke(quad([r * .05, -r * 1.9], [r * .12, -r * 2.25], [r * .3, -r * 2.38]), 6);
  shape(ell(r * .32, -r * 2.4, r * .13, r * .13, 16), { fill: M.glow ? '#fff1d6' : '#ffd77a', lw: 5 });
  // joues
  fillOnly(ell(-r * .62, -r * .78, r * .14, r * .08, 14), '#ff8fb5', { boil: .3 }); fillOnly(ell(r * .62, -r * .78, r * .14, r * .08, 14), '#ff8fb5', { boil: .3 });
  // grands yeux
  const blink = M.blink, lid = blink ? .98 : (M.lid ?? .05);
  eye(-r * .33, -r * 1.08, r * .25, r * .32, { lid, look, pupil: r * .1, skin: PAL.ai, lw: 6 });
  eye(r * .33, -r * 1.08, r * .25, r * .32, { lid, look, pupil: r * .1, skin: PAL.ai, lw: 6 });
  if (!blink) { dot(-r * .33 + look[0] * r * .14 + r * .05, -r * 1.16 + look[1] * r * .1, r * .035, '#ffffff'); dot(r * .33 + look[0] * r * .14 + r * .05, -r * 1.16 + look[1] * r * .1, r * .035, '#ffffff'); }
  mouth(0, -r * .6, r * .32, { o: M.o || 0, sm: M.sm ?? .3, lw: 6 });
  // bras gauche : posé, ou levé (main ouverte vers l'hologramme / vers Max)
  const k = M.armL || 0;
  push(); translate(-r * .92, -r * .7); rotate(-k * 2.1); shape(ell(0, r * .12, r * .17, r * .27, 16), { fill: PAL.ai }); pop();
  pop();
}

// —— la table basse du canapé : sodas, frites, emballages ——
export function snacks(x, y, s = 1) {
  push(); translate(x, y); scale(s);
  // canette couchée
  push(); translate(-250, -18); rotate(1.5); shape(rr(-26, -48, 52, 96, 12), { fill: '#d8433f', shade: () => fillOnly(rect(-30, -10, 60, 18), '#f4f1ea', { boil: .3 }) }); pop();
  // deux canettes debout
  for (const [cx, c] of [[-150, '#d8433f'], [210, '#3f7dd8']]) shape(rr(cx - 28, -112, 56, 112, 12), { fill: c, shade: () => { fillOnly(rect(cx - 30, -70, 60, 20), '#f4f1ea', { boil: .3 }); fillOnly(rect(cx + 8, -112, 22, 112), '#00000033', { boil: .2 }); } });
  // cornet de frites
  for (let i = 0; i < 7; i++) shape(rr(-20 + i * 17 - 6, -170 + (i % 3) * 14, 15, 90, 5), { fill: '#ffd23f', lw: 5 });
  shape(spline([[-40, -100], [110, -100], [92, 0], [-22, 0]]), { fill: '#e8574e', shade: () => fillOnly(ell(35, -55, 26, 26, 18), '#ffd23f', { boil: .3 }) });
  // emballage froissé + frites tombées
  shape(spline([[300, -20], [340, -50], [380, -30], [370, 0], [310, 0]]), { fill: '#f4f1ea', lw: 5 });
  for (let i = 0; i < 3; i++) { push(); translate(70 + i * 40, -6); rotate(.3 + i * .5); shape(rr(-30, -6, 60, 12, 5), { fill: '#ffd23f', lw: 4 }); pop(); }
  pop();
}
