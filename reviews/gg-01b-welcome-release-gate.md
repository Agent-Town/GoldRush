# GG-01b corrective — the welcome owns the prompt, so the release test must skip it

**Slice:** `lane-gg-01b-welcome-release-gate.md` · **Branch:** `lane/perf` · **Tip:** `3b340bbd` · **Base:** `2abbe743`
**Merged at:** `e5d3c26c` · **Drained by:** s1211 fire, 2026-07-29 · **Verdict: ✅ ACCEPTED — F-1210-5 IS CURED**

## What it does

One line. `e2e/release-build.spec.ts:47` now clicks the **existing** `town-welcome-skip` testid before teleporting to
the Tavern. **No `src/` change.** F-1210-5 hypothesised a test-knowledge gap rather than a product defect, and the
runner's observe-first scope confirmed it: the welcome is *meant* to own a fresh profile's first town entry, the test
was written before the welcome existed, and it walked into a prompt it did not know how to dismiss.

The runner took choice **3(a)** and answered the **player** question before the test question (Mistake #10):
`artifacts/gg-01b-welcome-release-gate/` shows a visible **Skip welcome** at 1440 px *and* 390 px, and a Board that is
visible, clickable, and opens the contract board afterwards with no console or page errors.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| **Full release suite** (`release-build.spec.ts`, real config, private port) | **26/26, 1.8 m, load 6.33** |
| My own pre-cure baseline, same tree, same command | **3 failed / 23 passed** |
| Runner's mutation control — cure **removed** | **0/2**, identical invisible-board fingerprint |
| Runner's mutation control — cure **restored** | **2/2** |
| Runner's positive/negative arms | with welcome 0/2 (163.6 s) · without welcome 2/2 (45.1 s); pooled with s1210 **0/4 vs 4/4** |

**The baseline is what makes this evidence rather than a claim.** I had measured this exact suite on this exact tree
an hour earlier while gating GG-03c, so I was not comparing against a remembered number.

**Merge classification:** base `2abbe743` **is** `git merge-base(main, lane/perf)`, and main never moved
`e2e/release-build.spec.ts` since it. **Zero MAIN-MOVED files, no 3-way.** Applied delta verified byte-identical to
`git diff 2abbe743 3b340bbd`. ⓘ `lane/perf` no longer carries the rejected GG-03 `06eeac68` — the runner's pre-flight
reset it away, and it survives only because s1210 pinned `archive/lane-perf-gg03-06eeac68`. The pin did its job.

## Findings

### ↩️ F-1211-1 **WITHDRAWN BY MEASUREMENT** — `:184` was a casualty of `:21`, not a third red

Gating GG-03c I recorded a HIGH finding: the release gate carried **three** reds, not the two F-1210-5 named, and
`release-build.spec.ts:184` ("later flagship URLs decline to the Claim", failing on
`THREE.GLTFLoader: Couldn't load texture blob:` ×3) would **survive** this corrective because the corrective is scoped
to `:21`. I wrote that a fire merging this and reading "release gate green" would be wrong.

**It cleared.** `:184` failed 2/2 across both of my pre-cure arms and passes in the 26/26 above.

The mechanism I missed: at `--workers=2`, `:21`'s two **150-second** timeouts were running *concurrently with* `:184`,
and that is precisely the contention that starved its GLTF blob-texture loads. **A failing test can manufacture the
load that fails its neighbours** — so a red measured beside a slow red is not independent evidence, and my
"reproduced identically in both arms" control could not see it, because *both* arms contained the slow `:21`.

Two arms agreeing does not make a finding safe when both arms share the confound. The correction is recorded in
`tasks/BACKLOG.md` and in the GG-03c review beside the original claim, not in place of it.

### 🚨 F-1211-6 (OPEN, NOT THIS SLICE'S) — `gazette-welcome.spec.ts:44` is red on main and undocumented

`e2e/gazette-welcome.spec.ts:44` fails at **line 87**, which asserts the newsie does **not** wander during the welcome
(`Math.hypot(after − before) < 1`). Measured: **4.87**.

| Run | Harness | Load | Result |
|---|---|---|---|
| 1 | external dev server (5273) | 13.27 | 2/2 FAIL |
| 2 | external dev server, `-g` alone | 18.55 | 2/2 FAIL |
| 3 | **self-booting** rig (5274) | 8.14 | 2/2 FAIL |
| 4 | self-booting rig, **GG-03c `heraldReader` reverted** | — | 2/2 FAIL |

**8/8 failures across two harnesses and a 2.3× load range**, so it is neither my rig nor a load flake, and run 4
exonerates GG-03c. It is **absent from `logs/suite-red-inventory.md`** — which means it presents to the next fire as a
red *their* merge caused, the F-1204-1 shape.

⚠️ **The part I could not close:** the lane-d runner measured this same suite **8/8 green** at ~13:26, and the only
code merged to main between that run and mine is GG-03c — which run 4 rules out. So either it turned red for a reason
neither of us has isolated, or it is intermittent in a way four consecutive double-reds do not suggest. **Owed: a
bisect and an inventory row.** It does not block this corrective, which cannot touch it.

### ⚠️ F-1211-7 — s1210's F-1210-6 self-disclosure is factually wrong, and a guard input pointed at the wrong commit

s1210 confessed that the lane-b convergence cure "landed as an UNLABELLED SWEEP inside `0b8db8f9`". It did not.
`git show --name-only 0b8db8f9` is **three doc files**; their other commit `2abbe743` is **four more docs**. Neither
carries a line of the cure. The code reached main in the **attended session's `79be48db`** (12:53–12:58,
*"spec: standing-orders/almanac/replay-truth doctrine"*), which carries `e2e/release-build.spec.ts` **+73/−22** —
confirmed by grepping for the cure's own mechanism rather than by reading a commit message: `hypot(dx, dz) <= 0.12`,
in-page `keydown`/`keyup` dispatch, `setTimeout(sample, 16)`.

**Why this is not trivia:** the leaf `lane-b-approach-convergence-class` recorded `mergeHash: "0b8db8f9"`, and
`mergeHash` is a **guard input** — `drain-block-check.mjs` reads it for ancestry. A pointer at a docs-only commit
would have told a future probe the cure shipped in a commit containing none of it. Corrected to `79be48db…` this fire.

**And I nearly missed it the same way s1210 did.** Curing F-1211-2 earlier this fire, I expanded that very hash from
8 chars to 40 to satisfy the schema — treating it as a *format* problem and never asking whether it pointed at the
code. The schema was satisfied by a lie made well-formed. *A near-miss value can be corrected into a valid wrong
answer; validate what a pointer points AT, not just its shape.*

## The through-line

Two findings of mine died this fire, in opposite directions. F-1211-1 was a real measurement whose **control shared
the treatment's confound**, so it survived a check it should have failed. F-1211-7 was a real error that survived
because I fixed its **shape** instead of reading it. Between them: a green suite and a red one both lied, and only
running the thing again told me which was which.
