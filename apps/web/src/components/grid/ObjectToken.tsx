import type { MapObject } from '@casegrid/puzzle-engine'

interface ObjectTokenProps {
  readonly object: MapObject
}

const OBJECT_ASSETS: Readonly<Record<string, string>> = {
  fountain: '/assets/objects/obj-fountain.svg',
  globe: '/assets/objects/obj-globe.svg',
  bookshelf: '/assets/objects/obj-bookshelf.svg',
  billiard_table: '/assets/objects/obj-billiard-table.svg',
  fireplace: '/assets/objects/obj-fireplace.svg',
  clock: '/assets/objects/obj-clock.svg',
  t_rex_skull: '/assets/objects/obj-t-rex-skull.svg',
  display_case: '/assets/objects/obj-display-case.svg',
  sarcophagus: '/assets/objects/obj-sarcophagus.svg',
  desk: '/assets/objects/obj-desk.svg',
  piano: '/assets/objects/obj-piano.svg',
  couch: '/assets/objects/obj-couch.svg',
  prop_trunk: '/assets/objects/obj-prop-trunk.svg',
  lighthouse_lamp: '/assets/objects/obj-lighthouse-lamp.svg',
  telegraph: '/assets/objects/obj-telegraph.svg',
  steam_engine: '/assets/objects/obj-steam-engine.svg',
  window: '/assets/objects/obj-window.svg',
  safe: '/assets/objects/obj-safe.svg',
  curtain: '/assets/objects/obj-curtain.svg',
  nautical_wheel: '/assets/objects/obj-nautical-wheel.svg',
}

export function ObjectToken({ object }: ObjectTokenProps) {
  const source = OBJECT_ASSETS[object.type]
  const label = object.label ?? object.type

  return (
    <div
      className="object-token"
      aria-label={`${label} (Environmental object, cell blocked)`}
      title={`${label} (Blocked cell)`}
    >
      {source && <img className="object-token__art" src={source} width={80} height={80} alt="" draggable={false} />}
      <span className="object-token__label">{label}</span>
    </div>
  )
}
