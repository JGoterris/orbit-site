import { useCallback, useEffect, useRef, useState } from 'react'

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const timer = useRef<number>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {})
    setCopied(key)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopied(null), 1400)
  }, [])

  return { copied, copy }
}
