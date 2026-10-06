import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Sig } from "@/components/ui/Sig";

export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: true },
};

/** 404 — « Circuit ouvert. » : la ligne est coupée, rien n'arrive au bout. */
export default function NotFound() {
  return (
    <section className="not-found container-x" aria-labelledby="nf-title">
      <p className="nf-code">ERREUR 404</p>
      <h1 id="nf-title" className="t-section nf-title">
        Circuit <Sig energize={false}>ouvert.</Sig>
      </h1>
      <div className="nf-wire" aria-hidden="true">
        <span className="nf-a" />
        <span className="nf-gap" />
        <span className="nf-b" />
      </div>
      <p className="t-body nf-text">
        Cette page n’est reliée à rien. Le lien est peut-être incomplet, ou la page a été déplacée.
      </p>
      <div className="nf-actions">
        <Button href="/">Revenir à l’accueil</Button>
      </div>
    </section>
  );
}
