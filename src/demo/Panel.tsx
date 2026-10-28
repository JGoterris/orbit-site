import type { CSSProperties, ReactNode } from 'react'
import { T } from './data'

const label: CSSProperties = {
  position: 'absolute',
  left: 10,
  background: T.panel,
  padding: '0 4px',
  lineHeight: '18px',
  zIndex: 1,
}

interface PanelProps {
  title: ReactNode
  footer?: ReactNode
  border?: string
  style?: CSSProperties
  children: ReactNode
}

// A bordered box whose title (and optional footer) sits on top of the border, like the TUI panels.
export default function Panel({ title, footer, border = T.border, style, children }: PanelProps) {
  return (
    <div style={{ position: 'relative', border: `1px solid ${border}`, ...style }}>
      <span style={{ ...label, top: -10, whiteSpace: 'pre' }}>{title}</span>
      {children}
      {footer != null && <span style={{ ...label, bottom: -10, left: 'auto', right: 10 }}>{footer}</span>}
    </div>
  )
}
