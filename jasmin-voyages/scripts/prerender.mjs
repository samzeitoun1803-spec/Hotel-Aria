/**
 * Pré-rendu statique : après `vite build`, génère le HTML de la page avec React
 * et l'insère dans dist/index.html. Le contenu est ainsi lisible immédiatement,
 * par les visiteurs comme par les moteurs de recherche, même sans JavaScript.
 */
import { build } from 'vite'
import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'node_modules/.prerender')
const dist = path.resolve(root, process.argv[2] || 'dist')

await build({
  root,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir, emptyOutDir: true, rolldownOptions: { output: { codeSplitting: false } } },
})

const { render } = await import(pathToFileURL(path.join(outDir, 'entry-server.js')).href)
const htmlPath = path.join(dist, 'index.html')
const template = await readFile(htmlPath, 'utf8')
if (!template.includes('<div id="root"></div>')) throw new Error('Point d’insertion <div id="root"></div> introuvable')

let html = template.replace('<div id="root"></div>', `<div id="root">${render()}</div>`)

// CSS intégré à la page : un aller-retour réseau de moins avant le premier affichage.
const cssLink = html.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (cssLink) {
  const css = await readFile(path.join(dist, cssLink[1]), 'utf8')
  html = html.replace(cssLink[0], () => `<style>${css}</style>`)
}

// Préchargement de la police du mot-symbole (Inter Tight, jeu latin).
const assets = await readdir(path.join(dist, 'assets'))
const font = assets.find((f) => /^inter-tight-latin-wght-normal-.*\.woff2$/.test(f))
if (font) html = html.replace('</title>', `</title>\n    <link rel="preload" as="font" type="font/woff2" href="/assets/${font}" crossorigin />`)
await writeFile(htmlPath, html)
await rm(outDir, { recursive: true, force: true })
console.log(`✓ pré-rendu : ${path.relative(root, htmlPath)} (${Math.round(html.length / 1024)} Ko)`)
