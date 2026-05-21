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

  image: {
    service: {
      entrypoint: './src/lib/imgproxy-service.ts',
    },
  },

  adapter: node({ mode: 'standalone' }),
})
