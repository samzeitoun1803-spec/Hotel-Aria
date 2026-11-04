# Sous-titres .srt de l'épisode (mêmes temps que l'image) via l'outil de la bibliothèque Lemo-Opuscar
import json, os, subprocess, sys
ep = sys.argv[1]; LIB = os.environ['LIB']
E = json.load(open(os.path.join(ep, 'episode.json'), encoding='utf-8')); P = json.load(open(os.path.join(ep, 'out', 'plan.json')))
L = {l['id']: l for l in E['lines']}
seq = [l for b in P['beats'] for l in b['lines']]
cues = []
for i, l in enumerate(seq):
    nxt = seq[i + 1]['t0'] if i + 1 < len(seq) else P['dur']
    cues.append({'t0': l['t0'], 't1': min(nxt - .05, l['t0'] + l['dur'] + .5), 'text': f"{L[l['id']]['speaker']} : {L[l['id']]['sub']}"})
cues.append({'t0': P['beats'][-1]['t0'] + 2.0, 't1': P['dur'], 'text': 'VAULTR — ' + E.get('tagline', 'Ton effort te rembourse.') + ' Bientôt sur iOS et Android'})
json.dump(cues, open(os.path.join(ep, 'out', 'cues.json'), 'w'), ensure_ascii=False)
name = os.path.basename(os.path.abspath(ep))
subprocess.run([sys.executable, os.path.join(LIB, 'core/render/srt.py'), os.path.join(ep, 'out', 'cues.json'), os.path.join(ep, name + '.srt')], check=True)
