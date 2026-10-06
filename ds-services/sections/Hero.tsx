import type { CSSProperties } from "react";
import { HeroCircuit } from "@/components/art/HeroCircuit";
import { HeroCircuitSvg } from "@/components/art/HeroCircuitSvg";
import { FEED_ARRIVAL, FEED_X_RATIO } from "@/components/art/hero-circuit-data";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Rail } from "@/components/ui/Rail";
import { Sig } from "@/components/ui/Sig";
import { company } from "@/data/company";

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

/**
 * Hero — « L’électricité, maîtrisée. »
 * L'intro (< 2 s) est entièrement en CSS : elle démarre au premier rendu,
 * sans attendre l'hydratation, et disparaît si l'utilisateur réduit les animations.
 */
export function Hero() {
  const vars = {
    "--feed-t": `${FEED_ARRIVAL.toFixed(3)}s`,
    "--feed-x": FEED_X_RATIO.toFixed(4),
  } as CSSProperties;

  return (
    <section id="top" className="hero" aria-labelledby="hero-title" style={vars} data-scene>
      <div className="hero-frame container-x">
        <HeroCircuit>
          <HeroCircuitSvg kind="desktop" className="hc-svg hc-svg-desktop" />
          <HeroCircuitSvg kind="mobile" className="hc-svg hc-svg-mobile" />
        </HeroCircuit>

        <p className="t-eyebrow hero-eyebrow">
          Électricité <span aria-hidden="true">·</span> Rénovation <span aria-hidden="true">·</span> Nice
        </p>

        <div className="hero-content">
          <h1 id="hero-title" className="t-hero hero-title">
            <span className="hero-line">
              <span className="hero-line-inner">L’électricité,</span>
            </span>{" "}
            <span className="hero-line hero-line-2">
              <span className="hero-line-inner">
                <Sig energize={false} className="hero-sig">
                  maîtrisée.
                </Sig>
              </span>
            </span>
          </h1>

          <div className="hero-aside">
            <p className="hero-lead">
              <span>Installation électrique et rénovation à Nice.</span>
              <span>Depuis {company.founded}.</span>
            </p>
            <div className="hero-actions">
              <Button href="#contact">Demander un devis</Button>
              <a href="#intro" className="link-u hero-secondary">
                Découvrir notre expertise
                <Icon name="arrow-down" size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="hero-cartouche">
          <span className="hero-hairline" aria-hidden="true">
            <span className="hero-hairline-track">
              <span className="hero-hairline-pulse" />
            </span>
          </span>
          <span className="hero-junction" aria-hidden="true" />
          <Rail />
          <dl className="cartouche">
            <div className="cartouche-cell">
              <dt>Entreprise</dt>
              <dd>
                {company.name} — {company.legalForm}
              </dd>
            </div>
            <div className="cartouche-cell">
              <dt>Adresse</dt>
              <dd>
                <span className="whitespace-nowrap">{company.streetAddress},</span>{" "}
                <span className="whitespace-nowrap">
                  {company.postalCode} {company.city}
                </span>
              </dd>
            </div>
            <div className="cartouche-cell cartouche-cell-optional">
              <dt>SIREN</dt>
              <dd className="tabular-nums">{company.siren}</dd>
            </div>
            <div className="cartouche-cell">
              <dt>Création</dt>
              <dd>
                {MONTHS[company.foundedMonth - 1].replace(/^./, (c) => c.toUpperCase())} {company.founded}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
