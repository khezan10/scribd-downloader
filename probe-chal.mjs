const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const r=await fetch('https://www.scribd.com/document/924917379',{headers:{
  'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language':'en-US,en;q=0.9','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate',
  'Sec-Fetch-Site':'same-origin','Sec-Fetch-User':'?1','Upgrade-Insecure-Requests':'1',
  'sec-ch-ua':'"Chromium";v="125", "Google Chrome";v="125", "Not.A/Brand";v="24"',
  'sec-ch-ua-mobile':'?0','sec-ch-ua-platform':'"Windows"','Referer':'https://www.scribd.com/',
}});
const t=await r.text();
console.log('LEN',t.length);
console.log(t);
