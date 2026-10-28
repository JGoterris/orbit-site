import { useEffect, useState } from 'react'

export const REPO = 'JGoterris/orbit'

async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url)
    return r.ok ? ((await r.json()) as T) : null
  } catch {
    return null
  }
}

export function useRepoInfo() {
  const [version, setVersion] = useState<string | null>(null)
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    getJSON<{ tag_name?: string }>(`https://api.github.com/repos/${REPO}/releases/latest`).then(
      (j) => j?.tag_name && setVersion(j.tag_name),
    )
    getJSON<{ stargazers_count?: number }>(`https://api.github.com/repos/${REPO}`).then(
      (j) => j?.stargazers_count != null && setStars(j.stargazers_count),
    )
  }, [])

  return { version, stars }
}
