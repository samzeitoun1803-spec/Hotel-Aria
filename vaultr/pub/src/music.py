import numpy as np, wave, sys
SR = 44100; DUR = 50.5; N = int(SR * DUR)
rng = np.random.default_rng(5)
L = np.zeros(N); R = np.zeros(N)
def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i >= N or j <= i: return
    s = sig[:j - i] * gain
    k = min(len(s), int(.02 * SR)); s = s.copy(); s[-k:] *= np.linspace(1, 0, k) ** 2
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))
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
    return reverb(np.tanh(s * 2), 1.0, .25)
def clap():
    n = int(.35 * SR); nz = filt(rng.standard_normal(n), 1100, True); e = env(n, .001, .09)
    for k in (.009, .018, .027): e[int(k * SR):] += env(n - int(k * SR), .001, .05) * .55
    return reverb(filt(nz * e, 7500), 1.2, .3) * .55
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


CH = [(57, 60, 64), (53, 57, 60), (55, 60, 64), (55, 59, 62)]; RT = [45, 41, 48, 43]
SEC = [(6.5, 10.5, "reveal"), (10.5, 19.5, "build"), (19.5, 24, "drop"), (24, 28, "lift"), (28, 32, "tension"), (32, 40.5, "groove"), (40.5, 45, "light"), (45, 51, "end")]
def sec(t):
    for a, b, k in SEC:
        if a <= t < b: return k
    return "intro"
# intro : piano intime + battements de cœur
mel = [(0.3, 64), (1.0, 67), (1.5, 69), (2.3, 64), (3.2, 60), (3.9, 62), (4.6, 64), (5.3, 72)]
for tt, m in mel: add(reverb(piano(m, 3, .9), 3, .5), tt, .9, .15)
for tt, ch in ((0.3, (45, 52)), (3.2, (41, 48)), (5.3, (48, 55, 60))): [add(reverb(piano(m, 4, .6), 3, .5), tt, .7, -.15) for m in ch]
for k in range(5): add(kick(.6), 3.0 + k * .7, .35); add(kick(.5), 3.0 + k * .7 + .22, .22)
add(pad((57, 64, 69), 4.0, 900), 3.0, .25)
# accords et nappes continus (2 s), du dévoilement à la fin
for k in range(int((45 - 6.5) / 2) + 1):
    t0 = 6.5 + 2 * k; s = sec(t0)
    ch = CH[k % 4] if s != "tension" else [(57, 60, 64), (52, 56, 59)][k % 2]
    br = {"reveal": 2200, "build": 1600, "drop": 3600, "lift": 2800, "tension": 900, "groove": 3000, "light": 2200}.get(s, 2000)
    add(reverb(pad(ch + (ch[0] + 12,), 2.3, br), 2.2, .45), t0, .3 if s != "tension" else .36)
# rythmique par temps (0,5 s)
for b in range(int((45 - 6.5) / .5)):
    t = 6.5 + b * .5; s = sec(t); k = b % 4; ch = CH[(b // 4) % 4]; rt = RT[(b // 4) % 4]
    if s == "tension": rt = [45, 40][(b // 4) % 2]
    if s in ("reveal", "build", "lift", "light"):  # arpège de piano
        add(reverb(piano(ch[b % 3] + 12, 1.4, .65), 1.8, .4), t, .45, .3 if b % 2 else -.3)
        add(reverb(piano(ch[(b + 1) % 3] + 24, 1.0, .4), 1.4, .3), t + .25, .3, -.3 if b % 2 else .3) if s != "reveal" else None
    if s == "build":
        add(stomp(), t, .8)
        if k in (1, 3): add(clap(), t, .7, .1)
        for q in range(4): add(shaker(), t + q * .125, .45 + .3 * (q % 2), -.4)
        if t >= 15: add(bass(rt - 12, .22), t, .55); add(bass(rt - 12, .22), t + .25, .4)
    if s in ("drop", "groove"):
        big = s == "drop"
        add(kick(1.2 if big else 1.0), t, 1.0 if big else .9)
        if k in (1, 3): add(clap(), t, .65)
        for q in range(4): add(shaker(), t + q * .125, .5)
        add(bass(rt - 12, .22), t, .8); add(bass(rt - 12, .22), t + .25, .6)
        add(stab(ch + (ch[0] + 12,)), t + .25, .6 if big else .38, .25 if b % 2 else -.25)
    if s == "lift" and k == 0: add(kick(1.0), t, .7)
    if s == "light":
        add(kick(.9), t, .7)
        if k in (1, 3): add(clap(), t, .45)
        add(bass(rt - 12, .4), t, .5)
    if s == "tension":
        if k == 0: add(kick(.8), t, .6); add(kick(.6), t + .25, .35)
        add(bass(rt - 12, .45), t, .55)
# impacts et montées, toujours annoncés
for tt, g in ((6.5, 1.2), (19.5, 1.4), (24.4, .9), (28.0, 1.0), (32.0, 1.1), (45.0, 1.3)): add(boom(g), tt, .85)
for st, d, g in ((5.0, 1.5, .55), (9.5, 1.0, .35), (17.5, 2.0, .7), (31.0, 1.0, .5), (43.5, 1.5, .6)): add(riser(d), st, g)
for i in range(12): add(clap(), 18.5 + (1 - (1 - i / 12) ** 1.7), .2 + .5 * i / 12)
pent = [76, 79, 81, 84, 86, 88, 91, 93]
for i in range(30): add(bell(pent[rng.integers(len(pent))]), 20.0 + rng.random() * 2.8, .16, rng.random() * 2 - 1)
for i, m in enumerate((69, 72, 76, 81)): add(reverb(piano(m, 3, .8), 3, .5), 24.4 + i * .18, .55)
# fin : piano, nappe, cloches
for m in (45, 57, 60, 64, 71): add(reverb(piano(m, 5, .8), 4, .55), 45.0, .55)
add(reverb(pad((57, 64, 71, 76), 5.5, 1800), 4, .6), 45.0, .4)
add(reverb(bell(88, 2.5), 3, .6), 45.8, .35); add(reverb(bell(93, 2.5), 3, .6), 46.4, .25)
# automation de volume aux transitions progressives (aucune marche brutale)
pts = [(0, .32), (2.6, .34), (3.4, .45), (6.0, .55), (6.6, .85), (10.2, .75), (10.8, .72), (19.0, .9), (19.6, 1.0), (23.6, 1.0), (24.4, .8), (27.6, .82), (28.4, .75), (31.6, .78), (32.4, .9), (40.2, .9), (40.8, .8), (44.6, .8), (45.4, .62), (50.5, .55)]
auto = np.interp(np.arange(N) / SR, [p[0] for p in pts], [p[1] for p in pts]); L *= auto; R *= auto
for ch in (L, R): ch[:] = np.tanh(ch * .9)
fn = int(2.0 * SR); fade = np.ones(N); fade[-fn:] = np.linspace(1, 0, fn) ** 1.5; L *= fade; R *= fade
pk = max(np.abs(L).max(), np.abs(R).max()); L /= pk / .9; R /= pk / .9
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.stack([L, R], 1) * 32767).astype(np.int16).tobytes())
print("ok")
