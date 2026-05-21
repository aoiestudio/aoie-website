import type { APIRoute } from 'astro'
import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

export const prerender = false

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
}

export const GET: APIRoute = async ({ params }) => {
  // Guard: serve files only in local mode (no imgproxy configured).
  // Mirrors isLocalMode() in imgproxy-service.ts.
  if (
    import.meta.env.PUBLIC_IMAGE_MODE === 'imgproxy' &&
    import.meta.env.IMGPROXY_ENDPOINT
  ) {
    return new Response('Not found', { status: 404 })
  }

  const filePath = join(process.cwd(), 'content', params.path ?? '')
  try {
    const file = await readFile(filePath)
    const mime =
      MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
    return new Response(file, { headers: { 'Content-Type': mime } })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
