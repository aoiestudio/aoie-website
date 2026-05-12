const FRAME_DURATION = 1000 / 60
const HOVER_PAD = 22

interface HoverState {
  currentX: number
  targetX: number
  isSlowing: boolean
  rafId: number | null
  prevTime: number | null
}

export function initHover(
  grid: HTMLElement,
  rows: HTMLElement[],
  saved: number[] | null,
  onSave: (positions: number[]) => void,
): { destroy(): void; saveCurrentPositions(): void } {
  const hoverMap = new WeakMap<HTMLElement, HoverState>()
  const cardMap = new WeakMap<HTMLElement, HTMLElement>()
  // Keyed by row so destroy() can removeEventListener with the exact same ref
  const mousemoveHandlers = new Map<HTMLElement, (e: MouseEvent) => void>()

  function getXBounds(row: HTMLElement, card: HTMLElement) {
    const cardWidth = card.offsetWidth || 340
    const rowLeft = row.getBoundingClientRect().left
    return {
      min: HOVER_PAD - rowLeft,
      max: grid.clientWidth - HOVER_PAD - rowLeft - cardWidth,
    }
  }

  function saveCurrentPositions() {
    onSave(rows.map(row => hoverMap.get(row)?.currentX ?? 0))
  }

  function scheduleAnimate(row: HTMLElement, state: HoverState) {
    state.rafId = requestAnimationFrame(t => animateRow(row, state, t))
  }

  function startAnimate(row: HTMLElement, state: HoverState) {
    state.prevTime = null
    scheduleAnimate(row, state)
  }

  // row is used to look up card — not only in recursive calls
  function animateRow(row: HTMLElement, state: HoverState, time: number) {
    const card = cardMap.get(row)
    if (!card) {
      return
    }
    if (state.prevTime === null) {
      state.prevTime = time
    }
    const dt = (time - state.prevTime) / FRAME_DURATION
    state.prevTime = time
    const ease = state.isSlowing ? 0.15 : 0.05
    const delta = state.targetX - state.currentX

    if (Math.abs(delta) < 0.5) {
      state.currentX = state.targetX
      card.style.transform = `translateX(${state.currentX}px)`
      state.rafId = null
      state.prevTime = null
      saveCurrentPositions()
    } else {
      let move = delta * ease * dt
      const minMove = delta > 0 ? 0.5 : -0.5
      if (Math.abs(move) < Math.abs(minMove)) {
        move = minMove
      }
      state.currentX += move
      card.style.transform = `translateX(${state.currentX}px)`
      scheduleAnimate(row, state)
    }
  }

  function registerHover(row: HTMLElement, index: number) {
    const card = row.querySelector<HTMLElement>('.wg-item')
    if (!card) {
      return
    }
    cardMap.set(row, card)
    const { min, max } = getXBounds(row, card)
    const startX =
      saved?.[index] ?? min + Math.random() * Math.max(0, max - min)
    card.style.transform = `translateX(${startX}px)`
    const state: HoverState = {
      currentX: startX,
      targetX: startX,
      isSlowing: false,
      rafId: null,
      prevTime: null,
    }
    hoverMap.set(row, state)

    const handler = (event: MouseEvent) => {
      const { min: mn, max: mx } = getXBounds(row, card)
      const newTarget = Math.max(
        mn,
        Math.min(
          mx,
          event.clientX -
            row.getBoundingClientRect().left -
            card.offsetWidth / 2,
        ),
      )
      if (Math.abs(newTarget - state.targetX) < 1) {
        return
      }
      state.targetX = newTarget
      state.isSlowing = false

      // When one row is hovered, pull all other active rows toward their
      // current position (isSlowing=true uses a higher ease, so they
      // decelerate quickly while the hovered row moves freely).
      for (const other of rows) {
        if (other === row) {
          continue
        }
        const os = hoverMap.get(other)
        if (!os || os.isSlowing) {
          continue
        }
        os.isSlowing = true
        const newPos = os.currentX + (os.targetX - os.currentX) * 0.2
        if (Math.abs(newPos - os.currentX) > 0.5) {
          os.targetX = newPos
          if (os.rafId === null) {
            startAnimate(other, os)
          }
        }
      }

      if (state.rafId === null) {
        startAnimate(row, state)
      }
    }

    mousemoveHandlers.set(row, handler)
    row.addEventListener('mousemove', handler, { passive: true })
  }

  rows.forEach(registerHover)

  return {
    destroy() {
      // Cancel all in-flight animation frames
      rows.forEach(row => {
        const s = hoverMap.get(row)
        if (s !== undefined && s.rafId !== null) {
          cancelAnimationFrame(s.rafId)
        }
      })
      // Remove all mousemove listeners using the stored handler refs
      mousemoveHandlers.forEach((handler, row) => {
        row.removeEventListener('mousemove', handler)
      })
      mousemoveHandlers.clear()
    },
    saveCurrentPositions,
  }
}
