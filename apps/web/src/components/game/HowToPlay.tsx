interface HowToPlayProps {
  readonly victimName?: string
}

export function HowToPlay({ victimName }: HowToPlayProps) {
  return (
    <div className="case-intro__rules">
      <p>
        <strong>Investigation objective:</strong> Use the witness clues to place every character on the map.
        Once all characters are placed, accuse the suspect who was alone in the room with {victimName ?? 'the victim'}.
      </p>
      <p>
        Select a character, then tap a cell, or drag them onto the map. Rows run from top to bottom;
        columns run from left to right, both starting at 1. “Beside” means sharing an edge, never a diagonal.
        Objects block their cells. Clue checks and exclusion marks are your notes; check your arrangement when you are ready.
      </p>
    </div>
  )
}
