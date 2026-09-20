// s1223: record F-1223-1 and mark F-1222-3's ACTION discharged-with-a-correction.
// Asserts every edit landed — a ledger edit that silently no-ops is worse than none.
import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/BACKLOG.md';
let text = readFileSync(P, 'utf8');

if (text.includes('F-1223-1 (s1223')) {
  console.log('F-1223-1 already present — no-op (dupe-guard)');
  process.exit(0);
}

// 1. Correct the one factual claim inside F-1222-3 that this fire disproved.
const STALE = 'it is **not** in `logs/suite-red-inventory.md` (checked), it lives only in task-master prose,';
const FIXED = '~~it is **not** in `logs/suite-red-inventory.md` (checked), it lives only in task-master prose~~ ' +
  '**[CORRECTED s1223 — FALSE: the number was MINTED in `logs/suite-red-inventory.md:629`, ' +
  'which keys the same subject on `:80` while this grep looked for the task-prose label `:121`. See F-1223-1.]**,';
const before = text.length;
text = text.replace(STALE, FIXED);
if (text.length === before) throw new Error('F-1222-3 correction did not land — refusing to write');

// 2. Insert F-1223-1 immediately after the F-1222-3 bullet it corrects.
const lines = text.split('\n');
const idx = lines.findIndex((l) => l.includes('F-1222-3 (s1222)'));
if (idx < 0) throw new Error('F-1222-3 bullet not found — refusing to write');

const entry = '- ✅ **F-1223-1 (s1223) — F-1222-3’s REMEDY IS DISCHARGED, AND ITS OWN PREMISE AND ITS OWN NUMBER BOTH NEEDED CORRECTING ON THE WAY.** ' +
  'The ordered sweep was *“strike the label from task-master prose; it is not in `logs/suite-red-inventory.md` (checked)”*. ' +
  '**Both halves of that were wrong, in opposite directions.** 🔑 **(a) THE SOURCE WAS NEVER SWEPT, BECAUSE IT WAS GREPPED FOR UNDER THE WRONG KEY.** ' +
  '`logs/suite-red-inventory.md:629` is where *“25% mobile-only at w4”* was **minted** — s1216’s measured table, ' +
  '`| e2e/ap-standing-orders.spec.ts:80 | mobile-chrome | 0/8 | 0/8 | 2/8 (25.0%) | monotonic |`. ' +
  'The inventory keys the subject on **`:80`** (the test declaration); the task masters copied it as **`:121`** (the assertion), ' +
  'and one master as **`:115`→`:156`**. A grep for `:121` therefore cleared the very file the number came from. ' +
  '➡️ **Correcting only the copies would have left the source able to regenerate them** — so the fix was applied to the class: ' +
  '**four masters** (`lane-a-e2-rail-tough-only-bind`, `lane-b-lb-03-bench-seed-sets`, `lane-c-ap-06b-panel-ladder-and-voice`, ' +
  '`lane-c-agent-rung-honest-gate`) **plus `tasks/ap-orders-adapter-wiring.md`’s 🔴 block** (which actively instructed a runner to expect the red ' +
  'and not to trust its own green), **plus a SUPERSEDED section appended to the inventory itself** — appended, never rewritten: ' +
  'the s1216 row is honest history and states its own denominator. 🔬 **(b) “100% IN BOTH PROJECTS” IS ITSELF A LOAD SAMPLE — the same mistake one level down.** ' +
  'F-1222-3 replaced a rate quoted without its load with *another* rate quoted without its load. ' +
  'An **interleaved T–C–T** control on main (pre-cure blob `6a68e219`, restored byte-identically; `git diff HEAD` empty) measured ' +
  '**desktop 2/4 (50.0%) and mobile 2/4 (50.0%) at loadavg 5.4→15.7**, every failure the real assertion at `:121`. ' +
  'With s1216 and s1222 that is a clean monotonic **load-response curve, symmetric across projects at every point**: ' +
  '**~12.5% quiet → 50%/50% at loadavg ~15 → 100%/100% at loadavg ~25.** ' +
  '✓ **“Mobile-only” is not merely refuted, it is quantified as unremarkable:** at the 12.5% rate s1216 measured, ' +
  'a desktop arm drawing 0/8 has probability 0.875⁸ ≈ **34%** — a coin-flip, not a project-specific defect. ' +
  '✅ **(c) THE CURE HOLDS, AND IS NOW THE BEST-EVIDENCED THING IN THIS THREAD: 64/64 GREEN** across two independent fires and trees — ' +
  's1222 32/32 at loadavg 25.28, s1223 **T1 16/16** (loadavg →14.50) and **T2 16/16 at loadavg →29.06**, the heaviest load this subject has ever been measured under. ' +
  '**It is no longer a known red: a failure there is now a real regression**, and all five documents say so. ' +
  '⚠️ **(d) THE CONTROL I NEARLY BELIEVED.** My first control arm returned a tidy **8/8 red, exit 1** — and was **contaminated**: ' +
  'every failure was `ERR_CONNECTION_REFUSED`, because the scratch dev server had silently died (spawned detached with **piped** stdio, ' +
  'so it was killed by a full 64 KB pipe buffer once its parent exited). ' +
  '**It agreed with the conclusion it existed to test, and only the error text gave it away.** Discarded, root-caused, ' +
  'the helper fixed to log to a file (`logs/session-scratch/s1223-serve.mjs`), and the arm re-run. ' +
  '**THE LESSON: a corrective inherits the authority of the finding that ordered it, and that is exactly why it must be re-derived — ' +
  'F-1222-3 was right about the disease and wrong about where the infection lived. And a control that fails for the wrong reason is not a control; ' +
  'it is a second rumour, wearing the uniform of evidence.**';

lines.splice(idx + 1, 0, entry);
writeFileSync(P, lines.join('\n'));
console.log(`F-1222-3 corrected; F-1223-1 inserted at line ${idx + 2}.`);
