/**
 * CaseGrid Share Card
 * Draws a spoiler-free CASE CLOSED card on a canvas. Loaded on demand from the result screen.
 */

export interface ShareCardInput {
  readonly caseNumber: string
  readonly title: string
  readonly subtitle?: string
  readonly difficulty: string
  readonly time: string
  readonly mistakes: number
  readonly nudges?: number
  readonly linkLabel: string
}

const SIZE = 1080
const INK = '#18272d'
const PAPER = '#efe5d0'
const CARD = '#fbf8f0'
const EVIDENCE = '#b84435'
const BRASS = '#b88b36'
const SERIF = 'Georgia, "Times New Roman", serif'
const SANS = 'Inter, "Helvetica Neue", Arial, sans-serif'

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, '')}…`
    return kept
  }
  return lines
}

function spaced(ctx: CanvasRenderingContext2D, value: string): void {
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = value
}

export function renderShareCard(input: ShareCardInput): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas is not available'))

  // Paper and faint board grid
  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, SIZE, SIZE)
  ctx.strokeStyle = 'rgba(24, 39, 45, 0.07)'
  ctx.lineWidth = 2
  for (let p = 60; p < SIZE; p += 60) {
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, SIZE)
    ctx.moveTo(0, p)
    ctx.lineTo(SIZE, p)
    ctx.stroke()
  }

  // Card with offset ink shadow
  const x = 90
  const y = 90
  const w = SIZE - 196
  const h = SIZE - 196
  ctx.fillStyle = INK
  ctx.fillRect(x + 16, y + 16, w, h)
  ctx.fillStyle = CARD
  ctx.fillRect(x, y, w, h)
  ctx.strokeStyle = INK
  ctx.lineWidth = 6
  ctx.strokeRect(x, y, w, h)
  ctx.fillStyle = EVIDENCE
  ctx.fillRect(x, y, 14, h)

  const left = x + 64
  const inner = w - 110

  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = INK
  ctx.font = `700 30px ${SANS}`
  spaced(ctx, '6px')
  ctx.fillText('CASEGRID', left, y + 84)
  ctx.fillStyle = EVIDENCE
  ctx.font = `700 28px ${SANS}`
  spaced(ctx, '4px')
  ctx.fillText(`CASE ${input.caseNumber} · ${input.difficulty.toUpperCase()}`, left, y + 134)
  spaced(ctx, '0px')

  ctx.fillStyle = INK
  ctx.font = `700 72px ${SERIF}`
  let cursor = y + 222
  for (const line of wrap(ctx, input.title, inner, 2)) {
    ctx.fillText(line, left, cursor)
    cursor += 82
  }
  if (input.subtitle) {
    ctx.fillStyle = 'rgba(24, 39, 45, 0.72)'
    ctx.font = `italic 32px ${SERIF}`
    for (const line of wrap(ctx, input.subtitle, inner, 2)) {
      ctx.fillText(line, left, cursor)
      cursor += 42
    }
  }

  // Rubber stamp
  ctx.save()
  ctx.translate(x + w / 2, y + 500)
  ctx.rotate((-7 * Math.PI) / 180)
  ctx.font = `900 78px ${SERIF}`
  spaced(ctx, '8px')
  const stampWidth = ctx.measureText('CASE CLOSED').width + 80
  ctx.strokeStyle = EVIDENCE
  ctx.lineWidth = 7
  ctx.strokeRect(-stampWidth / 2, -72, stampWidth, 120)
  ctx.lineWidth = 3
  ctx.strokeRect(-stampWidth / 2 + 14, -58, stampWidth - 28, 92)
  ctx.fillStyle = EVIDENCE
  ctx.textAlign = 'center'
  ctx.fillText('CASE CLOSED', 0, 16)
  ctx.restore()
  spaced(ctx, '0px')
  ctx.textAlign = 'left'

  // Stats
  const stats: [string, string][] = [
    ['TIME', input.time],
    ['MISTAKES', String(input.mistakes)],
  ]
  if (input.nudges !== undefined) stats.push(['NUDGES', String(input.nudges)])
  const gap = 24
  const boxW = (inner - gap * (stats.length - 1)) / stats.length
  const boxY = y + 612
  stats.forEach(([label, value], i) => {
    const bx = left + i * (boxW + gap)
    ctx.fillStyle = PAPER
    ctx.fillRect(bx, boxY, boxW, 118)
    ctx.strokeStyle = 'rgba(24, 39, 45, 0.25)'
    ctx.lineWidth = 2
    ctx.strokeRect(bx, boxY, boxW, 118)
    ctx.fillStyle = 'rgba(24, 39, 45, 0.7)'
    ctx.font = `700 22px ${SANS}`
    spaced(ctx, '3px')
    ctx.fillText(label, bx + 24, boxY + 42)
    spaced(ctx, '0px')
    ctx.fillStyle = INK
    ctx.font = `700 48px ${SERIF}`
    ctx.fillText(value, bx + 24, boxY + 96)
  })

  ctx.fillStyle = EVIDENCE
  ctx.font = `700 40px ${SERIF}`
  ctx.fillText('Can you solve this case?', left, y + h - 84)
  ctx.fillStyle = BRASS
  ctx.fillRect(left, y + h - 66, 120, 4)
  ctx.fillStyle = 'rgba(24, 39, 45, 0.75)'
  ctx.font = `500 26px ${SANS}`
  ctx.fillText(input.linkLabel, left, y + h - 28)

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png')
  })
}
