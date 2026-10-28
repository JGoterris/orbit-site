import { useState } from 'react'

export interface RepoFile {
  st: string
  name: string
  count?: number
}

export interface Repo {
  name: string
  branch: string
  ahead: number
  behind: number
  noUpstream?: boolean
  services: string
  stash: number
  commits: [hash: string, msg: string, ago: string][]
  files: RepoFile[]
  branches: [name: string, remote: string, ago: string, current?: boolean][]
  diff: [text: string, color: string][]
}

const CLEAN: [string, string][] = [['nothing to show: working tree clean', '#4b5275']]

export const REPOS: Repo[] = [
  {
    name: 'shop',
    branch: 'main',
    ahead: 1,
    behind: 0,
    services: 'api, auth, worker',
    stash: 1,
    commits: [
      ['a41c9e2', 'fix: retry redis connection on boot', '2h'],
      ['9b07d15', 'orders: index by customer', '1d'],
      ['3e1f8aa', 'auth: rotate signing keys', '3d'],
      ['c52d0e9', 'bump bun to 1.1.30', '5d'],
    ],
    files: [
      { st: 'dir', name: 'services/', count: 2 },
      { st: ' M', name: 'services/http.ts' },
      { st: ' M', name: 'services/redis.ts' },
      { st: '??', name: 'services/retry.ts' },
    ],
    branches: [
      ['main', 'origin/main', '2h', true],
      ['feat/retry-redis', '', '5h'],
      ['chore/bun-1.1', 'origin/chore/bun-1.1', '5d'],
    ],
    diff: [
      ['services/redis.ts', '#c0caf5'],
      ['@@ -14,7 +14,10 @@ export async function connect()', '#7dcfff'],
      ['   const client = createClient({ url })', '#c0caf5'],
      ['-  await client.connect()', '#f7768e'],
      ['+  await retry(() => client.connect(), {', '#9ece6a'],
      ['+    tries: 5,', '#9ece6a'],
      ['+    backoff: [100, 2000],', '#9ece6a'],
      ['+  })', '#9ece6a'],
      ['   return client', '#c0caf5'],
      [' }', '#c0caf5'],
    ],
  },
  {
    name: 'web',
    branch: 'feat/cart',
    ahead: 0,
    behind: 2,
    services: 'web',
    stash: 0,
    commits: [
      ['77d2b01', 'cart: optimistic quantity updates', '4h'],
      ['e0a4c3f', 'cart: empty state', '1d'],
      ['15fb9e6', 'pages: lazy-load product grid', '2d'],
    ],
    files: [],
    branches: [
      ['feat/cart', 'origin/feat/cart', '4h', true],
      ['main', 'origin/main', '1d'],
    ],
    diff: CLEAN,
  },
  {
    name: 'infra',
    branch: 'main',
    ahead: 0,
    behind: 0,
    services: 'postgres, redis',
    stash: 0,
    commits: [
      ['d1c8e40', 'compose: pin postgres 16.4', '6h'],
      ['0f3b2a7', 'compose: healthcheck for redis', '2d'],
    ],
    files: [{ st: ' M', name: 'docker-compose.yml' }],
    branches: [['main', 'origin/main', '6h', true]],
    diff: [
      ['docker-compose.yml', '#c0caf5'],
      ['@@ -3,7 +3,7 @@ services:', '#7dcfff'],
      ['   postgres:', '#c0caf5'],
      ['-    image: postgres:16', '#f7768e'],
      ['+    image: postgres:16.4', '#9ece6a'],
      ['     ports: ["5432:5432"]', '#c0caf5'],
    ],
  },
  {
    name: 'migrations',
    branch: 'main',
    ahead: 0,
    behind: 0,
    noUpstream: true,
    services: 'migrate',
    stash: 0,
    commits: [['5a9e1c2', 'add coupons table', '1d']],
    files: [],
    branches: [['main', '', '1d', true]],
    diff: CLEAN,
  },
]

export interface GitCmd {
  repo: string
  cmd: string
  ok: boolean
  ms: string
  msg: string
}

export function useGit() {
  const [sel, setSel] = useState(0)
  const [sync, setSync] = useState(() => REPOS.map((r) => ({ ahead: r.ahead, behind: r.behind })))
  const [res, setRes] = useState<Record<number, { ok: boolean; text: string }>>({})
  const [cmds, setCmds] = useState<GitCmd[]>([])

  const move = (d: number) => setSel((sel + d + REPOS.length) % REPOS.length)

  const run = (k: 'f' | 'p' | 'u') => {
    const repo = REPOS[sel]
    const next = sync.map((x) => ({ ...x }))
    let cmd: string
    let text: string
    let ok = true
    if (k === 'f') {
      cmd = 'git fetch --prune'
      text = 'fetched'
    } else if (k === 'p') {
      cmd = 'git pull --ff-only'
      if (repo.noUpstream) {
        ok = false
        text = 'no upstream'
      } else {
        text = next[sel].behind ? `pulled ${next[sel].behind}` : 'up to date'
        next[sel].behind = 0
      }
    } else {
      cmd = 'git push'
      if (repo.noUpstream) {
        ok = false
        text = 'no upstream'
      } else {
        text = next[sel].ahead ? `pushed ${next[sel].ahead}` : 'nothing to push'
        next[sel].ahead = 0
      }
    }
    const ms = (0.2 + Math.random() * 0.9).toFixed(1) + 's'
    setSync(next)
    setRes({ ...res, [sel]: { ok, text } })
    setCmds([...cmds, { repo: repo.name, cmd, ok, ms, msg: ok ? '' : text }].slice(-8))
  }

  return { sel, sync, res, cmds, move, run }
}

export type Git = ReturnType<typeof useGit>
