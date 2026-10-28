import type { ReactNode } from 'react'

export default function Pill({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: 11,
        color,
        border: `1px solid ${color}55`,
        padding: '1px 7px',
        borderRadius: 99,
      }}
    >
      {children}
    </span>
  )
}
