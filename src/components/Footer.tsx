import { REPO } from '../lib/github'
import { useMobile } from '../lib/useMobile'

const YEAR = new Date().getFullYear()

export default function Footer() {
  const mobile = useMobile()

  return (
    <footer style={{ borderTop: '1px solid #1a2230' }}>
      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '28px 24px',
          display: 'flex',
          gap: 20,
          alignItems: 'center',
          flexWrap: 'wrap',
          fontSize: 13,
          color: '#64748b',
        }}
      >
        <img src="./logo.svg" alt="" style={{ width: 20, height: 20, borderRadius: 5 }} />
        <span style={{ fontFamily: "'Geist Mono', monospace" }}>
          © {YEAR}{' '}
          <a className="foot-link" href="https://jgoterris.com" target="_blank" rel="noreferrer">
            JGoterris
          </a>{' '}
          · orbit · MIT License
        </span>
        <span style={{ flex: 1, display: mobile ? 'none' : 'inline' }} />
        <a className="foot-link" href="#/docs/README.md">
          Docs
        </a>
        <a className="foot-link" href="#/plugins">
          Plugins
        </a>
        <a className="foot-link" href={`https://github.com/${REPO}`} target="_blank" rel="noreferrer">
          GitHub
        </a>
      </div>
    </footer>
  )
}
