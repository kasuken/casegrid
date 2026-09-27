import { Link } from 'react-router-dom'
import type { PuzzleMetadata } from '@casegrid/puzzle-engine'

export function ComingSoonView({ metadata }: { readonly metadata: PuzzleMetadata }) {
  return (
    <main className="site-shell" data-testid="case-coming-soon">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="CaseGrid home">
          <img className="brand__wordmark" src="/assets/brand/logo-casegrid.svg" width={320} height={80} alt="CaseGrid" />
        </Link>
      </header>
      <section className="intro">
        <p className="intro__context">Coming soon</p>
        <h1>{metadata.title}</h1>
        <p className="intro__summary">
          This case file is still being prepared. The first five cases are ready to investigate.
        </p>
        <Link to="/" className="btn btn--primary">Browse available cases</Link>
      </section>
    </main>
  )
}
