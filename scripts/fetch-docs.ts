// Copies the orbit docs (markdown only) into src/docs so they ship with the site.
//
// Source, in order: $DOCS_DIR, a sibling ../orbit/docs checkout (not on CI, handy to preview
// unreleased changes), or a shallow clone of the latest published release on GitHub, so the
// site never documents what has not shipped yet.
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'src', 'docs')
const repo = 'JGoterris/orbit'

// docs/demo is a separate project with its own git history, not documentation
const skip = new Set(['demo'])

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return skip.has(e.name) ? [] : markdownFiles(join(dir, e.name))
    return e.name.endsWith('.md') ? [join(dir, e.name)] : []
  })
}

async function latestRelease() {
  // the token only lifts the anonymous rate limit; CI provides one
  const token = process.env.GITHUB_TOKEN
  const r = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json', ...(token && { Authorization: `Bearer ${token}` }) },
  })
  if (!r.ok) throw new Error(`could not find the latest release of ${repo} (${r.status})`)
  return ((await r.json()) as { tag_name: string }).tag_name
}

async function sourceDir(): Promise<{ dir: string; label: string; tmp?: string }> {
  if (process.env.DOCS_DIR) return { dir: resolve(process.env.DOCS_DIR), label: 'DOCS_DIR' }

  const sibling = resolve(root, '..', 'orbit', 'docs')
  if (!process.env.CI && existsSync(sibling)) return { dir: sibling, label: 'local checkout' }

  const tag = await latestRelease()
  const tmp = mkdtempSync(join(tmpdir(), 'orbit-docs-'))
  const clone = ['clone', '--depth', '1', '--branch', tag, '--filter=blob:none', '--sparse']
  execFileSync('git', [...clone, `https://github.com/${repo}.git`, tmp], { stdio: 'inherit' })
  execFileSync('git', ['-C', tmp, 'sparse-checkout', 'set', 'docs'], { stdio: 'inherit' })
  return { dir: join(tmp, 'docs'), label: `${repo} ${tag}`, tmp }
}

const { dir, label, tmp } = await sourceDir()

try {
  const files = markdownFiles(dir)
  if (!files.length) throw new Error(`no markdown files found in ${dir}`)

  rmSync(dest, { recursive: true, force: true })
  for (const f of files) {
    const to = join(dest, relative(dir, f))
    mkdirSync(dirname(to), { recursive: true })
    copyFileSync(f, to)
  }
  console.log(`docs: ${files.length} files from ${label}`)
} finally {
  if (tmp) rmSync(tmp, { recursive: true, force: true })
}
