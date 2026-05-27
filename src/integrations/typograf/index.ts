import type { AstroIntegration } from 'astro'

export interface TypografOptions {
  /** Typograf locale(s). Default: ['en-US'] */
  locale?: string[]
  /** HTML entity output type. Default: 'digit' */
  htmlEntity?: 'digit' | 'name' | 'js' | 'default'
}

export default function typografIntegration(
  _options: TypografOptions = {},
): AstroIntegration {
  return {
    name: 'astro-typograf',
    hooks: {
      'astro:config:setup': ({ addMiddleware }) => {
        addMiddleware({
          entrypoint: new URL('middleware.ts', import.meta.url),
          order: 'post',
        })
      },
    },
  }
}
