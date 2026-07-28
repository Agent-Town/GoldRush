# Task lane-a-build-mode-prompt-spec-realign: four specs still assert the pre-07-12 building-card contract — realign them to the ruling the owner gave, and prove the ruling both ways (lane-a, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1171, 2026-07-28. Authored from F-1170-2 (`STATUS.md` s1170 handoff §B), re-derived at source by s1171 before a line of this task was written: the ruling (`tasks/fix-building-prompt-flicker.md:5`,`:8`), the runtime gate (`src/game/Game.ts:5651`), the commit that flipped it (`50977ab6`, 2026-07-12), and the **row-by-row red list re-measured out of `logs/suite-red-inventory-compact.json`** (see the table in WHY). No new scope invented. **Two corrections to the inherited list are folded in — read WHY before you trust any earlier summary.**

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- `tasks/fix-building-prompt-flicker.md:1-10` — **the owner's ruling, verbatim, dated 2026-07-12. This is the contract. Everything in this task serves it.**
- `src/game/Game.ts:5638-5644` (`syncAssayOfficePrompt`) and `:5646-5654` (`syncBuildingContextPrompt`) — **read these two together; the relationship between them is the trap in scope 1(c).**
- `e2e/building-prompt-flicker.spec.ts` (all 71 lines) — **the CONTROL. It is green, it shipped with the ruling, and it is the exact idiom you are propagating.** `:36`,`:38` hidden outside build mode → `:40` `setBuildMode(true)` → `:41` visible → `:61`,`:63` the buttons work.
- `e2e/bt-00-demolish.spec.ts:67-92` (the `placeBuildableAt` and `intersects` helpers) and `e2e/bt-01-tiers.spec.ts:68-79` (its own `placeBuildableAt` — note `:76`)

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you — do not spend budget re-deriving it.** s1171 verified at 2026-07-28T15:3xZ: `lane/m3` is 1 ahead at `818e995c` (`runner(lane-a): lane-a-world-info-build-fixture-realign.md`), whose deliverable **shipped to main this morning as `bef39c4b`**. `git diff main lane/m3 -- e2e/ src/` shows **one file**, `e2e/asset-diet.spec.ts`, and the lane holds the **older** side of it (the pre-cure `GR_CAPTURE_EXTERNAL_SERVER` skip that main replaced with `GR_ASSET_DIET_BUNDLE` in `7c28335c`) — i.e. **main is ahead, the lane holds nothing unmerged.** Textbook SAFE DUPE → reset and proceed. Re-run that one `git diff` to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (the defect, dated, re-measured)

On **2026-07-12** commit `50977ab6` (`runner(lane-b): fix-building-prompt-flicker.md`) **inverted** the building context card's visibility rule. Before: the card showed on proximity *outside* build mode. After (`src/game/Game.ts:5651`, unchanged on main today):

```ts
const demolish = canInteract && this.buildSystem.isBuildMode && !fund ? this.demolishCandidate : null;
```

**The owner ordered that inversion, in his own words:** `tasks/fix-building-prompt-flicker.md:5` — *"…And maybe just activate it if I am in Build mode/with B."* — and `:8` states it as an explicit **RULING**: *"the card shows ONLY in build mode (B / build button active) — outside build mode, proximity to a building shows nothing (combat stays clean)."*

**So the runtime is correct and ratified. Four e2e specs are not.** They were authored 2026-07-07/07-12 against the *old* contract, several of them calling `setBuildMode(false)` **on purpose** and then asserting the card is visible. They have been red ever since. The only later touch to the gate (`85e9d7e6`, 07-22) changed the bench selector, not the rule.

**The red rows, re-measured by s1171 from `logs/suite-red-inventory-compact.json` (run 2026-07-28T02:26Z) — not inherited from a summary:**

| spec | lines | rows | failure surface |
|---|---|---|---|
| `bt-00-demolish.spec.ts` | `:126` `:156` `:189` `:224` `:260` | **10** (5 × 2 projects) | all `toBeVisible()` on `building-context-prompt` |
| `bt-01-tiers.spec.ts` | `:156` `:180` `:204` `:337` | **8** (4 × 2) | `toBeVisible`, **`toContainText`**, and **a 30 s `locator.click` TIMEOUT** — same cause, three surfaces |
| `night-light-doctrine.spec.ts` | `:79` | **2** | `toBeVisible()` |
| `world-info-notes.spec.ts` | `:218` | **2** | `toBeVisible()` — **not in that inventory**; it is the *new* failure line uncovered when `bef39c4b` cured `:111` this morning (s1170 measured it) |

**= 22 rows from one ratified ruling.** The setup that causes it is explicit in the source: `bt-00-demolish:120`,`:149`,`:151`,`:186`,`:215`,`:248` and `bt-01-tiers:76` (inside its shared `placeBuildableAt` helper — **one line, four tests**) and `world-info-notes:115` all call `setBuildMode(false)` before the assertion.

**⚠️ TWO CORRECTIONS to the earlier summary of this finding — both measured, both binding on your scope:**
1. **`e2-stamp-mill.spec.ts` is NOT affected and is NOT yours.** It has **zero** reds in the inventory. Its `:130` assertion lives in `expectFundPrompt`, and the *fund* branch (`Game.ts:5650`) is computed with `!isBuildMode` — i.e. the megaproject fund card is deliberately an **outside**-build-mode card and is exempt from the ruling. It is named in the firewall. Touching it is scope invention.
2. **`bt-00-demolish`'s 6th test** (`:271`, *'demolish scales refund by remaining HP after building damage'*) **asserts no prompt at all** — it calls `__GR_TEST__.demolish()` directly — and is **not** in the inventory's red list. ⚠️ **Two sources disagree about it and you are the tie-breaker:** `tasks/BACKLOG.md:16` records a 6th desktop red at `:296` and calls it *"a gold-refund poll downstream of the same blocked flow"*, while the 02:26Z inventory has no red for that test at all. `:296` is `expect.poll(() => gold(page))` after an **API** demolish that never touches the card, so *"downstream of the same blocked flow"* is an **inference, not a measurement**. **Settle it in scope 1(a) by observation and report which source was right.** If it is red, it is a **different cause**: report it, do not cure it here.

## Scope

**1. OBSERVE AND DIAGNOSE FIRST — a STOP gate, not a formality. No spec edit is authorised until this scope has confirmed the cause per file.**

Start a dev server on scratch port **5274** (NOT 5188 — `vite.config.ts` hard-codes it for every lane worktree; Mistake #12). Drive everything via `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5274`.

(a) Reproduce, **both projects**, `--workers=1`:
`npx playwright test e2e/bt-00-demolish.spec.ts e2e/bt-01-tiers.spec.ts e2e/night-light-doctrine.spec.ts e2e/world-info-notes.spec.ts`
Paste the outcome line and a row per failure: `spec · project · line · assertion`. Compare against the 22-row table above and **state the delta explicitly**.
- **If the four specs are green, the premise is refuted → STOP and report, changing nothing.**
- Extra or missing rows are **information, not an obstacle** — record them and carry on; only a *wholesale* miss (e.g. `bt-00-demolish` green) is a STOP.

(b) **Prove the cause is the build-mode precondition, on the running game, before editing.** In a scratch probe or a `page.evaluate` in your run notes (not a committed assertion), for one failing site: teleport to the building, record `building-context-prompt` visibility, call `__GR_TEST__.setBuildMode(true)`, record it again. **The card must go hidden → visible with nothing else changed.** Paste both readings. This is the whole task's premise; do not take it from this file.

(c) ⚠️ **THE TRAP — find it before you write a fix, because it will otherwise look like a passing test.** `syncAssayOfficePrompt` (`Game.ts:5640-5642`) shows the assay-office prompt only when **`!isBuildMode`**. The building card shows only when **`isBuildMode`**. **The two can never be visible at the same time.** Now read `bt-00-demolish.spec.ts:154-158` and `:169-172`: both assert `assay-office-prompt` visible **and** `building-context-prompt` visible **at the same moment**. Under the ratified contract those are **unsatisfiable as written** — not a missing `setBuildMode(true)`.
- Confirm this empirically (in build mode, read both prompts' visibility; paste the two booleans).
- Then read `:89-92`: `intersects()` returns **`false` when either bounding box is null**, and a hidden element's box **is** null — so the no-overlap assertion at `:158` **would pass vacuously** on a hidden card. *An assertion that passes because nothing ran is worse than a red.* Say so in your report.
- **Do not** invent a new co-visibility rule. Scope 2(b) tells you exactly what to do with these two tests.

(d) Write the verdict sentence before editing: *"the failing rows in `<specs>` are caused by the ratified build-mode precondition; `bt-00-demolish`'s assay-office test additionally asserts a co-visibility the contract forbids; nothing observed requires a `src/` change."*
- **If any row needs a `src/` change to go green, STOP and report it as a finding.** The runtime is the ratified side of this task; the specs are the stale side. A cure that edits `src/game/Game.ts` would be reversing an owner ruling, and that is **his** call, not yours.

**2. Realign the four specs to the ratified contract. Minimal, faithful, per-site.**

The idiom is the control's, `building-prompt-flicker.spec.ts:40-41`: **be in build mode when you assert the card.**

(a) **The mechanical sites** — `bt-00-demolish` tests at `:107`, `:181`, `:208`, `:237`; `bt-01-tiers` (via its helper `:76`); `night-light-doctrine:79`; `world-info-notes:218`. Ensure build mode is **on** at the assertion, changing as few bytes as possible (prefer flipping/removing the deliberate `setBuildMode(false)` over inserting new machinery; where a test legitimately needs build mode *off* earlier — e.g. `world-info-notes` must be **out** of build mode for the assay prompt and the Enter→bench path at `:209-:215` — turn it **on** just before the card assertion, not at the top).
- `bt-01-tiers:76` sits in a **shared helper**: one change moves four tests. After it, re-run the **whole** file and confirm the tests that never asserted the card are still green — a helper change has a wider blast radius than a test change.
- `night-light-doctrine` is a **lighting** spec that takes screenshots. Build mode may draw a placement ghost/grid. Check its light assertions (`billboardLights`, the doctrine counts) still measure what they were written to measure, and **look at the `darkest-night-upgrade` screenshot**. If build mode changes what that shot is evidence of, **say so in your report** — do not quietly ship a doctrine screenshot that now shows a build overlay.

(b) **The assay-office test (`bt-00-demolish:144`) — restructure into two phases, preserving its intent.** Its title is its contract: *demolish without stealing the bench Enter path*. Under the ruling that becomes **sequential**, not simultaneous:
- Phase 1, **outside** build mode: `assay-office-prompt` visible, `building-context-prompt` **hidden**, `Enter` opens the bench, close it. (The hidden-card assertion is new and is the *point* — it guards the other half of the ruling.)
- Phase 2, **in** build mode: the card visible with `'Assay Office'`, `demolish-confirm` refunds as before.
- **Delete the vacuous `intersects` assertion at `:158`** — it cannot mean anything once the two prompts are exclusive — **and say in your report that you deleted it and why.** If `intersects` is then unused, remove it; if it is still used elsewhere, leave it.
- ⚠️ This is the one place you are authorised to change a test's *shape*. Keep every gold/refund/HP assertion it already makes.

(c) **One negative assertion, one place.** In `bt-00-demolish`'s first test (`:107`), before entering build mode, assert the card is **hidden**. The contract has two halves and the reds only ever exercised one. Do not add this to every site — the control already owns the general case.

(d) Add **one brief comment** at the top of each file you touch: the date, this task, and *"the building card is build-mode-only per the owner's 2026-07-12 ruling (tasks/fix-building-prompt-flicker.md:8)"* — so nobody "restores" the old assertions.

**3. Prove it BOTH ways. A test that cannot fail is not a test.**
- **(a) The reds are gone:** re-run the scope-1(a) command, **both projects**. Paste the outcome line and the per-test results. Target: the 22 rows above are green.
- **(b) The tests still really test:** for `bt-01-tiers:204` (the click timeout) and `world-info-notes:218`, paste evidence that the assertions **after** the previously-failing line now execute — a line that stopped timing out has bought coverage, and that is the actual deliverable. **If a failure LINE MOVES rather than disappears, that is a legitimate and valuable outcome** — report the new line and its cause; do not chase it outside this firewall.
- **(c) It can still FAIL:** temporarily revert **one** site's build-mode entry, re-run that one spec, paste the returning red. Then restore it and paste `git diff` proving the intended state.
- **(d) The control is untouched and still green:** run `e2e/building-prompt-flicker.spec.ts` both projects and paste the result. `git diff --stat` must show it **unchanged**.
- **(e) The exclusion was right:** run `e2e/e2-stamp-mill.spec.ts` both projects, paste the result, and confirm `git diff --stat` shows it **unchanged**. This is how you prove correction #1 empirically instead of trusting it.

**4. Report the class, do not fix it.** `grep -rn "building-context-prompt" e2e/` and report any site outside these five files. Change none of them.

## Firewall

**TOUCH-ONLY:** `e2e/bt-00-demolish.spec.ts` · `e2e/bt-01-tiers.spec.ts` · `e2e/night-light-doctrine.spec.ts` · `e2e/world-info-notes.spec.ts` (**only the region around `:218` — see NO**) · your run report in `tasks/runs/` · `artifacts/` screenshots your runs emit.

**NO (do not touch, do not "improve"):**
- **Any `src/**` file.** The runtime side of this contract is **owner-ratified**. If a green seems to require a `src/` edit, that is the scope-1(d) STOP, not a licence. *Reject-don't-stretch.*
- **`e2e/building-prompt-flicker.spec.ts`** — the green control. Editing it destroys the only independent proof that the ruling works.
- **`e2e/e2-stamp-mill.spec.ts`** — measured **zero** reds; its card assertion is the exempt *fund* path. Out of scope by evidence.
- **`e2e/world-info-notes.spec.ts:286-338`** — `:286`/`:301` (town dead-reckoning) is a separate owed task; **`:318`/`:335` is under an OPEN OWNER FORK** (F-1141-3 + F-1164-1, one decision at `src/styles.css:1620`, `BACKLOG:1543`). Touching it would pre-empt Robin.
- **`bt-00-demolish.spec.ts:271-301`** (the 6th test) — asserts no prompt; not in the red list; a different cause if red.
- `test.skip`, `test.fixme`, `test.retry`, `testInfo.setTimeout`, any timeout increase, or any weakening of an assertion. **You may DELETE exactly one assertion — `bt-00-demolish:158` — and only with the written reason scope 2(b) demands.**
- `logs/suite-red-inventory.md` / `logs/suite-red-inventory-compact.json` — merged artifacts with proven byte-reproducibility (s1167). Read them; do not annotate them.

## Self-check before you report READY-FOR-GATES
- `npx tsc --noEmit` clean.
- `npm run build` green.
- Scope 1 produced the observed-vs-expected row delta, the **two visibility readings** of 1(b), the **two booleans** of 1(c), and the 1(d) verdict sentence — **before** any spec edit.
- Scope 3 recorded (a) both-project greens, (b) evidence the post-failure assertions execute, (c) a real induced red **and** the restored diff, (d) the control green and unchanged, (e) `e2-stamp-mill` green and unchanged.
- Adjacent suites unmodified-green, **both projects, zero console/page errors**: `e2e/m2-01-build-menu.spec.ts` (the other build-mode spec) and `e2e/task-037-assay-bench-ungate.spec.ts` (the other assay-Enter spec — `bt-00-demolish:159` shares its seam). Name them and paste the counts.
- `git diff --stat` shows **exactly the four spec files** (plus untracked run/artifact files) — and `building-prompt-flicker.spec.ts` and `e2-stamp-mill.spec.ts` appear **nowhere** in it.

**READY-FOR-GATES** + report: the scope-1 row delta and the 1(c) trap findings, the per-site edits with their one-line justification, the scope-3 five-way proof (a–e), the `night-light-doctrine` screenshot judgement, and the scope-4 grep. If you STOPPED at 1(a) or 1(d), report that instead — **a STOP with the readings and a named reason is a full success for this task.**
