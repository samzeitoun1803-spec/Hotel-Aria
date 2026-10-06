/**
 * Maquette cliquable : le site en une seule page HTML autonome, pour le présenter avant la mise en ligne.
 *
 *   npm run maquette  →  dist-maquette/maquette.html  (+ dist-maquette/images/)
 *
 * Mode « maquette » (.env.maquette, src/lib/demo.ts) : bandeau « Maquette » permanent, avis d'exemple
 * signalés comme fictifs, formulaires qui n'envoient rien, pas de carte Google intégrée.
 * La page est un fragment HTML (sans <html>, <head> ni <body>), prêt à être enveloppé par l'hébergeur
 * de la présentation : CSS, JavaScript et polices sont intégrés ; seules les illustrations restent à côté.
 */
import { build } from 'vite'
import { readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.resolve(root, process.argv[2] || 'dist-maquette')
const ssrOut = path.join(root, 'node_modules/.prerender-maquette')
const mode = 'maquette'

// 1. Build client (un seul fichier JavaScript) puis rendu HTML de la page, dans le même mode.
await build({ root, mode, logLevel: 'warn', build: { outDir: out, emptyOutDir: true } })
await build({
  root,
  mode,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: ssrOut, emptyOutDir: true, rolldownOptions: { output: { codeSplitting: false } } },
})
const { render } = await import(pathToFileURL(path.join(ssrOut, 'entry-server.js')).href)
const appHtml = render()
await rm(ssrOut, { recursive: true, force: true })

// 2. Fichiers produits par le build.
const index = await readFile(path.join(out, 'index.html'), 'utf8')
const jsFile = index.match(/<script type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"/)?.[1]
const cssFile = index.match(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"/)?.[1]
if (!jsFile || !cssFile) throw new Error('JavaScript ou CSS introuvable dans le build')
const assets = await readdir(path.join(out, 'assets'))
if (assets.filter((f) => f.endsWith('.js')).length !== 1) throw new Error('Le build de la maquette doit tenir en un seul fichier JavaScript')
let js = await readFile(path.join(out, jsFile), 'utf8')
let css = await readFile(path.join(out, cssFile), 'utf8')

// 3. Polices intégrées (data URI) : seulement les jeux de caractères dont la page a besoin.
//    Pour un caractère couvert par plusieurs jeux, le navigateur prend le dernier déclaré.
const used = [...new Set([...(appHtml + js)].map((c) => c.codePointAt(0)))]
const covers = (range) => {
  const parts = range.split(',').map((part) => {
    const [a, b] = part.trim().replace(/^U\+/i, '').split('-')
    return [parseInt(a.replace(/\?/g, '0'), 16), b ? parseInt(b, 16) : parseInt(a.replace(/\?/g, 'F'), 16)]
  })
  return (cp) => parts.some(([lo, hi]) => cp >= lo && cp <= hi)
}
const faces = (css.match(/@font-face\{[^}]*\}/g) ?? []).map((rule) => ({
  rule,
  family: rule.match(/font-family:([^;}]+)/)?.[1].trim(),
  url: rule.match(/url\(([^)]+\.woff2)\)/)?.[1],
  covers: covers(rule.match(/unicode-range:([^;}]+)/)?.[1] ?? 'U+0-10FFFF'),
}))
const kept = []
for (const [i, face] of faces.entries()) {
  const later = faces.slice(i + 1).filter((f) => f.family === face.family)
  const needed = face.url && used.some((cp) => face.covers(cp) && !later.some((f) => f.covers(cp)))
  if (!needed) {
    css = css.replace(face.rule, '')
    continue
  }
  const file = path.basename(face.url.replace(/["']/g, ''))
  const data = (await readFile(path.join(out, 'assets', file))).toString('base64')
  css = css.replace(face.rule, face.rule.replace(face.url, `data:font/woff2;base64,${data}`))
  kept.push(file)
}

// 4. Compatibilité avec la page hôte : son reset est hors couche CSS et passerait devant les styles du site.
css += `
body{margin:0;padding:0;font:inherit;font-size:1.0625rem;line-height:1.61;background:var(--color-ivory);color:inherit}
@media (min-width:768px){body{font-size:1.125rem}}`

// 5. Assemblage. Le script en ligne ne doit pas contenir de séquence qui fermerait la balise <script>.
const inlineScript = index.match(/<script>([\s\S]*?)<\/script>/)?.[1]?.trim()
if (!inlineScript) throw new Error('Script d’initialisation introuvable dans index.html')
js = js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--')
const fragment = `<title>Maquette Jasmin Voyages</title>
<style>${css}</style>
<script>document.documentElement.lang='fr';${inlineScript}</script>
<div id="root">${appHtml}</div>
<script type="module">${js}</script>
`
await writeFile(path.join(out, 'maquette.html'), fragment)
await rm(path.join(out, 'assets'), { recursive: true, force: true })
await rm(path.join(out, 'index.html'))
for (const f of ['favicon.svg', 'apple-touch-icon.png', 'og-image.jpg', 'robots.txt', '404.html']) await rm(path.join(out, f), { force: true })

const images = await readdir(path.join(out, 'images'))
console.log(
  `✓ maquette : ${path.relative(root, path.join(out, 'maquette.html'))} (${Math.round(fragment.length / 1024)} Ko, polices : ${kept.join(', ')}) + ${images.length} illustrations dans ${path.relative(root, path.join(out, 'images'))}/`,
)
