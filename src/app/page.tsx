'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { parseJsonp, parsePageHtml, sanitizeTitle, safeFilename } from '@/lib/scribd'
import { bookmarkletHref } from '@/lib/bookmarklet'
import type { PdfPageInput } from '@/lib/pdf'

type BuildJob = { title: string; urls: string[] }
type Phase = 'idle' | 'building' | 'done' | 'error'

const MAX_PAGES = 250

function download(bytes: Uint8Array, filename: string) {
  const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const blob = new Blob([ab], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Logo() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="8" stroke="var(--accent)" strokeWidth="2" />
      <path d="M12 12h10M12 17h16M12 22h16M12 27h10" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  )
}

export default function Home() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [origin, setOrigin] = useState('')
  const lastPdf = useRef<{ bytes: Uint8Array; filename: string } | null>(null)

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const runBuild = useCallback(async (job: BuildJob) => {
    const cleanTitle = sanitizeTitle(job.title)
    setTitle(cleanTitle)
    setError('')
    const urls = job.urls.slice(0, MAX_PAGES)
    setProgress({ done: 0, total: urls.length })
    setPhase('building')

    const pages: PdfPageInput[] = []
    try {
      for (const u of urls) {
        try {
          const r = await fetch(u)
          if (!r.ok) continue
          const html = parseJsonp(await r.text())
          const parsed = parsePageHtml(html)
          if (parsed.imageUrl) {
            pages.push({
              width: parsed.width,
              height: parsed.height,
              kind: 'image',
              imageUrl: `/api/image?u=${encodeURIComponent(parsed.imageUrl)}`,
            })
          } else if (parsed.lines.length) {
            pages.push({ width: parsed.width, height: parsed.height, kind: 'text', lines: parsed.lines })
          }
        } catch {
          /* skip one failing page */
        }
        setProgress((p) => ({ ...p, done: p.done + 1 }))
      }

      if (!pages.length) throw new Error('No usable pages found')
      const { buildPdf } = await import('@/lib/pdf')
      const bytes = await buildPdf(pages, cleanTitle)
      const filename = safeFilename(cleanTitle) + '.pdf'
      lastPdf.current = { bytes, filename }
      download(bytes, filename)
      setPhase('done')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Build failed')
      setPhase('error')
    }
  }, [])

  // If the bookmarklet handed us a build job via the URL fragment, run it.
  useEffect(() => {
    const h = window.location.hash
    if (!h.startsWith('#d=')) return
    try {
      const job = JSON.parse(decodeURIComponent(h.slice(3))) as BuildJob
      window.history.replaceState(null, '', '/')
      setError('')
      setPhase('idle')
      runBuild(job)
    } catch {
      setError('Bad link.')
      setPhase('error')
    }
  }, [runBuild])

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
  const href = origin ? bookmarkletHref(origin) : '#'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        <div className="rise rise-1 mb-8 flex items-center gap-3">
          <Logo />
          <div>
            <div className="font-mono text-lg font-semibold tracking-tight text-foreground">
              scribd<span className="text-accent">→</span>pdf
            </div>
            <div className="text-xs text-muted">free · ad-free · open source</div>
          </div>
        </div>

        {phase === 'building' && (
          <div className="rise rise-2 rounded-xl border border-border bg-surface p-6">
            <div className="tw font-mono text-sm text-accent">Fetching pages…</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/40">
              <div
                className="h-full bg-accent transition-all duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 font-mono text-xs text-muted">
              {progress.done} / {progress.total} pages · {pct}%
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="rise rise-2 rounded-xl border border-border bg-surface p-6">
            <div className="font-mono text-sm text-accent">✓ PDF ready</div>
            <div className="mt-1 truncate text-sm text-foreground">{title}</div>
            <button
              onClick={() => {
                if (lastPdf.current) download(lastPdf.current.bytes, lastPdf.current.filename)
              }}
              className="mt-4 font-mono text-xs text-accent underline focus-ring"
            >
              Download again
            </button>
          </div>
        )}

        {phase === 'error' && (
          <div className="rise rise-2 rounded-xl border border-red-500/40 bg-surface p-6">
            <div className="font-mono text-sm text-red-400">✗ {error}</div>
            <button onClick={() => setPhase('idle')} className="mt-4 text-xs text-accent underline focus-ring">
              Back
            </button>
          </div>
        )}

        {phase === 'idle' && (
          <>
            <h1 className="rise rise-2 font-mono text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              Download any Scribd document
              <br />
              as a <span className="text-accent">PDF</span>.
            </h1>
            <p className="rise rise-3 mt-3 text-sm text-muted">
              No subscription, no watermark, no ads. Your document is processed in
              your browser.
            </p>

            <div className="rise rise-3 mt-6 flex flex-col gap-2 sm:flex-row">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && urlInput) {
                    setError('Open that document, then click the bookmarklet below.')
                    setPhase('error')
                  }
                }}
                placeholder="Paste a Scribd link…"
                className="focus-ring flex-1 rounded-lg border border-border bg-surface px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted"
              />
              <button
                onClick={() => {
                  if (!urlInput) return
                  setError('Open that document, then click the bookmarklet below.')
                  setPhase('error')
                }}
                className="focus-ring rounded-lg bg-accent px-5 py-3 font-mono text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                Download
              </button>
            </div>

            <div className="rise rise-4 mt-8 rounded-xl border border-border bg-surface p-5">
              <div className="font-mono text-xs uppercase tracking-widest text-muted">
                Step 1 · grab the button
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <a
                  href={href}
                  title="Drag this to your bookmarks bar"
                  className="focus-ring inline-block cursor-grab rounded-lg bg-accent px-4 py-2 font-mono text-sm font-semibold text-black active:cursor-grabbing"
                >
                  ⤓ Scribd → PDF
                </a>
                <span className="text-xs text-muted">drag to bookmarks bar</span>
              </div>
              <div className="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
                Step 2 · download
              </div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">
                <li>Open the Scribd document you want.</li>
                <li>Click the bookmarklet — the PDF downloads.</li>
              </ol>
              <details className="mt-4">
                <summary className="cursor-pointer font-mono text-xs text-accent focus-ring">
                  No bookmarks bar? Use the console snippet
                </summary>
                <p className="mt-2 text-xs text-muted">
                  Open the document, press <span className="font-mono text-foreground">F12</span>,
                  paste this, press <span className="font-mono text-foreground">Enter</span>:
                </p>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-black/50 p-3 font-mono text-[11px] leading-relaxed text-foreground">
                  {origin ? href.replace('javascript:', '') : '…'}
                </pre>
              </details>
            </div>
          </>
        )}

        <footer className="rise rise-4 mt-10 border-t border-border pt-4 text-xs text-muted">
          <p>
            Inspired by{' '}
            <a href="https://github.com/Qadyyr/scrapd" target="_blank" rel="noreferrer" className="text-accent underline">
              Qadyyr/scrapd
            </a>{' '}
            (MIT) for the download technique and by{' '}
            <a href="https://github.com/khezan10/downloadin-ya" target="_blank" rel="noreferrer" className="text-accent underline">
              Downloadin Ya
            </a>{' '}
            for the UI. Open source on{' '}
            <a href="https://github.com/khezan10/scribd-downloader" target="_blank" rel="noreferrer" className="text-accent underline">
              GitHub
            </a>
            .
          </p>
        </footer>
      </div>
    </main>
  )
}
