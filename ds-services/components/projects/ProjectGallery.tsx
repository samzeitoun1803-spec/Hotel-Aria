"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { lockScroll } from "@/lib/lenis-store";

export type GalleryItem = {
  id: string;
  layout: "wide" | "offset" | "full";
  category: string;
  location: string | null;
  year: number | null;
  isPlaceholder: boolean;
  /** Visuel de la grille (rendu serveur : photo ou composition graphique) */
  media: ReactNode;
  /** Même visuel, pour la visionneuse */
  mediaLarge: ReactNode;
};

function caption(item: GalleryItem) {
  return [item.category, item.location, item.year].filter(Boolean).join(" · ");
}

/**
 * Galerie façon magazine d'architecture : compositions asymétriques,
 * révélation par masque, parallaxe à peine perceptible, survol 1 → 1,025.
 * Chaque visuel ouvre une visionneuse (élément <dialog> natif : focus piégé, Échap).
 */
export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((i: number, opener: HTMLElement) => {
    openerRef.current = opener;
    setIndex(i);
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || index === null || dialog.open) return;
    dialog.showModal();
    lockScroll(true);
  }, [index]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      lockScroll(false);
      setIndex(null);
      openerRef.current?.focus({ preventScroll: true });
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const step = (delta: number) =>
    setIndex((i) => (i === null ? null : (i + delta + items.length) % items.length));

  const current = index === null ? null : items[index];

  return (
    <>
      <div className="proj-grid">
        {items.map((item, i) => (
          <figure key={item.id} className={cn("proj", `proj-${item.layout}`)}>
            <button
              type="button"
              className="proj-frame"
              data-reveal="figure"
              data-cursor="project"
              onClick={(e) => open(i, e.currentTarget)}
            >
              <span className="sr-only">
                Agrandir — {String(i + 1).padStart(2, "0")}, {caption(item)}
                {item.isPlaceholder ? " (photographie à venir)" : ""}
              </span>
              <span className="proj-hover" aria-hidden="true">
                <span className="proj-media" data-parallax>
                  {item.media}
                </span>
              </span>
              {item.isPlaceholder ? (
                <span className="proj-tag" aria-hidden="true">
                  Photographie à venir
                </span>
              ) : null}
            </button>
            <figcaption className="proj-caption">
              <span className="proj-index tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="proj-cat">{item.category}</span>
              <span className="proj-meta">
                {item.isPlaceholder ? "À documenter" : [item.location, item.year].filter(Boolean).join(" · ")}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <dialog
        ref={dialogRef}
        className="viewer"
        aria-labelledby="viewer-title"
        data-lenis-prevent
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        {current ? (
          <div className="viewer-inner" data-theme="dark">
            <div className="viewer-top">
              <p id="viewer-title" className="viewer-title">
                <span className="tabular-nums">
                  {String((index ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
                <span>{caption(current)}</span>
              </p>
              <button type="button" className="viewer-close" onClick={close}>
                <span>Fermer</span>
                <Icon name="close" size={14} />
              </button>
            </div>
            <div className="viewer-media">{current.mediaLarge}</div>
            <div className="viewer-bottom">
              <p className="viewer-note">
                {current.isPlaceholder
                  ? "Photographie à venir — les réalisations DS SERVICES seront publiées ici."
                  : caption(current)}
              </p>
              {items.length > 1 ? (
                <div className="viewer-nav">
                  <button type="button" onClick={() => step(-1)} aria-label="Réalisation précédente">
                    <Icon name="arrow-right" size={16} className="rotate-180" />
                  </button>
                  <button type="button" onClick={() => step(1)} aria-label="Réalisation suivante">
                    <Icon name="arrow-right" size={16} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
