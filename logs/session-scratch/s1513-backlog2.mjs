import { readFileSync, writeFileSync } from 'node:fs';

const P = 'tasks/BACKLOG.md';
let t = readFileSync(P, 'utf8');
const before = t.length;

// ── F-1511-2 → SHIPPED.
const old2 = '🟠 **F-1511-2 (s1511 — THE CURE SHAPE THAT WORKS IS ALREADY SHIPPED AND GREEN, TEN LINES ABOVE THE LINE UNDER TEST.**';
const new2 = '✅ **F-1511-2 — SHIPPED s1513, merged `da540bfb`. THE CURE HELD ON A THIRD, INDEPENDENT INSTRUMENT.** (gates on the merged tree: `tsc` rc=0 · `build` rc=0 · `landmark-collision` + `never-trap` **18/18 both projects** `--workers=1` · adjacent `fort-landmark-collision` **2/2** · zero console/page errors, only the known `THREE.Clock` warn. **`landmark-collision:68` PASSED desktop + mobile — it was `2 FAILED`, reproduced twice, at s1512\'s baseline.** `never-trap:88`, the F-BW-10 wedge invariant, **PASSED both** — the cure does not re-open the wedge it was warned about.) 🔑 **THE RUNNER RETURNED `CONDITIONAL GREEN` AND THE CONDITION WAS REAL: it refused to sign off until a supervisor reran `test:node-guards` on a supported Node, rather than bending a test to go green.** Discharged this fire at Node **26.4.0**: **rc=0, 346 tests / 343 pass / 0 fail / 3 skipped**, against the lane\'s rc=1 343/345 on Node 23.11.1 — **both lane reds were purely the [F-1507-1] runtime split**, exactly as diagnosed. ⚙️ **And the check this change class actually needs was run explicitly, not assumed:** the diff touches `src/entities/`, so per [F-1460-1] a slice-local spec is structurally blind to the sim pins — **`the E2 Baron fights keep their pinned outcomes` PASSED, no pin moved and none was re-pinned** ([F-1441-3] holds). The tally is identical to the one measured on the same tree *before* this slice, which is the cleanest evidence available that this routing change moved no guarded number. Review: `reviews/f1511-2-blocker-slide-geometry-gate.md` (supervisor section appended). **Originally filed as:** 🟠 **(s1511 — THE CURE SHAPE THAT WORKS IS ALREADY SHIPPED AND GREEN, TEN LINES ABOVE THE LINE UNDER TEST.**';
if (!t.includes(old2)) throw new Error('F-1511-2 head not found');
t = t.replace(old2, new2);

// ── F-1512-1 → did not reproduce (one datum, NOT a closure).
const old1 = '🟡 **F-1512-1 (s1512 —';
const new1 = '🟡 **F-1512-1 — DID NOT REPRODUCE at the s1513 drain (`da540bfb`): `landmark-collision:157` PASSED on BOTH projects on the merged tree, which supports the flake reading s1512 filed it under. ⚠️ **Left OPEN deliberately — one non-reproduction is not a closure**, and a flake that has now been seen red twice and green once is exactly the shape that gets wrongly retired. Originally filed as:** 🟡 **(s1512 —';
if (!t.includes(old1)) throw new Error('F-1512-1 head not found');
t = t.replace(old1, new1);

// ── F-1510-1: the owner question is now much better informed.
const old3 = '🟠 **F-1510-1 (s1510 —';
const new3 = '🟠 **F-1510-1 — THE MECHANICAL HALF IS NOW CURED (s1513, `da540bfb`); ONLY THE OWNER QUESTION REMAINS.** The head-on stall this row describes is gone: `landmark-collision:68` was `2 FAILED` and is now green on both projects, via [F-1511-2]\'s geometry gate rather than the scalar deadband [F-1510-1] first suggested — that axis was measured dead by s1510/s1511 and cost two lane runs to disprove. **What is still OPEN is the design question only: is "the enemy goes around the landmark" the intended read of the owner\'s original complaint, or did the complaint move rather than close?** REC unchanged: keep the go-around. Originally filed as:** 🟠 **(s1510 —';
if (!t.includes(old3)) throw new Error('F-1510-1 head not found');
t = t.replace(old3, new3);

writeFileSync(P, t);
console.log('BACKLOG grew', t.length - before, 'chars; 3 edits applied.');
