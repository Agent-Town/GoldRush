import { spawnSync } from 'node:child_process';

const keys = [
  ['configured workers **', 'scripts/suite-red-inventory.mjs'],
  ['workers: isFireShell ? 1 : undefined,', 'playwright.config.ts'],
  ['reducer reports configured and actual workers distinctly', 'scripts/suite-red-inventory.test.mjs'],
];

for (const root of ['.', 'worktrees/lane-b']) {
  console.log(`--- ${root} ---`);
  for (const [key, file] of keys) {
    const r = spawnSync('grep', ['-c', '-F', key, `${root}/${file}`], { encoding: 'utf8' });
    const n = (r.stdout || '').trim();
    console.log(`  ${n.padStart(3)}  ${file}   <- "${key.slice(0, 46)}"`);
  }
  const g = spawnSync('grep', ['-n', '-F', 'workers: isFireShell ? 1 : undefined,', `${root}/playwright.config.ts`], { encoding: 'utf8' });
  console.log('  line-50 bar:', (g.stdout || '').trim().split(':')[0]);
  const t = spawnSync('grep', ['-n', '"type"', `${root}/package.json`], { encoding: 'utf8' });
  console.log('  module system:', (t.stdout || '').trim().split('\n')[0]);
}
