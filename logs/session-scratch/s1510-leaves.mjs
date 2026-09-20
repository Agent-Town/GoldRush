import { readFileSync, writeFileSync } from 'node:fs';

const P = '/Users/robin/Claude/Projects/Gold Rush/tasks/goals.json';
const j = JSON.parse(readFileSync(P, 'utf8'));

let target = null, bucket = null;
for (const g of j.goals) for (const s of g.subgoals || []) for (const t of s.tasks || []) {
  if (t.id === 'f1507-2-landmark-routing-bisect') { target = t; bucket = s; }
}
if (!target) throw new Error('f1507-2 leaf not found');

target.status = 'merged';
target.attempts = 1;
target.mergeHash = 'ccd26fc8b8531c7c005652df392175d3a9675750';
target.drainNotes =
  'Drained s1510. The runner STOPPED correctly at scope 1: the master\'s proposed GOOD endpoint ' +
  'c063b5e59 is itself RED, so 4ab487437 (fort-solidity) is EXONERATED and no bisect was run. ' +
  'Its deliverable is docs/bench/landmark-routing-regression.md (66 lines, docs-only merge; tsc rc0; ' +
  'three-dot diff touches no run surface). The report\'s read-only 180-sample probe named the failure ' +
  'SHAPE precisely enough that s1510 finished the bisect fire-side in TWO probes rather than eleven. ' +
  'CULPRIT: 531bd923adc97d9c288310f7f94f549e994c3f29 (drain(s1445) lane-night-stuck-census, F-BW-10, ' +
  '2026-08-04T00:48+07). Arms, all --workers=1 both projects in detached gate-s1510 on scratch port 5234: ' +
  '1761da401 GREEN 10/10 (whole spec) | 7bb054510 (culprit parent) GREEN 2/2 | 531bd923a RED 2/2 | main RED. ' +
  'The proven-green endpoint was NOT inherited from CLEAN-IN-INVENTORY: the markdown lists failures only, ' +
  'so its silence is ambiguous, and the verdict was instead resolved from suite-red-inventory-compact.json, ' +
  'whose suites tree carries the 332-spec denominator plus an explicit per-test record for :68 ' +
  '("ok":true,"status":"passed","duration":4463,"startTime":"2026-07-28T02:59:19.439Z") - ran and passed, not absent. ' +
  'MECHANISM (9 ins / 9 del in src/entities/Enemy.ts): blockerSlideDirection() returned avoidanceSide(), ' +
  'position-derived and CONSTANT for a given approach, so a blocked enemy slid one way until it cleared the ' +
  'corner. It now returns Math.sign(moveTarget[axis] - position[axis]) || avoidanceSide(), which FLIPS ' +
  'whenever the enemy crosses the goal axis. The spec runs the enemy from directly south to directly north ' +
  'of ruined_mining_operation, so goal-x == blocker-x and the slide points back at the centre from both ' +
  'sides: 180 samples pinned at z=-8.652, 1.845<=x<=2.061, max x-deviation 0.175 vs halfX 3.176. ' +
  'F-1510-1 filed (the F-BW-10 cure trades a flip-flop wedge for a head-on stall; corrective authored, ' +
  'owner question parked, NOT blocking). F-1510-2 filed (the s1445 battery was chosen by suite NAME, not ' +
  'derived from the changed API: four e2e specs consume Terrain.landmarkBlockers() and only the slice\'s own ' +
  'never-trap was in the 7-suite list). F-1510-3 filed non-blocking (the red inventory records no snapshot ' +
  'commit; this fire had to recover the tree by timestamp-matching a per-test startTime against git log). ' +
  'Review: reviews/f1507-2-landmark-routing-bisect.md.';

const idx = bucket.tasks.indexOf(target);
bucket.tasks.splice(idx + 1, 0, {
  id: 'f1510-1-blocker-slide-deadband',
  title:
    'F-1510-1: the F-BW-10 goal-relative blocker slide (531bd923a) cures the wedge but creates a HEAD-ON STALL ' +
    'when the goal sits directly behind the blocker - the sign flips across the goal axis and the enemy ' +
    'oscillates against the face instead of routing around it (landmark-collision:68 RED both projects since ' +
    '2026-08-04). Find a deadband threshold that keeps never-trap:88 green AND restores landmark-collision:68, ' +
    'prove it by manufactured defect, and run all four Terrain.landmarkBlockers() consumers. A NEGATIVE result ' +
    '(no threshold greens both) is a legitimate outcome.',
  taskFile: 'lane-f1510-1-blocker-slide-deadband.md',
  lane: 'lane-a',
  status: 'queued',
  attempts: 0,
  authoredBy: 's1510 fire (FIRE-AUTHORED)',
  authorNotes:
    'Authored on a bisect this fire COMPLETED, not on an inherited hypothesis - culprit 531bd923a is named ' +
    'by a parent/child pair measured at --workers=1 on both projects, and the mechanism is read out of the ' +
    '9-line diff rather than guessed. The master FORBIDS reverting 531bd923a (it cured a real owner complaint, ' +
    'gate walk 2026-08-03: "the opponents get stuck a lot on the different objects"), FORBIDS editing either ' +
    'e2e spec (both are the judges - changing a judge to pass a defendant is the failure mode this task exists ' +
    'to avoid), and FORBIDS re-pinning scripts/gr-sim.test.mjs (F-1441-3). It requires test:node-guards because ' +
    'the diff touches src/entities/ (F-1460-1). The deadband cure is stated as a HYPOTHESIS with an explicit ' +
    'licence to return a negative result and STOP rather than widen scope hunting for a way to make it true. ' +
    'Scope 5 mandates the full landmarkBlockers() consumer set - that is F-1510-2 applied to this task itself ' +
    'rather than merely written down.',
});

writeFileSync(P, `${JSON.stringify(j, null, 2)}\n`);
console.log('f1507-2 ->', target.status, target.mergeHash);
console.log('f1510-1 leaf inserted into', bucket.id, '- tasks now', bucket.tasks.length);
