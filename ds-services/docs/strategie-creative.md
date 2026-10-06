# DS SERVICES — Stratégie créative

> Phase 1, rédigée avant toute ligne de code. Elle fixe le concept, l'architecture et les règles du design system. Le code (phase 2) s'y réfère.

---

## 1. Analyse

### 1.1 L'entreprise : ce qui est vérifié, ce qui ne l'est pas

| Vérifié (registre du commerce) | Inconnu : à fournir par DS SERVICES |
|---|---|
| DS SERVICES, SARL | Téléphone, e-mail |
| Créée en juillet 2014, plus de dix ans d'activité | Certifications, labels, assurances, qualifications |
| Siège : 35 rue Rossini, 06000 Nice, dans le quartier des Musiciens | Avis, notes, nombre de clients |
| SIREN 803 488 584 | Tarifs, délais d'intervention |
| NAF 4321A : travaux d'installation électrique dans tous locaux | Réalisations (photos, lieux, années) |
| Activité déclarée : électricité et rénovation | Zones d'intervention précises |
| Gérant : David Sousan | Capital social, n° TVA, hébergeur du site |

Aujourd'hui, DS SERVICES **n'a pas de site** : les annuaires indiquent « site non communiqué ». Le nouveau site ne part donc d'aucun existant, ce qui laisse le champ libre pour construire une identité numérique.

**Règle absolue :** aucune donnée commerciale n'est inventée. Chaque information manquante est une valeur `null` dans `data/company.ts`. Elle s'affiche alors comme un placeholder visible, `[À compléter]`, et `npm run check:content` la liste.

### 1.2 La cible (hypothèses à valider avec le client)

1. **Propriétaires et occupants du centre de Nice.** Le quartier des Musiciens et les quartiers voisins sont faits d'immeubles Belle Époque, construits entre les années 1880 et 1914. Leurs installations électriques sont souvent anciennes. Les besoins typiques sont la rénovation, la mise à niveau et l'installation à l'occasion de travaux.
2. **Les prescripteurs** : architectes d'intérieur, maîtres d'œuvre, agences immobilières et syndics du centre-ville. Ils recommandent un artisan s'il est fiable, lisible et facile à joindre.
3. **Les commerces et bureaux**, puisque l'activité couvre « tous locaux ».

Ces trois publics veulent la même chose : savoir **à qui ils ont affaire**, pouvoir **le vérifier**, puis **demander un devis sans friction**.

### 1.3 La perception actuelle des sites d'électriciens

- Templates WordPress ou Wix, éclairs, jaune et noir, casques, photos de banque d'images.
- Promesses génériques : « dépannage 24/7 », « votre partenaire de confiance », étoiles invérifiables.
- Pages SEO dupliquées pour chaque ville, sans contenu réel.
- Plus grave : le dépannage à domicile est régulièrement associé à des intermédiaires anonymes aux pratiques douteuses, et les autorités mettent en garde contre eux. **Dans ce secteur, la confiance est le vrai produit.**

### 1.4 Les opportunités de différenciation

1. **La transparence vérifiable plutôt que la preuve sociale inventée.** On affiche l'adresse réelle, le SIREN, l'année de création et le nom du gérant, présentés comme le **cartouche** d'un plan d'architecte. Aucun concurrent anonyme ne peut copier ça.
2. **La retenue comme preuve de maîtrise.** Dans un secteur criard, un site calme, précis et aéré dit « travail propre » avant même qu'on lise une ligne.
3. **Un ancrage local réel** : rue Rossini, quartier des Musiciens. On ne montre pas de palmiers, on montre un plan de rues.
4. **Un fil conducteur propriétaire**, le courant, qui rend le site reconnaissable même sans logo.

---

## 2. Concept : « La colonne »

> Le site est un bâtiment. La ligne de courant est sa **colonne montante** : elle descend de la source et alimente chaque étage, c'est-à-dire chaque section, par une dérivation. En scrollant, le visiteur **met la page sous tension**. Quand il envoie sa demande, **le circuit se ferme**.

Le concept puise dans trois sources :

- **Le plan d'architecte** : cartouche, cotations, mention « schéma de principe, sans échelle », numérotation des planches, filets de 1 px.
- **Le schéma électrique unifilaire** : nœuds, dérivations en T, repères de circuits C1 à C4, angles droits.
- **Le réseau urbain** : la trame du quartier des Musiciens, réinterprétée en tracé abstrait.

Formule : *sophistication éditoriale × ingénierie électrique × architecture × retenue azuréenne*.

**Narration du fil :** SOURCE (hero) → EXPERTISE (intro, services) → INSTALLATION (savoir-faire, repères) → RÉALISATION (galerie, histoire) → CONTACT (le circuit se ferme).

**Règle du bleu :** le cobalt `#2545FF` représente **le courant**. Il n'apparaît que sur ce qui s'active : survol, focus, CTA, nœud alimenté, impulsion, navigation active. Il n'y a aucun bleu décoratif.

---

## 3. Architecture UX

| # | Section | Rôle | Ancre | Surface |
|---|---|---|---|---|
| 01 | Hero | Qui, quoi, où, en 3 secondes, avec le CTA devis. Le circuit source s'anime au chargement. | `#top` | Toile crème |
| 02 | Intro | Le manifeste : « Un travail électrique ne se voit pas toujours. Sa qualité, si. » | `#intro` | Toile crème |
| 03 | Services | Quatre lignes éditoriales. Chaque ligne pré-remplit le formulaire de devis. | `#services` | Papier blanc |
| 04 | Expertise | Rupture navy : « De l'énergie. De la précision. Du savoir-faire. » | `#expertise` | Navy |
| 05 | Repères | 2014 / 10+ / 06000, uniquement des données vérifiées, avec leur source citée. | `#reperes` | Toile crème |
| 06 | Réalisations | Galerie façon magazine d'architecture. Placeholders explicites tant qu'il n'y a pas de photos. | `#realisations` | Toile crème |
| 07 | Depuis 2014 | Frise minimale, sans événement inventé. | `#a-propos` | Papier blanc |
| 08 | Nice | « Ancrés ici. » : plan abstrait du quartier, point cobalt au 35 rue Rossini. | `#nice` | Toile crème + lavande |
| 09 | Contact | « Un projet en tête ? » : formulaire à états (validation, envoi, succès, erreur). | `#contact` | Papier blanc |
| — | Footer | Wordmark géant, adresse, navigation, mentions légales. | — | Navy |

**Navigation :** Services → `#services` · Expertise → `#expertise` · Réalisations → `#realisations` · À propos → `#a-propos`. Le bouton « Demander un devis » mène à `#contact`.

*Écart assumé par rapport au brief :* l'eyebrow de la section Services est « Services » et non « Expertise ». Comme la navigation contient les deux entrées, chaque lien doit tomber sur une section qui porte son nom. « Expertise » désigne donc la section navy.

**Pages annexes :** `/mentions-legales`, `/confidentialite` et une page 404 (« Circuit *ouvert.* »).

---

## 4. Design system

### 4.1 Couleurs

| Token | Hex | Rôle | Part |
|---|---|---|---|
| `canvas` | `#F9F8F6` | Toile principale | ≈ 55 % |
| `paper` | `#FFFFFF` | Surfaces papier, sections alternées | ≈ 20 % |
| `ink` | `#0C1754` | Titres, nœuds, sections sombres | ≈ 15 % |
| `charcoal` | `#171417` | Texte courant | ≈ 5 % |
| `line` | `#F0E9E1` | Séparateurs sur papier | — |
| `lavender` | `#EAEBF8` | Surface du plan de Nice uniquement | ≈ 2 % |
| `cobalt` | `#2545FF` | **Le courant**, uniquement à l'état actif | ≤ 3 % |

Tokens dérivés, ajoutés pour l'accessibilité et la lisibilité, jamais pour décorer :

- `line-strong` `#E4DBCF` : filets visibles sur la toile crème, où `#F0E9E1` disparaît.
- `cobalt-soft` `#A9B5FF` : liens actifs sur fond navy. Le cobalt pur sur navy n'atteint qu'un contraste de 2,7:1.
- `alert` `#B42318` : erreurs de formulaire, toujours accompagnées d'un texte.

### 4.2 Typographie

| Rôle | Police | Pourquoi |
|---|---|---|
| Display / UI | **Inter Tight** (variable) | Grotesque contemporaine, tracking négatif propre aux grandes tailles, proche de Diatype |
| Signature | **Fraunces Italic** (variable : axes opsz 144, SOFT, WONK 0) | Serif expressive et chaleureuse, dans l'esprit de GT Super ou Canela, open source (OFL) |
| Texte | **Inter** (variable) | Lisibilité maximale à 16–20 px |

Les polices sont auto-hébergées via `next/font/local`, sans aucun appel à Google, limitées au sous-ensemble latin et préchargées pour le hero.

**Échelle :**

- Hero : `clamp(68px, 9vw, 140px)`, et 12,4vw sur mobile.
- Titre de section : `clamp(48px, 6vw, 96px)`.
- Sous-titre : 24–36 px.
- Texte : 16–20 px.
- Eyebrow : 12 px, capitales, tracking 0,16em.
- Tracking négatif des grands titres : de −0,045 à −0,055em.

**Signature typographique** (une sans-serif, puis un mot en serif italique), **quatre occurrences seulement** :

1. Hero : « L'électricité, *maîtrisée.* »
2. Intro : « … *Sa qualité, si.* »
3. Services : « … par une bonne *connexion.* »
4. Contact : « Un projet *en tête ?* »
5. (Hors parcours, sur la page 404 : « Circuit *ouvert.* »)

**Détails de typographie française :** apostrophe typographique `’`, espace fine insécable avant `?` et `!`, guillemets « », chiffres tabulaires dans les données.

### 4.3 Grille

- 12 colonnes, contenu de 1280 px maximum. Gouttières latérales de 20 px (mobile), 32 px (tablette) et 48 px (desktop). Espace entre colonnes de 24 px.
- **Le rail** : la colonne montante court dans la marge gauche, 28 px avant le bord du contenu sur desktop et 10 px sur mobile. Les eyebrows s'y accrochent par un nœud.
- Rythme vertical sur 8 px. Les sections ont 120 à 176 px de marge verticale sur desktop, 88 à 112 px sur mobile.
- Les compositions sont asymétriques, avec des décalages d'une ou deux colonnes. Le vide est un matériau.

### 4.4 Composants signature

- **Bouton pill** : fond cobalt, rayon 999 px, aucune ombre. Au survol, une impulsion fait le tour du contour, la flèche avance et le label glisse. Effet magnétique sur desktop.
- **Eyebrow à nœud** : un nœud sur le rail, une dérivation de 20 px, puis le label en capitales.
- **Ligne éditoriale** (services) : numéro, titre, description et glyphe schématique propre à chaque service.
- **Champ à contour actif** : au focus, le filet crème devient cobalt après le passage d'une impulsion.
- **Figure à masque** : rayon de 22 px, révélation par clip-path, parallaxe de ±5 %.
- **Cartouche** : bande de métadonnées vérifiées, dans le hero et le footer.

---

## 5. Langage d'animation

**Principe :** *tout réagit exactement comme il devrait.* Une animation a une fonction (guider, confirmer, relier) ou elle disparaît.

**Trois verbes, pas plus :**

1. **Tracer** : un trait se dessine (`stroke-dashoffset`).
2. **Alimenter** : le cobalt traverse, puis l'élément se stabilise en navy. C'est l'état « sous tension ».
3. **Révéler** : un texte ou une image sort d'un masque.

**Courbes :**

- `--ease-current` : `cubic-bezier(0.22, 1, 0.36, 1)`, pour les sorties nettes.
- `--ease-precise` : `cubic-bezier(0.65, 0, 0.35, 1)`, pour les déplacements symétriques.
- Micro-interactions : 300–450 ms. Révélations : 700–1 100 ms.

**Timeline du hero** (en CSS, donc indépendante de l'hydratation, et sans loader) :

| t | Événement |
|---|---|
| 0,0 s | Toile crème ; le plan inactif est presque invisible |
| 0,2 s | Apparition du nœud source |
| 0,4 → 1,4 s | L'impulsion cobalt parcourt le circuit ; les nœuds s'activent au passage |
| 1,0 s | Apparition de « DS SERVICES » et de la navigation |
| 1,3 s | Révélation par masque de « L'électricité, » |
| 1,5 s | « *maîtrisée.* » reçoit l'énergie : balayage cobalt, puis stabilisation en navy |
| 1,7 s | Texte d'accompagnement et CTA |

**Le rail au scroll :** la portion déjà parcourue est « sous tension » (navy discret). La tête d'impulsion cobalt suit le scroll et s'étire selon la vitesse. Les nœuds s'allument quand elle les franchit, et chaque dérivation (services, frise, contact) se déclenche à son passage.

**`prefers-reduced-motion` :** pas de smooth scroll, pas de parallaxe, pas de curseur personnalisé, aucune animation de révélation. Tous les états finaux sont affichés : le site reste complet et beau, statique.

**Performance :**

- On n'anime que `transform`, `opacity`, `clip-path` et `stroke-dashoffset`. Aucun layout shift.
- Les animations de fond sont mises en pause hors écran et quand l'onglet est caché.
- Pas de WebGL : il n'apporterait rien ici.

---

## 6. Parcours de conversion

1. **Un CTA devis toujours à portée** : dans la navigation (desktop), dans le hero, en barre collante discrète (mobile, cachée pendant la lecture de la section Contact) et à la fin de chaque ligne de service.
2. **Une intention captée** : un clic sur « Rénovation électrique » ouvre le formulaire avec ce type de projet déjà sélectionné.
3. **Un formulaire sans friction** : nom, téléphone **ou** e-mail (au moins l'un des deux), type de projet, message. Les erreurs s'affichent en ligne, en français, avec un texte (jamais la couleur seule).
4. **Une confiance démontrée** : adresse, SIREN, date de création, gérant. Tout est vérifiable.
5. **Un retour d'état clair** : chargement (l'impulsion boucle autour du bouton), succès (le circuit se ferme : « ✓ Demande envoyée »), erreur (le circuit s'ouvre, avec un message et la possibilité de réessayer).
6. **Anti-spam invisible** : champ piège, piège temporel, limite de débit côté serveur.
7. **Prévu pour la suite** : dès que `company.phone` est renseigné, un bouton « Appeler » apparaît automatiquement (hero mobile, contact, menu).

---

## 7. À obtenir de DS SERVICES avant la mise en ligne

- [ ] Numéro de téléphone et e-mail de contact
- [ ] 3 à 6 photos réelles de chantiers, avec type, lieu et année
- [ ] Liste exacte des prestations, pour préciser les 4 lignes de service
- [ ] Zones d'intervention confirmées
- [ ] Mentions légales : capital social, n° TVA, hébergeur, directeur de la publication
- [ ] Éventuelles certifications ou assurances, **à n'afficher que sur justificatif**
- [ ] Nom de domaine
