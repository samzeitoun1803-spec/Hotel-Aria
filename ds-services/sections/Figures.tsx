import { Eyebrow } from "@/components/ui/Eyebrow";
import { Rail } from "@/components/ui/Rail";
import { RollNumber } from "@/components/ui/RollNumber";
import { company, yearsOfActivity } from "@/data/company";

/**
 * Repères — uniquement des données vérifiées au registre du commerce.
 * Pas de cartes : une composition typographique en escalier, chaque chiffre
 * raccroché à la colonne par sa propre dérivation.
 */
const years = yearsOfActivity();

const figures = [
  { value: String(company.founded), label: "Création" },
  // « Plus de dix ans » : vrai depuis juillet 2024 ; arrondi à la dizaine inférieure.
  { value: years >= 10 ? `${Math.floor(years / 10) * 10}+` : String(years), label: "Années d’activité" },
  { value: company.postalCode, label: company.city },
];

export function Figures() {
  return (
    <section id="reperes" className="section figures" aria-labelledby="figures-title" data-scene>
      <Rail />
      <div className="container-x">
        <Eyebrow node as="h2" id="figures-title">
          Repères
        </Eyebrow>

        <ol className="fig-list" role="list">
          {figures.map((f, i) => (
            <li key={f.label} className={`fig fig-${i + 1}`} data-sweep>
              <span className="fig-branch" aria-hidden="true">
                <span className="fig-branch-pulse" />
              </span>
              <RollNumber value={f.value} className="fig-num" />
              <span className="fig-label t-eyebrow">{f.label}</span>
            </li>
          ))}
        </ol>

        <p className="fig-source">Source : registre du commerce et des sociétés —{" "}
          <span className="whitespace-nowrap">SIREN {company.siren}</span>.</p>
      </div>
    </section>
  );
}
