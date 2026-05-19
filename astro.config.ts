import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'static',
  integrations: [mdx()],
  server: {
    host: '0.0.0.0',
  },

  devToolbar: {
    enabled: false,
  },

  // Sharp image processing is disabled — images are served via imgproxy in prod
  // and via the /_img/[...path].ts endpoint in dev.
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },

  adapter: node({ mode: 'standalone' }),
})
