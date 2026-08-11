/* global Request, Response, URL */

const HTML_ACCEPT = 'text/html'

export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response('Static assets binding is unavailable.', { status: 500 })
    }

    const response = await env.ASSETS.fetch(request)
    const acceptsHtml = request.headers.get('accept')?.includes(HTML_ACCEPT)
    const canUseSpaFallback = request.method === 'GET' || request.method === 'HEAD'

    if (response.status !== 404 || !acceptsHtml || !canUseSpaFallback) {
      return response
    }

    const indexUrl = new URL('/index.html', request.url)
    return env.ASSETS.fetch(new Request(indexUrl, request))
  },
}
