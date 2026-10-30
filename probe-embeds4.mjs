const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const H={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate','Sec-Fetch-Site':'same-origin','Sec-Fetch-User':'?1','Upgrade-Insecure-Requests':'1','sec-ch-ua':'"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"','sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"','Referer':'https://www.scribd.com/'};
const r=await fetch('https://www.scribd.com/embeds/924917379/content',{headers:H});
const t=await r.text();
const keys=['window.Scribd','INITIAL','__data','pageUrls','page_urls','config','docManager','imageBase','baseImages','assetBase','pagesJson','fileBase'];
for(const k of keys){
  const idx=t.indexOf(k);
  if(idx>=0){ console.log(`\n-- '${k}' @${idx}:`); console.log(t.slice(Math.max(0,idx-120), idx+300).replace(/\s+/g,' ')); }
}
console.log('\n--- full asset urls containing folder ---');
const F='4fp9bo2u4gfp1hv0';
const f=t.split(F);
console.log('occurrences of folder:', f.length-1);
// print context around folder occurrences (max 4)
f.slice(1,5).forEach((seg,i)=>{
  const pre=t.split(F).slice(0,i+1).join(F);
  const rel=seg.slice(0,200);
  console.log(`#${i}: ...${t.slice(Math.max(0,pre.length-80), pre.length)}${F}${rel.replace(/\s+/g,' ')}`);
});
