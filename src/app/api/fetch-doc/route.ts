import { NextResponse } from 'next/server';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const HDRS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1', 'Upgrade-Insecure-Requests': '1',
  'Accept-Encoding': 'gzip, deflate, br',
  'sec-ch-ua': '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
  'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': '"Windows"',
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const u = url.searchParams.get('u') || '';
  const m = u.match(/scribd\.com\/(?:document|doc|presentation|book|audiobook)\/(\d+)/) || u.match(/\/(\d{6,})\/?$/);
  if (!m) return NextResponse.json({ error: 'no-id' }, { status: 400 });
  const id = m[1];
  try {
    const r = await fetch(`https://www.scribd.com/document/${id}`, {
      headers: { ...HDRS, Referer: `https://www.scribd.com/document/${id}` },
      cache: 'no-store',
    });
    const t = await r.text();
    const urls = Array.from(new Set((t.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g) || [])));
    const title = ((t.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*PDF/i, '');
    return NextResponse.json({
      status: r.status, len: t.length, urls, title,
      challenge: t.includes('Client Challenge'),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
