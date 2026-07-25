#!/usr/bin/env node
/**
 * salvage-art-staging — put every untracked ART-slot staging file into git,
 * on a save/* branch, WITHOUT touching main or main's working tree.
 *
 * WHY (Retention Law, CLAUDE.md §4.10b, owner verbatim 2026-07-25: "We have to
 * stop the pruning, our history is our strength"): worktrees/art/ is a plain
 * directory, not a git worktree (verified s1045) — anything there that main
 * does not track exists in NO object database. Mistake #11 with a live answer.
 *
 * Safety properties, by construction:
 *   - never checks out, resets, or stages anything in the main worktree
 *     (all work happens in a throwaway index via GIT_INDEX_FILE)
 *   - refuses to run if the target ref already exists (no clobber)
 *   - creates one new branch ref; main is untouched and stays at its tip
 *
 * Landing the branch on main stays a separate, deliberate decision — this only
 * ends the disk exposure. Usage: node scripts/salvage-art-staging.mjs <branch> [--dry-run]
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('..', import.meta.url)).replace(/\/$/, '');
const STAGING = join(REPO, 'worktrees/art/assets/raw');
const BRANCH = process.argv[2];
const DRY = process.argv.includes('--dry-run');

if (!BRANCH || !BRANCH.startsWith('save/')) {
  console.error('usage: salvage-art-staging.mjs save/<name> [--dry-run]');
  process.exit(2);
}

const INDEX = join(tmpdir(), `gr-salvage-${BRANCH.replace(/\W/g, '-')}.idx`);
const git = (args, env) =>
  execFileSync('git', ['-C', REPO, ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 26,
    env: { ...process.env, ...env },
  }).trim();
const idxGit = (args) => git(args, { GIT_INDEX_FILE: INDEX });

// --- no-clobber guard -------------------------------------------------------
try {
  git(['show-ref', '--verify', '--quiet', `refs/heads/${BRANCH}`]);
  console.error(`REFUSING: ${BRANCH} already exists. Pick another name.`);
  process.exit(1);
} catch {
  /* absent — good */
}

// --- what is untracked ------------------------------------------------------
const tracked = new Set(
  git(['ls-tree', '-r', '--name-only', 'main', '--', 'assets/raw/'])
    .split('\n')
    .filter(Boolean)
    .map((p) => p.replace(/^assets\/raw\//, '')),
);

const untracked = readdirSync(STAGING)
  .filter((n) => !n.startsWith('.') && !tracked.has(n))
  .sort();

if (!untracked.length) {
  console.log('nothing untracked in the art staging dir — no salvage needed');
  process.exit(0);
}

let bytes = 0;
for (const n of untracked) bytes += statSync(join(STAGING, n)).size;
console.log(`${untracked.length} untracked file(s), ${(bytes / 1024 / 1024).toFixed(1)} MB:`);
for (const n of untracked) console.log(`  ${n}`);
if (DRY) {
  console.log('\n--dry-run: no ref written');
  process.exit(0);
}

// --- build the commit in a throwaway index ---------------------------------
if (existsSync(INDEX)) rmSync(INDEX);
const base = git(['rev-parse', 'main']);
idxGit(['read-tree', base]);

for (const name of untracked) {
  const sha = git(['hash-object', '-w', '--', join(STAGING, name)]);
  idxGit(['update-index', '--add', '--cacheinfo', `100644,${sha},assets/raw/${name}`]);
}

const tree = idxGit(['write-tree']);
const msg = [
  `salvage: ${untracked.length} untracked ART-slot raws into git (Retention Law)`,
  '',
  'These files existed in NO object database: worktrees/art/ is a plain staging',
  'directory, not a git worktree, and is ignored by main. This commit ends that',
  'disk exposure and PREJUDGES NOTHING — none of these have passed art QA, and',
  'whether any of them belong on main is still an owner decision.',
  '',
  ...untracked.map((n) => `  ${n}`),
  '',
  `base: ${base} (main at salvage time) — main itself is untouched`,
].join('\n');

const commit = git(['commit-tree', tree, '-p', base, '-m', msg]);
git(['update-ref', `refs/heads/${BRANCH}`, commit]);
rmSync(INDEX, { force: true });

console.log(`\nwrote ${BRANCH} = ${commit}`);
console.log(`main still at ${git(['rev-parse', 'main'])} (unchanged)`);
