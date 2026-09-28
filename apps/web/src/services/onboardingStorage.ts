/**
 * CaseGrid Onboarding Persistence
 * Remembers per-case guide progress so experienced players are not shown it again.
 */

import { z } from 'zod'

const STORAGE_KEY = 'casegrid_onboarding_v1'

const guideRecordSchema = z.object({
  status: z.enum(['active', 'dismissed', 'completed']),
  step: z.number().int().min(0),
})

const onboardingSchema = z.record(z.string(), guideRecordSchema)

export type GuideRecord = z.infer<typeof guideRecordSchema>

function readAll(): Record<string, GuideRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = onboardingSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : {}
  } catch {
    return {}
  }
}

export function loadGuideRecord(puzzleId: string): GuideRecord | null {
  return readAll()[puzzleId] ?? null
}

export function saveGuideRecord(puzzleId: string, record: GuideRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readAll(), [puzzleId]: record }))
  } catch {
    // Storage full or blocked: the guide simply reappears next time.
  }
}
