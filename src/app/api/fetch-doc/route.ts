import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const u = String(body?.u || '');
  const m = u.match(/scribd\.com\/(?:document|doc|presentation|book|audiobook)\/(\d+)/) || u.match(/\/(\d{6,})\/?$/);
  if (!m) return NextResponse.json({ error: 'no-id' }, { status: 400 });
  const id = m[1];

  let browser;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: null,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 1280, height: 900 });
    // warmup: land on scribd root so Fastly sets session cookies in this browser context
    await page.goto('https://www.scribd.com/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 8000));
    let tokenText = '';
    try {
      tokenText = await page.evaluate(async (docId) => {
        const r = await fetch(`https://id.scribd.com/document/${docId}/token`, {
          credentials: 'include',
          headers: { Referer: 'https://www.scribd.com/' },
        });
        return await r.text();
      }, id);
    } catch (e: any) {
      return NextResponse.json({ error: 'token-fetch: ' + e.message }, { status: 502 });
    }
    let urls: string[] = [];
    let title = '';
    try {
      const j = JSON.parse(tokenText);
      urls = Array.isArray(j?.urls) ? j.urls : [];
      title = String(j?.title || '');
    } catch {
      return NextResponse.json({ status: 200, len: tokenText.length, urls: [], title: 'unparseable', challenge: tokenText.includes('Client Challenge'), raw: tokenText.slice(0, 300) });
    }
    return NextResponse.json({ status: 200, len: tokenText.length, urls, title, challenge: tokenText.includes('Client Challenge') });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
