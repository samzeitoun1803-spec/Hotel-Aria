# Jasmin Voyages — site

Site de **Jasmin Voyages**, agence de voyages au 13 Bis Rue Trachel, 06000 Nice.
Une seule page, pensée comme un magazine de voyage doublé d'une conciergerie : on découvre, on s'inspire, on demande son voyage en moins d'une minute.

```bash
npm install
npm run dev       # développement — http://localhost:5173
npm run build     # vérification TypeScript + build + pré-rendu HTML → dist/
npm run preview   # sert dist/ — http://localhost:4173
```

Le dossier `dist/` est un site statique : il se dépose tel quel sur n'importe quel hébergeur (OVH, Netlify, Vercel, GitHub Pages…).

---

## Direction artistique

| | |
|---|---|
| **Référence** | Hyer Aviation, pour la rigueur : une seule famille typographique, en gras, très serrée ; pilules pour toutes les actions ; aucune ombre ; alternance de bandes claires et sombres ; titres qui se terminent par un point ; une seule note chaude par page. |
| **Identité Jasmin** | L'orange de la devanture devient une **argile** atténuée (`#b85c3c`), seule couleur d'accent. Le bleu de la façade survit en sous-ton, à peine perceptible, dans l'**encre** (`#0c1214`). Fonds **ivoire** et **sable**. |
| **Motif** | Le **hublot** : l'image du hero est vue à travers un hublot qui s'ouvre au défilement. Les destinations portent leur trajet en codes aéroport (`NCE → HND`). Pas de pictogramme d'avion. |
| **Typographie** | Inter Tight (titres, 700, interlettrage −0,03 à −0,045 em) + Inter (texte, 18 px / 1,61). Polices auto-hébergées, aucune requête vers Google. |
| **Mouvement** | Révélations ligne à ligne, hublot qui s'ouvre, galerie horizontale épinglée, récit épinglé en quatre temps, boutons magnétiques, curseur compagnon. Courbes « expo » lentes, aucun rebond. Tout est désactivé avec `prefers-reduced-motion`. |

## Sections

1. **Hero** — mot-symbole géant, « Le monde vous attend. », hublot qui s'ouvre au défilement.
2. **Manifeste** — le texte se remplit au défilement ; *Avions / Bateaux / Séjours* (repris de la devanture).
3. **Destinations** — galerie horizontale épinglée (bureau) ou carrousel (mobile). Chaque destination ouvre une fiche plein écran : période idéale, idées, esquisse d'itinéraire, bouton « Imaginer ce voyage » qui pré-remplit la demande.
4. **Votre prochain voyage** — module en 4 questions (où, pourquoi, quand, budget), esquisse en direct façon carte d'embarquement, suggestions, puis demande express ou détaillée.
5. **Inspirations** — la carte argile « Voyages sur mesure » et l'index des univers (circuits, séjours, croisières & ferries, lunes de miel, famille, billetterie, escapades) ; chaque ligne pré-remplit la demande.
6. **Comment ça marche** — récit épinglé : Vous rêvez. Nous imaginons. Vous partez. Vous profitez.
7. **Pourquoi une agence** — « Internet vous donne des milliers d'options. Nous vous aidons à choisir la bonne. »
8. **L'agence** — « Le monde entier. Depuis Nice. », adresse, contact, plan stylisé façon carte marine + carte Google Maps chargée à la demande.
9. **Avis** — mise en page prête, **contenu de démonstration** clairement signalé.
10. **Demande de voyage** — formulaire en 6 étapes (destination, dates, voyageurs, budget, style, coordonnées), validation, brouillon conservé, confirmation.
11. **Pied de page** — mot-symbole géant, contact, navigation, mentions légales, « Nice → Le monde ».

Barre d'action fixe sur mobile (« Créer mon voyage » + appel direct), menu plein écran, mentions légales et confidentialité en panneau latéral.

---

## À compléter avant la mise en ligne

Tout ce qui n'était pas vérifiable est écrit **« à compléter »** sur le site (en terre cuite, souligné en pointillés). Rien n'a été inventé.
👉 **[`A-COMPLETER.md`](A-COMPLETER.md)** : la liste des informations à demander à l'agence, prête à transmettre.

| Quoi | Où |
|---|---|
| Horaires d'ouverture, ligne fixe (illisible sur les photos de l'enseigne) | `src/content/agency.ts` |
| Mentions légales : raison sociale, SIRET, immatriculation Atout France, garant financier, assurance RC Pro, directeur de publication, hébergeur | `src/content/agency.ts` → `legal` |
| Réseaux sociaux (affichés « à compléter » tant qu'ils sont vides) | `src/content/agency.ts` → `social` |
| **Avis clients** — la section affiche « Avis clients — à compléter » tant que la liste est vide ; ajouter de vrais avis avec l'accord des clients (ou masquer la section avec `showReviews = false`) | `src/content/testimonials.ts` |
| Nom de domaine : balises `canonical` / `og:url` / `og:image` (l'image de partage `public/og-image.jpg` est prête), sitemap | `index.html`, `public/robots.txt` |
| Activer la réception des demandes : une demande test après la mise en ligne, puis clic sur le lien d'activation reçu par l'agence | voir « Recevoir les demandes » |
| Durée de conservation des données | `src/components/overlays/LegalDialog.tsx` |

Informations reprises de la devanture : adresse, **06 63 38 22 00**, **jasmin.voyages@hotmail.fr**, *Avions · Bateaux · Séjours*, partenariat **GNV Elite** et ses lignes (Sicile, Sardaigne, Baléares, Tunisie, Maroc, Albanie). À relire avec l'agence.

### Images

Le site utilise **14 illustrations originales**, créées pour Jasmin Voyages (style affiche de voyage, palette du site) : le hero vu du hublot, les 8 destinations, les 4 étapes du voyage et les croisières. Elles sont libres de droits.

- Fichiers : `public/images/<nom>-<largeur>.webp` (640, 1024, 1600 et 2400 px, servis en `srcset`).
- Source : `scripts/illustrations/` (dessin vectoriel généré par code). Pour modifier une scène puis la régénérer : `npm run illustrations` (ou `npm run illustrations japon` pour une seule).
- Pour mettre une **vraie photo** à la place : la déposer dans `public/images/`, puis dans `src/content/images.ts` remplacer `src` par `'/images/ma-photo.jpg'` et retirer `widths`.

---

## Recevoir les demandes

Le formulaire et le module « Votre prochain voyage » envoient la même charge utile (résumé lisible + données structurées). Le transport se choisit dans `.env` (voir `.env.example`) :

| `VITE_TRIP_TRANSPORT` | Effet |
|---|---|
| `formsubmit` *(défaut en production)* | **e-mail direct à l'agence** via [FormSubmit](https://formsubmit.co), sans compte ni serveur, vers `jasmin.voyages@hotmail.fr` (ou `VITE_FORMSUBMIT_EMAIL`). ⚠️ À la première demande reçue, FormSubmit envoie un e-mail d'activation à cette adresse : cliquer sur « Activate Form », une seule fois. |
| `mailto` | ouvre la messagerie du visiteur, pré-remplie vers l'adresse de l'agence |
| `formspree` | envoi via [Formspree](https://formspree.io) (`VITE_FORMSPREE_ID`) — recommandé pour démarrer |
| `api` | `POST` JSON vers votre endpoint ou CRM (`VITE_TRIP_API_URL`) |
| `supabase` | insertion dans une table Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_TABLE`) |
| `demo` *(défaut en développement)* | n'envoie rien, simule un succès |

Ajouter un autre service (Brevo, HubSpot…) = ajouter une fonction dans `src/lib/trip/transport.ts`.
Un champ piège anti-robots est inclus ; le consentement RGPD est demandé à la dernière étape.

---

## Maquette cliquable

`npm run maquette` produit une version de présentation du site, en une seule page autonome : `dist-maquette/maquette.html` (CSS, JavaScript et polices intégrés), avec ses illustrations dans `dist-maquette/images/`.
Un bandeau « Maquette » reste affiché en permanence, les avis sont des exemples signalés comme fictifs (`src/content/demoReviews.ts`), les formulaires n'envoient rien et la carte Google n'est pas intégrée. Le site en ligne (`npm run build`) n'est pas concerné.

---

## Technique

- **React 19, TypeScript, Vite, Tailwind CSS 4, Framer Motion, Lenis** (défilement fluide).
- **Pré-rendu** (`scripts/prerender.mjs`) : le HTML complet est généré au build puis hydraté. Le contenu s'affiche avant le JavaScript, il est lu par les moteurs de recherche, et la page reste lisible même sans JavaScript. Le CSS est intégré à la page et la police des titres est préchargée.
- Entrée du hero en **animations CSS** (aucune attente du JavaScript) ; géométrie du hublot décrite en CSS (`.hero-stage` dans `src/index.css`), pilotée au défilement par une seule variable `--p`.
- Données structurées `TravelAgency` (schema.org), balises Open Graph, `robots.txt`.
- Accessibilité : lien d'évitement, navigation clavier complète, focus visibles, dialogues avec piège de focus et fermeture par Échap, libellés et erreurs reliés aux champs, contrastes AA, `prefers-reduced-motion` respecté.
- Lighthouse (build de production, servi compressé) : **mobile 91–93 / 100 / 100 / 100**, **bureau 100 / 100 / 100 / 100** (performance / accessibilité / bonnes pratiques / SEO).

```
src/
  components/
    sections/   Navbar, Hero, Manifesto, DestinationGallery, TravelFinder, Services,
                JourneySteps, WhyJasmin, Agency, Testimonials, TravelForm, Footer
    overlays/   DestinationDialog, LegalDialog, MobileCTA
    ui/         Button (pilules magnétiques), Photo, MaskText, Reveal, Chip, Cursor, Arrow, SectionTag
  content/      agency, destinations, travelTypes, testimonials, images, options  ← tous les textes et données
  lib/          scroll (Lenis), trip/ (état partagé, validation, mise en forme, transports)
  hooks/        médias, focus, magnétisme, heure de Nice
scripts/prerender.mjs
```
