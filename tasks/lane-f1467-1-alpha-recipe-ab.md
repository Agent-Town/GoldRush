CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1467-1-alpha-recipe-ab — settle the extraction recipe by MEASURING it at play scale (closes F-1464-2, unblocks F-1464-1)

**FIRE-AUTHORED s1467 (attended review welcome).** This master exists because F-1464-2's gate is a **disjunction** and the factory had been reading only its first branch. The gate, verbatim: *"closes when an attended eye rules the recipe at play scale, **or an in-game A/B measures it**."* Two consecutive handoffs (s1465, s1466) carried it forward as "ATTENDED EYE, cheap" — parking a 🔺 blocker behind an owner who was never actually required. You are the second branch.

ROLE: implementer on lane-b. WORKDIR: `worktrees/lane-b` (branch `lane/b`). Commit prefix `abrecipe:`. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 (2026-08-05) exists because a master offered the refresh as a conditional and put a currency probe beside it; the runner ran the probe first against a lane 44 commits behind, and truthfully reported "stale lane" about a lane that was clean and one command from correct — 27,551 tokens, zero edits. The probe below CANNOT distinguish "the lane is stale" from "I asked too early". So the refresh is not a conditional. Do step 1, then step 2.** `lane/b` was measured **57 commits behind main** at authoring time, so step 1 is doing real work here, not ceremony.

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-b fetch origin main
git -C worktrees/lane-b checkout -B lane/b origin/main
```

**STEP 2 — CURRENCY PROBE (only after step 1):**
```
grep -c "an attended eye rules the recipe at play scale, or an in-game A/B measures it" tasks/BACKLOG.md
```
Expect **1**. If **0**, step 1 did not take — STOP and report "refresh did not land", do NOT report a stale lane.

**STEP 3 — SAFE-DUPE:**
```
ls e2e/f1467-alpha-recipe-ab.rig.ts
```
Expect **No such file**. If it EXISTS, this slice already ran — STOP and report; do not re-derive.

**STEP 4 — LANE SAFETY:** `git branch --show-current` = `lane/b`. Any dirty *tracked* blob not reachable in git → STOP.
⚠️ **FACTORY-CHURN EXCEPTION (F-1407-1 / F-1266-1):** modifications under `logs/**` and `artifacts/**` are the factory's own background churn and are **NOT** lane dirt. Ignore them in step 4; they must never STOP this run.

## WHY

`tasks/BACKLOG.md` **F-1464-2** (s1464), verbatim:

> **THE EXTRACTION RECIPE IS UNSETTLED, AND IT MUST BE SETTLED BEFORE ANY ROSTER RE-EXTRACTION, OR THE RE-EXTRACTION BAKES IN A CHOICE NOBODY MADE.** Attributing F-1450-4 surfaced two recipes that both cure the halo but differ in edge treatment. **Two-step** (key at 1024, then downsample) is halo-free **and** keeps the historical softness — its alpha is byte-identical to the 2026-07-08 file, `partial 1845`, key-magenta **0**. **One-step** (`--size N` directly, what s1450 used and what the roster would inherit) is halo-free with a harder, darker rim, `partial 121`. The two-step arm looks better on the 8× board — **but "better at 8× on a checker" is not "better in game": these render at roughly a 1-unit billboard under `alphaTest`, where more partial pixels can ERODE thin features rather than soften them. That is UNMEASURED and I did not guess it.**

**The stakes are F-1464-1 (🔺):** 1075 of 1314 processed sprites still carry the F-1449-1 halo, and the roster cannot be re-extracted until this recipe is settled — a re-extraction on the wrong recipe bakes the wrong edge into 1314 files at once.

🔍 **AND THE FIRE FOUND THE DISCRIMINATOR THE FINDING WAS MISSING — READ THIS BEFORE YOU DESIGN THE ARMS.** F-1464-2 says "under `alphaTest`" as if there were one threshold. **There are two tiers in this codebase, and the erosion risk is almost entirely concentrated in one of them** (measured s1467 by reading the sites):

- **`alphaTest: 0.35`** (≈ alpha 89/255) — `src/assets/generated.ts:263` (`attachGeneratedSprite`, single sprites), `src/assets/SpriteAnimator.ts:279`, `src/town/TownScene.ts:2966`. **This is where two-step's manufactured partials are at risk**: bilinear downsampling blends alpha 0 against alpha 255, and every resulting partial *below ~89* is DISCARDED outright. Two-step has 1845 partials to one-step's 121.
- **`alphaTest: 0.04`** (≈ alpha 10/255) — `src/assets/generated.ts:377` (`GeneratedSpriteBatch`), `src/game/Game.ts:455`, `src/entities/pools.ts:1202`, `src/agent/Embodiment.ts:49`, `src/town/TownScene.ts:4396`, `src/entities/BuildingSign.ts:52`, `src/game/DrillYard.ts:372`. Here nearly every partial SURVIVES, so two-step should read as softening, not erosion.

➡️ **Therefore the honest answer may be "it depends on the tier", and a single global verdict could be wrong.** Measure both tiers. If they disagree, say so plainly — a split verdict that names its condition is a better answer than a forced global one, and it is exactly the input F-1464-1 needs.

## READ-FIRST

1. `tasks/BACKLOG.md` — the **F-1464-2** row (the currency-probe sentence above anchors it) and the **F-1464-1** row directly above it. Your acceptance is F-1464-2's gate; F-1464-1 is what you unblock, **not** what you fix.
2. `reviews/f1450-4-edge-softness-attribution.md` — the full attribution. It establishes that the two recipes differ **only** in when the resample happens; no extractor code drifted.
3. `artifacts/f1450-4/` — **the evidence is already in git as of `e86f6481`; do not regenerate what exists.**
   - `arms/D-1024-then-384.png` = the **two-step** arm · `arms/E-old-1024-then-384.png` = its pre-bleed twin
   - `arms/D-default-1024/`, `arms/A-current/`, `arms/B-old-pre-bleed/`, `arms/C-bleed-stubbed/` — per-arm `prop-baron-banner.png`
   - `blobs/shipped-OLD-a1b3f4b0.png` (2026-07-08 two-step) vs `blobs/shipped-NEW-head.png` (one-step)
   - `arms-manifest.json` (what each arm is) · `alpha-probe.mjs`, `edge-comparison.mjs` (existing instruments — reuse, don't rewrite)
4. `scripts/extract-alpha.mjs` — `--size` (`:24`, default 1024), `--key` (`:27`), `bleedEdges` (`:13`), `resize()` bilinear (`:89`). **This is how you produce arms; do not modify it.**
5. `src/assets/generated.ts` — both alphaTest tiers above, in context.
6. `e2e/perf-r2-pixels.rig.ts` and `e2e/beauty-town.rig.ts` — the house `.rig.ts` capture pattern. **Rigs are `testIgnore`d out of the shared battery (F-1440-2), which is why your harness must be a rig and not a spec.**

## SCOPE — MEASURE, THEN RECOMMEND. DO NOT RE-EXTRACT THE ROSTER.

1. **Pick the subjects, and justify the pick in your report.** At minimum: `prop-baron-banner` (the arm that already exists in every variant) **plus at least two sprites with genuinely thin features** — rigging, rope, antenna, wheel spokes, lettering-free filigree — because thin features are the entire question. Name why each was chosen. A subject with no thin features cannot answer this and must not pad the sample.
2. **Build both arms for every subject** with `scripts/extract-alpha.mjs`, unmodified: **two-step** (key at default 1024, then downsample to the shipped size) and **one-step** (`--size N` directly). Write them under `artifacts/f1467-alpha-recipe-ab/arms/`. Record the exact command per arm.
3. **Offline threshold analysis (the machine-independent core).** For each subject × arm × tier (0.35 and 0.04): apply the threshold to the alpha channel and report **surviving-texel count**, **partial count**, and — the number that actually answers the finding — **thin-feature retention** measured against the native-resolution keyed master as ground truth. State your retention metric precisely and defend it; a metric nobody can restate is not a measurement. **Assert nothing on wall-clock (F-1440-2).**
4. **In-game A/B at play scale (`e2e/f1467-alpha-recipe-ab.rig.ts`).** Mount each arm as a real texture on a real sprite at the **actual billboard scale the game uses**, under **both** tiers, in the real renderer. Capture to `reviews/shots-f1467-alpha-recipe-ab/` — desktop **and** 390px. Do NOT swap anything under `assets/`; the rig loads the artifact textures directly. Zero console/page errors.
5. **VERDICT + RECOMMENDATION** in `reviews/f1467-alpha-recipe-ab.md`: which recipe wins, **per tier**, with the numbers and the screenshots that show it. If the tiers disagree, give the split verdict and its condition. **If the measurement cannot separate them, say EXACTLY that — "the two recipes are indistinguishable at play scale" is a real and useful finding, and it closes the gate just as well as a winner does. Do not manufacture a preference.**
6. **Ledger:** update the **F-1464-2** row to CLOSED-BY-MEASUREMENT with your verdict and the review path, and annotate **F-1464-1** with the settled recipe so the re-extraction master can be authored. **Keep the original text and banner it (RETENTION LAW; do not delete).** Goal-leaf receipt in `tasks/goals.json`, same commit.

## TOUCH-ONLY

`artifacts/f1467-alpha-recipe-ab/**` (new) · `e2e/f1467-alpha-recipe-ab.rig.ts` (new) · `reviews/f1467-alpha-recipe-ab.md` + `reviews/shots-f1467-alpha-recipe-ab/**` (new) · `tasks/BACKLOG.md` + `tasks/goals.json` (ledger receipt, same commit).

## NO

**`assets/**` — not one byte.** This slice measures a recipe; it does NOT re-extract the roster (that is F-1464-1, and it is gated on your answer) · `scripts/extract-alpha.mjs` (you *use* it; modifying it invalidates every arm) · `src/**` — no renderer or alphaTest changes; you are measuring the game as it is, and editing it makes your own measurement unsound · `artifacts/f1450-4/**` (read-only evidence, now tracked) · the halo class itself (F-1449-1/F-1464-1) · any other finding's ledger row.

## SELF-CHECK

- `npx tsc --noEmit` clean · `npm run build` green
- your rig green **both projects** (desktop + 390px), zero console/page errors, screenshots present at `reviews/shots-f1467-alpha-recipe-ab/`
- **adjacent art/sprite suites green UNMODIFIED** — you changed no `src/` and no `assets/`, so any red here is either pre-existing or yours; fingerprint it, do not wave at it
- `npm run test:node-guards` green — **note this slice does NOT touch `src/sim/`, so F-1460-1's mandatory-sim-guard trigger does not apply; run it anyway as the cheap board check**
- `npm run test:ledger-guards` **as your LAST act** (F-1300-4) — you wrote ledger rows, and the guards that judge them ran before those rows existed
- every arm reproducible: the exact command recorded per arm, and re-running it reproduces the byte-identical PNG

READY-FOR-GATES. **Report:** the subject pick and why · the exact per-arm commands · the threshold table (subject × arm × tier: surviving texels, partials, thin-feature retention) · the play-scale verdict **per tier**, including a split or an indistinguishable result if that is the truth · the recommendation F-1464-1 should inherit · and anything you learned about the roster's tier distribution that the re-extraction master will need.
