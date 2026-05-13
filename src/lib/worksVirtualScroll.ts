// How many full row-sets the spacer spans; large enough to feel infinite
const MULTIPLIER = 200
// Extra pixels above/below viewport where rows are kept before recycling
const RECYCLE_BUFFER_ROWS = 2

export function initVirtualScroll(
  grid: HTMLElement,
  rows: HTMLElement[],
  savedScrollOffset?: number | null,
): { destroy(): void; getScrollOffset(): number } {
  // Measure layout while rows are still in normal grid flow
  const cs = getComputedStyle(grid)
  const topPad = Number.parseFloat(cs.paddingTop)
  const sidePad = Number.parseFloat(cs.paddingLeft)
  const rowHeight = rows[0].offsetHeight
  const rowGap =
    rows.length > 1
      ? rows[1].offsetTop - rows[0].offsetTop - rowHeight
      : Number.parseFloat(cs.rowGap) || 0
  const rowStride = rowHeight + rowGap
  const rowWidth = grid.clientWidth - 2 * sidePad

  const N = rows.length
  const span = N * rowStride
  const buffer = RECYCLE_BUFFER_ROWS * rowHeight

  // Switch grid out of grid layout so absolutely placed rows drive the view
  grid.style.display = 'block'

  // Spacer: in-flow div whose height sets scrollHeight
  const spacer = document.createElement('div')
  spacer.className = 'wg-spacer'
  spacer.style.height = N * MULTIPLIER * rowStride + 'px'
  grid.append(spacer)

  // Start at mid-spacer so both directions are infinite
  const initialScrollTop = N * Math.floor(MULTIPLIER / 2) * rowStride
  const startScrollTop =
    savedScrollOffset === null || savedScrollOffset === undefined
      ? initialScrollTop
      : initialScrollTop + savedScrollOffset

  // Seek scroll BEFORE positioning rows so first paint shows them in place.
  grid.scrollTop = startScrollTop

  // Distribute rows around the viewport modulo `span` so both above and below
  // the start position are populated on first paint. Without this, rows only
  // exist below startScrollTop and the user can't scroll up until they first
  // scroll down to trigger recycling.
  const viewTop = startScrollTop
  const virtualYs: number[] = Array.from({ length: N })

  for (let i = 0; i < N; i++) {
    // Base position: place row `i` at row offset `i` from a span-aligned anchor
    // near viewTop, then wrap into [viewTop - buffer, viewTop - buffer + span).
    const anchor = Math.floor((viewTop - buffer - topPad) / span) * span
    let y = anchor + topPad + i * rowStride
    while (y < viewTop - buffer) {
      y += span
    }
    while (y >= viewTop - buffer + span) {
      y -= span
    }
    virtualYs[i] = y

    const row = rows[i]
    row.style.position = 'absolute'
    row.style.top = '0'
    row.style.left = sidePad + 'px'
    row.style.width = rowWidth + 'px'
    row.style.transform = `translateY(${y}px)`
  }

  function handleScroll() {
    // Clamp to 0 — Safari rubber-band makes scrollTop transiently negative
    const top = Math.max(0, grid.scrollTop)
    const bottom = top + grid.clientHeight

    for (let i = 0; i < N; i++) {
      let y = virtualYs[i]

      if (y + rowHeight < top - buffer) {
        const steps = Math.ceil((top - buffer - y - rowHeight) / span)
        y += steps * span
      } else if (y > bottom + buffer) {
        const steps = Math.ceil((y - bottom - buffer) / span)
        y -= steps * span
      }

      if (y !== virtualYs[i]) {
        virtualYs[i] = y
        rows[i].style.transform = `translateY(${y}px)`
      }
    }
  }

  grid.addEventListener('scroll', handleScroll, { passive: true })

  // Pre-populate viewport edges in case the seeded distribution above missed
  // any rows (e.g. start position not span-aligned).
  handleScroll()

  return {
    destroy() {
      grid.removeEventListener('scroll', handleScroll)
    },
    getScrollOffset() {
      return grid.scrollTop - initialScrollTop
    },
  }
}
