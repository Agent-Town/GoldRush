#!/usr/bin/env node
// s1350 — salvage the NON-motion-pilot slice of the F-1331-4 hole (Retention Law).
// Follows the s1045 precedent exactly: a `save/art-staging-<date>` branch off main,
// staging-relative paths, one commit, then pushed.
//
// Built with plumbing against a TEMP INDEX: main's working tree and main's index are
// never touched, so this cannot collide with a concurrent writer (CLAUDE.md §3.0b).
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/Users/robin/Claude/Projects/Gold Rush';
const STAGING = join(ROOT, 'worktrees/art');
const BRANCH = 'save/art-staging-20260801';
const IDX = join(ROOT, 'logs/session-scratch/.s1350-index');

const git = (a, env = {}) =>
  execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, env: { ...process.env, ...env } }).trim();

// the 13 measured at-risk paths, staging-relative (see s1350-residue.mjs output)
const FILES = [
  'assets/contact-sheets/char-prospector-skins-detail-crops-2x.png',
  'assets/contact-sheets/char-hero-claimday-detail-crops-2x.png',
  'assets/contact-sheets/char-prospector-skins-sheets-25pct.png',
  'assets/contact-sheets/stream-overlay-pack-preview.png',
  'assets/contact-sheets/char-hero-ages-sheets-25pct.png',
  'assets/contact-sheets/char-hero-four-ages-lineup.png',
  'assets/contact-sheets/char-tailor-release-lineup.png',
  'assets/contact-sheets/char-hero-claimday-sheets-25pct.png',
  'assets/contact-sheets/char-prospector-three-coat-lineup.png',
  'assets/contact-sheets/e2-rail-elements-preview.png',
  'assets/contact-sheets/e2-icons-preview.png',
  'assets/contact-sheets/_gilded-r3c0-debug.png',
  'assets/requests/codex-art-run-stream-overlay-pack.md',
];

const env = { GIT_INDEX_FILE: IDX };
const base = git(['rev-parse', 'main']);
git(['read-tree', base], env);

let bytes = 0;
for (const rel of FILES) {
  const abs = join(STAGING, rel);
  bytes += statSync(abs).size;
  const blob = git(['hash-object', '-w', abs]);
  git(['update-index', '--add', '--cacheinfo', `100644,${blob},${rel}`], env);
}

const tree = git(['write-tree'], env);
const msg =
  `salvage: 13 untracked ART-slot contact sheets + run note into git (Retention Law)\n\n` +
  `The non-motion-pilot slice of the F-1331-4 at-risk hole: 12 contact sheets +\n` +
  `1 codex art run note, 9.51 MB, oldest unstored since 2026-07-12 (20 days).\n` +
  `These were never covered by the owner ruling F-1331-4 asks for — that ruling is\n` +
  `about worktrees/art/assets/motion-pilot (735 files / 556.96 MB), which stays\n` +
  `untouched and still on the owner's desk.\n\n` +
  `worktrees/art/ is not a git worktree, so these bytes were in no object database\n` +
  `on this disk or any remote-tracking ref. Measured twice: art-staging-audit.mjs\n` +
  `area breakdown and logs/session-scratch/s1350-residue.mjs (independent blob-hash\n` +
  `sweep over 412 refs / 22,886 known blobs).\n\n` +
  `Precedent: s1045 f23c7516 "salvage: 10 untracked ART-slot raws into git".\n` +
  `Built against a temp index; main's working tree and index untouched.`;
const commit = git(['commit-tree', tree, '-p', base, '-m', msg]);
git(['update-ref', `refs/heads/${BRANCH}`, commit]);

console.log(`base main   ${base.slice(0, 8)}`);
console.log(`branch      ${BRANCH}`);
console.log(`commit      ${commit.slice(0, 8)}`);
console.log(`files       ${FILES.length} / ${(bytes / 1048576).toFixed(2)} MB`);
console.log(`\nmain untouched? working tree + index:`);
console.log(git(['status', '--short']) || '  (clean)');
