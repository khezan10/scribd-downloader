const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const H = { 'User-Agent': ua, Accept: '*/*', Referer: 'https://www.scribd.com/' };
(async () => {
  const u = 'https://www.scribd.com/embeds/924917379/content';
  const r = await fetch(u, { headers: H, signal: AbortSignal.timeout(20000) });
  const t = await r.text();
  console.log('status', r.status, 'len', t.length);

  // find all scribdassets page urls
  const pagesUrl = [...new Set(t.match(/https:\/\/html\.scribdassets\.com\/[^"'\s)]+/g) || [])];
  console.log('UNIQUE scribdasset URLS:', pagesUrl.length);
  for (const p of pagesUrl.slice(0, 20)) console.log('  ', p);

  // find contentUrl serializations
  const cu = [...new Set(t.match(/contentUrl:\s*"([^"]+)"/g) || [])];
  console.log('contentUrl occurrences:', cu.length);
  for (const c of cu.slice(0, 10)) console.log('  ', c);

  // find page count meta
  const pc = (t.match(/"page_count"\s*:\s*(\d+)/) || t.match(/"pageCount"\s*:\s*(\d+)/) || []);
  console.log('pageCount meta:', pc?.[1] ?? pc[0] ?? 'none');

  // title
  const title = t.match(/<title>([^<]*)<\/title>/);
  console.log('title:', title?.[1]?.slice(0, 80));
})();
