import { persistentJSON } from '@nanostores/persistent'

interface StoredPositions {
  width: number
  positions: number[]
}

const $worksPositions = persistentJSON<StoredPositions | null>(
  'works-positions',
  null,
)

export function loadPositions(): number[] | null {
  const data = $worksPositions.get()
  if (!data || data.width !== window.innerWidth) {
    return null
  }
  return data.positions
}

export function savePositions(positions: number[]): void {
  $worksPositions.set({ width: window.innerWidth, positions })
}
