# Jasmin Voyages — informations à fournir pour le site

Sur le site, tout ce qui manque est écrit **« à compléter »** (en couleur terre cuite, souligné en pointillés).
Voici la liste à remplir avec l'agence. Une fois les réponses reçues, chaque information se met à jour à un seul endroit (indiqué entre crochets).

## 1. Coordonnées et horaires

- [ ] **Horaires d'ouverture** : jours, heures, pause déjeuner, fermetures annuelles. *[`src/content/agency.ts` → `hours`]*
- [ ] **Téléphone fixe** : le numéro de l'enseigne n'est pas lisible sur la photo. *[`agency.ts` → `landline`]*
- [ ] **Confirmer** le portable **06 63 38 22 00** et l'e-mail **jasmin.voyages@hotmail.fr** (repris de la devanture).
- [ ] **Adresse e-mail qui reçoit les demandes du site**, si elle est différente.

## 2. Mentions légales (obligatoires pour une agence de voyages)

- [ ] **Raison sociale** : nom exact de la société et forme juridique (SARL, SAS…).
- [ ] **Numéro SIRET**.
- [ ] **Numéro d'immatriculation Atout France** (registre des opérateurs de voyages, format IM006…).
- [ ] **Garant financier** : nom de l'organisme.
- [ ] **Assurance responsabilité civile professionnelle** : assureur et numéro de contrat.
- [ ] **Directeur ou directrice de la publication**.
- [ ] **Hébergeur du site**, quand il sera choisi.
- [ ] **Durée de conservation des demandes** reçues par le site (par exemple 3 ans).

*[tout est dans `agency.ts` → `legal`, sauf la durée : `src/components/overlays/LegalDialog.tsx`]*

## 3. Réseaux sociaux

- [ ] **Liens Instagram et Facebook**, ou indiquer qu'il n'y en a pas. *[`agency.ts` → `social`]*

## 4. Avis clients

- [ ] **3 ou 4 avis de vrais clients, avec leur accord** : le texte, le prénom et l'initiale du nom, le voyage (destination et mois). *[`src/content/testimonials.ts`]*
- [ ] Le **lien vers la fiche Google** de l'agence, si elle existe.

## 5. Offres à confirmer

- [ ] **Partenariat GNV Elite** et les lignes de ferry affichées : Sicile, Sardaigne, Baléares, Tunisie, Maroc, Albanie.
- [ ] **Les 8 destinations mises en avant** (Japon, Bali, Tanzanie, Maldives, New York, Grèce, Maroc, Costa Rica) : les garder, ou en choisir d'autres. *[`src/content/destinations.ts`]*

## 6. Images (facultatif)

Le site utilise des **illustrations originales**, créées pour l'agence et libres de droits. Si l'agence le souhaite :

- [ ] **Le logo de l'enseigne** en bonne qualité (fichier vectoriel si possible), pour le reprendre ou le redessiner.
- [ ] **Des photos de l'agence** (devanture, intérieur, équipe) et de voyages, **dont l'agence possède les droits**.

## 7. Mise en ligne

- [ ] **Nom de domaine** : existant, ou à acheter (ex. jasmin-voyages.fr).
- [ ] **Service de réception des demandes** : par défaut, le formulaire ouvre la messagerie du visiteur. Pour recevoir les demandes directement, on peut brancher Formspree (gratuit pour commencer).
