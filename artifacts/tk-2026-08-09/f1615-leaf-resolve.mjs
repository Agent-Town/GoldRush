// s1618: resolve the f1615-1 leaf and re-base the three citations my own merge rotted.
//
// RAW-TEXT edit, deliberately: a JSON parse/stringify round-trip is format-fragile here
// (the house file escapes non-ASCII as \uXXXX) and an earlier attempt in this same fire
// mangled its own escape class and started escaping HYPHENS. Raw string surgery scoped to
// the one leaf's span cannot reformat anything it does not touch. Verified by re-parsing.
//
// Each coordinate was RE-READ in the merged tree before being changed:
//   TownTavernPilot.ts:49 - the two-id exclusion is GONE (that is what f1615-1 shipped);
//                           :48-49 is now the unfiltered models map.
//   AdvanceStream.ts:30   - still sources the town set from townPrefetchUrls(), now via
//                           townUrls(saveData) which also carries the trim. Same line.
//   AdvanceStream.ts:219  - the saveData priority narrowing MOVED to :220 (the townUrls
//                           definition became two lines). RE-POINTED, not re-baselined in
//                           place: baselining :219 would freeze the claim onto an unrelated line.
import fs from 'node:fs';

const P = 'tasks/goals.json';
let src = fs.readFileSync(P, 'utf8');

// Locate the leaf's object span.
const idMark = '"id": "f1615-1-prefetch-wins-mount-laziness"';
const at = src.indexOf(idMark);
if (at < 0) throw new Error('leaf not found');
if (src.indexOf(idMark, at + 1) >= 0) throw new Error('leaf id is not unique');

// The leaf ends at its taskFile/lane/note block; bound the span generously but safely by
// finding the next leaf id or the end of this object's "note" field.
const spanEnd = src.indexOf('"taskFile": "lane-f1615-1-prefetch-wins-mount-laziness.md"', at);
if (spanEnd < 0) throw new Error('taskFile anchor not found');

const before = src.slice(0, at);
let span = src.slice(at, spanEnd);
const after = src.slice(spanEnd);

const apply = (from, to, label) => {
  if (!span.includes(from)) throw new Error('MISS: ' + label);
  const n = span.split(from).length - 1;
  if (n !== 1) throw new Error('AMBIGUOUS (' + n + '): ' + label);
  span = span.replace(from, to);
};

apply('"status": "blocked"', '"status": "merged"', 'status');

apply(
  'remove the two-id prefetch exclusion at TownTavernPilot.ts:49',
  'remove the two-id prefetch exclusion formerly at TownTavernPilot.ts:49 (ABSENT from main since f5dbb5448 - that line is now the unfiltered models map, which is exactly what shipping this looked like)',
  'title citation',
);

apply('AdvanceStream.ts:219 narrows', 'AdvanceStream.ts:220 narrows', 'blockedReason :219 -> :220');

const NOTES =
  's1618: RESOLVED, but NOT by merging this branch - its eleven-file functional surface reached main by RE-LAND inside f1617-1 at f5dbb5448 (Mistake #15 cure; the runner dispatch guard would not send the corrective into the lane holding the work). ' +
  'Absorption proved by instrument, not by eye: scripts/lane-absorbed-lines.mjs reports all eleven ABSORBED at line level (TownTavernPilot.ts 0/0; the ten specs 2-9 added lines each, every one present in main). lane/a held only regenerated artifacts/** PNGs (BOTH-MOVED, never byte-identity gated per F-1266-1), was archived at archive/lane-a-s1617-f1615-1-salvage (verified at exactly 914a7e93b) and reset; lane-a is ahead=0 behind=0 USABLE. ' +
  'The gate-side hold is lifted because its stated condition was MET: F-1617-4, the saveData red this leaf was held for, is cured, and e2e/advance-stream.spec.ts reads 10/10 both projects UNMODIFIED on the merged tree. blockClass and blockedReason are KEPT as provenance, not deleted. ' +
  'WARNING for anyone auditing this leaf: grepping the merge log for f1615-1 finds NOTHING - the work is on main under another slice hash (Mistake #16). ' +
  'Three citations here were rotted by that very merge and were re-based s1618 after RE-READING each site: TownTavernPilot.ts:49 (the cited exclusion is now absent by design), AdvanceStream.ts:30 (same line, now townUrls(saveData) carrying the trim), and AdvanceStream.ts:219 -> :220.';

// Insert mergeHash + drainNotes just before the taskFile key, matching the file's indent.
const indent = (span.match(/\n(\s+)"status":/) || [, '              '])[1];
const tail =
  '"mergeHash": "f5dbb5448ba8dfa2ea1d23f03347fe831b411a83",\n' +
  indent +
  '"drainNotes": ' +
  JSON.stringify(NOTES) +
  ',\n' +
  indent;

const out = before + span + tail + after;

// Prove we produced valid JSON and changed exactly the intended leaf.
const parsed = JSON.parse(out);
let seen = 0;
const walk = (n, cb) => {
  if (Array.isArray(n)) return n.forEach((x) => walk(x, cb));
  if (n && typeof n === 'object') {
    cb(n);
    Object.values(n).forEach((v) => walk(v, cb));
  }
};
walk(parsed, (n) => {
  if (n.id === 'f1615-1-prefetch-wins-mount-laziness') {
    seen++;
    if (n.status !== 'merged') throw new Error('status did not take');
    if (!n.mergeHash || !/^[0-9a-f]{40}$/.test(n.mergeHash)) throw new Error('bad mergeHash');
    if (!n.drainNotes) throw new Error('drainNotes did not take');
  }
});
if (seen !== 1) throw new Error('expected 1 leaf, saw ' + seen);

fs.writeFileSync(P, out);
console.log('f1615-1 leaf resolved + 3 citations re-based; JSON re-parsed clean.');
