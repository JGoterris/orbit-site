import type { CSSProperties } from 'react'
import { REPO, useRepoInfo } from '../lib/github'
import { useMobile } from '../lib/useMobile'
import type { Route } from '../lib/router'
import NavLogo from './NavLogo'

const ITEMS = [
  { key: '1', label: 'home', href: '#/', view: 'home' },
  { key: '2', label: 'docs', href: '#/docs/README.md', view: 'docs' },
  { key: '3', label: 'plugins', href: '#/plugins', view: 'plugins' },
] as const

const maskBorder: CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: 18,
  padding: 1,
  overflow: 'hidden',
  pointerEvents: 'none',
  WebkitMask: 'linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0)',
  background: '#ffffff14',
}

const glow: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: 1200,
  height: 1200,
  background:
    'conic-gradient(from 0deg,#22d3ee00 0deg,#22d3ee 40deg,#a78bfa 90deg,#a78bfa00 140deg,#a78bfa00 200deg,#4ade80aa 240deg,#22d3ee00 290deg)',
  animation: 'orbitSpin 8s linear infinite',
  transform: 'translate(-50%,-50%)',
}

export default function Header({ route }: { route: Route }) {
  const mobile = useMobile()
  const { version, stars } = useRepoInfo()
  const desk = mobile ? 'none' : 'inline'

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        padding: mobile ? '10px 10px 0' : '14px 16px 0',
        fontFamily: "'Geist Mono', monospace",
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          maxWidth: 1160,
          margin: '0 auto',
          borderRadius: 18,
          boxShadow: '0 20px 60px -24px #a78bfa66',
        }}
      >
        <div style={maskBorder}>
          <div style={glow} />
        </div>
        <div
          style={{
            position: 'relative',
            borderRadius: 18,
            border: '1px solid transparent',
            background: 'linear-gradient(180deg,#1e273a73,#0b0f1759)',
            backdropFilter: 'blur(18px) saturate(170%)',
            WebkitBackdropFilter: 'blur(18px) saturate(170%)',
            boxShadow: 'inset 0 1px 0 #ffffff14, inset 0 -1px 0 #ffffff05',
            padding: '9px 9px 9px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: mobile ? 10 : 14,
            flexWrap: 'wrap',
          }}
        >
          <a href="#/" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#e2e8f0' }}>
            <span style={{ width: 34, height: 34, display: 'block' }}>
              <NavLogo />
            </span>
            <span style={{ fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>orbit</span>
            <span
              style={{
                fontSize: 11,
                color: '#a78bfa',
                border: '1px solid #a78bfa55',
                padding: '1px 7px',
                borderRadius: 99,
                display: desk,
              }}
            >
              {version ?? 'latest'}
            </span>
          </a>
          <nav
            style={{
              display: 'flex',
              gap: mobile ? 4 : 8,
              flex: '1 1 auto',
              order: mobile ? 3 : 0,
              flexBasis: mobile ? '100%' : 'auto',
              justifyContent: 'center',
              fontSize: 13,
              padding: 3,
              borderRadius: 12,
              background: '#ffffff08',
              border: '1px solid #ffffff12',
              boxShadow: 'inset 0 1px 0 #ffffff0a',
            }}
          >
            {ITEMS.map((n) => {
              const active = route.view === n.view
              return (
                <a
                  key={n.key}
                  className="nav-link"
                  href={n.href}
                  data-active={active}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: mobile ? '1' : '0 0 auto',
                    gap: 8,
                    padding: mobile ? '10px 8px' : '7px 16px',
                    transition: 'color .2s',
                    borderRadius: 8,
                    background: active ? 'linear-gradient(135deg,#22d3ee,#a78bfa)' : 'transparent',
                    color: active ? '#0b0f17' : '#94a3b8',
                    boxShadow: active ? '0 6px 20px -6px #a78bfaaa' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: active ? '#0b0f17' : '#64748b',
                      border: `1px solid ${active ? '#0b0f1755' : '#253043'}`,
                      borderRadius: 4,
                      padding: '0 5px',
                      lineHeight: '16px',
                      display: desk,
                    }}
                  >
                    {n.key}
                  </span>
                  <span>{n.label}</span>
                </a>
              )
            })}
          </nav>
          <a
            className="star-link"
            href={`https://github.com/${REPO}`}
            target="_blank"
            rel="noreferrer"
            title={`Star ${REPO} on GitHub`}
            style={{
              display: 'flex',
              alignItems: 'stretch',
              marginLeft: mobile ? 'auto' : 0,
              fontSize: 12,
              color: '#e2e8f0',
              border: '1px solid #ffffff17',
              borderRadius: 10,
              overflow: 'hidden',
              background: '#ffffff06',
            }}
          >
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: `8px ${mobile ? 10 : 12}px`,
                background: '#ffffff0d',
              }}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span style={{ display: desk }}>Star</span>
            </span>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '8px 12px',
                borderLeft: '1px solid #ffffff17',
              }}
            >
              <span style={{ color: '#facc15' }}>★</span>
              {stars ?? '—'}
            </span>
          </a>
        </div>
      </div>
    </header>
  )
}
