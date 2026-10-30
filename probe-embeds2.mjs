const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const H={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate','Sec-Fetch-Site':'same-origin','Sec-Fetch-User':'?1','Upgrade-Insecure-Requests':'1','sec-ch-ua':'"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"','sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"','Referer':'https://www.scribd.com/'};
const r=await fetch('https://www.scribd.com/embeds/924917379/content',{headers:H});
const t=await r.text();
// search for page-related keys
const keys=['pages','pageJSON','jsonp','pagePath','imagePath','_page','"1"','"2"'];
for(const k of keys){
  const idx=t.indexOf(k);
  if(idx>=0){ console.log(`\n-- key '${k}' at ${idx}:`); console.log(t.slice(Math.max(0,idx-100), idx+250).replace(/\s+/g,' ')); }
}
// count page-ish jsonp URLs or folder refs
const folderMatch=t.match(/html\.scribdassets\.com\/[a-z0-9]+\/pages/g)||[];
console.log('\nrefs to /pages/ in embeds:', folderMatch.length);
// find large base64 or data uri
const datauri=t.match(/data:image\/[a-z]+;base64,[A-Za-z0-9+/=]{20}/g)||[];
console.log('data-uri imgs:', datauri.length);
