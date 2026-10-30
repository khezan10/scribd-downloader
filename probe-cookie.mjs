const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const base={
  'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9', 'Sec-Fetch-Dest': 'document', 'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'same-origin', 'Sec-Fetch-User': '?1', 'Upgrade-Insecure-Requests': '1',
  'sec-ch-ua': '"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
  'sec-ch-ua-mobile': '?0', 'sec-ch-ua-platform': '"Windows"',
};
const ID='924917379';

// 1) first make a warmup request to acquire cookies
let jar=[];
const warm=await fetch(`https://www.scribd.com/document/${ID}`,{headers:{...base,'Referer':'https://www.scribd.com/'}});
jar=warm.headers.getSetCookie?warm.headers.getSetCookie():[];
console.log('WARMUP status',warm.status,'cookies',jar.length,jar.map(c=>c.split(';')[0]));

// 2) retry with cookies after delay
await new Promise(s=>setTimeout(s,3000));
for(let i=0;i<3;i++){
  const hdr={...base,'Referer':'https://www.scribd.com/document/'+ID};
  if(jar.length)hdr.Cookie=jar.join('; ');
  const r=await fetch(`https://www.scribd.com/document/${ID}`,{headers:hdr});
  const t=await r.text();
  const urls=Array.from(new Set((t.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g)||[])));
  console.log(`attempt#${i} status=${r.status} len=${t.length} jsonp=${urls.length}`);
  await new Promise(s=>setTimeout(s,4000));
}
