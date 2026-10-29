import { NextRequest } from 'next/server'

const ALLOWED_HOSTS = new Set(['html.scribdassets.com', 'html.scribd.com'])

/**
 * Proxies a Scribd CDN image through our origin so the browser can read its
 * bytes cross-origin (the CDN image responses carry no ACAO header). We add
 * `Access-Control-Allow-Origin: *` and cache aggressively.
 */
export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get('u')
  if (!u) return new Response('missing u', { status: 400 })

  let url: URL
  try {
    url = new URL(u)
  } catch {
    return new Response('bad u', { status: 400 })
  }
  if (!ALLOWED_HOSTS.has(url.hostname)) {
    return new Response('disallowed host', { status: 403 })
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: 'https://www.scribd.com/',
      },
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return new Response('upstream ' + res.status, { status: 502 })
    const buf = await res.arrayBuffer()
    const ct = res.headers.get('content-type') || 'image/jpeg'
    return new Response(buf, {
      headers: {
        'Content-Type': ct,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
      },
    })
  } catch {
    return new Response('proxy error', { status: 502 })
  }
}
