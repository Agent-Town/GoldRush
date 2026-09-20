#!/usr/bin/env node
// s1350 — which ref currently PARKS the audit's already-salvaged staging bytes?
// Establishes the house convention before this fire invents one.
import { execFileSync } from 'node:child_process';
const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const git = (a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });

const probes = [
  'worktrees/art/assets/raw/plate-e3-boss-crawler.png',
  'worktrees/art/assets/contact-sheets/char-prospector-three-coat-hover8-lineup.png',
  'worktrees/art/assets/requests/codex-art-run-e2-completion.md',
];
const want = new Map(probes.map((p) => [git(['hash-object', `${ROOT}/${p}`]).trim(), p]));
const hits = new Map(probes.map((p) => [p, []]));

for (const ref of git(['for-each-ref', '--format=%(refname:short)']).trim().split('\n')) {
  let tree;
  try { tree = git(['ls-tree', '-r', ref]); } catch { continue; }
  for (const line of tree.split('\n')) {
    const m = /^\d+ blob ([0-9a-f]{40})\t(.+)$/.exec(line);
    if (m && want.has(m[1])) hits.get(want.get(m[1])).push(`${ref}  ::  ${m[2]}`);
  }
}
for (const p of probes) {
  console.log(`\n${p}`);
  const h = hits.get(p);
  console.log(h.length ? h.slice(0, 6).map((x) => '  ' + x).join('\n') : '  (on no ref)');
  if (h.length > 6) console.log(`  … +${h.length - 6} more refs`);
}
