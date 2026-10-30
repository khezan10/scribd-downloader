const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const base={
  'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language':'en-US,en;q=0.9','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate',
  'Sec-Fetch-Site':'same-origin','Sec-Fetch-User':'?1','Upgrade-Insecure-Requests':'1',
  'Accept-Encoding':'gzip, deflate, br',
  'sec-ch-ua':'"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
  'sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"','Referer':'https://www.scribd.com/document/924917379',
};
const ID='924917379';
let wins=0;
for(let i=0;i<6;i++){
  const r=await fetch(`https://www.scribd.com/document/${ID}`,{headers:base});
  const t=await r.text();
  const urls=Array.from(new Set((t.match(/https:\/\/html\.scribdassets\.com\/[^")\s]+\.jsonp/g)||[])));
  const win=urls.length>0;
  if(win)wins++;
  console.log(`#${i} status=${r.status} len=${t.length} jsonp=${urls.length} ${win?'WIN':''}`);
  await new Promise(s=>setTimeout(s,12000));
}
console.log('WINS',wins,'/6');
