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
    await page.goto(`https://www.scribd.com/document/${id}`, {
      waitUntil: 'networkidle2',
      timeout: 90000,
    });
    await new Promise((r) => setTimeout(r, 2000));
    const html = await page.content();
    const urls = Array.from(new Set((html.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g) || [])));
    const title = ((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*PDF/i, '');
    return NextResponse.json({ status: 200, len: html.length, urls, title, challenge: false });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
