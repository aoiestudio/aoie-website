import { generateImageUrl } from '@imgproxy/imgproxy-node'

// Subset of imgproxy Format that this project actually uses
export type Format = 'avif' | 'webp' | 'png' | 'jpg'

// Responsive breakpoints. Kept in sync with the CSS `sizes` attribute used in ProjectImage.
export const SIZES = [640, 960, 1280, 1440, 1920, 2560] as const

export function getImageUrl(
  project: string,
  filename: string,
  options: { width: number; format: Format },
): string {
  // In local dev, the /_img/[...path].ts endpoint serves files straight from disk.
  // No Docker, no imgproxy needed.
  if (import.meta.env.PUBLIC_IMAGE_MODE === 'local') {
    return `/_img/projects/${project}/images/${filename}`
  }

  return generateImageUrl({
    endpoint: import.meta.env.IMGPROXY_ENDPOINT,
    url: `s3://${import.meta.env.S3_BUCKET}/projects/${project}/images/${filename}`,
    options: {
      // height: 0 means proportional scaling
      resize: { width: options.width, height: 0, resizing_type: 'fill' },
      format: options.format,
    },
  })
}

export function getSrcset(
  project: string,
  filename: string,
  format: Format,
): string {
  return SIZES.map(
    w => `${getImageUrl(project, filename, { width: w, format })} ${w}w`,
  ).join(', ')
}
