/**
 * Plan abstrait du quartier des Musiciens — tracé simplifié, sans échelle.
 *
 * Seules des relations vérifiées sont encodées : le quartier est délimité par
 * le boulevard Gambetta, l'avenue Jean-Médecin et le boulevard Victor-Hugo ;
 * la rue Rossini le traverse. Les autres rues sont volontairement anonymes.
 * Aucune tuile cartographique ni script tiers : un SVG de quelques Ko.
 */

const streetsH = [
  "M150 112H590",
  "M150 182H520",
  "M150 318H520",
];
const streetsV = [
  "M205 70V372",
  "M298 120V372",
  "M392 86V372",
  "M478 70V372",
];

export function NiceMap() {
  return (
    <svg
      className="nice-map"
      viewBox="0 0 640 480"
      fill="none"
      role="img"
      aria-labelledby="nice-map-title nice-map-desc"
    >
      <title id="nice-map-title">Plan simplifié du quartier des Musiciens, à Nice</title>
      <desc id="nice-map-desc">
        Tracé abstrait des rues entre le boulevard Gambetta, l’avenue Jean-Médecin et le boulevard
        Victor-Hugo. Un point indique DS SERVICES, au 35 rue Rossini.
      </desc>

      <g transform="rotate(-8 320 240)">
        {/* Rues secondaires */}
        <g className="map-streets">
          {[...streetsH, ...streetsV].map((d) => (
            <path key={d} d={d} className="map-street" pathLength={1} />
          ))}
        </g>

        {/* Boulevards : double trait */}
        <g className="map-boulevards">
          <path d="M112 36V444" className="map-boulevard" pathLength={1} />
          <path d="M122 36V444" className="map-boulevard" pathLength={1} />
          <path d="M540 36V444" className="map-boulevard" pathLength={1} />
          <path d="M550 36V444" className="map-boulevard" pathLength={1} />
          <path d="M70 384H604" className="map-boulevard" pathLength={1} />
          <path d="M70 394H604" className="map-boulevard" pathLength={1} />
        </g>

        {/* Rue Rossini */}
        <path d="M150 252H478" className="map-rossini" pathLength={1} />
        <path d="M150 252H262" className="map-current" pathLength={1} />

        {/* Libellés */}
        <g className="map-labels">
          <text x="100" y="250" transform="rotate(-90 100 250)" textAnchor="middle">
            BD GAMBETTA
          </text>
          <text x="566" y="210" transform="rotate(90 566 210)" textAnchor="middle">
            AV. JEAN-MÉDECIN
          </text>
          <text x="337" y="418" textAnchor="middle">
            BD VICTOR-HUGO
          </text>
          <text x="400" y="242" textAnchor="middle" className="map-label-strong">
            RUE ROSSINI
          </text>
        </g>

        {/* 35 rue Rossini */}
        <g className="map-pin" transform="translate(262 252)">
          <circle r="22" className="map-pin-wave" />
          <circle r="11" className="map-pin-ring" />
          <circle r="5" className="map-pin-dot" />
          <text x="-16" y="-20" textAnchor="end" className="map-pin-label">
            35
          </text>
        </g>
      </g>

      <text x="616" y="466" textAnchor="end" className="map-caption">
        QUARTIER DES MUSICIENS — TRACÉ SIMPLIFIÉ, SANS ÉCHELLE
      </text>
    </svg>
  );
}
