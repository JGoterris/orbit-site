import { useLayoutEffect, useRef } from 'react'

// Moves an absolutely positioned .slider marker over whichever child of the container matches
// `selector`, so a tab, pill or sidebar highlight slides to its new place. The container has to be
// positioned. With `underline`, the marker keeps its own height and sits on the child's bottom edge.
export function useSlider<C extends HTMLElement>(selector: string, active: unknown, underline = false) {
  const container = useRef<C>(null)
  const marker = useRef<HTMLSpanElement>(null)
  const placed = useRef(false)

  useLayoutEffect(() => {
    const box = container.current
    const mark = marker.current
    if (!box || !mark) return

    const place = () => {
      const el = box.querySelector<HTMLElement>(selector)
      mark.style.display = el ? 'block' : 'none'
      if (!el || !el.offsetWidth) {
        if (!el) placed.current = false
        return
      }
      // the first placement is not a change of state: it lands without sliding from the corner
      const first = !placed.current
      if (first) mark.style.transition = 'none'
      const y = underline ? el.offsetTop + el.offsetHeight - mark.offsetHeight : el.offsetTop
      mark.style.width = `${el.offsetWidth}px`
      if (!underline) mark.style.height = `${el.offsetHeight}px`
      mark.style.transform = `translate(${el.offsetLeft}px, ${y}px)`
      if (first) {
        void mark.offsetWidth
        mark.style.transition = ''
        placed.current = true
      }
    }

    place()
    const resize = new ResizeObserver(place)
    resize.observe(box)
    return () => resize.disconnect()
  }, [selector, active, underline])

  return { container, marker }
}
