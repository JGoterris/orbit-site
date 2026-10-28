import { useEffect, useRef, useState, type CSSProperties } from 'react'
import Pill from '../components/Pill'
import { CURATED } from '../content'
import { fetchPlugin, pluginName, type PluginDetail as Detail } from '../lib/github'
import { renderUntrusted, styleRepo } from '../lib/markdown'
import { useCopy } from '../lib/useCopy'
import { useHead } from '../lib/useHead'
import { useMobile } from '../lib/useMobile'
import { useReveal } from '../lib/useReveal'

const mono: CSSProperties = { fontFamily: "'Geist Mono', monospace" }

const label: CSSProperties = { ...mono, fontSize: 11, color: '#64748b', letterSpacing: '0.08em' }

const longDate = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' })

interface Loaded {
  full: string
  plugin: Detail
  html: string
}

export default function PluginDetail({ full }: { full: string }) {
  const mobile = useMobile()
  const { copied, copy } = useCopy()
  const readme = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  useReveal()

  // the route accepts any two path segments; only look up what is a valid repository name
  const valid = /^[\w.-]+\/[\w.-]+$/.test(full)

  useEffect(() => {
    if (!valid) return
    let stale = false
    fetchPlugin(full).then((plugin) => {
      if (!stale) setLoaded({ full, plugin, html: plugin.readme == null ? '' : renderUntrusted(plugin.readme) })
    })
    return () => {
      stale = true
    }
  }, [full, valid])

  const loading = valid && loaded?.full !== full
  const p = loaded?.full === full ? loaded.plugin : null
  const html = p ? loaded!.html : ''

  useEffect(() => {
    const el = readme.current
    if (!el) return
    el.innerHTML = html
    if (html && p) styleRepo(el, full, p.branch)
  }, [html, p, full])

  const curated = CURATED.find((c) => c.full.toLowerCase() === full.toLowerCase())
  const desc = p?.desc || curated?.desc || ''
  const stage = p?.stage || curated?.stage
  useHead({
    title: `${pluginName(full)} · orbit plugin`,
    description: desc || `The ${pluginName(full)} plugin for orbit.`,
    path: `/plugins/${full}/`,
    noindex: true,
  })
  const install = `orbit plugin install ${full}`
  const facts = [
    ['Stars', p?.stars != null ? `★ ${p.stars}` : '—'],
    ['Updated', p?.updated ? longDate.format(new Date(p.updated)) : '—'],
    ['Language', p?.lang || '—'],
    ['License', p?.license || '—'],
  ]

  return (
    <main
      data-page
      style={{
        flex: 1,
        maxWidth: 1160,
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: mobile ? '32px 20px 64px' : '64px 24px 96px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      <a href="/plugins/" style={{ ...mono, fontSize: 13, color: '#94a3b8' }}>
        ← All plugins
      </a>
      {!valid ? (
        <div style={{ ...mono, color: '#f87171' }}>✖ “{full}” is not a GitHub repository name.</div>
      ) : (
        <div style={{ display: 'flex', gap: mobile ? 20 : 48, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <article
            data-reveal="up"
            style={{ flex: '1 1 560px', order: 2, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, ...mono, fontSize: 'clamp(32px,4.5vw,48px)', letterSpacing: '-0.03em', fontWeight: 600 }}>
                {pluginName(full)}
              </h1>
              {curated && <Pill color="#4ade80">curated</Pill>}
              {stage && <Pill color="#facc15">{stage}</Pill>}
            </div>
            <div style={{ ...mono, fontSize: 13, color: '#64748b' }}>{full}</div>
            <p style={{ margin: '0 0 12px', fontSize: 17, lineHeight: 1.6, color: '#94a3b8', textWrap: 'pretty' }}>{desc}</p>
            <div style={{ ...label, paddingBottom: 8, borderBottom: '1px solid #1a2230' }}>README</div>
            {loading && <div style={{ ...mono, color: '#94a3b8', padding: '32px 0' }}>◐ loading README…</div>}
            {p && p.readme == null && (
              <div style={{ ...mono, color: '#f87171', padding: '32px 0' }}>✖ No README found for {full}.</div>
            )}
            <div ref={readme} style={{ fontSize: 16, lineHeight: 1.7, color: '#cbd5e1' }} />
          </article>

          <aside
            data-reveal="right"
            style={{
              flex: mobile ? '1 1 100%' : '0 1 320px',
              minWidth: 0,
              position: mobile ? 'static' : 'sticky',
              top: 96,
              order: mobile ? 1 : 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              border: '1px solid #1e2836',
              borderRadius: 12,
              padding: 22,
              background: '#0e131d',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={label}>INSTALL</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#0b0f17',
                  border: '1px solid #1e2836',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <code style={{ flex: 1, minWidth: 0, ...mono, fontSize: 12, color: '#e2e8f0', wordBreak: 'break-all' }}>
                  {install}
                </code>
                <button className="copy-btn" onClick={() => copy(install, 'pd')}>
                  {copied === 'pd' ? '✔' : 'copy'}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 14 }}>
              {facts.map(([k, v]) => (
                <div
                  key={k}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderBottom: '1px solid #1a2230' }}
                >
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ ...mono, color: '#e2e8f0' }}>{v}</span>
                </div>
              ))}
            </div>
            <a
              href={p?.url ?? `https://github.com/${full}`}
              target="_blank"
              rel="noreferrer"
              style={{
                textAlign: 'center',
                ...mono,
                fontSize: 13,
                border: '1px solid #a78bfa',
                color: '#e2e8f0',
                padding: '10px 16px',
                borderRadius: 8,
              }}
            >
              View on GitHub ↗
            </a>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: '#94a3b8' }}>
              orbit does not sandbox plugins. <code style={{ ...mono, color: '#e2e8f0' }}>orbit plugin install</code> shows
              what it will run and asks before installing.
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}
