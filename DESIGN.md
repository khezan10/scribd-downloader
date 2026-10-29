# DESIGN.md — Shared Design System

Global tokens for all public web projects in this org. Keep consistent.

## Tokens
- Background (terminal dark): `#0a0f0d`
- Surface / card: `#101915`
- Accent (lime): `#a3e635`
- Accent dim: `#84cc16`
- Text: `#e7e5e4`; muted: `#a8a29e`; border: `#27272a`
- Font stack: `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` (mono for code/labels) + system sans for body.
- Radius: `8px` cards, `6px` inputs.

## Motion
- Entrance animation (non-landing pages): staggered, `0.6s`, `fade + rise (translateY 12px) + deblur (blur 4px→0)`, ease-out.
- Respect `prefers-reduced-motion: reduce` — disable all CSS animation (site must never look broken on Windows anim-off).

## Layout
- Every page responsive: mobile-first, breakpoints 640/768/1024.
- Minimalist tools: favicon + logo only, no header/nav menu.

## Logo
- Inline SVG, stroke/fill using tokens, single accent color + dark bg.
