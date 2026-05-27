import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import { defineConfig } from 'astro/config'
import typograf from './src/integrations/typograf'

export default defineConfig({
  output: 'static',
  integrations: [mdx(), typograf()],
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
