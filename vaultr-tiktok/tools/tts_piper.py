# Voix Piper sans service externe : phonèmes espeak-ng (phonemizer) → modèle VITS ONNX (onnxruntime)
# Usage : python tts_piper.py lines.json out_dir   — une réplique = {id, voice, sid, speed, ns, nw, tts}
import json, os, sys, numpy as np, soundfile as sf, onnxruntime as ort, espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path()); EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
from phonemizer.backend import EspeakBackend
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V = {'upmc': 'vits-piper-fr_FR-upmc-medium/fr_FR-upmc-medium.onnx'}
ESPEAK = EspeakBackend('fr-fr', preserve_punctuation=True, with_stress=True)
models = {}
def model(v):
    if v not in models:
        p = os.path.join(HERE, '.voices', V[v]); cfg = json.load(open(p + '.json', encoding='utf-8'))
        models[v] = (ort.InferenceSession(p, providers=['CPUExecutionProvider']), cfg)
    return models[v]
def ids(ph, idmap):
    out = idmap['^'] + idmap['_']
    for c in ph:
        if c in idmap: out += idmap[c] + idmap['_']
    return out + idmap['$']
lines, out = json.load(open(sys.argv[1], encoding='utf-8')), sys.argv[2]; os.makedirs(out, exist_ok=True); dur = {}
for L in lines:
    sess, cfg = model(L['voice']); ph = ESPEAK.phonemize([L['tts']])[0].strip()
    x = np.array([ids(ph, cfg['phoneme_id_map'])], dtype=np.int64)
    feeds = {'input': x, 'input_lengths': np.array([x.shape[1]], dtype=np.int64),
             'scales': np.array([L.get('ns', .667), 1 / L.get('speed', 1.0), L.get('nw', .8)], dtype=np.float32)}
    if cfg.get('num_speakers', 1) > 1: feeds['sid'] = np.array([L.get('sid', 0)], dtype=np.int64)
    a = sess.run(None, feeds)[0].squeeze().astype(np.float32); sr = cfg['audio']['sample_rate']
    nz = np.where(np.abs(a) > .01)[0]
    if len(nz): a = a[max(0, nz[0] - 200): nz[-1] + 1200]
    sf.write(os.path.join(out, L['id'] + '.wav'), a, sr); dur[L['id']] = round(len(a) / sr, 3)
    print(L['id'], dur[L['id']], ph)
json.dump(dur, open(os.path.join(out, 'dur.json'), 'w'), indent=1)
