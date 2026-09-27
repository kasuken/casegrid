/**
 * Renders docs/discovery/storyboards.html from the validated mini-mystery JSON.
 * Run: node docs/discovery/render-storyboards.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../..')
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'apps/web/public/puzzles/index.json'), 'utf8'))
const minis = fs
  .readdirSync(path.join(here, 'minis'))
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(here, 'minis', f), 'utf8')))

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const ZONES = ['#e3ecdf', '#e4e9f2', '#f3e6d3', '#f1e1e1']

function board(mini) {
  const cells = []
  for (let r = 0; r < mini.grid.height; r++) {
    for (let c = 0; c < mini.grid.width; c++) {
      const areaIndex = mini.areas.findIndex((a) => a.cells.some((p) => p.row === r && p.column === c))
      const area = mini.areas[areaIndex]
      const object = mini.objects.find((o) => o.position.row === r && o.position.column === c)
      const firstOfArea = area && area.cells[0].row === r && area.cells[0].column === c
      cells.push(`<div class="cell${object ? ' cell--object' : ''}" style="background:${ZONES[areaIndex] ?? '#fff'}">
        ${firstOfArea ? `<span class="room">${esc(area.name)}</span>` : ''}
        ${object ? `<span class="object">${esc(object.label ?? object.type)}</span>` : ''}
        <span class="coord">${r + 1},${c + 1}</span></div>`)
    }
  }
  return `<div class="board" style="grid-template-columns:repeat(${mini.grid.width},1fr)" role="img" aria-label="${esc(altText(mini))}">${cells.join('')}</div>`
}

function altText(mini) {
  const rooms = mini.areas
    .map((a) => `${a.name}: ${a.cells.map((p) => `row ${p.row + 1} column ${p.column + 1}`).join(', ')}`)
    .join('. ')
  const objects = mini.objects.map((o) => `${o.label} at row ${o.position.row + 1}, column ${o.position.column + 1}`).join('; ')
  return `A ${mini.grid.height} by ${mini.grid.width} floor plan. ${rooms}. Objects, which block their cells: ${objects}.`
}

function concept(mini) {
  const victim = mini.characters.find((c) => c.id === mini.victimId)
  const linked = catalog.find((c) => c.id === mini.linkedCaseId)
  const number = String(catalog.indexOf(linked) + 1).padStart(2, '0')
  const clueNo = new Map(mini.clues.map((c, i) => [c.id, i + 1]))
  return `<section class="concept">
  <h2>${esc(mini.title)} <small>links to Case ${number}: ${esc(linked.title)}</small></h2>
  <div class="frames">
    <article class="phone" aria-label="${esc(mini.title)}: puzzle post">
      <p class="hook">Solve the scene. Find the killer.</p>
      <h3>${esc(mini.title)}</h3>
      <p class="setup">${esc(mini.description)}</p>
      ${board(mini)}
      <p class="rule">“Beside” means sharing an edge, never a corner. Objects block their cells.</p>
      <ol class="clues">${mini.clues.map((c) => `<li>${esc(c.text)}</li>`).join('')}</ol>
      <p class="question">Who was alone with ${esc(victim.name)}?</p>
      <p class="footer">Answer in the next slide · casegrid</p>
    </article>
    <article class="phone phone--answer" aria-label="${esc(mini.title)}: answer slide">
      <p class="hook">The answer</p>
      <ol class="steps">${mini.deductions
        .map((d) => `<li>${esc(d.text)} <span class="refs">Clue${d.clueIds.length > 1 ? 's' : ''} ${d.clueIds.map((id) => clueNo.get(id)).join(', ')}</span></li>`)
        .join('')}</ol>
      <p class="resolution">${esc(mini.resolution)}</p>
      <div class="cta">
        <strong>Ready for a full case?</strong>
        <span>Case ${number}: ${esc(linked.title)}</span>
        <span class="link">/case/${esc(linked.id)}</span>
      </div>
    </article>
  </div>
  <details class="alt"><summary>Text equivalent for the scene image</summary><p>${esc(altText(mini))}</p></details>
</section>`
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CaseGrid discovery storyboards (review draft)</title>
<style>
:root { --ink:#18272d; --paper:#efe5d0; --card:#fbf8f0; --evidence:#b84435; --brass:#b88b36; }
* { box-sizing: border-box; }
body { margin: 0; padding: 24px 16px 48px; background: var(--paper); color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }
header { max-width: 780px; margin: 0 auto 24px; }
.banner { padding: 10px 14px; border: 2px dashed var(--evidence); background: #fff4ef; font-weight: 600; }
.concept { max-width: 780px; margin: 0 auto 40px; }
.concept h2 { font-family: Georgia, serif; margin: 0 0 12px; }
.concept h2 small { display: block; font: 600 13px system-ui; color: #7a5a1c; letter-spacing: .04em; text-transform: uppercase; }
.frames { display: flex; flex-wrap: wrap; gap: 20px; }
.phone { width: 360px; max-width: 100%; padding: 20px; background: var(--card); border: 3px solid var(--ink); box-shadow: 6px 6px 0 var(--ink); }
.hook { margin: 0; font: 700 12px system-ui; letter-spacing: .12em; text-transform: uppercase; color: var(--evidence); }
.phone h3 { margin: 6px 0 8px; font: 700 26px/1.15 Georgia, serif; }
.setup { margin: 0 0 12px; font-size: 15px; }
.board { display: grid; gap: 3px; padding: 3px; background: var(--ink); margin-bottom: 8px; }
.cell { position: relative; aspect-ratio: 1; padding: 4px; }
.cell--object { background-image: repeating-linear-gradient(45deg, rgba(24,39,45,.12) 0 4px, transparent 4px 9px) !important; }
.room { font: 700 10px system-ui; text-transform: uppercase; letter-spacing: .06em; }
.object { position: absolute; inset: auto 4px 16px 4px; font: 600 11px/1.2 system-ui; text-align: center; }
.coord { position: absolute; right: 4px; bottom: 2px; font: 10px ui-monospace, monospace; color: rgba(24,39,45,.6); }
.rule { margin: 0 0 8px; font-size: 12px; font-style: italic; }
.clues, .steps { margin: 0 0 10px; padding-left: 20px; font-size: 15px; }
.clues li + li, .steps li + li { margin-top: 4px; }
.question { margin: 0; font: 700 18px Georgia, serif; color: var(--evidence); }
.footer { margin: 10px 0 0; font-size: 12px; color: rgba(24,39,45,.7); }
.refs { display: block; font: 700 11px system-ui; color: var(--evidence); }
.resolution { font-weight: 600; }
.cta { display: flex; flex-direction: column; gap: 2px; padding: 12px; border: 2px solid var(--ink); border-left: 6px solid var(--brass); background: var(--paper); }
.link { font-family: ui-monospace, monospace; font-size: 13px; }
.alt { margin-top: 12px; max-width: 740px; font-size: 14px; }
</style></head><body>
<header>
  <h1 style="font-family:Georgia,serif;margin:0 0 8px">CaseGrid discovery storyboards</h1>
  <p class="banner">Review draft. Not published, not shared with any creator or community. Generated from docs/discovery/minis/*.json, which the engine tests validate.</p>
</header>
${minis.map(concept).join('\n')}
</body></html>
`

fs.writeFileSync(path.join(here, 'storyboards.html'), html)
console.log('docs/discovery/storyboards.html')
