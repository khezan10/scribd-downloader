const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const H={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate','Sec-Fetch-Site':'same-origin','Sec-Fetch-User':'?1','Upgrade-Insecure-Requests':'1','sec-ch-ua':'"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"','sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"','Referer':'https://www.scribd.com/'};
const r=await fetch('https://www.scribd.com/embeds/924917379/content',{headers:H});
const t=await r.text();
// all asset URLs
const assets=Array.from(new Set((t.match(/https:\/\/[^"'\s>]+/g)||[])));
console.log('total asset urls:', assets.length);
const interesting=assets.filter(u=>u.includes('scribd')||u.includes('images')||u.includes('pages')||u.includes('thumb')||u.includes('jpg')||u.includes('png'));
console.log('interesting:'); interesting.slice(0,20).forEach(u=>console.log(' ',u.slice(0,140)));
// og meta
const og=t.match(/<meta[^>]*property="og:[^"]*"[^>]*>/g)||[];
console.log('\nog metas:', og.slice(0,12).join('\n'));
// any 12-hex-like tokens (hash pattern)
const hashes=Array.from(new Set((t.match(/\b[0-9a-f]{12}\b/g)||[])));
console.log('\n12-hex tokens:', hashes.slice(0,15));
