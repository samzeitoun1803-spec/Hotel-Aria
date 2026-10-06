"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Wordmark";
import { company, phoneHref } from "@/data/company";
import { mobileNav } from "@/data/navigation";
import { lockScroll } from "@/lib/lenis-store";

type MenuState = "closed" | "open" | "closing";

const CLOSE_DURATION = 420;

/**
 * Menu plein écran (mobile / tablette), fond navy.
 * À l'ouverture, une impulsion descend le long d'un filet et « alimente »
 * chaque lien au passage. Fermeture : Échap, bouton, ou choix d'un lien.
 * Le reste de la page est rendu inerte et le focus reste piégé dans le menu.
 */
export function MobileMenu({
  open,
  onClose,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const [state, setState] = useState<MenuState>("closed");
  const [prevOpen, setPrevOpen] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tel = phoneHref();

  /* Cycle de vie : ouverture immédiate, fermeture animée (état ajusté pendant le rendu) */
  if (open !== prevOpen) {
    setPrevOpen(open);
    setState(open ? "open" : "closing");
  }

  useEffect(() => {
    if (state !== "closing") return;
    const timer = window.setTimeout(() => setState("closed"), CLOSE_DURATION);
    return () => window.clearTimeout(timer);
  }, [state]);

  /* Défilement, inertie de la page, focus */
  useEffect(() => {
    if (state !== "open") return;
    const panel = panelRef.current;
    const page = [document.getElementById("contenu"), document.querySelector(".site-footer")].filter(
      (el): el is HTMLElement => !!el,
    );
    lockScroll(true);
    page.forEach((el) => el.setAttribute("inert", ""));
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);
    const toggle = returnFocusRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      page.forEach((el) => el.removeAttribute("inert"));
      lockScroll(false);
      // Rendre le focus au bouton « Menu » seulement si aucun lien n'a déplacé le focus.
      if (!document.activeElement || document.activeElement === document.body || panel?.contains(document.activeElement)) {
        toggle?.focus({ preventScroll: true });
      }
    };
  }, [state, onClose, returnFocusRef]);

  /* Fermer le menu si la fenêtre repasse en desktop */
  useEffect(() => {
    if (state !== "open") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && onClose();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [state, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panelRef}
      className="menu"
      data-theme="dark"
      data-state={state}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden={state === "closed"}
    >
      <div className="menu-inner container-x">
        <div className="menu-top">
          <Wordmark className="wordmark-light" />
          <button ref={closeRef} type="button" className="menu-close" onClick={onClose}>
            <span>Fermer</span>
            <Icon name="close" size={14} />
          </button>
        </div>

        <nav className="menu-nav" aria-label="Menu principal">
          <span className="menu-rail" aria-hidden="true">
            <span className="menu-rail-pulse" />
          </span>
          <ol className="menu-list" role="list">
            {mobileNav.map((item, i) => (
              <li key={item.id} className="menu-item" style={{ "--i": i } as CSSProperties}>
                <Link href={`/#${item.id}`} className="menu-link" onClick={onClose}>
                  <span className="menu-index" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="menu-label-mask">
                    <span className="menu-label">{item.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className="menu-foot">
          <address className="menu-address">
            {company.streetAddress}
            <br />
            {company.postalCode} {company.city}
          </address>
          <div className="menu-actions">
            {tel ? (
              <a href={tel} className="menu-call">
                Appeler <span className="tabular-nums">{company.phone}</span>
              </a>
            ) : null}
            <Button href="/#contact" onClick={onClose} magnetic={false}>
              Demander un devis
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
