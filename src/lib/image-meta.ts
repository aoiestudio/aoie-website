import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

interface ImageMeta {
  width: number
  height: number
  blurhash: string
}

// Cached metadata per project — loaded once at build time.
const cache = new Map<string, Record<string, ImageMeta>>()

// src format: "projects/{project}/images/{filename}"
export async function readImageMeta(
  src: string,
): Promise<ImageMeta | undefined> {
  const parts = src.split('/')
  if (parts.length < 4 || parts[0] !== 'projects') {
    return undefined
  }
  const project = parts[1]
  const filename = parts.at(-1)!

  if (!cache.has(project)) {
    const metaPath = resolve(
      process.cwd(),
      'content',
      'projects',
      project,
      'metadata.json',
    )
    try {
      const data = JSON.parse(await readFile(metaPath, 'utf8'))
      cache.set(project, data)
    } catch {
      // metadata.json missing — run `pnpm images:meta` to generate it
      cache.set(project, {})
    }
  }

  return cache.get(project)?.[filename]
}
