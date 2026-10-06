"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { phoneHref } from "@/data/company";
import { cn } from "@/lib/cn";

/**
 * CTA collant discret (mobile) : apparaît une fois le hero passé,
 * s'efface pendant la lecture de la section contact et du pied de page.
 * Dès que le téléphone est renseigné (data/company.ts), « Appeler » s'y ajoute.
 */
export function StickyCta() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const tel = phoneHref();

  const onHome = pathname === "/";

  useEffect(() => {
    if (!onHome) return;
    const hero = document.getElementById("top");
    const blockers = [document.getElementById("contact"), document.querySelector(".site-footer")].filter(
      (el): el is HTMLElement => !!el,
    );
    let heroPassed = false;
    const blocked = new Set<Element>();
    const update = () => setVisible(heroPassed && blocked.size === 0);

    const heroIo = new IntersectionObserver(([entry]) => {
      heroPassed = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      update();
    });
    const blockIo = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) blocked.add(entry.target);
        else blocked.delete(entry.target);
      });
      update();
    });
    if (hero) heroIo.observe(hero);
    blockers.forEach((el) => blockIo.observe(el));
    return () => {
      heroIo.disconnect();
      blockIo.disconnect();
    };
  }, [onHome]);

  const shown = onHome && visible;

  return (
    <div className={cn("sticky-cta", shown && "is-visible")} inert={!shown}>
      {tel ? (
        <Button href={tel} variant="light" size="sm" icon={null} magnetic={false}>
          Appeler
        </Button>
      ) : null}
      <Button href="/#contact" size="sm" magnetic={false}>
        Demander un devis
      </Button>
    </div>
  );
}
