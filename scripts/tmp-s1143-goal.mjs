#!/usr/bin/env node
// s1143 goal-leaf registration for lane-vp-02b-jumper-slot-red (Goal Registration
// Law: the leaf lands in the SAME commit as the authored master). Written as a
// file because the note is dense with backticks, which the bash gate reads as a
// subshell in an inline `node -e`. Committed as evidence per the Retention Law.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const GOALS = fileURLToPath(new URL('../tasks/goals.json', import.meta.url));
const goals = JSON.parse(readFileSync(GOALS, 'utf8'));

const leaf = {
  id: 'lane-vp-02b-jumper-slot-red',
  title: 'Cure the vp-02b:233 jumper red by observing a real claim jumper, and settle the dormancy assert against shipped behaviour.',
  status: 'queued',
  taskFile: 'lane-vp-02b-jumper-slot-red.md',
  lane: 'lane-b',
  spec: 'reviews/vp-02d.md:26 (diagnosis); tasks/025-vp-02e-jumper-8way-activation.md (guarded header + ## e2e item 4, F-1132-7); e2e/vp-02b-rotation-resolver.spec.ts:233-290',
  authoredBy: 's1143',
  mergeHash: null,
  authorNotes: 'FIRE-AUTHORED s1143. Test-only, src/** barred. RE-MEASURED AT SOURCE THIS FIRE, not inherited: e2e/vp-02b-rotation-resolver.spec.ts on current main is 1 failed / 6 passed (desktop-chrome, 1.6m), and the failure is a 30s TIMEOUT at :283 waiting for spriteAnimations[char.claim_jumper].loaded === true -- so the shape assert at :285 is NEVER REACHED and the test has never actually observed a jumper. Cause already diagnosed by an earlier slice, reviews/vp-02d.md:26: spawnPack() exposes char.bandit_base, not char.claim_jumper. This is a KNOWN pre-existing red (tracked as vp-02b :113 and :233, both fingerprinted in reviews/vp-02d.md), not a new one -- verified before authoring rather than claimed. The same slice closes F-1132-7, whose residual is named on the face of the guarded task 025: the 8-way jumper behaviour SHIPPED via the walk8 route (Enemy.ts:198/:753/:755 + grab/flee at :888/:894, all five verified at source this fire) and what is missing is TEST COVERAGE, not behaviour. Task 025 itself is guarded DO-NOT-QUEUE and is to be read, never queued or edited. Scope 1 is a measure-first STOP gate (find empirically which __GR_TEST__ surface mounts the slot; spawnThief is the hypothesis, NOT asserted as fact) and flags the KeyP pause at :235 as a candidate confound. Scope 3 explicitly licenses the runner to contradict the premise: if the jumper still shows the OLD six-key shape, keep the assert and report that task 025 overstates what shipped -- either outcome is a success. Scope 4 requires a mutation control, because a test that passes while silently observing nothing is the exact defect being cured. LANE-SAFETY pre-proved: git log main..lane/m4 shows one commit 5e9eba91, which s1142 DRAINED to main as 8cab8791 by tip-graft (done-move shipped-8cab8791-..., reviews/vp02-capture-error-surface.md on main) = false-ahead safe dupe.',
};

let parent = null;
const walk = (node) => {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    if (node.some((n) => n && typeof n === 'object' && n.taskFile === 'lane-census-glow-mesa-corrective-retire.md')) parent = node;
    node.forEach(walk);
    return;
  }
  for (const key of Object.keys(node)) walk(node[key]);
};
walk(goals);

if (!parent) throw new Error('could not locate the sibling array to register into');
if (parent.some((n) => n.id === leaf.id)) throw new Error('leaf already registered');
parent.push(leaf);

writeFileSync(GOALS, `${JSON.stringify(goals, null, 2)}\n`);
console.log(`registered leaf ${leaf.id} beside ${parent.length - 1} siblings`);
