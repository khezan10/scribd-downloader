const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const baseH = {
  'User-Agent': ua,
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  Referer: 'https://id.scribd.com/embeds/924917379/content',
};
async function attempt(label, url, headers) {
  try {
    const r = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    const t = await r.text();
    console.log('\n[' + label + ']', r.status, r.headers.get('content-type'), 'len', t.length);
    console.log('  head:', JSON.stringify(t.slice(0, 160)));
    if (t.includes('"pages"') || t.includes('contentUrl') || t.includes('jsonp')) console.log('  => HAS PAGE DATA HINT');
    return t;
  } catch (e) { console.log('\n[' + label + '] ERR', e.message); return ''; }
}
(async () => {
  const tokenUrl = 'https://id.scribd.com/document/924917379/token';
  // attempt 1: no cookies
  await attempt('token (no cookie)', tokenUrl, baseH);
  // attempt 2: chain csrf_token -> token
  try {
    const r = await fetch('https://id.scribd.com/csrf_token', { headers: baseH });
    const setCk = r.headers.get('set-cookie') || '';
    console.log('\ncsrf status', r.status, 'set-cookie', setCk.slice(0, 120));
    const cookies = setCk.split(';')[0];
    const h2 = { ...baseH, Cookie: cookies };
    await attempt('token (with csrf cookie)', tokenUrl, h2);
  } catch (e) { console.log('csrf ERR', e.message); }
})();
