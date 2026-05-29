import type { ExternalImageService, ImageTransform } from 'astro'
import { generateImageUrl } from '@imgproxy/imgproxy-node'
import { baseService } from 'astro/assets'

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
    const config = imageConfig.service.config ?? {}
    const endpoint = config.endpoint ?? import.meta.env.IMGPROXY_ENDPOINT
    const key = config.key ?? import.meta.env.IMGPROXY_KEY
    const salt = config.salt ?? import.meta.env.IMGPROXY_SALT
    const baseUrl = config.baseUrl ?? `s3://${import.meta.env.S3_BUCKET}`

    const src = typeof options.src === 'string' ? options.src : options.src.src
    const width = options.width ?? 1920
    const format = toImgproxyFormat(options.format)

    return generateImageUrl({
      endpoint,
      key,
      salt,
      url: `${baseUrl}/${src}`,
      options: {
        resize: { width, height: 0, resizing_type: 'fill' },
        format,
      },
    })
  },

  getSrcSet: baseService.getSrcSet,
}

export default service
