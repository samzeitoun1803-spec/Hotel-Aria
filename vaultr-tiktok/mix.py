# mix.py — partition synthétisée (thérémine, basse analogique, arpège carré, boîte à rythmes), bruitages tirés de events.json,
# voix de l'IA, ambiance ; écrit out/mix.wav (48 kHz stéréo). Aucun échantillon externe.
import json, os, numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur'] + .3; N = int(DUR * SR)
rng = np.random.default_rng(7)
mus, sfx, vox, amb = [np.zeros((N, 2)) for _ in range(4)]
T = np.arange(N) / SR

def put(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(x))
    if i >= N or j <= i: return
    x = x[:j - i] * g; k = min(len(x), 240); x = x.copy(); x[-k:] *= np.linspace(1, 0, k)
    buf[i:j, 0] += x * (1 - max(0, pan)); buf[i:j, 1] += x * (1 + min(0, pan))
def env(n, a=.003, d=.2):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X /= np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))
def hp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X /= np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4); return np.fft.irfft(X, len(x))
def spring(x, mix=.25):   # réverbe « à ressort » simple : échos rapprochés + queue filtrée
    y = x.copy()
    for d, g in ((.031, .5), (.047, .4), (.073, .3), (.11, .22), (.16, .15)):
        k = int(d * SR); y[k:] += x[:-k] * g
    return x * (1 - mix) + lp(y, 3500) * mix
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

# —— instruments ——
def theremin(notes, t0):   # notes : [(début relatif, durée, midi)] — portamento ~70 ms, vibrato qui s'installe
    end = max(a + d for a, d, _ in notes) + .3; n = int(end * SR); t = np.arange(n) / SR
    f = np.zeros(n); amp = np.zeros(n); onset = np.zeros(n)
    for a, d, m in notes:
        i, j = int(a * SR), int((a + d) * SR); f[i:] = mf(m); amp[i:j] = 1; onset[i:] = a
    k = int(.07 * SR); f = np.convolve(np.concatenate([np.full(k, f[0]), f]), np.ones(k) / k, 'valid')[:n]
    since = t - onset; vib = 1 + .012 * np.sin(TAU * 5.5 * t) * np.clip((since - .15) / .3, 0, 1)
    ph = np.cumsum(f * vib) / SR * TAU
    a = np.convolve(amp, np.ones(int(.04 * SR)) / int(.04 * SR), 'same')
    x = (np.sin(ph) + .18 * np.sin(2 * ph) + .08 * np.sin(3 * ph)) * a * .32
    put(mus, spring(x, .35), t0, .9, -.15)
TAU = 2 * np.pi
def bass(m, t, d, g=.5):
    n = int(d * SR); tt = np.arange(n) / SR; f = mf(m)
    x = (np.sin(TAU * f * tt) + .45 * np.sin(TAU * 2 * f * tt) + .2 * lp(2 * ((tt * f) % 1) - 1, 900)) * env(n, .005, d * .7)
    put(mus, x * g, t)
def arp(m, t, d=.14, g=.12, pan=.3):
    n = int(d * SR); tt = np.arange(n) / SR; x = np.sign(np.sin(TAU * mf(m) * tt)) * env(n, .002, .07)
    put(mus, lp(x, 4000) * g, t, 1, pan)
def kick(t, g=.9):
    n = int(.35 * SR); tt = np.arange(n) / SR; f = 50 + 110 * np.exp(-tt / .04)
    put(mus, np.tanh(np.sin(np.cumsum(f) / SR * TAU) * env(n, .001, .14) * 1.6) * g, t)
def snare(t, g=.35):
    n = int(.25 * SR); x = hp(rng.standard_normal(n), 1500) * env(n, .001, .07) + .4 * np.sin(TAU * 190 * np.arange(n) / SR) * env(n, .001, .04)
    put(mus, x * g, t, 1, .05)
def hat(t, g=.12):
    n = int(.06 * SR); x = hp(rng.standard_normal(n), 7500) * env(n, .0005, .015); put(mus, x * g, t, 1, -.25)
def chord(ms, t, d, g=.1):
    n = int(d * SR); tt = np.arange(n) / SR
    x = sum(lp(2 * ((tt * mf(m) * dt) % 1) - 1, 1800) for m in ms for dt in (1, 1.005)) / (2 * len(ms))
    e = np.minimum(1, tt / .25) * np.minimum(1, (d - tt) / .3); put(mus, spring(x * e, .3) * g, t)

BEAT = .625   # 96 BPM
# ouverture (0.2 → 4.6) : pouls de basse discret sous le clavier, pour que l'accroche ne soit pas vide
for i in range(7): bass(45, .2 + i * BEAT, BEAT * .5, .22); hat(.2 + i * BEAT + BEAT / 2, .06)
# section 1 (4.6 → 9.85) : basse feutrée + thérémine discret (la mineur)
for i in range(8): bass(45 if i % 4 < 2 else 41, 4.6 + i * BEAT, BEAT * .9, .32)
theremin([(0, .6, 69), (.65, .3, 72), (1.0, 1.2, 71), (2.6, .6, 69), (3.25, 1.4, 64)], 4.9)
# stinger « QUOI ?! » (cuivre bouché synthétique + boîte)
n = int(.6 * SR); tt = np.arange(n) / SR; put(sfx, np.tanh(sum(np.sin(TAU * f * tt) for f in (233, 277, 349)) * env(n, .005, .25) * 1.5) * .35, 10.15)
# section 2 (11.25 → 24.85) : groove complet
seq = [45, 45, 48, 43]; t0 = 11.25
for b in range(int((24.85 - t0) / BEAT)):
    t = t0 + b * BEAT; root = seq[(b // 4) % 4]
    kick(t, .85); hat(t + BEAT / 2)
    if b % 2 == 1: snare(t)
    bass(root - 12 + 12, t, BEAT * .8, .45)
    for q in range(4): arp(root + 12 + (0, 7, 12, 15 if root == 45 else 16)[q], t + q * BEAT / 4, pan=.35 if q % 2 else -.35)
    if 20.6 <= t < 24.85 and b % 4 == 0: chord((root + 12, root + 16, root + 19), t, BEAT * 4, .14)   # lumière majeure
mel = [(0, .6, 69), (.62, .6, 72), (1.25, 1.2, 76), (2.5, .6, 74), (3.12, .6, 72), (3.75, 1.2, 71), (5.0, .6, 69), (5.62, .6, 72), (6.25, 1.2, 76), (7.5, .6, 79), (8.12, 1.9, 76)]
theremin(mel, 11.9)
theremin([(0, .6, 76), (.62, .6, 79), (1.25, .6, 81), (1.9, 1.8, 84)], 20.75)
# silence total 24.85 → 28.0 (seulement la pièce)
# section 3 (28.0 → 31.2) : reprise douce + petit jingle sur « Vaultr »
for i in range(5): bass(45, 28.0 + i * BEAT, BEAT * .9, .28)
for i, m in enumerate((72, 76, 79, 84)): arp(m, 30.0 + i * .09, .3, .2, 0)
# section 4 (31.2 → fin) : thème complet à l'aube (do majeur), final sur le titre
seq2 = [48, 43, 45, 41]
for b in range(int((37.4 - 31.2) / BEAT)):
    t = 31.2 + b * BEAT; root = seq2[(b // 4) % 4]
    if t < 34.5 or t > 35.0: kick(t, .8); hat(t + BEAT / 2, .14)
    if b % 2 == 1: snare(t, .3)
    bass(root, t, BEAT * .8, .45)
    for q in range(4): arp(root + 24 + (0, 4, 7, 12)[q], t + q * BEAT / 4, g=.1, pan=.3 if q % 2 else -.3)
    if b % 4 == 0: chord((root + 12, root + 16, root + 19), t, BEAT * 4, .12)
theremin([(0, .6, 72), (.62, .6, 76), (1.25, 1.2, 79), (2.5, .6, 81), (3.12, 1.6, 79), (4.4, 2.0, 84)], 31.3)
kick(34.5, 1.0); chord((48, 52, 55, 60), 34.5, 3.0, .2)
# fin : tout s'éteint proprement
fade = np.ones(N); fade[int(36.6 * SR):] = np.linspace(1, 0, N - int(36.6 * SR)); mus *= fade[:, None]

# —— bruitages ——
def thock():
    n = int(.05 * SR); return hp(rng.standard_normal(n), 2500) * env(n, .0005, .008) * .5 + np.sin(TAU * 1800 * np.arange(n) / SR) * env(n, .0005, .006) * .2
def bloop():
    n = int(.25 * SR); tt = np.arange(n) / SR; return np.sin(np.cumsum(500 + 900 * tt / .25) / SR * TAU) * env(n, .003, .08) * .5
def boom():
    n = int(1.6 * SR); tt = np.arange(n) / SR
    x = np.sin(np.cumsum(38 + 90 * np.exp(-tt / .1)) / SR * TAU) * env(n, .002, .5) + lp(rng.standard_normal(n), 1200) * env(n, .002, .3) * .4
    sw = np.sin(np.cumsum(200 + 1200 * np.clip(tt / 1.2, 0, 1) ** 2) / SR * TAU) * np.clip(tt / 1.2, 0, 1) * (1 - np.clip((tt - 1.2) / .4, 0, 1)) * .2
    return np.tanh((x + sw) * 1.3) * .8
def clink(f=2600):
    n = int(.35 * SR); tt = np.arange(n) / SR; return (np.sin(TAU * f * tt) + .5 * np.sin(TAU * f * 2.76 * tt) + .3 * np.sin(TAU * f * 4.1 * tt)) * env(n, .001, .09) * .3
def boing():
    n = int(.4 * SR); tt = np.arange(n) / SR; f = 180 + 320 * np.exp(-tt / .06) + 30 * np.sin(TAU * 18 * tt); return np.sin(np.cumsum(f) / SR * TAU) * env(n, .002, .14) * .45
def whoosh(d=.3):
    n = int(d * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n); e = np.sin(np.pi * tt / d) ** 2; return lp(hp(x, 600), 5000) * e * .18
def lock():
    n = int(.4 * SR); x = hp(rng.standard_normal(n), 1800) * env(n, .0005, .02) * .8; x[int(.06 * SR):] += (hp(rng.standard_normal(n - int(.06 * SR)), 900) * env(n - int(.06 * SR), .0005, .04)); return x * .7
def step():
    n = int(.12 * SR); return lp(rng.standard_normal(n), 900) * env(n, .001, .03) * .45
def shock():
    n = int(.5 * SR); tt = np.arange(n) / SR; return np.sin(np.cumsum(900 - 600 * tt / .5) / SR * TAU) * env(n, .002, .2) * .3
def sink():
    n = int(.6 * SR); return lp(rng.standard_normal(n), 400) * env(n, .05, .2) * .5
for ev in E['ev']:
    t, ty = ev['t'], ev['type']
    if ty == 'key': put(sfx, thock(), t, .8, rng.uniform(-.2, .2))
    elif ty == 'send': put(sfx, bloop(), t, .8)
    elif ty == 'portalOpen': put(sfx, boom(), t, 1.0)
    elif ty == 'portalClose': put(sfx, boom()[::-1][-int(.6 * SR):] * .6, t, .9)
    elif ty == 'lock': put(sfx, lock(), t, 1.0)
    elif ty in ('coinOut', 'clink'): put(sfx, clink(rng.uniform(2300, 3300)), t, .7, rng.uniform(-.5, .5))
    elif ty == 'boing': put(sfx, boing(), t, .9)
    elif ty == 'cut': put(sfx, whoosh(), t - .15, .8)
    elif ty == 'step': put(sfx, step(), t, .9)
    elif ty == 'shock': put(sfx, shock(), t, 1.0)
    elif ty == 'sink': put(sfx, sink(), t, .8)
    elif ty == 'jingle': put(sfx, clink(3200), t, .6)
    elif ty == 'title': put(sfx, boom()[:int(.8 * SR)], t, .7)

# —— voix ——
for ev in E['ev']:
    if ev['type'] == 'vo':
        x, sr = sf.read(os.path.join(HERE, 'out', 'vo', ev['id'] + '.wav')); put(vox, x * 1.6, ev['t'], 1.0, 0)
# petite pièce (premières réflexions) pour asseoir la voix
v = vox.copy()
for d, g in ((.011, .18), (.019, .12), (.029, .08)): k = int(d * SR); v[k:] += vox[:-k] * g
vox = v

# —— ambiance : frigo + horloge la nuit, oiseaux et vent à l'aube ——
night = lp(rng.standard_normal(N), 180) * .02 + np.sin(TAU * 60 * T) * .004
night *= (T < 31.2)
amb[:, 0] += night; amb[:, 1] += night
for k in range(int(24.85 / 1.0), int(28.0 / 1.0) + 1): put(amb, thock() * .6, k * 1.0 + .5, .5)   # tic-tac dans le silence
dawn = hp(lp(rng.standard_normal(N), 1500), 200) * .015 * (T >= 31.2)
amb[:, 0] += dawn; amb[:, 1] += dawn
for i in range(8):
    t0 = 31.4 + i * .7 + rng.uniform(0, .3); n = int(.18 * SR); tt = np.arange(n) / SR
    put(amb, np.sin(np.cumsum(3000 + 1500 * np.sin(TAU * 12 * tt)) / SR * TAU) * env(n, .01, .06) * .05, t0, 1, rng.uniform(-.8, .8))

# —— mixage : musique baissée de ~7 dB sous la voix ——
venv = np.convolve(np.abs(vox[:, 0]), np.ones(int(.08 * SR)) / int(.08 * SR), 'same')
duck = 1 - .55 * np.clip(venv / (venv.max() * .15 + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(int(.12 * SR)) / int(.12 * SR), 'same')
mix = mus * duck[:, None] * .9 + sfx * .9 + vox * 1.0 + amb * 1.0
# coupure nette : rien de la musique (ni sa queue) pendant le silence
mix[int(24.85 * SR):int(28.0 * SR)] -= (mus * duck[:, None] * .9)[int(24.85 * SR):int(28.0 * SR)]
mix = np.tanh(mix * .9) / .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix / (np.abs(mix).max() + 1e-9) * .9, SR)
for name, b in (('music', mus), ('sfx', sfx), ('voice', vox), ('amb', amb)): sf.write(os.path.join(HERE, 'out', f'stem_{name}.wav'), b / (np.abs(b).max() + 1e-9) * .9, SR)
print('ok', round(DUR, 2), 's')
