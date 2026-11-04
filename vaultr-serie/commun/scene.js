// scene.js — moteur commun de la série « Max & son IA » : le salon la nuit, le canapé, Max et sa petite IA, l'hologramme
// (la seule chose qui brille), sous-titres, carton final. L'épisode est décrit par episode.json ; le minutage vient de out/plan.json.
import { clamp, lerp, seg, ss, eio, eo, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, scale, rotate, shape, fillOnly, stroke, ell, rr, rect, dot, text, bands, S } from './toon.js';
import { PAL, POSE, mixPose, max, mascot, snacks, coin, padlock } from './chars.js';

const E = await fetch('episode.json').then(r => r.json());
const P = await fetch('out/plan.json').then(r => r.json()).catch(() => ({ dur: 10, beats: [] }));
const LS = await fetch('out/vo/lipsync.json').then(r => r.json()).catch(() => ({ env: {}, dur: {} }));
const LINE = Object.fromEntries(E.lines.map(L => [L.id, L]));
const SEQ = P.beats.flatMap(b => b.lines.map(l => ({ ...l, who: LINE[l.id].speaker, sub: LINE[l.id].sub })));
const DUR = P.dur;
const step12 = t => Math.floor(t * 12) / 12;
function talk(t, who) {
  for (const l of SEQ) { if (l.who !== who) continue; const e = LS.env[l.id]; if (!e) continue; const i = Math.floor((t - l.t0) * 12) * 2; if (i >= 0 && i < e.length) return e[i]; }
  return 0;
}
const blinkAt = (t, ph) => (Math.floor(t * 12) + ph) % 47 === 0;
function cam(cx, cy, z) { translate(W / 2, H / 2); scale(z); translate(-cx, -cy); }

// —— décor ——
function room() {
  bands(['#211a45', '#261e4f', '#2b2358'], -400, 1250, -800, 1900);
  fillOnly(rect(-800, 1250, 2700, 1200), '#1a1538', { boil: 0 });
  shape(rr(-700, 330, 480, 520, 18), { fill: '#14103a', lw: 7, shade: () => { dot(-420, 470, 40, '#e8dcae'); for (let i = 0; i < 9; i++) dot(-680 + hash(i) * 420, 360 + hash(i + 9) * 450, 3, '#e8dcae'); } });
  stroke([[-460, 330], [-460, 850]], 6); stroke([[-700, 590], [-220, 590]], 6);
  shape(rr(1300, 1100, 120, 150, 16), { fill: '#6b4e3b' });
  for (let i = 0; i < 5; i++) shape([[1360, 1105], [1300 + i * 30, 960 - i * 8], [1330 + i * 25, 980]], { fill: '#356f5a', lw: 6 });
  shape(rr(1180, 420, 260, 190, 10), { fill: '#3a3168', lw: 7, shade: () => fillOnly(rr(1200, 440, 220, 150, 6), '#4a4080', { boil: .2 }) });
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

// —— humeurs ——
const FACE = {
  sad: { lid: .55, look: [.1, .7], sm: -.45, brow: .6 }, down: { lid: .5, look: [.5, .35], sm: -.4, brow: .5 },
  worried: { lid: .25, look: [.7, .1], sm: -.5, brow: 1 }, up: { lid: .15, look: [.3, -.9], sm: -.1, brow: .1 },
  smile: { lid: .12, look: [.8, 0], sm: .7, brow: 0 }, surprised: { lid: 0, big: true, look: [.5, -.2], sm: 0, brow: .9 },
  skeptic: { lid: .4, look: [.8, 0], sm: -.2, brow: -.4, skew: .5 }, guilty: { lid: .45, look: [-.3, .6], sm: -.3, brow: .7, skew: -.3 },
};
const AIM = { calm: { sm: .2 }, smile: { sm: .55 }, serious: { sm: -.1 }, sad: { sm: -.3 }, wink: { sm: .6, lid: .5 } };
function maxAt(t, B, o = {}) {
  const lt = t - B.t0, L0 = B.lines[0] ? B.lines[0].t0 - B.t0 : 0;
  const b = Math.sin(step12(t) * TAU * .22) * 4;
  let pose = POSE.slump;
  if (B.gesture === 'belly') pose = mixPose(POSE.slump, POSE.slumpHand, ss(seg(lt, L0 - .1, L0 + .25)));
  if (B.gesture === 'situp') pose = mixPose(POSE.slump, POSE.sit, .6 * ss(seg(lt, 0, (B.t1 - B.t0) * .8)));
  if (B.sitting) pose = mixPose(POSE.slump, POSE.sit, .6 + .4 * ss(seg(lt, 0, 1.2)));
  const Pp = { ...pose, head: [pose.head[0], pose.head[1] + b], neck: [pose.neck[0], pose.neck[1] + b * .6] };
  const face = { ...(FACE[o.mood || B.max || 'down']), ...(o.face || {}) };
  max({ x: 330, y: 1235, s: 1, belly: 1.15, pose: Pp, face: { ...face, o: talk(t, 'MAX') * .8, closed: blinkAt(t, 0) && !face.big } });
}
function buddyAt(t, B, o = {}) {
  mascot({ x: 800, y: 1192, r: 105, look: [-.6, .1], o: talk(t, 'IA') * .9, blink: blinkAt(t, 23), ...(AIM[B.ia || 'calm']), ...o });
}
function livingRoom(t, B, o = {}) { room(); couchBack(); maxAt(t, B, o.max); buddyAt(t, B, o.ai); couchFront(); table(); }

// —— hologramme ——
const HX = 560, HY = 720, HW = 460, HH = 380;
function holo(k, draw) {
  if (k <= .01) return;
  push(); translate(HX, HY); scale(lerp(.6, 1, k), k);
  g.save(); g.shadowColor = '#ff6fa0'; g.shadowBlur = 40;
  shape(rr(-HW / 2, -HH / 2, HW, HH, 34), { fill: '#3a1f4acc', line: '#ff8fb5', lw: 7, boil: .4 });
  g.restore();
  for (let i = 0; i < 6; i++) fillOnly(rect(-HW / 2 + 20, -HH / 2 + 30 + i * 60, HW - 40, 3), '#ff8fb522', { boil: 0 });
  draw(); pop();
}
function beam(k) { if (k > .01) fillOnly([[834, 940], [HX - HW * .35, HY + HH / 2], [HX + HW * .35, HY + HH / 2]], `rgba(255,143,181,${.12 * k})`, { boil: .2 }); }
function wash(k) { if (k > .01) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .06 * k; g.fillStyle = '#ff4f8b'; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }
export function vaultIcon(s = 1) {
  push(); scale(s);
  shape(rr(-110, -110, 220, 220, 52), { fill: PAL.portal, lw: 7, shade: () => fillOnly(rr(-110, 30, 220, 80, 0), PAL.portalB, { boil: .3 }) });
  stroke(Array.from({ length: 31 }, (_, i) => [Math.cos(i / 30 * TAU) * 46, Math.sin(i / 30 * TAU) * 46]), 11, { line: '#ffffff' });
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; stroke([[0, 0], [Math.cos(a) * 72, Math.sin(a) * 72]], 11, { line: '#ffffff' }); dot(Math.cos(a) * 76, Math.sin(a) * 76, 13, '#ffffff'); }
  dot(0, 0, 18, '#ffffff'); dot(0, 0, 8, PAL.portal);
  pop();
}
function vaultDoor(x, y, r, spin = 0) {
  push(); translate(x, y);
  shape(ell(0, 0, r, r, 36), { fill: '#2a1838', line: '#ffb0cc', lw: 7 });
  shape(ell(0, 0, r * .86, r * .86, 32), { fill: PAL.portal, lw: 6, shade: () => fillOnly(ell(r * .2, r * .25, r * .7, r * .6, 26), PAL.portalB, { boil: .3 }) });
  push(); rotate(spin); for (let i = 0; i < 3; i++) { const a = i * TAU / 3; stroke([[0, 0], [Math.cos(a) * r * .55, Math.sin(a) * r * .55]], 10, { line: '#fff1d6' }); } dot(0, 0, r * .14, '#fff1d6'); pop();
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; dot(Math.cos(a) * r * .93, Math.sin(a) * r * .93, 6, '#ffd23f'); }
  pop();
}
const label = (s, x, y, size = 64, col = '#fff1d6', font = 'Bungee') => text(s, x, y, { font: `${font === 'Bungee' ? 400 : 800} ${size}px "${font}"`, fill: col, outlineW: size * .2 });
const STAKE = E.stake || 50, NS = 5, PER = STAKE / NS;
// chaque contenu reçoit lt (temps depuis le début du temps) et L (débuts des répliques, en temps local)
const HOLO = {
  name: (lt, L) => { vaultIcon(.85 * back(seg(lt, L[0] + .4, L[0] + .75), 1.2)); if (lt > L[0] + .65) label('VAULTR', 0, 145, 66); },
  stake: (lt, L) => {
    vaultDoor(0, 10, 115);
    for (let i = 0; i < 5; i++) { const u = eio(seg(lt, L[0] + .7 + i * .22, L[0] + 1.3 + i * .22)); if (u > 0 && u < 1) coin(lerp(-210, 0, u), lerp(140, 10, u) - Math.sin(u * Math.PI) * 90, 30 * (1 - u * .4), u * 6); }
    label(`${Math.round(STAKE * clamp(seg(lt, L[0] + .7, L[0] + 2.2)))} €`, 0, -140, 64, '#ffd77a');
  },
  sessions: (lt, L, B) => {
    const a = L[0] + .5, z = (L[1] ?? (B.t1 - B.t0 - .3)) - .15, D = Array.from({ length: NS }, (_, i) => a + (z - a) * i / (NS - 1));
    const done = D.filter(d => lt >= d).length;
    vaultDoor(-95, 40, 95, done * .6);
    D.forEach((d, i) => {
      const x = -170 + i * 85, on = lt >= d;
      shape(rr(x - 30, -158, 60, 60, 16), { fill: on ? '#5fd6b0' : '#2a1838', line: '#ffb0cc', lw: 5 });
      if (on) stroke([[x - 14, -128], [x - 3, -116], [x + 16, -142]], 8, { line: INK });
      const u = seg(lt, d, d + .5); if (u > 0 && u < 1) coin(lerp(-95, 150, eio(u)), lerp(40, 60, u) - Math.sin(u * Math.PI) * 110, 28, u * 8);
    });
    const n = D.filter(d => lt >= d + .5).length, full = L[1] != null && lt > L[1] + .2;
    label(`+${Math.round(n * PER)} €`, 150, 60, full ? lerp(54, 74, eo(seg(lt, L[1] + .2, L[1] + .5))) : 54, '#ffd77a');
    if (full) label('tout récupéré', 0, 165, 34, '#5fd6b0', 'Baloo 2');
  },
  lock: (lt, L) => {
    vaultDoor(0, 30, 120); const s = L[0] + .5;
    label(`${STAKE} €`, 0, -140, 60, lt > s + .2 ? '#ff6b7f' : '#ffd77a');
    if (lt > s) padlock(0, 60, back(seg(lt, s, s + .2), 1.4) * .62, ss(seg(lt, s + .25, s + .4)));
  },
  calendar: (lt, L, B) => {   // « je commence lundi » : chaque lundi barré, semaine après semaine
    label('« LUNDI »', 0, -150, 44, '#ffd77a');
    const days = 'LMMJVSD';
    for (let c = 0; c < 7; c++) text(days[c], -165 + c * 55, -95, { font: '800 30px "Baloo 2"', fill: c === 0 ? '#ffd77a' : '#ffb0cc' });
    const t0 = L[0] + .3, t1 = (B.t1 - B.t0) - .5;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
      const x = -165 + c * 55, y = -40 + r * 58;
      shape(rr(x - 22, y - 22, 44, 44, 10), { fill: c === 0 ? '#4a2a5a' : '#2a1838', line: '#ff8fb5', lw: 4 });
      if (c === 0 && lt > t0 + (t1 - t0) * r / 4) { const k = back(seg(lt, t0 + (t1 - t0) * r / 4, t0 + (t1 - t0) * r / 4 + .15), 1.5); push(); translate(x, y); scale(k); stroke([[-16, -16], [16, 16]], 9, { line: '#ff6b7f' }); stroke([[16, -16], [-16, 16]], 9, { line: '#ff6b7f' }); pop(); }
    }
  },
  gym: (lt, L, B) => {   // l'abonnement qu'on paie… pour rien
    const months = B.items || ['janv.', 'févr.', 'mars'], price = B.price || 35, t0 = L[0] + .3, t1 = (B.t1 - B.t0) - .6;
    label('SALLE DE SPORT', 0, -150, 36, '#fff1d6');
    months.forEach((m, i) => {
      const ti = t0 + (t1 - t0) * i / months.length; if (lt < ti) return;
      push(); translate(0, -80 + i * 62); scale(back(seg(lt, ti, ti + .2), 1.3));
      text(m, -120, 0, { font: '800 38px "Baloo 2"', fill: '#ffb0cc', align: 'left' }); text(`−${price} €`, 150, 0, { font: '400 38px "Bungee"', fill: '#ff6b7f', outlineW: 7 });
      pop();
    });
    if (lt > t1) { label(`séances : 0`, 0, 135, 46, '#ffd77a'); }
  },
  excuses: (lt, L, B) => {   // chaque excuse coûte une partie de la mise
    const items = B.items || [];
    label(`${STAKE - Math.round(PER * items.filter((_, i) => lt > (L[i] ?? 99) + .3).length)} €`, 0, -150, 52, '#ffd77a');
    items.forEach((s, i) => {
      const ti = (L[i] ?? 99) + .3; if (lt < ti) return;
      push(); translate(0, -60 + i * 85); scale(back(seg(lt, ti, ti + .2), 1.4)); rotate((i % 2 ? 1 : -1) * .03);
      shape(rr(-200, -32, 400, 64, 20), { fill: '#2a1838', line: '#ff6b7f', lw: 5 });
      text(s, -180, 0, { font: '800 36px "Baloo 2"', fill: '#fff1d6', align: 'left' }); text(`−${PER} €`, 180, 0, { font: '400 34px "Bungee"', fill: '#ff6b7f', align: 'right', outlineW: 6 });
      pop();
    });
  },
  proof: (lt, L, B) => {   // une photo ou une vidéo de la séance → le coach valide → l'argent revient
    const ok = (L[1] ?? L[0] + 1.6) + .2;
    push(); translate(-95, 10);
    shape(rr(-80, -140, 160, 280, 24), { fill: '#1e1a2e', line: '#ffb0cc', lw: 6 });
    shape(rr(-66, -120, 132, 200, 12), { fill: '#3a3168', lw: 4 });
    const sq = (Math.sin(lt * 5) + 1) / 2;   // petit bonhomme qui fait des squats
    push(); translate(0, 40 - 0); dot(0, -95 + sq * 25, 14, '#ffd77a'); stroke([[0, -80 + sq * 25], [0, -40 + sq * 25]], 8, { line: '#ffd77a' }); stroke([[0, -40 + sq * 25], [-18 - sq * 8, -18 + sq * 8], [-8, 0]], 7, { line: '#ffd77a' }); stroke([[0, -40 + sq * 25], [18 + sq * 8, -18 + sq * 8], [8, 0]], 7, { line: '#ffd77a' }); stroke([[-26, -70 + sq * 25], [26, -70 + sq * 25]], 7, { line: '#ffd77a' }); pop();
    dot(0, 112, 12, '#ff6b7f');
    pop();
    if (lt > ok) {
      push(); translate(110, -40); scale(back(seg(lt, ok, ok + .25), 1.4));
      shape(ell(0, 0, 62, 62, 30), { fill: '#5fd6b0', lw: 7 }); stroke([[-26, 2], [-6, 22], [28, -20]], 12, { line: INK }); pop();
      label('validé', 110, 50, 34, '#5fd6b0', 'Baloo 2');
      const u = seg(lt, ok + .3, ok + .9); if (u > 0 && u < 1) coin(lerp(110, 110, u), lerp(70, 130, u), 26, u * 8);
      if (lt > ok + .6) label(`+${PER} €`, 110, 130, 44, '#ffd77a');
    }
  },
  program: (lt, L, B) => {   // un programme fait pour toi
    const items = B.items || ['ton matériel', 'tes goûts', 'ton niveau'], t0 = L[0] + .4, t1 = (B.t1 - B.t0) - .5;
    label('TON PROGRAMME', 0, -150, 36, '#fff1d6');
    items.forEach((s, i) => {
      const ti = t0 + (t1 - t0) * i / items.length, on = lt > ti, y = -70 + i * 80;
      shape(rr(-190, y - 30, 380, 60, 18), { fill: '#2a1838', line: '#ff8fb5', lw: 4 });
      text(s, -160, y, { font: '800 34px "Baloo 2"', fill: '#fff1d6', align: 'left' });
      shape(rr(118, y - 20, 40, 40, 10), { fill: on ? '#5fd6b0' : '#2a1838', line: '#ffb0cc', lw: 4 });
      if (on) { push(); translate(138, y); scale(back(seg(lt, ti, ti + .2), 1.5)); stroke([[-11, 0], [-3, 9], [12, -10]], 7, { line: INK }); pop(); }
    });
  },
};
function holoContent(B, t) { const lt = t - B.t0, L = B.lines.map(l => l.t0 - B.t0); return () => (HOLO[B.holo] || HOLO.name)(lt, L.length ? L : [0], B); }

// —— plans ——
function badge(t) {   // pastille de la série, en haut à gauche
  if (!E.badge) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.font = '800 34px "Baloo 2"'; const w = g.measureText(E.badge).width + 44;
  g.globalAlpha = .9; g.fillStyle = '#120c26'; g.strokeStyle = PAL.ai; g.lineWidth = 4; g.beginPath(); g.roundRect(48, 172, w, 54, 27); g.fill(); g.stroke(); g.globalAlpha = 1;
  g.fillStyle = '#fff1d6'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(E.badge, 70, 200);
}
function hookText(t, B) {
  const a = 1 - ss(seg(t, B.t1 - .4, B.t1)); if (a <= 0 || !E.hook) return;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  E.hook.forEach((s, i) => { g.font = `800 ${i ? 70 : 62}px "Baloo 2"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 13; g.strokeStyle = INK; g.strokeText(s, 540, 320 + i * 88); g.fillStyle = i ? '#ffd77a' : '#fff'; g.fillText(s, 540, 320 + i * 88); });
  g.globalAlpha = 1;
}
const SHOT = {
  hook: (t, B) => { frame(t, { amp: 1.3 }); push(); cam(290, 980, lerp(2.3, 2.45, ss(seg(t, B.t0, B.t1)))); livingRoom(t, B, { max: { mood: B.max || 'sad' } }); pop(); },
  two: (t, B) => { frame(t, { amp: 1.3 }); push(); cam(560, 1100, lerp(1.18, 1.26, ss(seg(t, B.t0, B.t1)))); livingRoom(t, B, { ai: { look: [-.7, .15] } }); pop(); },
  max: (t, B) => { frame(t, { amp: 1.3 }); push(); cam(300, 960, lerp(2.3, 2.5, ss(seg(t, B.t0, B.t1)))); livingRoom(t, B); pop(); if (B.music === 'silence') wash(.6); },
  buddy: (t, B) => { frame(t, { amp: 1.3 }); push(); cam(790, 1030, lerp(2.3, 2.4, ss(seg(t, B.t0, B.t1)))); livingRoom(t, B, { ai: { look: [-.8, .1], tilt: -.05 } }); pop(); },
  reveal: (t, B) => {
    const L0 = B.lines[0] ? B.lines[0].t0 : B.t0, k = eo(seg(t, L0 + .1, L0 + .6));
    frame(t, { amp: 1.3 }); push(); cam(560, 1040, 1.2);
    room(); couchBack(); beam(k);
    maxAt(t, B, { mood: 'down', face: { lid: lerp(.5, .15, k), look: [lerp(.5, .3, k), lerp(.35, -.9, k)] } });
    buddyAt(t, B, { armL: ss(seg(t, L0 - .2, L0 + .15)), glow: k, look: [-.3, -.6] });
    couchFront(); table(); holo(k, holoContent(B, t)); pop(); wash(k);
  },
  holo: (t, B) => {
    frame(t, { amp: 1.3 }); push(); cam(HX, HY + 30, 1.7);
    room(); couchBack(); beam(1); maxAt(t, B, { mood: B.max || 'up' }); buddyAt(t, B, { glow: 1, look: [-.3, -.7] }); couchFront();
    holo(1, holoContent(B, t)); pop(); wash(1);
  },
  friend: (t, B) => {
    const k = ss(seg(t, B.t0 + .2, B.t0 + .7));
    frame(t, { amp: 1.3 }); push(); cam(560, 1080, lerp(1.25, 1.35, ss(seg(t, B.t0, B.t1))));
    livingRoom(t, { ...B, gesture: 'situp' }, { max: { mood: B.max || 'down' }, ai: { armL: k * .55, look: [-.8, -.2], tilt: -.06 * k } }); pop();
  },
  smile: (t, B) => { frame(t, { amp: 1.3 }); push(); cam(310, 950, 2.3); livingRoom(t, { ...B, sitting: true }, { max: { mood: B.max || 'smile' } }); pop(); },
  end: (t, B) => {
    frame(t, { amp: 1.2 }); const t0 = B.t0;
    g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1b1238'; g.fillRect(0, 0, W, H); S.sid = 1000;
    push(); translate(540, 640); vaultIcon(1.15 * back(seg(t, t0 + .1, t0 + .45), 1.2)); pop();
    if (t > t0 + .45) { push(); translate(540, 900); scale(back(seg(step12(t), t0 + .45, t0 + .7), 1.3)); text('VAULTR', 10, 10, { font: '400 170px "Bungee"', fill: PAL.portal, outlineW: 24 }); text('VAULTR', 0, 0, { font: '400 170px "Bungee"', fill: '#fff1d6', outlineW: 24 }); pop(); }
    if (t > t0 + 1.2) { push(); translate(540, 1060); scale(back(seg(step12(t), t0 + 1.2, t0 + 1.45), 1.2)); text(E.tagline || 'Ton effort te rembourse.', 0, 0, { font: '800 66px "Baloo 2"', fill: '#ffd77a', outlineW: 15 }); pop(); }
    if (t > t0 + 2.0) text('Tu mises · tu t\'entraînes · tu récupères', 540, 1170, { font: '700 42px "Baloo 2"', fill: '#ffffff', outlineW: 10 });
    if (t > t0 + 2.5) text('Bientôt sur iOS et Android', 540, 1250, { font: '700 42px "Baloo 2"', fill: '#5fd6b0', outlineW: 10 });
    mascot({ x: 540, y: 1560, r: 95, look: [-.2, -.4], o: talk(t, 'IA') * .9, sm: .6, blink: blinkAt(t, 5), armL: .4 + .15 * Math.sin(step12(t) * 5), glow: 1 });
  },
};

// —— sous-titres (zone sûre TikTok) ——
function wrap(txt, maxW, font) {
  g.save(); g.font = font; const words = txt.split(' '), out = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; }
  if (cur) out.push(cur); g.restore(); return out;
}
function subtitle(t, B) {
  if (B.shot === 'end') return;
  const c = SEQ.map((l, i) => ({ ...l, t1: Math.min((SEQ[i + 1]?.t0 ?? DUR) - .05, l.t0 + l.dur + .5) })).filter(c => t >= c.t0 && t < c.t1).pop(); if (!c) return;
  g.setTransform(1, 0, 0, 1, 0, 0);
  const L = wrap(c.sub, 780, '800 56px "Baloo 2"'), y0 = 1430 - (L.length - 1) * 32;
  g.font = '800 56px "Baloo 2"'; const bw = Math.max(...L.map(l => g.measureText(l).width)) + 60;
  g.globalAlpha = .55; g.fillStyle = '#120c26'; g.beginPath(); g.roundRect(540 - bw / 2, y0 - 46, bw, L.length * 64 + 28, 26); g.fill(); g.globalAlpha = 1;
  g.font = '800 32px "Baloo 2"'; const pw = c.who === 'MAX' ? 104 : 70;
  g.fillStyle = c.who === 'MAX' ? PAL.hood : PAL.ai; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.roundRect(540 - pw / 2, y0 - 98, pw, 46, 23); g.fill(); g.stroke();
  g.fillStyle = c.who === 'MAX' ? INK : '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c.who, 540, y0 - 74);
  g.font = '800 56px "Baloo 2"';
  L.forEach((l, i) => { g.lineWidth = 12; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText(l, 540, y0 + i * 64); g.fillStyle = '#fff'; g.fillText(l, 540, y0 + i * 64); });
}

// —— rendu ——
init(document.getElementById('c'));
window.DUR = DUR;
window.render = t => {
  const B = P.beats.find(b => t < b.t1) || P.beats[P.beats.length - 1];
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  (SHOT[B.shot] || SHOT.two)(t, B);
  if (B === P.beats[0]) hookText(t, B);
  if (B.shot !== 'end') badge(t);
  subtitle(t, B);
};
window.TEXTS = t => [];
// événements sonores pour le mixage
const EV = [];
SEQ.forEach(l => EV.push({ t: l.t0, type: 'vo', id: l.id, who: l.who }));
if (SEQ[0]?.who === 'MAX') EV.push({ t: 0, type: 'sigh' });
for (const B of P.beats) {
  const L = B.lines.map(l => l.t0), L0 = L[0] ?? B.t0;
  if (B.shot === 'reveal') EV.push({ t: L0 + .1, type: 'holoOn' });
  if (B.holo === 'stake') for (let i = 0; i < 5; i++) EV.push({ t: L0 + 1.3 + i * .22, type: 'coinIn' });
  if (B.holo === 'sessions') { const a = L0 + .5, z = (L[1] ?? B.t1 - .3) - .15; for (let i = 0; i < NS; i++) { const d = a + (z - a) * i / (NS - 1); EV.push({ t: d, type: 'tick' }, { t: d + .5, type: 'clink' }); } }
  if (B.holo === 'lock') EV.push({ t: L0 + .75, type: 'lock' });
  if (B.holo === 'calendar') for (let r = 0; r < 4; r++) EV.push({ t: L0 + .3 + ((B.t1 - .5) - (L0 + .3)) * r / 4, type: 'stamp' });
  if (B.holo === 'gym') { const n = (B.items || [1, 2, 3]).length; for (let i = 0; i < n; i++) EV.push({ t: L0 + .3 + ((B.t1 - .6) - (L0 + .3)) * i / n, type: 'stamp' }); }
  if (B.holo === 'excuses') (B.items || []).forEach((_, i) => L[i] != null && EV.push({ t: L[i] + .3, type: 'buzz' }));
  if (B.holo === 'proof') { const ok = (L[1] ?? L0 + 1.6) + .2; EV.push({ t: ok, type: 'tick' }, { t: ok + .9, type: 'clink' }); }
  if (B.holo === 'program') { const n = (B.items || [1, 2, 3]).length; for (let i = 0; i < n; i++) EV.push({ t: L0 + .4 + ((B.t1 - .5) - (L0 + .4)) * i / n, type: 'tick' }); }
}
window.EV = EV.sort((a, b) => a.t - b.t);
document.fonts.load('800 56px "Baloo 2"').then(() => document.fonts.load('400 100px "Bungee"')).then(() => document.fonts.ready).then(() => { window.READY = true; });
