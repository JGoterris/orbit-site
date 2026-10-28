import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { fx } from '../lib/motion'
import { useMobile } from '../lib/useMobile'
import Detail from './Detail'
import LogPane from './LogPane'
import ServiceList from './ServiceList'
import { SVCS, T, ready } from './data'
import type { Sim, Snap } from './sim'

const TABS = ['Dashboard', 'Graph', 'Logs', 'Git']

const FOOTERS: Record<number, string[][]> = {
  1: [['space', 'start/stop'], ['r', 'restart'], ['S/X', 'all'], ['l', 'logs'], ['a', 'all logs'], ['1-4', 'views'], ['?', 'help']],
  2: [['j/k', 'select'], ['space', 'start/stop'], ['r', 'restart'], ['1-4', 'views'], ['?', 'help']],
  3: [['space', 'start/stop'], ['a', 'selected ⇄ all'], ['c', 'clear'], ['1-4', 'views'], ['?', 'help']],
  4: [['j/k', 'repo'], ['f', 'fetch'], ['p', 'pull'], ['u', 'push'], ['1-4', 'views'], ['?', 'help']],
}

const HELP = [
  ['j k ↑↓', 'select service'],
  ['space', 'start / stop (with dependencies)'],
  ['s x r', 'start / stop / restart selected'],
  ['S X R', 'start / stop / restart everything'],
  ['1 2 3 4', 'Dashboard / Graph / Logs / Git'],
  ['l enter', 'logs of the selected one'],
  ['a', 'selected ⇄ all logs'],
  ['c', 'clear logs'],
  ['?', 'close help'],
]

interface Props {
  snap: Snap
  sim: Sim
  sel: number
  onSelect: (i: number) => void
}

export default function Terminal({ snap, sim, sel, onSelect }: Props) {
  const mobile = useMobile()
  const root = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const lastTab = useRef<number | null>(null)
  const [tab, setTab] = useState(1)
  const [allLogs, setAllLogs] = useState(false)
  const [help, setHelp] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    if (lastTab.current !== null) {
      fx(
        body.current,
        [
          { opacity: 0, transform: 'translateX(-10px)' },
          { opacity: 1, transform: 'none' },
        ],
        260,
      )
    }
    lastTab.current = tab
  }, [tab])

  const counts = { up: 0, busy: 0, bad: 0 }
  for (const x of SVCS) {
    const s = snap.st[x.id].status
    if (ready(s)) counts.up++
    else if (s === 'crashed') counts.bad++
    else if (s !== 'stopped') counts.busy++
  }
  const rest = SVCS.length - counts.up - counts.busy - counts.bad

  const id = SVCS[sel].id
  const status = snap.st[id].status

  // Returns whether the key did something, so the caller can swallow the browser default.
  const press = (k: string) => {
    if (help && k !== '?') {
      setHelp(false)
      if (k === 'Escape') return true
    }
    if (k === 'j' || k === 'ArrowDown') onSelect((sel + 1) % SVCS.length)
    else if (k === 'k' || k === 'ArrowUp') onSelect((sel + SVCS.length - 1) % SVCS.length)
    else if (k === ' ') (ready(status) || status === 'starting' ? sim.stop : sim.start)(id)
    else if (k === 's') sim.start(id)
    else if (k === 'x') sim.stop(id)
    else if (k === 'r') sim.restart(id)
    else if (k === 'S') sim.startAll()
    else if (k === 'X') sim.stopAll()
    else if (k === 'R') sim.restartAll()
    else if (k.length === 1 && '1234'.includes(k)) setTab(+k)
    else if (k === 'a') setAllLogs(!allLogs)
    else if (k === 'c') sim.clearLogs()
    else if (k === 'Enter' || k === 'l') {
      setTab(3)
      setAllLogs(false)
    } else if (k === '?') setHelp(!help)
    else return false
    return true
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (press(e.key)) e.preventDefault()
  }

  const select = (i: number) => {
    onSelect(i)
    root.current?.focus()
  }

  const border = focused ? T.focus : T.border
  const desk = mobile ? 'none' : 'inline'
  const showList = tab !== 4 && !(mobile && (tab === 2 || tab === 3))
  const bodyHeight = mobile ? (tab === 1 ? 560 : tab === 4 ? 600 : 440) : 540

  return (
    <div
      ref={root}
      tabIndex={0}
      data-terminal
      onKeyDown={onKeyDown}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        outline: 'none',
        border: `1px solid ${border}`,
        borderRadius: 14,
        background: T.alt,
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
        fontVariantLigatures: 'none',
        fontSize: mobile ? 10.5 : 13,
        lineHeight: 1.5,
        color: T.text,
        boxShadow: '0 30px 80px -40px #7aa2f755',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: T.alt, borderBottom: `1px solid ${T.border}` }}>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b4261' }} />
        ))}
      </div>
      <div style={{ background: T.bg, padding: '6px 8px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: T.alt, padding: '1px 6px', whiteSpace: 'pre', overflow: 'hidden' }}>
          <span style={{ color: T.accent, fontWeight: 600 }}>◉ orbit</span>
          <span style={{ color: T.dim, display: desk }}> · </span>
          <span style={{ display: desk }}>shop</span>
          <span>{'  '}</span>
          {TABS.map((label, i) => {
            const on = tab === i + 1
            return (
              <span
                key={label}
                onClick={() => setTab(i + 1)}
                style={{
                  cursor: 'pointer',
                  background: on ? T.accent : 'transparent',
                  color: on ? T.bg : T.muted,
                  fontWeight: on ? 700 : 400,
                }}
              >
                {mobile ? ` ${i + 1} ` : ` ${i + 1} ${label} `}
              </span>
            )
          })}
          <span style={{ flex: 1 }} />
          <span style={{ color: T.green }}>
            ● {counts.up}
            <span style={{ display: desk }}> up</span>
          </span>
          {counts.busy > 0 && <span style={{ color: T.yellow }}>{`  ◐ ${counts.busy}`}</span>}
          {counts.bad > 0 && <span style={{ color: T.red }}>{`  ✖ ${counts.bad}`}</span>}
          <span style={{ color: T.dim, display: desk }}>{`  ○ ${rest} `}</span>
        </div>

        <div
          ref={body}
          style={{
            height: bodyHeight,
            position: 'relative',
            display: 'flex',
            flexDirection: mobile ? 'column' : 'row',
            background: T.panel,
            overflow: 'hidden',
          }}
        >
          {showList && (
            <ServiceList snap={snap} sel={sel} full={tab === 1} mobile={mobile} border={border} up={counts.up} onSelect={select} />
          )}
          <div style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {tab === 1 && <Detail snap={snap} sel={sel} />}
            {(tab === 1 || tab === 3) && (
              <LogPane snap={snap} sel={sel} all={allLogs} hint={tab === 3} lines={tab === 1 ? 19 : 29} />
            )}
          </div>

          {help && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: 'min(520px,90%)',
                height: 'fit-content',
                background: T.alt,
                border: `1px solid ${T.accent}`,
                padding: '16px 18px',
                display: 'grid',
                gridTemplateColumns: '110px 1fr',
                gap: '2px 14px',
              }}
            >
              <span style={{ position: 'absolute', top: -10, left: 10, background: T.alt, color: T.accent, padding: '0 4px', lineHeight: '18px' }}>
                Help
              </span>
              {HELP.map(([k, d]) => (
                <HelpRow key={k} k={k} d={d} />
              ))}
            </div>
          )}
        </div>

        <div style={{ display: mobile ? 'none' : 'flex', padding: '1px 6px', background: T.alt, whiteSpace: 'pre', overflow: 'hidden', marginBottom: 6 }}>
          {FOOTERS[tab].map(([k, d]) => (
            <span key={k}>
              <span style={{ color: T.accent }}>{k}</span>
              <span style={{ color: T.muted }}>{` ${d}   `}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function HelpRow({ k, d }: { k: string; d: string }) {
  return (
    <>
      <span style={{ color: T.accent }}>{k}</span>
      <span>{d}</span>
    </>
  )
}
