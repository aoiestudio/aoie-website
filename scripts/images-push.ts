import { S3Client } from '@aws-sdk/client-s3'
import { S3SyncClient, TransferMonitor } from 's3-sync-client'

const { S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env

if (!S3_BUCKET) {
  throw new Error('S3_BUCKET is not set')
}
if (!S3_ENDPOINT) {
  throw new Error('S3_ENDPOINT is not set')
}
if (!S3_ACCESS_KEY) {
  throw new Error('S3_ACCESS_KEY is not set')
}
if (!S3_SECRET_KEY) {
  throw new Error('S3_SECRET_KEY is not set')
}

const IMAGE_EXT = /\.(jpg|jpeg|png)$/i

const client = new S3Client({
  endpoint: S3_ENDPOINT,
  region: 'ru-1',
  credentials: { accessKeyId: S3_ACCESS_KEY, secretAccessKey: S3_SECRET_KEY },
  forcePathStyle: true,
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

const s3 = new S3SyncClient({ client })
const monitor = new TransferMonitor()

monitor.on('progress', () => {
  const { count, size } = monitor.getStatus()
  const mb = (size.current / 1024 / 1024).toFixed(1)
  const total = (size.total / 1024 / 1024).toFixed(1)
  process.stdout.write(
    `\r↑ ${count.current}/${count.total} files  ${mb}/${total} MB`,
  )
})

await s3.sync('./content/projects', `s3://${S3_BUCKET}/projects`, {
  del: true,
  monitor,
  filters: [{ exclude: key => !IMAGE_EXT.test(key) }],
})

process.stdout.write('\n')
