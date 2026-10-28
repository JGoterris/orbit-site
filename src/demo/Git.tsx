import type { ReactNode } from 'react'
import Panel from './Panel'
import { T } from './data'
import { REPOS, type Git } from './git'

interface Part {
  t: string
  c: string
  w?: string
  weight?: number
}

interface RowData {
  selected: boolean
  parts: Part[]
}

const part = (t: string, c: string, w?: string, weight?: number): Part => ({ t, c, w, weight })

function Row({ selected, parts }: RowData) {
  return (
    <div style={{ display: 'flex', whiteSpace: 'pre', background: selected ? T.sel : 'transparent', overflow: 'hidden' }}>
      <span style={{ color: selected ? T.accent : 'transparent' }}>▌</span>
      {parts.map((g, i) => {
        const fill = g.w === 'fill'
        return (
          <span
            key={i}
            style={{
              color: g.c,
              flex: fill ? 1 : '0 0 auto',
              width: g.w && !fill ? g.w : undefined,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: g.weight ?? 400,
            }}
          >
            {g.t}
          </span>
        )
      })}
    </div>
  )
}

const row = (parts: Part[], selected = false): RowData => ({ parts, selected })

function Rows({ rows }: { rows: RowData[] }): ReactNode {
  return rows.map((r, i) => <Row key={i} {...r} />)
}

export default function GitView({ git, mobile, border }: { git: Git; mobile: boolean; border: string }) {
  const repo = REPOS[git.sel]
  const sy = git.sync[git.sel]

  const top = REPOS.map((r, i) => {
    const s = git.sync[i]
    const sync = r.noUpstream
      ? 'no upstream'
      : [s.ahead ? `↑${s.ahead}` : '', s.behind ? `↓${s.behind}` : ''].filter(Boolean).join(' ') || '='
    const changed = r.files.filter((f) => f.st !== 'dir').length
    const dirty = [changed ? `✎${changed}` : '', r.stash ? `⚑${r.stash}` : ''].filter(Boolean).join(' ')
    const res = git.res[i]
    const c0 = r.commits[0]
    return row(
      [
        part('  ', T.accent),
        part('● ', changed ? T.orange : T.green),
        part(r.name, T.text, '11ch', i === git.sel ? 700 : 400),
        part(' ' + r.branch, r.branch === 'main' ? T.accent2 : T.yellow, '12ch'),
        part(' ' + sync, s.behind ? T.yellow : T.muted, '13ch'),
        part(dirty, T.orange, '8ch'),
        part(c0[0] + ' ', T.yellow),
        part(c0[1], T.text, 'fill'),
        part(' ' + c0[2], T.dim, '5ch'),
        part(' ' + r.services, T.muted, '18ch'),
        part(res ? (res.ok ? '✓ ' : '✗ ') + res.text : '', res && !res.ok ? T.red : T.green, '15ch'),
      ],
      i === git.sel,
    )
  })

  const dirFirst = repo.files[0]?.st === 'dir'
  const files = repo.files.length
    ? repo.files.map((f, i) =>
        f.st === 'dir'
          ? row([part('   ', T.dim), part('▾ ' + f.name, T.accent2, 'fill'), part(` ${f.count} `, T.dim)])
          : row(
              [
                part(f.st[0], T.green),
                part(f.st[1], f.st === '??' ? T.muted : T.orange),
                part(' ' + (dirFirst ? '  ' : '') + f.name.replace(/^.*\//, ''), T.text, 'fill'),
              ],
              i === 1,
            ),
      )
    : [row([part(' clean', T.dim)])]
  const branches = repo.branches.map((b) =>
    row([
      part(b[3] ? '* ' : '  ', T.green),
      part(b[0], b[3] ? T.green : T.text, 'fill'),
      part(b[1] ? ' ' + b[1] : '', T.muted),
      part(` ${b[2]} `, T.dim),
    ]),
  )
  const commits = repo.commits.map((c, i) =>
    row([part(i === 0 ? '● ' : '│ ', T.accent2), part(c[0] + ' ', T.yellow), part(c[1], T.text, 'fill'), part(` ${c[2]} `, T.dim)]),
  )
  const stash = repo.stash
    ? [row([part(' stash@{0} ', T.yellow), part('WIP on main: try pooled redis client', T.text, 'fill')])]
    : [row([part(' no stashes', T.dim)])]
  const diff = repo.diff.map((d, i) => row([part(' ' + d[0], d[1], 'fill', i === 0 && repo.files.length ? 700 : 400)]))
  const cmds = git.cmds.length
    ? git.cmds.map((c) =>
        row([
          part(c.ok ? ' ✓ ' : ' ✗ ', c.ok ? T.green : T.red),
          part(c.repo + ' ', T.accent),
          part(c.cmd, T.text, 'fill'),
          part(c.msg ? ' ' + c.msg : '', T.red),
          part(` ${c.ms} `, T.dim),
        ]),
      )
    : [row([part(' press f, p or u to run git on the selected repo', T.dim)])]

  const changesTitle = `Changes · ${repo.branch}${
    repo.noUpstream ? ' (no upstream)' : (sy.ahead ? ` ↑${sy.ahead}` : '') + (sy.behind ? ` ↓${sy.behind}` : '')
  }`

  const panel = (title: string, flex: number, rows: RowData[]) => (
    <Panel
      key={title}
      title={title}
      style={{ flex, minHeight: 44, margin: '14px 0 2px', padding: '10px 0 4px', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Rows rows={rows} />
      </div>
    </Panel>
  )

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Panel
        title="Repos · 4 · main ×3 · feat/cart ×1"
        border={border}
        footer={<span style={{ color: T.muted, whiteSpace: 'pre' }}>none marked: all · m multi-repo · L lazygit</span>}
        style={{ margin: '10px 0 0', padding: '10px 0 8px' }}
      >
        <Rows rows={top} />
      </Panel>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: 4 }}>
        <div style={{ flex: mobile ? '0 0 auto' : '0 0 34%', minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {panel(changesTitle, 3, files)}
          {panel('Branches', 2, branches)}
          {panel('Graph', 3, commits)}
          {panel('Stash', 1, stash)}
        </div>
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {panel('Diff', 3, diff)}
          {panel('Commands', 1, cmds)}
        </div>
      </div>
    </div>
  )
}
