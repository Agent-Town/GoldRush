#!/usr/bin/env node
// s1257 — LANE-SAFETY LAW: a lane may only be refilled if every commit its branch
// holds ahead of main is content-safe (already on main, or preserved on a save/archive ref).
// Refilling resets --hard, which DESTROYS unmerged output. Verify, never inherit.
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { cwd: '/Users/robin/Claude/Projects/Gold Rush', maxBuffer: 1e9 }).toString().trim();

const LANES = [
  ['lane-a', 'lane/m3'],
  ['lane-b', 'lane/m4'],
  ['lane-c', 'lane/e2-arsenal'],
  ['lane-d', 'lane/perf'],
];

for (const [slot, branch] of LANES) {
  const ahead = git('rev-list', `main..${branch}`).split('\n').filter(Boolean);
  console.log(`\n=== ${slot}  ${branch}  ${ahead.length} ahead ===`);
  if (!ahead.length) { console.log('  ✅ SAFE — nothing ahead of main'); continue; }
  for (const sha of ahead) {
    const subject = git('log', '-1', '--format=%s', sha);
    // Does this commit change anything relative to main? An empty two-dot diff of its
    // own touched paths means the content is already on main (a phantom / tip-graft).
    const paths = git('show', '--pretty=format:', '--name-only', sha).split('\n').filter(Boolean);
    let unique = '';
    try { unique = git('diff', 'main', sha, '--', ...paths); } catch { unique = 'DIFF-FAILED'; }
    // Is the commit preserved anywhere outside this lane branch?
    let refs = '';
    try {
      refs = git('for-each-ref', '--contains', sha, '--format=%(refname:short)',
        'refs/heads', 'refs/remotes').split('\n').filter((r) => r && r !== branch).join(', ');
    } catch { refs = '(unknown)'; }
    const verdict = unique.length === 0 ? '✅ content already on main (phantom)'
      : refs ? `⚠️ UNIQUE content, but preserved on: ${refs}`
      : '⛔ UNIQUE + UNPRESERVED — DO NOT REFILL, DRAIN FIRST';
    console.log(`  ${sha.slice(0, 8)}  ${subject.slice(0, 72)}`);
    console.log(`      diff-vs-main ${unique.length} B  → ${verdict}`);
  }
}
