# Voix Piper sans service externe : phonèmes espeak-ng (phonemizer) → modèle VITS ONNX (onnxruntime)
# Usage : python tts.py <épisode>   — lit <épisode>/episode.json (« lines »), écrit <épisode>/out/raw/<id>.wav
import json, os, sys, numpy as np, soundfile as sf, onnxruntime as ort, espeakng_loader
from phonemizer.backend.espeak.wrapper import EspeakWrapper
EspeakWrapper.set_library(espeakng_loader.get_library_path()); EspeakWrapper.set_data_path(espeakng_loader.get_data_path())
from phonemizer.backend import EspeakBackend
HERE = os.path.dirname(os.path.abspath(__file__))
VOICES = os.environ.get('VOICES', os.path.join(HERE, '..', '..', 'vaultr-tiktok', '.voices'))
MODEL = os.path.join(VOICES, 'vits-piper-fr_FR-upmc-medium', 'fr_FR-upmc-medium.onnx')
# réglages par personnage (une réplique peut les surcharger) : Max grave et las, l'IA plus petite et posée
CAST = {'MAX': {'sid': 1, 'speed': 1.28, 'ns': .75, 'nw': .8, 'pitch': -2.0}, 'IA': {'sid': 1, 'speed': 1.28, 'ns': .6, 'nw': .8, 'pitch': 2.5}}
ESPEAK = EspeakBackend('fr-fr', preserve_punctuation=True, with_stress=True)
sess = ort.InferenceSession(MODEL, providers=['CPUExecutionProvider']); cfg = json.load(open(MODEL + '.json', encoding='utf-8')); idmap = cfg['phoneme_id_map']
def ids(ph):
    out = idmap['^'] + idmap['_']
    for c in ph:
        if c in idmap: out += idmap[c] + idmap['_']
    return out + idmap['$']
ep = sys.argv[1]; out = os.path.join(ep, 'out', 'raw'); os.makedirs(out, exist_ok=True)
for L in json.load(open(os.path.join(ep, 'episode.json'), encoding='utf-8'))['lines']:
    P = {**CAST[L['speaker']], **L}; ph = ESPEAK.phonemize([P['tts']])[0].strip()
    x = np.array([ids(ph)], dtype=np.int64)
    a = sess.run(None, {'input': x, 'input_lengths': np.array([x.shape[1]], dtype=np.int64), 'sid': np.array([P['sid']], dtype=np.int64),
                        'scales': np.array([P['ns'], 1 / P['speed'], P['nw']], dtype=np.float32)})[0].squeeze().astype(np.float32)
    nz = np.where(np.abs(a) > .01)[0]
    if len(nz): a = a[max(0, nz[0] - 200): nz[-1] + 1200]
    sf.write(os.path.join(out, L['id'] + '.wav'), a, cfg['audio']['sample_rate'])
    print(L['id'], round(len(a) / cfg['audio']['sample_rate'], 2), ph)
