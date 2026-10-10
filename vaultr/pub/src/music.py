import numpy as np, wave, sys
SR = 44100; DUR = 36.5; N = int(SR * DUR)
rng = np.random.default_rng(5)
L = np.zeros(N); R = np.zeros(N)
def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i >= N or j <= i: return
    s = sig[:j - i] * gain; L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))
def env(n, a=.002, d=.3):
    t = np.arange(n) / SR; return np.exp(-t / d) * np.minimum(1, t / max(a, 1e-4))
def filt(x, fc, hp=False):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    X *= (1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4)) if hp else (1 / np.sqrt(1 + (f / fc) ** 4)); return np.fft.irfft(X, len(x))
def reverb(x, secs=2.5, mix=.4):
    n = int(secs * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (secs / 5)); ir = filt(ir, 5000); ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n; y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)
    out = np.zeros(m); out[:len(x)] += x * (1 - mix); out += y * mix * 1.3; return out
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def piano(m, dur=2.5, vel=1.0):
    n = int(dur * SR); t = np.arange(n) / SR; f = midi(m); s = np.zeros(n)
    for h, a in ((1, 1), (2, .45), (3, .22), (4, .12), (5, .07), (6, .04)):
        fh = f * h * (1 + .0004 * h * h); s += a * np.sin(2 * np.pi * fh * t) * np.exp(-t / (1.6 / h ** .6))
    s += .06 * filt(rng.standard_normal(n), 3000) * env(n, .0005, .01)
    return s * np.minimum(1, t / .003) * vel * .35
def saw(f, n): t = np.arange(n) / SR; return 2 * ((t * f) % 1) - 1
def pad(ms, dur, bright=1500):
    n = int(dur * SR); s = sum(saw(midi(m) * d, n) for m in ms for d in (1, 1.005, .995)); s = filt(s, bright) / (3 * len(ms))
    e = np.minimum(1, np.arange(n) / (SR * .8)) * np.minimum(1, (n - np.arange(n)) / (SR * .8)); return s * e
def kick(big=1.0):
    n = int(.5 * SR); t = np.arange(n) / SR; f = 42 + 100 * np.exp(-t / .05)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, .001, .18 * big) + .2 * rng.standard_normal(n) * env(n, .0005, .005); return np.tanh(s * 1.7)
def stomp():
    n = int(.4 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(70 + 60 * np.exp(-t / .03)) / SR) * env(n, .001, .12) + .5 * filt(rng.standard_normal(n), 900) * env(n, .001, .05)
    return reverb(np.tanh(s * 2), 1.0, .25)[:n * 2]
def clap():
    n = int(.35 * SR); nz = filt(rng.standard_normal(n), 1100, True); e = env(n, .001, .09)
    for k in (.009, .018, .027): e[int(k * SR):] += env(n - int(k * SR), .001, .05) * .55
    return reverb(filt(nz * e, 7500), 1.2, .3)[:n * 2] * .55
def shaker():
    n = int(.08 * SR); return filt(rng.standard_normal(n), 6000, True) * env(n, .01, .025) * .25
def bass(m, dur):
    n = int(dur * SR); f = midi(m); s = .7 * np.sin(2 * np.pi * f * np.arange(n) / SR) + .3 * filt(saw(f, n), 500); return s * env(n, .004, dur * .8)
def stab(ms, dur=.3):
    n = int(dur * SR); s = sum(saw(midi(m), n) + saw(midi(m) * 1.007, n) for m in ms); return filt(s, 4200) * env(n, .003, .12) / len(ms) * .5
def bell(m, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR; f = midi(m)
    return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.76 * t) + .2 * np.sin(2 * np.pi * f * 5.4 * t)) * env(n, .001, .4) * .5
def riser(dur, top=5000):
    n = int(dur * SR); t = np.arange(n) / SR; out = np.zeros(n); seg = n // 10
    nz = rng.standard_normal(n)
    for k in range(10):
        a, b = k * seg, (n if k == 9 else (k + 1) * seg); out[a:b] = filt(nz[a:b], 200 + k * top / 10, True)
    return out * (t / dur) ** 2.5 * .6
def boom(size=1.0):
    n = int(3 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(30 + 60 * np.exp(-t / .1)) / SR) * env(n, .002, .9 * size) + .35 * filt(rng.standard_normal(n), 1800) * env(n, .001, .3 * size)
    return reverb(np.tanh(s * 1.5), 3.5, .45)

# tonalité : la mineur → do majeur lumineux. Accords (2 s chacun) : Am  F  C  G
CH = [(57, 60, 64), (53, 57, 60), (55, 60, 64), (55, 59, 62)]; RT = [45, 41, 48, 43]
# 1) 0 → 6.5 : piano seul, grave et intime, + battements de cœur
mel = [(0.3, 64), (1.05, 67), (1.55, 69), (2.3, 64), (3.2, 60), (3.9, 62), (4.6, 64), (5.25, 72)]
for tt, m in mel: add(reverb(piano(m, 3, .9), 3, .5), tt, .9, .15)
for tt, ch in ((0.3, (45, 52)), (3.2, (41, 48)), (5.25, (48, 55, 60))): [add(reverb(piano(m, 4, .6), 3, .5), tt, .7, -.15) for m in ch]
for k in range(5): add(kick(.6), 3.0 + k * .7, .35); add(kick(.5), 3.0 + k * .7 + .22, .22)
add(pad((57, 64, 69), 3.5, 900), 3.0, .25); add(riser(1.4, 3000), 5.1, .55)
# 2) 6.5 : apparition — grand impact + nappe qui s'élève
add(boom(1.2), 6.5, .9)
add(reverb(pad((45, 57, 60, 64, 69, 76), 4.0, 2400), 3, .5), 6.5, .5)
for k in range(14):  # arpège de piano
    ch = CH[(k // 4) % 4]; add(reverb(piano(ch[k % 3] + 12, 1.5, .7), 2, .4), 6.5 + .25 * k, .55, .3 if k % 2 else -.3)
# 3) 10 → 18 : stomp-clap qui monte
bar = 2.0
for b in range(4):
    t0 = 10 + b * bar; ch = CH[b % 4]; rt = RT[b % 4]
    add(reverb(pad(ch, bar, 1600 + b * 400), 2, .4), t0, .32)
    for k in range(4):
        add(stomp(), t0 + k * .5, .8)
        if k in (1, 3): add(clap(), t0 + k * .5, .75, .1)
    for k in range(16):
        add(shaker(), t0 + k * .125, .5 + .4 * (k % 2), -.4)
        if b >= 2: add(bass(rt - 12, .2), t0 + k * .25, .5) if k < 8 else None
    for k in range(8): add(reverb(piano(ch[k % 3] + 12, 1, .5), 1.5, .35), t0 + k * .25, .4, .35)
add(riser(2.0), 16.0, .7)
for i in range(12): add(clap(), 17.0 + 1.0 * (1 - (1 - i / 12) ** 1.7), .2 + .5 * i / 12)
# 4) 18 → 22 : l'explosion (Récupère / +30 €)
add(boom(1.4), 18.0, 1.0)
for b in range(2):
    t0 = 18 + b * bar
    for b2, (ch, rt) in enumerate([(CH[2], RT[2]), (CH[3], RT[3])][b:b + 1]):
        add(reverb(pad(ch + (ch[0] + 12,), bar, 3500), 2, .35), t0, .38)
        for k in range(4): add(kick(1.2), t0 + k * .5, 1.0); add(clap(), t0 + k * .5 + .5, .55) if k % 2 == 0 else None
        for k in range(8): add(stab(ch + (ch[0] + 12,)), t0 + k * .25 + .125, .7, .25 if k % 2 else -.25)
        for k in range(8): add(bass(rt - 12, .22), t0 + k * .25, .8)
pent = [76, 79, 81, 84, 86, 88, 91, 93]
for i in range(30): add(bell(pent[rng.integers(len(pent))]), 18.45 + rng.random() * 2.6, .16, rng.random() * 2 - 1)
# 5) 22 → 25.5 : moment suspendu, puis le coffre s'ouvre
add(reverb(pad((57, 64, 69, 72, 76), 3.6, 2600), 3.5, .55), 22.0, .45)
add(riser(1.2), 22.1, .5); add(boom(1.0), 23.3, .85)
for i, m in enumerate((69, 72, 76, 81)): add(reverb(piano(m, 3, .8), 3, .5), 23.3 + i * .18, .6)
for b in range(1):
    pass
for k in range(4): add(kick(1.0), 24.0 + k * .5, .8)
for k in range(8): add(stab(CH[0] + (69,)), 24.0 + k * .25 + .125, .45)
# 6) 25.5 → 32 : groove complet
for b in range(3):
    t0 = 25.5 + b * bar; ch = CH[b % 4]; rt = RT[b % 4]
    add(reverb(pad(ch, bar, 3000), 2, .35), t0, .3)
    for k in range(4): add(kick(), t0 + k * .5, .9); add(clap(), t0 + k * .5, .6) if k % 2 else None
    for k in range(16): add(shaker(), t0 + k * .125, .5)
    for k in range(8): add(bass(rt - 12, .22), t0 + k * .25, .7); add(stab(ch), t0 + k * .25 + .125, .35)
add(riser(1.6), 30.4, .6)
# 7) 32 → 36.5 : signature — impact, puis silence habité
add(boom(1.3), 32.0, .9)
for m in (45, 57, 60, 64, 71): add(reverb(piano(m, 4.5, .8), 4, .55), 32.0, .55)
add(reverb(pad((57, 64, 71, 76), 4.5, 1800), 4, .6), 32.0, .4)
add(reverb(bell(88, 2.5), 3, .6), 32.8, .35); add(reverb(bell(93, 2.5), 3, .6), 33.4, .25)
# master — automation de volume : intime au début, explosion au milieu
pts=[(0,.32),(2.9,.36),(3,.45),(6.4,.55),(6.5,.85),(10,.72),(17.9,.92),(18,1.0),(21.9,1.0),(22,.72),(25.4,.8),(25.5,.9),(31.9,.92),(32,.62),(36.5,.55)]
auto=np.interp(np.arange(N)/SR,[p[0] for p in pts],[p[1] for p in pts]); L*=auto; R*=auto
for ch in (L, R): ch[:] = np.tanh(ch * .9)
fn = int(1.4 * SR); fade = np.ones(N); fade[-fn:] = np.linspace(1, 0, fn) ** 1.5; L *= fade; R *= fade
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk / .9; R /= pk / .9
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
print("ok")
