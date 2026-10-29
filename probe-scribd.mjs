const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const H = {
  'User-Agent': ua,
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
};
const urls = [
  'https://www.scribd.com/document/924917379/Sample-PDF-1',
  'https://www.scribd.com/document/924917379',
  'https://www.scribd.com/embeds/924917379/content',
  'https://www.scribd.com/mobile/documents/924917379',
  'https://www.scribd.com/doc/924917379',
];
(async () => {
  for (const u of urls) {
    try {
      const r = await fetch(u, { headers: H, redirect: 'follow', signal: AbortSignal.timeout(20000) });
      const t = await r.text();
      const cc = (t.match(/contentUrl:\s*"(https:\/\/html\.scribdassets\.com\/[^"]+)"/g) || []).length;
      console.log('\n' + u.slice(0, 72));
      console.log(' status', r.status, 'len', t.length, 'contentUrlCount', cc, 'docManager', t.includes('docManager'), 'challenge', t.includes('Client Challenge'));
      if (cc > 0) console.log(' firstContentUrl:', (t.match(/contentUrl:\s*"(https:\/\/html\.scribdassets\.com\/[^"]+)"/) || [])[1]);
    } catch (e) {
      console.log('\n' + u.slice(0, 72), 'ERR', e.message);
    }
  }
})();
