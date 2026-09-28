import { beforeEach, describe, expect, it } from 'vitest'
import type { TutorialStep } from '@casegrid/puzzle-engine'
import { useGuideStore } from './guideStore'
import { loadGuideRecord } from '../services/onboardingStorage'

const steps: TutorialStep[] = [
  { id: 'select', title: 'Pick', text: 'Select someone', advanceOn: 'select' },
  { id: 'place', title: 'Place', text: 'Place them', advanceOn: 'place' },
  { id: 'beside', title: 'Beside', text: 'Edges only', advanceOn: 'manual' },
  { id: 'clues', title: 'Clues', text: 'Tick a clue', advanceOn: 'clue' },
]

const g = () => useGuideStore.getState()

describe('guide store', () => {
  beforeEach(() => {
    localStorage.clear()
    useGuideStore.setState({ puzzleId: null, steps: [], visible: false, stepIndex: 0 })
  })

  it('shows the guide for a first visit to a tutorial case and hides it for other cases', () => {
    g().init('case-001', steps)
    expect(g().visible).toBe(true)
    expect(g().stepIndex).toBe(0)

    g().init('case-002', [])
    expect(g().visible).toBe(false)
  })

  it('advances only on the trigger the current step asks for', () => {
    g().init('case-001', steps)
    g().advanceOn('clue')
    expect(g().stepIndex).toBe(0)
    g().advanceOn('select')
    expect(g().stepIndex).toBe(1)
    g().advanceOn('place')
    expect(g().stepIndex).toBe(2)
    g().advanceOn('clue')
    expect(g().stepIndex).toBe(2)
    g().next()
    expect(g().stepIndex).toBe(3)
  })

  it('treats a drag placement as both picking and placing', () => {
    g().init('case-001', steps)
    g().advanceOn('place')
    expect(g().stepIndex).toBe(2)
  })

  it('remembers a skip so experienced players are not shown the guide again', () => {
    g().init('case-001', steps)
    g().skip()
    expect(g().visible).toBe(false)
    expect(loadGuideRecord('case-001')?.status).toBe('dismissed')

    g().init('case-001', steps)
    expect(g().visible).toBe(false)
  })

  it('marks the guide complete after the last step', () => {
    g().init('case-001', steps)
    for (let i = 0; i < steps.length; i++) g().next()
    expect(g().visible).toBe(false)
    expect(loadGuideRecord('case-001')?.status).toBe('completed')
  })

  it('resumes at the saved step after a refresh', () => {
    g().init('case-001', steps)
    g().next()
    g().next()
    useGuideStore.setState({ puzzleId: null, steps: [], visible: false, stepIndex: 0 })

    g().init('case-001', steps)
    expect(g().visible).toBe(true)
    expect(g().stepIndex).toBe(2)
  })

  it('can be reopened after dismissal', () => {
    g().init('case-001', steps)
    g().skip()
    g().reopen()
    expect(g().visible).toBe(true)
    expect(g().stepIndex).toBe(0)
  })

  it('falls back to showing the skippable guide when saved onboarding data is corrupt', () => {
    localStorage.setItem('casegrid_onboarding_v1', '{not json')
    g().init('case-001', steps)
    expect(g().visible).toBe(true)

    localStorage.setItem('casegrid_onboarding_v1', JSON.stringify({ 'case-001': { status: 'weird', step: -3 } }))
    g().init('case-001', steps)
    expect(g().visible).toBe(true)
    expect(g().stepIndex).toBe(0)
  })

  it('clamps a saved step that no longer exists', () => {
    localStorage.setItem('casegrid_onboarding_v1', JSON.stringify({ 'case-001': { status: 'active', step: 40 } }))
    g().init('case-001', steps)
    expect(g().stepIndex).toBe(steps.length - 1)
  })
})
