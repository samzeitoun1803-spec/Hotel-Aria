# Écrit les repères de sous-titres (cues.json) puis le .srt via l'outil de la bibliothèque
import json, os, subprocess, sys
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ['LIB']
dur = json.load(open(os.path.join(HERE, 'out', 'vo', 'lipsync.json')))['dur']
lines = {L['id']: L['sub'] for L in json.load(open(os.path.join(HERE, 'lines.json'), encoding='utf-8'))}
VO = [('ai1', 4.8), ('ai2', 6.55), ('ai3', 8.75), ('ai4', 11.7), ('ai5', 15.35), ('ai6', 20.75), ('ai7', 23.55), ('ai8', 26.05), ('ai9', 30.0), ('ai10', 32.0)]
cues = [{'t0': .3, 't1': 2.9, 'text': "MAX : j'veux faire du sport mais je suis motivé qu'une fois par mois 😩"}, {'t0': 10.15, 't1': 11.0, 'text': 'MAX : QUOI ?!'}, {'t0': 28.15, 't1': 29.95, 'text': "MAX : …c'est quoi le nom 👀"}]
for i, (k, t0) in enumerate(VO):
    nxt = VO[i + 1][1] if i + 1 < len(VO) else 34.4
    cues.append({'t0': t0, 't1': min(nxt, t0 + max(1.8, dur[k] + .6)), 'text': 'IA : ' + lines[k]})
cues.append({'t0': 34.5, 't1': 37.5, 'text': 'VAULTR — Ton effort te rembourse. Bientôt sur iOS et Android'})
cues.sort(key=lambda c: c['t0'])
json.dump(cues, open(os.path.join(HERE, 'out', 'cues.json'), 'w'), ensure_ascii=False)
subprocess.run([sys.executable, os.path.join(LIB, 'core/render/srt.py'), os.path.join(HERE, 'out', 'cues.json'), os.path.join(HERE, 'vaultr-tiktok.srt')], check=True)
