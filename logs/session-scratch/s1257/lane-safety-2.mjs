#!/usr/bin/env node
// s1257 — lane-safety, second pass. The first pass (lane-safety.mjs) flagged lane-b and
// lane-d as "UNIQUE + UNPRESERVED" even though both were drained -- because it measured
// uniqueness by raw diff size, and a drain that commits its OWN regenerated screenshots
// leaves the lane's PNG bytes differing from main forever. Screenshots are never
// byte-identity gated, so they cannot make a lane unsafe. Classify by path class instead:
// only NON-artifact (code/spec/asset/doc) differences can hold undrained work.
import { execFileSync } from 'node:child_process';

const git = (...a) => execFileSync('git', a, { cwd: '/Users/robin/Claude/Projects/Gold Rush', maxBuffer: 1e9 }).toString().trim();

const isEvidence = (p) => p.startsWith('artifacts/') || p.startsWith('reviews/shots-')
  || /\.(png|jpg|jpeg|webp)$/.test(p) === false ? p.startsWith('artifacts/') || p.startsWith('reviews/shots-') : true;

for (const [slot, branch] of [['lane-a', 'lane/m3'], ['lane-b', 'lane/m4'], ['lane-c', 'lane/e2-arsenal'], ['lane-d', 'lane/perf']]) {
  const ahead = git('rev-list', `main..${branch}`).split('\n').filter(Boolean);
  console.log(`\n=== ${slot}  ${branch}  ${ahead.length} ahead ===`);
  if (!ahead.length) { console.log('  ✅ SAFE'); continue; }
  for (const sha of ahead) {
    const subject = git('log', '-1', '--format=%s', sha);
    const paths = git('show', '--pretty=format:', '--name-only', sha).split('\n').filter(Boolean);
    // Which of this commit's paths still differ between main and the commit?
    const differing = git('diff', '--name-only', 'main', sha, '--', ...paths).split('\n').filter(Boolean);
    const evidence = differing.filter((p) => p.startsWith('artifacts/') || p.startsWith('reviews/shots-'));
    const substantive = differing.filter((p) => !evidence.includes(p));
    let refs = '';
    try {
      refs = git('for-each-ref', '--contains', sha, '--format=%(refname:short)', 'refs/heads', 'refs/remotes')
        .split('\n').filter((r) => r && r !== branch).join(', ');
    } catch { /* ignore */ }
    const verdict = substantive.length === 0
      ? (evidence.length ? `✅ SAFE — only ${evidence.length} regenerated screenshot(s) differ` : '✅ SAFE — fully on main')
      : refs ? `⚠️ ${substantive.length} substantive file(s) differ, preserved on: ${refs}`
             : `⛔ ${substantive.length} SUBSTANTIVE file(s) UNPRESERVED — DRAIN FIRST`;
    console.log(`  ${sha.slice(0, 8)}  ${subject.slice(0, 70)}`);
    console.log(`      ${verdict}`);
    if (substantive.length) console.log(`      substantive: ${substantive.join(', ')}`);
  }
}
