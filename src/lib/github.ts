import { useEffect, useState } from 'react'
import { CURATED } from '../content'

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

export interface Plugin {
  full: string
  desc: string
  stars?: number
  updated?: string
  url: string
  curated?: boolean
  stage?: string
}

export const pluginName = (full: string) => full.split('/')[1].replace(/^orbit-/, '')

export type Sort = 'stars' | 'updated'

export interface PluginSearch {
  items: Plugin[]
  error: string | null
}

interface SearchItem {
  full_name: string
  description: string | null
  stargazers_count: number
  pushed_at: string
  html_url: string
}

const searches = new Map<string, PluginSearch>()

// Anonymous GitHub search is limited to a handful of requests a minute, so keep what we got.
export async function searchPlugins(q: string, sort: Sort): Promise<PluginSearch> {
  const key = `${q}|${sort}`
  const cached = searches.get(key)
  if (cached) return cached

  let items: Plugin[] = []
  let error: string | null = null
  try {
    const query = encodeURIComponent((q ? q + ' ' : '') + 'topic:orbit-plugin')
    const r = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=${sort}&per_page=50`)
    if (!r.ok) {
      throw new Error(
        r.status === 403
          ? 'GitHub rate limit reached, showing the curated list. Try again in a minute.'
          : `GitHub search failed (${r.status}), showing the curated list.`,
      )
    }
    const j = (await r.json()) as { items: SearchItem[] }
    items = j.items.map((x) => ({
      full: x.full_name,
      desc: x.description || 'No description.',
      stars: x.stargazers_count,
      updated: x.pushed_at,
      url: x.html_url,
    }))
  } catch (e) {
    error = e instanceof TypeError ? 'Network error, showing the curated list.' : (e as Error).message
  }

  const ql = q.toLowerCase()
  for (const c of CURATED) {
    const existing = items.find((i) => i.full.toLowerCase() === c.full.toLowerCase())
    if (existing) {
      existing.curated = true
      existing.stage = c.stage
    } else if (!ql || `${c.full} ${c.desc}`.toLowerCase().includes(ql)) {
      items.push({ ...c, curated: true, url: `https://github.com/${c.full}` })
    }
  }
  items.sort((a, b) => Number(!!b.curated) - Number(!!a.curated))

  const result = { items, error }
  if (!error) searches.set(key, result)
  return result
}

export interface PluginDetail extends Plugin {
  lang?: string | null
  license?: string | null
  branch: string
  readme: string | null
}

async function getText(url: string, headers?: HeadersInit) {
  try {
    const r = await fetch(url, { headers })
    return r.ok ? await r.text() : null
  } catch {
    return null
  }
}

export async function fetchPlugin(full: string): Promise<PluginDetail> {
  const base = CURATED.find((c) => c.full.toLowerCase() === full.toLowerCase())
  const plugin: PluginDetail = { full, desc: base?.desc ?? '', stage: base?.stage, url: `https://github.com/${full}`, branch: 'HEAD', readme: null }

  const info = await getJSON<{
    description: string | null
    stargazers_count: number
    pushed_at: string
    license: { spdx_id: string } | null
    language: string | null
    html_url: string
    default_branch: string
  }>(`https://api.github.com/repos/${full}`)
  if (info) {
    plugin.desc = info.description || plugin.desc
    plugin.stars = info.stargazers_count
    plugin.updated = info.pushed_at
    plugin.license = info.license?.spdx_id
    plugin.lang = info.language
    plugin.url = info.html_url
    plugin.branch = info.default_branch
  }

  plugin.readme = await getText(`https://api.github.com/repos/${full}/readme`, { Accept: 'application/vnd.github.raw' })
  if (plugin.readme == null) {
    for (const b of ['main', 'master']) {
      plugin.readme = await getText(`https://raw.githubusercontent.com/${full}/${b}/README.md`)
      if (plugin.readme != null) {
        if (!info) plugin.branch = b
        break
      }
    }
  }
  return plugin
}
