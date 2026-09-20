// s1466: Goal Registration Law — a drain updates its leaf's status + mergeHash in the drain commit.
// TARGETED RAW REPLACEMENT: goals.json is 1.1 MB / 5408 lines, so reserialising it would produce an
// unreviewable whole-file diff. Replace the exact leaf text, verify by re-parsing, touch nothing else.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const raw = readFileSync(P, 'utf8');

const OLD = `            {
              "id": "f1465-1-nul-delimiters",
              "title": "Raw NUL bytes make grep silently blind to src/game/Game.ts — re-encode the delimiters as \\\\u0000",
              "taskFile": "lane-f1465-1-nul-delimiters.md",
              "status": "queued"
            }`;

const NOTES =
  "Drained s1466. Lane tip 79826160. Gates on the merged tree (detached worktree gate-s1466, fire " +
  "shell, --workers=1): tsc clean, build green, test:node-guards rc=0 with nul-audit CLEAN running " +
  "as the final leaf, and the slice's only consumer e2e/perf-r2-census.rig.ts 2 passed desktop + " +
  "390px at a 240s timeout (67.8s wall). THE RIG'S 2 FAILED AT THE CONFIG'S 30s DEFAULT IS THE FIRE " +
  "SHELL'S CPU CEILING, NOT THE SLICE: a control run with src/game/Game.ts ALONE reverted to pre-cure " +
  "failed IDENTICALLY (F-1269-1 / F-1440-2). Runtime proven unmoved — both cure sites byte-identical " +
  "(6100620063, 610062). nul-audit on main post-merge: 3 raw NULs -> 0. F-1466-1 FILED AGAINST " +
  "F-1465-1'S SCOPE CLAIM (not its cure): the blindness is Claude Code's grep SHADOW passing -I " +
  "(ignore binary files) to an embedded ugrep (shell snapshot :4721-:4730), not grep itself. " +
  "/usr/bin/grep — the only grep on the box — reads the pre-cure file at 134, so Codex and the lane " +
  "shell were NEVER affected, contrary to the s1465 record. Review: reviews/f1465-1-nul-delimiters.md";

const NEW = `            {
              "id": "f1465-1-nul-delimiters",
              "title": "Raw NUL bytes make grep silently blind to src/game/Game.ts — re-encode the delimiters as \\\\u0000",
              "taskFile": "lane-f1465-1-nul-delimiters.md",
              "status": "merged",
              "mergeHash": "1a2871fd310b5bfd1f6ea085ce9d8a7a4b36272d",
              "notes": ${JSON.stringify(NOTES)}
            }`;

const count = raw.split(OLD).length - 1;
if (count !== 1) { console.error(`expected exactly 1 match, found ${count} — refusing to write`); process.exit(2); }

const out = raw.replace(OLD, NEW);
// Prove the result still parses and the leaf reads as intended BEFORE writing.
const doc = JSON.parse(out);
let found = null;
const walk = (n) => {
  if (Array.isArray(n)) return n.forEach(walk);
  if (!n || typeof n !== 'object') return;
  if (n.id === 'f1465-1-nul-delimiters') found = n;
  for (const v of Object.values(n)) walk(v);
};
walk(doc);
if (!found) { console.error('leaf vanished after replace — refusing to write'); process.exit(2); }
if (!/^[0-9a-f]{40}$/.test(found.mergeHash)) {
  // F-1300-4's exact trap: goal-tracker.test.mjs:80 asserts /^[0-9a-f]{40}$/.
  console.error('mergeHash is not 40-hex — refusing to write'); process.exit(2);
}
writeFileSync(P, out, 'utf8');
console.log('leaf updated:', JSON.stringify({ status: found.status, mergeHash: found.mergeHash }));
console.log(`bytes ${raw.length} -> ${out.length}; lines ${raw.split('\n').length} -> ${out.split('\n').length}`);
