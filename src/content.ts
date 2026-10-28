export const INSTALL = {
  brew: { label: 'Homebrew', cmd: 'brew install JGoterris/tap/orbit' },
  apt: {
    label: 'Debian / Ubuntu',
    cmd: "curl -1sLf 'https://dl.cloudsmith.io/public/jgoterris/orbit/setup.deb.sh' | sudo -E bash\nsudo apt install orbit",
  },
  go: { label: 'Go', cmd: 'go install github.com/JGoterris/orbit/cmd/orbit@latest' },
  agents: { label: 'AI agents', cmd: 'npx skills add JGoterris/orbit --skill orbit' },
} as const

export type InstallTab = keyof typeof INSTALL

export const FEATURES = [
  {
    n: '01',
    c: '#22d3ee',
    t: 'Dependency-aware startup',
    d: 'Dependencies first, waiting until they are ready (healthcheck, log line or finished oneshot task); stop goes in reverse.',
  },
  {
    n: '02',
    c: '#a78bfa',
    t: 'Processes, containers, compose',
    d: 'Plus external ones you only health-check. Your docker-compose.yml is imported automatically.',
  },
  {
    n: '03',
    c: '#4ade80',
    t: 'Live graph, logs and metrics',
    d: 'Filter, search, folded stack traces, copy mode, CPU and memory with history.',
  },
  {
    n: '04',
    c: '#22d3ee',
    t: 'Runs in a daemon',
    d: 'Close the terminal and everything keeps running and supervised; reopen to resume.',
  },
  {
    n: '05',
    c: '#a78bfa',
    t: 'Healthchecks and restarts',
    d: 'Restart policies, watch mode, lifecycle hooks and desktop notifications on crashes.',
  },
  {
    n: '06',
    c: '#4ade80',
    t: 'Git across all repos',
    d: 'Multi-repo fetch / pull / push, and lazygit one key away.',
  },
]

export type DocNavItem = { section: string } | { label: string; path: string; desc: string }

export const DOCNAV: DocNavItem[] = [
  { label: 'Home', path: 'README.md', desc: 'Documentation of orbit: features, usage, keys, configuration, Git, plugins, themes, scripting and platforms.' },
  { label: 'Features', path: 'features.md', desc: 'Everything orbit does, in detail: the dependency graph, external services, logs, metrics and more.' },
  { label: 'Usage', path: 'usage.md', desc: 'Commands of the orbit CLI, and how to edit orbit.yaml while orbit runs.' },
  { label: 'Keys', path: 'keys.md', desc: 'Keyboard shortcuts of the orbit TUI.' },
  { label: 'Configuration', path: 'configuration.md', desc: 'The orbit.yaml reference: editor support, hooks, environment variables and healthchecks.' },
  { label: 'Git', path: 'git.md', desc: 'The Git view of orbit and its multi-repo actions: fetch, pull and push.' },
  { section: 'Plugins' },
  { label: 'Using plugins', path: 'plugins/index.md', desc: 'Install and use orbit plugins: new tabs, columns, badges, commands and service types.' },
  { label: 'Writing a plugin', path: 'plugins/authoring.md', desc: 'Write an orbit plugin: a folder with a manifest and the program it runs, drawn by orbit.' },
  { label: 'Manifest', path: 'plugins/manifest.md', desc: 'Reference of orbit-plugin.yaml, the manifest that says what a plugin contributes.' },
  { label: 'Widgets', path: 'plugins/widgets.md', desc: 'The widgets, tones and icons a plugin can answer with; orbit draws them with its own components.' },
  { label: 'Protocol', path: 'plugins/protocol.md', desc: 'The JSON-RPC 2.0 protocol orbit speaks with plugins that do not use the Go SDK.' },
  { label: 'Community', path: 'plugins/community.md', desc: 'Plugins for orbit published by people who use it.' },
  { section: 'More' },
  { label: 'Themes', path: 'themes.md', desc: 'Built-in orbit themes and how to write your own.' },
  { label: 'Scripting & editors', path: 'scripting.md', desc: 'The local socket of orbit and its JSON-RPC protocol, for scripts and editors.' },
  { label: 'AI agents', path: 'agents.md', desc: 'The optional orbit skill that lets coding agents like Claude Code, Codex and Cursor drive orbit.' },
  { label: 'Platforms', path: 'platforms.md', desc: 'How orbit differs on Linux, macOS and Windows.' },
  { label: 'Upgrading from 0.x', path: 'upgrading.md', desc: 'Moving from the TypeScript version (0.x) of orbit to the Go one.' },
]

export const CURATED = [
  {
    full: 'JGoterris/orbit-forge',
    desc: 'Merge requests and CI of GitHub and GitLab, with gh and glab: tabs, badges on the services and actions.',
    stage: 'alpha',
  },
]
