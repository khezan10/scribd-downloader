# Credits

This project builds on the work of others. Thank you to:

## Qadyyr / scrapd
https://github.com/Qadyyr/scrapd — MIT License

- The document→PDF technique (bookmarklet collects per-page JSONP URLs from
  Scribd's reader; the CDN serves them openly; pages are either scanned images
  or positioned text).
- The idea of transforming JSONP page URLs into image URLs and using `pdf-lib`
  for assembly.

## Downloadin Ya
https://github.com/khezan10/downloadin-ya

- UI / layout inspiration (dark terminal + lime aesthetic, loader style).

## Reference sites (feature inspiration, no code reused)
- toolesh.com/scribd-document-downloader
- scribd.vdownloaders.com
- scribd.downloader.tips

---

## Methodology note
Scribd protects its document pages with a JavaScript "Client Challenge"
(anti-bot). Because of that, the page list is read inside the user's own
browser (via the bookmarklet), where the challenge is already satisfied. Once
the page URLs are known, all document content is fetched from Scribd's public
CDN (`html.scribdassets.com`), which is directly reachable.
