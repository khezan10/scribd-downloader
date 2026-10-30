const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const HDRS = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-User': '?1', 'Upgrade-Insecure-Requests': '1',
  'sec-ch-ua': '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
  'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': '"Windows"',
  'Referer': 'https://www.scribd.com/',
};
// multi-page SAT doc
const ID = '585742737';
const r = await fetch(`https://id.scribd.com/document/${ID}/token`, { headers: { ...HDRS, Cookie: '' } });
const t = await r.text();
const urls = Array.from(new Set((t.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g) || [])));
const title = ((t.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*PDF/i, '').trim();
console.log(`status=${r.status} len=${t.length}`);
console.log(`title='${title}'`);
console.log(`jsonp_urls=${urls.length}`);
console.log(urls.slice(0, 5).join('\n'));
