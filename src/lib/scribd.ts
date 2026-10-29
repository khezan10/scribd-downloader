/**
 * Isomorphic Scribd parsing utilities (run in browser and Node alike).
 * Pure functions; no external deps. Operate on text captured from Scribd's
 * CDN (html.scribdassets.com) and the document page / token HTML.
 */

export interface PageSpan {
  top: number
  left: number
  text: string
}

export interface ParsedPage {
  width: number
  height: number
  /** If this page is a scanned image layer, the (https) image URL. */
  imageUrl: string | null
  /** If a text layer, the text lines grouped roughly by visual row. */
  lines: string[]
}

const JSONP_RE = /callback\(\["(.*)"\]\)/s

/** Unescape a Scribd JSONP body into the raw page HTML string. */
export function parseJsonp(raw: string): string {
  const m = raw.match(JSONP_RE)
  if (!m) return raw
  try {
    // The captured group is a JSON string literal -> parse it.
    return JSON.parse('"' + m[1] + '"') as string
  } catch {
    return m[1].replace(/\\"/g, '"').replace(/\\n/g, '\n')
  }
}

/**
 * Parse one page's HTML (from a JSONP body) into dimensions, an optional scan
 * image URL, and/or positioned text lines.
 */
export function parsePageHtml(html: string): ParsedPage {
  const width = parseInt((html.match(/width:\s*(\d+)\s*px/) || [])[1] || '0', 10)
  const height = parseInt((html.match(/height:\s*(\d+)\s*px/) || [])[1] || '0', 10)

  // Image layer (scanned pages): <img ... orig="http://html.scribd.com/...">
  let imageUrl: string | null = null
  const orig = html.match(/<img[^>]*\borig="([^"]+)"/i)
  if (orig) imageUrl = orig[1]
  if (!imageUrl) {
    const bg = html.match(
      /background-image\s*:\s*url\(["']?(https?:\/\/[^"')\s]+\.(?:jpg|jpeg|png|webp)[^"')\s]*)["']?\)/i
    )
    if (bg) imageUrl = bg[1]
  }
  if (imageUrl) imageUrl = imageUrl.replace(/^http:\/\//i, 'https://')

  // Text layer: <span class="a" style="left:..px;top:..px">text</span>
  const spans: PageSpan[] = []
  const spanRe =
    /<span[^>]*class=["']?a["']?[^>]*style="([^"]*)"[^>]*>([\s\S]*?)<\/span>/g
  let mm: RegExpExecArray | null
  while ((mm = spanRe.exec(html))) {
    const style = mm[1]
    const left = parseFloat((style.match(/left:\s*(-?\d+(?:\.\d+)?)px/) || [])[1] ?? 'NaN')
    const top = parseFloat((style.match(/top:\s*(-?\d+(?:\.\d+)?)px/) || [])[1] ?? 'NaN')
    if (Number.isNaN(left) || Number.isNaN(top)) continue
    const text = mm[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) spans.push({ top, left, text })
  }

  spans.sort((a, b) => a.top - b.top || a.left - b.left)
  const TOL = 40
  const groups: PageSpan[][] = []
  let cur: PageSpan[] = []
  let last = -Infinity
  for (const s of spans) {
    if (cur.length && s.top - last > TOL) {
      groups.push(cur)
      cur = []
    }
    cur.push(s)
    last = s.top
  }
  if (cur.length) groups.push(cur)

  const lines = groups.map((g) =>
    g
      .slice()
      .sort((a, b) => a.left - b.left)
      .map((s) => s.text)
      .join(' ')
  )

  return { width, height, imageUrl, lines }
}

/** Extract the numeric Scribd document id from any known URL shape. */
export function extractDocId(url: string): string | null {
  const m = url.match(/scribd\.com\/(?:doc|document|read|embeds)\/(\d+)/i)
  return m ? m[1] : null
}

/** Sort a set of page JSONP urls by page number. */
export function sortPageUrls(urls: string[]): string[] {
  return urls.slice().sort((a, b) => {
    const na = parseInt(a.match(/(\d+)-[0-9a-f]+\.jsonp$/)?.[1] ?? '0', 10)
    const nb = parseInt(b.match(/(\d+)-[0-9a-f]+\.jsonp$/)?.[1] ?? '0', 10)
    return na - nb
  })
}

/** Extract unique, page-ordered JSONP urls from a Scribd token/document HTML. */
export function extractUrlsFromTokenHtml(html: string): string[] {
  const set = new Set(
    html.match(/https:\/\/html\.scribdassets\.com\/[^"')\s]+\.jsonp/g) ?? []
  )
  return sortPageUrls([...set])
}

/** Clean a title for display and filenames. */
export function sanitizeTitle(title: string): string {
  return title
    .replace(/\s*\|\s*(Scribd.*|PDF.*|PPT.*|PPS.*|DOCX?.*)$/i, '')
    .trim()
}

/** Turn a title into a safe PDF filename (no extension). */
export function safeFilename(title: string): string {
  const s = title
    .replace(/[^a-z0-9-_ ]/gi, '')
    .trim()
    .slice(0, 60)
  return (s || 'document').replace(/\s+/g, ' ')
}
