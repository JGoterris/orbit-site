import { useLayoutEffect, useRef } from 'react'
import { fx, reducedMotion } from './motion'

const VISIBLE_AREA = 0.94
const STAGGER = 50
const MAX_DELAY = 200

const visited = new Set<string>()

// The one entrance of the site: [data-reveal] elements rise and fade in as they scroll into view.
// What is already on screen when the page opens is just there, a page only plays it on its first
// visit, and what you jump past is shown without making you wait for it. Runs after every render so
// elements that appear later (fetched cards) are picked up too, and those rise in even if on screen.
// Layout effects, so nothing is painted for a frame before it gets hidden.
export function useReveal() {
  const io = useRef<IntersectionObserver>(undefined)
  const seen = useRef(new WeakSet<Element>())
  const skip = useRef<boolean>(undefined)
  const opened = useRef(false)

  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const batches = new Map<Element | null, number>()
        for (const e of entries) {
          const passed = !e.isIntersecting && e.boundingClientRect.height > 0 && e.boundingClientRect.bottom < 0
          if (!e.isIntersecting && !passed) continue
          const el = e.target
          observer.unobserve(el)
          seen.current.add(el)
          el.removeAttribute('data-pending')
          if (passed) continue
          const group = el.closest('[data-reveal-group]') ?? el.parentElement
          const n = batches.get(group) ?? 0
          batches.set(group, n + 1)
          fx(
            el,
            [
              { opacity: 0, transform: 'translateY(14px)' },
              { opacity: 1, transform: 'none' },
            ],
            420,
            Math.min(n * STAGGER, MAX_DELAY),
          )
        }
      },
      { rootMargin: `0px 0px -${Math.round((1 - VISIBLE_AREA) * 100)}% 0px` },
    )
    io.current = observer
    return () => observer.disconnect()
  }, [])

  useLayoutEffect(() => {
    if (skip.current === undefined) {
      skip.current = visited.has(location.pathname) || reducedMotion()
      visited.add(location.pathname)
    }
    if (skip.current) return
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      if (seen.current.has(el)) return
      if (el.hasAttribute('data-pending')) {
        io.current?.observe(el)
        return
      }
      if (!opened.current && el.getBoundingClientRect().top < innerHeight * VISIBLE_AREA) {
        seen.current.add(el)
        return
      }
      el.setAttribute('data-pending', '')
      io.current?.observe(el)
    })
    opened.current = true
  })
}
