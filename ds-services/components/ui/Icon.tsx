import type { SVGProps } from "react";

export type IconName = "arrow-right" | "arrow-down" | "arrow-up" | "arrow-up-right" | "close" | "check";

const paths: Record<IconName, string> = {
  "arrow-right": "M2 8h11.5M9 3.5 13.5 8 9 12.5",
  "arrow-down": "M8 2v11.5M3.5 9 8 13.5 12.5 9",
  "arrow-up": "M8 14V2.5M3.5 7 8 2.5 12.5 7",
  "arrow-up-right": "M4 12 12 4M5.5 4H12v6.5",
  close: "M3.5 3.5l9 9M12.5 3.5l-9 9",
  check: "M2.5 8.5 6.2 12 13.5 4",
};

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
};

/**
 * Icônes dessinées sur une grille de 16 — terminaisons carrées, angles vifs :
 * le même vocabulaire que les tracés techniques du site.
 */
export function Icon({ name, size = 16, strokeWidth = 1.4, className, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d={paths[name]} />
    </svg>
  );
}
