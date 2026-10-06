# DS SERVICES — site vitrine

Site de DS SERVICES, entreprise d’électricité et de rénovation installée au 35 rue Rossini, à Nice, depuis juillet 2014 (SARL, SIREN 803 488 584).

Le parti pris créatif, l’architecture des pages, le design system et le langage d’animation sont décrits dans [`docs/strategie-creative.md`](docs/strategie-creative.md).

> **Règle de contenu.** Aucune information commerciale n’est inventée : ni téléphone, ni e-mail, ni avis, ni certification, ni réalisation. Ce qui n’est pas encore fourni par DS SERVICES s’affiche « [À compléter] ». `npm run check:content` en dresse la liste.

---

## Démarrer

Prérequis : Node.js 20.9 ou plus récent (22.18+ recommandé).

```bash
npm install
cp .env.example .env.local   # facultatif en local
npm run dev                  # http://localhost:3000
```

En développement, le formulaire de contact fonctionne en mode démonstration : la demande est journalisée dans le terminal et l’interface affiche « Demande envoyée ».

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` puis `npm run start` | Build et serveur de production |
| `npm run lint` | ESLint (règles Next.js et React Compiler) |
| `npm run typecheck` | Vérification TypeScript |
| `npm run check:content` | Liste des informations à fournir avant la mise en ligne (`-- --strict` : code de sortie 1 s’il en manque) |
| `npm run qa:flows` | Parcours fonctionnels dans Chromium (serveur lancé avec `CONTACT_DRY_RUN=true`) |
| `npm run qa:screens` | Captures aux 8 largeurs de référence, contrôle du débordement et de la console (résultats dans `qa-output/`) |
| `npm run og` | Régénère l’image de partage et les icônes à partir du site lui-même |

Les scripts `qa:*` et `og` utilisent Playwright et un serveur déjà lancé (`BASE_URL`, par défaut `http://localhost:3000`). Sur une nouvelle machine : `npx playwright install chromium`.

## Compléter les informations

Toutes les informations de l’entreprise sont centralisées dans [`data/company.ts`](data/company.ts). Un champ à `null` s’affiche « [À compléter] » partout où il est utilisé. Il suffit de le renseigner pour que le site se mette à jour.

| Champ | Où il apparaît |
| --- | --- |
| `phone` | Contact, pied de page, mentions légales. Ajoute aussi un bouton « Appeler » (barre mobile, menu, contact) et le numéro dans les données structurées |
| `email` | Contact, pied de page, mentions légales, confidentialité |
| `capital`, `vatNumber` | Mentions légales |
| `host` | Mentions légales, confidentialité |
| `credits` | Mentions légales |
| `messageProvider` | Confidentialité : prestataire qui achemine les messages du formulaire (ex. « Resend ») |
| `dataRetention` | Confidentialité : durée de conservation validée par DS SERVICES (sinon, la durée de référence CNIL est affichée avec un placeholder) |

Restent aussi à valider avec DS SERVICES : l’intitulé exact des quatre services (`data/services.ts`), les zones d’intervention (aucune n’est affichée tant qu’elles ne sont pas confirmées) et, sur justificatif uniquement, d’éventuelles certifications ou assurances.

## Réalisations

Les trois emplacements de [`data/projects.ts`](data/projects.ts) affichent pour l’instant des compositions graphiques (`public/realisations/placeholder-*.svg`), signalées « Photographie à venir ». Ce ne sont pas des photos de chantiers et elles ne doivent jamais être remplacées par des images de banque d’images ou générées.

Pour publier une vraie réalisation :

1. déposer la photo dans `public/realisations/` (JPG ou WebP, 2400 px de large au moins) ;
2. renseigner `image` (`src`, `width`, `height`), `alt`, `year` et `location` ;
3. passer `isPlaceholder` à `false`.

Le texte d’introduction de la section s’adapte dès qu’une réalisation réelle existe.

## Formulaire de contact

La route `app/api/contact/route.ts` valide les données côté serveur (mêmes règles que le navigateur, dans `lib/contact.ts`) puis choisit le premier transport configuré :

1. **Resend** (e-mail) : `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (le visiteur est mis en réponse) ;
2. **Webhook** (n8n, Make, Zapier, Slack…) : `CONTACT_WEBHOOK_URL` reçoit la demande en JSON ;
3. **Démonstration** : `CONTACT_DRY_RUN=true`, ou tout environnement hors production.

En production sans transport, l’API répond par une erreur explicite et le visiteur est invité à réessayer : aucune demande n’est perdue en silence. Ne jamais laisser `CONTACT_DRY_RUN=true` en production, `check:content` le signale.

Anti-spam invisible : champ piège, délai minimal de saisie, détection des messages chargés de liens, limite de 5 envois par adresse IP sur 10 minutes, contrôle de l’origine.

## Mise en ligne

Le projet se déploie tel quel sur Vercel ou sur tout hébergeur Node.js.

1. Importer le dépôt. Le site vit dans le dossier `ds-services/` : le déclarer comme *Root Directory*.
2. Renseigner les variables d’environnement (voir [`.env.example`](.env.example)), dont `NEXT_PUBLIC_SITE_URL` (adresse définitive, sans barre finale). Elle active l’URL canonique, le sitemap et les adresses absolues Open Graph et JSON-LD.
3. Lancer `npm run check:content -- --strict` : il doit répondre « Tout est prêt ».
4. Compléter les mentions légales avec l’hébergeur retenu (`host`).

## Architecture

```
app/          pages, layout, métadonnées, API du formulaire, icônes et image de partage
components/   ui (bouton, contour, icônes…), layout (navigation, menu, pied de page),
              motion (smooth scroll, scènes au défilement, curseur), art (circuit du hero,
              plan de Nice, pictogrammes), contact, projects
sections/     les sections de la page d’accueil, dans l’ordre du parcours
hooks/        comportements réutilisables (défilement, section active, ton de surface)
lib/          animation (GSAP, Lenis), validation du formulaire, SEO, typographie
data/         contenu : entreprise, services, réalisations, navigation, réglages du site
public/       visuels provisoires des réalisations
scripts/      contrôle des contenus, QA, génération de l’image de partage
docs/         stratégie créative
```

**Stack** : Next.js 16 (App Router, React Server Components), React 19, TypeScript, Tailwind CSS 4, GSAP (ScrollTrigger, SplitText), Lenis. Polices auto-hébergées (Inter Tight, Inter, Fraunces ; licence OFL dans `app/fonts/OFL.txt`) : aucun appel à un service tiers pendant la visite, aucun cookie.

**Animation.** L’intro du hero est en CSS pur : elle démarre avant le chargement du JavaScript. Le moteur GSAP est chargé ensuite, à la première interaction ou une fois le navigateur au repos, et chaque section n’est préparée qu’à l’approche de l’écran. Avec `prefers-reduced-motion`, tout s’affiche immédiatement, sans smooth scroll. Sans JavaScript, le contenu reste entièrement visible.

## Qualité

Mesures relevées sur le build de production (Lighthouse 13, Chromium, page d’accueil) :

| | Performance | Accessibilité | Bonnes pratiques | SEO |
| --- | --- | --- | --- | --- |
| Mobile | 89 à 95 selon les passages (médiane 92) | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Le score mobile est une simulation (processeur ralenti 4 fois, réseau 4G lent) et varie d’un passage à l’autre : mesurer plusieurs fois, idéalement sur le site en ligne avec PageSpeed Insights. Dans un navigateur réel, le premier affichage et le plus grand élément visible apparaissent en 0,2 à 0,3 s. Après l’intro, le moteur d’animation prépare chaque section par tâches de 8 ms au plus, pour que la page reste réactive.

- 36 parcours fonctionnels (`qa:flows`) : ancres, formulaire, visionneuse, menu au clavier, pages légales, 404, animations réduites, sans JavaScript.
- Aucun débordement horizontal ni erreur console à 375, 390, 430, 768, 1024, 1280, 1440 et 1920 px (`qa:screens`).
- Navigation complète au clavier, lien d’évitement, focus visible, menu mobile modal (page inerte, Échap, retour du focus), erreurs de formulaire annoncées en texte.
