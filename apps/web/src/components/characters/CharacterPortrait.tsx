import { useState } from 'react'
import type { Character } from '@casegrid/puzzle-engine'

/** Portraits are assigned in case data: character IDs can repeat across cases. */
export function CharacterPortrait({ character }: { readonly character: Character }) {
  const [failedSource, setFailedSource] = useState<string>()
  const initials = character.name.split(' ').map((word) => word[0]).join('').slice(0, 2)

  return character.avatar && character.avatar !== failedSource ? (
    <img
      className="character-portrait"
      src={character.avatar}
      width={80}
      height={80}
      alt=""
      draggable={false}
      onError={() => setFailedSource(character.avatar)}
    />
  ) : (
    <span className="character-token__initials" aria-hidden="true">{initials}</span>
  )
}
