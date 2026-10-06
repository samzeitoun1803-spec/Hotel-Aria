"use client";

import { useEffect, useState } from "react";

/**
 * Entrée de navigation active : celle de la section qui traverse le milieu de l'écran.
 * `sections` associe l'id de chaque section à l'entrée qu'elle allume
 * (objet stable, déclaré hors du composant).
 */
export function useActiveSection(sections: Readonly<Record<string, string>>, enabled = true) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const elements = Object.keys(sections)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        const current = elements.find((el) => visible.has(el.id));
        setActive(current ? sections[current.id] : null);
      },
      { rootMargin: "-46% 0px -52% 0px" },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections, enabled]);

  return enabled ? active : null;
}
