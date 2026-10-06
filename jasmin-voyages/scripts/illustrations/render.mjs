/**
 * Rendu des illustrations : SVG → WebP en plusieurs largeurs (srcset).
 *
 *   node scripts/illustrations/render.mjs                 # toutes les scènes → public/images/
 *   node scripts/illustrations/render.mjs japon hero      # seulement certaines scènes
 *   node scripts/illustrations/render.mjs --preview=DIR   # + aperçus PNG 600 px dans DIR
 */
import sharp from 'sharp'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { S, rng } from './lib.mjs'
import { scenes } from './scenes.mjs'

export const WIDTHS = [640, 1024, 1600, 2400]

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const out = path.join(root, 'public/images')
const args = process.argv.slice(2)
const preview = args.find((a) => a.startsWith('--preview='))?.split('=')[1]
const only = args.filter((a) => !a.startsWith('--'))
const names = only.length ? only : Object.keys(scenes)

await mkdir(out, { recursive: true })
if (preview) await mkdir(preview, { recursive: true })

// Grain très léger : évite les aplats en escalier (banding) des grands dégradés.
// Graine fixe : régénérer une scène redonne exactement les mêmes fichiers.
const noise = Buffer.alloc(S * S * 3)
const rand = rng(20261006)
for (let i = 0; i < S * S; i++) {
  const v = Math.max(0, Math.min(255, Math.round(128 + (rand() + rand() + rand() - 1.5) * 14)))
  noise[i * 3] = noise[i * 3 + 1] = noise[i * 3 + 2] = v
}
const grain = await sharp(noise, { raw: { width: S, height: S, channels: 3 } })
  .png()
  .toBuffer()

for (const name of names) {
  const build = scenes[name]
  if (!build) throw new Error(`Scène inconnue : ${name}`)
  const t0 = Date.now()
  const svg = build()
  const base = await sharp(Buffer.from(svg), { density: 72 })
    .resize(S, S)
    .composite([{ input: grain, blend: 'soft-light' }])
    .png()
    .toBuffer()
  let total = 0
  for (const w of WIDTHS) {
    const buf = await sharp(base).resize(w, w, { kernel: 'lanczos3' }).webp({ quality: w >= 1600 ? 78 : 80, effort: 5, smartSubsample: true }).toBuffer()
    await writeFile(path.join(out, `${name}-${w}.webp`), buf)
    total += buf.length
  }
  if (preview) await sharp(base).resize(600, 600).png().toFile(path.join(preview, `${name}.png`))
  console.log(`✓ ${name.padEnd(12)} ${(total / 1024).toFixed(0).padStart(5)} Ko (${WIDTHS.length} tailles) — ${Date.now() - t0} ms`)
}
