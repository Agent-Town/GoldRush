# Review — `lane-a-world-info-build-fixture-realign`

- **Slice:** F-1169-1 — realign `world-info-notes.spec.ts`'s build fixture to the world as it is now, or report that the world is what broke.
- **Branch / tip:** `lane/m3` @ `818e995c` (`runner(lane-a): lane-a-world-info-build-fixture-realign.md`)
- **Base:** `ae7fbb7f` (merge-base with main)
- **Drained:** s1170, 2026-07-28
- **§3.0 `drain-block-check`:** **CLEAR** — `[factory-world-info-build-fixture] status="queued"`, run as the first command of the drain, before classification.

## Verdict: **ACCEPT — merged.**

The runner reported *"STOPPED AT FIREWALL — not READY-FOR-GATES"*. That self-assessment is honest and I am overriding its **conclusion**, not its facts: the task's deliverable was a diagnosis plus a coordinate-only realign inside a coordinate-only firewall, and **both were delivered in full**. The target test is still red — but it is red **83 lines further down, on a different and now-diagnosed fault**, having asserted six things it had not reached since 2026-07-08. Refusing this merge would leave a 443k-token diagnosis unbanked and force it to be re-derived.

## What it does

`e2e/world-info-notes.spec.ts:193` (now `:194`) died at `:111` — `expect.poll(() => build.ghostValid).toBe(true)` — timing out ~21 s before asserting anything it was written to assert. The runner instrumented all six `BUILD_NOTE_CASES`, found **exactly one** bad coordinate, moved it, and left everything else alone.

**Scope-1 table (the runner's, reproduced):**

| Case | Requested | Ghost position | Valid | Footprint |
|---|---:|---:|---|---:|
| sentry_beacon | (-16,14) | (-16,14) | yes | 1×1 |
| palisade | (-10,14) | (-10,12) | yes | 1×3 |
| **stockpile** | **(10,14)** | (10,15) | **no** | 1.5×1.5 |
| turret | (16,14) | (16,14) | yes | 1×1 |
| sluice | (-4,7) | (-4,7) | yes | 2×1 |
| assay_office | (3,7) | (3,7) | yes | 2×1.5 |

**1(d) verdict — FIXTURE fault, not a world regression**, and it was discriminated rather than assumed:
- Failure is `computeValid` **reason 3 (terrain `matchesPlacement`)**; count, gold and range were all shown non-binding.
- **Self-overlap excluded by a control:** the in-loop sweep and a *fresh-page, placed-alone* sweep were **identical** — 145/169 valid cells, same nearest cell — so nothing the test itself had already built caused it.
- **The sluice remains valid**, so river adjacency is intact — which is exactly the distinction the master demanded be kept separate.
- Nearest valid cell `(9,13)`, √2 ≈ 1.41 away.

**Cure:** one coordinate, `(10,14) → (9,13)`, plus a dated preservation comment. Fixture shape preserved, the guarded 5 000 ms budget untouched. This is the F-1029-2/F-1026-5 precedent applied exactly as the master cited it.

**Mutation control (the runner's, and it is the right shape):** restored `(10,14)` temporarily, reproduced the live `ghostValid` failure at `:112`, then restored the intended diff. The cure is proven to be load-bearing.

## Evidence (re-run by me on the MERGED tree — not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (tsconfig includes `e2e`, so the gate covers both changed files) |
| `npm run build` | **green, 1.78 s** |
| `world-info-notes.spec.ts`, both projects | **6 failed / 8 passed (3.3 m)** — byte-matching clean main's known fingerprint (s1123 drainNote: 6 failed / 8 passed at `:193`/`:286`/`:318` on `452af90c`), lines shifted `+1` by the added comment |
| **Target test failure LINE** | **MOVED `:111` → `:218`** — verified by me in isolation: `expect(getByTestId('building-context-prompt')).toBeVisible()` → `unexpected value "hidden"` |
| `run-guards.mjs` (all 8) | **7/8**, sole red `test:power-budget` — **F-1160-2, discriminated below** |
| Zero console/page errors | the 8 passing tests call `assertNoErrors` on both desktop and 390px mobile |

**The count is unchanged; the coverage is not.** That distinction is the whole deliverable, and it is why a headline "still 6 failed" would have been the wrong reading. The target test now executes and passes: six placements, six note assertions, the assay-office prompt, the note, `Enter` → assay bench visible, `Escape` → bench hidden. All of that was dead code behind a timeout for 20 days.

**No screenshots:** the merged diff is **zero `src/`** — nothing renders differently, so there is no player-visible surface to shoot (same reasoning s1169 applied to the asset-diet drain).

## Merge classification

`git diff --name-only main...lane/m3` = **exactly 2 files**, 91 insertions / 1 deletion:
- `e2e/world-info-notes.spec.ts` — **LANE-TOUCHED** (3 lines)
- `e2e/f1169-world-info-build-fixture-probe.spec.ts` — **LANE-TOUCHED**, new file

`git diff ae7fbb7f..main` for both paths is **EMPTY** — main never moved either file since the base, so **no MAIN-MOVED file, no 3-way graft, no conflict**. Path-scoped `git checkout lane/m3 --` of the two files, then a path-scoped commit.

**Firewall verified at source, not taken on report:**
- Zero `src/**`. ✓
- `:286`–`:338` untouched — both siblings intact, including **`:318`/`:335`, the OPEN OWNER FORK** (F-1141-3 + F-1164-1). The runner did not pre-empt Robin. ✓
- No `test.skip`/`fixme`/`retry`/`setTimeout` in the target spec; the 5 000 ms poll budget at `:111` is byte-unchanged. ✓
- The probe is **file-level env-gated on a dedicated variable**: `test.skip(!process.env.GR_F1169_PROBE, …)`. This is the *cured* shape (a uniquely-named flag), not F-1169-2's overloaded-flag hazard — it cannot be flipped by an unrelated run. ✓
- `whole-suite-collection` / `town-spec-collection` guards green, so the new spec file needs no collection registration. ✓

## Findings

### 🔺 F-1170-2 — the downstream fault is a HALF-DONE BEHAVIOUR CHANGE FROM 2026-07-12, and it is very likely a large block of the red inventory

The new failure at `:218` is **not** noise, and I verified its mechanism at source rather than accepting the runner's sentence:

- `Game.ts:5651-5652`: `const demolish = canInteract && this.buildSystem.isBuildMode && !fund ? this.demolishCandidate : null;` and `const upgrade = demolish ? this.upgradeCandidate : null;` — **the demolish/upgrade context prompt requires build mode to be ON.**
- The test teleports to the palisade with build mode **off** and expects that prompt visible. It cannot pass.
- `git log -L5651,5651` dates that condition to **`50977ab6`, 2026-07-12, `runner(lane-b): fix-building-prompt-flicker.md`**.
- **`git show --stat 50977ab6`: it changed `src/game/Game.ts` and `src/ui/BuildingContextPrompt.ts`, and added its OWN new spec `e2e/building-prompt-flicker.spec.ts` — and updated NONE of the five other specs that assert on `building-context-prompt`.**

Those five are `bt-00-demolish.spec.ts`, `bt-01-tiers.spec.ts`, `e2-stamp-mill.spec.ts`, `night-light-doctrine.spec.ts`, `world-info-notes.spec.ts`.

✓ **VERIFIED:** `bt-00-demolish.spec.ts:120` calls `setBuildMode(false)` and `:126` then asserts `building-context-prompt` **toBeVisible** — the identical shape that fails at `world-info-notes:218`. The inventory's red rows for that spec are at **`:126`, `:156`, `:189`, `:224`, `:260`**, and `:126`/`:156` are exactly this assertion.

? **INFERRED, NOT MEASURED — and it must be measured before anyone authors against it:** that bt-00/bt-01's inventory reds share this cause. The line numbers and the code shape match; **I have not run those specs.** Converting this to VERIFIED is one command and is scope 1 of whatever comes next.

⚠️ **THE FORK THIS FINDING DOES NOT DECIDE, and must not:** either (a) the five specs are **stale** and should enter build mode before asserting — cheap, and would retire a large block of the board — or (b) `50977ab6` **regressed a player-facing capability** (upgrading/demolishing a building without first entering build mode) and the specs are correctly guarding a contract that broke. **A fire must not pick.** Mistake #10 applies directly: *where does the PLAYER see this, in a plain boot?* — and the answer decides which way this goes. Whoever takes it: **scope 1 is an observe-the-defect STOP that answers (a)-vs-(b) in a plain boot with no `?debug`**, before one line of either repair.

➡️ **Why this matters beyond one test:** s1167/s1168/s1169 have been mining the 301-row inventory **one row at a time**. If (a) holds, one decision plus a mechanical edit retires a double-digit block of it. That is a materially better use of the next master than the next single row.

### 🔻 F-1170-3 — F-1160-2 fired inside this very drain gate, which is the harm it predicts

`run-guards.mjs` came back **7/8** with `test:power-budget` red at **p95 0.752 ms** vs the 0.500 cap. **Discriminated, not asserted:**
- My merged diff is **zero `src/`** — nothing in a two-file `e2e` diff can reach a PowerGraph solve timer.
- n=20 on this same tree at 14:33 (load 7.69): **0/20 over cap, max 0.405**.
- An immediate re-measure at 14:51 (load 4.09), identical tree: **0/8 over cap, body 0.324–0.355**.
- 0.752 sits squarely in s1160's excursion band (0.631/0.658/0.725/0.899).

⇒ **Environment artifact, F-1160-2's exact class.** Recorded here because it is the third instance today **and the first observed firing inside a real gate rather than a measurement harness** — i.e. direct evidence for the *"a guard that reds at random is how a battery gets trained out"* argument. The corrective is already queued and live: `lane-c-power-budget-instrument-control` (F-1170-1, authored this fire).

### ⓘ Non-blocking notes
- The runner's *"pre-existing red at line 218"* wording is imprecise and worth correcting for the record: `:218` had **never executed** before this change, because `:111` killed the test first. It is **newly exposed**, not pre-existing. The distinction matters — a never-executed assertion carries no evidence either way, which is exactly why F-1170-2 needs its own measurement.
- Scope-4 class scan reported by the runner: 68 raw `ghostValid` matches narrowed to 31 other specs in the coordinate-placement family, **none changed** — correctly respecting F-1158-1's standing DO-NOT-AUTHOR on the `ghostValid`-poll sweep.
- Sibling reds unchanged and correctly left alone: town dead-reckoning (`:287`) and the 390px clearance `636 > 586` (`:319` — the owner fork).
