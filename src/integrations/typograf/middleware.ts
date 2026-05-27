import { defineMiddleware } from 'astro:middleware'
import Typograf from 'typograf'
import { config } from './config'

const tp = new Typograf({
  locale: config.locale,
  htmlEntity: { type: config.htmlEntity },
})

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next()

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html')) {
    return response
  }

  const html = await response.text()
  const result = tp.execute(html)

  return new Response(result, {
    status: response.status,
    headers: response.headers,
  })
})
