/**
 * CaseGrid Result Sharing
 * Builds spoiler-free share content. Only public catalog facts and the player's own
 * stats go in; never the murderer, placements, or deductions.
 */

export interface ShareInput {
  readonly caseId: string
  readonly caseNumber: string
  readonly title: string
  readonly elapsedSeconds: number
  readonly mistakes: number
  /** Omitted when the case has no nudges, so the count is never misleading. */
  readonly nudgesUsed?: number
  readonly origin: string
}

export interface ShareContent {
  readonly title: string
  readonly text: string
  readonly url: string
  readonly imageAlt: string
}

export function formatDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function caseUrl(origin: string, caseId: string): string {
  return `${origin.replace(/\/$/, '')}/case/${encodeURIComponent(caseId)}`
}

export function buildShareContent(input: ShareInput): ShareContent {
  const time = formatDuration(input.elapsedSeconds)
  const stats = [`CASE CLOSED in ${time}`, plural(input.mistakes, 'mistake')]
  if (input.nudgesUsed !== undefined) stats.push(plural(input.nudgesUsed, 'nudge'))

  const heading = `CaseGrid · Case ${input.caseNumber}: ${input.title}`
  const url = caseUrl(input.origin, input.caseId)

  return {
    title: heading,
    text: `${heading}\n${stats.join(' · ')}\nCan you solve this case?`,
    url,
    imageAlt: `CASE CLOSED card for Case ${input.caseNumber}, ${input.title}: ${stats.slice(1).join(', ')}, solved in ${time}. Can you solve this case?`,
  }
}
