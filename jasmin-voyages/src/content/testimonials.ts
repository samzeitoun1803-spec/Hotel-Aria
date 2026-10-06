/**
 * AVIS CLIENTS — À COMPLÉTER.
 *
 * Ajoutez ici de vrais avis, avec l'accord des clients (prénom + initiale, voyage).
 * Tant que la liste `testimonials` est vide, la section affiche « Avis clients — à compléter ».
 * Pour masquer complètement la section en attendant, passez `showReviews` à `false`.
 *
 * Exemple :
 *   { quote: 'Un voyage parfaitement organisé…', author: 'Claire M.', trip: 'Japon, avril 2026' }
 */
export const showReviews = true

export interface Testimonial {
  quote: string
  author: string
  trip: string
}

/** Grands avis, présentés en carrousel. */
export const testimonials: Testimonial[] = []

/** Avis courts, en bandeau sous le carrousel (facultatif). */
export const shortReviews: Testimonial[] = []
