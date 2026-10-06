/**
 * AVIS CLIENTS — À COMPLÉTER.
 *
 * Remplacez ces emplacements par de vrais avis (avec l'accord des clients),
 * puis passez `testimonialsPending` à `false` pour retirer la mention « à compléter ».
 */
export const testimonialsPending = true

export interface Testimonial {
  quote: string
  author: string
  trip: string
}

export const testimonials: Testimonial[] = [
  { quote: 'Avis client n° 1 — texte à compléter.', author: 'Prénom et initiale du client — à compléter', trip: 'Voyage (destination, mois) — à compléter' },
  { quote: 'Avis client n° 2 — texte à compléter.', author: 'Prénom et initiale du client — à compléter', trip: 'Voyage (destination, mois) — à compléter' },
  { quote: 'Avis client n° 3 — texte à compléter.', author: 'Prénom et initiale du client — à compléter', trip: 'Voyage (destination, mois) — à compléter' },
]
