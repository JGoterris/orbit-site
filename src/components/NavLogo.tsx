const ARC = 'M 100 0 A 100 38 0 0 1 -100 0'

export default function NavLogo() {
  return (
    <svg viewBox="0 0 256 256" width="100%" height="100%" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="mnCore" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width={256} height={256} rx={60} fill="#0e131d" stroke="#253043" strokeWidth={6} />
      <g transform="translate(128 128)">
        <g transform="rotate(-28)">
          <ellipse rx={100} ry={38} fill="none" stroke="#94a3b8" strokeOpacity={0.7} strokeWidth={9} />
        </g>
        <circle r={44} fill="none" stroke="url(#mnCore)" strokeWidth={9} />
        <circle r={27} fill="url(#mnCore)" />
        <g transform="rotate(-28)">
          <path d={ARC} fill="none" stroke="#0e131d" strokeWidth={21} />
          <path d={ARC} fill="none" stroke="#94a3b8" strokeOpacity={0.7} strokeWidth={9} />
          <circle cx={94} cy={-13} r={21} fill="#0e131d" />
          <circle cx={94} cy={-13} r={15} fill="#4ade80" />
        </g>
      </g>
    </svg>
  )
}
