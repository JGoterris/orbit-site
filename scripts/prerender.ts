// Writes a real HTML file for every page that has stable content, so search engines and link
// previews get the title, description and text without running any JavaScript. The app replaces
// that markup as soon as it loads.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOCNAV, FEATURES } from '../src/content.ts'
import { renderDoc, resolveDocHref } from '../src/lib/render.ts'
import { docUrl } from '../src/lib/router.ts'
import { docHead, homeHead, pluginsHead } from '../src/lib/seo.ts'
import type { Head } from '../src/lib/useHead.ts'
import { SITE_URL } from '../src/site.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

// Replaces the one thing `re` matches; a template that changed shape should fail the build, not
// quietly ship a page with the home page's tags.
function replaceOnce(html: string, re: RegExp, replacement: (...groups: string[]) => string) {
  if (!re.test(html)) throw new Error(`prerender: ${re} not found in the template`)
  return html.replace(re, (_, ...groups: string[]) => replacement(...groups))
}

function page(template: string, { title, description, path }: Head, body: string) {
  const url = SITE_URL + path
  const content = (attr: string, name: string, value: string): [RegExp, string] => [
    new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(")`),
    value,
  ]
  const tags: [RegExp, string][] = [
    content('name', 'description', description),
    content('property', 'og:title', title),
    content('property', 'og:description', description),
    content('property', 'og:url', url),
    content('name', 'twitter:title', title),
    content('name', 'twitter:description', description),
    [/(<link rel="canonical" href=")[^"]*(")/, url],
  ]

  let html = replaceOnce(template, /<title>[^<]*<\/title>/, () => `<title>${esc(title)}</title>`)
  for (const [re, value] of tags) html = replaceOnce(html, re, (before, after) => before + esc(value) + after)
  return replaceOnce(html, /<div id="root"><\/div>/, () => `<div id="root">${body}</div>`)
}

const wrap = (width: number, inner: string) =>
  `<div style="max-width:${width}px;margin:0 auto;padding:40px 24px;line-height:1.7;color:#cbd5e1;font-family:'Geist',system-ui,sans-serif">${inner}</div>`

const topLinks = `<p><a href="/">orbit</a> · <a href="/docs/">Docs</a> · <a href="/plugins/">Plugins</a> · <a href="https://github.com/JGoterris/orbit">GitHub</a></p>`

function homeBody() {
  const features = FEATURES.map((f) => `<li><strong>${esc(f.t)}</strong>: ${esc(f.d)}</li>`).join('')
  return wrap(
    1160,
    `${topLinks}
<h1>Every local service, in orbit.</h1>
<p>TUI to launch, control and monitor local services — processes (backends, frontends, workers), Docker containers and docker compose services — respecting their dependencies.</p>
<h2>Features</h2>
<ul>${features}</ul>`,
  )
}

function pluginsBody() {
  return wrap(
    1160,
    `${topLinks}
<h1>Community plugins</h1>
<p>Plugins add tabs, columns, commands and service types, drawn by orbit so they feel part of it. Results come live from GitHub repositories with the topic orbit-plugin.</p>
<p><a href="/docs/plugins/authoring/">Writing a plugin</a></p>`,
  )
}

function docBody(file: string) {
  const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/') + 1) : ''
  const html = renderDoc(readFileSync(join(root, 'src', 'docs', file), 'utf8')).replace(
    /<a href="([^"]*)"/g,
    (_, h: string) => {
      const link = resolveDocHref(h.replace(/&amp;/g, '&'), dir)
      return `<a href="${'href' in link ? esc(link.href) : esc(h)}"`
    },
  )
  const nav = DOCNAV.map((d) =>
    'section' in d ? `<li><strong>${esc(d.section)}</strong></li>` : `<li><a href="${docUrl(d.path)}">${esc(d.label)}</a></li>`,
  ).join('')
  return wrap(780, `${topLinks}<article>${html}</article><nav aria-label="Documentation"><ul style="list-style:none;padding:0">${nav}</ul></nav>`)
}

// Returns the urls it wrote a page for.
export function prerender(dist: string, template: string) {
  const write = (head: Head, body: string) => {
    const dir = join(dist, head.path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), page(template, head, body))
    return head.path
  }

  return [
    write(homeHead, homeBody()),
    write(pluginsHead, pluginsBody()),
    ...DOCNAV.flatMap((d) => ('path' in d ? [write(docHead(d.path), docBody(d.path))] : [])),
  ]
}
