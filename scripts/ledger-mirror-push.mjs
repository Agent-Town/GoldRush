#!/usr/bin/env node
/**
 * ledger-mirror-push.mjs — LB-01's OFFSITE half, pointed at the PRIVATE archive.
 *
 * OWNER RULING 2026-09-24 item 15, verbatim: "(keep the mirror out of the public tree
 * and point the duty at the private archive)". The local half of that sentence is
 * scripts/ledger-mirror-dest.mjs (the series now lives at ~/.goldrush/ledger-backups,
 * outside any repo). This is the other half: the copy that survives the disk.
 *
 * WHAT IT REPLACES. LB-01's original last step was `git add artifacts/ledger-backups/<file>`
 * + commit + push, with the sentence "origin IS the offsite copy". Origin became PUBLIC
 * (owner, 2026-09-20: "the working repo becomes public"), which turned that same command
 * from a BACKUP into a PUBLICATION of county standings — identical syntax, identical exit
 * code, no warning anywhere (F-2661-1 / F-2667-1). The duty was parked with a ⛔ until the
 * owner ruled. He ruled; this is the ruling, executed.
 *
 * THE DESTINATION is the `archive` remote (Agent-Town/GoldRush-archive, PRIVATE — measured
 * s2667 with `gh repo view --json visibility`, against a PUBLIC origin), on the orphan
 * branch `ledger-backups`. This is deliberately the SAME SHAPE as FM-01's
 * scripts/fire-memory-mirror.mjs, which the owner authorised in item 16 for the same class
 * of problem ("mirror it into the private archive repository"): a throwaway temp clone, one
 * commit per run, never a fetch into the working repo (F-E1T-3: a depth-1 blobless probe of
 * `archive main` marked the whole working repo shallow AND partial and redded a guard on
 * main for an hour — in a temp dir it is the sanctioned form).
 *
 * THE GATE RUNS BEFORE THE PUSH, AND IT IS STRICTER HERE THAN IN THE PULL. The pull treats
 * "could not answer" (exit 2) as a warning, correctly: an unparseable download is a fetch
 * problem the next run self-heals, and the bytes are only sitting on a disk. A PUSH is a
 * ONE-WAY DOOR — undoing a pushed row needs a force-push, which is deny-listed here
 * (F-2353-2) — so ANY verdict other than a clean 0 REFUSES. "I could not read the mirror"
 * must never be the state in which this script publishes it.
 *
 * APPEND-ONLY BY CONSTRUCTION (CLAUDE.md §4.10b, the Retention Law). The tree is staged
 * with `git add --ignore-removal`, so a file missing from the local directory is never
 * deleted from the archive branch. A mirror that reached the archive stays there even if
 * the local series is wiped — which is the entire point of an offsite copy, and the exact
 * scenario F-2671-1's denominator cure was built to make visible.
 *
 * IDEMPOTENT: an unchanged tree makes no commit and no push, so the daily duty costs one
 * ls-remote and one diff on the days nothing moved.
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, cpSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveMirrorDest, destLine } from './ledger-mirror-dest.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BRANCH = 'ledger-backups';
const NAME = /^ledger-\d{4}-\d{2}-\d{2}\.db$/;
const dryRun = process.argv.includes('--dry-run');

const dest = resolveMirrorDest();
console.log(destLine(dest));

if (!existsSync(dest.dir)) {
  console.log(`⏳ NOTHING TO PUSH — ${dest.dir} does not exist. Run scripts/ledger-backup-pull.mjs first.`);
  process.exit(0);
}
const mirrors = readdirSync(dest.dir).filter(n => NAME.test(n)).sort();
const bytes = mirrors.reduce((t, n) => t + statSync(path.join(dest.dir, n)).size, 0);
console.log(`local series: ${mirrors.length} dated mirror(s), ${bytes} B` +
  (mirrors.length ? `, ${mirrors[0].slice(7, 17)} -> ${mirrors[mirrors.length - 1].slice(7, 17)}` : ''));
if (mirrors.length === 0) {
  console.log('⏳ NOTHING TO PUSH — the directory holds no dated mirrors.');
  process.exit(0);
}

// THE GATE, BEFORE THE DOOR. Bounded for F-2433-1's reason (a sync spawn of a node child
// can wedge in platform teardown and block the event loop, so no outer timer ever fires);
// a timeout yields status === null, which falls into the refusal arm below, fail-safe.
const probe = fileURLToPath(new URL('./ledger-mirror-exposure.mjs', import.meta.url));
const gate = execFileSyncSafe(process.execPath, [probe, '--dir', dest.dir, '--strict']);
process.stdout.write(gate.stdout ?? '');
if (gate.status !== 0) {
  console.error(`\n⛔ REFUSING TO PUSH — the exposure gate did not return a clean verdict (status ${gate.status}).`);
  console.error('   A push is a ONE-WAY DOOR (force-push is deny-listed, F-2353-2), so unlike the');
  console.error('   pull this refuses on "could not answer" as well as on account-class rows.');
  console.error('   Nothing was sent. The mirrors are untouched on disk.');
  process.exit(1);
}

const REMOTE = process.env.GR_ARCHIVE_REMOTE
  ?? execFileSync('git', ['remote', 'get-url', 'archive'], { cwd: ROOT, encoding: 'utf8' }).trim();
// Say WHICH remote, never the URL's credentials half; the reader must be able to see that
// this is not origin without reading the script.
console.log(`archive remote: ${REMOTE.replace(/^.*@/, '')} (branch ${BRANCH})`);
if (REMOTE.includes('Agent-Town/GoldRush.git')) {
  console.error('⛔ REFUSING — that is the PUBLIC origin, not the private archive (F-2661-1).');
  process.exit(1);
}

if (dryRun) {
  console.log(`dry-run: would mirror the ${mirrors.length} file(s) above onto ${BRANCH} at the archive remote.`);
  process.exit(0);
}

const work = mkdtempSync(path.join(tmpdir(), 'ledger-mirror-'));
const git = (args) => execFileSync('git', args, { cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
try {
  execFileSync('git', ['init', '-q', work]);
  git(['remote', 'add', 'origin', REMOTE]);
  let had = true;
  try {
    git(['fetch', '-q', '--depth', '1', 'origin', BRANCH]);
    git(['checkout', '-q', '-B', BRANCH, 'FETCH_HEAD']);
  } catch {
    had = false;
    git(['checkout', '-q', '--orphan', BRANCH]);
  }
  console.log(`archive branch: ${had ? 'exists, extending it' : 'does not exist yet, creating it'}`);

  cpSync(dest.dir, path.join(work, 'ledger-backups'), { recursive: true });
  // --ignore-removal: append-only. A file gone from the local disk is NOT removed from the
  // archive (CLAUDE.md §4.10b) — the offsite copy must outlive the local one.
  git(['add', '--ignore-removal', '--', 'ledger-backups']);
  const staged = git(['status', '--porcelain']);
  if (!staged) {
    console.log(`✅ UNCHANGED — the archive branch already holds this series. No commit, no push.`);
    process.exit(0);
  }
  const changed = staged.split('\n').filter(Boolean).length;
  const stamp = new Date().toISOString().slice(0, 16) + 'Z';
  git(['-c', 'user.name=Gold Rush factory', '-c', 'user.email=factory@agenttown.app',
    'commit', '-q', '-m', `ledger mirror ${stamp} (${changed} file(s) changed, series of ${mirrors.length})`]);
  const pushed = execFileSync('git', ['push', '--porcelain', 'origin', `${BRANCH}:${BRANCH}`],
    { cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  console.log(pushed);
  console.log(`✅ PUSHED — ${changed} file(s) to ${BRANCH} on the private archive at ${stamp}.`);
} finally {
  rmSync(work, { recursive: true, force: true });
}

// Bounded for F-2433-1's reason: a SYNC spawn of a NODE child is F-2429-1's deadlock shape
// (the child exits, wedges in platform teardown, and spawnSync blocks the event loop so no
// outer timer can fire). A timeout yields status === null, which the caller treats as a
// refusal — the correct fail-safe in front of a one-way door.
function execFileSyncSafe(cmd, args) {
  return spawnSync(cmd, args, { encoding: 'utf8', timeout: 240_000, killSignal: 'SIGKILL' });
}
