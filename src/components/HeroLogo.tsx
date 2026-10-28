const E1 = 'M100,0 A100,38 0 1,1 -100,0 A100,38 0 1,1 100,0'
const E2 = 'M150,0 A150,58 0 1,1 -150,0 A150,58 0 1,1 150,0'
const ARC = 'M 100 0 A 100 38 0 0 1 -100 0'

function Satellite(p: { path: string; dur: string; begin: string; r: number; fill: string; halo: boolean }) {
  const motion = <animateMotion dur={p.dur} begin={p.begin} repeatCount="indefinite" path={p.path} />
  return (
    <>
      {p.halo && (
        <circle r={p.r + 6} fill="#0b0f17">
          {motion}
        </circle>
      )}
      <circle r={p.r} fill={p.fill}>
        {motion}
      </circle>
    </>
  )
}

function Satellites({ clip }: { clip: 'lgBack' | 'lgFront' }) {
  const halo = clip === 'lgBack'
  return (
    <g clipPath={`url(#${clip})`}>
      <Satellite path={E1} dur="7s" begin="0s" r={11} fill="#4ade80" halo={halo} />
      <Satellite path={E1} dur="7s" begin="-3.2s" r={7} fill="#a78bfa" halo={halo} />
      <Satellite path={E2} dur="13s" begin="-5s" r={6} fill="#22d3ee" halo={halo} />
    </g>
  )
}

export default function HeroLogo() {
  return (
    <svg viewBox="-170 -170 340 340" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
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
