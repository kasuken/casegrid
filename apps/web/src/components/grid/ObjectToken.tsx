import type { MapObject } from '@casegrid/puzzle-engine'

interface ObjectTokenProps {
  readonly object: MapObject
}

const OBJECT_ICONS: Record<string, string> = {
  fountain: '⛲',
  globe: '🌐',
  bookshelf: '📚',
  billiard_table: '🎱',
  fireplace: '🔥',
  clock: '🕰️',
  safe: '🗄️',
  desk: '🪑',
  plant: '🌿',
  window: '🪟',
  sarcophagus: '🏺',
  display_case: '💎',
  steam_engine: '🚂',
  couch: '🛋️',
  telegraph: '📟',
  nautical_wheel: '☸️',
  lighthouse_lamp: '🏮',
  prop_trunk: '🧳',
  curtain: '🎭',
}

export function ObjectToken({ object }: ObjectTokenProps) {
  const icon = OBJECT_ICONS[object.type] ?? '📦'
  const label = object.label ?? object.type

  return (
    <div
      className="object-token"
      aria-label={`${label} (Environmental object, cell blocked)`}
      title={`${label} (Blocked cell)`}
    >
      <span className="object-token__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="object-token__label">{label}</span>
    </div>
  )
}
