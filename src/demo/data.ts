export type Status = 'stopped' | 'queued' | 'starting' | 'running' | 'stopping' | 'crashed' | 'done'
export type Level = '' | 'ok' | 'warn' | 'err' | 'dim'

export interface Svc {
  id: string
  kind: 'docker' | 'process'
  oneshot?: boolean
  port: number | ''
  deps: string[]
  layer: number
  boot: number
  what: string
  cwd: string
  health: string
  hasHealth?: boolean
  mem: number
  c: string
}

export interface SvcState {
  status: Status
  at: number
  bi: number
}

export interface LogLine {
  k: number
  id: string
  text: string
  level: Level
}

export const SVCS: Svc[] = [
  { id: 'postgres', kind: 'docker', port: 5432, deps: [], layer: 0, boot: 1800, what: 'image postgres:16', cwd: '.', health: 'tcp localhost:5432', hasHealth: true, mem: 56, c: '#7aa2f7' },
  { id: 'redis', kind: 'docker', port: 6379, deps: [], layer: 0, boot: 1100, what: 'image redis:7', cwd: '.', health: 'tcp localhost:6379', hasHealth: true, mem: 6.2, c: '#9ece6a' },
  { id: 'migrate', kind: 'process', oneshot: true, port: '', deps: ['postgres'], layer: 1, boot: 1500, what: '$ bun run db:migrate', cwd: './api', health: '—', mem: 0, c: '#e0af68' },
  { id: 'auth', kind: 'process', port: 4300, deps: ['postgres', 'redis'], layer: 1, boot: 1400, what: '$ bun services/http.ts auth', cwd: '.', health: 'http http://localhost:4300/health', hasHealth: true, mem: 25, c: '#bb9af7' },
  { id: 'api', kind: 'process', port: 4100, deps: ['postgres', 'redis', 'migrate', 'auth'], layer: 2, boot: 2000, what: '$ bun services/http.ts api', cwd: '.', health: 'http http://localhost:4100/health', hasHealth: true, mem: 25, c: '#7dcfff' },
  { id: 'worker', kind: 'process', port: '', deps: ['redis', 'api'], layer: 3, boot: 1200, what: '$ bun services/worker.ts', cwd: '.', health: 'log "worker ready"', mem: 22, c: '#ff9e64' },
  { id: 'web', kind: 'process', port: 4200, deps: ['api'], layer: 3, boot: 1500, what: '$ bun run dev', cwd: './web', health: 'http http://localhost:4200', hasHealth: true, mem: 25, c: '#73daca' },
]

export const BY: Record<string, Svc> = Object.fromEntries(SVCS.map((s) => [s.id, s]))

export const BOOT: Record<string, string[]> = {
  postgres: [
    'PostgreSQL init process complete; ready for start up.',
    'listening on IPv4 address "0.0.0.0", port 5432',
    'database system is ready to accept connections',
  ],
  redis: ['Redis version=7.2.4, bits=64', 'Server initialized', 'Ready to accept connections tcp'],
  migrate: ['applying 20261003_orders_index … ok', 'applying 20261019_add_coupons … ok', '2 migrations applied'],
  auth: ['loading keys from ./keys', 'listening on :4300'],
  api: ['connected to postgres', 'connected to redis', 'listening on :4100'],
  worker: ['connecting to redis://localhost:6379', 'subscribed to 3 queues', 'worker ready'],
  web: ['VITE v5.4.2  ready in 412 ms', '➜  Local:   http://localhost:4200/'],
}

export const RUN: Record<string, string[]> = {
  postgres: ['checkpoint starting: time', 'checkpoint complete: wrote 14 buffers (0.1%)'],
  redis: ['1 changes in 60 seconds. Saving...', 'DB saved on disk'],
  auth: ['POST /token 200 8.1ms', 'GET /health 200 0.9ms', 'POST /session 201 12.4ms'],
  api: [
    'GET / 200 22.3ms',
    'GET /v1/orders 200 35.2ms',
    'GET /health 200 14.4ms',
    'GET /v1/users 200 19.8ms',
    'GET /v1/session 200 37.7ms',
    'GET /v1/users 200 32.8ms',
    'WARN slow query 412ms',
  ],
  worker: ['processed email.send #4821 in 88ms', 'processed invoice.pdf #4822 in 240ms'],
  web: ['hmr update /src/App.tsx', 'hmr update /src/pages/Cart.tsx'],
}

export const T = {
  bg: '#11121b',
  panel: '#161824',
  alt: '#1c1f2e',
  sel: '#283052',
  border: '#2f3450',
  focus: '#7aa2f7',
  text: '#c0caf5',
  muted: '#7a82ab',
  dim: '#4b5275',
  accent: '#7aa2f7',
  accent2: '#bb9af7',
  cyan: '#7dcfff',
  green: '#9ece6a',
  yellow: '#e0af68',
  orange: '#ff9e64',
  red: '#f7768e',
}

const SPIN = ['◐', '◓', '◑', '◒']
export const SPARK = '▁▂▃▄▅▆▇█'

export const ready = (s: Status) => s === 'running' || s === 'done'
export const active = (s: Status) => s !== 'stopped' && s !== 'done'
export const dependents = (id: string) => SVCS.filter((s) => s.deps.includes(id)).map((s) => s.id)

export const dur = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`
}

export function look(x: Svc, st: SvcState, tick: number) {
  const s = st.status
  const spin = SPIN[tick % 4]
  if (x.oneshot && s === 'done') return { icon: '✓', label: 'done', color: T.green }
  if (x.oneshot && s === 'starting') return { icon: spin, label: 'running', color: T.yellow }
  const by = {
    stopped: { icon: '○', label: 'stopped', color: T.dim },
    queued: { icon: spin, label: 'waiting', color: T.yellow },
    starting: { icon: spin, label: 'starting', color: T.yellow },
    running: x.hasHealth
      ? { icon: '●', label: 'healthy', color: T.green }
      : { icon: '●', label: 'running', color: T.cyan },
    stopping: { icon: spin, label: 'stopping', color: T.yellow },
    crashed: { icon: '✖', label: 'crashed', color: T.red },
    done: { icon: '✓', label: 'done', color: T.green },
  }
  return by[s]
}
