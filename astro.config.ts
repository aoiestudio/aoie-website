import node from '@astrojs/node'
import { defineConfig } from 'astro/config'

export default defineConfig({
  server: {
    host: '0.0.0.0',
  },

  devToolbar: {
    enabled: false,
  },

  adapter: node({ mode: 'standalone' }),
})
