# Pub Vaultr (motion, 46 s, 60 images/s)

- `vaultr-pub-9x16.mp4` : 1080 × 1920, pour Instagram (Reels, Stories), TikTok, YouTube Shorts.
- `vaultr-pub-16x9.mp4` : 1920 × 1080, pour les présentations (fond flouté).

Un mot par écran, lisible d'un coup d'œil :
« Tu paies. » → « Tu abandonnes. » → « Jusqu'à maintenant. » → « Vaultr. Ton argent te motive. »
→ 1 « Mise. » (50 €) → 2 « Agis. » (Course, Pompes, Gainage) → 3 « Récupère. » (compteur +30 €, pluie de pièces)
→ « Tout fait ? Tout récupéré. » → « Tu lâches ? Tu perds. » → « Partage. » (Top 12 %)
→ « Coachs. » (Clients motivés, Paiements, Programmes, Visibilité) → « Vaultr · Ton effort te rembourse. · Bientôt sur iOS et Android. »

Fondus enchaînés, musique originale sans coupure générée par `src/music.py` (aucun droit tiers).
Images : vrais écrans de la V3 (`src/cap.js`).

Refaire : `node src/render.js src/ad.html frames 60 0 46`, `python3 src/music.py music.wav`, puis ffmpeg à 60 i/s.
