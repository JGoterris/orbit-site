import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { DOCNAV } from '../content'

export type Route =
  | { view: 'home' }
  | { view: 'docs'; doc: string }
  | { view: 'plugins'; plugin: string | null }
  | { view: 'notfound' }

const DOC_FILES = DOCNAV.flatMap((d) => ('path' in d ? [d.path] : []))

// README.md -> /docs/, plugins/index.md -> /docs/plugins/, usage.md -> /docs/usage/
export function docUrl(file: string) {
  const stem = file.replace(/(^|\/)(README|index)\.md$/, '$1').replace(/\.md$/, '')
  return '/docs/' + stem + (stem && !stem.endsWith('/') ? '/' : '')
}

function docFile(rest: string) {
  const stem = rest.replace(/\/+$/, '')
  return stem ? DOC_FILES.find((f) => docUrl(f) === `/docs/${stem}/`) : 'README.md'
}

export function parsePath(pathname: string): Route {
  const parts = pathname.split('/').filter(Boolean)
  if (!parts.length) return { view: 'home' }

  if (parts[0] === 'docs') {
    const doc = docFile(parts.slice(1).join('/'))
    return doc ? { view: 'docs', doc } : { view: 'notfound' }
  }

  if (parts[0] === 'plugins') {
    if (parts.length === 1) return { view: 'plugins', plugin: null }
    if (parts.length === 3) {
      try {
        return { view: 'plugins', plugin: decodeURIComponent(`${parts[1]}/${parts[2]}`) }
      } catch {
        return { view: 'notfound' }
      }
    }
  }
  return { view: 'notfound' }
}

export function joinPath(dir: string, rel: string) {
  const out: string[] = []
  for (const p of (dir + rel).split('/')) {
    if (p === '..') out.pop()
    else if (p !== '.') out.push(p)
  }
  return out.join('/')
}

const listeners = new Set<() => void>()

function subscribe(fn: () => void) {
  listeners.add(fn)
  window.addEventListener('popstate', fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('popstate', fn)
  }
}

export function navigate(to: string) {
  if (to === location.pathname + location.search + location.hash) return
  history.pushState(null, '', to)
  window.scrollTo(0, 0)
  listeners.forEach((fn) => fn())
}

export function useRoute() {
  const path = useSyncExternalStore(subscribe, () => location.pathname)
  return useMemo(() => parsePath(path), [path])
}

// Plain <a href="/..."> links navigate without a page load, like in any single page app.
export function useLinkNavigation() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element).closest('a')
      if (!a || !a.getAttribute('href') || a.target || a.hasAttribute('download')) return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      e.preventDefault()
      navigate(url.pathname + url.search + url.hash)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
