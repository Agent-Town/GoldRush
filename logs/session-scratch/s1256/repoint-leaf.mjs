#!/usr/bin/env node
// s1256 — REPOINT the parked trail-guide leaf to the attempt-4 master. Not a new leaf: registering
// a second one would leave the original reading `stopped` forever while the real work drained
// against it (the Mistake #5 ghost-line shape), which is precisely what s1203/s1204/s1205 each
// avoided on this same leaf.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../../..');
const path = resolve(repo, 'tasks/goals.json');
const json = JSON.parse(readFileSync(path, 'utf8'));

let hit = null;
const walk = (node) => {
  for (const kid of node.subgoals ?? node.tasks ?? []) {
    if (kid.id === 'e1-trail-guide-plain-boot-proof') hit = kid;
    walk(kid);
  }
};
for (const goal of json.goals) walk(goal);
if (!hit) { console.error('FATAL: leaf e1-trail-guide-plain-boot-proof not found'); process.exit(1); }

console.log(`before: status=${hit.status} taskFile=${hit.taskFile}`);
hit.status = 'queued';
hit.taskFile = 'lane-b-trail-guide-plain-boot-seam-approach.md';
hit.lane = 'lane-b';
hit.note_s1256 = [
  'REPOINTED (not duplicated) to ATTEMPT 4, whose premise is measured rather than argued. s1206 parked this leaf',
  'with an explicit precondition — "DO NOT AUTHOR A FOURTH CURE BEFORE F-1206-1 SEPARATES THEM" — and s1256 ran that',
  'discrimination against today\'s main. BOTH of s1206\'s candidate readings are refuted. The recorder is NOT deaf:',
  'at failure it held THREE entries and feedLive matched its last exactly, feedNodePresent true. And the feed being',
  'empty of the beat is real but not causal: channeling false, gold 0, distToNearestSeam 1.89-2.02 — the beat never',
  'fired because the hero never worked the seam. Two of the four canonical-arm failures (:200 economy.gold, :219',
  'harvest.channeling) never touch hud-agent-feed at all, so no feed-overtaking premise can explain them.',
  'ROOT CAUSE: the parked spec\'s own moveHeroTo never once landed within its stated 0.12 tolerance — 13/13 observed',
  'moves missed by 0.24-2.15, on PASSING runs as well as failing ones (fails ~1.78-2.15, passes ~0.95-1.47). The proof',
  'has been passing by luck. Iterating the alignment was prototyped and REFUTED (3/4, 12-pass cap, still 1.2-2.15 out):',
  'a seam centre is unoccupiable, not merely overshot. The cure already exists hardened in-repo at',
  'e2e/release-build.spec.ts:311 — in-page press/release with a braking lead — and that suite drives to the SAME seam',
  '(-9, 6.7) at :306 and asserts channeling at :307 while staying green, so the product is fine and the helper was the',
  'defect. A stop-when-harvesting variant measured 4/4 green at the canonical arm and 4/4 again on replication (8/8).',
  'TRAP FOR THE DRAIN: --workers=1 gives a FALSE GREEN here (2/2) and did so through all three prior attempts; the',
  'gate is the canonical arm (default workers, both projects, --repeat-each=2), which measured 4/4 RED on main today.',
  'Evidence: logs/session-scratch/s1256/measure-transcript.txt plus the five arm drivers beside it.',
].join(' ');
hit.authoredBy = 's1256 fire (FIRE-AUTHORED, attended review welcome) — authored on this fire\'s own measurements, after discharging the s1206 stopNote\'s stated precondition';
hit.priorStopNote_s1206 = hit.stopNote;
delete hit.stopNote;

writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
console.log(`after:  status=${hit.status} taskFile=${hit.taskFile} lane=${hit.lane}`);
