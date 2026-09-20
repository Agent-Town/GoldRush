#!/usr/bin/env node
// s1257 — Goal Registration Law for the e1 trail-guide plain-boot leaf (attempt 4 shipped).
// This leaf was repointed stopped->queued by s1256; it now goes shipped with its merge hash.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const p = resolve(repo, 'tasks/goals.json');
const raw = readFileSync(p, 'utf8');
const data = JSON.parse(raw);

const MERGE = '74ef8c66d2065fa59ccaab8abfb2c6cf2b4e02b7';
let hit = null;
(function walk(n) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) { n.forEach(walk); return; }
  if (n.id === 'e1-trail-guide-plain-boot-proof') hit = n;
  Object.values(n).forEach(walk);
})(data);
if (!hit) { console.error('leaf e1-trail-guide-plain-boot-proof not found'); process.exit(1); }

console.log('before:', JSON.stringify({ status: hit.status, stopNote: !!hit.stopNote, keys: Object.keys(hit) }));

hit.status = 'shipped';
hit.mergeHash = MERGE;
hit.review = 'reviews/e1-trail-guide-plain-boot-proof.md';
// The stop is now discharged: retire it into the record rather than leaving it half-retired.
if (hit.stopNote) { hit.stopNoteRetired = hit.stopNote; delete hit.stopNote; }
if (hit.blockedReason) { hit.blockedReasonRetired = hit.blockedReason; delete hit.blockedReason; }
hit.drainNotes = [
  'DRAINED s1257 -> ' + MERGE + ' (attempt 4, after three failures and a s1206 §5 park).',
  'THE GATE WAS THE CANONICAL ARM, NOT --workers=1, on purpose: --repeat-each=2 with default workers, both projects, 4/4 PASSED (desktop 32.4/33.6s, mobile 33.6/34.0s), loadavg 2.40 -> 12.92 across the run, so a LOADED green. F-1212-2 mandates --workers=1 because load makes false REDS; on THIS spec --workers=1 made a false GREEN three times running.',
  'ROOT CAUSE (s1256, F-1206-1) was the proof own helper, not the beat logic: moveHeroTo missed its stated 0.12 tolerance on 13/13 moves (0.237-2.153) INCLUDING on passing runs, so the proof had been passing by harvest-range luck.',
  'THE CURE IS STRUCTURAL, which is why this merge is safe on more than one run numbers: the new helper can only return through its hypot<=0.12 branch (hero-approach.ts:16-18); every other path breaks and throws at :58. A green now ENTAILS convergence. The old pressUntil returned unconditionally once a per-axis threshold was crossed.',
  'FIDELITY AUDITED: extracted helper body is byte-identical to release-build.spec.ts inlined copy incl. SIM_PROGRESS_TIMEOUT=15_000 (scope 1 was a move, not a redesign); landed spec differs from the parked original by EXACTLY the two authorized changes (greenhorn trio -> toHaveCount(0), local mover -> shared helper) plus mechanical call-site adaptation. Zero src/ bytes.',
  'F-1257-3 OWED, non-blocking: the helper now exists TWICE (shared module + still inlined in release-build.spec.ts). Scope 5 ORDERED that duplicate left and handed the follow-up to the drain, so it is not a run defect -- but two copies of a braking-lead algorithm whose previous incarnation silently missed tolerance can drift, and a drift would read as a product regression. Wants a small lane slice gated on the release config.',
  'F-1257-4 incidental, pre-existing: mobile 390px WEAPON panel clips "the Prospector Lo" mid-word (artifacts/trail-guide-plain-boot/mobile-chrome-beat-2-*.png). Zero src/ bytes here, so newly VISIBLE rather than newly caused -- the mobile beat shots did not exist on main before.',
];

writeFileSync(p, JSON.stringify(data, null, 2) + (raw.endsWith('\n') ? '\n' : ''));
console.log('after :', JSON.stringify({ status: hit.status, mergeHash: hit.mergeHash, notes: hit.drainNotes.length }));
