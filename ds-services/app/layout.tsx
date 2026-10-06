import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { StickyCta } from "@/components/layout/StickyCta";
import { Cursor } from "@/components/motion/Cursor";
import { MotionLayer } from "@/components/motion/MotionLayer";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { company } from "@/data/company";
import { baseUrl, site } from "@/data/site";
import { electricianJsonLd, serializeJsonLd } from "@/lib/seo";
import "./globals.css";

/* Polices auto-hébergées (SIL OFL, voir app/fonts/OFL.txt) — sous-ensemble latin. */
const interTight = localFont({
  src: "./fonts/InterTight-Variable.woff2",
  variable: "--font-inter-tight",
  weight: "100 900",
  display: "swap",
  preload: true,
});

const inter = localFont({
  src: "./fonts/Inter-Variable.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
  preload: false,
});

const fraunces = localFont({
  src: "./fonts/Fraunces-Italic-Variable.woff2",
  variable: "--font-fraunces",
  weight: "100 900",
  style: "italic",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
});

const defaultTitle = `Électricien à Nice — Installation & rénovation | ${company.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl()),
  title: { default: defaultTitle, template: `%s | ${company.name}` },
  description: site.description,
  applicationName: company.name,
  alternates: site.url ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: site.locale,
    url: "/",
    siteName: company.name,
    title: defaultTitle,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: site.description,
  },
  robots: { index: true, follow: true },
  // Évite que Safari iOS transforme le SIREN en lien téléphonique.
  formatDetection: { telephone: false, address: false, email: false },
  category: "business",
};

export const viewport: Viewport = {
  themeColor: site.themeColor,
  colorScheme: "light",
};

/**
 * Exécuté avant le premier rendu : active les animations seulement si l'utilisateur
 * ne demande pas à les réduire. Filet de sécurité : si les animations au scroll ne
 * s'initialisent pas en 5 s (JavaScript bloqué, erreur réseau), tout s'affiche.
 */
const motionScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;}catch(e){}d.classList.add('motion');window.__dsRevealFallback=window.setTimeout(function(){d.classList.add('motion-fallback');},5000);})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${interTight.variable} ${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <a href="#contenu" className="skip-link">
          Aller au contenu
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(electricianJsonLd()) }}
        />
        <SmoothScroll />
        <Nav />
        <main id="contenu" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <StickyCta />
        <MotionLayer />
        <Cursor />
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
