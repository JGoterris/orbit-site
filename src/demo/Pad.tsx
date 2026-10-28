import type { CSSProperties } from 'react'

const mono: CSSProperties = { fontFamily: "'Geist Mono', monospace" }

const TABS = ['Dash', 'Graph', 'Logs', 'Git']

type PadKey = [label: string, hint: string, key: string | null]

function keys(tab: number): PadKey[] {
  if (tab === 4) {
    return [['↑', 'repo', 'k'], ['↓', 'repo', 'j'], ['f', 'fetch', 'f'], ['p', 'pull', 'p'], ['u', 'push', 'u'], ['?', 'help', '?']]
  }
  const all = tab === 1 || tab === 3
  return [
    ['↑', 'up', 'k'],
    ['↓', 'down', 'j'],
    ['␣', 'start/stop', ' '],
    ['r', 'restart', 'r'],
    ['S', 'start all', 'S'],
    ['X', 'stop all', 'X'],
    all ? ['a', 'all logs', 'a'] : ['?', 'help', '?'],
    ['⚡', 'crash', null],
  ]
}

interface Props {
  tab: number
  onTab: (tab: number) => void
  onKey: (key: string) => void
  onCrash: () => void
}

// Touch controls shown under the terminal on small screens, where there is no keyboard.
export default function Pad({ tab, onTab, onKey, onCrash }: Props) {
  return (
    <div style={{ ...mono, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 6 }}>
        {TABS.map((label, i) => {
          const on = tab === i + 1
          return (
            <button
              key={label}
              onClick={() => onTab(i + 1)}
              style={{
                all: 'unset',
                textAlign: 'center',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 10,
                fontSize: 12,
                background: on ? '#7aa2f7' : '#0e131d',
                color: on ? '#11121b' : '#94a3b8',
                border: `1px solid ${on ? '#7aa2f7' : '#253043'}`,
              }}
            >
              {i + 1} {label}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 6 }}>
        {keys(tab).map(([label, hint, key]) => (
          <button key={label + hint} className="pad-key" onClick={() => (key == null ? onCrash() : onKey(key))}>
            <span style={{ fontSize: 15, color: '#7aa2f7' }}>{label}</span>
            <span style={{ fontSize: 10, color: '#7a82ab' }}>{hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
