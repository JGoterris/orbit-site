import { useHead } from '../lib/useHead'

export default function NotFound() {
  useHead({ title: 'Page not found · orbit', description: 'This page does not exist.', path: location.pathname, noindex: true })

  return (
    <main
      data-page
      style={{
        flex: 1,
        maxWidth: 1160,
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: '96px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'flex-start',
      }}
    >
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: '#64748b' }}>404</div>
      <h1 style={{ margin: 0, fontSize: 'clamp(36px,5vw,56px)', letterSpacing: '-0.03em', fontWeight: 600 }}>
        Nothing in this orbit
      </h1>
      <p style={{ margin: 0, color: '#94a3b8', fontSize: 17, lineHeight: 1.6 }}>
        That page does not exist. Try the <a href="/docs/">docs</a> or go back <a href="/">home</a>.
      </p>
    </main>
  )
}
