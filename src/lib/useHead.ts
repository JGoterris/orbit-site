import { useEffect } from 'react'
import { SITE_URL } from '../site'

export interface Head {
  title: string
  description: string
  path: string
  noindex?: boolean
}

const set = (selector: string, attr: 'content' | 'href', value: string) =>
  document.head.querySelector(selector)?.setAttribute(attr, value)

// Keeps the tags in index.html in step with the page being shown.
export function useHead({ title, description, path, noindex = false }: Head) {
  useEffect(() => {
    const url = SITE_URL + path
    document.title = title
    set('meta[name="description"]', 'content', description)
    set('meta[name="robots"]', 'content', noindex ? 'noindex' : 'index, follow')
    set('link[rel="canonical"]', 'href', url)
    set('meta[property="og:title"]', 'content', title)
    set('meta[property="og:description"]', 'content', description)
    set('meta[property="og:url"]', 'content', url)
    set('meta[name="twitter:title"]', 'content', title)
    set('meta[name="twitter:description"]', 'content', description)
  }, [title, description, path, noindex])
}
