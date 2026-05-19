#!/usr/bin/env sh
set -e
# Load .env from project root if it exists (doesn't override already-set vars)
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ENV_FILE="$SCRIPT_DIR/../.env"
if [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  set -a && . "$ENV_FILE" && set +a
fi
: "${S3_BUCKET:?S3_BUCKET is not set}"
: "${S3_ENDPOINT:?S3_ENDPOINT is not set}"
aws s3 sync "s3://${S3_BUCKET}/projects/" ./content/projects/ \
  --endpoint-url "${S3_ENDPOINT}" \
  --exclude "*.mdx"
