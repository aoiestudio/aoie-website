import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import { defineConfig, fontProviders } from 'astro/config'
import typograf from './src/integrations/typograf'

export default defineConfig({
  output: 'static',
  integrations: [mdx(), typograf()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist Variable',
      cssVariable: '--font-geist',
      fallbacks: ['sans-serif'],
      options: {
        variants: [
          {
            weight: '100 900',
            style: 'normal',
            src: ['./src/assets/fonts/Geist-Variable.woff2'],
            display: 'swap',
          },
        ],
      },
    },
  ],
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
