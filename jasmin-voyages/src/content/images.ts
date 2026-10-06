/**
 * Photographies du site — SOURCE UNIQUE.
 *
 * Par défaut, les images pointent vers Unsplash (licence libre, hotlink autorisé) :
 * elles sont redimensionnées à la volée (srcset) par le composant <Photo />.
 *
 * Pour utiliser vos propres photos : déposez-les dans /public/images/
 * puis remplacez `src` par '/images/mon-fichier.jpg'.
 *
 * `tone` : trois couleurs (ombre, milieu, lumière) utilisées pour un aplat
 * atmosphérique pendant le chargement — ou si une image ne charge pas.
 * Le site reste ainsi composé, même hors-ligne.
 */

export interface SiteImage {
  src: string
  alt: string
  tone: readonly [string, string, string]
  /** object-position CSS, ex. '50% 30%' */
  focus?: string
}

const u = (id: string) => `https://images.unsplash.com/${id}`

export const images = {
  hero: {
    src: u('photo-1436491865332-7a61a109cc05'),
    alt: "Vue depuis un hublot : l'aile d'un avion au-dessus des nuages, dans une lumière dorée",
    tone: ['#2c3a44', '#9fb3bd', '#efe3cf'],
    focus: '50% 50%',
  },
  manifesto: {
    src: u('photo-1507525428034-b723cf961d3e'),
    alt: "Plage déserte au bord d'une mer turquoise",
    tone: ['#1f4a54', '#79b2b0', '#efe6d4'],
  },
  japon: {
    src: u('photo-1493976040374-85c8e12f0c0e'),
    alt: 'Ruelle de Kyoto menant à la pagode Yasaka, au crépuscule',
    tone: ['#2a2630', '#8a6464', '#e7c7b5'],
    focus: '50% 40%',
  },
  bali: {
    src: u('photo-1537996194471-e657df975ab4'),
    alt: 'Temple balinais au bord de l’eau, entouré de végétation',
    tone: ['#1b2a21', '#4f6b49', '#cdbd8c'],
  },
  tanzanie: {
    src: u('photo-1516426122078-c23e76319801'),
    alt: 'Savane africaine au lever du jour, faune sauvage à l’horizon',
    tone: ['#2b2016', '#9a6a3b', '#e6c48e'],
  },
  maldives: {
    src: u('photo-1514282401047-d79a71a590e8'),
    alt: 'Villas sur pilotis au-dessus d’un lagon turquoise aux Maldives',
    tone: ['#0f2a33', '#2f8087', '#c3e5dd'],
  },
  newYork: {
    src: u('photo-1496442226666-8d4d0e62e6e9'),
    alt: 'Gratte-ciel de Manhattan, New York',
    tone: ['#13171c', '#3e4b57', '#cfd2d3'],
  },
  grece: {
    src: u('photo-1570077188670-e3a8d69ac5ff'),
    alt: 'Maisons blanches et dômes bleus d’Oia, à Santorin',
    tone: ['#182a3b', '#4e7ea5', '#eef0ec'],
  },
  maroc: {
    src: u('photo-1489749798305-4fea3ae63d43'),
    alt: 'Dunes du désert marocain dans la lumière du soir',
    tone: ['#2b1810', '#a4532f', '#ebbd8d'],
  },
  costaRica: {
    src: u('photo-1432405972618-c60b0225b8f9'),
    alt: 'Cascade au cœur d’une forêt tropicale luxuriante',
    tone: ['#0f1f17', '#2e5e3e', '#a9c48f'],
  },
  // Étapes « Vous rêvez → Vous profitez »
  stepDream: {
    src: u('photo-1488646953014-85cb44e25828'),
    alt: 'Carnet, carte et appareil photo préparés pour un voyage',
    tone: ['#2c2620', '#8f7a63', '#e8dccb'],
  },
  stepDesign: {
    src: u('photo-1476514525535-07fb3b4ae5f1'),
    alt: 'Lac de montagne aux eaux turquoise entouré de sommets',
    tone: ['#1c2b2c', '#4d7f7a', '#d9e2d6'],
  },
  stepDepart: {
    src: u('photo-1436491865332-7a61a109cc05'),
    alt: "Aile d'avion au-dessus des nuages",
    tone: ['#2c3a44', '#9fb3bd', '#efe3cf'],
  },
  stepEnjoy: {
    src: u('photo-1469474968028-56623f02e42e'),
    alt: 'Paysage de montagne au coucher du soleil',
    tone: ['#2a2420', '#a2714a', '#efd2a6'],
  },
  // Univers de voyage (aperçus au survol)
  surMesure: {
    src: u('photo-1501785888041-af3ef285b470'),
    alt: 'Lac de montagne paisible au petit matin',
    tone: ['#1d2a30', '#5f8590', '#e3e3d8'],
  },
  croisieres: {
    src: u('photo-1505228395891-9a51e7e86bf6'),
    alt: 'Vagues vues du ciel sur une mer turquoise',
    tone: ['#0f3340', '#3f8f9c', '#d4ece6'],
  },
} satisfies Record<string, SiteImage>

export type ImageKey = keyof typeof images
