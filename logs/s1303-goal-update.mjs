import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/goals.json';
const doc = JSON.parse(readFileSync(P, 'utf8'));

const MERGE = 'fbc2f07a76efbf66db630f6960675aa806ac99ae';
const ID = '066-jumper-cadence-realign';

const NOTE = [
  's1303 DRAINED at fbc2f07a. Gates re-run by the drain, not inherited: tsc clean, build green,',
  'slice 6/6 (3 desktop + 3 mobile) at --workers=1 — the standing 066-walk8-engine known-red is CLOSED,',
  'green for the first time since 2026-07-12. Adjacent set DERIVED BY GREP (walk8|strideUnitsPerCycle|',
  'walkFpsPerSpeed|walkMinFps|RUN_CAST_SCALE) rather than inherited from the runner\'s list of four:',
  'eight-winds-hero, vp-02b-rotation-resolver, run-gait-stride, run-cast-scale-up, wire-e2-enemy-walk4,',
  'vp-02-sprite-animation, cast-motion-wiring all green both projects.',
  'THE SLICE IS BETTER THAN ITS MASTER: the master ordered a re-baseline to the measured numbers, and the',
  'runner instead DERIVED them from Balance.anim + RUN_CAST_SCALE at runtime, so the assertions now track',
  'the source of truth rather than freezing one fire\'s measurement — and it tightened tolerance from',
  '1-2 decimals to 5. Arithmetic verified independently at merge: slow max(3.8, 2.7*4/(3.075*1.58333)*1.58333)*2',
  '= 7.6; fast 5.4*8/3.075 = 14.0487805; both match s1302\'s numbers exactly. :238 byte-unchanged as ordered.',
  'git status --porcelain -- src assets EMPTY (zero src/, test-side only).',
  'ONE FINDING, NON-BLOCKING, NOT MINE: F-1303-1 — e2e/eight-winds-enemies.spec.ts:39 is an undocumented',
  'ORDER-DEPENDENT failure, not a load flake. See reviews/066-jumper-cadence-realign.md.'
].join(' ');

let hit = 0;
const walk = (n) => {
  if (n && typeof n === 'object') {
    if (n.id === ID) {
      n.status = 'merged';
      n.mergeHash = MERGE;
      n.note = NOTE;
      hit++;
    }
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') walk(v);
    }
  }
};
walk(doc);

if (hit !== 1) throw new Error(`expected exactly 1 leaf, matched ${hit}`);
if (!/^[0-9a-f]{40}$/.test(MERGE)) throw new Error('mergeHash must be 40-hex');

writeFileSync(P, JSON.stringify(doc, null, 2) + '\n');
console.log('leaf updated: status=merged mergeHash=' + MERGE);
