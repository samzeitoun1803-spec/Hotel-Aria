/**
 * AVIS CLIENTS — CONTENU FICTIF POUR LA MAQUETTE.
 *
 * Ces avis sont inventés pour montrer la mise en page : ce ne sont PAS de vrais clients.
 * Avant toute mise en ligne, remplacez-les par de vrais avis (avec l'accord des clients),
 * puis passez `reviewsAreFictional` à `false` pour retirer la mention « Avis fictifs — maquette ».
 */
export const reviewsAreFictional = true

export interface Testimonial {
  quote: string
  author: string
  trip: string
}

/** Grands avis, présentés en carrousel. */
export const testimonials: Testimonial[] = [
  {
    quote: 'Nous sommes arrivés avec une vague envie de Japon. Nous sommes repartis avec un voyage réglé à la minute près, et des souvenirs pour dix ans.',
    author: 'Claire M.',
    trip: 'Japon, au printemps',
  },
  {
    quote: 'Un vol annulé à l’escale, un message à l’agence, une solution dans l’heure. C’est pour ça qu’on ne réserve plus seuls.',
    author: 'Karim B.',
    trip: 'Tanzanie & Zanzibar',
  },
  {
    quote: 'Ils ont trouvé l’hôtel que nous n’aurions jamais trouvé. Celui dont nous parlons encore.',
    author: 'Julie & Thomas',
    trip: 'Lune de miel aux Maldives',
  },
  {
    quote: 'Trois générations, deux semaines, zéro dispute sur le programme. Un petit miracle.',
    author: 'Famille R.',
    trip: 'Costa Rica en famille',
  },
  {
    quote: 'La traversée pour Palerme réservée en dix minutes, au comptoir, avec les bons conseils pour la voiture. Simple et humain.',
    author: 'Salvatore D.',
    trip: 'Ferry pour la Sicile',
  },
]

/** Avis courts, en bandeau sous le carrousel. */
export const shortReviews: Testimonial[] = [
  { quote: 'Accueil chaleureux rue Trachel, conseils précis, et un carnet de voyage parfait.', author: 'Nadia K.', trip: 'Maroc' },
  { quote: 'On a dit trois mots sur nos envies, ils ont dessiné le reste.', author: 'Marc L.', trip: 'Grèce, en septembre' },
  { quote: 'Toujours joignables pendant le voyage. Ça change tout.', author: 'Sophie P.', trip: 'New York' },
]
