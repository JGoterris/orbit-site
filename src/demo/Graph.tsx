import Panel from './Panel'
import { SVCS, T } from './data'
import { paintGraph } from './graph'
import type { Snap } from './sim'

interface Props {
  snap: Snap
  sel: number
  border: string
  onSelect: (i: number) => void
}

export default function Graph({ snap, sel, border, onSelect }: Props) {
  const { rows, hits } = paintGraph(snap, SVCS[sel].id)

  return (
    <Panel
      title="Graph"
      border={border}
      footer={
        <span style={{ whiteSpace: 'pre', color: T.muted }}>
          <span style={{ color: T.cyan }}>─▶</span> needs {'  '}
          <span style={{ color: T.accent2 }}>─▶</span> needed by {'  '}
          <span style={{ color: T.accent }}>j/k</span> move
        </span>
      }
      style={{ flex: 1, minHeight: 0, margin: '10px 0 12px', padding: '14px 12px 10px', display: 'flex', flexDirection: 'column' }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `${T.border} transparent`,
          containerType: 'inline-size',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'safe center',
        }}
      >
        <div
          style={{
            position: 'relative',
            fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
            fontSize: 'max(10.5px, min(14px, calc(100cqw / 60)))',
            lineHeight: 1.2,
            width: 'fit-content',
            margin: '0 auto',
          }}
        >
          {rows.map((segs, y) => (
            <div key={y} style={{ whiteSpace: 'pre', height: '1.2em', lineHeight: '1.2em' }}>
              {segs.map((g, i) => (
                <span
                  key={i}
                  style={{
                    color: g.c,
                    fontWeight: g.w,
                    display: g.ascii ? 'inline' : 'inline-block',
                    width: g.ascii ? 'auto' : '1ch',
                    textAlign: 'center',
                    overflow: 'visible',
                  }}
                >
                  {g.t}
                </span>
              ))}
            </div>
          ))}
          {hits.map((h) => (
            <div
              key={h.name}
              title={h.name}
              onClick={() => onSelect(h.index)}
              style={{ position: 'absolute', left: h.left, top: h.top, width: h.width, height: h.height, cursor: 'pointer' }}
            />
          ))}
        </div>
      </div>
    </Panel>
  )
}
