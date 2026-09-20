#!/usr/bin/env node
// s1256 — LANE-SAFETY LAW check, verified rather than inherited: is lane-b safe to refill?
// Safe requires: worktree clean, and every commit on its branch already drained (a lane pre-flight
// resets --hard, which destroys unmerged predecessor output — the w1-03 / polish-02 casualty).
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const lane = process.argv[2] ?? 'lane-b';
const wt = resolve(repo, 'worktrees', lane);

const git = (cwd, ...args) => spawnSync('git', args, { cwd, encoding: 'utf8' }).stdout.trim();

const branch = git(wt, 'rev-parse', '--abbrev-ref', 'HEAD');
const dirt = git(wt, 'status', '--porcelain');
const ahead = git(repo, 'log', '--oneline', `main..${branch}`).split('\n').filter(Boolean);
const done = readdirSync(resolve(repo, 'tasks/done'));

console.log(`lane=${lane} worktree=${wt}`);
console.log(`branch=${branch} head=${git(wt, 'rev-parse', '--short', 'HEAD')}`);
console.log(`worktree dirt: ${dirt ? '\n' + dirt : '(clean)'}`);
console.log(`commits ahead of main: ${ahead.length}`);
for (const line of ahead) {
  const m = /runner\([^)]*\):\s*(.+?)\.md/.exec(line);
  const name = m ? m[1] : null;
  const hit = name ? done.filter((f) => f.includes(name) && /^(drained|shipped)-/.test(f)) : [];
  console.log(`  ${line}\n      task=${name ?? '(unparsed)'} → ${hit.length ? 'DRAINED: ' + hit[0] : '⚠️ NO drained/shipped done-move found'}`);
}
const unsafe = Boolean(dirt) || ahead.some((line) => {
  const m = /runner\([^)]*\):\s*(.+?)\.md/.exec(line);
  return !m || !done.some((f) => f.includes(m[1]) && /^(drained|shipped)-/.test(f));
});
console.log(unsafe ? '\nVERDICT: ⛔ NOT SAFE TO REFILL' : '\nVERDICT: ✅ SAFE TO REFILL (clean worktree, every branch commit drained)');
process.exit(unsafe ? 1 : 0);
