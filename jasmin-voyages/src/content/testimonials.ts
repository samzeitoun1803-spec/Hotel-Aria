/**
 * AVIS CLIENTS — CONTENU DE DÉMONSTRATION.
 *
 * Ces textes ne sont PAS de vrais avis : ils servent uniquement à montrer la mise en page.
 * Remplacez-les par de vrais avis vérifiés (avec l'accord des clients) puis passez
 * `testimonialsAreDemo` à `false` pour retirer la mention « exemple » affichée sur le site.
 */
export const testimonialsAreDemo = true

export interface Testimonial {
  quote: string
  author: string
  trip: string
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Nous sommes arrivés avec une vague envie de Japon. Nous sommes repartis avec un voyage réglé à la minute près, et des souvenirs pour dix ans.',
    author: 'Prénom N.',
    trip: 'Japon, au printemps',
  },
  {
    quote: 'Un vol annulé à l’escale, un message à l’agence, une solution dans l’heure. C’est pour ça qu’on ne réserve plus seuls.',
    author: 'Prénom N.',
    trip: 'Tanzanie & Zanzibar',
  },
  {
    quote: 'Ils ont trouvé l’hôtel que nous n’aurions jamais trouvé. Celui dont nous parlons encore.',
    author: 'Prénom N.',
    trip: 'Lune de miel aux Maldives',
  },
  {
    quote: 'Trois générations, deux semaines, zéro dispute sur le programme. Un petit miracle.',
    author: 'Prénom N.',
    trip: 'Costa Rica en famille',
  },
]
