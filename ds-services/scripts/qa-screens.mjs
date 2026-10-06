/**
 * QA visuelle et fonctionnelle (Playwright / Chromium).
 *
 *   npm run build && npm run start      # dans un autre terminal
 *   npm run qa:screens                  # BASE_URL=http://localhost:3000 par défaut
 *
 * Pour chaque largeur de référence : capture du hero après l'intro, défilement
 * progressif (déclenche les révélations), capture pleine page, puis contrôle du
 * débordement horizontal et des erreurs console. Résultats dans ./qa-output.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.QA_OUT ?? "qa-output";
const ONLY = process.env.QA_ONLY ? process.env.QA_ONLY.split(",").map(Number) : null;
const PATHS = (process.env.QA_PATHS ?? "/").split(",");

const VIEWPORTS = [
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
].filter((v) => !ONLY || ONLY.includes(v.width));

const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 140));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
  });
  await page.waitForTimeout(1600);
}

async function overflowReport(page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const scrollW = document.documentElement.scrollWidth;
    const offenders = [];
    if (scrollW > vw) {
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        if (r.width && (r.right > vw + 1 || r.left < -1)) {
          const style = getComputedStyle(el);
          if (style.position === "fixed") continue;
          offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} → [${Math.round(r.left)}, ${Math.round(r.right)}]`);
          if (offenders.length > 12) break;
        }
      }
    }
    return { vw, scrollW, offenders };
  });
}

async function run() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch(launchOptions);
  const report = [];

  for (const route of PATHS) {
    for (const vp of VIEWPORTS) {
      for (const reduced of [false, ...(vp.width === 390 || vp.width === 1440 ? [true] : [])]) {
        const context = await browser.newContext({
          viewport: vp,
          deviceScaleFactor: 1,
          reducedMotion: reduced ? "reduce" : "no-preference",
          hasTouch: vp.width < 1024,
          isMobile: vp.width < 768,
        });
        const page = await context.newPage();
        const errors = [];
        page.on("console", (msg) => {
          if (msg.type() === "error" || msg.type() === "warning") errors.push(`[${msg.type()}] ${msg.text()}`);
        });
        page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

        const tag = `${route === "/" ? "home" : route.replace(/\//g, "")}-${vp.width}${reduced ? "-reduced" : ""}`;
        await page.goto(BASE_URL + route, { waitUntil: "networkidle" });
        await page.waitForTimeout(2600);
        await page.screenshot({ path: path.join(OUT, `${tag}-hero.png`) });

        await scrollThrough(page);
        const overflow = await overflowReport(page);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(OUT, `${tag}-full.png`), fullPage: true });

        report.push({ tag, overflow, errors });
        console.log(
          `${tag.padEnd(26)} overflow: ${overflow.scrollW > overflow.vw ? "OUI " + JSON.stringify(overflow.offenders) : "non"}  console: ${errors.length ? errors.join(" | ") : "ok"}`,
        );
        await context.close();
      }
    }
  }

  await writeFile(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
