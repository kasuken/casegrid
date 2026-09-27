/**
 * Generates spoiler-free 1200×630 link-preview images into public/og/.
 * Run with `pnpm --filter @casegrid/web generate:og` after changing published case metadata.
 * Uses only catalog title, subtitle, and difficulty — never case files or solutions.
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from '@playwright/test'

const here = path.dirname(fileURLToPath(import.meta.url))
const webRoot = path.resolve(here, '..')
const fontDir = path.resolve(webRoot, '../../.agents/skills/canvas-design/canvas-fonts')
const outDir = path.join(webRoot, 'public/og')
const catalog = JSON.parse(fs.readFileSync(path.join(webRoot, 'public/puzzles/index.json'), 'utf8'))

const font = (file) => pathToFileURL(path.join(fontDir, file)).href
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function page({ eyebrow, title, subtitle, cta }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Lora; font-weight: 700; src: url(${font('Lora-Bold.ttf')}); }
@font-face { font-family: Lora; font-style: italic; src: url(${font('Lora-Italic.ttf')}); }
@font-face { font-family: WorkSans; font-weight: 700; src: url(${font('WorkSans-Bold.ttf')}); }
@font-face { font-family: WorkSans; font-weight: 400; src: url(${font('WorkSans-Regular.ttf')}); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; color: #18272d;
  background: linear-gradient(90deg, rgba(24,39,45,.06) 2px, transparent 2px) 0 0 / 60px 60px,
              linear-gradient(rgba(24,39,45,.06) 2px, transparent 2px) 0 0 / 60px 60px, #efe5d0; }
.card { position: absolute; inset: 48px 420px 48px 48px; padding: 44px 48px; background: #fbf8f0;
  border: 5px solid #18272d; box-shadow: 14px 14px 0 #18272d; border-left: 16px solid #b84435;
  display: flex; flex-direction: column; }
.brand { font: 700 24px WorkSans; letter-spacing: .3em; }
.eyebrow { margin-top: 18px; font: 700 22px WorkSans; letter-spacing: .18em; color: #b84435; text-transform: uppercase; }
h1 { margin-top: 18px; font: 700 64px/1.06 Lora; }
.sub { margin-top: 16px; font: italic 28px/1.3 Lora; color: rgba(24,39,45,.75); }
.cta { margin-top: auto; font: 700 32px Lora; color: #b84435; }
.tag { margin-top: 6px; font: 400 22px WorkSans; color: rgba(24,39,45,.8); }
.board { position: absolute; top: 92px; right: 64px; width: 300px; height: 420px; transform: rotate(3deg);
  background: #d8d3bf; border: 5px solid #18272d; box-shadow: 12px 12px 0 rgba(24,39,45,.25);
  display: grid; grid-template: 1fr 1fr / 1fr 1fr; }
.room { border: 3px solid #18272d; margin: -1.5px; background:
  linear-gradient(90deg, rgba(24,39,45,.12) 1px, transparent 1px) 0 0 / 50px 50px,
  linear-gradient(rgba(24,39,45,.12) 1px, transparent 1px) 0 0 / 50px 50px; }
.pin { position: absolute; width: 38px; height: 38px; border-radius: 50%; border: 5px solid #efe5d0; box-shadow: 0 0 0 3px #18272d; }
.pin--red { left: 62px; top: 88px; background: #b84435; }
.pin--brass { right: 70px; bottom: 96px; background: #b88b36; }
.frame { position: absolute; left: 48px; top: 58px; width: 64px; height: 160px; border: 4px solid #b84435; }
</style></head><body>
<div class="card">
  <div class="brand">CASEGRID</div>
  <div class="eyebrow">${esc(eyebrow)}</div>
  <h1>${esc(title)}</h1>
  ${subtitle ? `<p class="sub">${esc(subtitle)}</p>` : ''}
  <div class="cta">${esc(cta)}</div>
  <div class="tag">Solve the scene. Find the killer.</div>
</div>
<div class="board"><div class="room"></div><div class="room"></div><div class="room"></div><div class="room"></div>
  <span class="frame"></span><span class="pin pin--red"></span><span class="pin pin--brass"></span></div>
</body></html>`
}

const jobs = [
  {
    file: 'casegrid.png',
    eyebrow: 'A spatial murder-mystery logic game',
    title: 'Place every suspect. Find who was alone with the victim.',
    cta: 'Play free in your browser',
  },
  ...catalog
    .map((item, index) => ({ item, number: String(index + 1).padStart(2, '0') }))
    .filter(({ item }) => item.availability !== 'coming-soon')
    .map(({ item, number }) => ({
      file: `${item.id}.png`,
      eyebrow: `Case ${number} · ${item.difficulty}`,
      title: item.title,
      subtitle: item.subtitle,
      cta: 'Can you solve this case?',
    })),
]

fs.mkdirSync(outDir, { recursive: true })
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casegrid-og-'))
const browser = await chromium.launch()
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } })
for (const job of jobs) {
  const htmlPath = path.join(tmp, `${job.file}.html`)
  fs.writeFileSync(htmlPath, page(job))
  await tab.goto(pathToFileURL(htmlPath).href)
  await tab.evaluate(() => document.fonts.ready)
  await tab.screenshot({ path: path.join(outDir, job.file), type: 'png' })
  console.log(`og/${job.file}`)
}
await browser.close()
fs.rmSync(tmp, { recursive: true, force: true })
