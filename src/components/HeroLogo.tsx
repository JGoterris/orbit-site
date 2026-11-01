import { useLayoutEffect, useRef } from 'react'
import { reducedMotion } from '../lib/motion'
import { READY_AT, logoClock } from './logoClock'

const ARC = 'M 100 0 A 100 38 0 0 1 -100 0'

const E1 = { a: 100, b: 38 }
const E2 = { a: 150, b: 58 }

// `rest` is where each one sits when nothing moves; the first two match the positions in logo.svg.
const SATELLITES = [
  { orbit: E1, period: 7000, r: 11, fill: '#4ade80', launch: 0, rest: Math.atan2(-13 / E1.b, 94 / E1.a) },
  { orbit: E1, period: 7000, r: 7, fill: '#a78bfa', launch: 260, rest: Math.atan2(18 / E1.b, -88 / E1.a) },
  { orbit: E2, period: 13000, r: 6, fill: '#22d3ee', launch: 520, rest: 2.4 },
]

// Launched at (1 + BOOST) times their cruise speed, slowing down with this time constant.
const BOOST = 7
const SLOWDOWN = 260
const GROW = 180
const MAX_STEP = 250

function Satellites({ clip }: { clip: 'lgBack' | 'lgFront' }) {
  return (
    <g clipPath={`url(#${clip})`}>
      {SATELLITES.map((s, i) => (
        <g key={i}>
          {clip === 'lgBack' && <circle data-sat={i} data-r={s.r + 6} r={0} fill="#0b0f17" />}
          <circle data-sat={i} data-r={s.r} r={0} fill={s.fill} />
        </g>
      ))}
    </g>
  )
}

export default function HeroLogo({ onReady }: { onReady: () => void }) {
  const svg = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const root = svg.current
    if (!root) return
    const circles = SATELLITES.map((_, i) => [...root.querySelectorAll<SVGCircleElement>(`[data-sat="${i}"]`)])

    const put = (i: number, angle: number, scale: number) => {
      const { orbit } = SATELLITES[i]
      for (const c of circles[i]) {
        c.setAttribute('cx', String(orbit.a * Math.cos(angle)))
        c.setAttribute('cy', String(orbit.b * Math.sin(angle)))
        c.setAttribute('r', String(Number(c.dataset.r) * scale))
      }
    }

    if (reducedMotion()) {
      root.setCurrentTime(0)
      root.pauseAnimations()
      SATELLITES.forEach((s, i) => put(i, s.rest, 1))
      return
    }

    const draw = () =>
      SATELLITES.forEach((s, i) => {
        const t = logoClock.elapsed - s.launch
        if (t <= 0) return put(i, s.rest, 0)
        const speed = (2 * Math.PI) / s.period
        // integral of the decaying speed, offset so each one reaches `rest` at cruise speed
        const angle = s.rest + speed * (t - BOOST * SLOWDOWN * Math.exp(-t / SLOWDOWN))
        const grown = Math.min(1, t / GROW)
        put(i, angle, 1 - (1 - grown) ** 3)
      })

    let frame = 0
    let last = 0
    const tick = (now: number) => {
      logoClock.elapsed += Math.min(now - last, MAX_STEP)
      last = now
      draw()
      if (logoClock.elapsed >= READY_AT) onReady()
      frame = requestAnimationFrame(tick)
    }
    draw()

    // the breathing and the orbits only run while the logo can be seen
    const view = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(frame)
      if (e.isIntersecting) {
        root.unpauseAnimations()
        last = performance.now()
        frame = requestAnimationFrame(tick)
      } else {
        root.pauseAnimations()
      }
    })
    view.observe(root)

    return () => {
      view.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [onReady])

  return (
    <svg ref={svg} viewBox="-170 -170 340 340" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <linearGradient id="lgCore" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="lgRing" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a78bfa" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#94a3b8" stopOpacity={0.9} />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <radialGradient id="lgGlow">
          <stop offset="0" stopColor="#a78bfa" stopOpacity={0.35} />
          <stop offset="0.5" stopColor="#22d3ee" stopOpacity={0.08} />
          <stop offset="1" stopColor="#22d3ee" stopOpacity={0} />
        </radialGradient>
        <clipPath id="lgBack">
          <rect x={-200} y={-200} width={400} height={200} />
        </clipPath>
        <clipPath id="lgFront">
          <rect x={-200} y={-1} width={400} height={201} />
        </clipPath>
      </defs>
      <circle r={165} fill="url(#lgGlow)">
        <animate attributeName="r" values="150;168;150" dur="6s" repeatCount="indefinite" />
      </circle>
      <g transform="rotate(-28)">
        <ellipse rx={150} ry={58} fill="none" stroke="#253043" strokeWidth={1.5} strokeDasharray="2 7" />
        <ellipse rx={100} ry={38} fill="none" stroke="url(#lgRing)" strokeWidth={7} />
        <Satellites clip="lgBack" />
      </g>
      <circle r={44} fill="none" stroke="url(#lgCore)" strokeWidth={7} />
      <circle r={27} fill="url(#lgCore)">
        <animate attributeName="r" values="25;29;25" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <circle r={56} fill="none" stroke="#22d3ee" strokeOpacity={0.5} strokeWidth={1}>
        <animate attributeName="r" values="46;78" dur="3.2s" repeatCount="indefinite" />
        <animate attributeName="stroke-opacity" values="0.5;0" dur="3.2s" repeatCount="indefinite" />
      </circle>
      <g transform="rotate(-28)">
        <path d={ARC} fill="none" stroke="#0b0f17" strokeWidth={19} />
        <path d={ARC} fill="none" stroke="url(#lgRing)" strokeWidth={7} />
        <Satellites clip="lgFront" />
      </g>
    </svg>
  )
}
