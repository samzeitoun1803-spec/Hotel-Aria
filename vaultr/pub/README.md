# Pub Vaultr (motion, 50 s, 60 images/s)

- `vaultr-pub-9x16.mp4` : 1080 × 1920, pour Instagram (Reels, Stories), TikTok, YouTube Shorts.
- `vaultr-pub-16x9.mp4` : 1920 × 1080, pour les présentations investisseurs (fond flouté).

Pensée pour quelqu'un qui ne connaît pas le projet (sportif, coach ou investisseur), dans l'esprit d'une keynote :
1. Le problème : « Chaque année, on paie pour se motiver. Et chaque année, on abandonne. Jusqu'à maintenant. »
2. Le produit : « Vaultr. L'appli de sport où ton argent te motive. »
3. Comment ça marche : 1 Mise (coach ou coach IA, mise en jeu) · 2 Bouge (séances qui valent une part de la mise)
   · 3 Récupère (séance validée = argent rendu, compteur jusqu'à +30 €).
4. « Tout fait ? Tu récupères tout. » / « Tu lâches ? L'argent reste au coffre. » + l'aversion à la perte.
5. Partage (story, Top 12 %, Recap) · Coachs (clients motivés, paiement, programmes, visibilité)
   · Le modèle (mises non récupérées, Coach Pro, mise en avant, annonces locales).
6. Signature : « Vaultr · Ton effort te rembourse. · Sportifs, coachs, investisseurs : rejoignez l'aventure. »

Fondus enchaînés entre toutes les scènes, musique originale sans coupure générée par `src/music.py` (aucun droit tiers).
Images : vrais écrans de la V3 (`src/cap.js`).

Refaire : `node src/render.js src/ad.html frames 60 0 50.5`, `python3 src/music.py music.wav`, puis ffmpeg à 60 i/s.
