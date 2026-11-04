# Vaultr sur TikTok : plan de publication (1 vidéo par jour)

Personne ne peut garantir qu'une vidéo perce. Ce qui augmente vraiment les chances :
**publier tous les jours, une accroche dans la 1re seconde, un format qu'on reconnaît (une série), et répondre à tous les commentaires.**

## Les règles de base

- **Même heure chaque jour**, entre 18 h et 21 h (heure de Paris), quand les gens sont sur le canapé… comme Max.
- **Ne supprime jamais une vidéo qui marche mal.** Sur un compte neuf, une vidéo peut décoller plusieurs jours après.
- **Réponds à chaque commentaire** dans la première heure. Quand une question revient (« c'est quoi l'appli ? », « et si on triche ? »),
  réponds **en vidéo** (bouton « Répondre avec une vidéo ») : ce sont souvent les vidéos qui marchent le mieux.
- **Épingle un commentaire** sous chaque vidéo : « L'appli s'appelle Vaultr. Tu mises, tu t'entraînes, tu récupères 💪 Bientôt dispo. »
- **Mets la ligne de crédit de la voix** dans chaque description (obligatoire, licence de la voix) :
  `Voix : UPMC Pierre (CC BY-SA 4.0)`
- Ajoute un **son en tendance** ? Non : nos vidéos ont déjà leur musique et leurs voix. Garde le son d'origine.
- La bio du compte : « L'appli qui te rembourse quand tu fais ton sport 💰 · Bientôt sur iOS et Android ».

## Les vidéos prêtes à publier

| Jour | Vidéo | Fichier |
|---|---|---|
| 1 | Max & son IA · ép. 1 : « J'ai la solution pour toi » | `vaultr-tiktok/vaultr-tiktok.mp4` |
| 2 | ép. 2 : « Je commence lundi » | `vaultr-serie/ep02-lundi/ep02-lundi.mp4` |
| 3 | ép. 3 : « La salle que tu paies pour rien » | `vaultr-serie/ep03-salle/ep03-salle.mp4` |
| 4 | ép. 4 : « Les 3 excuses » | `vaultr-serie/ep04-excuses/ep04-excuses.mp4` |
| 5 | ép. 5 : « Je sais pas quoi faire comme exercices » | `vaultr-serie/ep05-programme/ep05-programme.mp4` |

### Descriptions à copier-coller

**Jour 1**
> Quand ta motivation dure qu'un jour… 😮‍💨 Mon meilleur pote a une solution.
> #sport #motivation #musculation #remiseenforme #fitnessmotivation #appli
> Voix : UPMC Pierre (CC BY-SA 4.0)

**Jour 2**
> « Lundi je commence. » La phrase qu'on dit tous. 📅
> #sport #motivation #lundi #salledesport #discipline #appli
> Voix : UPMC Pierre (CC BY-SA 4.0)

**Jour 3**
> Ton abonnement à la salle, tu le paies… et t'y vas pas ? 💸
> #salledesport #abonnement #sport #motivation #fitness #appli
> Voix : UPMC Pierre (CC BY-SA 4.0)

**Jour 4**
> Il pleut, t'es crevé, demain… On les a toutes dites. 🙃
> #excuses #sport #motivation #flemme #fitnessfrance #appli
> Voix : UPMC Pierre (CC BY-SA 4.0)

**Jour 5**
> Tu veux t'y mettre mais tu sais pas quoi faire ? 🤷‍♂️
> #programme #sport #debutant #musculation #motivation #appli
> Voix : UPMC Pierre (CC BY-SA 4.0)

## Les jours suivants : trois formats à alterner

### A. La série « Max & son IA » (je les fabrique)
Un nouvel épisode = un nouveau texte, le reste se fait tout seul. Idées déjà prêtes à écrire :
- **« Et si je triche ? »** : Max veut envoyer une vieille photo. L'IA : « Ton coach voit tout. » (preuve en photo ou vidéo, validée par le coach).
- **« Mon pote m'a encore lâché »** : son partenaire de salle annule. « Le coffre, lui, ne te lâche pas. »
- **« Le 1er janvier »** : les bonnes résolutions qui meurent le 15.
- **« J'ai fait 3 séances, j'ai déjà récupéré… »** : la satisfaction de voir l'argent revenir.
- **« Combien je mets ? »** : choisir sa mise (« assez pour que ça pique »).
- **« Mon coach »** : l'IA explique qu'on peut prendre un coach humain ou le coach IA.
- **« Il est 22 h, j'ai pas fait ma séance »** : la petite voix qui te pousse.
- **« L'été arrive »** : la panique de juin.
- **« Pourquoi l'argent motive plus que la motivation »** : version plus « conseil », presque face caméra pour l'IA.
- **« Max, 1 mois plus tard »** : épisode de récompense, Max a changé (à garder pour quand le compte décolle).

### B. Toi face caméra (le plus efficace sur un compte à 0 abonné)
Les gens suivent une **personne** qui construit quelque chose. 15 à 30 s, filmé au téléphone, sans montage :
- « Je crée une appli qui te fait payer si tu sèches le sport. Jour 1. » → puis Jour 2, Jour 3… (construction en public).
- « Pourquoi j'ai créé Vaultr » : ton histoire, en vrai.
- « Je teste ma propre appli pendant 30 jours » : tu mets ta mise, tu montres l'argent qui revient.
- Réponses en vidéo aux commentaires.

### C. L'appli en vrai (écran du téléphone)
- Filme l'écran pendant que tu valides une séance → l'écran « +10 € » avec la pluie de pièces. Texte : « POV : ton appli te paie parce que t'as fait tes squats ».
- La jauge de mise qui chauffe quand tu montes le montant. Texte : « Combien t'es prêt à mettre en jeu ? »

### Rythme conseillé
Série (A) un jour sur deux, face caméra (B) ou appli (C) les autres jours.
Regarde chaque semaine dans les statistiques TikTok **le temps de visionnage moyen** : refais plus de ce qui garde les gens jusqu'au bout.

## Fabriquer un nouvel épisode

1. Copier un dossier d'épisode (par exemple `ep02-lundi`) et changer `episode.json` : l'accroche (`hook`), la pastille (`badge`),
   les répliques (`lines`) et les temps (`beats` : le plan, les répliques, l'hologramme, l'humeur de la musique).
2. `sh commun/build.sh <dossier>` : voix → minutage automatique → musique → sous-titres → vidéo à −14 LUFS + affiche.

Plans disponibles : `hook`, `two`, `max`, `buddy`, `reveal`, `holo`, `friend`, `smile`, `end`.
Hologrammes : `name`, `stake`, `sessions`, `lock`, `calendar`, `gym`, `excuses`, `proof`, `program`.
Musique : `sad`, `warm`, `silence`, `resolve`, `end`. Humeurs de Max : `sad`, `down`, `worried`, `up`, `smile`, `surprised`, `skeptic`, `guilty` ;
de l'IA : `calm`, `smile`, `serious`, `sad`, `wink`.
