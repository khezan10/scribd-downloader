// REA probe: can we extract page URLs server-side without a browser?
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const ID = '924917379';
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

async function probe(name, url, opts = {}) {
  try {
    const r = await fetch(url, { headers: { ...HDRS, ...(opts.headers || {}) }, redirect: 'follow', ...opts });
    const t = await r.text();
    const jsonpT = (t.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g) || []);
    const images = (t.match(/html\.scribd\.com\/[^")\s]+\.jpg/g) || []);
    const hasDocMgr = t.includes('docManager');
    console.log(`\n### ${name}`);
    console.log(`  status=${r.status} len=${t.length} docManager=${hasDocMgr} jsonp=${jsonpT.length} imgs=${images.length}`);
    console.log(`  title=${(t.match(/<title>([^<]*)<\/title>/) || [])[1] || '-'}`);
    if (jsonpT.length) console.log('  jsonp[0]:', jsonpT[0]);
    if (images.length) console.log('  img[0]:', images[0]);
    return { name, status: r.status, len: t.length, jsonpT, images, t };
  } catch (e) {
    console.log(`\n### ${name} ERROR: ${e.message}`);
    return { name, error: e.message };
  }
}

await probe('embeds/content', `https://www.scribd.com/embeds/${ID}/content`);
await probe('token full headers', `https://id.scribd.com/document/${ID}/token`);
await probe('token + cookies', `https://id.scribd.com/document/${ID}/token`, { headers: { Cookie: '' } });
await probe('embeds with clientId', `https://www.scribd.com/embeds/${ID}/content?client_id=abcd1234`);
await probe('doc page full headers', `https://www.scribd.com/document/${ID}/Sample-PDF-1`);
await probe('read page', `https://www.scribd.com/read/${ID}`);
await probe('m.scribd.com', `https://m.scribd.com/document/${ID}`);
await probe('oembed', `https://www.scribd.com/services/oembed?url=https://www.scribd.com/document/${ID}&format=json`);
