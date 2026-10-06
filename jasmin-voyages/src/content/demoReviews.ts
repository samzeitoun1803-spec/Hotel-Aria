import type { Testimonial } from './testimonials'

/**
 * AVIS FICTIFS — UNIQUEMENT POUR LA MAQUETTE (mode maquette, voir src/lib/demo.ts).
 *
 * Textes inventés pour montrer la mise en page : ce ne sont PAS de vrais clients.
 * La maquette les affiche avec la mention « Avis fictifs ». Le site en ligne ne les utilise jamais :
 * il affiche les vrais avis de src/content/testimonials.ts, ou « Avis clients — à compléter ».
 */

/** Grands avis (fictifs), en carrousel. */
export const demoTestimonials: Testimonial[] = [
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

/** Avis courts (fictifs), sous le carrousel. */
export const demoShortReviews: Testimonial[] = [
  { quote: 'Accueil chaleureux rue Trachel, conseils précis, et un carnet de voyage parfait.', author: 'Nadia K.', trip: 'Maroc' },
  { quote: 'On a dit trois mots sur nos envies, ils ont dessiné le reste.', author: 'Marc L.', trip: 'Grèce, en septembre' },
  { quote: 'Toujours joignables pendant le voyage. Ça change tout.', author: 'Sophie P.', trip: 'New York' },
]
