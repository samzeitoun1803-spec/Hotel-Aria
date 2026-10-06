/**
 * Informations de l'agence — SOURCE UNIQUE.
 *
 * Les valeurs confirmées proviennent de la devanture de l'agence (rue Trachel).
 * Toute valeur `null` est une information inconnue : le site affiche alors un
 * libellé « à compléter » souligné en pointillés, facile à repérer.
 * Remplacez simplement `null` par la vraie valeur.
 */

export const agency = {
  name: 'Jasmin Voyages',
  street: '13 Bis Rue Trachel',
  postalCode: '06000',
  city: 'Nice',
  country: 'France',

  /** Visible sur la devanture. */
  phone: { display: '06 63 38 22 00', href: 'tel:+33663382200' },
  /** Visible sur la devanture. */
  email: 'jasmin.voyages@hotmail.fr',

  /** Une ligne fixe apparaît sur l'enseigne mais n'est pas lisible sur les photos : à confirmer. */
  landline: null as null | { display: string; href: string },

  /** Horaires d'ouverture — à compléter, ex. : [['Lun – Ven', '9 h 30 – 18 h 30'], ['Sam', '10 h – 13 h']] */
  hours: null as null | Array<[string, string]>,

  /** Mentions obligatoires pour une agence de voyages — à compléter. */
  legal: {
    companyName: null as string | null, // Raison sociale
    siret: null as string | null,
    atoutFrance: null as string | null, // Immatriculation au registre des opérateurs de voyages (IM006…)
    financialGuarantee: null as string | null, // Garant financier
    insurance: null as string | null, // Assurance RC professionnelle
    publicationDirector: null as string | null,
    host: null as string | null, // Hébergeur du site
  },

  /** Réseaux sociaux — laissez `null` tant qu'aucun profil officiel n'est confirmé. */
  social: {
    instagram: null as string | null,
    facebook: null as string | null,
  },

  /** Partenariat affiché sur la devanture. */
  ferryPartner: {
    label: 'Partenaire GNV Elite',
    routes: ['la Sicile', 'la Sardaigne', 'les Baléares', 'la Tunisie', 'le Maroc', "l'Albanie"],
  },

  coordinates: { label: '43°42′N — 7°16′E' }, // Nice
} as const

export const fullAddress = `${agency.street}, ${agency.postalCode} ${agency.city}`

const q = encodeURIComponent(`${agency.name}, ${fullAddress}`)
export const mapsLinks = {
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress + ', France')}`,
  search: `https://www.google.com/maps/search/?api=1&query=${q}`,
  embed: `https://www.google.com/maps?q=${encodeURIComponent(fullAddress + ', France')}&z=16&output=embed`,
}
