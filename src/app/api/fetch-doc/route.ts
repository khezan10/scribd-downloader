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
    await page.goto(`https://id.scribd.com/document/${id}/token`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    let tokenText = '';
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise((r) => setTimeout(r, 5000));
      tokenText = await page.evaluate(() => document.body.innerText || '');
      if (!tokenText.includes('Client Challenge') && (tokenText.includes('{') || tokenText.trim().length > 10)) break;
    }
    let urls: string[] = [];
    let title = '';
    try {
      const j = JSON.parse(tokenText);
      urls = Array.isArray(j?.urls) ? j.urls : [];
      title = String(j?.title || '');
    } catch {
      // fallback: scrape jsonp out of raw html
      const html = await page.content();
      urls = Array.from(new Set((html.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g) || [])));
      title = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*PDF/i, '');
    }
    return NextResponse.json({ status: 200, len: tokenText.length, urls, title, challenge: tokenText.includes('Client Challenge') });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
