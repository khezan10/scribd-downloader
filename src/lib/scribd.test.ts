import { describe, it, expect } from 'vitest'
import {
  parseJsonp,
  parsePageHtml,
  extractDocId,
  extractUrlsFromTokenHtml,
  sortPageUrls,
  sanitizeTitle,
  safeFilename,
} from './scribd'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const textPage = readFileSync(join(__dirname, '__fixtures__', 'text-page.jsonp'), 'utf8')
const scannedPage = readFileSync(join(__dirname, '__fixtures__', 'scanned-page.jsonp'), 'utf8')

describe('parseJsonp', () => {
  it('unescapes the wrapped HTML and the JSONP callback wrapper', () => {
    const html = parseJsonp(textPage)
    expect(html).toContain('newpage')
    expect(html).toContain('page1')
    expect(html).not.toContain('callback(')
  })
})

describe('parsePageHtml', () => {
  it('extracts page dimensions and text lines from a text page', () => {
    const html = parseJsonp(textPage)
    const page = parsePageHtml(html)
    expect(page.width).toBeGreaterThan(0)
    expect(page.height).toBeGreaterThan(0)
    expect(page.imageUrl).toBeNull()
    expect(page.lines.length).toBeGreaterThan(0)
    expect(page.lines.join(' ')).toContain('Sample PDF Document')
  })

  it('extracts image URL from a scanned/image page', () => {
    const html = parseJsonp(scannedPage)
    const page = parsePageHtml(html)
    expect(page.imageUrl).toMatch(/^https:\/\/html\.scribd\.com\/.*\/images\/.*\.jpg$/)
    expect(page.lines.length).toBe(0)
  })

  it('upgrades http image URLs to https', () => {
    const html = parseJsonp(scannedPage)
    expect(parsePageHtml(html).imageUrl).toMatch(/^https:/)
  })
})

describe('extractDocId', () => {
  it('accepts all known url shapes', () => {
    expect(extractDocId('https://www.scribd.com/document/123456789/foo')).toBe('123456789')
    expect(extractDocId('https://www.scribd.com/doc/999')).toBe('999')
    expect(extractDocId('https://id.scribd.com/document/42/x')).toBe('42')
    expect(extractDocId('https://example.com/other')).toBeNull()
  })
})

describe('sortPageUrls / extractUrlsFromTokenHtml', () => {
  const html = [
    'pre',
    'https://html.scribdassets.com/ab/pages/2-ad.jsonp',
    'https://html.scribdassets.com/ab/pages/10-bc.jsonp',
    'https://html.scribdassets.com/ab/pages/1-aa.jsonp',
    'post',
  ].join(' ')

  it('extracts unique jsonp urls and orders them by page number', () => {
    const urls = extractUrlsFromTokenHtml(html)
    expect(urls).toHaveLength(3)
    expect(urls[0]).toMatch(/pages\/1-aa\.jsonp$/)
    expect(urls[2]).toMatch(/pages\/10-bc\.jsonp$/)
  })

  it('sortPageUrls handles unsorted input', () => {
    expect(sortPageUrls(['x/2-b.jsonp', 'x/1-a.jsonp'])).toEqual(['x/1-a.jsonp', 'x/2-b.jsonp'])
  })
})

describe('sanitizeTitle / safeFilename', () => {
  it('strips " | Scribd" suffix and emoji-ish head', () => {
    expect(sanitizeTitle('🐴 Sample PDF Template for Notes | PDF')).toBe('🐴 Sample PDF Template for Notes')
  })
  it('safeFilename produces filesystem-safe names', () => {
    expect(safeFilename('My: Doc / Title!')).toBe('My Doc Title')
    expect(safeFilename('')).toBe('document')
  })
})
