# Vaultr V2 — DA « Le Coffre »

Mêmes fonctionnalités que `vaultr/maquette.html`, nouvelle direction artistique.

- **Matière** : métal sombre de porte de coffre (dégradés acier, léger brossé).
- **Couleur** : le laiton `#E3B04B` est réservé à l'argent et à la valeur ; les actions
  sont en blanc os `#F2EEE6` ; vert = validé, rouge = perdu / à traiter.
- **Typo** : Big Shoulders Display (chiffres et titres, esprit tableau de stade),
  Instrument Sans (texte), IBM Plex Mono (montants et étiquettes « gravés »).
- **Concept** : le cadran du coffre a un verrou par séance ; chaque validation en allume un.
  Ouverture de l'appli = porte de coffre (verrous qui rentrent, volant, porte qui s'ouvre).
- Séances en pastilles, onglets en dock, tableau de bord coach en « scoreboard ».

## Fichiers

- `app.html` : la page publiée (Artifact) ; `index.html` : la même page autonome (démo).
- `src/` : `base.css` (styles de structure), `theme.css` (la DA), `body.html` (l'appli).

## Ajouts

- **Mode clair « plein soleil »** : bouton ☀️/🌙 dans l'en-tête et réglage *Sombre / Clair / Auto*
  (Auto suit l'appareil ou claude.ai). Papier crème, laiton bronze, encre noire ; le coffre,
  les vignettes d'exercices, la carte et les célébrations restent en métal sombre.
  Passage d'un mode à l'autre par un cercle qui se déploie depuis le bouton.
- **Coffre grand ouvert** : quand toute la mise du mois est récupérée, les verrous rentrent,
  le volant tourne, la porte s'ouvre sur des lingots, puis confettis et pluie de pièces
  (une seule fois par mois).
- **Carte de partage** (story Instagram 1080 × 1920) : progression, victoire ou recap ;
  bouton « Enregistrer l'image » (feuille de partage native dans l'appli Claude iOS)
  et légende à copier.
- **Recap du mois** façon « Wrapped » : story plein écran, une dizaine d'écrans animés
  (argent arraché au coffre, séances, tube du mois, grand oublié, jour sacré, plus longue série,
  toi et ton coach, comparaison avec le mois d'avant, personnalité sportive, résumé).
  Appui long = pause, tap à gauche/droite = écran précédent/suivant.
  Il arrive 3 jours avant la fin du mois (ouverture automatique, une fois) dans l'onglet
  « Ma page » du sportif (ex-« Paiements »), avec un compte à rebours avant ; celui du mois
  passé reste visible les 5 premiers jours du mois suivant.
- **Programmes (coach)** : nouvel onglet avec la bibliothèque du coach.
  *Blocs* = exercices réutilisables (nom, consigne, séances/mois, difficulté, démo vidéo ou photo
  qui tourne en boucle chez le client à la place de l'animation) ; *templates* = assemblages
  de blocs nommés, à donner à un ou plusieurs clients. Dans le programme d'un client : appliquer
  un template, ajouter des blocs d'une touche, et choisir qui fixe les montants
  (« L'IA répartit » ou « Je choisis »). Données : `profiles/<coach>/blocks` et `profiles/<coach>/templates`.
- **Notifications** : à la première arrivée dans l'appli (après l'inscription), une page monte
  depuis le bas (croix pour la fermer) : cloche qui sonne, raisons d'activer, interrupteur façon iPhone
  et exemples de notifications qui tombent en boucle, adaptés au sportif (« Karim a ajouté de
  nouveaux exercices ! », « +3 € rendus »…) ou au coach (« Léa t'écrit », « Nouvelle preuve à
  vérifier ! »…). Réglable ensuite dans ⚙️. Si le navigateur l'autorise, les messages, l'argent
  rendu et les nouvelles preuves déclenchent une vraie notification quand l'appli est en arrière-plan.
- **Blocs sponsorisés** : sous les exercices du sportif, un carrousel « Près de chez toi » qui défile
  seul (pause au toucher) : salle de sport, course locale, nutrition, magasin de running, yoga, et un
  bloc « Ta marque ici » qui présente l'offre aux annonceurs (ciblage ville / sport / objectif, tarif indicatif).
  Les annonceurs de la démo sont des marques fictives ; les annonces sont une simple liste (`ADS`)
  à remplacer par une collection alimentée par les vrais annonceurs.
- **Adresse et coachs proches** : à l'inscription, le sportif indique son adresse (ou touche
  « 📍 Ma position »). Elle est reconnue sans service externe (quartiers de Nice, villes de la Côte
  d'Azur et grandes villes françaises, codes postaux) et **seul le quartier ou la ville est enregistré**,
  jamais la rue. La liste « Trouver un coach » est triée par distance (« 🏅 Le plus proche · à 800 m »),
  après les coachs boostés. Adresse modifiable dans ⚙️ et depuis la liste des coachs.
