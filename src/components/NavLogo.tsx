const ELLIPSE = 'M100,0 A100,38 0 1,1 -100,0 A100,38 0 1,1 100,0'
const ARC = 'M 100 0 A 100 38 0 0 1 -100 0'

function Satellite({ clip }: { clip: 'mnBack' | 'mnFront' }) {
  return (
    <g clipPath={`url(#${clip})`}>
      <circle r={15} fill="#4ade80" stroke="#0e131d" strokeWidth={clip === 'mnFront' ? 6 : 0}>
        <animateMotion dur="4s" repeatCount="indefinite" path={ELLIPSE} />
      </circle>
    </g>
  )
}

export default function NavLogo() {
  return (
    <svg viewBox="0 0 256 256" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="mnCore" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <clipPath id="mnBack">
          <rect x={-200} y={-200} width={400} height={200} />
        </clipPath>
        <clipPath id="mnFront">
          <rect x={-200} y={-1} width={400} height={201} />
        </clipPath>
      </defs>
      <rect width={256} height={256} rx={60} fill="#0e131d" stroke="#253043" strokeWidth={6} />
      <g transform="translate(128 128)">
        <g transform="rotate(-28)">
          <ellipse rx={100} ry={38} fill="none" stroke="#94a3b8" strokeOpacity={0.7} strokeWidth={9} />
          <Satellite clip="mnBack" />
        </g>
        <circle r={44} fill="none" stroke="url(#mnCore)" strokeWidth={9} />
        <circle r={27} fill="url(#mnCore)" />
        <g transform="rotate(-28)">
          <path d={ARC} fill="none" stroke="#0e131d" strokeWidth={21} />
          <path d={ARC} fill="none" stroke="#94a3b8" strokeOpacity={0.7} strokeWidth={9} />
          <Satellite clip="mnFront" />
        </g>
      </g>
    </svg>
  )
}
