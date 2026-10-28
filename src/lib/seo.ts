import { DOCNAV } from '../content'
import { SITE_DESCRIPTION, SITE_TITLE } from '../site'
import { docUrl } from './router'
import type { Head } from './useHead'

export function docHead(file: string): Head {
  const entry = DOCNAV.find((d) => 'path' in d && d.path === file)
  const label = entry && 'label' in entry ? entry.label : 'Docs'
  return {
    title: file === 'README.md' ? 'orbit documentation' : `${label} · orbit docs`,
    description: entry && 'desc' in entry ? entry.desc : 'Documentation of orbit.',
    path: docUrl(file),
  }
}

export const homeHead: Head = { title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' }

export const pluginsHead: Head = {
  title: 'Community plugins · orbit',
  description: 'Plugins for orbit, found live on GitHub: new tabs, columns, commands and service types.',
  path: '/plugins/',
}
