// s1144: rename the lane-b done-move to a lawful-STOP name + flip its goal leaf.
import { renameSync, readFileSync, writeFileSync, existsSync } from 'node:fs';

const from = 'tasks/done/20260727-234321-lane-vp-02b-jumper-slot-red.md';
const to = 'tasks/done/stopped-lawful-s1144-scope1-gate-fired-20260727-234321-lane-vp-02b-jumper-slot-red.md';
if (existsSync(from)) {
  renameSync(from, to);
  console.log('renamed done-move -> ' + to);
} else {
  console.log('done-move already renamed (or absent): ' + from);
}

const path = 'tasks/goals.json';
const goals = JSON.parse(readFileSync(path, 'utf8'));
let hits = 0;
const walk = (node) => {
  if (Array.isArray(node)) return node.forEach(walk);
  if (!node || typeof node !== 'object') return;
  if (node.id === 'lane-vp-02b-jumper-slot-red') {
    node.status = 'stopped-lawful';
    node.drainNotes =
      'STOP, not a merge: the master scope-1 measure-first gate fired and the runner correctly refused to invent a cure (zero diff, main..lane/m4 empty). ' +
      'Verified at source s1144: no spawn surface can EVER mount char.claim_jumper -- 82543f27 (2026-07-12, runner(lane-d) wire-e1-bandit-variants) rewired the enemy animators in src/entities/pools.ts:337/:355 to assetSlots.charBanditBase/charBanditThief and updated ZERO of the seven e2e specs naming the old slot. ' +
      'spriteAnimationDiagnostics() (SpriteAnimator.ts:208) is keyed per constructed animator, so the wait was unfalsifiable-by-construction. No art/gameplay regression: char.bandit_base has walk8 true and its processed PNGs are on disk. ' +
      'F-1144-1 (seven-spec stranded class, fingerprinted piecemeal for 15 days) + F-1144-2 (TWO stale classes; the hero walk4->walk8 class fails FIRST in 066:81, task-042:59, task-031:202 and masks three jumper asserts; hero.frameCount measured Expected 4 / Received 8). ' +
      'Evidence: reviews/vp-02b-jumper-slot-red-stop.md. Successor: lane-vp-02b-jumper-slot-repair. NO mergeHash -- unfinished work carries none.';
    hits += 1;
  }
  for (const v of Object.values(node)) if (v && typeof v === 'object') walk(v);
};
walk(goals);
if (hits !== 1) throw new Error('expected exactly 1 goal leaf, found ' + hits);
writeFileSync(path, JSON.stringify(goals, null, 2) + '\n');
console.log('goal leaf flipped -> stopped-lawful (' + hits + ' leaf)');
