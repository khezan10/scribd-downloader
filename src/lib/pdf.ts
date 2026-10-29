import { PDFDocument, StandardFonts, rgb, PDFImage } from 'pdf-lib'

export interface PdfPageInput {
  width: number
  height: number
  kind: 'image' | 'text'
  imageUrl?: string
  lines?: string[]
}

const FONT_SIZE_MIN = 7
const FONT_SIZE_MAX = 14

/**
 * Assemble a PDF from page descriptors entirely in the browser. Image pages
 * fetch their bytes through our /api/image proxy (CORS-enabled); text pages
 * are rendered as flowed lines.
 */
export async function buildPdf(pages: PdfPageInput[], title: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  if (title) {
    try {
      pdf.setTitle(title)
    } catch {
      /* ignore title encoding errors */
    }
  }

  for (const p of pages) {
    const w = p.width > 0 ? p.width : 612
    const h = p.height > 0 ? p.height : 792
    const page = pdf.addPage([w, h])

    if (p.kind === 'image' && p.imageUrl) {
      const res = await fetch(p.imageUrl)
      if (!res.ok) continue
      const bytes = new Uint8Array(await res.arrayBuffer())
      let img: PDFImage
      try {
        img = await pdf.embedJpg(bytes)
      } catch {
        try {
          img = await pdf.embedPng(bytes)
        } catch {
          continue
        }
      }
      page.drawImage(img, { x: 0, y: 0, width: w, height: h })
    } else if (p.lines && p.lines.length) {
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const margin = Math.max(20, w * 0.05)
      const availH = h - margin * 2
      const fontSize = Math.min(
        FONT_SIZE_MAX,
        Math.max(FONT_SIZE_MIN, availH / (p.lines.length * 1.4))
      )
      const lineH = fontSize * 1.4
      let y = h - margin
      for (const line of p.lines) {
        if (y < margin) break
        page.drawText(line.slice(0, 500), {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
          maxWidth: w - margin * 2,
          lineHeight: lineH,
        })
        y -= lineH
      }
    }
  }

  return pdf.save()
}
