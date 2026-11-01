import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'
import { Sim } from './sim'

// The stack boots the first time `target` is on screen, so the startup order can actually be seen.
export function useSimulation(target: RefObject<HTMLElement | null>) {
  const [sim] = useState(() => new Sim())
  const snap = useSyncExternalStore(sim.subscribe, sim.getSnapshot)

  useEffect(() => {
    const iv = setInterval(() => sim.tick(), 220)
    const seen = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        seen.disconnect()
        sim.startAll()
      },
      { threshold: 0.35 },
    )
    if (target.current) seen.observe(target.current)
    return () => {
      clearInterval(iv)
      seen.disconnect()
    }
  }, [sim, target])

  return { sim, snap }
}
