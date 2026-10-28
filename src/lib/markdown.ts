import { marked } from 'marked'
import { joinPath } from './router'

export const RAW = 'https://raw.githubusercontent.com/JGoterris/orbit/main/'

const DOCSTYLE: Record<string, string> = {
  h1: 'font-size:40px;letter-spacing:-0.03em;font-weight:600;color:#e2e8f0;margin:8px 0 20px;line-height:1.1',
  h2: 'font-size:26px;letter-spacing:-0.02em;font-weight:600;color:#e2e8f0;margin:44px 0 12px;padding-top:20px;border-top:1px solid #1a2230',
  h3: 'font-size:19px;font-weight:600;color:#e2e8f0;margin:28px 0 8px',
  p: 'margin:0 0 16px;text-wrap:pretty',
  ul: 'margin:0 0 16px;padding-left:22px',
  ol: 'margin:0 0 16px;padding-left:22px',
  li: 'margin:4px 0',
  pre: "background:#0e131d;border:1px solid #1e2836;border-radius:10px;padding:16px 18px;overflow:auto;margin:0 0 18px;font-family:'Geist Mono',monospace;font-size:13.5px;line-height:1.65;color:#e2e8f0",
  code: "font-family:'Geist Mono',monospace;font-size:0.88em;color:#e2e8f0;background:#151c28;padding:2px 6px;border-radius:5px",
  table: 'width:100%;border-collapse:collapse;margin:0 0 20px;font-size:14px;display:block;overflow-x:auto',
  th: 'text-align:left;padding:8px 12px;border-bottom:1px solid #253043;color:#94a3b8;font-weight:500',
  td: 'padding:8px 12px;border-bottom:1px solid #1a2230;vertical-align:top',
  blockquote: 'margin:0 0 18px;padding:14px 18px;border:1px solid #facc1544;background:#facc150d;border-radius:10px;color:#e2e8f0',
  strong: 'color:#e2e8f0;font-weight:600',
  a: 'color:#22d3ee',
  img: 'max-width:100%;border-radius:10px',
  hr: 'border:none;border-top:1px solid #1a2230;margin:32px 0',
}

export function renderMarkdown(md: string) {
  return marked.parse(md, { async: false })
}

// The docs were written for MkDocs, whose `!!! type "Title"` admonitions marked does not know.
function admonitions(md: string) {
  return md
    .replace(
      /^!!! *(\w+) *"([^"]*)"\s*\n((?:(?: {4}.*)?\n?)*)/gm,
      (_, _type: string, title: string, body: string) =>
        `> **${title}**\n>\n` +
        body
          .split('\n')
          .map((l) => '> ' + l.replace(/^ {4}/, ''))
          .join('\n') +
        '\n\n',
    )
    .replace(/^!!! *(\w+) *"([^"]*)" +(.+)$/gm, (_, _type: string, title: string, body: string) => `> **${title}** ${body}\n`)
}

// src/docs is filled by scripts/fetch-docs.ts; each page becomes its own small chunk.
const docs = import.meta.glob<string>('../docs/**/*.md', { query: '?raw', import: 'default' })

export async function fetchDoc(path: string) {
  const load = docs[`../docs/${path}`]
  if (!load) throw new Error(`docs/${path} not found`)
  return renderMarkdown(admonitions(await load()))
}

function styleTags(el: HTMLElement) {
  el.querySelectorAll<HTMLElement>('*').forEach((n) => {
    const s = DOCSTYLE[n.tagName.toLowerCase()]
    if (s) n.style.cssText = s
  })
  el.querySelectorAll<HTMLElement>('pre code').forEach((n) => {
    n.style.cssText = 'background:none;padding:0;font-size:inherit;color:inherit;font-family:inherit'
  })
}

// Styles rendered markdown and points its links and images at the right place: .md links
// stay inside the site, anything else goes to the repository on GitHub.
export function styleDoc(el: HTMLElement, path: string) {
  const dir = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : ''
  styleTags(el)
  el.querySelectorAll('a').forEach((a) => {
    const h = a.getAttribute('href') ?? ''
    const gh = h.match(/github\.com\/JGoterris\/orbit\/blob\/main\/docs\/([^#]+\.md)/)
    if (gh) a.setAttribute('href', '#/docs/' + gh[1])
    else if (/^https?:/.test(h)) {
      a.target = '_blank'
      a.rel = 'noreferrer'
    } else if (h.startsWith('#')) {
      a.dataset.anchor = h.slice(1)
      a.removeAttribute('href')
      a.style.cursor = 'default'
    } else if (/\.md(#.*)?$/.test(h)) a.setAttribute('href', '#/docs/' + joinPath(dir, h.replace(/#.*$/, '')))
    else a.setAttribute('href', `https://github.com/JGoterris/orbit/blob/main/docs/${joinPath(dir, h)}`)
  })
  el.querySelectorAll('img').forEach((i) => {
    const s = i.getAttribute('src') ?? ''
    if (!/^https?:/.test(s)) i.src = `${RAW}docs/${joinPath(dir, s)}`
  })
}

const slug = (t: string) =>
  t
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-|-$/g, '')

// In-page links have no href (the hash is the router), so scroll to the heading ourselves.
export function scrollToAnchor(el: HTMLElement, id: string) {
  const target = [...el.querySelectorAll('h1,h2,h3')].find((h) => slug(h.textContent ?? '') === id)
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' })
}
