# M2 palisade input readiness — s2539 drain

## Slice / branch / tip

MAIN task `tasks/main-m2-palisade-placement-diagnosis.md`; completed done-move `20260907-181923-main-m2-palisade-placement-diagnosis.md`. Independent gate base `6c523f8d415088064a0b85770c69b1212b601b46`, candidate file blob `983d301fb71ba44adf79d781b460ed56ec6a06dc`. The complete detached checkout was verified against HEAD before applying the one-file candidate.

## Verdict

MERGED as `c7bf3f66c5f8a41487ca5ba37953dbfcfc588e3c`. F-2537-2 is an input-readiness race in the test. Capture the simulation tick in the same browser evaluation that dispatches the rejected tap, then wait for consumption and a released-input sample before the next tap. Exact count, gold, rejection, edge-touch, and error assertions are unchanged; runtime code is untouched.

## Evidence

| Check | Result |
| --- | --- |
| Typecheck / build | PASS, Node 26.4.0, 11.8 s / 50.8 s |
| Complete M2 | 14/14, 137.4 s |
| Complete task-025 + M1 + M2 | 30/32, 208.9 s; only the two known M1 spawn failures |
| Fresh unchanged-base M1 control | 6/8, 49.2 s; identical desktop/mobile `enemiesAlive > 0`, received 0 at line 36 |
| Independent input-sample control | 4/4: immediate second confirm is ignored; an intervening release admits it; exact count/gold checked |
| Plain boot | Desktop and 390px, 2/2; zero warnings, console errors, or page errors |
| Independent Codex review | No actionable issue; its typecheck and six focused repetitions passed |
| Additional power measurement | RED: initial candidate 0.853 ms; bounded comparison base 2.499 ms / candidate 0.894 ms, cap 0.500 ms. No green claimed. |

Receipts: `artifacts/s2539-fire/gates.txt`, `artifacts/s2539-fire/adjacency.txt`, `artifacts/s2539-fire/base-m1.txt`, `artifacts/s2539-fire/input-sample-controls.txt`, `artifacts/s2539-fire/causal-and-boot.txt`, `artifacts/s2539-fire/power-control.txt`, and `artifacts/s2539-fire/codex-review.txt`. Candidate identity is in `artifacts/s2539-fire/candidate.json`; browser evidence is copied to `artifacts/s2539-fire/browser-evidence/`. The completed runner report is preserved verbatim at `artifacts/m2-palisade-placement-diagnosis/REPORT.md`.

The original frame-scheduled diagnostic reproduced only on mobile during this fire; desktop’s trigger did not create the intended collision. The replacement diagnostic observes and asserts the actual input sequence, with a reverse control on both projects. Reproduction patches, samples and limitations are retained in `artifacts/s2539-fire/controlled-reproduction.md`.

The first browser invocation mistyped two adjacent filenames and therefore collected only M2; it is recorded as 14 M2 cases, never as full adjacency. A separate complete 32-case command supplies adjacency. The first plain-boot command refused on server-process cwd ownership before opening a page; relaunching the same configured gate server from the gate cwd resolved it. The linked-tree task audit skipped and does not supply the final MAIN task verdict. These instrument limitations remain visible in the receipts.

## Merge classification

| Path | Classification / resolution |
| --- | --- |
| `e2e/m2-01-build-menu.spec.ts` | Matched completed MAIN output; four additions, three removals; no conflict |
| `artifacts/m2-palisade-placement-diagnosis/` | New bounded runner diagnosis and results; retained verbatim |
| `artifacts/s2539-fire/` | New independent gate and factory receipts, including failed attempts |
| Three tracked screenshots under `artifacts/056/` | Incidental runner writes retained under runner-generated, then restored to HEAD; not merged as art |

No lane ref, runtime source, engine pin, placement rule, timeout or assertion value changed. The full Node suite is outside this e2e-only task’s explicit scope, as recorded in `artifacts/s2539-fire/gate-scope.md`. Power is an additional measurement of byte-identical runtime inputs, red on both trees; its cause is not established and it is not a new effect of this e2e-only diff. No deploy is owed.

## Findings and next work

- F-2537-2 CLOSED by the atomic readiness barrier and the observed sample/release controls. This does not close the separate chapter-readiness gate: its saved six-wait candidate must be rebased onto this fix and gated.
- F-2533-1 remains open in the completed lane-a M1 corrective. Fresh base control establishes the accepted adjacency exception; the old inventory’s CLEAN entry is explicitly stale.
- Lane-c chapter evidence writers and lane-a M1 remain undrained. No second drain or speculative refill is taken.
