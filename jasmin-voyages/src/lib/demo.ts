/**
 * Mode maquette (`npm run maquette`, build en mode « maquette ») : version de présentation du site,
 * en une seule page autonome. Bandeau « Maquette » permanent, avis d'exemple signalés comme fictifs,
 * formulaires qui n'envoient rien, pas de carte Google intégrée.
 * Sur le site en ligne (`npm run build`), ce mode est inactif.
 */
export const isDemo = import.meta.env.VITE_DEMO === '1'

/** Mention affichée sous les formulaires de la maquette. */
export const demoFormNote = 'Maquette : ce formulaire de démonstration n’envoie aucune donnée.'
