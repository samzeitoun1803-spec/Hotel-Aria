import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/LegalPage";
import { Missing } from "@/components/ui/Missing";
import { company } from "@/data/company";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: `Mentions légales du site de ${company.name}, entreprise d’électricité à Nice.`,
  alternates: site.url ? { canonical: "/mentions-legales" } : undefined,
};

function Value({ value, label }: { value: string | null; label: string }) {
  return value ? <>{value}</> : <Missing label={label} />;
}

export default function MentionsLegales() {
  return (
    <LegalPage eyebrow="Informations légales" title="Mentions légales">
      <h2>Éditeur du site</h2>
      <dl>
        <div>
          <dt>Raison sociale</dt>
          <dd>{company.name}</dd>
        </div>
        <div>
          <dt>Forme juridique</dt>
          <dd>{company.legalForm} — société à responsabilité limitée</dd>
        </div>
        <div>
          <dt>Capital social</dt>
          <dd>
            <Value value={company.capital} label="Capital social" />
          </dd>
        </div>
        <div>
          <dt>Siège social</dt>
          <dd>
            {company.address}, {company.country}
          </dd>
        </div>
        <div>
          <dt>Immatriculation</dt>
          <dd>
            {company.registry} — <span className="whitespace-nowrap">SIREN {company.siren}</span>
          </dd>
        </div>
        <div>
          <dt>Code NAF</dt>
          <dd>
            {company.naf.code} — {company.naf.label}
          </dd>
        </div>
        <div>
          <dt>N° TVA intracommunautaire</dt>
          <dd>
            <Value value={company.vatNumber} label="N° de TVA" />
          </dd>
        </div>
        <div>
          <dt>Téléphone</dt>
          <dd>
            <Value value={company.phone} label="Téléphone" />
          </dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd>
            <Value value={company.email} label="E-mail" />
          </dd>
        </div>
        <div>
          <dt>Directeur de la publication</dt>
          <dd>{company.manager}, gérant</dd>
        </div>
      </dl>

      <h2>Hébergement</h2>
      <dl>
        <div>
          <dt>Hébergeur</dt>
          <dd>
            <Value value={company.host} label="Hébergeur (nom, adresse, téléphone)" />
          </dd>
        </div>
      </dl>

      <h2>Conception du site</h2>
      <dl>
        <div>
          <dt>Conception et développement</dt>
          <dd>
            <Value value={company.credits} label="Concepteur du site" />
          </dd>
        </div>
        <div>
          <dt>Typographies</dt>
          <dd>Inter, Inter Tight et Fraunces — licence SIL Open Font License 1.1</dd>
        </div>
      </dl>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus de ce site (textes, éléments graphiques, dessins techniques, mise en page) sont protégés
        par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle,
        sans autorisation écrite préalable de {company.name}, est interdite.
      </p>

      <h2>Responsabilité</h2>
      <p>
        Les informations publiées sur ce site ont une valeur indicative et peuvent évoluer sans préavis. Elles
        ne constituent pas une offre contractuelle : seul un devis établi par {company.name} engage
        l’entreprise.
      </p>

      <h2>Données personnelles</h2>
      <p>
        Le traitement des informations transmises via le formulaire de contact est décrit dans la{" "}
        <Link href="/confidentialite" className="link-inline">
          politique de confidentialité
        </Link>
        .
      </p>

      <h2>Droit applicable</h2>
      <p>Le présent site et ses mentions légales sont soumis au droit français.</p>
    </LegalPage>
  );
}
