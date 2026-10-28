import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from './src/site.ts'

// index.html carries the site-wide meta tags; fill in the values that live in src/site.ts
const siteMeta = (): Plugin => ({
  name: 'site-meta',
  transformIndexHtml: {
    order: 'pre',
    handler: (html) =>
      html
        .replaceAll('%SITE_URL%', SITE_URL)
        .replaceAll('%SITE_TITLE%', SITE_TITLE)
        .replaceAll('%SITE_DESCRIPTION%', SITE_DESCRIPTION),
  },
})

export default defineConfig({
  plugins: [react(), siteMeta()],
})
