# Écrit les repères de sous-titres (cues.json, mêmes temps que l'image) puis le .srt via l'outil de la bibliothèque
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']
dur = json.load(open(os.path.join(HERE, 'out', 'vo', 'lipsync.json')))['dur']
L = {l['id']: l for l in json.load(open(os.path.join(HERE, 'lines.json'), encoding='utf-8'))}
VO = [('m1', .35), ('m2', 4.4), ('m3', 8.85), ('a1', 10.9), ('a2', 13.75), ('a3', 16.1), ('a4', 20.0), ('a5', 23.15), ('m4', 25.8), ('a6', 27.7), ('a7', 30.0), ('m5', 33.6), ('a8', 35.7)]
cues = [{'t0': 0.0, 't1': .34, 'text': "Si t'abandonnes toujours le sport… écoute ça."}]
for i, (k, t0) in enumerate(VO):
    nxt = VO[i + 1][1] if i + 1 < len(VO) else 41.0
    cues.append({'t0': t0, 't1': min(nxt - .05, t0 + dur[k] + .5), 'text': f"{L[k]['speaker']} : {L[k]['sub']}"})
cues.append({'t0': 38.3, 't1': 41.0, 'text': 'VAULTR — Ton effort te rembourse. Bientôt sur iOS et Android'})
json.dump(cues, open(os.path.join(HERE, 'out', 'cues.json'), 'w'), ensure_ascii=False)
subprocess.run([sys.executable, os.path.join(LIB, 'core/render/srt.py'), os.path.join(HERE, 'out', 'cues.json'), os.path.join(HERE, 'vaultr-tiktok.srt')], check=True)
