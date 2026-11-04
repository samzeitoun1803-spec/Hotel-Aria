# Minutage automatique : chaque « temps » (beat) de l'épisode dure le temps de ses répliques (+ pauses) ;
# écrit <épisode>/out/plan.json : { dur, beats:[{…, t0, t1, lines:[{id, t0, dur}]}] }
import json, os, sys
ep = sys.argv[1]
E = json.load(open(os.path.join(ep, 'episode.json'), encoding='utf-8'))
dur = json.load(open(os.path.join(ep, 'out', 'vo', 'lipsync.json')))['dur']
t = 0.0; beats = []
for i, B in enumerate(E['beats']):
    b = {k: v for k, v in B.items() if k != 'lines'}; b['t0'] = round(t, 3); b['lines'] = []
    lt = t + B.get('lead', .35 if i == 0 else .25)
    for j, lid in enumerate(B.get('lines', [])):
        b['lines'].append({'id': lid, 't0': round(lt, 3), 'dur': dur[lid]}); lt += dur[lid] + B.get('between', .22)
    end = (lt - B.get('between', .22) if B.get('lines') else lt) + B.get('gap', .25)
    t = max(end, t + B.get('min', 0)); b['t1'] = round(t, 3); beats.append(b)
plan = {'dur': round(t, 3), 'beats': beats}
json.dump(plan, open(os.path.join(ep, 'out', 'plan.json'), 'w'), indent=1)
print('plan', plan['dur'], 's,', len(beats), 'temps')
