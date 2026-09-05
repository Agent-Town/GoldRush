# e7-playbook-rows — drain review (attended, 2026-09-05)

**Slice/branch/tip:** `e7-playbook-rows` · `lane/b` · tip `f4e6a9146` · base `5d8603982` · merge `b38d60295` (+ `package.json` chain repair)
**Verdict: MERGED, with the human-parity gap pinned and its corrective queued.** Claude implementer (Opus), four commits, READY-FOR-GATES under the repo's node with every red attributed against a control.

## What it does
One additive rider verb, `PLAYBOOK_USE` (name only, rung 2): an unseen name records the rider's accepted submissions as a canonical tape (the exact shape `gr-sim` writes and `BroadcastMirror` reads), a known name repeats it; a use asks the A4/A5 consent rungs in the browser's own order, calls `BroadcastMirror.noteUse`, then installs the tape's orders so the sim runs the rider's own demonstration: programming by demonstration, no new authority. Four secure rules derived from what each contract already declares, no new twist key: Relay Valley's program lights a relay; Echo Canyon fields measurable mirror squads from recorded uses; the Dead Band answers a use with a real `signal-suppressed` refusal; Relay Rush's interference front suspends a running program and restores it. `now.playbookUse` is contract-scoped (no schema bump by the registry's own rule).

## Evidence (lane under node 26.4.0; merged tree re-gated, see the SHIPPED row)
| gate | result |
|---|---|
| tsc / build / `test:stats` | 0 / 0 / 0 |
| new node guard | 6/6 · new e2e 6/6 both projects, zero console errors |
| adjacent E7 e2e 36/36 · verb/tape e2e 18/18 · skill.md guards 19/19 · view-schema + battery 25/25 | green |
| both engines (one seed, one order stream, 890 ticks) | relay-valley `57b04716` · echo-canyon `6b7915fe` · dead-band `97bdab00` · relay-rush `00793392`, node = browser |
| full node rides | `5fbb0728` · `485a1c39` · `781f1539` · `faf04318`; all meet the objective, none secures (F-E7PB-3) |
| regression | all eight E7 idle null floors byte-identical |
| `test:node-guards` on the lane | 637 pass / 6 distinct fails, every one reproduced on a control of the lane base: the engine pin (drain's), desk-declaration from a linked worktree, the stale READY-FOR-GATES row (E8's, since retired), one self-inflicted concurrent run |

## Merge classification
Base `5d8603982` (the E4 lane tip; the lane never merged main). MAIN-MOVED and resolved: `src/sim/HeadlessContractSim.ts` (both additive diagnostic spreads kept: E8's `suitAir`, E7's `playbookUse`), `package.json` (`test:node-guards` chain: the first merge doubled the `run-node-guards` invocation; repaired to one invocation with the union of both lanes' guard files), `public/skill.md` (lane prose + main's fenced contract list), `tasks/BACKLOG.md` (union), `assets/engine-era.json` (main's registry; the merged tree pinned attended). `src/agent/View.ts` auto-merged.

## Findings
- **F-E7PB-1 (BLOCKING for the L7 claim on E7; CORRECTIVE QUEUED):** the browser binds no rider verb and carries no playbook latch, so the four maps decide their secure differently in the two engines; a browser player has the whole record-name-delegate loop but not the latch. Pinned by the node guard and the e2e. Master: `tasks/e7-player-playbook-parity.md` (lane-b).
- **F-E7PB-3 (open, same class as E4's):** no Signal map secures at a scripted floor (the rides meet the objective and die to waves). Heat 11's Opus secured three of the four under the old rules; a real rider under the new latch is the honest test. If none secures, a survival-floor slice follows (owner precedent).
- **F-E7PB-2 (known, harness-only):** the F-E4-1 class; the browser arm is bounded to 890 ticks.
- **Engine pin:** appended in this drain.

## Post-drain finding (2026-09-05, attended)
- **F-E7PB-4 (CURED in the e3-moth-season drain commit):** the E7 `public/skill.md` merge resolution (lane prose + main's fenced contract list) dropped two MAIN-side paragraphs the lane never had: the view-schema "additive-only" sentence under THE VIEW and the county ranking rule under SUBMITTING A STANDING. Caught by `scripts/standing-rule-surfaces.test.mjs` (the three-surfaces guard: actual 1 vs expected 2) on the next drain's battery; production build `4620d4d3` shipped without the rule for roughly one hour. Both restored verbatim from `46649a53`; guard 1/1, `view-schema-guard` 3/3. Lesson: a hand-resolved prose merge is judged by the guard battery, not by eye — run `standing-rule-surfaces` whenever `public/skill.md` is a MAIN-MOVED file.
