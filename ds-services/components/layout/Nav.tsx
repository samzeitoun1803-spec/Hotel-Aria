"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Wordmark } from "@/components/ui/Wordmark";
import { mainNav } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { MobileMenu } from "./MobileMenu";

/** Sections rattachées à une entrée de navigation (indicateur actif). */
const SECTION_TO_NAV: Record<string, string> = {
  services: "services",
  expertise: "expertise",
  reperes: "expertise",
  realisations: "realisations",
  "a-propos": "a-propos",
  nice: "a-propos",
};

/** Surfaces navy sous lesquelles la barre passe en version sombre. */
const DARK_ZONES = "section[data-theme='dark'], footer[data-theme='dark']";
/** Ligne de détection : à mi-hauteur de la barre compacte. */
const TONE_PROBE = 28;

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  // L'intro de la navigation ne joue qu'au premier chargement de l'accueil.
  const [intro] = useState(() => onHome);
  const [scrolled, setScrolled] = useState(false);
  const [observed, setActive] = useState<string | null>(null);
  const active = onHome ? observed : null;
  const [tone, setTone] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /* Barre compacte dès que l'on quitte le haut de page */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Ton de la barre : sombre quand une surface navy passe dessous */
  useEffect(() => {
    const zones = Array.from(document.querySelectorAll<HTMLElement>(DARK_ZONES));
    if (!zones.length) return;
    const under = new Set<Element>();
    let io: IntersectionObserver | null = null;
    const observe = () => {
      io?.disconnect();
      under.clear();
      // Bande d'un pixel à la hauteur de la barre : seule la surface qui la traverse compte.
      const bottom = Math.max(0, window.innerHeight - TONE_PROBE - 1);
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) under.add(entry.target);
            else under.delete(entry.target);
          });
          setTone(under.size ? "dark" : "light");
        },
        { rootMargin: `-${TONE_PROBE}px 0px -${bottom}px 0px` },
      );
      zones.forEach((zone) => io?.observe(zone));
    };
    observe();
    window.addEventListener("resize", observe);
    return () => {
      io?.disconnect();
      window.removeEventListener("resize", observe);
    };
  }, [pathname]);

  /* Section active : celle qui traverse le milieu de l'écran */
  useEffect(() => {
    if (!onHome) return;
    const sections = Object.keys(SECTION_TO_NAV)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const current = sections.find((s) => visible.has(s.id));
        setActive(current ? SECTION_TO_NAV[current.id] : null);
      },
      { rootMargin: "-46% 0px -52% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onHome]);

  /* Position de l'indicateur (un nœud cobalt qui glisse d'un lien à l'autre) */
  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list || !active) return;
    const link = list.querySelector<HTMLElement>(`[data-nav="${active}"]`);
    if (!link) return;
    setIndicator({ x: link.offsetLeft, w: link.offsetWidth });
  }, [active]);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const indicatorStyle = {
    "--ix": `${indicator ? indicator.x + indicator.w / 2 : 0}px`,
  } as CSSProperties;

  return (
    <>
      <header
        className={cn("site-nav", scrolled && "is-scrolled", intro && "nav-intro")}
        data-tone={tone}
        data-menu-open={menuOpen ? "" : undefined}
      >
        <div className="container-x site-nav-inner">
          <Link href="/#top" className="site-nav-brand" aria-label="DS SERVICES — haut de page">
            <Wordmark />
          </Link>

          <nav className="site-nav-links" aria-label="Navigation principale">
            <ul ref={listRef} role="list">
              {mainNav.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/#${item.id}`}
                    data-nav={item.id}
                    className={cn("nav-link", active === item.id && "is-active")}
                    aria-current={active === item.id ? "true" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <span
              className={cn("nav-indicator", active && indicator && "is-visible")}
              style={indicatorStyle}
              aria-hidden="true"
            />
          </nav>

          <div className="site-nav-end">
            <Button href="/#contact" size="sm" className="nav-cta">
              Demander un devis
            </Button>
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span className="menu-toggle-label">Menu</span>
              <span className="menu-toggle-icon" aria-hidden="true">
                <span />
                <span />
              </span>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={closeMenu} returnFocusRef={toggleRef} />
    </>
  );
}
