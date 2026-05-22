import type { ExternalImageService, ImageTransform } from 'astro'
import { generateImageUrl } from '@imgproxy/imgproxy-node'
import { baseService } from 'astro/assets'

// Last-resort fallback when imageConfig.service.config.sizes is not set.
// Configure via astro.config.ts: image.service.config.sizes
const DEFAULT_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const

// Astro uses 'jpeg'; imgproxy uses 'jpg' — normalise here.
type ImgproxyFormat = 'avif' | 'webp' | 'png' | 'jpg'

function toImgproxyFormat(format: string | undefined): ImgproxyFormat {
  if (format === 'jpeg') {
    return 'jpg'
  }
  if (
    format === 'avif' ||
    format === 'webp' ||
    format === 'png' ||
    format === 'jpg'
  ) {
    return format
  }
  return 'webp'
}

function isLocalMode(): boolean {
  return (
    import.meta.env.PUBLIC_IMAGE_MODE !== 'imgproxy' ||
    !import.meta.env.IMGPROXY_ENDPOINT
  )
}

const service: ExternalImageService = {
  // baseService.validateOptions calls verifyOptions() which rejects src strings that
  // are not remote URLs or don't start with '/'. Our src is an internal path like
  // "projects/atom/images/01.jpg", so we implement only the relevant subset:
  //   — widths + densities together → error (incompatible descriptors)
  //   — set format default (webp) when omitted
  //   — round width/height to integers
  validateOptions(options: ImageTransform): ImageTransform {
    if (options.widths && options.densities) {
      throw new Error(
        'Cannot use both `widths` and `densities` on the same image.',
      )
    }
    return {
      ...options,
      format: options.format ?? 'webp',
      width:
        options.width === undefined ? undefined : Math.round(options.width),
      height:
        options.height === undefined ? undefined : Math.round(options.height),
    }
  },

  // Delegates to baseService:
  //   — strips widths, densities, formats, layout, fit, position, background
  //   — includes width/height only when explicitly provided
  //   — sets loading=lazy, decoding=async defaults
  getHTMLAttributes: baseService.getHTMLAttributes,

  // options.src is a path string: "projects/{project}/images/{filename}"
  getURL(options) {
    const src = typeof options.src === 'string' ? options.src : options.src.src
    const width = options.width ?? 1920
    const format = toImgproxyFormat(options.format)

    if (isLocalMode()) {
      // Dev: /img/[...path].ts serves originals from disk — no resize needed.
      return `/img/${src}`
    }

    return generateImageUrl({
      endpoint: import.meta.env.IMGPROXY_ENDPOINT,
      key: import.meta.env.IMGPROXY_KEY,
      salt: import.meta.env.IMGPROXY_SALT,
      url: `s3://${import.meta.env.S3_BUCKET}/${src}`,
      options: {
        resize: { width, height: 0, resizing_type: 'fill' },
        format,
      },
    })
  },

  getSrcSet(options, imageConfig) {
    // Local mode: /img/ serves the original file at any "size" — srcset would
    // produce identical URLs with different descriptors, which is pointless.
    if (isLocalMode()) {
      return []
    }

    const { widths, densities } = options

    // densities: e.g. <Image densities={[1, 2, 3]} /> → 1x 2x 3x descriptors
    if (densities) {
      const base = options.width ?? 1920
      const parsed = densities
        .map(d => (typeof d === 'number' ? d : Number.parseFloat(d)))
        .toSorted((a, b) => a - b)
      return parsed.map(d => ({
        transform: { ...options, width: Math.round(base * d) },
        descriptor: `${d}x`,
      }))
    }

    // widths: e.g. <Image widths={[400, 800, 1200]} /> → 400w 800w 1200w descriptors
    // fallback: configured sizes, then built-in defaults
    const configSizes = imageConfig.service.config?.sizes
    const fallback: number[] = Array.isArray(configSizes)
      ? configSizes
      : [...DEFAULT_SIZES]
    const resolvedWidths: number[] = widths?.length
      ? widths.toSorted((a, b) => a - b)
      : fallback

    return resolvedWidths.map(w => ({
      transform: { ...options, width: w },
      descriptor: `${w}w`,
    }))
  },
}

export default service
