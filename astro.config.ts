import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import { defineConfig, fontProviders } from 'astro/config'
import typograf from './src/integrations/typograf'

export default defineConfig({
  site: 'https://aoiestudio.ru',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [mdx(), sitemap(), typograf()],

  prefetch: {
    defaultStrategy: 'hover',
  },

  server: {
    host: '0.0.0.0',
  },

  vite: {
    server: {
      proxy: {
        '/_img': {
          target: 'https://aoiestudio.ru',
          changeOrigin: true,
        },
      },
    },
  },

  devToolbar: {
    enabled: false,
  },

  image: {
    service: {
      entrypoint: './src/lib/imgproxy-service.ts',
    },
  },

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
})
