// main.js — « J'ai la solution pour toi » : Max et sa petite IA sur le canapé. Plans posés, une seule chose qui brille (l'hologramme).
import { clamp, lerp, seg, ss, eio, eo, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, scale, rotate, shape, fillOnly, stroke, ell, arc, spline, rr, rect, quad, dot, text, bands, S } from './toon.js';
import { PAL, POSE, mixPose, max, mascot, snacks, coin, padlock } from './chars.js';

const LS = await fetch('out/vo/lipsync.json').then(r => r.json()).catch(() => ({ env: {}, dur: {} }));
const LINES = await fetch('lines.json').then(r => r.json());
const SUB = Object.fromEntries(LINES.map(L => [L.id, L.sub])), WHO = Object.fromEntries(LINES.map(L => [L.id, L.speaker]));
const VO = [['m1', .35], ['m2', 4.4], ['m3', 8.85], ['a1', 10.9], ['a2', 13.75], ['a3', 16.1], ['a4', 20.0], ['a5', 23.15], ['m4', 25.8], ['a6', 27.7], ['a7', 30.0], ['m5', 33.6], ['a8', 35.7]];
const DUR = 41.0;
const SHOTS = [0, 4.2, 10.5, 13.5, 16.0, 19.8, 25.5, 27.5, 29.8, 33.4, 35.5];
const step12 = t => Math.floor(t * 12) / 12;

// bouche : enveloppe de la réplique en cours de ce personnage (échantillonnée à 12 i/s, dessin sur deux)
function talk(t, who) {
  for (const [id, t0] of VO) {
    if (WHO[id] !== who) continue; const e = LS.env[id]; if (!e) continue;
    const i = Math.floor((t - t0) * 12) * 2; if (i >= 0 && i < e.length) return e[i];
  }
  return 0;
}
const blinkAt = (t, ph) => (Math.floor(t * 12) + ph) % 47 === 0;
function cam(cx, cy, z) { translate(W / 2, H / 2); scale(z); translate(-cx, -cy); }

// —— décor : salon la nuit, ternes ——
function room() {
  bands(['#211a45', '#261e4f', '#2b2358'], -400, 1250, -800, 1900);
  fillOnly(rect(-800, 1250, 2700, 1200), '#1a1538', { boil: 0 });
  shape(rr(-700, 330, 480, 520, 18), { fill: '#14103a', lw: 7, shade: () => { dot(-420, 470, 40, '#e8dcae'); for (let i = 0; i < 9; i++) dot(-680 + hash(i) * 420, 360 + hash(i + 9) * 450, 3, '#e8dcae'); } });
  stroke([[-460, 330], [-460, 850]], 6); stroke([[-700, 590], [-220, 590]], 6);
  shape(rr(1300, 1100, 120, 150, 16), { fill: '#6b4e3b' });
  for (let i = 0; i < 5; i++) shape(spline([[1360, 1105], [1300 + i * 30, 960 - i * 8], [1330 + i * 25, 980]]), { fill: '#356f5a', lw: 6 });
  shape(rr(1180, 420, 260, 190, 10), { fill: '#3a3168', lw: 7, shade: () => fillOnly(rr(1200, 440, 220, 150, 6), '#4a4080', { boil: .2 }) });   // cadre au mur
}
function couchBack() { shape(rr(60, 950, 960, 340, 60), { fill: '#6e5140', shade: () => fillOnly(rect(60, 1150, 960, 160), '#55402f', { boil: .3 }) }); }
function couchFront() {
  shape(rr(30, 1180, 1020, 230, 50), { fill: '#7d5f48', shade: () => fillOnly(rect(30, 1330, 1020, 90), '#614835', { boil: .3 }) });
  shape(rr(-20, 1070, 150, 350, 50), { fill: '#6e5140' }); shape(rr(950, 1070, 150, 350, 50), { fill: '#6e5140' });
  stroke([[560, 1200], [560, 1320]], 5);
}
function table() {
  shape(rr(150, 1560, 780, 46, 16), { fill: '#4b3a5e' });
  shape(rr(190, 1600, 30, 140, 8), { fill: '#3a2d4a' }); shape(rr(860, 1600, 30, 140, 8), { fill: '#3a2d4a' });
  snacks(540, 1562, 1);
}

// —— personnages dans le salon ——
function maxAt(t, o = {}) {
  const b = Math.sin(step12(t) * TAU * .22) * 4;   // respiration lente
  const pose = mixPose(o.pose || POSE.slump, o.pose2 || POSE.slump, o.k || 0);
  const P = { ...pose, head: [pose.head[0], pose.head[1] + b], neck: [pose.neck[0], pose.neck[1] + b * .6] };
  max({ x: 330, y: 1235, s: 1, belly: 1.15, pose: P, face: { lid: .5, look: [.35, .45], o: talk(t, 'MAX') * .8, sm: -.35, brow: .4, closed: blinkAt(t, 0), ...o.face } });
}
function buddyAt(t, o = {}) {
  mascot({ x: 800, y: 1192, r: 105, look: [-.6, .1], o: talk(t, 'IA') * .9, sm: .2, blink: blinkAt(t, 23), ...o });
}
function livingRoom(t, o = {}) {
  room(); couchBack(); maxAt(t, o.max); buddyAt(t, o.ai); couchFront(); table();
}

// —— l'hologramme projeté par l'IA : la seule chose qui brille ——
const HX = 560, HY = 720, HW = 460, HH = 380;
function holo(t, k, content) {
  if (k <= .01) return;
  push(); translate(HX, HY); scale(lerp(.6, 1, k), k);
  g.save(); g.shadowColor = '#ff6fa0'; g.shadowBlur = 40;
  shape(rr(-HW / 2, -HH / 2, HW, HH, 34), { fill: '#3a1f4acc', line: '#ff8fb5', lw: 7, boil: .4 });
  g.restore();
  for (let i = 0; i < 6; i++) fillOnly(rect(-HW / 2 + 20, -HH / 2 + 30 + i * 60, HW - 40, 3), '#ff8fb522', { boil: 0 });   // lignes de balayage
  content(t);
  pop();
}
function beam(k) {   // faisceau doux de l'antenne vers l'hologramme
  if (k <= .01) return;
  fillOnly([[834, 940], [HX - HW * .35, HY + HH / 2], [HX + HW * .35, HY + HH / 2]], `rgba(255,143,181,${.12 * k})`, { boil: .2 });
}
function wash(k) { if (k > .01) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .06 * k; g.fillStyle = '#ff4f8b'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }
function vaultIcon(s = 1) {
  push(); scale(s);
  shape(rr(-110, -110, 220, 220, 52), { fill: PAL.portal, lw: 7, shade: () => fillOnly(rr(-110, 30, 220, 80, 0), PAL.portalB, { boil: .3 }) });
  shape(ell(0, 0, 46, 46, 30), { lw: 11, line: '#ffffff', fill: '#00000000' });
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; stroke([[0, 0], [Math.cos(a) * 72, Math.sin(a) * 72]], 11, { line: '#ffffff' }); dot(Math.cos(a) * 76, Math.sin(a) * 76, 13, '#ffffff'); }
  dot(0, 0, 18, '#ffffff'); dot(0, 0, 8, PAL.portal);
  pop();
}
function vaultDoor(x, y, r, open = 0, spin = 0) {   // porte de coffre vue de face
  push(); translate(x, y);
  shape(ell(0, 0, r, r, 36), { fill: '#2a1838', line: '#ffb0cc', lw: 7 });
  if (open < 1) { push(); scale(1 - open, 1); shape(ell(0, 0, r * .86, r * .86, 32), { fill: PAL.portal, lw: 6, shade: () => fillOnly(ell(r * .2, r * .25, r * .7, r * .6, 26), PAL.portalB, { boil: .3 }) });
    push(); rotate(spin); for (let i = 0; i < 3; i++) { const a = i * TAU / 3; stroke([[0, 0], [Math.cos(a) * r * .55, Math.sin(a) * r * .55]], 10, { line: '#fff1d6' }); } dot(0, 0, r * .14, '#fff1d6'); pop(); pop(); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; dot(Math.cos(a) * r * .93, Math.sin(a) * r * .93, 6, '#ffd23f'); }
  pop();
}
const label = (s, x, y, size = 64, col = '#fff1d6', font = 'Bungee', w = 400) => text(s, x, y, { font: `${font === 'Bungee' ? 400 : 800} ${size}px "${font}"`, fill: col, outlineW: size * .2 });

function holoName(t) {   // « Ça s'appelle Vaultr »
  vaultIcon(.85 * back(seg(t, 14.35, 14.7), 1.2));
  if (t > 14.6) label('VAULTR', 0, 145, 66);
}
function holoStake(t) {   // « Tu mets de l'argent en jeu. 50 € »
  vaultDoor(0, 10, 115, 0, 0);
  for (let i = 0; i < 5; i++) {   // pièces qui partent du côté de Max et entrent dans le coffre
    const t0 = 17.2 + i * .28, u = eio(seg(t, t0, t0 + .7)); if (u <= 0) continue;
    if (u < 1) coin(lerp(-210, 0, u), lerp(140, 10, u) - Math.sin(u * Math.PI) * 90, 30 * (1 - u * .4), u * 6);
  }
  const n = Math.round(50 * clamp(seg(t, 17.2, 18.9)));
  label(`${n} €`, 0, -140, 64, '#ffd77a');
}
const DAYS = [20.55, 21.1, 21.65, 22.2, 22.75];
function holoSessions(t) {   // chaque séance faite rend une partie ; tout fait = tout récupéré
  const done = DAYS.filter(d => t >= d).length;
  vaultDoor(-95, 40, 95, 0, done * .6);
  DAYS.forEach((d, i) => {   // les cinq séances de la semaine
    const x = -170 + i * 85, on = t >= d;
    shape(rr(x - 30, -158, 60, 60, 16), { fill: on ? '#5fd6b0' : '#2a1838', line: '#ffb0cc', lw: 5 });
    if (on) stroke([[x - 14, -128], [x - 3, -116], [x + 16, -142]], 8, { line: INK });
    const u = seg(t, d, d + .55); if (u > 0 && u < 1) coin(lerp(-95, 150, eio(u)), lerp(40, 60, u) - Math.sin(u * Math.PI) * 110, 28, u * 8);
  });
  const back10 = Math.min(5, DAYS.filter(d => t >= d + .55).length);
  label(`+${back10 * 10} €`, 150, 60, t > 23.3 ? lerp(54, 74, eo(seg(t, 23.3, 23.6))) : 54, '#ffd77a');
  if (t > 23.4) label('tout récupéré', 0, 165, 34, '#5fd6b0', 'Baloo 2');
}
function holoLock(t) {   // « L'argent reste dans le coffre »
  vaultDoor(0, 30, 120, 0, 0);
  label('50 €', 0, -140, 60, t > 28.4 ? '#ff6b7f' : '#ffd77a');
  if (t > 28.2) padlock(0, 60, back(seg(t, 28.2, 28.4), 1.4) * .62, ss(seg(t, 28.45, 28.6)));
}

// —— plans ——
function hookText(t) {
  const a = 1 - ss(seg(t, 3.7, 4.2)); if (a <= 0) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  const f = '800 64px "Baloo 2"';
  for (const [s, y, col] of [['Si t\'abandonnes toujours le sport…', 300, '#ffffff'], ['écoute ça.', 385, '#ffd77a']]) {
    g.font = f; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 13; g.strokeStyle = INK; g.strokeText(s, 540, y); g.fillStyle = col; g.fillText(s, 540, y);
  }
  g.globalAlpha = 1;
}
function shotHook(t) {   // 0 → 4.2 : gros plan, Max perdu ; push-in très lent
  frame(t, { amp: 1.3 }); push(); cam(290, 980, lerp(2.3, 2.45, ss(seg(t, 0, 4.2))));
  livingRoom(t, { max: { face: { lid: .55, look: [.1, .7], sm: -.45, brow: .6 } } });
  pop();
  hookText(t);
}
function shotTwo(t) {   // 4.2 → 10.5 : plan à deux, les sodas, les frites ; « Regarde-moi »
  frame(t, { amp: 1.3 }); push(); cam(560, 1100, lerp(1.18, 1.26, ss(seg(t, 4.2, 10.5))));
  const hk = ss(seg(t, 8.75, 9.1)) * (1 - ss(seg(t, 10.0, 10.4)));
  livingRoom(t, { max: { pose2: POSE.slumpHand, k: hk, face: { lid: lerp(.5, .6, hk), look: hk > .5 ? [.2, 1] : [.5, .35], sm: -.45, brow: .6 } }, ai: { look: [-.7, .15], sm: lerp(.2, -.2, ss(seg(t, 6, 8))) } });
  pop();
}
function shotBuddy(t) {   // 10.5 → 13.5 : gros plan sur l'IA, posée, sérieuse
  frame(t, { amp: 1.3 }); push(); cam(790, 1030, lerp(2.3, 2.4, ss(seg(t, 10.5, 13.5))));
  livingRoom(t, { ai: { look: [-.8, .1], sm: lerp(-.1, .45, ss(seg(t, 12.2, 12.8))), tilt: -.05 } });
  pop();
}
function shotReveal(t) {   // 13.5 → 16.0 : l'IA lève la main, l'hologramme s'allume
  const k = eo(seg(t, 13.9, 14.4));
  frame(t, { amp: 1.3 }); push(); cam(560, 1040, 1.2);
  room(); couchBack(); beam(k);
  maxAt(t, { face: { lid: lerp(.5, .15, k), look: [lerp(.5, .3, k), lerp(.35, -.9, k)], sm: -.2, brow: .2 } });
  buddyAt(t, { armL: ss(seg(t, 13.6, 13.95)), glow: k, look: [-.3, -.6] });
  couchFront(); table();
  holo(t, k, holoName);
  pop(); wash(k);
}
function shotHolo(content, zoom = 1.7) {   // plans d'hologramme : par-dessus l'épaule, les deux de dos aux bords
  return t => {
    frame(t, { amp: 1.3 }); push(); cam(HX, HY + 30, zoom);
    room(); couchBack(); beam(1);
    maxAt(t, { face: { lid: .15, look: [.3, -.9], sm: -.1 } }); buddyAt(t, { glow: 1, look: [-.3, -.7] });
    couchFront();
    holo(t, 1, content);
    pop(); wash(1);
  };
}
function shotFear(t) {   // 25.5 → 27.5 : « Et si je lâche ? » — la musique s'arrête
  frame(t, { amp: 1.3 }); push(); cam(300, 960, lerp(2.3, 2.55, ss(seg(t, 25.5, 27.5))));
  livingRoom(t, { max: { face: { lid: .25, look: [.7, .1], sm: -.5, brow: 1 } } });
  pop(); wash(.6);
}
function shotFriend(t) {   // 29.8 → 33.4 : l'IA pose sa petite main sur le bras de Max
  const k = ss(seg(t, 30.0, 30.5)), up = ss(seg(t, 31.5, 33.0));
  frame(t, { amp: 1.3 }); push(); cam(560, 1080, lerp(1.25, 1.35, ss(seg(t, 29.8, 33.4))));
  livingRoom(t, { max: { pose2: POSE.sit, k: up * .6, face: { lid: lerp(.45, .2, up), look: [.8, .2], sm: lerp(-.3, .15, up), brow: lerp(.5, 0, up) } }, ai: { armL: k * .55, look: [-.8, -.2], sm: .45, tilt: -.06 * k } });
  pop();
}
function shotSmile(t) {   // 33.4 → 35.5 : Max se redresse, petit sourire
  const up = ss(seg(t, 33.4, 34.6));
  frame(t, { amp: 1.3 }); push(); cam(310, 950, 2.3);
  livingRoom(t, { max: { pose: POSE.mixSit || POSE.slump, pose2: POSE.sit, k: lerp(.6, 1, up), face: { lid: .12, look: [.8, 0], sm: lerp(.2, .7, up), brow: 0 } } });
  pop();
}
function endCard(t) {   // 35.5 → fin : VAULTR + la petite IA
  frame(t, { amp: 1.2 });
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1238'; g.fillRect(0, 0, W, H);
  S.sid = 1000;
  push(); translate(540, 640); vaultIcon(1.15 * back(seg(t, 35.6, 35.95), 1.2)); pop();
  if (t > 35.95) { push(); translate(540, 900); scale(back(seg(step12(t), 35.95, 36.2), 1.3)); text('VAULTR', 10, 10, { font: '400 170px "Bungee"', fill: PAL.portal, outlineW: 24 }); text('VAULTR', 0, 0, { font: '400 170px "Bungee"', fill: '#fff1d6', outlineW: 24 }); pop(); }
  if (t > 36.9) { push(); translate(540, 1060); scale(back(seg(step12(t), 36.9, 37.15), 1.2)); text('Ton effort te rembourse.', 0, 0, { font: '800 66px "Baloo 2"', fill: '#ffd77a', outlineW: 15 }); pop(); }
  if (t > 38.3) { push(); translate(540, 1170); text('Tu mises · tu t\'entraînes · tu récupères', 0, 0, { font: '700 42px "Baloo 2"', fill: '#ffffff', outlineW: 10 }); pop(); }
  if (t > 39.0) { push(); translate(540, 1250); text('Bientôt sur iOS et Android', 0, 0, { font: '700 42px "Baloo 2"', fill: '#5fd6b0', outlineW: 10 }); pop(); }
  mascot({ x: 540, y: 1560, r: 95, look: [-.6, -.4], o: talk(t, 'IA') * .9, sm: .6, blink: blinkAt(t, 5), armL: .4 + .15 * Math.sin(step12(t) * 5), glow: 1 });
}

// —— sous-titres (zone sûre TikTok : haut 150 px, bas ~420 px, droite ~140 px) ——
function wrap(txt, maxW, font) {
  g.save(); g.font = font; const words = txt.split(' '), out = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; }
  if (cur) out.push(cur); g.restore(); return out;
}
export function cueList() { return VO.map(([id, t0], i) => { const d = LS.dur[id] || 1.5, nxt = VO[i + 1] ? VO[i + 1][1] : DUR; return { id, t0, t1: Math.min(nxt - .05, t0 + d + .5) }; }); }
function subtitle(t) {
  if (t >= 35.5) return;
  const c = cueList().filter(c => t >= c.t0 && t < c.t1).pop(); if (!c) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const who = WHO[c.id], L = wrap(SUB[c.id], 780, '800 56px "Baloo 2"'), y0 = 1430 - (L.length - 1) * 32;
  g.font = '800 56px "Baloo 2"'; const bw = Math.max(...L.map(l => g.measureText(l).width)) + 60;   // bandeau sombre : lisible même sur les frites
  g.globalAlpha = .55; g.fillStyle = '#120c26'; g.beginPath(); g.roundRect(540 - bw / 2, y0 - 46, bw, L.length * 64 + 28, 26); g.fill(); g.globalAlpha = 1;
  g.font = '800 32px "Baloo 2"'; const pw = who === 'MAX' ? 104 : 70;
  g.fillStyle = who === 'MAX' ? PAL.hood : PAL.ai; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.roundRect(540 - pw / 2, y0 - 98, pw, 46, 23); g.fill(); g.stroke();
  g.fillStyle = who === 'MAX' ? INK : '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(who, 540, y0 - 74);
  g.font = '800 56px "Baloo 2"';
  L.forEach((l, i) => { g.lineWidth = 12; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText(l, 540, y0 + i * 64); g.fillStyle = '#fff'; g.fillText(l, 540, y0 + i * 64); });
}

// —— rendu ——
const cv = document.getElementById('c'); init(cv);
const PLAN = [shotHook, shotTwo, shotBuddy, shotReveal, shotHolo(holoStake), shotHolo(holoSessions), shotFear, shotHolo(holoLock), shotFriend, shotSmile, endCard];
window.DUR = DUR;
window.render = t => {
  let i = SHOTS.length - 1; while (i > 0 && t < SHOTS[i]) i--;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  PLAN[i](t);
  subtitle(t);
};
window.TEXTS = t => [];
window.CUES = () => cueList().map(c => ({ ...c, who: WHO[c.id], text: SUB[c.id] }));
// événements sonores pour le mixage
const EV = [];
VO.forEach(([id, t0]) => EV.push({ t: t0, type: 'vo', id }));
EV.push({ t: 14.0, type: 'holoOn' }, { t: 28.2, type: 'lockDrop' }, { t: 28.5, type: 'lock' }, { t: 35.6, type: 'title' });
for (let i = 0; i < 5; i++) EV.push({ t: 17.2 + i * .28 + .7, type: 'coinIn' });
DAYS.forEach(d => EV.push({ t: d, type: 'tick' }, { t: d + .55, type: 'clink' }));
SHOTS.forEach(t => t > 0 && EV.push({ t, type: 'cut' }));
window.EV = EV.sort((a, b) => a.t - b.t);
document.fonts.load('800 56px "Baloo 2"').then(() => document.fonts.load('400 100px "Bungee"')).then(() => document.fonts.ready).then(() => { window.READY = true; });
