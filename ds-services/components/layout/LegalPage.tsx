import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { site } from "@/data/site";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year}`;
}

/** Gabarit des pages éditoriales (mentions légales, confidentialité). */
export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <article>
      <header className="page-head container-x">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="t-section page-title">{title}</h1>
      </header>
      <div className="container-x">
        <div className="prose-legal">
          {children}
          <p className="legal-updated">Dernière mise à jour : {formatMonth(site.legalUpdated)}.</p>
        </div>
      </div>
    </article>
  );
}
