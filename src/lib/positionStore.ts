import { persistentAtom } from '@nanostores/persistent'

// Hover X positions are layout-dependent: invalidated when viewport width changes.
interface StoredHover {
  width: number
  positions: number[]
}

// Scroll offset is independent of layout width and survives resizes.
interface StoredScroll {
  offset: number
}

const $hover = persistentAtom<StoredHover | null>('works-hover', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
})

const $scroll = persistentAtom<StoredScroll | null>('works-scroll', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
})

export function loadHoverPositions(): number[] | null {
  const data = $hover.get()
  if (!data || data.width !== window.innerWidth) {
    return null
  }
  return data.positions
}

export function saveHoverPositions(positions: number[]): void {
  $hover.set({ width: window.innerWidth, positions })
}

export function loadScrollOffset(): number | null {
  return $scroll.get()?.offset ?? null
}

export function saveScrollOffset(offset: number): void {
  $scroll.set({ offset })
}
