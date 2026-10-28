import { useEffect, useRef } from 'react'
import Footer from './components/Footer'
import Header from './components/Header'
import Docs from './pages/Docs'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import PluginDetail from './pages/PluginDetail'
import Plugins from './pages/Plugins'
import { fx } from './lib/motion'
import { navigate, useLinkNavigation, useRoute } from './lib/router'

const SHORTCUTS: Record<string, string> = { '1': '/', '2': '/docs/', '3': '/plugins/' }

export default function App() {
  const route = useRoute()
  const pageKey = useRef<string | null>(null)
  useLinkNavigation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.closest('[data-terminal]'))) return
      const to = SHORTCUTS[e.key]
      if (to) {
        navigate(to)
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    // moving between docs only swaps the article, which animates itself; the sidebar stays put
    const key = route.view === 'docs' ? 'docs' : JSON.stringify(route)
    const prev = pageKey.current
    const first = prev === null
    pageKey.current = key
    if (first || key === prev) return
    fx(
      document.querySelector('[data-page]'),
      [
        { opacity: 0, transform: 'translateY(18px)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
      ],
      550,
    )
    fx(
      document.querySelector('[data-active="true"]'),
      [
        { transform: 'scale(.82)', filter: 'brightness(1.6)' },
        { transform: 'scale(1.06)' },
        { transform: 'scale(1)', filter: 'brightness(1)' },
      ],
      450,
    )
  }, [route])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header route={route} />
      {route.view === 'home' ? (
        <Home />
      ) : route.view === 'docs' ? (
        <Docs doc={route.doc} />
      ) : route.view === 'plugins' ? (
        route.plugin ? (
          <PluginDetail full={route.plugin} />
        ) : (
          <Plugins />
        )
      ) : (
        <NotFound />
      )}
      <Footer />
    </div>
  )
}
