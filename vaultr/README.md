# Vaultr

Appli de sport où le sportif paie son coach et ajoute une **mise de motivation**.
Chaque exercice validé par le coach (en séance ou sur photo) lui rend une partie de
sa mise. Les montants non validés en fin de mois restent à Vaultr.

**Paiements simulés** : aucune vraie somme n'est débitée.

## Fichiers

- `maquette.html` : l'appli, publiée en Artifact claude.ai (comptes + base partagée).
- `index.html` : la même page avec son en-tête HTML ; ouverte hors de claude.ai,
  elle tourne en mode démo (données gardées dans le navigateur).
- `palettes.html` : la comparaison des palettes de couleurs.

## Fonctionnement

- **Vrais comptes** (sur claude.ai) : chacun crée son profil sportif ou coach avec un
  `@tag`. Les données sont partagées en direct :
  - `profiles/<id>` : profil (chacun ne modifie que le sien) ;
  - `programs/<id sportif>` : coach, mise, exercices (valeur, séances, argent déjà rendu) ;
  - `proofs/*` : photos ou vidéos envoyées par le sportif, validées ou refusées par le coach.
    Une vidéo (30 s max) est compressée sur le téléphone (480 px, sans le son), découpée
    en morceaux dans `proofs/<id>/chunks/*`, puis supprimée une fois la preuve traitée ;
  - `events/*` : historique de l'argent (mises, exercices validés).
  - `chats/<sportif>__<coach>` : dernière activité et lecture de chaque conversation ;
    `chats/<id>/messages/*` : les messages (messagerie coach ⇄ client façon WhatsApp).
- **Mode démo** : Léa (sportive) et Karim (coach), sans compte.
- **Encaissement** : quand un exercice est validé, le sportif voit un écran plein
  « +X € » avec une pluie de pièces, même s'il rouvre l'appli plus tard.
- L'argent déjà rendu est acquis : modifier le programme ou la mise ne répartit que
  ce qui reste.
