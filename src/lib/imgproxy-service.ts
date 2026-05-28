import type { ExternalImageService, ImageTransform } from 'astro'
import { generateImageUrl } from '@imgproxy/imgproxy-node'
import { baseService } from 'astro/assets'

// Last-resort fallback when imageConfig.service.config.sizes is not set.
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

const service: ExternalImageService = {
  validateOptions(options: ImageTransform) {
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

  getHTMLAttributes: baseService.getHTMLAttributes,

  getURL(options, imageConfig) {
    const config = imageConfig.service.config
    const src = typeof options.src === 'string' ? options.src : options.src.src
    const width = options.width ?? 1920
    const format = toImgproxyFormat(options.format)

    return generateImageUrl({
      endpoint: config.endpoint,
      key: config.key,
      salt: config.salt,
      url: `${config.baseUrl}/${src}`,
      options: {
        resize: { width, height: 0, resizing_type: 'fill' },
        format,
      },
    })
  },

  getSrcSet(options, imageConfig) {
    const { widths, densities } = options

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
