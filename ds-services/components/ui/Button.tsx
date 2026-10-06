"use client";

import Link from "next/link";
import { useEffect, useImperativeHandle, useRef, type MouseEventHandler, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";
import { finePointer, motionAllowed } from "@/lib/motion";
import { Contour, type ContourHandle } from "./Contour";
import { Icon, type IconName } from "./Icon";

type Variant = "primary" | "ghost" | "light";

export type ButtonHandle = {
  /** Déclenche une impulsion sur le contour. */
  pulse: () => void;
  element: HTMLElement | null;
};

type ButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: Variant;
  size?: "md" | "sm";
  icon?: IconName | null;
  /** Léger déplacement vers le pointeur (desktop uniquement) */
  magnetic?: boolean;
  /** Chargement : l'impulsion tourne en boucle autour du contour */
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  ref?: Ref<ButtonHandle>;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "data-prefill"?: string;
  "data-cursor"?: string;
};

/**
 * Bouton signature : pill, aucune ombre.
 * Survol : une impulsion parcourt le contour (le courant), la flèche avance,
 * le label glisse d'1,5 px. Liens internes via next/link, ancres et liens
 * externes en <a>, actions en <button>.
 */
export function Button({
  children,
  href,
  type = "button",
  variant = "primary",
  size = "md",
  icon = "arrow-right",
  magnetic = true,
  loading = false,
  disabled = false,
  className,
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const contourRef = useRef<ContourHandle>(null);

  useImperativeHandle(ref, () => ({ pulse: () => void contourRef.current?.pulse(), element: rootRef.current }), []);

  /* Boucle de chargement */
  useEffect(() => {
    if (!loading) return;
    const anim = contourRef.current?.pulse({ loop: true });
    return () => anim?.cancel();
  }, [loading]);

  /* Effet magnétique (pointeur fin, animations autorisées) */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !magnetic) return;
    if (!finePointer() || !motionAllowed()) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = Math.max(-6, Math.min(6, dx * 0.16));
        const y = Math.max(-5, Math.min(5, dy * 0.28));
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.style.transform = "";
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [magnetic]);

  const onEnter = () => {
    if (!loading) contourRef.current?.pulse();
  };

  const classes = cn("btn", `btn-${variant}`, size === "sm" && "btn-sm", loading && "is-loading", className);

  const content = (
    <>
      <span className="btn-label">{children}</span>
      {icon ? (
        <span className="btn-icon">
          <Icon name={icon} size={size === "sm" ? 14 : 15} />
        </span>
      ) : null}
      <Contour ref={contourRef} className="btn-contour" />
    </>
  );

  const setRef = (node: HTMLElement | null) => {
    rootRef.current = node;
  };

  if (href) {
    if (href.startsWith("/")) {
      return (
        <Link ref={setRef} href={href} className={classes} onPointerEnter={onEnter} onClick={onClick} {...rest}>
          {content}
        </Link>
      );
    }
    const external = /^https?:\/\//.test(href);
    return (
      <a
        ref={setRef}
        href={href}
        className={classes}
        onPointerEnter={onEnter}
        onClick={onClick}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={setRef}
      type={type}
      className={classes}
      onPointerEnter={onEnter}
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading || undefined}
      {...rest}
    >
      {content}
    </button>
  );
}
