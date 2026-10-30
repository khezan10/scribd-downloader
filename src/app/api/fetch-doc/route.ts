import { NextResponse } from 'next/server';
import { addExtra } from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import chromium from '@sparticuz/chromium';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

const puppeteer = addExtra(require('puppeteer-core'));
puppeteer.use(StealthPlugin());

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
    await page.goto(`https://www.scribd.com/document/${id}`, {
      waitUntil: 'domcontentloaded',
      timeout: 90000,
    });
    let urls: string[] = [];
    let title = '';
    for (let attempt = 0; attempt < 14; attempt++) {
      await new Promise((r) => setTimeout(r, 5000));
      const html = await page.content();
      urls = Array.from(new Set((html.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g) || [])));
      if (urls.length) {
        title = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*PDF/i, '');
        break;
      }
    }
    const raw = await page.content();
    return NextResponse.json({ status: 200, len: raw.length, urls, title, challenge: raw.includes('Client Challenge') });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
