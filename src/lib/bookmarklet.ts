/**
 * The bookmarklet runs inside the user's browser on a Scribd document page,
 * where Scribd's JavaScript "Client Challenge" has already been satisfied. It
 * re-fetches the document's own `token` HTML in-page (which lists every page)
 * and forwards the page list to our app to build the PDF. It is intentionally
 * plain ES5 so it runs in any browser.
 */
export function bookmarkletSource(origin: string): string {
  return `(function(){
var m=/scribd\\.com\\/(?:doc|document|read|embeds)\\/(\\d+)/i.exec(location.href);
if(!m){alert('Open a Scribd document first.');return}
var id=m[1];
fetch('/document/'+id+'/token',{credentials:'include'}).then(function(r){return r.text()}).then(function(h){
var urls=Array.from(new Set((h.match(/https:\\/\\/html\\.scribdassets\\.com\\/[^")\\s]+\\.jsonp/g)||[])));
var t=(h.match(/<title>([^<]*)<\\/title>/)||[])[1]||'Scribd Document';
if(!urls.length){alert('No pages found. Is this a Scribd document?');return}
var payload=encodeURIComponent(JSON.stringify({title:t,urls:urls}));
window.open('${origin}'+'/#d='+payload,'_blank')
}).catch(function(e){alert('Scribd extraction failed: '+e)})
})();`
}

export function bookmarkletHref(origin: string): string {
  return 'javascript:' + bookmarkletSource(origin)
}
