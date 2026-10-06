/**
 * Images du site — SOURCE UNIQUE.
 *
 * Les illustrations sont originales, créées pour Jasmin Voyages par
 * scripts/illustrations/ (aucun droit à payer, aucune image externe).
 * Elles sont servies depuis /public/images/ en quatre largeurs (srcset).
 *
 * Pour utiliser une vraie photo à la place :
 *   1. déposez-la dans /public/images/ (JPG ou WebP, ~2000 px de large) ;
 *   2. remplacez `src` par '/images/ma-photo.jpg' et supprimez `widths`.
 *
 * `tone` : trois couleurs (ombre, milieu, lumière) affichées pendant le chargement.
 */

export interface SiteImage {
  /** Chemin de base sans extension si `widths` est fourni (→ `${src}-${w}.webp`), sinon fichier complet ou URL. */
  src: string
  /** Largeurs disponibles (fichiers `${src}-${w}.webp`). */
  widths?: readonly number[]
  /** Variante cadrée pour les écrans en portrait (mêmes largeurs que `src`). */
  portrait?: string
  alt: string
  tone: readonly [string, string, string]
  /** object-position CSS, ex. '50% 30%' */
  focus?: string
}

const W = [640, 1024, 1600, 2400] as const
const ill = (name: string) => ({ src: `/images/${name}`, widths: W })

export const images = {
  hero: {
    ...ill('hero'),
    portrait: '/images/heroPortrait',
    alt: 'Illustration : au-dessus d’une mer de nuages à l’heure dorée, les Alpes au loin, vues depuis le hublot',
    tone: ['#4f6c80', '#d6c8b0', '#f3cf9f'],
    focus: '50% 50%',
  },
  japon: {
    ...ill('japon'),
    alt: 'Illustration : le mont Fuji au crépuscule, une pagode et un cerisier en fleurs au bord d’un lac',
    tone: ['#28232f', '#9c6c75', '#e9bfa3'],
  },
  bali: {
    ...ill('bali'),
    alt: 'Illustration : rizières en terrasses, palmiers et porte de temple balinaise devant le volcan Agung',
    tone: ['#3d532c', '#73914f', '#ecdfb8'],
  },
  tanzanie: {
    ...ill('tanzanie'),
    alt: 'Illustration : coucher de soleil sur la savane, un acacia, deux girafes et le Kilimandjaro',
    tone: ['#1d120b', '#c27d4f', '#f2c37c'],
  },
  maldives: {
    ...ill('maldives'),
    alt: 'Illustration : villas sur pilotis reliées par un ponton au-dessus d’un lagon turquoise',
    tone: ['#2c7f8e', '#5fbcb8', '#e6efe6'],
  },
  newYork: {
    ...ill('newYork'),
    alt: 'Illustration : la skyline de Manhattan au crépuscule, reflétée dans l’East River',
    tone: ['#121824', '#2a3546', '#e6bf95'],
  },
  grece: {
    ...ill('grece'),
    alt: 'Illustration : maisons blanches et dômes bleus de Santorin au-dessus de la caldeira, un voilier',
    tone: ['#183554', '#4e7ea6', '#eef0ec'],
  },
  maroc: {
    ...ill('maroc'),
    alt: 'Illustration : dunes du Sahara au coucher du soleil et une caravane de dromadaires',
    tone: ['#7a372a', '#c97646', '#f3c48c'],
  },
  costaRica: {
    ...ill('costaRica'),
    alt: 'Illustration : le volcan Arenal, la forêt tropicale et une cascade',
    tone: ['#14301f', '#2f5a43', '#e8ead6'],
  },
  // Étapes « Vous rêvez → Vous profitez »
  stepDream: {
    ...ill('stepDream'),
    alt: 'Illustration : la baie des Anges la nuit, les lumières de Nice, un croissant de lune',
    tone: ['#0c1322', '#2c3a58', '#5a5068'],
  },
  stepDesign: {
    ...ill('stepDesign'),
    alt: 'Illustration : lac de montagne, forêt de sapins et sommets enneigés en reflet',
    tone: ['#203436', '#6d8486', '#e2e7dc'],
  },
  stepDepart: {
    ...ill('stepDepart'),
    alt: 'Illustration : un avion s’éloigne dans le ciel de l’aube au-dessus de la mer',
    tone: ['#1f2b3a', '#6f8ca4', '#f6d6b0'],
  },
  stepEnjoy: {
    ...ill('stepEnjoy'),
    alt: 'Illustration : coucher de soleil sur une plage, palmiers, transats et parasol',
    tone: ['#2a1d22', '#cf7a5f', '#f6c78f'],
  },
  // Univers de voyage
  croisieres: {
    ...ill('croisieres'),
    alt: 'Illustration : un ferry illuminé au crépuscule sur la Méditerranée',
    tone: ['#161d2c', '#56647c', '#f2d0a6'],
  },
} satisfies Record<string, SiteImage>

export type ImageKey = keyof typeof images
