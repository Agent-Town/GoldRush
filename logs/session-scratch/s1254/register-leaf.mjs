// s1254: Goal Registration Law repair — register the leaf the owner-authored master never created,
// and flip it to merged with this drain's hash in one edit. F-1254-1.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const g = JSON.parse(readFileSync(P, 'utf8'));
const bucket = g.goals[0].subgoals[0].tasks;
if (!Array.isArray(bucket)) throw new Error('expected goals[0].subgoals[0].tasks array');
if (bucket.some((t) => t.taskFile === 'lane-guide-beat-priority.md')) throw new Error('leaf already exists');

const anchor = bucket.findIndex((t) => t.id === 'e1-trail-guide-plain-boot-proof');
if (anchor < 0) throw new Error('anchor leaf not found — refusing to guess placement');

bucket.splice(anchor + 1, 0, {
  id: 'e1-guide-beat-priority',
  title:
    'Teaching holds the floor — first-run Trail Guide beats hold the hud-agent-feed slot for a 4s dwell and later beats queue FIFO, so a lesson is never overwritten before it is read.',
  taskFile: 'lane-guide-beat-priority.md',
  status: 'merged',
  lane: 'lane-d',
  authoredBy: 'owner (4ee9c12f 2026-07-30) — "product: guide beats hold the floor (from F-1205-5)"',
  spec: 'tasks/BACKLOG.md F-1205-5 (the measured mechanism); master WHY quotes it verbatim',
  registeredBy:
    's1254 fire — F-1254-1 repair: the master shipped with NO goal leaf, so drain-block-check returned UNKNOWN rather than a clearance. Registered and flipped in the same commit as the drain bookkeeping.',
  mergeHash: '6f343a6e',
  drainedBy: 's1254 fire 2026-07-30',
  review: 'reviews/guide-beat-priority.md',
  note_s1254:
    'F-1254-2: the master\'s stated mechanism (non-guide barks overtake guide beats) was already false at HEAD — Game.ts:5435 prepends the guide line to receiptFeed[0]. The shipped fix addresses guide-over-guide overwrite, which is the real defect. The spec\'s bark-storm arm (spec:76) is vacuous — measured green with AND without the slice; only spec:86 discriminates. Do not cite spec:76 as proof of bark suppression.',
});

writeFileSync(P, JSON.stringify(g, null, 2) + '\n');
console.log('registered e1-guide-beat-priority at tasks[' + (anchor + 1) + ']; leaves now', bucket.length);
