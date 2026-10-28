import { BY, SVCS, T, look, ready } from './data'
import type { Snap } from './sim'

const GW = 18
const GH = 4
const GX = [1, 27, 53, 79]
const GPOS: Record<string, [number, number]> = {
  postgres: [0, 1],
  redis: [0, 6],
  migrate: [1, 1],
  auth: [1, 6],
  api: [2, 4],
  web: [3, 1],
  worker: [3, 9],
}

const W = GX[3] + GW + 1
const H = 14

const E = 1
const S = 2
const WE = 4
const N = 8
const LINE: Record<number, string> = {
  [E]: '─',
  [WE]: '─',
  [E | WE]: '─',
  [N]: '│',
  [S]: '│',
  [N | S]: '│',
  [E | S]: '╭',
  [WE | S]: '╮',
  [N | E]: '╰',
  [N | WE]: '╯',
  [N | S | E]: '├',
  [N | S | WE]: '┤',
  [E | WE | S]: '┬',
  [E | WE | N]: '┴',
  [N | E | S | WE]: '┼',
}

type Edge = [string, string]
type Point = [number, number]
interface Cell {
  ch: string
  c: string
  b: boolean
}

export interface Seg {
  t: string
  c: string
  w: number
  ascii: boolean
}

export interface Hit {
  index: number
  name: string
  left: string
  top: string
  width: string
  height: string
}

const reach = (start: string, next: (id: string) => string[]) => {
  const out = new Set<string>()
  const go = (id: string) =>
    next(id).forEach((d) => {
      if (!out.has(d)) {
        out.add(d)
        go(d)
      }
    })
  go(start)
  return out
}

const isAscii = (ch: string) => ch >= ' ' && ch <= '~'

// Draws the dependency graph of the selected service onto a character grid.
export function paintGraph(snap: Snap, selId: string) {
  const sel = BY[selId]
  const cells: Cell[][] = Array.from({ length: H }, () =>
    Array.from({ length: W }, () => ({ ch: ' ', c: T.text, b: false })),
  )
  const mask = new Map<number, number>()
  const cedges = new Map<number, Edge[]>()
  const arrows = new Map<number, Edge[]>()
  const ports = new Map<number, Edge[]>()
  const push = (m: Map<number, Edge[]>, k: number, e: Edge) => m.set(k, [...(m.get(k) ?? []), e])

  const up = reach(sel.id, (id) => BY[id].deps)
  const down = reach(sel.id, (id) => SVCS.filter((s) => s.deps.includes(id)).map((s) => s.id))
  const ecol = (d: string, t: string) =>
    up.has(d) && (t === sel.id || up.has(t)) ? T.cyan : down.has(t) && (d === sel.id || down.has(d)) ? T.accent2 : ''

  const addDir = (x: number, y: number, bit: number, e: Edge) => {
    const k = y * W + x
    mask.set(k, (mask.get(k) ?? 0) | bit)
    if (!cedges.has(k)) cedges.set(k, [])
    cedges.get(k)!.push(e)
  }
  const seg = (a: Point, b: Point, e: Edge) => {
    if (a[1] === b[1]) {
      const y = a[1]
      const [x0, x1] = a[0] < b[0] ? [a[0], b[0]] : [b[0], a[0]]
      for (let x = x0; x <= x1; x++) {
        if (x > x0) addDir(x, y, WE, e)
        if (x < x1) addDir(x, y, E, e)
      }
    } else {
      const x = a[0]
      const [y0, y1] = a[1] < b[1] ? [a[1], b[1]] : [b[1], a[1]]
      for (let y = y0; y <= y1; y++) {
        if (y > y0) addDir(x, y, N, e)
        if (y < y1) addDir(x, y, S, e)
      }
    }
  }

  SVCS.forEach((t) =>
    t.deps.forEach((d) => {
      const [ld, yd] = GPOS[d]
      const [lt, yt] = GPOS[t.id]
      const rs = yd + 1
      const rt = yt + 1
      const e: Edge = [d, t.id]
      const p0: Point = [GX[ld] + GW, rs]
      const cx = GX[ld] + GW + 2
      const p3: Point = [GX[lt] - 2, rt]
      if (rs === rt && lt === ld + 1) seg(p0, p3, e)
      else {
        seg(p0, [cx, rs], e)
        if (rs !== rt) seg([cx, rs], [cx, rt], e)
        seg([cx, rt], p3, e)
      }
      push(arrows, rt * W + GX[lt] - 1, e)
      push(ports, rs * W + GX[ld] + GW - 1, e)
    }),
  )

  const pick = (es: Edge[]) => {
    for (const e of es) {
      const c = ecol(e[0], e[1])
      if (c) return c
    }
    return '#3b4261'
  }
  mask.forEach((m, k) => {
    cells[Math.floor(k / W)][k % W] = { ch: LINE[m] ?? '·', c: pick(cedges.get(k)!), b: false }
  })
  arrows.forEach((es, k) => {
    cells[Math.floor(k / W)][k % W] = { ch: '▶', c: pick(es), b: true }
  })

  const hits: Hit[] = []
  const put = (cx: number, cy: number, ch: string, c: string, b = false) => {
    if (cy >= 0 && cy < H && cx >= 0 && cx < W) cells[cy][cx] = { ch, c, b }
  }

  SVCS.forEach((x, index) => {
    const [l, y0] = GPOS[x.id]
    const X = GX[l]
    const isSel = x.id === sel.id
    const lk = look(x, snap.st[x.id], snap.tick)
    const border = isSel ? T.accent : up.has(x.id) ? T.cyan : down.has(x.id) ? T.accent2 : T.border
    const [tl, tr, bl, br, h, v] = isSel ? ['╔', '╗', '╚', '╝', '═', '║'] : ['╭', '╮', '╰', '╯', '─', '│']
    put(X, y0, tl, border, isSel)
    put(X + GW - 1, y0, tr, border, isSel)
    put(X, y0 + GH - 1, bl, border, isSel)
    put(X + GW - 1, y0 + GH - 1, br, border, isSel)
    for (let cx = X + 1; cx < X + GW - 1; cx++) {
      put(cx, y0, h, border, isSel)
      put(cx, y0 + GH - 1, h, border, isSel)
    }
    for (let cy = y0 + 1; cy < y0 + GH - 1; cy++) {
      put(X, cy, v, border, isSel)
      put(X + GW - 1, cy, v, border, isSel)
      for (let cx = X + 1; cx < X + GW - 1; cx++) put(cx, cy, ' ', T.text)
    }
    put(X + 2, y0 + 1, lk.icon, lk.color, true)
    ;[...x.id.slice(0, GW - 7)].forEach((ch, i) => put(X + 4 + i, y0 + 1, ch, T.text, true))

    const z = snap.st[x.id]
    const maxW = GW - 4
    let sub = lk.label + (x.port ? ' :' + x.port : '')
    const mem = ready(z.status) && !x.oneshot && x.mem ? ' ' + x.mem + 'M' : ''
    if ((sub + mem).length <= maxW) sub += mem
    if (sub.length > maxW) sub = sub.slice(0, maxW - 1) + '…'
    ;[...sub].forEach((ch, i) => put(X + 2 + i, y0 + 2, ch, lk.color))

    hits.push({
      index,
      name: x.id,
      left: `${X}ch`,
      top: `calc(${y0} * 1.2em)`,
      width: `${GW}ch`,
      height: `calc(${GH} * 1.2em)`,
    })
  })

  // where an edge leaves a box, turn the border into a junction
  ports.forEach((es, k) => {
    const y = Math.floor(k / W)
    const x = k % W
    const c = cells[y][x]
    if (c.ch === '│') {
      const lit = es.some((e) => ecol(e[0], e[1]))
      cells[y][x] = { ...c, ch: '├', c: lit ? pick(es) : c.c }
    } else if (c.ch === '║') cells[y][x] = { ...c, ch: '╟' }
  })

  const rows = cells.map((r) => {
    const segs: Seg[] = []
    r.forEach((c) => {
      const w = c.b ? 700 : 400
      const ascii = isAscii(c.ch)
      const last = segs[segs.length - 1]
      if (ascii && last && last.ascii && last.c === c.c && last.w === w) last.t += c.ch
      else segs.push({ t: c.ch, c: c.c, w, ascii })
    })
    return segs
  })

  return { rows, hits }
}
