#!/usr/bin/env node
// s1366 — salvage the CURATED-FINALS slice of motion-pilot's pose-library.
//
// WHY THIS SLICE AND NOT THE OTHER 94.81%:
// s1350 split the at-risk motion-pilot hole into RECIPE (json/mjs/md — salvaged) and
// "OUTPUT (png/mp4 — regenerable from the recipe + the generator)". That binary is the
// defect this fire found: it treats every png/mp4 as interchangeable, when 20 of them
// are CURATED PICKS rather than takes. A stochastic generator re-run does not reproduce
// a chosen frame; it produces a different one, and the choice recorded in git
// (RUN-NOTE.md's "Best-of-three selections" table) would then index takes that no
// longer exist.
//
//   3  RUN-NOTE "Deliverables" sheets   (char-hero-sheet-{idle,work,attack}8.png)
//   12 best-of-three picks              (3 sets x 4 directions — exactly the table)
//   5  four-view composites             (hero x3, prospector x2)
//   = 28.92 MB, 5.19% of the at-risk bytes
//
// NOT INCLUDED, DELIBERATELY: the 528 per-take intermediates / 527.89 MB
// (frames 335.78 / video takes 82.90 / takes123 sheets 70.75 / per-take stills 38.46).
// F-1331-4 asks the owner to rule on repo WEIGHT and that ruling is untouched.
//
// Temp index throughout: main's working tree and index are never touched (§3.0b).
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const STAGING = join(ROOT, 'worktrees/art');
const BASE = join(STAGING, 'assets/motion-pilot');
const BRANCH = 'save/art-staging-20260801';
const IDX = join(ROOT, 'logs/session-scratch/.s1366-index');
const CURATED = /char-hero-sheet-\w+8\.png$|four-view\.png$|-selected\.png$/;

const git = (a, env = {}) =>
  execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, ...env } }).trim();

const walk = (dir, out = []) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
};

// Every blob reachable from every ref — local AND remote-tracking. A file is only
// "at risk" if its bytes are in no object database at all.
const known = new Set();
for (const ref of git(['for-each-ref', '--format=%(objectname)']).split('\n')) {
  try {
    for (const line of git(['ls-tree', '-r', ref]).split('\n')) {
      const m = /^\d+ blob ([0-9a-f]{40})\t/.exec(line);
      if (m) known.add(m[1]);
    }
  } catch { /* unreadable ref — skip */ }
}

const picked = [];
for (const abs of walk(BASE)) {
  if (!CURATED.test(abs)) continue;
  if (known.has(git(['hash-object', abs]))) continue; // already stored somewhere
  picked.push({ abs, rel: abs.slice(STAGING.length + 1), size: statSync(abs).size });
}
picked.sort((a, b) => a.rel.localeCompare(b.rel));

if (picked.length === 0) {
  console.log('nothing at risk in the curated slice — already salvaged');
  process.exit(0);
}

const env = { GIT_INDEX_FILE: IDX };
const base = git(['rev-parse', BRANCH]);
git(['read-tree', base], env);
for (const f of picked) {
  const blob = git(['hash-object', '-w', f.abs]);
  git(['update-index', '--add', '--cacheinfo', `100644,${blob},${f.rel}`], env);
}

const bytes = picked.reduce((s, f) => s + f.size, 0);
const msg =
  `salvage: ${picked.length} motion-pilot CURATED FINALS into git (Retention Law)\n\n` +
  `The chosen layer of the pose library: the 3 sheets RUN-NOTE.md names as Deliverables,\n` +
  `the 12 best-of-three picks (3 sets x 4 directions — exactly its selection table), and\n` +
  `the 5 four-view composites. ${(bytes / 1048576).toFixed(2)} MB, 5.19% of the at-risk bytes.\n\n` +
  `These are NOT "regenerable output". The generator is stochastic and PAID: RUN-NOTE.md\n` +
  `records 36 Seedance 2.0 generations at 18 credits each (648 credits, balance\n` +
  `1709.99 -> 1061.99) and the task STOPPED at its 800-credit floor. Re-running cannot\n` +
  `reproduce a chosen frame, and the choice itself — recorded in git — would then index\n` +
  `takes that no longer exist. All 3 deliverable sheets hash to blobs in no object\n` +
  `database; char-hero-sheet-idle8.png has no copy on main under any name.\n\n` +
  `NOT INCLUDED, DELIBERATELY: the 528 per-take intermediates / 527.89 MB (frames,\n` +
  `video takes, takes123 contact sheets, per-take stills). F-1331-4 asks the owner to\n` +
  `rule on repo WEIGHT; that ruling is untouched and this slice barely moves it.\n\n` +
  `Measured: logs/session-scratch/s1366-curated-salvage.mjs. Filed as F-1366-1.\n` +
  `Reversible: delete this commit's ref. Veto window open for the owner.`;
const tree = git(['write-tree'], env);
const commit = git(['commit-tree', tree, '-p', base, '-m', msg]);
git(['update-ref', `refs/heads/${BRANCH}`, commit]);

console.log(`parent  ${base.slice(0, 8)}`);
console.log(`commit  ${commit.slice(0, 8)}`);
console.log(`files   ${picked.length} / ${(bytes / 1048576).toFixed(2)} MB`);
for (const f of picked) console.log(`  ${(f.size / 1048576).toFixed(2).padStart(6)} MB  ${f.rel}`);
console.log(`\nmain working tree + index:`);
console.log(git(['status', '--short']) || '  (clean)');
