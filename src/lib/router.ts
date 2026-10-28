import { useEffect, useState } from 'react'

export type Route =
  | { view: 'home' }
  | { view: 'docs'; doc: string }
  | { view: 'plugins'; plugin: string | null }

export function parseHash(): Route {
  const h = (location.hash || '').replace(/^#\/?/, '')
  if (h.startsWith('docs/')) return { view: 'docs', doc: h.slice(5) || 'README.md' }
  if (h.startsWith('plugins')) {
    const p = h.slice(8)
    return { view: 'plugins', plugin: p.split('/').length === 2 ? decodeURIComponent(p) : null }
  }
  return { view: 'home' }
}

export function joinPath(dir: string, rel: string) {
  const out: string[] = []
  for (const p of (dir + rel).split('/')) {
    if (p === '..') out.pop()
    else if (p !== '.') out.push(p)
  }
  return out.join('/')
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    const onHash = () => {
      setRoute(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return route
}
