/**
 * CaseGrid Onboarding Guide Store
 * Drives the skippable, re-openable coach for cases that author a tutorial.
 */

import { create } from 'zustand'
import type { TutorialStep, TutorialTrigger } from '@casegrid/puzzle-engine'
import { loadGuideRecord, saveGuideRecord, type GuideRecord } from '../services/onboardingStorage'

interface GuideState {
  readonly puzzleId: string | null
  readonly steps: readonly TutorialStep[]
  readonly visible: boolean
  readonly stepIndex: number

  init: (puzzleId: string, steps: readonly TutorialStep[]) => void
  next: () => void
  skip: () => void
  reopen: () => void
  advanceOn: (trigger: TutorialTrigger) => void
}

function persist(puzzleId: string | null, record: GuideRecord): void {
  if (puzzleId) saveGuideRecord(puzzleId, record)
}

export const useGuideStore = create<GuideState>((set, get) => ({
  puzzleId: null,
  steps: [],
  visible: false,
  stepIndex: 0,

  init: (puzzleId, steps) => {
    const record = steps.length > 0 ? loadGuideRecord(puzzleId) : null
    const active = steps.length > 0 && (!record || record.status === 'active')
    set({
      puzzleId,
      steps,
      visible: active,
      stepIndex: active && record ? Math.min(record.step, steps.length - 1) : 0,
    })
  },

  next: () => {
    const { puzzleId, steps, stepIndex, visible } = get()
    if (!visible) return
    if (stepIndex >= steps.length - 1) {
      set({ visible: false, stepIndex: 0 })
      persist(puzzleId, { status: 'completed', step: 0 })
      return
    }
    set({ stepIndex: stepIndex + 1 })
    persist(puzzleId, { status: 'active', step: stepIndex + 1 })
  },

  skip: () => {
    const { puzzleId } = get()
    set({ visible: false, stepIndex: 0 })
    persist(puzzleId, { status: 'dismissed', step: 0 })
  },

  reopen: () => {
    const { puzzleId, steps } = get()
    if (steps.length === 0) return
    set({ visible: true, stepIndex: 0 })
    persist(puzzleId, { status: 'active', step: 0 })
  },

  advanceOn: (trigger) => {
    const { steps, stepIndex, visible, next } = get()
    if (!visible) return
    const current = steps[stepIndex]?.advanceOn
    if (current === trigger) {
      next()
    } else if (trigger === 'place' && current === 'select') {
      // Dragging a portrait straight onto the map both picks and places
      next()
      if (get().steps[get().stepIndex]?.advanceOn === 'place') get().next()
    }
  },
}))
