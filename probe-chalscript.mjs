const r=await fetch('https://www.scribd.com/_fs-ch-1T1wmsGaOgGaSxcX/script.js?reload=true',{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36'}});
const t=await r.text();
console.log('len',t.length);
console.log(t);
