import { BOOT, BY, RUN, SVCS, active, dependents, ready, type Level, type LogLine, type SvcState } from './data'

export interface Snap {
  st: Record<string, SvcState>
  logs: LogLine[]
  hist: Record<string, number[]>
  tick: number
  now: number
}

type States = Record<string, SvcState>

const MAX_LOGS = 160

// Fake supervisor behind the terminal demo. It exposes an immutable snapshot so React can
// subscribe to it with useSyncExternalStore.
export class Sim {
  private seq = 0
  private listeners = new Set<() => void>()
  private snap: Snap = {
    st: Object.fromEntries(SVCS.map((s) => [s.id, { status: 'stopped', at: 0, bi: 0 } as SvcState])),
    logs: [],
    hist: Object.fromEntries(SVCS.map((s) => [s.id, [] as number[]])),
    tick: 0,
    now: Date.now(),
  }

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  getSnapshot = () => this.snap

  private emit(patch: Partial<Snap>) {
    this.snap = { ...this.snap, ...patch, now: Date.now() }
    this.listeners.forEach((fn) => fn())
  }

  private log(out: LogLine[], id: string, text: string, level: Level = '') {
    out.push({ k: this.seq++, id, text, level })
  }

  tick() {
    const t = Date.now()
    const st = { ...this.snap.st }
    const hist = { ...this.snap.hist }
    const add: LogLine[] = []

    for (const s of SVCS) {
      const x = st[s.id]
      if (x.status === 'queued' && s.deps.every((d) => ready(st[d].status))) {
        st[s.id] = { status: 'starting', at: t, bi: 0 }
        this.log(add, s.id, `starting · ${s.what}`, 'dim')
      } else if (x.status === 'starting') {
        const lines = BOOT[s.id]
        const idx = Math.floor((t - x.at) / (s.boot / lines.length))
        let bi = x.bi
        while (bi < Math.min(idx, lines.length)) this.log(add, s.id, lines[bi++])
        if (t - x.at >= s.boot) {
          while (bi < lines.length) this.log(add, s.id, lines[bi++])
          st[s.id] = { status: s.oneshot ? 'done' : 'running', at: t, bi }
          this.log(add, s.id, s.oneshot ? 'exited 0 · done' : `ready · ${s.health}`, 'ok')
        } else {
          st[s.id] = { ...x, bi }
        }
      } else if (x.status === 'stopping') {
        const settled = dependents(s.id).every((d) => !active(st[d].status) || st[d].status === 'queued')
        if (settled && t - x.at > 400) {
          st[s.id] = { status: 'stopped', at: t, bi: 0 }
          this.log(add, s.id, 'stopped', 'dim')
        }
      } else if (x.status === 'crashed' && t - x.at > 1600) {
        st[s.id] = { status: 'queued', at: t, bi: 0 }
        this.log(add, s.id, 'restarting (on-failure, backoff 1s)', 'warn')
      } else if (x.status === 'running' && RUN[s.id] && Math.random() < 0.07) {
        const l = RUN[s.id][Math.floor(Math.random() * RUN[s.id].length)]
        this.log(add, s.id, l, l.startsWith('WARN') ? 'warn' : '')
      }

      const h = hist[s.id].slice(-11)
      const status = st[s.id].status
      const on = status === 'running' || status === 'starting'
      h.push(on ? Math.min(1, (status === 'starting' ? 0.6 : 0.08) + Math.random() * 0.45) : 0)
      hist[s.id] = h
    }

    this.emit({
      st,
      hist,
      tick: this.snap.tick + 1,
      logs: add.length ? [...this.snap.logs, ...add].slice(-MAX_LOGS) : this.snap.logs,
    })
  }

  private startSvc(id: string, st: States) {
    const s = st[id]
    if (ready(s.status) && !BY[id].oneshot) return
    if (s.status === 'starting' || s.status === 'queued') return
    if (BY[id].oneshot && s.status === 'done') return
    BY[id].deps.forEach((d) => this.startSvc(d, st))
    st[id] = { status: 'queued', at: Date.now(), bi: 0 }
  }

  private stopSvc(id: string, st: States) {
    dependents(id).forEach((d) => this.stopSvc(d, st))
    if (active(st[id].status) && st[id].status !== 'stopping') {
      st[id] = { status: 'stopping', at: Date.now(), bi: 0 }
    }
    if (BY[id].oneshot) st[id] = { status: 'stopped', at: Date.now(), bi: 0 }
  }

  start = (id: string) => {
    const st = { ...this.snap.st }
    this.startSvc(id, st)
    this.emit({ st })
  }

  stop = (id: string) => {
    const st = { ...this.snap.st }
    this.stopSvc(id, st)
    this.emit({ st })
  }

  restart = (id: string) => {
    if (!ready(this.snap.st[id].status)) return this.start(id)
    const st = { ...this.snap.st }
    const logs = [...this.snap.logs]
    this.log(logs, id, '↻ restarting', 'warn')
    st[id] = { status: 'starting', at: Date.now(), bi: 0 }
    this.emit({ st, logs })
  }

  startAll = () => {
    const st = { ...this.snap.st }
    SVCS.forEach((s) => this.startSvc(s.id, st))
    this.emit({ st })
  }

  stopAll = () => {
    const st = { ...this.snap.st }
    SVCS.forEach((s) => {
      if (!s.deps.length) this.stopSvc(s.id, st)
    })
    this.emit({ st })
  }

  restartAll = () => {
    const st = { ...this.snap.st }
    SVCS.forEach((s) => {
      if (!s.oneshot && ready(st[s.id].status)) st[s.id] = { status: 'starting', at: Date.now(), bi: 0 }
    })
    this.emit({ st })
  }

  clearLogs = () => this.emit({ logs: [] })

  // Returns whether the worker crashed; when it was not running this just starts everything.
  crash = () => {
    if (this.snap.st.worker.status !== 'running') {
      this.startAll()
      return false
    }
    const st = { ...this.snap.st }
    const logs = [...this.snap.logs]
    for (const l of ['error: Connection reset by peer', '    at Socket.onread (node:net:742:20)', 'crashed · exit 1']) {
      this.log(logs, 'worker', l, 'err')
    }
    st.worker = { status: 'crashed', at: Date.now(), bi: 0 }
    this.emit({ st, logs: logs.slice(-MAX_LOGS) })
    return true
  }
}
