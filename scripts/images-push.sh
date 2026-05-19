#!/usr/bin/env sh
set -e
: "${S3_BUCKET:?S3_BUCKET is not set}"
: "${S3_ENDPOINT:?S3_ENDPOINT is not set}"
aws s3 sync ./content/projects/ "s3://${S3_BUCKET}/projects/" \
  --endpoint-url "${S3_ENDPOINT}" \
  --exclude "*.mdx" \
  --exclude ".DS_Store"
