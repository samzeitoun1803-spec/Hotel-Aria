/**
 * Parcours fonctionnels (smoke tests) — Playwright / Chromium.
 *
 *   CONTACT_DRY_RUN=true npm run start   # dans un autre terminal (le formulaire répond « envoyé »)
 *   npm run qa:flows
 *
 * Vérifie : navigation par ancres, CTA, pré-remplissage depuis les services,
 * validation et envoi du formulaire, visionneuse, menu mobile (clavier compris),
 * CTA collant, pages légales, 404, lien d'évitement, rendu sans animation et sans JavaScript.
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const launchOptions = process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {};

const results = [];
let failures = 0;
function check(name, ok, detail = "") {
  results.push(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function sectionOffset(page, id) {
  return page.evaluate((sid) => {
    const el = document.getElementById(sid);
    return el ? Math.round(el.getBoundingClientRect().top) : null;
  }, id);
}

const browser = await chromium.launch(launchOptions);

/* ── Desktop, animations actives ───────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // La page 404 testée plus bas provoque volontairement un « Failed to load resource : 404 ».
  page.on("console", (m) => m.type() === "error" && !m.text().includes("404") && errors.push(m.text()));

  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await wait(2400);
  check("Hero : titre H1", (await page.textContent("h1"))?.includes("maîtrisée."));

  for (const [label, id] of [
    ["Services", "services"],
    ["Expertise", "expertise"],
    ["Réalisations", "realisations"],
    ["À propos", "a-propos"],
  ]) {
    await page.click(`.site-nav-links >> text=${label}`);
    await wait(2000);
    const top = await sectionOffset(page, id);
    const hash = await page.evaluate(() => location.hash);
    check(`Navigation « ${label} » → #${id}`, top !== null && Math.abs(top) < 40 && hash === `#${id}`, `top=${top}, hash=${hash}`);
  }

  const activeLink = await page.textContent(".nav-link.is-active").catch(() => null);
  check("Indicateur de section active", activeLink === "À propos", `actif=${activeLink}`);

  await page.click(".site-nav-brand");
  await wait(2000);
  check("Wordmark → haut de page", (await page.evaluate(() => window.scrollY)) < 5);

  await page.click(".hero-actions >> text=Demander un devis");
  await wait(2200);
  check("CTA hero → #contact", Math.abs(await sectionOffset(page, "contact")) < 40);

  await page.evaluate(() => document.getElementById("services").scrollIntoView());
  await wait(800);
  await page.click(".svc-row[data-prefill='renovation']");
  await wait(2200);
  const checked = await page.evaluate(() => document.querySelector("input[name='projectType']:checked")?.value);
  check("Ligne de service → formulaire pré-rempli", checked === "renovation", `valeur=${checked}`);
  check("Ligne de service → défilement vers #contact", Math.abs(await sectionOffset(page, "contact")) < 40);

  // Validation
  await page.click(".contact-form button[type='submit']");
  await wait(300);
  const errorTexts = await page.$$eval(".field-error, .field-hint.is-error", (els) => els.map((e) => e.textContent));
  check("Formulaire vide → erreurs affichées", errorTexts.length >= 3, errorTexts.join(" | "));
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("name"));
  check("Focus sur le premier champ en erreur", focused === "name", `focus=${focused}`);

  await page.fill("input[name='name']", "Jeanne Martin");
  await page.fill("input[name='email']", "jeanne@exemple");
  await page.fill("textarea[name='message']", "Court");
  await page.click(".contact-form button[type='submit']");
  await wait(300);
  const errs2 = await page.$$eval(".field-error", (els) => els.map((e) => e.textContent));
  check("E-mail invalide et message trop court signalés", errs2.length === 2, errs2.join(" | "));

  await page.fill("input[name='email']", "jeanne@exemple.fr");
  await page.fill(
    "textarea[name='message']",
    "Rénovation de l’installation d’un appartement ancien, rue Rossini. Tableau à reprendre.",
  );
  await page.click(".contact-form button[type='submit']");
  await wait(250);
  const busy = await page.getAttribute(".contact-form button[type='submit']", "aria-busy");
  check("Envoi : état de chargement (aria-busy)", busy === "true");
  await wait(2600);
  const result = await page.textContent(".submit-result");
  const failure = await page.textContent(".submit-error").catch(() => null);
  check("Envoi : « Demande envoyée »", result?.includes("Demande envoyée") ?? false, failure ?? "");

  await page.click("text=Envoyer une autre demande").catch(() => {});
  await wait(300);
  check("Nouvelle demande : formulaire réinitialisé", (await page.inputValue("input[name='name']")) === "");

  // Visionneuse
  await page.evaluate(() => document.getElementById("realisations").scrollIntoView());
  await wait(1500);
  await page.click(".proj-frame >> nth=0");
  await wait(600);
  check("Visionneuse ouverte", await page.evaluate(() => document.querySelector("dialog.viewer")?.open === true));
  await page.click(".viewer-nav button[aria-label='Réalisation suivante']");
  await wait(200);
  check("Visionneuse : suivant", (await page.textContent(".viewer-title"))?.includes("02"));
  await page.keyboard.press("Escape");
  await wait(500);
  check("Visionneuse : Échap ferme", await page.evaluate(() => document.querySelector("dialog.viewer")?.open === false));
  check(
    "Visionneuse : focus rendu au visuel",
    await page.evaluate(() => document.activeElement?.classList.contains("proj-frame")),
  );

  // Pages légales et retour
  await page.click(".site-footer >> text=Mentions légales");
  await page.waitForURL("**/mentions-legales");
  await wait(600);
  check("Pied de page → Mentions légales", (await page.textContent("h1"))?.includes("Mentions légales"));
  await page.click(".site-nav-links >> text=Services");
  await page.waitForURL("**/#services");
  await wait(2200);
  check("Depuis une page légale → accueil #services", Math.abs(await sectionOffset(page, "services")) < 120);

  await page.goto(BASE_URL + "/confidentialite", { waitUntil: "networkidle" });
  check("Confidentialité", (await page.textContent("h1"))?.includes("Confidentialité"));

  const res404 = await page.goto(BASE_URL + "/page-inexistante", { waitUntil: "networkidle" });
  check("404 : statut et titre", res404?.status() === 404 && ((await page.textContent("h1")) ?? "").includes("Circuit"));

  // Lien d'évitement
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  const skip = await page.evaluate(() => document.activeElement?.textContent);
  check("Clavier : premier Tab = lien d'évitement", skip === "Aller au contenu");

  check("Desktop : aucune erreur console", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ── Mobile : menu plein écran, CTA collant ────────────────────────────── */
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await wait(2400);

  await page.click(".menu-toggle");
  await wait(700);
  check("Menu mobile : ouvert", await page.isVisible("#mobile-menu"));
  check(
    "Menu mobile : focus sur « Fermer »",
    await page.evaluate(() => document.activeElement?.classList.contains("menu-close")),
  );
  check(
    "Menu mobile : page inerte",
    await page.evaluate(() => document.getElementById("contenu")?.hasAttribute("inert")),
  );
  await page.keyboard.press("Escape");
  await wait(700);
  check("Menu mobile : Échap ferme", !(await page.isVisible("#mobile-menu")));

  await page.click(".menu-toggle");
  await wait(800);
  await page.click(".menu-link >> text=Contact");
  await wait(2600);
  check("Menu mobile → #contact", Math.abs(await sectionOffset(page, "contact")) < 60, `top=${await sectionOffset(page, "contact")}`);

  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(900);
  const hiddenAtTop = !(await page.evaluate(() => document.querySelector(".sticky-cta")?.classList.contains("is-visible")));
  await page.evaluate(() => window.scrollTo(0, document.getElementById("services").offsetTop));
  await wait(900);
  const visibleMid = await page.evaluate(() => document.querySelector(".sticky-cta")?.classList.contains("is-visible"));
  check("CTA collant : masqué en haut, visible après le hero", hiddenAtTop && visibleMid);

  check("Mobile : aucune erreur", errors.length === 0, errors.join(" | "));
  await context.close();
}

/* ── Animations réduites : tout est visible sans défiler ───────────────── */
for (const width of [390, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(BASE_URL + "/", { waitUntil: "networkidle" });
  await wait(400);
  const hidden = await page.$$eval("[data-reveal]", (els) =>
    els.filter((e) => getComputedStyle(e).visibility === "hidden" || getComputedStyle(e).opacity === "0").length,
  );
  const lenis = await page.evaluate(() => document.documentElement.classList.contains("lenis"));
  check(`Animations réduites (${width}px) : contenus visibles, pas de smooth scroll`, hidden === 0 && !lenis, `masqués=${hidden}`);
  await context.close();
}

/* ── Sans JavaScript ───────────────────────────────────────────────────── */
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(BASE_URL + "/", { waitUntil: "load" });
  const hidden = await page.$$eval("[data-reveal]", (els) =>
    els.filter((e) => getComputedStyle(e).visibility === "hidden").length,
  );
  const sections = await page.$$eval("main section", (els) => els.length);
  check("Sans JavaScript : contenu complet et visible", hidden === 0 && sections === 9, `masqués=${hidden}, sections=${sections}`);
  await context.close();
}

await browser.close();
console.log(results.join("\n"));
console.log(failures ? `\n${failures} échec(s)` : "\nTous les parcours passent.");
process.exit(failures ? 1 : 0);
