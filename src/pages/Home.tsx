import { useState, type CSSProperties, type ReactNode } from 'react'
import HeroLogo from '../components/HeroLogo'
import Demo from '../demo/Demo'
import { FEATURES, INSTALL, type InstallTab } from '../content'
import { useCopy } from '../lib/useCopy'
import { useMobile } from '../lib/useMobile'
import { useReveal } from '../lib/useReveal'

const mono: CSSProperties = { fontFamily: "'Geist Mono', monospace" }
const prompt = <span style={{ color: '#64748b' }}>$ </span>

const box: CSSProperties = {
  ...mono,
  minWidth: 0,
  border: '1px solid #1e2836',
  borderRadius: 12,
  background: '#0e131d',
  color: '#e2e8f0',
  display: 'flex',
  flexDirection: 'column',
}

const h2: CSSProperties = { margin: 0, fontSize: 36, letterSpacing: '-0.025em', fontWeight: 600 }

function Code({ children }: { children: ReactNode }) {
  return <code style={{ ...mono, color: '#e2e8f0' }}>{children}</code>
}

function Hero() {
  const mobile = useMobile()
  const { copied, copy } = useCopy()
  const [tab, setTab] = useState<InstallTab>('brew')

  return (
    <section
      style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: mobile ? '36px 20px 24px' : '88px 24px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: mobile ? 8 : 40,
        flexWrap: 'wrap-reverse',
      }}
    >
      <div
        style={{
          flex: '1 1 340px',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 28,
        }}
      >
        <div
          data-reveal="up"
          style={{ ...mono, fontSize: 13, color: '#94a3b8', display: 'flex', gap: 10, alignItems: 'center' }}
        >
          <span style={{ color: '#4ade80' }}>●</span>
          <span>single static binary · Go · MIT</span>
        </div>
        <h1
          data-reveal="up"
          style={{
            margin: 0,
            fontSize: 'clamp(40px,6.4vw,76px)',
            lineHeight: 1.02,
            letterSpacing: '-0.035em',
            fontWeight: 600,
            maxWidth: 900,
            textWrap: 'balance',
          }}
        >
          Every local service, <span style={{ color: '#22d3ee' }}>in</span>{' '}
          <span style={{ color: '#a78bfa' }}>orbit</span>.
        </h1>
        <p
          data-reveal="up"
          style={{
            margin: 0,
            fontSize: mobile ? 17 : 19,
            lineHeight: 1.55,
            color: '#94a3b8',
            maxWidth: 640,
            textWrap: 'pretty',
          }}
        >
          TUI to launch, control and monitor local services —processes (backends, frontends, workers), Docker
          containers and <code style={{ ...mono, color: '#e2e8f0', fontSize: 16 }}>docker compose</code> services—
          respecting their dependencies.
        </p>
        <div
          data-reveal="up"
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: 620,
            border: '1px solid #1e2836',
            borderRadius: 12,
            overflow: 'hidden',
            background: '#0e131d',
          }}
        >
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #1e2836',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {(Object.keys(INSTALL) as InstallTab[]).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{
                  all: 'unset',
                  flexShrink: 0,
                  cursor: 'pointer',
                  padding: `12px ${mobile ? 14 : 16}px`,
                  ...mono,
                  fontSize: 12,
                  color: tab === k ? '#e2e8f0' : '#64748b',
                  borderBottom: `2px solid ${tab === k ? '#a78bfa' : 'transparent'}`,
                }}
              >
                {INSTALL[k].label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16 }}>
            <div
              style={{
                flex: 1,
                minWidth: 0,
                ...mono,
                fontSize: mobile ? 13 : 14,
                lineHeight: 1.7,
                color: '#e2e8f0',
                wordBreak: 'break-all',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {INSTALL[tab].cmd.split('\n').map((line) => (
                <div key={line}>
                  {prompt}
                  {line}
                </div>
              ))}
            </div>
            <button className="copy-btn" onClick={() => copy(INSTALL[tab].cmd, 'install')}>
              {copied === 'install' ? 'copied ✔' : 'copy'}
            </button>
          </div>
        </div>
      </div>
      <div
        data-reveal="scale"
        style={{
          flex: '1 1 340px',
          maxWidth: mobile ? 230 : 540,
          margin: mobile ? '0 auto' : '0 -16px 0 auto',
          aspectRatio: '1',
        }}
      >
        <HeroLogo />
      </div>
    </section>
  )
}

function Features() {
  const mobile = useMobile()

  return (
    <section
      style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: mobile ? '64px 20px 24px' : '96px 24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
        <h2 data-reveal="up" style={h2}>
          Features
        </h2>
        <a href="#/docs/features.md" style={{ fontSize: 14 }}>
          All the features →
        </a>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))',
          gap: 1,
          background: '#1a2230',
          border: '1px solid #1a2230',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {FEATURES.map((f) => (
          <div
            key={f.n}
            className="feature-card"
            data-reveal="fade"
            style={{
              padding: mobile ? '24px 22px' : 32,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ ...mono, fontSize: 12, color: f.c }}>{f.n}</div>
            <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>{f.t}</div>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: '#94a3b8', textWrap: 'pretty' }}>{f.d}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

const key = (t: string) => <span style={{ color: '#a78bfa' }}>{t}</span>

function QuickStart() {
  const mobile = useMobile()
  const steps = [
    ['cd my-project', ''],
    ['orbit init', '# writes orbit.yaml'],
    ['orbit', '# press ? for help'],
  ]
  const yaml: { indent: number; line: ReactNode }[] = [
    { indent: 0, line: <span style={{ color: '#64748b' }}># orbit.yaml</span> },
    { indent: 0, line: <>{key('name')}: my-stack</> },
    { indent: 0, line: <>{key('services')}:</> },
    { indent: 2, line: <span style={{ color: '#22d3ee' }}>postgres:</span> },
    { indent: 4, line: <>{key('image')}: postgres:16</> },
    { indent: 4, line: <>{key('ports')}: [<span style={{ color: '#4ade80' }}>"5432:5432"</span>]</> },
    { indent: 2, line: <span style={{ color: '#22d3ee' }}>api:</span> },
    { indent: 4, line: <>{key('cmd')}: npm run dev</> },
    { indent: 4, line: <>{key('cwd')}: ./api</> },
    { indent: 4, line: <>{key('port')}: 3000</> },
    { indent: 4, line: <>{key('depends_on')}: [postgres]</> },
  ]

  return (
    <section
      style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: mobile ? '56px 20px' : '80px 24px',
        display: 'flex',
        gap: mobile ? 28 : 56,
        flexWrap: 'wrap',
      }}
    >
      <div data-reveal="left" style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 style={h2}>Quick start</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.6, maxWidth: 420 }}>
          <Code>orbit init</Code> scans the project and writes an <Code>orbit.yaml</Code>. Your{' '}
          <Code>docker-compose.yml</Code> is imported automatically.
        </p>
        <div style={{ ...mono, fontSize: 14, lineHeight: 1.8, color: '#e2e8f0', display: 'flex', flexDirection: 'column' }}>
          {steps.map(([cmd, note]) => (
            <div key={cmd} style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span>
                {prompt}
                {cmd}
              </span>
              <span style={{ color: '#64748b' }}>{note}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 8, fontSize: 14 }}>
          <a href="#/docs/configuration.md">Configuration reference →</a>
        </div>
      </div>
      <div
        data-reveal="right"
        style={{ ...box, flex: '1 1 420px', padding: mobile ? 18 : 24, fontSize: mobile ? 13 : 14, lineHeight: 1.75 }}
      >
        {yaml.map(({ indent, line }, i) => (
          <div key={i} style={{ paddingLeft: `${indent}ch` }}>
            {line}
          </div>
        ))}
      </div>
    </section>
  )
}

const AGENT_STEPS = [
  ['install the skill', 'npx skills add JGoterris/orbit --skill orbit'],
  ['start, return once ready', 'orbit up -d [svc…]'],
  ['state of every service', 'orbit status --json'],
  ['recent logs, JSON per line', 'orbit logs api -n 100 --json'],
  ['restart and wait until ready', 'orbit ctl restart api'],
]

function Agents() {
  const mobile = useMobile()

  return (
    <section
      style={{
        maxWidth: 1160,
        margin: '0 auto',
        padding: mobile ? '24px 20px 64px' : '40px 24px 96px',
        display: 'flex',
        gap: mobile ? 28 : 56,
        flexWrap: 'wrap',
        borderTop: '1px solid #1a2230',
      }}
    >
      <div
        data-reveal="left"
        style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: 16, paddingTop: mobile ? 32 : 56 }}
      >
        <h2 style={h2}>Built for agents too</h2>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 16, lineHeight: 1.6, maxWidth: 460, textWrap: 'pretty' }}>
          Coding agents (Claude Code, Codex, Cursor…) can drive orbit through its CLI: start the services they need,
          restart them and read the logs. They share the daemon with your TUI, so you see everything they do.
        </p>
        <a href="#/docs/agents.md" style={{ fontSize: 14 }}>
          AI agents →
        </a>
      </div>
      <div
        data-reveal="right"
        style={{
          ...box,
          flex: '1 1 420px',
          marginTop: mobile ? 0 : 56,
          padding: mobile ? 18 : 24,
          fontSize: 14,
          lineHeight: 1.6,
          gap: 14,
        }}
      >
        {AGENT_STEPS.map(([note, cmd]) => (
          <div key={cmd} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ color: '#64748b', fontSize: 12 }}># {note}</span>
            <span style={{ wordBreak: 'break-word' }}>
              {prompt}
              {cmd}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  useReveal()

  return (
    <main data-page style={{ flex: 1 }}>
      <Hero />
      <Demo />
      <Features />
      <QuickStart />
      <Agents />
    </main>
  )
}
