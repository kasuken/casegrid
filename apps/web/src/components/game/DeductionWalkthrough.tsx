import { useState } from 'react'
import type { Clue, DeductionStep } from '@casegrid/puzzle-engine'

interface DeductionWalkthroughProps {
  readonly steps: readonly DeductionStep[]
  readonly clues: readonly Clue[]
}

export function DeductionWalkthrough({ steps, clues }: DeductionWalkthroughProps) {
  const [open, setOpen] = useState(false)
  const clueNumber = new Map(clues.map((clue, index) => [clue.id, index + 1]))

  return (
    <section className="walkthrough" aria-labelledby="walkthrough-toggle">
      <button
        id="walkthrough-toggle"
        type="button"
        className="btn btn--subtle walkthrough__toggle"
        aria-expanded={open}
        aria-controls="walkthrough-steps"
        onClick={() => setOpen(!open)}
        data-testid="see-deductions-btn"
      >
        {open ? 'Hide the deductions' : 'See the deductions'}
      </button>
      {open && (
        <ol id="walkthrough-steps" className="walkthrough__steps" data-testid="deduction-steps">
          {steps.map((step, index) => (
            <li key={index} className="walkthrough__step">
              <span>{step.text}</span>
              {step.clueIds.length > 0 && (
                <span className="walkthrough__clues">
                  {step.clueIds.length === 1 ? 'Clue ' : 'Clues '}
                  {step.clueIds.map((id) => (clueNumber.get(id) ?? 0).toString().padStart(2, '0')).join(', ')}
                </span>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
