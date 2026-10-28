import Panel from './Panel'
import { SVCS, T, dur, look, ready } from './data'
import type { Snap } from './sim'

interface Props {
  snap: Snap
  sel: number
  full: boolean
  mobile: boolean
  border: string
  up: number
  onSelect: (i: number) => void
}

const cell = (width: string, color: string, extra?: object) => ({
  color,
  width,
  ...extra,
})

export default function ServiceList({ snap, sel, full, mobile, border, up, onSelect }: Props) {
  return (
    <Panel
      title={`Services ${up}/${SVCS.length}`}
      border={border}
      style={{
        flex: `0 0 ${mobile ? 'auto' : full ? '46%' : '190px'}`,
        minWidth: 0,
        margin: mobile ? '10px 0 4px' : '10px 4px 2px 0',
        padding: '6px 0 4px',
      }}
    >
      {SVCS.map((x, i) => {
        const z = snap.st[x.id]
        const lk = look(x, z, snap.tick)
        const h = snap.hist[x.id]
        const last = h[h.length - 1] || 0
        const on = (ready(z.status) && !x.oneshot) || z.status === 'starting'
        const isSel = i === sel
        const mem = on && x.mem ? (x.mem < 10 ? x.mem.toFixed(1) : Math.round(x.mem * (0.97 + last * 0.06))) + 'M' : ''
        const uptime = on && z.status !== 'starting' ? dur(snap.now - z.at) : z.status === 'stopped' ? '' : lk.label
        const docker = x.kind === 'docker'

        return (
          <div
            key={x.id}
            onClick={() => onSelect(i)}
            style={{
              display: 'flex',
              whiteSpace: 'pre',
              cursor: 'pointer',
              background: isSel ? T.sel : 'transparent',
              overflow: 'hidden',
            }}
          >
            <span style={{ color: isSel ? T.accent : 'transparent' }}>▌</span>
            <span style={{ color: lk.color, display: 'inline-block', width: '1ch', textAlign: 'center' }}>{lk.icon}</span>
            <span> </span>
            <span
              style={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: isSel ? 700 : 400,
              }}
            >
              {x.id}
            </span>
            {full ? (
              <>
                <span style={cell('5ch', docker ? T.cyan : T.accent)}>{docker ? 'dock' : 'proc'}</span>
                <span style={cell('7ch', T.muted)}>{x.port ? ':' + x.port : ''}</span>
                <span style={cell('4ch', T.muted, { textAlign: 'right' })}>{on ? Math.round(last * 1.2) + '%' : ''}</span>
                <span style={cell('7ch', T.dim, { textAlign: 'right' })}>{mem} </span>
                <span style={cell('8ch', z.status === 'crashed' ? T.red : T.dim, { paddingLeft: '1ch' })}>{uptime}</span>
              </>
            ) : (
              <span style={cell('7ch', T.muted)}>{x.port ? ':' + x.port : ''}</span>
            )}
          </div>
        )
      })}
    </Panel>
  )
}
