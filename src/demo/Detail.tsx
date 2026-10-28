import Panel from './Panel'
import { BY, SPARK, SVCS, T, dur, look, ready } from './data'
import type { Snap } from './sim'

export default function Detail({ snap, sel }: { snap: Snap; sel: number }) {
  const x = SVCS[sel]
  const z = snap.st[x.id]
  const lk = look(x, z, snap.tick)
  const up = ready(z.status) && !x.oneshot
  const hs = snap.hist[x.id]
  const cpu = up ? (hs[hs.length - 1] || 0) * 1.2 : 0
  const memBars = Math.round(up && x.mem ? Math.min(1, x.mem / 60) * 10 : 0)
  const spark = hs
    .map((v) => SPARK[Math.min(7, Math.floor((up ? v : 0) * 8))])
    .join('')
    .padStart(12, '▁')
  const dim = { color: T.dim }

  return (
    <Panel
      title={x.id}
      style={{ margin: '10px 0 0', padding: '8px 12px', display: 'flex', flexDirection: 'column', whiteSpace: 'pre' }}
    >
      <div>
        <span style={{ color: lk.color, fontWeight: 600 }}>
          <span style={{ display: 'inline-block', width: '1ch', textAlign: 'center' }}>{lk.icon}</span> {lk.label}
        </span>
        <span>{`  ${up ? dur(snap.now - z.at) : ''}   `}</span>
        <span style={{ color: x.kind === 'docker' ? T.cyan : T.accent }}>{x.oneshot ? 'oneshot' : x.kind}</span>
      </div>
      <div style={{ display: 'flex' }}>
        <span style={{ color: T.accent2, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {x.what}
        </span>
        <span style={dim}>{`  in ${x.cwd}`}</span>
      </div>
      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        <span style={dim}>port </span>
        <span style={{ color: T.cyan }}>{x.port ? ':' + x.port : '—'}</span>
        <span style={dim}>{'   health '}</span>
        <span>{x.health}</span>
      </div>
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <span style={dim}>needs </span>
        {x.deps.map((n) => (
          <span key={n} style={{ color: look(BY[n], snap.st[n], snap.tick).color }}>{`● ${n}  `}</span>
        ))}
        {!x.deps.length && <span style={dim}>—</span>}
      </div>
      <div> </div>
      <div style={{ display: 'flex' }}>
        <span style={dim}>cpu </span>
        <span style={{ color: T.green, letterSpacing: -0.5 }}>{spark}</span>
        <span style={{ width: '8ch', textAlign: 'right' }}>{cpu.toFixed(1) + '%'}</span>
        <span style={dim}>{'     mem '}</span>
        <span style={{ color: T.accent }}>{'█'.repeat(memBars)}</span>
        <span style={{ color: T.border }}>{'░'.repeat(10 - memBars)}</span>
        <span style={{ width: '7ch', textAlign: 'right' }}>{up && x.mem ? x.mem + 'M' : '0B'}</span>
      </div>
    </Panel>
  )
}
