#!/usr/bin/env node
// TK-01 classifier for the 2026-08-04 ticker digest (compiled s1457, 2026-08-05).
//
// Mistake #16 guard: commits are classified by the PATHS THEY TOUCHED on main's
// first-parent walk, never by their commit MESSAGES — an announcement matches every
// grep for the thing it announces, so message-grepping cannot tell intent from result.
//
// Re-derive with:  node artifacts/tk-2026-08-04/classify.mjs
import { execSync } from 'node:child_process';

const sh = (c) => execSync(c, { encoding: 'utf8', maxBuffer: 5e8 });
const RANGE = '--since=2026-08-04T00:00:00+07:00 --until=2026-08-05T00:00:00+07:00';

const firstParent = sh(`git log --first-parent ${RANGE} --format=%H main`).trim().split('\n').filter(Boolean);
const merges = sh(`git log --first-parent ${RANGE} --merges --format=%H main`).trim().split('\n').filter(Boolean);

const buckets = { player: [], tools: [], bookkeeping: [] };
for (const hash of firstParent) {
  const files = sh(`git show --pretty=format: --name-only ${hash}`).trim().split('\n').filter(Boolean);
  const subject = sh(`git log -1 --format=%s ${hash}`).trim();
  const row = { hash, subject, fileCount: files.length };
  // Player-visible wins over tools when a commit touches both: what the family can
  // see outranks what the factory can see.
  if (files.some((f) => /^(src|public|assets)\//.test(f))) buckets.player.push(row);
  else if (files.some((f) => /^(scripts|e2e)\//.test(f))) buckets.tools.push(row);
  else buckets.bookkeeping.push(row);
}

console.log(`first-parent commits: ${firstParent.length}  (merge commits: ${merges.length})`);
console.log(`player-visible: ${buckets.player.length}  tools/nets: ${buckets.tools.length}  bookkeeping: ${buckets.bookkeeping.length}`);
for (const row of buckets.player) {
  console.log(`  ${row.hash.slice(0, 8)}  (${row.fileCount} files)  ${row.subject}`);
}
