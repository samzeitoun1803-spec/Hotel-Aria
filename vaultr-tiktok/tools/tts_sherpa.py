# Voix Piper (sherpa-onnx) : tts_sherpa.py lines.json out_dir   — une réplique = {id, voice, sid, speed, text}
import json, os, sys, numpy as np, soundfile as sf, sherpa_onnx
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = {'tom': 'vits-piper-fr_FR-tom-medium/fr_FR-tom-medium.onnx', 'upmc': 'vits-piper-fr_FR-upmc-medium/fr_FR-upmc-medium.onnx'}
cache = {}
def tts(v, ns=.667, nw=.8):
    k = (v, ns, nw)
    if k not in cache:
        d = os.path.join(HERE, '.voices', os.path.dirname(V[v]))
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=os.path.join(HERE, '.voices', V[v]), tokens=os.path.join(d, 'tokens.txt'), data_dir=os.path.join(d, 'espeak-ng-data'), noise_scale=ns, noise_scale_w=nw), num_threads=4))
        cache[k] = sherpa_onnx.OfflineTts(cfg)
    return cache[k]
lines, out = json.load(open(sys.argv[1], encoding='utf-8')), sys.argv[2]; os.makedirs(out, exist_ok=True); dur = {}
for L in lines:
    a = tts(L['voice'], L.get('ns', .667), L.get('nw', .8)).generate(L['tts'], sid=L.get('sid', 0), speed=L.get('speed', 1.0))
    x = np.array(a.samples, dtype=np.float32); nz = np.where(np.abs(x) > .01)[0]
    if len(nz): x = x[max(0, nz[0] - 200): nz[-1] + 1200]
    sf.write(os.path.join(out, L['id'] + '.wav'), x, a.sample_rate); dur[L['id']] = round(len(x) / a.sample_rate, 3)
    print(L['id'], dur[L['id']], L['tts'])
json.dump(dur, open(os.path.join(out, 'dur.json'), 'w'), indent=1)
