// Copies the orbit docs (markdown only) into src/docs so they ship with the site.
//
// Source, in order: $DOCS_DIR, a sibling ../orbit/docs checkout (not on CI), or a shallow
// clone of the repository on GitHub.
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dest = join(root, 'src', 'docs')
const repoUrl = 'https://github.com/JGoterris/orbit.git'

// docs/demo is a separate project with its own git history, not documentation
const skip = new Set(['demo'])

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return skip.has(e.name) ? [] : markdownFiles(join(dir, e.name))
    return e.name.endsWith('.md') ? [join(dir, e.name)] : []
  })
}

function sourceDir() {
  if (process.env.DOCS_DIR) return { dir: resolve(process.env.DOCS_DIR), label: 'DOCS_DIR' }

  const sibling = resolve(root, '..', 'orbit', 'docs')
  if (!process.env.CI && existsSync(sibling)) return { dir: sibling, label: 'local checkout' }

  const tmp = mkdtempSync(join(tmpdir(), 'orbit-docs-'))
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', repoUrl, tmp], { stdio: 'inherit' })
  execFileSync('git', ['-C', tmp, 'sparse-checkout', 'set', 'docs'], { stdio: 'inherit' })
  return { dir: join(tmp, 'docs'), label: 'github.com/JGoterris/orbit', tmp }
}

const { dir, label, tmp } = sourceDir() as { dir: string; label: string; tmp?: string }

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
