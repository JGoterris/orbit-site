import { useEffect, useState, useSyncExternalStore } from 'react'
import { Sim } from './sim'

export function useSimulation(autoStart = true) {
  const [sim] = useState(() => new Sim())
  const snap = useSyncExternalStore(sim.subscribe, sim.getSnapshot)

  useEffect(() => {
    const iv = setInterval(() => sim.tick(), 220)
    const to = autoStart ? setTimeout(sim.startAll, 900) : undefined
    return () => {
      clearInterval(iv)
      clearTimeout(to)
    }
  }, [sim, autoStart])

  return { sim, snap }
}
