import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const SOURCE = path.join(root, 'src/assets/logo-favicon-source.png')
const OUT_PUBLIC = path.join(root, 'public')
const OUT_ASSETS = path.join(root, 'src/assets/favicon_io')

/** Logo ocupa ~94% do canvas — menos margem = parece maior na aba. */
const FILL_RATIO = 0.94
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 }

const SIZES = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
]

async function prepareSourceLogo() {
  const image = sharp(SOURCE)
  const meta = await image.metadata()

  const trimmed = await image
    .trim({ threshold: 10 })
    .png()
    .toBuffer()

  return sharp(trimmed).resize({
    width: meta.width,
    height: meta.height,
    fit: 'inside',
    withoutEnlargement: false,
  })
}

async function renderIcon(sourceBuffer, size) {
  const logoSize = Math.max(1, Math.round(size * FILL_RATIO))

  return sharp(sourceBuffer)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: TRANSPARENT,
    })
    .extend({
      top: Math.floor((size - logoSize) / 2),
      bottom: Math.ceil((size - logoSize) / 2),
      left: Math.floor((size - logoSize) / 2),
      right: Math.ceil((size - logoSize) / 2),
      background: TRANSPARENT,
    })
    .png()
    .toBuffer()
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error('Arquivo fonte não encontrado:', SOURCE)
    process.exit(1)
  }

  fs.mkdirSync(OUT_PUBLIC, { recursive: true })
  fs.mkdirSync(OUT_ASSETS, { recursive: true })

  const sourceBuffer = await prepareSourceLogo().then((img) => img.png().toBuffer())

  const pngBuffers = {}

  for (const { name, size } of SIZES) {
    const buffer = await renderIcon(sourceBuffer, size)
    pngBuffers[name] = buffer

    for (const dir of [OUT_PUBLIC, OUT_ASSETS]) {
      fs.writeFileSync(path.join(dir, name), buffer)
    }

    console.log(`✓ ${name} (${size}px)`)
  }

  const icoBuffer = await pngToIco([
    pngBuffers['favicon-16x16.png'],
    pngBuffers['favicon-32x32.png'],
  ])

  for (const dir of [OUT_PUBLIC, OUT_ASSETS]) {
    fs.writeFileSync(path.join(dir, 'favicon.ico'), icoBuffer)
  }

  console.log('✓ favicon.ico')

  const manifest = {
    name: 'GuiMe Money',
    short_name: 'GuiMe',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  }

  fs.writeFileSync(
    path.join(OUT_PUBLIC, 'site.webmanifest'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  console.log('✓ site.webmanifest')
  console.log('\nFavicons gerados em public/ e src/assets/favicon_io/')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
