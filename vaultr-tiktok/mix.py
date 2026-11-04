# mix.py — musique profonde synthétisée (piano grave, nappes, sub, pouls de cœur), bruitages tirés de events.json,
# voix de Max et de l'IA, ambiance du salon la nuit ; écrit out/mix.wav (48 kHz stéréo). Aucun échantillon externe.
import json, os, numpy as np, soundfile as sf
from scipy.signal import fftconvolve
HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000; TAU = 2 * np.pi
E = json.load(open(os.path.join(HERE, 'events.json')))
DUR = E['dur'] + .3; N = int(DUR * SR); T = np.arange(N) / SR
rng = np.random.default_rng(11)
mus, sfx, vox, amb = [np.zeros((N, 2)) for _ in range(4)]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)

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

# —— instruments ——
def piano(m, t, v=.5, d=None, pan=0.0):   # partiels légèrement inharmoniques, aigus qui meurent vite, marteau feutré
    f0 = mf(m); d = d or (5.0 if m < 52 else 3.5 if m < 64 else 2.4); n = int(d * SR); tt = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + .0004 * k * k)
        if fk > 9000: break
        x += np.sin(TAU * fk * tt + rng.uniform(0, TAU)) * (1 / k ** 1.3) * np.exp(-tt * (.5 + .6 * k) * (f0 / 220) ** .35)
    x += lp(rng.standard_normal(n), 2500) * env(n, .0005, .012) * .15   # marteau
    x *= np.minimum(1, tt / .004) * np.minimum(1, (d - tt) / .3)
    put(mus, lp(x, 1200 + 3000 * v) * v * .35, t, 1, pan)
def pad(ms, t, d, g=.08, bright=900):   # nappe : scies désaccordées, attaque lente
    n = int(d * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for dt in (.996, 1.0, 1.004): x += 2 * ((tt * mf(m) * dt + rng.random()) % 1) - 1
    x = lp(x / (3 * len(ms)), bright) * np.minimum(1, tt / 1.2) * np.minimum(1, (d - tt) / 1.2)
    put(mus, x * g, t, 1, rng.uniform(-.3, .3))
def sub(m, t, d, g=.35):
    n = int(d * SR); tt = np.arange(n) / SR
    put(mus, np.sin(TAU * mf(m) * tt) * np.minimum(1, tt / .4) * np.minimum(1, (d - tt) / .6) * g, t)
def heart(t, g=.5):   # pouls feutré « boum-boum »
    for dt, gg in ((0, 1), (.2, .6)):
        n = int(.4 * SR); tt = np.arange(n) / SR; f = 42 + 50 * np.exp(-tt / .03)
        put(mus, np.sin(np.cumsum(f) / SR * TAU) * env(n, .002, .12) * g * gg, t + dt)
def boom(t, g=.8):
    n = int(3.0 * SR); tt = np.arange(n) / SR; f = 34 + 40 * np.exp(-tt / .15)
    x = np.sin(np.cumsum(f) / SR * TAU) * env(n, .003, 1.0) + lp(rng.standard_normal(n), 300) * env(n, .003, .4) * .3
    put(mus, np.tanh(x * 1.2) * g, t)
def swell(t, d=1.2, g=.25):   # souffle qui monte (bruit filtré inversé)
    n = int(d * SR); tt = np.arange(n) / SR; x = lp(hp(rng.standard_normal(n), 300), 3000) * (tt / d) ** 3
    put(mus, x * g, t)

A, F, C, G, Em, Dm = (45, 52, 57, 60, 64), (41, 48, 53, 57, 60), (36, 48, 52, 55, 60), (43, 50, 55, 59, 62), (40, 52, 55, 59, 64), (38, 50, 53, 57, 62)
def bar(ch, t, d, v=.45, arp=False, pg=.07, bright=900):
    piano(ch[0] - 12 if ch[0] > 40 else ch[0], t, v * .9); piano(ch[0], t + .02, v * .6)
    pad([x + 12 for x in ch[1:4]], t, d + .8, pg, bright)
    sub(ch[0] - 12 if ch[0] > 40 else ch[0], t, d + .3, .22)
    if arp:
        notes = [ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12]
        for i in range(int(d / .4167)): piano(notes[i % 4], t + .4167 * i + .01, v * .38, pan=.25 if i % 2 else -.25)
    else:
        for i, m in enumerate(ch[2:]): piano(m + 12, t + .35 + i * .12, v * .45, pan=(i - 1) * .3)

# A. l'accroche et la confession (0 → 10.5) : la mineur, grave, lent
boom(0.0, .75); piano(33, 0.0, .8); piano(45, 0.0, .6)
for t0, ch in ((0.05, A), (2.65, F), (5.25, C), (7.85, Em)): bar(ch, t0, 2.6, .42)
for t0, m in ((1.4, 76), (3.9, 72), (6.5, 71), (9.1, 69)): piano(m, t0, .28, pan=.2)   # mélodie clairsemée, haute et fragile
swell(9.3, 1.2, .2)
# B. « j'ai la solution » (10.5 → 25.5) : ça se réchauffe, le pouls arrive avec l'hologramme
seq = [(10.5, F), (13.0, G), (15.5, A), (18.0, C), (20.5, F), (23.0, G)]
for t0, ch in seq: bar(ch, t0, 2.5, .4, arp=t0 >= 15.5, pg=.08, bright=1300 if t0 >= 15.5 else 1000)
for i in range(int((25.5 - 13.9) / .833)): heart(13.9 + i * .833, .38 if i < 6 else .5)
for t0, m in ((11.2, 72), (12.4, 74), (16.6, 76), (18.6, 79), (21.0, 77), (23.5, 79), (24.4, 81)): piano(m, t0, .25, pan=.2)
# C. le silence (25.5 → 29.6) : la musique s'arrête net. Seul un grondement sous le cadenas.
mus[int(25.55 * SR):] *= 0
boom(28.5, .55)
# D. la promesse (29.8 → fin) : majeur, ample, résout sur le titre
swell(28.6, 1.2, .18)
for t0, ch in ((29.8, F), (31.7, G), (33.5, A)): bar(ch, t0, 1.9 if t0 < 33.5 else 2.1, .45, arp=True, pg=.09, bright=1500)
for i in range(int((35.5 - 29.8) / .833)): heart(29.8 + i * .833, .45)
for t0, m in ((30.2, 72), (31.0, 74), (32.1, 76), (33.0, 79), (34.2, 81), (34.9, 79)): piano(m, t0, .28, pan=.2)
boom(35.6, .7); bar(C, 35.6, 5.0, .55, pg=.11, bright=1800); piano(84, 35.7, .3); piano(88, 36.5, .25); piano(91, 37.4, .22)
pad([67, 72, 76], 37.0, 4.0, .06, 2000)
# réverbe de salle (réponse impulsionnelle : bruit à décroissance exponentielle, stéréo)
n = int(2.8 * SR); tt = np.arange(n) / SR
for ch in range(2):
    ir = lp(rng.standard_normal(n), 4500) * np.exp(-tt / .65); ir /= np.sqrt((ir ** 2).sum())
    mus[:, ch] = mus[:, ch] * .7 + fftconvolve(mus[:, ch], ir)[:N] * .45
mus[int(25.55 * SR):int(28.45 * SR)] *= 0   # silence vrai (pas de queue de réverbe)
fade = np.ones(N); i0 = int(39.6 * SR); fade[i0:] = np.linspace(1, 0, N - i0) ** 2; mus *= fade[:, None]

# —— bruitages (discrets) ——
def clink(f=2600):
    n = int(.35 * SR); tt = np.arange(n) / SR; return (np.sin(TAU * f * tt) + .5 * np.sin(TAU * f * 2.76 * tt)) * env(n, .001, .08) * .22
def tick():
    n = int(.08 * SR); return hp(rng.standard_normal(n), 3000) * env(n, .0005, .008) * .35 + np.sin(TAU * 1500 * np.arange(n) / SR) * env(n, .0005, .03) * .15
def shimmer(d=1.0):
    n = int(d * SR); tt = np.arange(n) / SR; x = sum(np.sin(TAU * f * tt * (1 + .3 * tt)) for f in (880, 1320, 1760, 2640)) / 4
    return x * np.sin(np.pi * np.clip(tt / d, 0, 1)) * .12
def lock():
    n = int(.4 * SR); x = hp(rng.standard_normal(n), 1800) * env(n, .0005, .02) * .8; x[int(.06 * SR):] += hp(rng.standard_normal(n - int(.06 * SR)), 900) * env(n - int(.06 * SR), .0005, .04); return x * .6
def sigh(d=1.1):   # soupir de Max avant sa première phrase
    n = int(d * SR); tt = np.arange(n) / SR; x = lp(hp(rng.standard_normal(n), 400), 1800)
    return x * np.sin(np.pi * tt / d) ** 1.5 * (1 - .4 * tt / d) * .09
put(sfx, sigh(), 0.0, 1, -.1)
for ev in E['ev']:
    t, ty = ev['t'], ev['type']
    if ty == 'holoOn': put(sfx, shimmer(1.0), t, 1)
    elif ty in ('coinIn', 'clink'): put(sfx, clink(rng.uniform(2300, 3000)), t, .8, rng.uniform(-.3, .3))
    elif ty == 'tick': put(sfx, tick(), t, .8)
    elif ty == 'lock': put(sfx, lock(), t, 1.0)

# —— voix (petite pièce pour les asseoir dans le salon) ——
for ev in E['ev']:
    if ev['type'] == 'vo':
        x, sr = sf.read(os.path.join(HERE, 'out', 'vo', ev['id'] + '.wav'))
        put(vox, x * 1.6, ev['t'], 1.0, -.08 if ev['id'][0] == 'm' else .08)
v = vox.copy()
for d, g in ((.013, .16), (.023, .1), (.037, .06)): k = int(d * SR); v[k:] += vox[:-k] * g
vox = v

# —— ambiance : ronron du frigo, horloge (bien audible dans le silence) ——
room = lp(rng.standard_normal(N), 160) * .02 + np.sin(TAU * 60 * T) * .003
amb[:, 0] += room; amb[:, 1] += room
for k in range(41): put(amb, tick() * (1.0 if 25.5 <= k + .3 < 29.8 else .35), k + .3, .5, .4)

# —— mixage : musique baissée sous les voix ——
venv = np.convolve(np.abs(vox[:, 0]), np.ones(int(.08 * SR)) / int(.08 * SR), 'same')
duck = 1 - .5 * np.clip(venv / (venv.max() * .15 + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(int(.15 * SR)) / int(.15 * SR), 'same')
mix = mus * duck[:, None] * 1.1 + sfx * .9 + vox * 1.0 + amb * 1.0
mix = np.tanh(mix * .9) / .9
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix / (np.abs(mix).max() + 1e-9) * .9, SR)
for name, b in (('music', mus), ('sfx', sfx), ('voice', vox), ('amb', amb)): sf.write(os.path.join(HERE, 'out', f'stem_{name}.wav'), b / (np.abs(b).max() + 1e-9) * .9, SR)
print('ok', round(DUR, 2), 's')
