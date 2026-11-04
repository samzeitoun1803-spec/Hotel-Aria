# Musique profonde synthétisée selon l'humeur de chaque temps (sad / warm / silence / resolve / end) : piano grave, nappes,
# sub, pouls de cœur, réverbe de salle ; bruitages tirés de events.json ; voix ; ambiance du salon. Écrit <épisode>/out/mix.wav.
import json, os, sys, numpy as np, soundfile as sf
from scipy.signal import fftconvolve
ep = sys.argv[1]; SR = 48000; TAU = 2 * np.pi
P = json.load(open(os.path.join(ep, 'out', 'plan.json'))); E = json.load(open(os.path.join(ep, 'events.json')))
DUR = P['dur'] + .3; N = int(DUR * SR); T = np.arange(N) / SR
rng = np.random.default_rng(abs(hash(os.path.basename(os.path.abspath(ep)))) % 2 ** 31)
mus, sfx, vox, amb = [np.zeros((N, 2)) for _ in range(4)]
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
def put(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(x))
    if i >= N or j <= i or i < 0: return
    x = x[:j - i] * g; k = min(len(x), 240); x = x.copy(); x[-k:] *= np.linspace(1, 0, k)
    buf[i:j, 0] += x * (1 - max(0, pan)); buf[i:j, 1] += x * (1 + min(0, pan))
def env(n, a=.003, d=.2):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X /= np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))
def hp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X /= np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4); return np.fft.irfft(X, len(x))
# —— instruments ——
def piano(m, t, v=.5, d=None, pan=0.0):
    f0 = mf(m); d = d or (4.5 if m < 52 else 3.2 if m < 64 else 2.2); n = int(d * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for k in range(1, 9):
        fk = f0 * k * np.sqrt(1 + .0004 * k * k)
        if fk > 9000: break
        x += np.sin(TAU * fk * tt + rng.uniform(0, TAU)) * (1 / k ** 1.3) * np.exp(-tt * (.5 + .6 * k) * (f0 / 220) ** .35)
    x += lp(rng.standard_normal(n), 2500) * env(n, .0005, .012) * .15
    x *= np.minimum(1, tt / .004) * np.minimum(1, (d - tt) / .3)
    put(mus, lp(x, 1200 + 3000 * v) * v * .35, t, 1, pan)
def pad(ms, t, d, g=.08, bright=900):
    n = int(d * SR); tt = np.arange(n) / SR; x = np.zeros(n)
    for m in ms:
        for dt in (.996, 1.0, 1.004): x += 2 * ((tt * mf(m) * dt + rng.random()) % 1) - 1
    x = lp(x / (3 * len(ms)), bright) * np.minimum(1, tt / 1.0) * np.minimum(1, (d - tt) / 1.0)
    put(mus, x * g, t, 1, rng.uniform(-.3, .3))
def sub(m, t, d, g=.22):
    n = int(d * SR); tt = np.arange(n) / SR
    put(mus, np.sin(TAU * mf(m) * tt) * np.minimum(1, tt / .3) * np.minimum(1, (d - tt) / .5) * g, t)
def heart(t, g=.45):
    for dt, gg in ((0, 1), (.18, .6)):
        n = int(.4 * SR); tt = np.arange(n) / SR; f = 42 + 50 * np.exp(-tt / .03)
        put(mus, np.sin(np.cumsum(f) / SR * TAU) * env(n, .002, .12) * g * gg, t + dt)
def boom(t, g=.75):
    n = int(3.0 * SR); tt = np.arange(n) / SR; f = 34 + 40 * np.exp(-tt / .15)
    x = np.sin(np.cumsum(f) / SR * TAU) * env(n, .003, 1.0) + lp(rng.standard_normal(n), 300) * env(n, .003, .4) * .3
    put(mus, np.tanh(x * 1.2) * g, t)
A, F, C, G, Em = (45, 52, 57, 60, 64), (41, 48, 53, 57, 60), (36, 48, 52, 55, 60), (43, 50, 55, 59, 62), (40, 52, 55, 59, 64)
PROG = {'sad': [A, F, C, Em], 'warm': [F, G, A, C], 'resolve': [F, G, A, F]}
MEL = {'sad': [76, 72, 71, 69], 'warm': [72, 74, 76, 79], 'resolve': [72, 74, 76, 81]}
def bar(ch, t, d, v, arp, pg, bright):
    r = ch[0] - 12 if ch[0] > 40 else ch[0]
    piano(r, t, v * .9); piano(ch[0], t + .02, v * .6); pad([x + 12 for x in ch[1:4]], t, d + .8, pg, bright); sub(r, t, d + .3)
    if arp:
        notes = [ch[2] + 12, ch[3] + 12, ch[4] + 12, ch[3] + 12]
        for i in range(int(d / .39)): piano(notes[i % 4], t + .39 * i + .01, v * .36, pan=.25 if i % 2 else -.25)
    else:
        for i, m in enumerate(ch[2:]): piano(m + 12, t + .3 + i * .1, v * .42, pan=(i - 1) * .3)
CH = 2.1; idx = {}; silences = []
boom(0.0, .75); piano(33, 0.0, .8); piano(45, 0.0, .6)
for b in P['beats']:
    m = b.get('music', 'sad'); t0, t1 = b['t0'], b['t1']
    if m == 'silence': silences.append((t0 + .05, t1)); continue
    if m == 'end':
        boom(t0, .7); bar(C, t0, 4.5, .55, False, .11, 1800)
        for k, n in enumerate((84, 88, 91)): piano(n, t0 + .1 + k * .8, .28 - k * .03)
        pad([67, 72, 76], t0 + 1.2, max(2.0, t1 - t0), .06, 2000); continue
    t = t0
    while t < t1 - .4:
        k = idx.get(m, 0); idx[m] = k + 1; ch = PROG[m][k % 4]; d = min(CH, t1 - t + .6)
        bar(ch, t, d, .42 if m == 'sad' else .45, m != 'sad', .07 if m == 'sad' else .09, 900 if m == 'sad' else 1400)
        piano(MEL[m][k % 4], t + d * .55, .26, pan=.2)
        if m != 'sad':
            for h in np.arange(t, t + d - .05, .78): heart(h, .4)
        t += d
# réverbe de salle
n = int(2.6 * SR); tt = np.arange(n) / SR
for c in range(2):
    ir = lp(rng.standard_normal(n), 4500) * np.exp(-tt / .6); ir /= np.sqrt((ir ** 2).sum())
    mus[:, c] = mus[:, c] * .7 + fftconvolve(mus[:, c], ir)[:N] * .45
for a, b in silences:   # silence vrai, puis un grondement sous la chute
    mus[int(a * SR):int(b * SR)] *= 0
i0 = int((P['dur'] - 1.4) * SR); fade = np.ones(N); fade[i0:] = np.linspace(1, 0, N - i0) ** 2; mus *= fade[:, None]
for a, b in silences: put(mus, (lambda n: np.sin(np.cumsum(34 + 40 * np.exp(-np.arange(n) / SR / .15)) / SR * TAU) * env(n, .003, 1.0) * .5)(int(2.5 * SR)), a + (b - a) * .55)

# —— bruitages ——
def clink(f=2600):
    n = int(.35 * SR); tt = np.arange(n) / SR; return (np.sin(TAU * f * tt) + .5 * np.sin(TAU * f * 2.76 * tt)) * env(n, .001, .08) * .22
def tick():
    n = int(.08 * SR); return hp(rng.standard_normal(n), 3000) * env(n, .0005, .008) * .35 + np.sin(TAU * 1500 * np.arange(n) / SR) * env(n, .0005, .03) * .15
def shimmer(d=1.0):
    n = int(d * SR); tt = np.arange(n) / SR; x = sum(np.sin(TAU * f * tt * (1 + .3 * tt)) for f in (880, 1320, 1760, 2640)) / 4
    return x * np.sin(np.pi * np.clip(tt / d, 0, 1)) * .12
def lock():
    n = int(.4 * SR); x = hp(rng.standard_normal(n), 1800) * env(n, .0005, .02) * .8; x[int(.06 * SR):] += hp(rng.standard_normal(n - int(.06 * SR)), 900) * env(n - int(.06 * SR), .0005, .04); return x * .6
def stamp():
    n = int(.3 * SR); return lp(rng.standard_normal(n), 900) * env(n, .001, .05) * .7 + np.sin(TAU * 90 * np.arange(n) / SR) * env(n, .001, .08) * .4
def buzz():
    n = int(.35 * SR); tt = np.arange(n) / SR; return np.sign(np.sin(TAU * 110 * tt)) * lp(np.ones(n), 2000) * env(n, .005, .12) * .08
def sigh(d=1.1):
    n = int(d * SR); tt = np.arange(n) / SR; x = lp(hp(rng.standard_normal(n), 400), 1800)
    return x * np.sin(np.pi * tt / d) ** 1.5 * (1 - .4 * tt / d) * .09
SFX = {'holoOn': lambda: shimmer(1.0), 'coinIn': lambda: clink(rng.uniform(2300, 3000)), 'clink': lambda: clink(rng.uniform(2300, 3000)),
       'tick': tick, 'lock': lock, 'stamp': stamp, 'buzz': buzz, 'sigh': sigh}
for ev in E['ev']:
    if ev['type'] in SFX: put(sfx, SFX[ev['type']](), ev['t'], .85, rng.uniform(-.25, .25))
# —— voix ——
for ev in E['ev']:
    if ev['type'] == 'vo':
        x, sr = sf.read(os.path.join(ep, 'out', 'vo', ev['id'] + '.wav')); put(vox, x * 1.6, ev['t'], 1.0, -.08 if ev.get('who') == 'MAX' else .08)
v = vox.copy()
for d, g in ((.013, .16), (.023, .1), (.037, .06)): k = int(d * SR); v[k:] += vox[:-k] * g
vox = v
# —— ambiance : frigo, horloge (bien audible dans les silences) ——
room = lp(rng.standard_normal(N), 160) * .02 + np.sin(TAU * 60 * T) * .003
amb[:, 0] += room; amb[:, 1] += room
for k in range(int(DUR)):
    loud = any(a <= k + .3 < b for a, b in silences); put(amb, tick() * (1.0 if loud else .35), k + .3, .5, .4)
# —— mixage ——
venv = np.convolve(np.abs(vox[:, 0]), np.ones(int(.08 * SR)) / int(.08 * SR), 'same')
duck = 1 - .5 * np.clip(venv / (venv.max() * .15 + 1e-9), 0, 1)
duck = np.convolve(duck, np.ones(int(.15 * SR)) / int(.15 * SR), 'same')
mix = mus * duck[:, None] * 1.1 + sfx * .9 + vox + amb
mix = np.tanh(mix * .9) / .9
sf.write(os.path.join(ep, 'out', 'mix.wav'), mix / (np.abs(mix).max() + 1e-9) * .9, SR)
print('mix ok', round(DUR, 2), 's')
