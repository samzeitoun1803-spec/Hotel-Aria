# Hauteur par personnage (rubberband : Max plus grave, l'IA plus petite), présence, compression, niveau commun ;
# écrit <épisode>/out/vo/<id>.wav et lipsync.json (enveloppes à 24 Hz + durées)
import json, os, subprocess, sys, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
ep = sys.argv[1]; SR = 48000
CAST = {'MAX': -2.0, 'IA': 2.5}
lines = json.load(open(os.path.join(ep, 'episode.json'), encoding='utf-8'))['lines']
os.makedirs(os.path.join(ep, 'out', 'vo'), exist_ok=True)
def resample(x, sr):
    n = int(len(x) * SR / sr); return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)
def shelf(x, fc, g):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 + (10 ** (g / 20) - 1) / (1 + (fc / np.maximum(f, 1)) ** 2); return np.fft.irfft(X, len(x))
def comp(x, thr=.25, ratio=3.0):
    env = np.abs(x); k = int(.008 * SR); env = np.convolve(env, np.ones(k) / k, 'same') + 1e-9
    return x * np.where(env > thr, (thr + (env - thr) / ratio) / env, 1.0)
env_out, dur = {}, {}
for L in lines:
    src = os.path.join(ep, 'out', 'raw', L['id'] + '.wav'); dst = os.path.join(ep, 'out', 'raw', L['id'] + '.p.wav')
    st = L.get('pitch', CAST[L['speaker']])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', 'rubberband=pitch=%.5f:pitchq=quality' % 2 ** (st / 12), dst], check=True)
    x, sr = sf.read(dst)
    if x.ndim > 1: x = x.mean(1)
    x = resample(x, sr); x = shelf(x, 3500, 3); x = comp(x / (np.abs(x).max() + 1e-9) * .9)
    x = np.concatenate([np.zeros(int(.02 * SR)), x, np.zeros(int(.05 * SR))])
    k = int(.004 * SR); x[:k] *= np.linspace(0, 1, k); x[-k:] *= np.linspace(1, 0, k)
    x = x / (np.sqrt((x ** 2).mean()) + 1e-9) * .12
    sf.write(os.path.join(ep, 'out', 'vo', L['id'] + '.wav'), x, SR)
    hop = SR // 24; n = len(x) // hop
    rms = np.array([np.sqrt((x[i * hop:(i + 1) * hop] ** 2).mean()) for i in range(n)])
    env_out[L['id']] = [round(float(v), 3) for v in np.clip(rms / (rms.max() + 1e-9), 0, 1)]
    dur[L['id']] = round(len(x) / SR, 3)
json.dump({'env': env_out, 'dur': dur}, open(os.path.join(ep, 'out', 'vo', 'lipsync.json'), 'w'))
print('voix ok', dur)
