# Pub Vaultr (motion, 31 s)

- `vaultr-pub-9x16.mp4` : 1080 × 1920, pour Instagram (Reels, Stories), TikTok, YouTube Shorts.
- `vaultr-pub-16x9.mp4` : 1920 × 1080, pour les présentations investisseurs (fond flouté).

Scénario : le problème (« Tu paies ta salle et tu n'y vas pas. ») → la promesse → 01 la mise → 02 le coach
→ 03 chaque séance rembourse → le coffre s'ouvre → partage (Top 12 %, Recap) → les coachs → signature
« Ton effort te rembourse. · Bientôt sur iOS & Android ».

Musique originale générée par `src/music.py` (aucun droit tiers). Images : vrais écrans de la V3.

Refaire la vidéo : `node src/render.js src/ad.html frames 30 0 31.5` (Playwright), `python3 src/music.py music.wav`,
puis assembler avec ffmpeg (voir l'historique du dépôt pour la commande).
