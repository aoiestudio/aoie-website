// How many full row-sets the spacer spans; large enough to feel infinite
const MULTIPLIER = 200
// Extra pixels above/below viewport where rows are kept before recycling
const RECYCLE_BUFFER_ROWS = 2

export function initVirtualScroll(
  grid: HTMLElement,
  rows: HTMLElement[],
): { destroy(): void } {
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

  // Switch grid out of grid layout so absolutely placed rows drive the view
  grid.style.display = 'block'

  // Spacer: in-flow div whose height sets scrollHeight
  const spacer = document.createElement('div')
  spacer.className = 'wg-spacer'
  spacer.style.height = N * MULTIPLIER * rowStride + 'px'
  grid.append(spacer)

  // Start at mid-spacer so both directions are infinite
  const initialScrollTop = N * Math.floor(MULTIPLIER / 2) * rowStride
  const virtualYs: number[] = Array.from({ length: N })

  for (let i = 0; i < N; i++) {
    virtualYs[i] = initialScrollTop + topPad + i * rowStride
    const row = rows[i]
    row.style.position = 'absolute'
    row.style.top = '0'
    row.style.left = sidePad + 'px'
    row.style.width = rowWidth + 'px'
    row.style.transform = `translateY(${virtualYs[i]}px)`
  }

  const span = N * rowStride
  const buffer = RECYCLE_BUFFER_ROWS * rowHeight

  function handleScroll() {
    // Clamp to 0 — Safari rubber-band makes scrollTop transiently negative
    const viewTop = Math.max(0, grid.scrollTop)
    const viewBottom = viewTop + grid.clientHeight

    for (let i = 0; i < N; i++) {
      let y = virtualYs[i]

      if (y + rowHeight < viewTop - buffer) {
        const steps = Math.ceil((viewTop - buffer - y - rowHeight) / span)
        y += steps * span
      } else if (y > viewBottom + buffer) {
        const steps = Math.ceil((y - viewBottom - buffer) / span)
        y -= steps * span
      }

      if (y !== virtualYs[i]) {
        virtualYs[i] = y
        rows[i].style.transform = `translateY(${y}px)`
      }
    }
  }

  grid.addEventListener('scroll', handleScroll, { passive: true })

  // Seek to mid-spacer and run one recycling pass to pre-populate both sides
  grid.scrollTop = initialScrollTop
  handleScroll()

  return {
    destroy() {
      grid.removeEventListener('scroll', handleScroll)
    },
  }
}
