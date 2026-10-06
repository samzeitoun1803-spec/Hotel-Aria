import type { CSSProperties } from "react";
import { DESKTOP, MOBILE, RESOLVED } from "./hero-circuit-data";

/**
 * Rendu serveur du circuit du hero (SVG statique + variables CSS d'animation).
 * Les interactions sont ajoutées côté client par <HeroCircuit>.
 */

type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export function HeroCircuitSvg({ kind, className }: { kind: "desktop" | "mobile"; className?: string }) {
  const variant = kind === "desktop" ? DESKTOP : MOBILE;
  const circuits = RESOLVED[kind];
  const [w, h] = variant.viewBox;
  const { plan } = variant;
  const p = variant.pulse;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
      data-variant={kind}
      data-pulse={p}
    >
      {/* Axes d'implantation */}
      {plan.axes ? (
        <g className="hc-axes">
          {plan.axes.x.map((x, i) => (
            <g key={`ax-${x}`}>
              <path d={`M${x} ${plan.axes!.extent[0]}V${plan.axes!.extent[1]}`} className="hc-axis" />
              <circle cx={x} cy={22} r={10} className="hc-bubble" />
              <text x={x} y={25.5} textAnchor="middle" className="hc-bubble-text">
                {plan.axes!.labelsX[i]}
              </text>
            </g>
          ))}
          {plan.axes.y.map((y, i) => (
            <g key={`ay-${y}`}>
              <path d={`M${plan.axes!.extent[2]} ${y}H${plan.axes!.extent[3] - 22}`} className="hc-axis" />
              <circle cx={plan.axes!.extent[3] - 8} cy={y} r={10} className="hc-bubble" />
              <text x={plan.axes!.extent[3] - 8} y={y + 3.5} textAnchor="middle" className="hc-bubble-text">
                {plan.axes!.labelsY[i]}
              </text>
            </g>
          ))}
        </g>
      ) : null}

      {/* Plan */}
      <g className="hc-plan">
        {plan.walls.map((d) => (
          <path key={d} d={d} className="hc-wall" />
        ))}
        {plan.glazing.map((d) => (
          <path key={d} d={d} className="hc-glazing" />
        ))}
        {plan.partitions.map((d) => (
          <path key={d} d={d} className="hc-partition" />
        ))}
        {plan.doors.map((d) => (
          <path key={d} d={d} className="hc-door" />
        ))}
      </g>

      {/* Circuits */}
      {circuits.map((c) => {
        const vars: CSSVars = {
          "--len": c.length,
          "--dash-live": `${c.length} ${c.length}`,
          "--dash-pulse": `${p} ${c.length + p}`,
          "--off-from": p,
          "--off-to": -c.length,
          "--delay": `${c.startAt.toFixed(3)}s`,
          "--dur": `${c.duration.toFixed(3)}s`,
          "--pdur": `${c.pulseDuration.toFixed(3)}s`,
        };
        return (
          <g
            key={c.id}
            className="hc-circuit"
            data-circuit={c.id}
            data-len={c.length}
            data-start={c.startAt.toFixed(3)}
            data-pdur={c.pulseDuration.toFixed(3)}
            data-terminal={c.terminal ? "" : undefined}
            style={vars}
          >
            <path d={c.d} className="hc-trace" />
            <path d={c.d} className="hc-live" />
            <path d={c.d} className="hc-pulse" />
          </g>
        );
      })}

      {/* Source : tableau + nœud d'arrivée */}
      <g className="hc-source">
        <rect
          x={plan.panel.x}
          y={plan.panel.y}
          width={plan.panel.w}
          height={plan.panel.h}
          className="hc-panel"
        />
        <path
          d={`M${plan.panel.x + 6} ${plan.panel.y + plan.panel.h / 2}H${plan.panel.x + plan.panel.w - 6}`}
          className="hc-panel-rule"
        />
        <circle cx={plan.source[0]} cy={plan.source[1]} r={kind === "desktop" ? 11 : 8} className="hc-source-ring" />
        <circle cx={plan.source[0]} cy={plan.source[1]} r={kind === "desktop" ? 4.5 : 3.5} className="hc-source-dot" />
        <text
          x={plan.sourceLabel.x}
          y={plan.sourceLabel.y}
          textAnchor={plan.sourceLabel.anchor ?? "start"}
          className="hc-label hc-label-source"
        >
          {plan.sourceLabel.text}
        </text>
      </g>

      {/* Nœuds et repères de circuits */}
      {circuits.map((c) => (
        <g key={`n-${c.id}`} className="hc-nodes" data-circuit={c.id}>
          {c.nodes.map((n) => (
            <g key={`${n.x}-${n.y}`} style={{ "--t": `${n.t.toFixed(3)}s` } as CSSVars}>
              {n.kind === "end" ? <circle cx={n.x} cy={n.y} r={kind === "desktop" ? 9 : 7} className="hc-node-ring" /> : null}
              <circle
                cx={n.x}
                cy={n.y}
                r={n.kind === "end" ? (kind === "desktop" ? 4 : 3.2) : kind === "desktop" ? 2.6 : 2.2}
                className={n.kind === "end" ? "hc-node hc-node-end" : "hc-node hc-node-tap"}
                data-t={n.t.toFixed(3)}
              />
              {n.kind === "end" && c.interactive ? (
                <circle cx={n.x} cy={n.y} r={18} className="hc-hit" data-hit={c.id} />
              ) : null}
            </g>
          ))}
          {c.label ? (
            <text
              x={c.points[c.points.length - 1][0] + c.label.dx}
              y={c.points[c.points.length - 1][1] + c.label.dy}
              textAnchor={c.label.anchor ?? "start"}
              className="hc-label"
              style={{ "--t": `${(c.startAt + c.duration + 0.08).toFixed(3)}s` } as CSSVars}
            >
              {c.label.text}
            </text>
          ) : null}
        </g>
      ))}

      {plan.caption ? (
        <text x={plan.caption.x} y={plan.caption.y} textAnchor="end" className="hc-caption">
          {plan.caption.text}
        </text>
      ) : null}
    </svg>
  );
}

