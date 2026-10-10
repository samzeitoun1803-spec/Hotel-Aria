# Pub Vaultr (motion, 36 s, façon keynote)

- `vaultr-pub-9x16.mp4` : 1080 × 1920, pour Instagram (Reels, Stories), TikTok, YouTube Shorts.
- `vaultr-pub-16x9.mp4` : 1920 × 1080, pour les présentations investisseurs (fond flouté).

Scénario (inspiration keynote Apple) : noir et silence, piano feutré — « Chaque année, on paie pour se motiver. Et chaque
année, on abandonne. Jusqu'à maintenant. » → apparition du téléphone en 3D sous une lumière rasante, « Vaultr. »
→ « Mise. » → « Bouge. » → explosion musicale sur « Récupère. » avec le compteur qui monte à +30 € et la pluie de pièces
→ « Tout validé ? Le coffre s'ouvre. » → « Partage. » (Top 12 %, Recap) → « Et pour les coachs. » → logo, « Ton effort te
rembourse. », « Bientôt sur iOS et Android. »

Musique originale générée par `src/music.py` (aucun droit tiers). Images : vrais écrans de la V3 (`src/cap.js`).

Refaire la vidéo : `node src/render.js src/ad.html frames 30 0 36` (Playwright), `python3 src/music.py music.wav`,
puis assembler avec ffmpeg.
