# Hôtel Aria — Nice

Site vitrine animé de l'Hôtel Aria*** (15 avenue Auber, Place Mozart, Nice).

- **Direction artistique** : toile parchemin `#d8cbb8`, serif fin en capitales (Cormorant Garamond 300), sans‑serif Satoshi 500, accent safran `#d49653` unique, angles vifs et filets d'1 px.
- **Animations** : loader, smooth scroll (Lenis), titres révélés ligne par ligne, texte qui se remplit au scroll, images en clip‑path, parallaxes, défilement horizontal épinglé des chambres, image qui s'ouvre en plein écran, compteurs, marquees réactifs à la vitesse de scroll.
- **Survol** : curseur personnalisé avec bulle « Voir », boutons magnétiques, liens à texte roulant, aperçu d'image flottant sur les services, zoom/tilt des photos, lignes qui se colorent.
- Respecte `prefers-reduced-motion` et fonctionne sans JavaScript d'animation.

Contenus repris des informations publiques de l'hôtel (site officiel, plateformes de réservation). Les avis sont présentés sous forme de **synthèse** des tendances, avec les notes publiques (Booking.com 8,5/10 sur 1 626 avis, Hotels.com 8,6/10) — à mettre à jour si besoin.

## Lancer

```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

## Photos

Voir [`assets/images/README.md`](assets/images/README.md) — `./scripts/fetch-images.sh` récupère les photos du site officiel.

## Structure

```
index.html
css/style.css
js/main.js
js/vendor/   gsap, ScrollTrigger, lenis (embarqués)
assets/images/
scripts/fetch-images.sh
```

## Projet Portier

[`portier/index.html`](portier/index.html) : maquette de **Portier**, un moteur de réservation directe sans commission pour hôtels indépendants (calculateur de commissions, application cliquable, tarifs, business plan). Fichier autonome, à ouvrir directement dans un navigateur.

## Projet Revendo

[`revendo/index.html`](revendo/index.html) : maquette de **Revendo**, une app pour les revendeurs de seconde main (annonce générée à partir d'une photo, prix conseillé, suivi du stock et des bénéfices, business plan). Fichier autonome.

## Projet Récup

[`recup/index.html`](recup/index.html) : maquette de **Récup**, une app qui repère l'argent qu'on te doit (vols et trains en retard, colis non livrés, prélèvements en trop) et envoie les réclamations, payée 20 % seulement en cas de remboursement. Fichier autonome.
