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
