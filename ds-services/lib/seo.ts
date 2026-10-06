import { company } from "@/data/company";
import { services } from "@/data/services";
import { site } from "@/data/site";

/**
 * Données structurées schema.org — Electrician (LocalBusiness).
 * Uniquement des informations confirmées : aucun avis, aucune note, aucun horaire,
 * aucune zone d'intervention, aucune coordonnée GPS. Téléphone et e-mail ne sont
 * ajoutés que lorsqu'ils sont renseignés dans data/company.ts.
 */
export function electricianJsonLd(): Record<string, unknown> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Electrician",
    name: company.name,
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.streetAddress,
      postalCode: company.postalCode,
      addressLocality: company.city,
      addressCountry: company.countryCode,
    },
    foundingDate: `${company.founded}-${String(company.foundedMonth).padStart(2, "0")}`,
    identifier: {
      "@type": "PropertyValue",
      propertyID: "SIREN",
      value: company.siren.replace(/\s/g, ""),
    },
    knowsAbout: services.map((s) => s.title),
  };

  if (site.url) {
    data["@id"] = `${site.url}/#entreprise`;
    data.url = site.url;
    data.image = `${site.url}/opengraph-image.png`;
  }
  if (company.phone) data.telephone = company.phone;
  if (company.email) data.email = company.email;

  return data;
}

/** Sérialisation sûre pour une balise <script type="application/ld+json">. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
