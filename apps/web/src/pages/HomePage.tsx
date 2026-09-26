import { Link } from 'react-router-dom'
import { CaseGridMark } from '../components/CaseGridMark'

export function HomePage() {
  return (
    <main className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="CaseGrid home">
          <CaseGridMark />
          <span>CaseGrid</span>
        </Link>
        <span className="edition">MVP foundation</span>
      </header>

      <section className="intro" aria-labelledby="intro-title">
        <p className="intro__context">A spatial murder-mystery logic game</p>
        <h1 id="intro-title">
          Solve the scene.
          <br />
          Find the killer.
        </h1>
        <p className="intro__summary">
          Place every suspect, follow the evidence, and discover who was alone
          with the victim. Five original cases are being prepared.
        </p>

        <div className="build-note" role="status">
          <span className="build-note__pin" aria-hidden="true" />
          <div>
            <strong>Investigation setup is ready.</strong>
            <span>The first playable case comes next.</span>
          </div>
        </div>
      </section>

      <div className="board-trace" aria-hidden="true">
        <span className="board-trace__room board-trace__room--one" />
        <span className="board-trace__room board-trace__room--two" />
        <span className="board-trace__room board-trace__room--three" />
        <span className="board-trace__marker board-trace__marker--one" />
        <span className="board-trace__marker board-trace__marker--two" />
      </div>

      <footer className="site-footer">
        <span>CaseGrid</span>
        <span>Static web application</span>
      </footer>
    </main>
  )
}
