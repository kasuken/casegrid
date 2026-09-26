import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <p>That case file does not exist.</p>
      <h1>Nothing to investigate here.</h1>
      <Link to="/">Return to CaseGrid</Link>
    </main>
  )
}
