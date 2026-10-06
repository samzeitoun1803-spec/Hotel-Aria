/**
 * Génère les visuels de partage et les icônes à partir du site lui-même
 * (mêmes polices, même feuille de styles, même circuit) :
 *   app/opengraph-image.png  (1200 × 630)
 *   app/apple-icon.png       (180 × 180)
 *   app/favicon.ico          (32 × 32, PNG encapsulé)
 *
 *   npm run build && npm run start    # dans un autre terminal
 *   npm run og
 */
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const browser = await chromium.launch(launchOptions);

/* ── Open Graph ─────────────────────────────────────────────────────────── */
{
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: "reduce" });
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const svg = document.querySelector(".hc-svg-desktop").cloneNode(true);
    svg.removeAttribute("class");
    svg.setAttribute("width", "620");
    svg.style.display = "block";
    svg.style.overflow = "visible";
    document.body.innerHTML = "";
    document.body.style.cssText = "margin:0;width:1200px;height:630px;overflow:hidden;background:#F9F8F6;";
    const root = document.createElement("div");
    root.style.cssText = "position:relative;width:1200px;height:630px;";
    root.innerHTML = `
      <div style="position:absolute;left:64px;top:56px;" class="t-eyebrow">Électricité · Rénovation · Nice</div>
      <h1 class="t-hero" style="position:absolute;left:60px;top:218px;margin:0;font-size:104px;color:#0C1754;line-height:.9">
        <span style="display:block">L’électricité,</span>
        <span style="display:block;padding-left:.9em"><span class="sig" style="font-size:1.05em">maîtrisée.</span></span>
      </h1>
      <div style="position:absolute;left:64px;right:64px;bottom:72px;height:1px;background:#E4DBCF"></div>
      <div style="position:absolute;left:64px;bottom:34px;display:flex;gap:28px;font:500 15px var(--font-sans);color:#0C1754;letter-spacing:-.005em">
        <span style="font-weight:650;letter-spacing:.02em">DS SERVICES</span>
        <span>35 rue Rossini, 06000 Nice</span>
        <span style="color:#6B6762">Électricité &amp; rénovation · depuis 2014</span>
      </div>
      <div style="position:absolute;right:54px;top:36px;" id="og-svg"></div>
    `;
    document.body.appendChild(root);
    root.querySelector("#og-svg").appendChild(svg);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "app/opengraph-image.png" });
  await page.close();
}

/* ── Icônes ─────────────────────────────────────────────────────────────── */
const iconSvg = (rounded) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="100%" height="100%">
    <rect width="32" height="32" rx="${rounded ? 8 : 0}" fill="#0C1754"/>
    <path d="M11 5v22" stroke="#F9F8F6" stroke-width="2"/>
    <path d="M11 16h12" stroke="#F9F8F6" stroke-width="2"/>
    <circle cx="11" cy="16" r="3.6" fill="#2545FF"/>
    <circle cx="23" cy="16" r="2.4" fill="#F9F8F6"/>
  </svg>`;

async function renderIcon(size, rounded) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${iconSvg(rounded)}</body></html>`,
  );
  const png = await page.screenshot({ omitBackground: true });
  await page.close();
  return png;
}

await writeFile("app/apple-icon.png", await renderIcon(180, false));

/* favicon.ico : conteneur ICO avec une image PNG 32 × 32 */
const png32 = await renderIcon(32, true);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // réservé
header.writeUInt16LE(1, 2); // type : icône
header.writeUInt16LE(1, 4); // nombre d'images
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0); // largeur
entry.writeUInt8(32, 1); // hauteur
entry.writeUInt8(0, 2); // palette
entry.writeUInt8(0, 3); // réservé
entry.writeUInt16LE(1, 4); // plans
entry.writeUInt16LE(32, 6); // bits par pixel
entry.writeUInt32LE(png32.length, 8);
entry.writeUInt32LE(6 + 16, 12);
await writeFile("app/favicon.ico", Buffer.concat([header, entry, png32]));

await browser.close();
console.log("✓ app/opengraph-image.png, app/apple-icon.png, app/favicon.ico");
