import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('index.json')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 'case-001',
                title: 'The Rosewood Parlor',
                subtitle: 'A peaceful manor interrupted by poison',
                difficulty: 'beginner',
                suspectCount: 5,
                victimName: 'Lord Reginald',
              },
            ]),
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    }))
  })

  it('renders the CaseGrid home screen and case catalog', async () => {
    render(<App />)

    expect(
      await screen.findByRole('heading', {
        name: /solve the scene\.\s*find the killer\./i,
      }),
    ).toBeInTheDocument()

    expect(await screen.findByText('The Rosewood Parlor')).toBeInTheDocument()
    expect(screen.getByText('CASE 01')).toBeInTheDocument()
    expect(screen.getByText('beginner')).toBeInTheDocument()
  })
})
