import { encode } from 'blurhash'
import { readdir, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import sharp from 'sharp'

const CONTENT_DIR = resolve(process.cwd(), 'content/projects')
const IMAGE_EXT = /\.(png|jpe?g)$/i
const BH_WIDTH = 64 // encode from a small version for speed
const BH_COMPONENTS_X = 4
const BH_COMPONENTS_Y = 3

interface ImageMeta {
  width: number
  height: number
  blurhash: string
}

async function processImage(filePath: string): Promise<ImageMeta> {
  const image = sharp(filePath)
  const { width: origWidth, height: origHeight } = await image.metadata()

  if (!origWidth || !origHeight) {
    throw new Error(`Cannot read dimensions: ${filePath}`)
  }

  const aspectRatio = origHeight / origWidth
  const bhHeight = Math.max(1, Math.round(BH_WIDTH * aspectRatio))

  const { data } = await sharp(filePath)
    .resize(BH_WIDTH, bhHeight)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const blurhash = encode(
    new Uint8ClampedArray(data),
    BH_WIDTH,
    bhHeight,
    BH_COMPONENTS_X,
    BH_COMPONENTS_Y,
  )

  return { width: origWidth, height: origHeight, blurhash }
}

const projects = await readdir(CONTENT_DIR, { withFileTypes: true })

for (const entry of projects) {
  if (!entry.isDirectory()) {
    continue
  }

  const imagesDir = join(CONTENT_DIR, entry.name, 'images')
  let files: string[]

  try {
    files = await readdir(imagesDir)
  } catch {
    continue
  }

  const imageFiles = files.filter(f => IMAGE_EXT.test(f)).toSorted()
  if (imageFiles.length === 0) {
    continue
  }

  const metadata: Record<string, ImageMeta> = {}
  let processed = 0

  for (const filename of imageFiles) {
    const filePath = join(imagesDir, filename)
    try {
      metadata[filename] = await processImage(filePath)
      processed++
      process.stdout.write(`\r${entry.name}: ${processed}/${imageFiles.length}`)
    } catch (error) {
      process.stderr.write(`\nSkipped ${filename}: ${String(error)}\n`)
    }
  }

  const outPath = join(CONTENT_DIR, entry.name, 'metadata.json')
  await writeFile(outPath, JSON.stringify(metadata, null, 2) + '\n')
  process.stdout.write(`\n✓ ${entry.name} → metadata.json\n`)
}
