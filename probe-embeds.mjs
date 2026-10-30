const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const HDRS={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate','Sec-Fetch-Site':'same-origin','Sec-Fetch-User':'?1','Upgrade-Insecure-Requests':'1','sec-ch-ua':'"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"','sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"','Referer':'https://www.scribd.com/'};
const r=await fetch('https://www.scribd.com/embeds/924917379/content',{headers:HDRS});
const t=await r.text();
console.log('len',t.length);
// search for folder patterns / hash / pageCount
const folders=Array.from(new Set((t.match(/4fp9bo2u4gfp1hv0|2erkcp6d4wfip5hy|3dk2fsshq89zn18j/g)||[])));
console.log('folders',folders);
const hashes=Array.from(new Set((t.match(/7b374d6ef2|2c7ba039ce/g)||[])));
console.log('hashes',hashes);
const pageCount=(t.match(/"pageCount":(\d+)/)||[])[1]||(t.match(/pageCount['"]?\s*[:=]\s*(\d+)/)||[])[1]||'?';
console.log('pageCount',pageCount);
// find any 'pages' key context
const m=t.match(/"docManager"[\s\S]{0,400}/);
console.log('docManager ctx:', m?m[0].slice(0,400):'none');
// any folder-ish hex string near images
const hexy=t.match(/[0-9a-f]{32}|[0-9a-f]{16,32}/g)||[];
console.log('hex tokens',Array.from(new Set(hexy)).slice(0,10));
