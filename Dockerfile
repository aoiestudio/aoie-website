FROM node:26-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

COPY package.json ./package.json
RUN npm install -g corepack
RUN corepack enable pnpm
RUN corepack install


FROM base AS installer

ENV SKIP_INSTALL_SIMPLE_GIT_HOOKS=1

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch
RUN pnpm install --offline --frozen-lockfile


FROM installer AS builder

ARG PUBLIC_IMAGE_MODE=imgproxy
ARG IMGPROXY_ENDPOINT
ARG IMGPROXY_KEY
ARG IMGPROXY_SALT
ARG S3_BUCKET

ENV PUBLIC_IMAGE_MODE=$PUBLIC_IMAGE_MODE
ENV IMGPROXY_ENDPOINT=$IMGPROXY_ENDPOINT
ENV IMGPROXY_KEY=$IMGPROXY_KEY
ENV IMGPROXY_SALT=$IMGPROXY_SALT
ENV S3_BUCKET=$S3_BUCKET

COPY . ./
RUN pnpm run build


FROM base

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/package.json /app/package.json

HEALTHCHECK CMD curl -f http://localhost:4321 || exit 1

CMD ["node", "./dist/server/entry.mjs"]
