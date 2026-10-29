const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
(async () => {
  const u = 'https://www.scribd.com/embeds/924917379/content';
  const r = await fetch(u, { headers: { 'User-Agent': ua, Accept: '*/*', Referer: 'https://www.scribd.com/' }, signal: AbortSignal.timeout(20000) });
  const t = await r.text();
  for (const k of ['jsonp', 'assetId', 'assetPrefix', 'pageHash', '/pages/', 'addPage', 'pageToken', 'docId', 'document_id']) {
    const idx = t.indexOf(k);
    console.log('---', k, 'at', idx);
    if (idx >= 0) console.log('    ctx:', t.slice(Math.max(0, idx - 80), idx + 120).replace(/\s+/g, ' '));
  }
  // count of "pages" key occurrences
  const pc = (t.match(/"pages"/g) || []).length;
  console.log('"pages" key count:', pc);
})();
