# Scribd → PDF

Free, ad-free, open-source **Scribd document downloader**. Paste a Scribd
link, and download the document as a PDF — no subscription, no watermark, no
analytics.

Built with Next.js 16 (App Router) + TypeScript + Tailwind + `pdf-lib`,
deployed as Vercel serverless functions.

## Features

- Download any public Scribd document as a PDF.
- Scanned/image documents come out as faithful page images.
- Text documents come out with selectable text.
- No ads, no tracking, no login, no server-side storage.
- Responsive, dark terminal + lime UI (inspired by Downloadin Ya).

## How it works

Scribd protects its document pages with a JavaScript anti-bot "Client
Challenge". This tool cannot read the page list from a plain server request,
so the **bookmarklet** reads it inside your own browser (where Scribd's check
already passes), then hands the page URLs to this app. All document content is
then fetched directly from Scribd's public CDN and assembled into a PDF.

1. Drag the **Scribd → PDF** button (on the site) to your bookmarks bar.
2. Open any Scribd document.
3. Click the bookmarklet → the PDF downloads.

## Architecture

```
Scribd document page (user's browser, challenge already passed)
   │  bookmarklet reads per-page JSONP URLs from the /token response
   ▼
This app (Vercel serverless)
   ├─ static UI: parses JSONP pages, fetches images via API
   ├─ /api/image: CORS proxy for CDN images (html.scribdassets.com)
   └─ pdf-lib in the browser assembles the PDF
```

Key files:

- `src/lib/scribd.ts` — parsing (JSONP → page HTML → text lines / image URL)
- `src/lib/bookmarklet.ts` — the bookmarklet source
- `src/lib/pdf.ts` — browser-side PDF assembly (`pdf-lib`)
- `src/app/api/image/route.ts` — image proxy (adds CORS, caches)
- `src/app/page.tsx` — UI + build orchestration

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest unit tests
npm run build    # production build
```

## Testing

Unit tests (vitest) cover the pure parsing logic against real fixture data
captured from Scribd's CDN in `src/lib/__fixtures__/`:

```bash
npm test
```

## Deployment (Vercel)

```bash
vercel
vercel --prod
```

No environment variables or databases are required.

## Credits & License

See [CREDITS.md](./CREDITS.md) — download technique inspired by
[Qadyyr/scrapd](https://github.com/Qadyyr/scrapd) (MIT), UI inspired by
[Downloadin Ya](https://github.com/khezan10/downloadin-ya).

MIT License © 2026 Khezan Amartya. See [LICENSE](./LICENSE).

## Disclaimer

This tool only downloads documents that are publicly accessible on Scribd.
Respect the document authors' and Scribd's terms of service — use it for
documents you are permitted to download.
