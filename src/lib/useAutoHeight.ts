import { useEffect, useRef } from 'react'

// Lets `outer` follow the height of `inner` through a CSS transition (.auto-height), so what sits
// below moves instead of jumping when the content changes.
export function useAutoHeight() {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const o = outer.current
    const i = inner.current
    if (!o || !i) return
    const ro = new ResizeObserver(() => {
      o.style.height = `${i.offsetHeight}px`
    })
    ro.observe(i)
    return () => ro.disconnect()
  }, [])

  return { outer, inner }
}
