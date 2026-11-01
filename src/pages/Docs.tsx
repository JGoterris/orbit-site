import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react'
import { ArticleSkeleton } from '../components/Skeleton'
import { DOCNAV } from '../content'
import { fetchDoc, scrollToAnchor, styleDoc } from '../lib/markdown'
import { fadedOut } from '../lib/motion'
import { docUrl } from '../lib/router'
import { docHead } from '../lib/seo'
import { useHead } from '../lib/useHead'
import { useMobile } from '../lib/useMobile'
import { useSlider } from '../lib/useSlider'

const mono = { fontFamily: "'Geist Mono', monospace" }

interface Loaded {
  doc: string
  html: string
  error: string | null
}

export default function Docs({ doc }: { doc: string }) {
  const mobile = useMobile()
  useHead(docHead(doc))
  const content = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const { container: aside, marker } = useSlider<HTMLElement>('[data-current="true"]', doc)

  useEffect(() => {
    let stale = false
    const next = fetchDoc(doc).then(
      (html) => ({ doc, html, error: null }),
      (e: Error) => ({ doc, html: '', error: e.message }),
    )
    // the previous page stays, fading out, until this one is here
    Promise.all([next, fadedOut()]).then(([l]) => !stale && setLoaded(l))
    return () => {
      stale = true
    }
  }, [doc])

  const loading = loaded?.doc !== doc

  // before paint, or the previous page would flash as the fade back in starts
  useLayoutEffect(() => {
    const el = content.current
    if (!el || !loaded) return
    el.innerHTML = loaded.html
    if (loaded.html) styleDoc(el, loaded.doc)
  }, [loaded])

  const onContentClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLElement>('a[data-anchor]')
    if (a && content.current) scrollToAnchor(content.current, a.dataset.anchor!)
  }

  const current = DOCNAV.find((d) => 'path' in d && d.path === doc)
  const asideOpen = !mobile || navOpen

  return (
    <main
      data-page
      style={{
        flex: 1,
        maxWidth: 1160,
        width: '100%',
        boxSizing: 'border-box',
        margin: '0 auto',
        padding: mobile ? '20px 16px 64px' : '40px 24px 96px',
        display: 'flex',
        gap: mobile ? 20 : 48,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
      }}
    >
      {mobile && (
        <button
          onClick={() => setNavOpen(!navOpen)}
          style={{
            all: 'unset',
            boxSizing: 'border-box',
            width: '100%',
            minHeight: 46,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '0 14px',
            border: '1px solid #253043',
            borderRadius: 10,
            background: '#0e131d',
            ...mono,
            fontSize: 13,
            color: '#e2e8f0',
          }}
        >
          <span>
            <span style={{ color: '#64748b' }}>Contents · </span>
            {current && 'label' in current ? current.label : 'Docs'}
          </span>
          <span style={{ color: '#a78bfa' }}>{navOpen ? '▴' : '▾'}</span>
        </button>
      )}
      <aside
        ref={aside}
        onClick={() => setNavOpen(false)}
        style={{
          flex: mobile ? '1 1 100%' : '0 0 220px',
          position: mobile ? 'relative' : 'sticky',
          top: 96,
          display: asideOpen ? 'flex' : 'none',
          flexDirection: 'column',
          gap: 2,
          fontSize: 14,
        }}
      >
        <span ref={marker} className="slider" style={{ borderRadius: 6, background: '#151c28' }} />
        {DOCNAV.map((d) =>
          'section' in d ? (
            <div
              key={d.section}
              style={{ position: 'relative', ...mono, fontSize: 11, color: '#64748b', letterSpacing: '0.08em', padding: '16px 10px 6px' }}
            >
              {d.section.toUpperCase()}
            </div>
          ) : (
            <a
              key={d.path}
              className="doc-link"
              href={docUrl(d.path)}
              data-current={doc === d.path}
              style={{
                position: 'relative',
                display: 'block',
                padding: mobile ? '10px 12px' : '6px 10px',
                borderRadius: 6,
                color: doc === d.path ? '#e2e8f0' : '#94a3b8',
              }}
            >
              {d.label}
            </a>
          ),
        )}
      </aside>
      <article style={{ flex: '1 1 480px', minWidth: 0, maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, ...mono, fontSize: 12, color: '#64748b' }}>
          <span>docs/{doc}</span>
        </div>
        {loaded?.error && !loading && <div style={{ ...mono, color: '#f87171', padding: '40px 0' }}>✖ {loaded.error}</div>}
        <div className="swap" data-loading={loading}>
          <div className="swap-hint" aria-hidden>
            <ArticleSkeleton />
          </div>
          <div
            ref={content}
            className="swap-content"
            onClick={onContentClick}
            style={{ fontSize: 16, lineHeight: 1.7, color: '#cbd5e1' }}
          />
        </div>
      </article>
    </main>
  )
}
