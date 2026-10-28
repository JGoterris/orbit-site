import { useEffect, useState, type CSSProperties } from 'react'
import Pill from '../components/Pill'
import { navigate } from '../lib/router'
import { pluginName, searchPlugins, type PluginSearch, type Sort } from '../lib/github'
import { useCopy } from '../lib/useCopy'
import { useMobile } from '../lib/useMobile'
import { useReveal } from '../lib/useReveal'

const mono: CSSProperties = { fontFamily: "'Geist Mono', monospace" }

const SORTS: [Sort, string][] = [
  ['stars', '★ stars'],
  ['updated', 'updated'],
]

const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' })

export default function Plugins() {
  const mobile = useMobile()
  const { copied, copy } = useCopy()
  useReveal()

  const [query, setQuery] = useState('')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<Sort>('stars')
  const [found, setFound] = useState<(PluginSearch & { key: string }) | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setQ(query.trim()), 450)
    return () => clearTimeout(t)
  }, [query])

  const key = `${q}|${sort}`
  useEffect(() => {
    let stale = false
    searchPlugins(q, sort).then((r) => !stale && setFound({ ...r, key }))
    return () => {
      stale = true
    }
  }, [q, sort, key])

  const loading = found?.key !== key
  const items = found?.items ?? []
  const status = loading
    ? '◐ searching GitHub…'
    : found.error
      ? `✖ ${found.error}`
      : `${items.length} plugin${items.length === 1 ? '' : 's'}${q ? ` matching “${q}”` : ''}`

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 720 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(36px,5vw,56px)', letterSpacing: '-0.03em', fontWeight: 600 }}>
          Community plugins
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 17, lineHeight: 1.6, textWrap: 'pretty' }}>
          Plugins add tabs, columns, commands and service types, drawn by orbit so they feel part of it. Results come
          live from GitHub repositories with the topic <code style={{ ...mono, color: '#22d3ee' }}>orbit-plugin</code>.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label
          className="search-box"
          style={{
            flex: '1 1 280px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #253043',
            borderRadius: 10,
            padding: '0 14px',
            background: '#0e131d',
          }}
        >
          <span style={{ ...mono, color: '#a78bfa' }}>/</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plugins — kubernetes, gitlab, metrics…"
            style={{ all: 'unset', flex: 1, padding: '13px 0', fontSize: 15, color: '#e2e8f0' }}
          />
        </label>
        <div style={{ display: 'flex', border: '1px solid #253043', borderRadius: 10, overflow: 'hidden' }}>
          {SORTS.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setSort(k)}
              style={{
                all: 'unset',
                cursor: 'pointer',
                padding: '12px 16px',
                ...mono,
                fontSize: 12,
                color: sort === k ? '#0b0f17' : '#94a3b8',
                background: sort === k ? '#22d3ee' : 'transparent',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ ...mono, fontSize: 12, color: found?.error && !loading ? '#facc15' : '#64748b' }}>{status}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,340px),1fr))', gap: 14 }}>
        {items.map((p) => (
          <div
            key={p.full}
            className="plugin-card"
            data-reveal="up"
            onClick={() => navigate(`/plugins/${p.full}/`)}
            style={{
              cursor: 'pointer',
              border: '1px solid #1e2836',
              borderRadius: 12,
              background: '#0e131d',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ ...mono, fontSize: 17, fontWeight: 600, color: '#e2e8f0' }}>{pluginName(p.full)}</span>
              {p.curated && <Pill color="#4ade80">curated</Pill>}
              {p.stage && <Pill color="#facc15">{p.stage}</Pill>}
              {p.stars != null && (
                <span style={{ marginLeft: 'auto', ...mono, fontSize: 12, color: '#94a3b8' }}>
                  ★ {p.stars}
                  {p.updated && ` · ${monthYear.format(new Date(p.updated))}`}
                </span>
              )}
            </div>
            <div style={{ ...mono, fontSize: 12, color: '#64748b' }}>{p.full}</div>
            <div style={{ fontSize: 15, lineHeight: 1.55, color: '#cbd5e1', flex: 1, textWrap: 'pretty' }}>{p.desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #1a2230', paddingTop: 12 }}>
              <code
                style={{
                  flex: 1,
                  minWidth: 0,
                  ...mono,
                  fontSize: 12,
                  color: '#94a3b8',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                orbit plugin install {p.full}
              </code>
              <button
                className="copy-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  copy(`orbit plugin install ${p.full}`, `p:${p.full}`)
                }}
              >
                {copied === `p:${p.full}` ? '✔' : 'copy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 28,
          border: '1px dashed #253043',
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 620 }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Publish yours</div>
          <div style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6 }}>
            Publish it in a GitHub repository with the topic <code style={{ ...mono, color: '#22d3ee' }}>orbit-plugin</code>{' '}
            and it shows up here. A listing is not a security review: read what a plugin will run before you install it.
          </div>
        </div>
        <a
          href="/docs/plugins/authoring/"
          style={{
            ...mono,
            fontSize: 13,
            border: '1px solid #a78bfa',
            color: '#e2e8f0',
            padding: '10px 16px',
            borderRadius: 8,
          }}
        >
          Writing a plugin →
        </a>
      </div>
    </main>
  )
}
