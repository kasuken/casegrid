import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'

describe('App', () => {
  it('renders the CaseGrid foundation screen', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /solve the scene\.\s*find the killer\./i,
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Investigation setup is ready.'),
    ).toBeInTheDocument()
  })
})
