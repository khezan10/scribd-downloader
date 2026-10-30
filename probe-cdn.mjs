const F='4fp9bo2u4gfp1hv0';
const paths=['pages.jsonp','manifest.jsonp','metadata.jsonp','document.jsonp','file.jsonp','info.jsonp','_index.jsonp','index.jsonp','p.jsonp','toc.jsonp','pages/1.jsonp','pages/1-7b374d6ef2.jsonp'];
for(const p of paths){
  try{
    const r=await fetch(`https://html.scribdassets.com/${F}/${p}`,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36','Referer':'https://www.scribd.com/'}});
    const t=await r.text();
    const ct=r.headers.get('content-type')||'';
    console.log(`${p.padEnd(28)} ${r.status} ${ct.split(';')[0]} len=${t.length} | ${t.slice(0,80).replace(/\s+/g,' ')}`);
  }catch(e){console.log(p,'ERR',e.message);}
}
