// Runs after `vite build`: the extra files a static host and the search engines expect in dist/.
import { copyFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DOCNAV } from '../src/content.ts'
import { docUrl } from '../src/lib/router.ts'
import { SITE_URL } from '../src/site.ts'

const dist = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist')

// GitHub Pages serves 404.html for any path it has no file for; the app routes those itself
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'))

const paths = ['/', ...DOCNAV.flatMap((d) => ('path' in d ? [docUrl(d.path)] : [])), '/plugins/']
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`,
)

writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)

console.log(`postbuild: sitemap with ${paths.length} urls, robots.txt, 404.html`)
