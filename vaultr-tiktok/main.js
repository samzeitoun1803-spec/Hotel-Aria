// main.js — « Motivé une fois par mois » : mise en scène, caméra, sous-titres, événements sonores
import { clamp, lerp, seg, ss, eio, eo, back, hash, TAU } from '/core/lib.js';
import { W, H, INK, init, frame, g, push, pop, translate, scale, rotate, shape, fillOnly, stroke, ell, arc, spline, rr, rect, quad, dot, text, bands, S } from './toon.js';
import { PAL, POSE, runPose, mixPose, max, aiFace, coin, padlock, portal, hand, phoneSmall } from './chars.js';

const LS = await fetch('out/vo/lipsync.json').then(r => r.json()).catch(() => ({ env: {}, dur: {} }));
const VO = [   // répliques de l'IA : début (s)
  ['ai1', 4.8], ['ai2', 6.55], ['ai3', 8.75], ['ai4', 11.7], ['ai5', 15.35], ['ai6', 20.75], ['ai7', 23.55], ['ai8', 26.05], ['ai9', 30.0], ['ai10', 32.0],
];
const SUB = { ai1: 'Une fois par mois. D\'accord.', ai2: 'J\'ai exactement ce qu\'il te faut.', ai3: 'Une appli qui te prend de l\'argent.', ai4: 'Tu mets une mise. Disons 50 €.', ai5: 'Chaque séance validée te rend une partie.', ai6: 'Tu fais tout ? Tu récupères tout.', ai7: 'Et si tu lâches…', ai8: '…l\'argent reste au coffre.', ai9: 'Vaultr.', ai10: 'Alors… motivé ?' };
const DUR = 37.5;
const SHOTS = [0, 3.0, 4.6, 8.6, 11.0, 15.2, 20.6, 23.4, 26.0, 28.0, 31.2, 34.4];   // débuts de plans (dernier = carton final)
const M1 = 'j\'veux faire du sport mais je suis motivé qu\'une fois par mois 😩';
const M2 = '…c\'est quoi le nom 👀';

// voix → ouverture de bouche
function talk(t) {
  for (const [id, t0] of VO) {
    const e = LS.env[id]; if (!e) continue; const i = Math.floor((t - t0) * 12) * 2;   // échantillonnée à 12 i/s (dessin sur deux)
    if (i >= 0 && i < e.length) return e[i];
  }
  return 0;
}
const step12 = t => Math.floor(t * 12) / 12;

// —— caméra : centre du monde (cx, cy) + zoom, secousse optionnelle ——
function cam(cx, cy, z, shake = 0, t = 0) {
  const sx = shake ? (hash(Math.floor(t * 24) * 1.3) - .5) * shake : 0, sy = shake ? (hash(Math.floor(t * 24) * 2.7) - .5) * shake : 0;
  translate(W / 2 + sx, H / 2 + sy); scale(z); translate(-cx, -cy);
}

// —— décors ——
function livingRoom(t) {
  bands(['#241c4d', '#2b2357', '#322a66'], -400, 1250, -800, 1900);   // mur, bandes plates
  fillOnly(rect(-800, 1250, 2700, 1200), '#1d1740', { boil: 0 });       // sol
  shape(rr(-760, 300, 520, 560, 18), { fill: '#16123a', lw: 7, shade: () => { dot(-460, 450, 46, '#f3e6b0'); for (let i = 0; i < 9; i++) dot(-720 + hash(i) * 440, 330 + hash(i + 9) * 480, 3.5, '#f3e6b0'); } });
  stroke([[-500, 300], [-500, 860]], 6); stroke([[-760, 580], [-240, 580]], 6);
  // lampe (éteinte : aucune lueur)
  stroke([[1430, 760], [1430, 1250]], 8); shape(spline([[1350, 760], [1510, 760], [1470, 640], [1390, 640]]), { fill: '#e8b86b' });
  // plante
  shape(rr(1560, 1120, 120, 130, 16), { fill: '#7b5a43' });
  for (let i = 0; i < 5; i++) shape(spline([[1620, 1125], [1560 + i * 30, 980 - i * 8], [1590 + i * 25, 1000]]), { fill: '#3e8a6b', lw: 6 });
  // tapis
  shape(ell(540, 1520, 820, 110, 50), { fill: '#3a2f6e' });
}
function couchBack() { shape(rr(80, 960, 920, 330, 60), { fill: '#7b5a43', shade: () => fillOnly(rect(80, 1150, 920, 160), '#5e4332', { boil: .3 }) }); }
function couchFront() {
  shape(rr(40, 1180, 1000, 230, 50), { fill: '#8a6a50', shade: () => fillOnly(rect(40, 1330, 1000, 90), '#6b4f3a', { boil: .3 }) });
  shape(rr(0, 1080, 140, 340, 50), { fill: '#7b5a43' }); shape(rr(940, 1080, 140, 340, 50), { fill: '#7b5a43' });
  stroke([[540, 1200], [540, 1320]], 5);
}
function dawnStreet(t, scroll) {
  bands(['#ff8a3d', '#ff9a4d', '#ffad63', '#ffc07a'], -200, 1100, -2000, 4000);
  dot(760, 760, 150, '#fff0c2');
  for (let i = -2; i < 12; i++) {   // immeubles (parallaxe lente)
    const x = i * 360 - (scroll * .35) % 360, hgt = 520 + hash(i * 3.3) * 380;
    shape(rect(x, 1240 - hgt, 300, hgt + 20), { fill: i % 2 ? '#5fd6b0' : '#4cc4a0', shade: () => fillOnly(rect(x + 210, 1240 - hgt, 90, hgt + 20), '#3fae8d', { boil: .3 }) });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) shape(rr(x + 40 + c * 110, 1240 - hgt + 60 + r * 110, 70, 70, 10), { fill: '#fff0c2', lw: 5 });
  }
  fillOnly(rect(-2000, 1240, 6000, 160), '#8fe3c8', { boil: 0 }); stroke([[-2000, 1240], [4000, 1240]], 7);
  fillOnly(rect(-2000, 1400, 6000, 700), '#2f5d6e', { boil: 0 }); stroke([[-2000, 1400], [4000, 1400]], 7);
  for (let i = -2; i < 14; i++) { const x = i * 300 - scroll % 300; fillOnly(rect(x, 1640, 150, 22), '#fff0c2', { boil: .3 }); }
}

// —— le téléphone en insert (rempli le cadre) ——
function bigPhone(t, mode) {
  // mains de Max en bas
  shape(rr(150, 230, 780, 1520, 90), { fill: '#1e1a2e', lw: 9 });
  shape(rr(190, 300, 700, 1380, 54), { fill: '#f7f3ff', lw: 6 });
  shape(rr(450, 255, 180, 30, 15), { fill: INK, stroke: false });
  // en-tête de conversation : l'IA, sans nom
  aiFace(270, 380, 44, { o: mode === 'ai' ? 0 : 0, sm: .4 });
  text('IA', 340, 380, { font: '800 44px "Baloo 2"', align: 'left' });
  text('en ligne', 340, 420, { font: '600 26px "Baloo 2"', align: 'left', fill: '#8a80a8' });
  stroke([[200, 460], [880, 460]], 4);
}
function bubble(x, y, w, txt, col, align, s = 1, lines = null) {
  const L = lines || wrap(txt, w - 60, '700 40px "Baloo 2"'), h = 30 + L.length * 50;
  push(); translate(align === 'right' ? x - w / 2 : x + w / 2, y + h / 2); scale(s); translate(align === 'right' ? -(x - w / 2) : -(x + w / 2), -(y + h / 2));
  shape(rr(x - (align === 'right' ? w : 0), y, w, h, 34), { fill: col, lw: 6 });
  L.forEach((l, i) => text(l, x - (align === 'right' ? w : 0) + 30, y + 42 + i * 50, { font: '700 40px "Baloo 2"', align: 'left', fill: INK }));
  pop();
  return h;
}
function wrap(txt, maxW, font) {
  g.save(); g.font = font; const words = txt.split(' '), out = []; let cur = '';
  for (const w of words) { const tr = cur ? cur + ' ' + w : w; if (g.measureText(tr).width > maxW && cur) { out.push(cur); cur = w; } else cur = tr; }
  if (cur) out.push(cur); g.restore(); return out;
}
function keyboard(t, typing) {
  shape(rr(200, 1290, 680, 370, 30), { fill: '#e4ddf5', lw: 5 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) {
    const k = r * 9 + c, pressed = typing && hash(k * 7.3 + Math.floor(t * 12)) > .9;
    shape(rr(222 + c * 72, 1315 + r * 100 + (pressed ? 6 : 0), 60, 80, 12), { fill: pressed ? '#ffd23f' : '#ffffff', lw: 4 });
  }
  shape(rr(330, 1615, 420, 34, 12), { fill: '#ffffff', lw: 4 });
}
function inputField(txtShown, caret) {
  shape(rr(200, 1180, 600, 90, 40), { fill: '#ffffff', lw: 5 });
  const L = txtShown.length > 34 ? '…' + txtShown.slice(-33) : txtShown;
  text(L + (caret ? '|' : ''), 230, 1225, { font: '700 34px "Baloo 2"', align: 'left', fill: INK });
  shape(ell(840, 1225, 38, 38, 24), { fill: PAL.ai, lw: 5 }); text('➤', 842, 1226, { font: '800 34px "Baloo 2"', fill: '#fff' });
}

// —— plans ——
function shot1(t) {   // insert : il tape le message
  frame(t); push(); cam(540, 960, 1 + seg(t, 0, 3) * .05);
  fillOnly(rect(-200, -200, 1500, 2400), '#241c4d', { boil: 0 });
  bigPhone(t);
  const typed = M1.slice(0, Math.floor(clamp((step12(t) - .25) / 2.0) * M1.length));
  const sent = t >= 2.45;
  if (!sent) { inputField(typed, Math.floor(t * 4) % 2 === 0); keyboard(t, typed.length < M1.length); }
  else { bubble(860, 520, 580, M1, '#ffd77a', 'right', back(seg(t, 2.45, 2.75), 1.2)); inputField('', false); keyboard(t, false); }
  // pouces de Max
  hand(330, 1760, -1.9, 70); hand(760, 1760, -1.3, 70);
  pop();
}
function shot2(t) {   // plan moyen : il s'enfonce dans le canapé
  frame(t); push(); cam(480, 1050, 1.75);
  livingRoom(t); couchBack();
  const k = ss(seg(t, 3.3, 4.2));
  max({ x: 470, y: 1230, s: 1, pose: mixPose(POSE.sit, POSE.slump, k), face: { lid: lerp(.45, .62, k), look: [.3, .5], o: 0, sm: -.3 }, phone: { on: true, lit: 1 } });
  couchFront();
  pop();
}
function shot3(t) {   // insert : l'IA répond (visage qui parle)
  frame(t); push(); cam(540, 960, 1.0);
  fillOnly(rect(-200, -200, 1500, 2400), '#241c4d', { boil: 0 });
  bigPhone(t);
  bubble(860, 500, 580, M1, '#ffd77a', 'right');
  const blink = Math.floor(t * 12) % 40 === 0;
  aiFace(540, 1150, 230 * (1 + .03 * Math.sin(t * 3)), { o: talk(t) * 1.1, sm: .25, blink, lid: .3, look: [.1, 0] });
  hand(330, 1760, -1.9, 70); hand(760, 1760, -1.3, 70);
  pop();
}
function shot4(t) {   // gros plan Max : « de l'argent ?! »
  const hit = 9.85, k = seg(t, hit, hit + .15), shk = t > hit && t < hit + .5 ? 26 : 0;
  frame(t, { amp: t > hit ? 2.4 : 1.7 }); push(); cam(470, 980, 2.35, shk, t);
  livingRoom(t); couchBack();
  const panic = t > hit;
  max({ x: 470, y: 1230, s: 1, pose: mixPose(POSE.slump, POSE.sit, eo(k)), face: panic ? { lid: 0, big: true, look: [0, -.2], o: .55 + .2 * Math.sin(t * 30), w: .8, brow: 1, jitter: (hash(Math.floor(t * 12)) - .5) * 5, sweat: true } : { lid: .62, look: [.4, .5], o: 0, sm: -.2 }, phone: { on: true, lit: 1 } });
  couchFront();
  pop();
  if (t > 10.15) {   // « QUOI ?! » en lettrage de bande dessinée
    const s = back(seg(t, 10.15, 10.4), 1.4);
    push(); translate(560, 640); scale(s); rotate(-.08);
    text('QUOI ?!', 0, 0, { font: '400 150px "Bungee"', fill: '#ffd77a', outlineW: 22, outlineCol: INK });
    pop();
  }
}
function portalK(t) { return t < 11.25 ? 0 : t < 26.4 ? back(seg(t, 11.25, 11.6), .9) : clamp(1 - eio(seg(t, 26.4, 27.1))); }
function coinsIn(t) {   // la mise s'envole du téléphone vers le coffre
  for (let i = 0; i < 9; i++) {
    const t0 = 13.3 + i * .14, u = seg(t, t0, t0 + .7); if (u <= 0 || u >= 1) continue;
    const a = [650, 1090], b = [540, 760], c = [600 + (i % 3 - 1) * 160, 600];
    const p = [lerp(lerp(a[0], c[0], u), lerp(c[0], b[0], u), u), lerp(lerp(a[1], c[1], u), lerp(c[1], b[1], u), u)];
    coin(p[0], p[1], 34 * (1 - u * .5), u * 9);
  }
}
function shot5(t) {   // large : le coffre-portail s'ouvre derrière le canapé
  frame(t); push();
  const z = lerp(1.75, 1.12, eio(seg(t, 11.0, 12.6)));
  cam(540, lerp(1060, 960, eio(seg(t, 11.0, 12.6))), z);
  livingRoom(t);
  portal(540, 760, 300, portalK(t), t, { wash: false });
  couchBack();
  const look = t > 11.3 ? [-.4, -.9] : [.3, .5];
  max({ x: 470, y: 1230, s: 1, pose: POSE.sit, face: { lid: t > 11.3 ? 0 : .5, big: t > 11.3, look, o: t > 11.3 && t < 12 ? .5 : 0, brow: t > 11.3 ? .8 : 0 }, phone: { on: true, lit: 1 } });
  couchFront();
  coinsIn(t);
  if (t > 13.0) {   // compteur de la mise sur le coffre
    const n = Math.round(50 * clamp(seg(t, 13.3, 14.6)));
    push(); translate(540, 460); scale(back(seg(t, 13.0, 13.3), 1.2));
    shape(rr(-150, -60, 300, 120, 40), { fill: '#ffffff', lw: 7 }); text(`${n} €`, 0, 4, { font: '400 76px "Bungee"', fill: INK });
    pop();
  }
  pop();
  portalWash(t);
}
function portalWash(t) { const k = portalK(t); if (k > .01) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .07 * clamp(k); g.fillStyle = PAL.portal; g.fillRect(0, 0, W, H); g.globalAlpha = 1; } }

const ACTS = [['pushup', 15.55, 17.1], ['run', 17.2, 18.45], ['plank', 18.55, 19.6], ['burst', 19.6, 20.6]];
function shot6(t) {   // même cadre ×3 puis rafale : chaque séance rend une pièce
  frame(t); push(); cam(540, 1060, 1.2);
  livingRoom(t); portal(540, 760, 300, portalK(t), t, { wash: false }); couchBack(); couchFront();
  let pose = POSE.cheer, x = 540, y = 1320, face = { lid: .2, look: [.2, 0], o: .2, sm: .6 };
  const act = ACTS.find(a => t >= a[1] && t < a[2]) || ACTS[3];
  const tt = step12(t);
  if (act[0] === 'pushup') { pose = mixPose(POSE.pushUp, POSE.pushDown, (Math.sin((tt - 15.55) * TAU * 1.3) + 1) / 2); x = 470; y = 1400; face = { lid: .3, look: [.6, .2], o: .3, sm: -.2, brow: .6, sweat: true }; }
  if (act[0] === 'run') { pose = runPose((tt - 17.2) * 2.2); y = 1330; face = { lid: .2, look: [.6, 0], o: .4, sm: .2 }; }
  if (act[0] === 'plank') { pose = POSE.plank; x = 470; y = 1400; face = { lid: .35, look: [.6, .1], o: .1, sm: -.5, brow: .8, jitter: (hash(Math.floor(t * 12)) - .5) * 4, sweat: true }; }
  if (act[0] === 'burst') { pose = mixPose(POSE.stand, POSE.cheer, ss(seg(t, 19.6, 19.8))); face = { lid: 0, look: [0, -.3], o: .5, sm: 1 }; }
  max({ x, y, s: .9, pose, face });
  // pièces qui reviennent : une par répétition, puis rafale
  const pops = [15.95, 16.7, 17.6, 18.2, 19.0, ...Array.from({ length: 10 }, (_, i) => 19.65 + i * .09)];
  pops.forEach((t0, i) => { const u = seg(t, t0, t0 + .55); if (u <= 0 || u >= 1) return; const p = [lerp(540, 380 + (i % 4) * 90, u), lerp(760, 1080, u) - Math.sin(u * Math.PI) * 220]; coin(p[0], p[1], 32, u * 10); });
  const plus = pops.filter(p => t >= p + .55).length;
  if (plus) { push(); translate(820, 560); text(`+${plus * 3} €`, 0, 0, { font: '400 72px "Bungee"', fill: '#ffd77a', outlineW: 16 }); pop(); }
  pop();
  portalWash(t);
}
function shot7(t) {   // tout récupéré : pluie de pièces
  frame(t); push(); cam(540, 1020, lerp(1.15, 1.32, eio(seg(t, 20.6, 23.4))));
  livingRoom(t); portal(540, 760, 300, portalK(t), t, { wash: false }); couchBack(); couchFront();
  for (let i = 0; i < 26; i++) { const t0 = 20.9 + hash(i) * 1.4, u = seg(t, t0, t0 + 1.1); if (u <= 0 || u >= 1) continue; coin(80 + hash(i * 3.1) * 920, lerp(500, 1500, eo(u)) - Math.sin(u * Math.PI) * 150, 30, u * 12 + i); }
  max({ x: 540, y: 1320, s: .9, pose: mixPose(POSE.stand, POSE.cheer, .5 + .5 * Math.sin(step12(t) * TAU * 1.5)), face: { lid: 0, closed: true, o: .5, sm: 1 } });
  if (t > 21.9) { push(); translate(540, 470); scale(back(seg(t, 21.9, 22.15), 1.4)); text('50 €', 0, 0, { font: '400 120px "Bungee"', fill: '#ffd77a', outlineW: 20 }); pop(); }
  pop();
  portalWash(t);
}
function shot8(t) {   // gros plan, push très lent : le silence
  frame(t); push(); cam(470, 980, lerp(2.0, 2.45, ss(seg(t, 23.4, 26.0))));
  livingRoom(t); couchBack();
  const dread = seg(t, 24.6, 25.4);
  max({ x: 470, y: 1230, s: 1, pose: POSE.sit, face: { lid: lerp(.1, .5, dread), look: [lerp(.3, -.8, dread), .6], o: 0, sm: lerp(.3, -.6, dread), brow: lerp(0, 1, dread), sweat: t > 25.2 } });
  couchFront();
  pop();
}
function shot8b(t) {   // insert : le coffre se referme, cadenas rouge
  frame(t); push(); cam(540, 760, 1.35);
  livingRoom(t); portal(540, 760, 300, portalK(t), t, { wash: false });
  if (t > 27.0) padlock(540, 780, back(seg(t, 27.0, 27.2), 1.5) * 1.15, ss(seg(t, 27.25, 27.4)));
  pop();
  portalWash(t);
}
function shot9(t) {   // insert : « c'est quoi le nom ? » → Vaultr
  frame(t); push(); cam(540, 960, 1.0);
  fillOnly(rect(-200, -200, 1500, 2400), '#241c4d', { boil: 0 });
  bigPhone(t);
  bubble(860, 500, 580, M1, '#ffd77a', 'right');
  const typed = M2.slice(0, Math.floor(clamp((step12(t) - 28.15) / 1.3) * M2.length)), sent = t >= 29.55;
  if (!sent) { inputField(typed, Math.floor(t * 4) % 2 === 0); keyboard(t, typed.length < M2.length); }
  else {
    bubble(860, 760, 460, M2, '#ffd77a', 'right', back(seg(t, 29.55, 29.8), 1.2));
    if (t > 30.0) {   // réponse : icône de l'appli + nom
      const s = back(seg(t, 30.0, 30.3), 1.3);
      push(); translate(540, 1080); scale(s);
      shape(rr(-150, -150, 300, 300, 70), { fill: PAL.portal, lw: 8, shade: () => fillOnly(rr(-150, 40, 300, 110, 0), PAL.portalB, { boil: .3 }) });
      shape(ell(0, 0, 62, 62, 30), { lw: 14, line: '#ffffff' }); for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * TAU / 3; stroke([[0, 0], [Math.cos(a) * 98, Math.sin(a) * 98]], 14, { line: '#ffffff' }); dot(Math.cos(a) * 104, Math.sin(a) * 104, 17, '#ffffff'); } dot(0, 0, 24, '#ffffff'); dot(0, 0, 10, PAL.portal);
      pop();
      if (t > 30.25) { push(); translate(540, 1330); scale(back(seg(t, 30.25, 30.5), 1.3)); text('VAULTR', 0, 0, { font: '400 100px "Bungee"', fill: INK }); pop(); }
    }
  }
  hand(330, 1760, -1.9, 70); hand(760, 1760, -1.3, 70);
  pop();
}
function shot10(t) {   // aube : Max court, travelling latéral
  frame(t); push();
  const scroll = (t - 31.2) * 900;
  cam(540, 1150, 1.0);
  dawnStreet(t, scroll);
  const thumb = t > 33.35;
  max({ x: 470, y: 1310, s: 1, pose: thumb ? mixPose(runPose((step12(t) - 31.2) * 2.4), { ...runPose((step12(t) - 31.2) * 2.4), elF: [90, -230], haF: [120, -330] }, ss(seg(t, 33.35, 33.6))) : runPose((step12(t) - 31.2) * 2.4), face: { lid: .1, look: [.7, 0], o: thumb ? .3 : .2, sm: thumb ? 1 : .4 }, thumb });
  // petit téléphone qui flotte et parle (l'IA l'accompagne)
  push(); translate(860, 860 + Math.sin(t * 4) * 14); rotate(.1); scale(.5); shape(rr(-150, -260, 300, 520, 50), { fill: '#1e1a2e', lw: 12 }); shape(rr(-125, -230, 250, 460, 30), { fill: '#f7f3ff', lw: 8 }); aiFace(0, 0, 95, { o: talk(t) * 1.1, sm: .6, look: [-.6, .3] }); pop();
  pop();
}
function endCard(t) {   // carton final
  shot10(t);
  const k = ss(seg(t, 34.4, 34.8));
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .82 * k; g.fillStyle = '#1b1238'; g.fillRect(0, 0, W, H); g.globalAlpha = 1;
  S.sid = 1000;
  if (t > 34.5) {
    const s = back(seg(step12(t), 34.5, 34.75), 1.6);
    push(); translate(540, 820); scale(s); rotate(-.05);
    text('VAULTR', 12, 12, { font: '400 190px "Bungee"', fill: PAL.portal, outlineW: 26 });
    text('VAULTR', 0, 0, { font: '400 190px "Bungee"', fill: '#fff1d6', outlineW: 26 });
    pop();
  }
  if (t > 35.1) { push(); translate(540, 1010); scale(back(seg(step12(t), 35.1, 35.35), 1.3)); text('Ton effort te rembourse.', 0, 0, { font: '800 70px "Baloo 2"', fill: '#ffd77a', outlineW: 16 }); pop(); }
  if (t > 35.7) { push(); translate(540, 1110); text('Bientôt sur iOS et Android', 0, 0, { font: '700 48px "Baloo 2"', fill: '#ffffff', outlineW: 12 }); pop(); }
}

// —— sous-titres (zone sûre TikTok : haut 150 px, bas ~420 px, droite ~140 px) ——
function subtitle(t) {
  const cur = VO.map(([id, t0], i) => { const d = LS.dur[id] || 1.5, nxt = VO[i + 1] ? VO[i + 1][1] : DUR; return { id, t0, t1: Math.min(nxt, t0 + Math.max(1.8, d + .6)) }; }).filter(c => t >= c.t0 && t < c.t1);
  if (t >= 34.4 || !cur.length) return;
  if (cur[cur.length - 1].id === 'ai9') return;   // le nom est déjà écrit en grand sur l'écran
  const c = cur[cur.length - 1];
  g.setTransform(1, 0, 0, 1, 0, 0);
  const L = wrap(SUB[c.id], 760, '800 54px "Baloo 2"'), y0 = 1450 - (L.length - 1) * 30;
  // pastille du locuteur
  g.font = '800 34px "Baloo 2"'; const pw = 74; g.fillStyle = PAL.ai; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.roundRect(540 - pw / 2, y0 - 100, pw, 48, 24); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('IA', 540, y0 - 75);
  g.font = '800 54px "Baloo 2"';
  L.forEach((l, i) => { g.lineWidth = 11; g.lineJoin = 'round'; g.strokeStyle = INK; g.strokeText(l, 540, y0 + i * 62); g.fillStyle = '#fff'; g.fillText(l, 540, y0 + i * 62); });
}

// —— rendu ——
const cv = document.getElementById('c'); init(cv);
const PLAN = [shot1, shot2, shot3, shot4, shot5, shot6, shot7, shot8, shot8b, shot9, shot10, endCard];
window.DUR = DUR;
window.render = t => {
  let i = SHOTS.length - 1; while (i > 0 && t < SHOTS[i]) i--;
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  PLAN[i](t);
  subtitle(t);
};
window.TEXTS = t => [];
// événements sonores pour le mixage
const EV = [];
for (let i = 0; i < 26; i++) EV.push({ t: .3 + i * .075, type: 'key' });
EV.push({ t: 2.45, type: 'send' });
VO.forEach(([id, t0]) => EV.push({ t: t0, type: 'vo', id }));
EV.push({ t: 3.3, type: 'sink' }, { t: 9.85, type: 'shock' }, { t: 10.15, type: 'sting' }, { t: 11.25, type: 'portalOpen' }, { t: 26.4, type: 'portalClose' }, { t: 27.25, type: 'lock' });
for (let i = 0; i < 9; i++) EV.push({ t: 13.3 + i * .14, type: 'coinOut' });
[15.95, 16.7, 17.6, 18.2, 19.0].forEach(t => EV.push({ t, type: 'boing' }, { t: t + .55, type: 'clink' }));
for (let i = 0; i < 10; i++) EV.push({ t: 19.65 + i * .09 + .55, type: 'clink' });
for (let i = 0; i < 26; i++) EV.push({ t: 20.9 + hash(i) * 1.4 + 1.1, type: 'clink' });
for (let i = 0; i < 14; i++) EV.push({ t: 28.15 + i * .095, type: 'key' });
EV.push({ t: 29.55, type: 'send' }, { t: 30.0, type: 'jingle' }, { t: 34.5, type: 'title' });
SHOTS.forEach(t => t > 0 && EV.push({ t, type: 'cut' }));
for (let i = 0; i < 9; i++) EV.push({ t: 31.2 + i * .42, type: 'step' });
window.EV = EV.sort((a, b) => a.t - b.t);
document.fonts.load('800 54px "Baloo 2"').then(() => document.fonts.load('400 100px "Bungee"')).then(() => document.fonts.ready).then(() => { window.READY = true; });
