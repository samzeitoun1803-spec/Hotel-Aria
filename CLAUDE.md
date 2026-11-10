# Consignes du projet

## Jeu « Étage 12 » (`jeu-entreprise/index.html`)

- À chaque modification du jeu, la nouvelle version doit repartir de zéro, sauf si l'utilisateur précise le contraire :
  incrémenter `SAVE_KEY` (`etage12-vN`) **et** la version `v` utilisée dans `newGame()` et `load()`.
  Au démarrage, le jeu efface toutes les sauvegardes `etage12-*` qui ne correspondent pas à la clé courante.
- Le jeu est publié comme Artifact (même URL) après chaque modification, puis commité et poussé.
