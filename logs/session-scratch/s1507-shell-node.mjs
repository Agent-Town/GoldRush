// s1507 / F-1506-1 — which node does each shell form resolve?
// ~/.zshrc:54 runs `nvm use 23`; ~/.nvm/alias/default is `23`; the repo's .nvmrc says 26.4.0.
// zsh sources .zshrc for INTERACTIVE shells only, so `-lc` and `-ic` can differ — and the lane
// runner's shell form decides which node every lane-side gate battery runs under.
import { spawnSync } from 'node:child_process';

const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

const forms = [
  ['zsh -lc   (login, non-interactive)', ['/bin/zsh', ['-lc', 'command -v node; node --version']]],
  ['zsh -ic   (interactive)', ['/bin/zsh', ['-ic', 'command -v node; node --version']]],
  ['zsh -c    (plain)', ['/bin/zsh', ['-c', 'command -v node; node --version']]],
  ['bash -lc  (login)', ['/bin/bash', ['-lc', 'command -v node; node --version']]],
];

console.log(`this fire's node: ${process.version}   (.nvmrc target: 26.4.0)\n`);
for (const [label, [bin, args]] of forms) {
  const r = spawnSync(bin, args, { encoding: 'utf8', env, cwd: process.cwd() });
  const lines = (r.stdout || '').trim().split('\n').filter(Boolean);
  console.log(`${label.padEnd(36)} -> ${lines.join('  ') || `(rc=${r.status}) ${(r.stderr || '').trim().slice(0, 80)}`}`);
}
