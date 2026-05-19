#!/usr/bin/env sh
set -e
[ -f .env ] && . ./.env
: "${S3_BUCKET:?S3_BUCKET is not set}"
: "${S3_ENDPOINT:?S3_ENDPOINT is not set}"
aws s3 sync "s3://${S3_BUCKET}/projects/" ./content/projects/ \
  --endpoint-url "${S3_ENDPOINT}" \
  --exclude "*.mdx"
