import { useState } from 'react'
import { useMobile } from '../lib/useMobile'
import Terminal from './Terminal'
import { SVCS } from './data'
import { useSimulation } from './useSimulation'

const mono = { fontFamily: "'Geist Mono', monospace" }
const WORKER = SVCS.findIndex((s) => s.id === 'worker')

export default function Demo() {
  const mobile = useMobile()
  const { sim, snap } = useSimulation()
  const [sel, setSel] = useState(4)
  const id = SVCS[sel].id
  const crash = () => {
    if (sim.crash()) setSel(WORKER)
  }

  const buttons = [
    { key: 'S', label: 'start all', run: sim.startAll },
    { key: 'X', label: 'stop all', run: sim.stopAll },
    { key: 'r', label: `restart ${id}`, run: () => sim.restart(id) },
    { key: '⚡', label: 'crash worker', run: crash },
  ]

  return (
    <section
      id="demo"
      data-reveal="up"
      style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 620 }}>
          <div style={{ ...mono, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e2e8f0' }}>
            Live demo
            <span
              style={{
                fontSize: 11,
                color: '#e0af68',
                border: '1px solid #e0af6855',
                padding: '1px 8px',
                borderRadius: 99,
              }}
            >
              simulated · limited
            </span>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.55, color: '#94a3b8', textWrap: 'pretty' }}>
            {mobile
              ? 'A simplified version running in your browser. Use the keys below the terminal.'
              : 'A simplified version running in your browser. Click it to use the keyboard.'}
          </div>
        </div>
        <div style={{ display: mobile ? 'none' : 'flex', gap: 8, flexWrap: 'wrap' }}>
          {buttons.map((b) => (
            <button key={b.key} className="demo-btn" onClick={b.run}>
              <span style={{ color: '#22d3ee' }}>{b.key}</span>
              <span>{b.label}</span>
            </button>
          ))}
        </div>
      </div>
      <Terminal snap={snap} sim={sim} sel={sel} onSelect={setSel} onCrash={crash} />
    </section>
  )
}
