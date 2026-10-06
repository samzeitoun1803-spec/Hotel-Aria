import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { Missing } from "@/components/ui/Missing";
import { company, companyFieldLabels } from "@/data/company";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description: `Comment ${company.name} traite les informations transmises via le formulaire de contact.`,
  alternates: site.url ? { canonical: "/confidentialite" } : undefined,
};

export default function Confidentialite() {
  return (
    <LegalPage eyebrow="Données personnelles" title="Confidentialité">
      <p>
        Cette page explique quelles informations sont recueillies sur ce site, pourquoi, et comment exercer vos
        droits. Elle est rédigée conformément au Règlement général sur la protection des données (RGPD).
      </p>

      <h2>Responsable du traitement</h2>
      <p>
        {company.name}, {company.legalForm} — {company.address}, représentée par {company.manager}, gérant.
      </p>

      <h2>Données recueillies</h2>
      <p>
        Uniquement celles que vous saisissez dans le formulaire de contact : nom, téléphone et/ou e-mail, type de
        projet et message. Aucune autre donnée n’est collectée à votre insu.
      </p>

      <h2>Finalité et base légale</h2>
      <p>
        Ces informations servent exclusivement à répondre à votre demande (prise de contact, établissement d’un
        devis). Le traitement repose sur les mesures précontractuelles prises à votre demande (article 6.1.b du
        RGPD).
      </p>

      <h2>Destinataires</h2>
      <p>
        Les données sont destinées à {company.name} et ne sont ni vendues ni cédées. Elles transitent par le
        prestataire technique chargé de l’acheminement des messages :{" "}
        {company.messageProvider ?? <Missing label={companyFieldLabels.messageProvider} />}.
      </p>

      <h2>Durée de conservation</h2>
      {company.dataRetention ? (
        <p>{company.dataRetention}</p>
      ) : (
        <p>
          Le temps nécessaire au traitement de votre demande, puis trois ans au plus à compter du dernier contact,
          durée de référence recommandée par la CNIL pour les données de prospects.{" "}
          <Missing label={companyFieldLabels.dataRetention} />
        </p>
      )}

      <h2>Vos droits</h2>
      <p>
        Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de
        portabilité. Pour l’exercer, écrivez à{" "}
        {company.email ? (
          <a href={`mailto:${company.email}`} className="link-inline">
            {company.email}
          </a>
        ) : (
          <Missing label={companyFieldLabels.email} />
        )}{" "}
        ou par courrier au {company.address}.
      </p>
      <p>
        Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL
        (cnil.fr).
      </p>

      <h2>Cookies et services tiers</h2>
      <p>
        Ce site ne dépose aucun cookie publicitaire ni de mesure d’audience. Les polices de caractères sont
        hébergées sur le site lui-même : aucune requête n’est envoyée à un service tiers lors de votre visite.
        Le lien « Itinéraire » ouvre Google Maps dans un nouvel onglet, uniquement si vous le choisissez.
      </p>

      <h2>Hébergement</h2>
      <p>
        Le site est hébergé par : {company.host ?? <Missing label={companyFieldLabels.host} />}.
      </p>
    </LegalPage>
  );
}
