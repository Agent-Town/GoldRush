#!/usr/bin/env node
// s1350 — salvage the RECIPE slice of motion-pilot (json logs / mjs generator / md run
// notes): 0.152 MB, 133 files, the class the Retention Law names verbatim.
//
// This deliberately does NOT touch the 569 MB of png/mp4 output that F-1331-4 asks the
// owner to rule on — that ruling is about repo WEIGHT, and this slice has none. The row
// stays open, the pixels stay where they are, and this is reversible with one word.
//
// Temp index again: main's working tree and index are never touched.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const STAGING = join(ROOT, 'worktrees/art');
const BASE = join(STAGING, 'assets/motion-pilot');
const BRANCH = 'save/art-staging-20260801';
const IDX = join(ROOT, 'logs/session-scratch/.s1350-index2');
const RECIPE = new Set(['.json', '.mjs', '.md', '.txt', '.yml', '.yaml']);

const git = (a, env = {}) =>
  execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, ...env } }).trim();

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
};

const known = new Set();
for (const ref of git(['for-each-ref', '--format=%(objectname)']).split('\n')) {
  try {
    for (const line of git(['ls-tree', '-r', ref]).split('\n')) {
      const m = /^\d+ blob ([0-9a-f]{40})\t/.exec(line);
      if (m) known.add(m[1]);
    }
  } catch { /* skip */ }
}

const picked = [];
for (const abs of walk(BASE)) {
  if (!RECIPE.has(extname(abs))) continue;
  if (known.has(git(['hash-object', abs]))) continue; // already stored
  picked.push({ abs, rel: abs.slice(STAGING.length + 1), size: statSync(abs).size });
}
picked.sort((a, b) => a.rel.localeCompare(b.rel));

const env = { GIT_INDEX_FILE: IDX };
const base = git(['rev-parse', BRANCH]);
git(['read-tree', base], env);
for (const f of picked) {
  const blob = git(['hash-object', '-w', f.abs]);
  const mode = extname(f.abs) === '.mjs' ? '100755' : '100644';
  git(['update-index', '--add', '--cacheinfo', `${mode},${blob},${f.rel}`], env);
}

const bytes = picked.reduce((s, f) => s + f.size, 0);
const msg =
  `salvage: ${picked.length} motion-pilot RECIPE files into git (Retention Law)\n\n` +
  `The generation logs, run notes and generator script inside worktrees/art/assets/\n` +
  `motion-pilot: ${(bytes / 1048576).toFixed(3)} MB. These cannot be regenerated from anything on disk —\n` +
  `they ARE the record of how the pose library was made (per-take API logs, the\n` +
  `800-credit-floor stop, the identity pins), and they are the class CLAUDE.md §4.10b\n` +
  `names verbatim: "run logs, fire logs, reports, evidence".\n\n` +
  `NOT INCLUDED, DELIBERATELY: the 638 at-risk png/mp4 files / 569.24 MB. F-1331-4 asks\n` +
  `the owner to rule on those and that ruling is untouched — it is a question about repo\n` +
  `weight, and this slice is 0.027% of the bytes. The row stays open.\n\n` +
  `Measured: 133 of 771 at-risk motion-pilot files are recipe (17.3% of the files,\n` +
  `0.027% of the bytes) — logs/session-scratch/s1350-recipe.mjs.\n` +
  `Reversible: delete this commit's ref. Veto window open for the owner.`;
const tree = git(['write-tree'], env);
const commit = git(['commit-tree', tree, '-p', base, '-m', msg]);
git(['update-ref', `refs/heads/${BRANCH}`, commit]);

console.log(`parent  ${base.slice(0, 8)}`);
console.log(`commit  ${commit.slice(0, 8)}`);
console.log(`files   ${picked.length} / ${(bytes / 1048576).toFixed(3)} MB`);
console.log(`\nmain working tree + index:`);
console.log(git(['status', '--short']) || '  (clean)');
