import { useEffect, useRef } from 'react'
import { fx } from './motion'

const FROM: Record<string, Keyframe> = {
  fade: { opacity: 0 },
  scale: { opacity: 0, transform: 'scale(.86) rotate(-8deg)', filter: 'blur(8px)' },
  left: { opacity: 0, transform: 'translateX(-32px)' },
  right: { opacity: 0, transform: 'translateX(32px)' },
  up: { opacity: 0, transform: 'translateY(28px)' },
}

const DURATION: Record<string, number> = { scale: 1100, fade: 600 }

// Plays each [data-reveal] element once when it scrolls into view. Runs after every
// render so elements that appear later (fetched cards) are picked up too.
export function useReveal() {
  const io = useRef<IntersectionObserver>(undefined)
  const anims = useRef(new WeakMap<Element, Animation>())

  useEffect(() => {
    io.current = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          anims.current.get(e.target)?.play()
          io.current?.unobserve(e.target)
        }),
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    )
    return () => io.current?.disconnect()
  }, [])

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
      if (!anims.current.has(el)) {
        const siblings = [...(el.parentElement?.children ?? [])].filter((c) => c.hasAttribute('data-reveal'))
        const i = Math.min(siblings.indexOf(el), 8)
        const type = el.dataset.reveal ?? 'up'
        const a = fx(
          el,
          [FROM[type] ?? FROM.up, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
          DURATION[type] ?? 750,
          type === 'fade' ? i * 50 : i * 90,
        )
        if (!a) return
        a.pause()
        anims.current.set(el, a)
      }
      if (anims.current.get(el)?.playState === 'paused') io.current?.observe(el)
    })
  })
}
