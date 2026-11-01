import { reducedMotion } from '../lib/motion'

export const READY_AT = 1100

// Kept across visits to the page: the launch plays once per load and the orbits carry on from there.
export const logoClock = { elapsed: 0 }

export const logoReady = () => logoClock.elapsed >= READY_AT || reducedMotion()
