import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

import { minify } from 'html-minifier'

export default class HtmlMinifierMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    await next()

    const method = request.method()
    const accepts = request.accepts([]) ?? ([] as string[])
    const isXml = request.url().endsWith('.xml')

    // if not GET request or doesn't expect HTML or is XML, then exit
    // since await next() already ran, we're safe to just return here to exit
    if (method !== 'GET' || !accepts.includes('text/html') || isXml) {
      return
    }

    // get the minified HTML of our current response body
    const minifiedBody = minify(response.getBody(), {
      minifyCSS: true,
      minifyJS: true,
      removeComments: true,
      collapseWhitespace: true,
    })

    response.send(minifiedBody)
  }
}
