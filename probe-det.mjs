const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
function hdr(cookie){const h={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate','Sec-Fetch-Site':'same-origin','Sec-Fetch-User':'?1','Upgrade-Insecure-Requests':'1','Accept-Encoding':'gzip, deflate, br','sec-ch-ua':'"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"','sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"','Referer':'https://www.scribd.com/document/924917379'};if(cookie!==undefined)h.Cookie=cookie;return h;}
const ID='924917379';
// A) token endpoint with Cookie:'' 
for(let i=0;i<3;i++){
  const r=await fetch(`https://id.scribd.com/document/${ID}/token`,{headers:hdr('')});
  const t=await r.text();
  console.log(`A token '' #${i}: ${r.status} len=${t.length}`);
  await new Promise(s=>setTimeout(s,3000));
}
// B) doc page with Cookie:'' 
for(let i=0;i<3;i++){
  const r=await fetch(`https://www.scribd.com/document/${ID}`,{headers:hdr('')});
  const t=await r.text();
  console.log(`B doc '' #${i}: ${r.status} len=${t.length}`);
  await new Promise(s=>setTimeout(s,3000));
}
// C) doc page normal (no cookie)
for(let i=0;i<3;i++){
  const r=await fetch(`https://www.scribd.com/document/${ID}`,{headers:hdr()});
  const t=await r.text();
  console.log(`C doc none #${i}: ${r.status} len=${t.length}`);
  await new Promise(s=>setTimeout(s,3000));
}
