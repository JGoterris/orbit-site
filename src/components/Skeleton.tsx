import type { CSSProperties } from 'react'

function Bar({ width, height = 14, style }: { width: string; height?: number; style?: CSSProperties }) {
  return <div className="skeleton-bar" style={{ width, height, borderRadius: 6, ...style }} />
}

// The shape of a rendered markdown page, while it loads.
export function ArticleSkeleton({ title = true }: { title?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
      {title && <Bar width="55%" height={40} style={{ marginBottom: 14 }} />}
      <Bar width="100%" />
      <Bar width="94%" />
      <Bar width="72%" style={{ marginBottom: 14 }} />
      <Bar width="100%" />
      <Bar width="88%" />
      <Bar width="40%" />
    </div>
  )
}

// The shape of a plugin card.
export function PluginCardSkeleton() {
  return (
    <div
      style={{
        border: '1px solid #1e2836',
        borderRadius: 12,
        background: '#0e131d',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <Bar width="35%" height={22} />
      <Bar width="55%" height={15} />
      <div style={{ flex: 1, padding: '4px 0' }}>
        <Bar width="92%" />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #1a2230', paddingTop: 12 }}>
        <Bar width="70%" />
        <Bar width="52px" height={28} style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  )
}
