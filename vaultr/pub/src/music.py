import numpy as np, wave, sys
SR = 44100; DUR = 31.5; N = int(SR * DUR)
rng = np.random.default_rng(3)
L = np.zeros(N); R = np.zeros(N)
t_all = np.arange(N) / SR
def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); j = min(N, i + len(sig))
    if i >= N: return
    s = sig[:j - i] * gain
    L[i:j] += s * (1 - max(0, pan)); R[i:j] += s * (1 + min(0, pan))
def env(n, a=.002, d=.3):
    t = np.arange(n) / SR; e = np.exp(-t / d); att = np.minimum(1, t / max(a, 1e-4)); return e * att
def lowpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(X, len(x))
def highpass(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4); return np.fft.irfft(X, len(x))
def reverb(x, secs=2.2, mix=.35):
    n = int(secs * SR); ir = rng.standard_normal(n) * np.exp(-np.arange(n) / SR / (secs / 5)); ir = lowpass(ir, 6000); ir /= np.sqrt((ir ** 2).sum())
    m = len(x) + n; y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[:len(x)]
    return x * (1 - mix) + y * mix * 1.2
def kick(big=1.0):
    n = int(.45 * SR); t = np.arange(n) / SR; f = 45 + 110 * np.exp(-t / .045); ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * env(n, .001, .16 * big) + .25 * rng.standard_normal(n) * env(n, .0005, .006)
    return np.tanh(s * 1.6)
def clap():
    n = int(.3 * SR); nz = highpass(rng.standard_normal(n), 900); e = env(n, .001, .08)
    for k in (.008, .016): e[int(k * SR):] += env(n - int(k * SR), .001, .05) * .6
    return lowpass(nz * e, 7000) * .5
def hat(open_=False):
    n = int((.25 if open_ else .06) * SR); return highpass(rng.standard_normal(n), 7000) * env(n, .0005, .07 if open_ else .018) * .35
def saw(f, n): t = np.arange(n) / SR; return 2 * ((t * f) % 1) - 1
def note(f, dur, kind="bass"):
    n = int(dur * SR)
    if kind == "bass":
        s = .6 * np.sin(2 * np.pi * f * np.arange(n) / SR) + .4 * lowpass(saw(f, n) + saw(f * 1.005, n), 600)
        return s * env(n, .005, dur * .9)
    if kind == "pad":
        s = sum(saw(f * d, n) for d in (1, 1.004, .996, 2.002)); s = lowpass(s, 1800) / 4
        e = np.minimum(1, np.arange(n) / (SR * .4)) * np.minimum(1, (n - np.arange(n)) / (SR * .5)); return s * e
    if kind == "pluck":
        s = lowpass(saw(f, n) + .5 * saw(f * 2, n), 3500) * env(n, .002, .18); return s
    if kind == "bell":
        t = np.arange(n) / SR; s = np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) + .25 * np.sin(2 * np.pi * f * 5.4 * t); return s * env(n, .001, .35)
def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR; nz = rng.standard_normal(n)
    parts = []
    seg = n // 8
    out = np.zeros(n)
    for k in range(8):
        a, b = k * seg, (k + 1) * seg if k < 7 else n
        out[a:b] = highpass(nz[a:b], 300 + k * 900)
    sw = np.sin(2 * np.pi * np.cumsum(200 + 1400 * (t / dur) ** 2) / SR) * .3
    return (out * .5 + sw) * (t / dur) ** 2.2
def impact(size=1.0):
    n = int(2.5 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(35 + 70 * np.exp(-t / .08)) / SR) * env(n, .001, .7 * size)
    nz = lowpass(rng.standard_normal(n), 3000) * env(n, .001, .25 * size) * .5
    return reverb(np.tanh((boom + nz) * 1.4), 2.5, .4)
def midi(m): return 440 * 2 ** ((m - 69) / 12)

beat = .5
# --- intro : tension + coups sur les mots
drone = note(midi(33), 2.6, "pad") * .5; add(lowpass(drone, 400), 0, .8)
for tt, g in ((.15, .9), (.55, .9), (1.15, 1.3), (1.6, .5)): add(impact(.5 if g < 1 else .8), tt, .55 * g)
add(riser(1.0), 1.5, .35)
# --- impacts aux coupes
for tt, g in ((2.5, .9), (5.0, 1.0), (9.0, .6), (13.0, .9), (17.0, 1.2), (20.5, .6), (24.0, .6), (27.0, 1.3)): add(impact(g), tt, .6 * g)
# --- risers avant les gros moments
add(riser(2.0), 3.0, .4); add(riser(1.0), 12.0, .3); add(riser(1.5), 15.5, .45); add(riser(2.0), 25.0, .45)
# --- batterie
for k in range(int((27.0 - 2.5) / beat)):
    tt = 2.5 + k * beat
    if tt < 5.0:
        if k % 2 == 0: add(kick(), tt, .8)
        continue
    add(kick(1.15 if 17 <= tt < 20.5 else 1.0), tt, .95)
    if k % 2 == 1 and tt >= 9.0: add(clap(), tt, .7, .1)
    add(hat(open_=(k % 4 == 3)), tt + beat / 2, .8, -.3)
    if tt >= 13.0: add(hat(), tt + beat / 4, .35, .3); add(hat(), tt + 3 * beat / 4, .35, .3)
# roulements de caisse claire
for st, en in ((4.0, 5.0), (16.0, 17.0), (26.0, 27.0)):
    n = 16
    for i in range(n): add(clap(), st + (en - st) * (1 - (1 - i / n) ** 1.6), .25 + .5 * i / n)
# --- basse + nappes : la mineur, fa, do, sol (2 s par accord)
prog = [(45, (57, 60, 64)), (41, (57, 60, 65)), (48, (55, 60, 64)), (43, (55, 59, 62))]
bassbus = np.zeros(N)
for bar in range(int((27.0 - 5.0) / 2)):
    t0 = 5.0 + bar * 2; root, ch = prog[bar % 4]
    for k in range(8):  # croches de basse
        s = note(midi(root - 12), .24, "bass"); i = int((t0 + k * .25) * SR); bassbus[i:i + len(s)] += s[:max(0, N - i)] * (.9 if k % 2 == 0 else .6)
    pad = sum(note(midi(m), 2.0, "pad") for m in ch); add(reverb(pad, 2.0, .5), t0, .22)
# pompe : la basse s'efface à chaque coup de grosse caisse
duck = np.ones(N)
for k in range(int((27.0 - 5.0) / beat)):
    i = int((5.0 + k * beat) * SR); n = int(.22 * SR); duck[i:i + n] = np.minimum(duck[i:i + n], 1 - .75 * np.exp(-np.arange(n) / (.07 * SR)))
L += bassbus * duck * .55; R += bassbus * duck * .55
# --- mélodie arpégée pour le drop (17 → 27)
arp = [0, 7, 12, 15, 12, 7]
for bar in range(5):
    t0 = 17.0 + bar * 2; root, ch = prog[bar % 4]
    for k in range(16):
        m = root + 12 + [0, 3 if root in (45,) else 4, 7, 12][k % 4] + (12 if k % 8 >= 4 else 0)
        add(reverb(note(midi(m), .3, "pluck"), 1.2, .3), t0 + k * .125, .22, .4 if k % 2 else -.4)
# --- pièces qui tombent (13.5 → 16)
pent = [76, 79, 81, 84, 86, 88, 91]
for i in range(26):
    tt = 13.5 + rng.random() * 2.4; add(note(midi(pent[rng.integers(len(pent))]), .6, "bell"), tt, .12, rng.random() * 2 - 1)
# --- final : accord tenu
fin = sum(note(midi(m), 4.3, "pad") for m in (45, 57, 60, 64, 71)); add(reverb(fin, 3, .5), 27.0, .35)
add(note(midi(81), 2.5, "bell"), 27.45, .25); add(note(midi(88), 2.5, "bell"), 27.9, .2)
# --- master
for ch in (L, R):
    ch[:] = np.tanh(ch * 1.1)
fade = np.ones(N); fn = int(1.2 * SR); fade[-fn:] = np.linspace(1, 0, fn)
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max()); L /= peak / .92; R /= peak / .92
data = (np.stack([L, R], 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
print("ok", DUR)
