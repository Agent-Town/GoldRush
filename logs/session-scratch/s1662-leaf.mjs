// s1662 drain bookkeeping: flip the f1660-1 leaf planned -> merged.
// SPLICE, never re-serialize (JSON.stringify would rewrite ~9k lines).
// Usage: node s1662-leaf.mjs <40-hex-merge-hash>
import { readFileSync, writeFileSync } from 'node:fs';

const hash = process.argv[2];
if (!/^[0-9a-f]{40}$/.test(hash || '')) throw new Error('need a full 40-hex merge hash');

const P = 'tasks/goals.json';
const lines = readFileSync(P, 'utf8').split('\n');

const idIdx = lines.findIndex((l) => l.includes('"id": "f1660-1-door-readmission-repair"'));
if (idIdx === -1) throw new Error('leaf not found');
const statusIdx = lines.findIndex((l, i) => i > idIdx && i < idIdx + 8 && l.trim() === '"status": "planned",');
if (statusIdx === -1) throw new Error('status line not found in the leaf window');

const indent = lines[statusIdx].match(/^\s*/)[0];
const drainNotes = [
  'DRAINED s1662 at ' + hash.slice(0, 9) + '. Gated in detached worktree gate-s1662b (ort, zero conflicts, 8 files +1149/-1075).',
  'The control that makes the evidence readable: git diff --name-only lane/b <merged> returns exactly 11 paths, ALL bookkeeping',
  '(STATUS.md, tasks/BACKLOG.md, tasks/goals.json, the master, 7 logs/session-scratch/*) - zero source/test/script/asset/config bytes,',
  'because main moved only in s1660/s1661 ledger work. tsc clean; build green (8.76s, 2186 modules); er01-e2-census +',
  'ap16-4-contract-admission desktop 5/5 (2.0m) and mobile-390px 5/5 (1.6m) at --workers=1 against a scratch dev server on 5234;',
  'skillmd-guard 5/5 untouched; door-admission-ratchet 1/1 AND re-proven to bite by manufacturing the defect here rather than',
  'inheriting the runner transcript (delete the e2-incline entry -> 1 fail; byte-identical restore sha256[0:16] dfcdd833e3ce6363 -> 1 pass);',
  'gr-sim.test.mjs green. DIRECT DOOR PROBE: e2-hill-mine modeless -> rc=1 AP-07 throw (derived door 19 ids, no railcar);',
  '--mode=escort -> rc=0 emitting goldrush.view.v1 with the Railhead Escort objective. Both directions of ap-16-same-game-law.md:33 hold.',
  'F-1662-1 CURED IN THE DRAIN: the door change left scripts/null-floor-anchors.test.mjs red because assets/contracts/null-floors.json',
  'still carried idle rows for the three de-listed railcars, and the runner was firewalled out of assets/contracts/**. The firewall was',
  'right about its subject (contract BUNDLES are data) and wrong about its scope: null-floors.json is a GENERATED artifact whose key set',
  'scripts/null-floor-anchors.mjs derives from the door, so removing the rows FOLLOWS admission rather than changing it. Cured by surgical',
  'splice (312 -> 258 lines, 12 -> 9 contracts), not regeneration, because a full regen also rewrites eraStamp (= git merge-base HEAD main,',
  'F-1653-3). RED before / GREEN after. F-1662-2 NON-BLOCKING: same-game-audit.mjs:379 hardcodes "leaving five cited exemptions" while the',
  'table now emits eight - accurate on main today, false only after this merge; not hand-tuned in the drain because the sentence is',
  'genuinely ambiguous (five of that population of fifteen, still true, vs five in total, now false) and the generator must decide.',
  'F-1662-3 NON-BLOCKING: the three exemption reasons are byte-identical asserting all three "reached the wave ceiling", but the pinned',
  'null-floor evidence this drain deletes shows e2-hill-mine and e2-trestle at 18 waves/540000ms (the cap) while e2-incline terminated at',
  'wave 2 in ~80s on both seeds. Policy is unaffected - the citation is F-E2S-3, the owner ruling naming all three BY NAME - but the reason',
  'prose over-generalises, and the error is the MASTER’s (it ordered the uniform phrasing, inheriting s1605’s e2-hill-mine proof), not the runner’s.',
  'NOT RUN, as a measured refusal: full test:node-guards, because lane-a was live all fire on f1643-2, whose deliverable is a suite-red',
  'flake-rate snapshot that self-describes its harness (owner-throttled to --workers=3 nice -n 19), with load average measured 231 -> 287.',
  'Ran scripts/gr-sim.test.mjs alone instead - the specific F-1460-1 pin carrier. The residual battery is named as an owed act in the s1662 handoff.',
].join(' ');

const esc = (s) => JSON.stringify(s);
lines.splice(statusIdx, 1, [
  indent + '"status": "merged",',
  indent + '"mergeHash": ' + esc(hash) + ',',
  indent + '"drainNotes": ' + esc(drainNotes) + ',',
].join('\n'));

const text = lines.join('\n');
JSON.parse(text); // refuse to write invalid JSON
writeFileSync(P, text);
console.log('leaf flipped to merged at', hash.slice(0, 9), '- goals.json still parses');
