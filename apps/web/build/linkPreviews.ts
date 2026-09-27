/**
 * CaseGrid Link Previews
 * At build time, writes a copy of index.html per published case with spoiler-free
 * Open Graph metadata, so shared case links unfurl without a server.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

export interface CatalogItem {
  readonly id: string
  readonly title: string
  readonly subtitle?: string
  readonly description?: string
  readonly availability?: string
}

export interface PreviewMeta {
  readonly title: string
  readonly description: string
  readonly path: string
  readonly image: string
  readonly imageAlt: string
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function absolute(siteUrl: string | undefined, urlPath: string): string {
  return siteUrl ? `${siteUrl.replace(/\/$/, '')}${urlPath}` : urlPath
}

export const HOME_PREVIEW: PreviewMeta = {
  title: 'CaseGrid — Solve the scene. Find the killer.',
  description:
    'A spatial murder-mystery logic game. Place every suspect from the witness clues and find who was alone with the victim.',
  path: '/',
  image: '/og/casegrid.png',
  imageAlt: 'CaseGrid: Solve the scene. Find the killer.',
}

/** Uses only public catalog copy; the case file itself (and its solution) is never read. */
export function casePreview(item: CatalogItem, caseNumber: string): PreviewMeta {
  const teaser = item.description ?? item.subtitle ?? ''
  return {
    title: `Case ${caseNumber}: ${item.title} · CaseGrid`,
    description: `${teaser} Can you solve this case?`.trim(),
    path: `/case/${item.id}`,
    image: `/og/${item.id}.png`,
    imageAlt: `CaseGrid Case ${caseNumber}: ${item.title}. Can you solve this case?`,
  }
}

export function renderPreviewHead(html: string, meta: PreviewMeta, siteUrl?: string): string {
  const url = absolute(siteUrl, meta.path)
  const image = absolute(siteUrl, meta.image)
  const tags = [
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    siteUrl ? `<link rel="canonical" href="${escapeHtml(url)}" />` : '',
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="CaseGrid" />',
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(url)}" />`,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
  ]
    .filter(Boolean)
    .join('\n    ')

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace(/\s*<meta\s+name="description"[\s\S]*?\/>/, '')
    .replace('</head>', `    ${tags}\n  </head>`)
}

export function linkPreviewsPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'casegrid-link-previews',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const siteUrl = process.env.CASEGRID_SITE_URL
      if (!siteUrl) {
        console.warn('[link-previews] CASEGRID_SITE_URL is not set; og:url and og:image will be relative.')
      }
      const indexPath = path.join(outDir, 'index.html')
      const baseHtml = fs.readFileSync(indexPath, 'utf8')
      const catalog = JSON.parse(fs.readFileSync(path.join(outDir, 'puzzles', 'index.json'), 'utf8')) as CatalogItem[]

      fs.writeFileSync(indexPath, renderPreviewHead(baseHtml, HOME_PREVIEW, siteUrl))

      catalog.forEach((item, index) => {
        if (item.availability === 'coming-soon') return
        const number = (index + 1).toString().padStart(2, '0')
        const html = renderPreviewHead(baseHtml, casePreview(item, number), siteUrl)
        const caseDir = path.join(outDir, 'case')
        // Azure Static Web Apps serves /case/<id> from <id>/index.html; Vite preview looks for <id>.html.
        fs.mkdirSync(path.join(caseDir, item.id), { recursive: true })
        fs.writeFileSync(path.join(caseDir, item.id, 'index.html'), html)
        fs.writeFileSync(path.join(caseDir, `${item.id}.html`), html)
      })
    },
  }
}
