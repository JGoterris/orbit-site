// Markdown to HTML without touching the DOM or Vite, so the build scripts can use it too.
import { marked } from 'marked'
import { docUrl, joinPath } from './router'

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

export const renderDoc = (md: string) => renderMarkdown(admonitions(md))

export const REPO_DOCS = 'https://github.com/JGoterris/orbit/blob/main/docs/'

export type DocLink = { anchor: string } | { href: string; external: boolean }

// Where a link found in a doc should point: .md links stay inside the site, anything else
// goes to the repository on GitHub. `dir` is the folder of the doc, like "plugins/".
export function resolveDocHref(h: string, dir: string): DocLink {
  const gh = h.match(/github\.com\/JGoterris\/orbit\/blob\/main\/docs\/([^#]+\.md)/)
  if (gh) return { href: docUrl(gh[1]), external: false }
  if (/^https?:/.test(h)) return { href: h, external: true }
  if (h.startsWith('#')) return { anchor: h.slice(1) }
  if (/\.md(#.*)?$/.test(h)) return { href: docUrl(joinPath(dir, h.replace(/#.*$/, ''))), external: false }
  return { href: REPO_DOCS + joinPath(dir, h), external: true }
}
