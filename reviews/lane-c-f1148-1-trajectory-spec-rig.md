# Review — lane-c-f1148-1-trajectory-spec-rig (F-1148-1, attempt 2)

**Slice:** `lane-c-f1148-1-trajectory-spec-rig` · **branch:** `lane/e2-arsenal` · **runner tip:** `b9035a65` · **base (merge-base):** `3fa3b85f`
**Drained by:** s1152 fire, 2026-07-28 · **Review file:** this · **Report:** `artifacts/f1148-1-trajectory-split-v2.md`

## Verdict

**MERGE — the deliverable is complete, independently reproduced, and its blast radius is nil.**

The runner reported **STOP, not READY-FOR-GATES**, and s1151's handoff explicitly left the call to me: *"decide explicitly whether a STOP confined to self-check 8 blocks a merge whose deliverable is complete."*

**It does not, and the reason is specific rather than lenient.** Self-check 8 was a *confirmation* step whose only purpose was to prove the runner left `e2e/m2-04-gold-stealing.spec.ts`'s `:226` budget guard intact. That purpose is satisfied **more strongly by a blob-identity check than by a red run**: `git rev-parse` returns `677577ff9c0e3cb6ead948cd590a1dba9e7610cd` for that file on **both** `main` and `lane/e2-arsenal`, byte-identical, and matching the hash s1150 recorded. A red at `:226` would have been *evidence* the file was intact; identical blobs are *proof*. The STOP therefore costs the slice nothing it needed.

The merge is **11 pure additions, zero `src/`, zero `e2e/` modifications** — the only `e2e/` file is a new opt-in spec that cannot execute without an env var. Nothing in it can red a future board.

## What it does

Answers F-1148-1: *on today's main, does removing the lateral bias restore the parent revision's route, or only part of it?* It ports the retained rAF trajectory sampler into `e2e/f1148-1-trajectory-probe.spec.ts` — an **opt-in** Playwright spec gated on `GR_F1148_PROBE` — and runs three arms × 3 runs: **A** today's main, **B** main with `lateralOffset = 0`, **C** parent revision `4da134a9`.

**Classification: B sits between A and C ⇒ a REAL REMAINDER.** The sharp part is that the two measures separate: the **X floor is fully cured** by arm B (`-0.662 → 0.000`, the S-bend gone) while **~1.9 s of route cost survives**. Route *shape* is restored; route *cost* is not. The lateral bias is a confirmed contributor and provably **not the whole regression** — so an eventual owner-gated repair scoped to `lateralOffset` alone would be insufficient. The runner names the closest remainder without repairing it: with `lateralOffset = 0` the block still computes `spreadBiasX`/`spreadBiasZ`, i.e. centre-seeking formation steering that the parent revision had no equivalent of.

## Evidence (measured by me on the MERGED tree, not inherited from the lane)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0** (re-run without a pipe — a pipeline masks the exit code) |
| `node scripts/run-guards.mjs` | **8/8 rc=0** |
| Scope-2, full-suite collection | `npx playwright test --list \| grep -c f1148` → **6** |
| Scope-2, execution with env unset | **6 skipped, 0 executed — BOTH projects** (stronger than the runner's desktop-only 3) |
| `git status --porcelain -- src/` | **empty** |
| `e2e/m2-04-gold-stealing.spec.ts` | blob `677577ff…` **identical** main vs lane |
| `src/entities/Enemy.ts` | blob `8276763c…` **identical** main vs lane (arm B's mutation is in no commit) |
| `scripts/probe-f1148-1-trajectory.mjs` | blob `1f99270a…` **identical** — attempt 1's artifact untouched (RETENTION LAW) |
| Branch diff | **11 files, 348 insertions, 0 deletions** — exactly the TOUCH-ONLY list |

**Independent reproduction of arm A — the check the bar did not ask for.** The report's numbers could have been transcribed, rounded, or invented. I re-ran the merged spec myself on a quiet box and got, bit for bit:

```
simTime 11.333333333333293 · pathDistance 21.811200926890102 · xMin -0.6618931479786295 · xMax 3.23
```

identical to every digit of `artifacts/f1148-1-trajectory/arm-a-main-run1.json`. Sample counts differed (134/135 vs 134) exactly as they should — that is wall-clock rAF cadence, not sim state. **The report is real and the sim is deterministic.** Raw records kept at `artifacts/f1148-1-trajectory/s1152-verify-run{2,3}.json`.

**Report-vs-raw audit:** every cell of the report's nine-run table matches its JSON record. No run was averaged in that lacked a positive control; sample counts are 67–135 and path distances 19.497–21.811, all plausible.

## Merge classification

- **LANE-TOUCHED (11 files, pure adds):** `artifacts/f1148-1-trajectory-split-v2.md` · `artifacts/f1148-1-trajectory/*.json` (9) · `e2e/f1148-1-trajectory-probe.spec.ts`
- **MAIN-MOVED-ONLY (4 files):** `STATUS.md` · `tasks/BACKLOG.md` · `tasks/goals.json` · `tasks/lane-c-f1148-1-trajectory-spec-rig.md`

The two-dot diff shows those four as lane-side *deletions*; they are **stale-base phantoms**, not real deletes. Proof by commit ancestry rather than by eye: `git log 3fa3b85f..lane/e2-arsenal -- STATUS.md tasks/` is **empty** (the lane never touched them) while `git log 3fa3b85f..main` on the same paths shows `d653bcd4`, `5ab9e697`, `47aac696`. Grafted with `git checkout lane/e2-arsenal -- <the 11 paths>`; no 3-way needed, no conflict possible.

## Findings

### F-1152-1 — 🔴 THE PLACEMENT FLAKE IS A BRIEFING-CARD RACE, AND s1150 REFUTED THE WRONG VERSION OF THE HYPOTHESIS

**Non-blocking for this merge** (the rig is opt-in and the deliverable is complete); **material for everything downstream**.

The runner's STOP was real and I reproduced it: running the merged probe spec on a **quiet box** (no runner live, guards battery already finished, nothing competing), **run 1 of 3 failed at `confirmBuild`** while runs 2 and 3 passed. s1151 flagged *load* as the leading-but-untested explanation and warned against inheriting it as fact. **Load is not the cause.**

The failure's own page snapshot names it. At the moment `confirmBuild()` returned `false`, the DOM still showed the mission briefing:

```yaml
- paragraph: The Contract
- button "Begin" [cursor=pointer]
- heading "The Claim"
```

`openGame` waits only for `__THREE_GAME_DIAGNOSTICS__.frame > 10` — and **the renderer happily reaches frame 10 behind the briefing overlay**, so the gate passes while the game has not started and the build system rejects input.

**This is the house pattern's exception, not its rule.** 14+ specs dismiss the card explicitly — `e2-arsenal.spec.ts:44`, `cw-02-escort.spec.ts:84`, `e2-incline.spec.ts:78`, `e3-tram.spec.ts:24`, `064-river-continues.spec.ts:31` and more all do `getByRole('button', { name: 'Begin' })`. `m2-04-gold-stealing.spec.ts` does **not**, and this new probe copied m2-04's `openGame` verbatim *because its master told it to reuse the rig that works* — so it inherited the race along with the shape.

⚠️ **Why this was missed, and it is an instructive miss rather than a careless one.** s1150 listed *readiness* among three hypotheses "tested and REFUTED, so do not re-run them", on the grounds that *"`openGame` at `m2-04-gold-stealing.spec.ts:17-23` is the same three steps as the probe."* That statement is **true and it refutes the wrong claim**: it establishes the two rigs are *equal* in readiness, which says nothing about whether **both are insufficient**. A shared defect is invisible to a differential test. The refutation closed the door on the one hypothesis that was correct.

⚠️ **Stated as a strong hypothesis with a named control, not as a conclusion — the lesson this ladder keeps relearning.** I have the state at failure and the pattern across specs; I have **not** yet run the mutation control (add the `Begin` dismissal, re-measure the rate). Two facts are still unexplained and I am recording them as open rather than folding them in: the bare-chromium probe failed on the **fifth** palisade (`palisade@2,9`) whereas this failure is at the **first**, and 1/5 vs ~2/3 are different rates. **Those may be two distinct faults**, and a single tidy story that swallows both is exactly the shape to distrust.

➡️ **Corrective is fire-authorable but is NOT a drive-by**: it touches `m2-04-gold-stealing.spec.ts`, which carries the known-red `:226` budget assertion, so any edit there must prove it did not perturb that guard.

### F-1152-2 — 🟡 `palisadesPlaced: 5` is an assertion by construction, not a measurement

`e2e/f1148-1-trajectory-probe.spec.ts:78` writes the literal `palisadesPlaced: 5` into every record. It is **not** measured. The claim is nonetheless *sound* — `placeBuildableAt` does `await expect(...).resolves.toBe(true)`, so a placement failure throws and no record is written at all; the file's existence is the proof. But a future reader auditing the raw JSON would take a hardcoded constant for a measured positive control. The genuine positive controls (`sampleCount`, `pathDistance`) are real and were asserted at `:73-74`. Cosmetic; recorded so nobody cites the wrong field.

### F-1152-3 — 🟡 The default arm name does not match any committed record

`const arm = process.env.GR_F1148_ARM ?? 'arm-a'` (`:8`), but the committed records are `arm-a-main-*`. Running the spec without `GR_F1148_ARM` silently writes a *new* `arm-a-run*.json` set beside them rather than reproducing arm A. Harmless, but it means the obvious invocation is not the reproducing one. Noted for whoever next points this rig at something.

## Compliance with s1151's stated bar

| Clause | Result |
|---|---|
| All five palisades placed | ✅ 9/9 runs, all 5/5 |
| Positive control on **every** run | ✅ sample counts 67–134, distances 19.497–21.811, none zero, none averaged in |
| Full three-arm table, every individual run | ✅ present, plus `[min, max]` spreads rather than a bare mean |
| X floor for all three arms | ✅ A `-0.662` · B `0.000` · C `0.000` |
| Scope-2 proof spec did not join default suite | ✅ verified independently, both projects |
| `git status --porcelain -- src/` empty | ✅ plus blob-identity on `Enemy.ts` |
| Arm C scratch port named | ✅ **5234**, detached worktree removed, spec copy SHA-256 stated |
| `m2-04` unedited, `:226` unwidened | ✅ blob-identical |
| Placement failing ≥2× through the test runner **is itself the finding** | ✅ it did — F-1152-1 above |
