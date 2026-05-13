import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import { defineConfig } from 'astro/config'

export default defineConfig({
  output: 'server',
  integrations: [mdx()],
  server: {
    host: '0.0.0.0',
  },

  devToolbar: {
    enabled: false,
  },

  adapter: node({ mode: 'standalone' }),
})
