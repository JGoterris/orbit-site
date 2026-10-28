import Panel from './Panel'
import { BY, SVCS, T, type Level } from './data'
import type { Snap } from './sim'

const COLOR: Record<Level, string> = { '': T.text, err: T.red, warn: T.yellow, ok: T.green, dim: T.muted }

interface Props {
  snap: Snap
  sel: number
  all: boolean
  // the Logs tab hints at the `a` toggle in its title, the dashboard does not
  hint: boolean
  lines: number
}

export default function LogPane({ snap, sel, all, hint, lines }: Props) {
  const id = SVCS[sel].id
  const scoped = all ? snap.logs : snap.logs.filter((l) => l.id === id)
  const title = all
    ? `Logs · all services${hint ? '  (a: only selected)' : ''}`
    : `Logs · ${id}${hint ? '  (a: all)' : ''}`

  return (
    <Panel
      title={title}
      footer={`${scoped.length} lines · following`}
      style={{
        flex: 1,
        minHeight: 0,
        margin: '14px 0 12px',
        padding: '6px 12px 10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        {scoped.slice(-lines).map((l) => (
          <div key={l.k} style={{ whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
            {all && <span style={{ color: BY[l.id].c }}>{`[${l.id}] `}</span>}
            <span style={{ color: COLOR[l.level] }}>{l.text}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}
