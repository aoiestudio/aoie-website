import { generateImageUrl } from '@imgproxy/imgproxy-node'

export function buildImageUrl(
  path: string,
  width = 1920,
  format: 'avif' | 'webp' = 'avif',
): string {
  return generateImageUrl({
    endpoint: import.meta.env.IMGPROXY_ENDPOINT,
    key: import.meta.env.IMGPROXY_KEY,
    salt: import.meta.env.IMGPROXY_SALT,
    url: `s3://${import.meta.env.S3_BUCKET}/${path}`,
    options: {
      resize: { width, height: 0, resizing_type: 'fill' },
      format,
    },
  })
}
