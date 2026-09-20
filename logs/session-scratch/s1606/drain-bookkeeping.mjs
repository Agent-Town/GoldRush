// s1606 — drain bookkeeping for f1605-1-e2s3-door-delist: flip the leaf to merged with its
// 40-hex mergeHash (goal-tracker.test.mjs:80/:81 require the full hash, and a commit cannot contain
// its own hash — hence this SECOND commit, F-1384-1) and prefix the done-move as drained.
import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';

const MERGE = '88530e3efc4ff1c2f5b13c936baa5c5f913cd60a';
const P = 'tasks/goals.json';
const lines = readFileSync(P, 'utf8').split('\n');

const i = lines.findIndex((l) => l.includes('"id": "f1605-1-e2s3-door-delist"'));
if (i < 0) throw new Error('f1605-1 leaf not found');
let s = -1;
for (let k = i; k < i + 14; k++) if (/"status": "(queued|planned|running)"/.test(lines[k])) { s = k; break; }
if (s < 0) throw new Error('status line not found in the f1605-1 leaf');

const indent = lines[s].match(/^\s*/)[0];
lines[s] = lines[s].replace(/"status": "(queued|planned|running)"/, '"status": "merged"');

const drainNotes =
  'DRAINED s1606 2026-08-09, review reviews/f1605-1-e2s3-door-delist.md. Scope executed exactly as '
  + 'authored: the three E2 railcar ids leave SUPPORTED_CONTRACTS behind a comment naming the ruling, '
  + 'public/skill.md re-derived to match, and the FOUR tests whose subjects left the door are SETTLED '
  + 'rather than deleted -- three er01-e2-census arms flip to the established er01-e4 refusal pattern '
  + '(toThrow(/AP-07 supports only/) plus zero-console), and the two gr-sim Baron tests take skip: with '
  + 'NAMED causes citing F-E2S-3 and naming the socket slice as their restore path. s1605 asked the drain '
  + 'to check the skips carried named causes rather than bare ones; they do. GATED ON THE MERGED TREE IN A '
  + 'DETACHED WORKTREE (fire.md 3.0b), gate-s1606 @ 7e4e97d84, ort merge with zero conflicts, 4 files '
  + '+15/-8: tsc clean; build green 1.05s; skill-md-door-guard + gr-sim 16 tests 14 pass 0 fail 2 skipped; '
  + 'er01-e2-census 4/4 desktop-chrome AND 4/4 mobile-chrome at --workers=1; test:node-guards over the '
  + 'CURATED 79-file list 425 tests / 420 pass / 0 fail / 5 skipped rc=0 in 429s. The node-guards battery '
  + 'was run because the diff touches src/sim/ (F-1460-1) -- it is the cross-cutting sim gate a slice-local '
  + 'spec is structurally incapable of standing in for, and its green says this slice moves no sim pin. '
  + 'ONE RED WAS SELF-INFLICTED AND IS RECORDED RATHER THAN HIDDEN: a first attempt ran '
  + 'scripts/run-node-guards.mjs BARE (not the curated list) and failed node-guards-contention.test.mjs '
  + 'with "board did not stay quiet for 300ms"; re-run ALONE that same guard passes 1/1, so the contending '
  + 'board was my own bare invocation -- not live lane-a and not the slice. The curated list was then READ '
  + 'OUT OF package.json rather than hand-typed, so the battery could not silently shrink. F-E2S-3 remains '
  + 'HALF discharged: the socket half is still owed and still needs its census-stream slice specced first, '
  + 'and the retired idle-ceiling pin is NOT re-aimable (s1605 measured every bench seed: e1-baron reaches '
  + '5/8/11/5/5 and e3-canyon-works 3/3 against ceilings of 26 and 20).';

const block = [
  `${indent}"mergeHash": ${JSON.stringify(MERGE)},`,
  `${indent}"review": "reviews/f1605-1-e2s3-door-delist.md",`,
  `${indent}"drainedBy": "s1606 fire, 2026-08-09",`,
  `${indent}"drainNotes": ${JSON.stringify(drainNotes)},`,
];
lines.splice(s + 1, 0, ...block);

writeFileSync(P, lines.join('\n'));
JSON.parse(readFileSync(P, 'utf8'));
console.log('leaf f1605-1-e2s3-door-delist -> merged + mergeHash + review + drainNotes');

const from = 'tasks/done/20260809-224250-f1605-1-e2s3-door-delist.md';
const to = `tasks/done/drained-${MERGE.slice(0, 9)}-20260809-224250-f1605-1-e2s3-door-delist.md`;
if (!existsSync(from)) throw new Error(`done-move missing: ${from}`);
renameSync(from, to);
console.log(`done-move prefixed -> ${to.split('/').pop()}`);
