type IconName = 'cell-excluded' | 'clue-unresolved' | 'clue-resolved' | 'timer' | 'mistakes' | 'restart' | 'back' | 'hint'

export function AssetIcon({ name, size = 20 }: { readonly name: IconName; readonly size?: number }) {
  return <img className="asset-icon" src={`/assets/ui/icon-${name}.svg`} width={size} height={size} alt="" aria-hidden="true" draggable={false} />
}
