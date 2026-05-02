import { defineConfig } from 'astro/config'

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  server: {
    host: '127.0.0.1',
  },

  devToolbar: {
    enabled: false,
  },

  adapter: cloudflare(),
})