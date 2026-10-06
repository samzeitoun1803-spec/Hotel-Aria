import { images, type SiteImage } from './images'

export type Region = 'europe' | 'asie' | 'afrique' | 'ameriques' | 'iles'
export type Mood = 'detente' | 'decouverte' | 'aventure' | 'romantique' | 'famille'

export interface Destination {
  slug: string
  name: string
  /** Code IATA de l'aéroport d'arrivée — détail éditorial « NCE → … » */
  iata: string
  city: string
  tagline: string
  intro: string
  season: string
  ideas: string[]
  /** Exemple d'itinéraire, à titre d'inspiration */
  sketch: Array<[string, string]>
  image: SiteImage
  regions: Region[]
  moods: Mood[]
}

export const destinations: Destination[] = [
  {
    slug: 'japon',
    name: 'Japon',
    iata: 'HND',
    city: 'Tokyo',
    tagline: 'Des temples à l’aube, des néons à minuit.',
    intro:
      'Un pays qui se lit lentement. Kyoto aux premières heures, une nuit en ryokan, les Alpes japonaises en train : le Japon récompense ceux qui prennent le temps.',
    season: 'Mars – mai · Octobre – novembre',
    ideas: [
      'Kyoto aux premières heures, avant la foule',
      'Une nuit en ryokan, bain d’onsen compris',
      'Naoshima, l’île dédiée à l’art contemporain',
      'Tokyo, des ruelles de Yanaka aux lumières de Shibuya',
    ],
    sketch: [
      ['Tokyo', '4 nuits'],
      ['Hakone', '2 nuits'],
      ['Kyoto', '4 nuits'],
      ['Naoshima', '1 nuit'],
    ],
    image: images.japon,
    regions: ['asie'],
    moods: ['decouverte', 'romantique'],
  },
  {
    slug: 'bali',
    name: 'Bali',
    iata: 'DPS',
    city: 'Denpasar',
    tagline: 'Rizières, offrandes et océan Indien.',
    intro:
      'Entre les rizières d’Ubud et les falaises d’Uluwatu, Bali vit au rythme de ses cérémonies. Nous choisissons les adresses qui ont gardé leur âme.',
    season: 'Avril – octobre, saison sèche',
    ideas: [
      'Les rizières en terrasses au lever du jour',
      'Une villa privée dans la jungle d’Ubud',
      'Les îles Nusa, à une traversée de là',
      'Uluwatu et ses falaises au coucher du soleil',
    ],
    sketch: [
      ['Ubud', '4 nuits'],
      ['Sidemen', '2 nuits'],
      ['Uluwatu', '4 nuits'],
    ],
    image: images.bali,
    regions: ['asie', 'iles'],
    moods: ['detente', 'romantique'],
  },
  {
    slug: 'tanzanie',
    name: 'Tanzanie',
    iata: 'JRO',
    city: 'Kilimandjaro',
    tagline: 'L’aube sur le Serengeti, en silence.',
    intro:
      'Le cratère du Ngorongoro, les plaines infinies du Serengeti, puis le sable blanc de Zanzibar. Un safari pensé à votre rythme, prolongé face à l’océan.',
    season: 'Juin – octobre · Janvier – février',
    ideas: [
      'Un camp sous toile au cœur du Serengeti',
      'La descente dans le cratère du Ngorongoro',
      'Tarangire et ses baobabs millénaires',
      'Zanzibar pour finir, pieds dans le sable',
    ],
    sketch: [
      ['Tarangire', '2 nuits'],
      ['Ngorongoro', '2 nuits'],
      ['Serengeti', '3 nuits'],
      ['Zanzibar', '4 nuits'],
    ],
    image: images.tanzanie,
    regions: ['afrique'],
    moods: ['aventure', 'famille', 'decouverte'],
  },
  {
    slug: 'maldives',
    name: 'Maldives',
    iata: 'MLE',
    city: 'Malé',
    tagline: 'Un atoll, une villa, rien d’autre.',
    intro:
      'Ici, le luxe se mesure en nuances de bleu. Nous vous aidons à choisir l’île — et l’hôtel — qui correspond vraiment à votre façon de voyager.',
    season: 'Novembre – avril',
    ideas: [
      'Une villa sur pilotis, face au lagon',
      'Nager avec les raies manta, selon la saison',
      'Un dîner les pieds dans le sable, sur un banc isolé',
      'L’hydravion au-dessus des atolls',
    ],
    sketch: [
      ['Malé', 'arrivée'],
      ['Atoll de Baa', '7 nuits'],
    ],
    image: images.maldives,
    regions: ['iles'],
    moods: ['detente', 'romantique'],
  },
  {
    slug: 'new-york',
    name: 'New York',
    iata: 'JFK',
    city: 'New York',
    tagline: 'Une ville qui ne vous attend pas. Rattrapez-la.',
    intro:
      'Brooklyn le matin, Manhattan le soir, un club de jazz à minuit. New York se vit à pied, quartier par quartier, les bonnes adresses en poche.',
    season: 'Avril – juin · Septembre – novembre',
    ideas: [
      'La High Line jusqu’au Whitney Museum',
      'Un brunch à Williamsburg',
      'Le skyline depuis Brooklyn Bridge Park',
      'Un concert au Village Vanguard',
    ],
    sketch: [
      ['Manhattan', '4 nuits'],
      ['Brooklyn', '2 nuits'],
    ],
    image: images.newYork,
    regions: ['ameriques'],
    moods: ['decouverte', 'famille'],
  },
  {
    slug: 'grece',
    name: 'Grèce',
    iata: 'ATH',
    city: 'Athènes',
    tagline: 'La mer Égée, île après île.',
    intro:
      'Athènes, puis les Cyclades à votre rythme : Santorin pour la lumière, Milos pour les criques, Paros pour la douceur de vivre.',
    season: 'Mai – juin · Septembre – octobre',
    ideas: [
      'L’Acropole aux premières heures',
      'Milos et ses criques de roche blanche',
      'Quelques jours en voilier entre les Cyclades',
      'Santorin, côté caldeira',
    ],
    sketch: [
      ['Athènes', '2 nuits'],
      ['Milos', '3 nuits'],
      ['Santorin', '3 nuits'],
    ],
    image: images.grece,
    regions: ['europe', 'iles'],
    moods: ['romantique', 'detente', 'famille'],
  },
  {
    slug: 'maroc',
    name: 'Maroc',
    iata: 'RAK',
    city: 'Marrakech',
    tagline: 'Des riads secrets aux nuits du désert.',
    intro:
      'La médina de Marrakech, l’Atlas en toile de fond, une nuit sous les étoiles d’Agafay. Si proche de Nice, et pourtant ailleurs.',
    season: 'Mars – mai · Septembre – novembre',
    ideas: [
      'Un riad caché au cœur de la médina',
      'Les villages berbères de l’Atlas',
      'Une nuit sous les étoiles du désert d’Agafay',
      'Ou la traversée en ferry, voiture à bord',
    ],
    sketch: [
      ['Marrakech', '3 nuits'],
      ['Atlas', '2 nuits'],
      ['Agafay', '1 nuit'],
      ['Essaouira', '2 nuits'],
    ],
    image: images.maroc,
    regions: ['afrique'],
    moods: ['decouverte', 'romantique', 'famille'],
  },
  {
    slug: 'costa-rica',
    name: 'Costa Rica',
    iata: 'SJO',
    city: 'San José',
    tagline: 'Volcans, forêts de nuages et deux océans.',
    intro:
      'Une nature qui déborde de partout. Le Costa Rica se parcourt en famille ou à deux, jumelles en main, du Pacifique aux Caraïbes.',
    season: 'Décembre – avril, saison sèche',
    ideas: [
      'Le volcan Arenal et ses sources chaudes',
      'La forêt de nuages de Monteverde',
      'Tortuguero, en pirogue sur les canaux',
      'Les plages sauvages de la péninsule de Nicoya',
    ],
    sketch: [
      ['Tortuguero', '2 nuits'],
      ['Arenal', '3 nuits'],
      ['Monteverde', '2 nuits'],
      ['Nicoya', '4 nuits'],
    ],
    image: images.costaRica,
    regions: ['ameriques'],
    moods: ['aventure', 'famille', 'decouverte'],
  },
]

export const getDestination = (slug: string) => destinations.find((d) => d.slug === slug)
