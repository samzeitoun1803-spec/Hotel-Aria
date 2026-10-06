import { images, type SiteImage } from './images'

export interface TravelType {
  id: string
  title: string
  line: string
  /** Pré-remplissage du formulaire de demande */
  service: string
  styles?: string[]
  image: SiteImage
  note?: string
}

/** L'offre mise en avant — la seule carte « argile » de la page. */
export const featuredType = {
  id: 'sur-mesure',
  kicker: 'Le cœur de notre métier',
  title: 'Voyages sur mesure.',
  line: 'Un itinéraire dessiné pour vous seul. Chaque étape, chaque adresse, chaque rythme — ajustés jusqu’à ce qu’ils vous ressemblent.',
  service: 'Voyage sur mesure',
}

export const travelTypes: TravelType[] = [
  {
    id: 'circuits',
    title: 'Circuits',
    line: 'Les grands itinéraires, accompagnés ou en liberté.',
    service: 'Circuit',
    styles: ['Découverte'],
    image: images.japon,
  },
  {
    id: 'sejours',
    title: 'Séjours',
    line: 'Un lieu, la bonne adresse, et le temps de s’y poser.',
    service: 'Séjour',
    styles: ['Détente'],
    image: images.maldives,
  },
  {
    id: 'croisieres',
    title: 'Croisières & ferries',
    line: 'D’escale en escale, ou simplement d’une rive à l’autre.',
    service: 'Croisière ou ferry',
    image: images.croisieres,
    note: 'Partenaire GNV Elite',
  },
  {
    id: 'lunes-de-miel',
    title: 'Lunes de miel',
    line: 'Le premier voyage d’une longue série.',
    service: 'Voyage sur mesure',
    styles: ['Romantique'],
    image: images.grece,
  },
  {
    id: 'famille',
    title: 'Voyages en famille',
    line: 'Des itinéraires pensés pour tous les âges, sans compromis.',
    service: 'Voyage sur mesure',
    styles: ['Famille'],
    image: images.costaRica,
  },
  {
    id: 'billetterie',
    title: 'Billetterie',
    line: 'Avion ou bateau : le bon billet, sans y passer la soirée.',
    service: 'Billet seul',
    image: images.hero,
  },
  {
    id: 'escapades',
    title: 'Escapades',
    line: 'Quelques jours, pas très loin. Juste assez pour changer d’air.',
    service: 'Séjour',
    styles: ['Détente'],
    image: images.maroc,
  },
]
