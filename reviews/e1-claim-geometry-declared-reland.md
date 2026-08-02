# e1-claim-geometry-declared-reland — s1393 gate

**Slice:** `e1-claim-geometry-declared-reland` (the second half of the F-1381-3/F-1381-4 pair; sibling `e1-headless-the-claim-reland` shipped `8e20d8ca` at s1392)
**Branch:** `lane/e2-arsenal` (lane-c) · **Tip:** `e676addf` · **Base (merge-base with main):** `b8acac28`
**Gated by:** s1393 fire, in a detached worktree `gate-s1393/` per §3.0b — the lane content was never placed in main's working tree.

## VERDICT (s1393): ⛔ **SUPERSEDED by the s1394 re-gate at the bottom of this file — the hold was discharged and the slice MERGED at `a3e199f4`.** The original s1393 verdict is preserved verbatim below for the record.

## VERDICT (s1393, as written): 🟡 **HOLD — NOT MERGED.** The re-land itself is correct and faithful; it reds one adjacent suite that the master never named. Cure measured, one word. Corrective queued to lane-c as `e1-claim-geometry-reland-gt05-shape`.

## What it does

Declares the E1 claim's geometry in the contract instead of hard-coding it in the engine. Three
E1 contracts (`the-claim`, the Night Shift variant, the Baron variant) gain `size`, `fords`,
`harvestAnchors` and `water` under `tileParams`; `ContractWaterDescriptor` gains optional
`centerZ`/`halfWidth`; `Terrain.ts` derives `RIVER_MIN_Z`/`RIVER_MAX_Z` from that descriptor with
the previous `-5 … +5` literals as the fallback. `normalizeContractDescriptor` back-fills
`size`/`fords`/`harvestAnchors`/`water` from the template when a candidate omits them, and a new
`water_geometry` validator rejects a non-finite centre, a non-positive channel width, or visible
banks narrower than the channel.

The declared values (`centerZ: 0`, `halfWidth: 5`) reproduce the prior `-5 … +5` river exactly, so
nothing is intended to render or simulate differently.

## The two block conditions, measured

`tasks/goals.json` held `e1-claim-geometry-declared` as `status:"blocked"`, **`blockClass:"gate-side"`** —
a fire-side readiness hold, no owner word owed. Both stated conditions were discharged with commands:

| # | Condition (from `blockedReason`) | Measurement |
|---|---|---|
| 1 | `lane/m4` is founded on owner-BLOCKED `7c4f132f`; a branch-level merge sweeps blocked content into main | `7c4f132f` **NOT an ancestor** of `e676addf`; salvage-ref `c876f675` **NOT an ancestor** either. The re-land was applied as a **per-commit patch**, never a merge. `46033151` *is* an ancestor — but it is an ancestor of `main` too (ordinary old history), so it is benign. |
| 2 | lane/m4's base predates `69984c6a` (`lossCondition` → `heroStart`); lifting onto clean main fails tsc with TS2339 | **`npx tsc --noEmit` rc 0** on the merged tree — the exact gate F-1381-4 predicted would fail. |

**Scope proof.** `e676addf` touches exactly its six declared paths. The three paths `7c4f132f`
touches that this slice must not (`e2e/072-era-activation.spec.ts`, `e2e/e1-baron.spec.ts`,
`src/town/TownScene.ts`) are **absent** from the commit. All six classify **LANE-ONLY** against main
since the base, and the patch applies to current main clean.

**Faithfulness.** The re-land is not merely *plausible*, it is **identical**: comparing the `+`/`-`
lines each commit introduces, `e676addf` and the salvage-ref `c876f675` produce the **same change on
all six paths**, including `src/meta/ContractFamilies.ts`, the one the master scoped as a hand 3-way
lift because main had moved ~355 lines at `cbf0e143`. The runner re-expressed the hunk against
main's current function rather than pasting the salvage-ref's context, and landed on the same result.

## Evidence

Gates run in `gate-s1393/` (detached, `main` + the patch), **all playwright at `--workers=1`** per §3.1.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc 0** |
| `npm run build` | **rc 0** |
| `test:node-guards` (38 files) | **228/228, rc 0** |
| playwright battery, merged tree | 52 passed · **10 failed** · 4 skipped (4.8m) |
| playwright battery, **clean-main CONTROL** | 53 passed · **7 failed** · 4 skipped (6.5m) |

**Adjacent suites were DERIVED, not taken from the master** (the F-1392-2 lesson, and it paid).
`grep -rln` for the changed symbols (`RIVER_MIN_Z`, `RIVER_MAX_Z`, `activeWaterDescriptor`,
`normalizeContractDescriptor`, `visualHalfWidth`) over `e2e/ src/` surfaced three e2e suites the
master's self-check never named: **`gt-05-water-depth`**, `e2-hill-mine`, `072-era-activation`.
The battery above is the master's four suites plus those three plus the `m2-05` boot control.

### Reds, classified against the control

Line numbers shift (the slice adds 40 lines to `tile-identity-pass.spec.ts`), so the reds were keyed
on **project + test title**, never on line number.

**Pre-existing on clean main — not this slice's (7):** `072-era-activation` determinism hash
(desktop) · `agent-view` byte-stable fixture (both projects — this is F-1380-2, at `:261` on main and
`:263` under the slice) · `e2-hill-mine` mesh relief (both) · `tile-identity-pass` "E1 contracts load
place descriptors…" (both — and its received hash **differs between runs**, `882193c3…` then
`7673b76d…`, so it is nondeterministic, matching the runner's own report).

**🔴 Caused by the merge (3 instances, 2 distinct tests):**

1. **`gt-05-water-depth.spec.ts:333` — "classic claim keeps deep water impassable while carrying equivalent depth data", desktop AND mobile.** Real, deterministic, reproduces in isolation.
2. `tile-identity-pass.spec.ts:71` — "The Claim keeps the default tile params…", **mobile only.** **NOT a regression:** it passes alone *and* passes when its own file runs whole (3 tests, 2 passed, only the pre-existing `:121` red). It only failed in the 7-file combined run — cross-file contamination in the shared worker, not the slice.

### The one real red, and its cure

`gt-05:338` asserts `expect(snapshot.tileParams).toEqual({…})` — an **exact** shape — and
`classicSnapshot` returns the raw contract `tileParams`. The slice's entire purpose is to add four
declared fields to that object, so the assertion must fail. The failure diff is **`- Expected 0 /
+ Received 40`**: purely additive, `fords` + `harvestAnchors` + `size` + `water`, with **no changed
value**.

⚠️ **But that assertion is the test's FIRST, so everything after it never ran** — the impassability,
wade-speed, enemy-segment and depth-sample assertions were all masked. A green elsewhere could not
have told us the water behaviour survived. So it was measured directly: changing that one call to
`toMatchObject` (the probe, in the scratch worktree, then reverted) makes **both projects pass, 2/2 in
28.2s**, with every previously-masked water assertion executing. The cure is one word and the slice's
behaviour is intact — but the repair had to be run to know that, not assumed.

## Merge classification

Base `b8acac28`; all six paths **LANE-TOUCHED / LANE-ONLY** (main moved none of them since the base);
no conflicts; no 3-way needed at drain time. The `main..tip` two-dot path list additionally shows
`STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json` and the master file — those are **main-moved**
(s1392's bookkeeping and this fire's lock), not lane content, and are correctly absent from
`e676addf --stat`.

## Findings

- **F-1393-1 🔴 BLOCKING (this slice) — `gt-05-water-depth:333` pins an exact `tileParams` shape that the slice deliberately widens.** Red on both projects, green on clean main, purely additive diff, cure is `toEqual` → `toMatchObject` at `:338` (measured green 2/2). The suite was outside the master's TOUCH-ONLY list, so the runner **correctly did not fix it** — it reported nothing because the master never told it to run gt-05. Corrective `e1-claim-geometry-reland-gt05-shape` queued to lane-c on top of `e676addf`.
- **F-1393-2 🟡 (process, third occurrence) — duplicate dispatch again.** `e1-claim-geometry-declared-reland` produced **two** done-moves (`…142957` and `…143528`) from one master. The second run is a pre-flight STOP costing **27,011 tokens** and zero edits, and its done-move is indistinguishable from real output by filename. Same shape as F-1392-1 (41,475 tokens) and the s1389 case. Three occurrences in five fires is a rate, not an accident.
- **F-1393-3 🟢 (correction to an inherited ruling) — lane-d was NOT "loss-free", and the right answer was reached for a slightly wrong reason.** s1392's F-1392-3 ruled lane-d resettable. Verified at line level with `lane-absorbed-lines.mjs`: 3 of the 4 held paths are fully ABSORBED, but `src/meta/ContractFamilies.ts` holds **6 of 331 added lines absent from main** (`damChannel`, `sluicesNeedWaterSource`, `slopeMax`, `waterline` and two `DECLARED_INERT_PATHS` entries). Those six are **deliberately superseded** — `reviews/lane-authored-bundle-validation-s1384-regate.md:90-99` records the s1384 graft dropping exactly those four retired vocabulary words on a measurement. So the reset was safe, but on the ground "superseded by an explicit graft decision", **not** "already absorbed". lane-d reset to main this fire; tip preserved at `archive/lane-perf-s1392-superseded-0f2544f2` (verified byte-identical to the tip before resetting).

## What the next fire does

Drain lane-c once the corrective lands. It will hold **two** commits (`e676addf` + the gt-05 fix) —
the corrective's pre-flight is written to **expect** `e676addf` rather than STOP on it (the F-1298-4
trap). The drain must merge both, then flip **two** leaves out of `blocked`/`queued`:
`e1-claim-geometry-declared` and `e1-claim-geometry-declared-reland`, per §3.0's gate-side clause —
code commit first, leaf commit immediately after (F-1384-1: a commit cannot contain its own hash).

---

# s1394 RE-GATE — VERDICT: ✅ **MERGED `a3e199f4`**

**Slice:** `e1-claim-geometry-declared-reland` + its corrective `e1-claim-geometry-reland-gt05-shape`
**Branch:** `lane/e2-arsenal` · **Tip gated:** `cc79feb1` (two commits: `e676addf` declare + `cc79feb1` tolerate) · **Base:** `b8acac28`
**Gated by:** s1394 fire in a detached worktree `gate-s1394/` per §3.0b — lane content never entered main's working tree until the merge decision was taken.

## Block-check (§3.0)

`drain-block-check` returned **rc=1, `blockClass:"gate-side"`** via the sibling leaf `e1-claim-geometry-declared`.
Per §3.0 that is a fire-recorded readiness hold, not an owner fork: evidence-gathering in a detached
worktree is the prescribed cure, and the merge becomes lawful when the same fire discharges the stated
conditions and flips the leaf. **Both conditions were re-verified by command, not inherited from s1393
(VERIFY-DON'T-INHERIT):**

| Condition (from `blockedReason`) | Command | Result |
|---|---|---|
| (1) must not sweep owner-BLOCKED `7c4f132f` into main | `git merge-base --is-ancestor 7c4f132f lane/e2-arsenal` | **rc≠0 — NOT an ancestor** |
| (1b) must not import salvage-ref `c876f675` | `git merge-base --is-ancestor c876f675 lane/e2-arsenal` | **rc≠0 — NOT an ancestor** |
| (2) lift must not fail tsc on TS2339 `lossCondition` | `npx tsc --noEmit` on the merged tree | **rc=0** |

The slice was applied as **per-commit patches**, never a branch merge — which is precisely why (1) holds.
`lane/m4` is untouched and remains the salvage-ref.

## Merge classification

Lane base is **10 commits behind main**; main moved **only bookkeeping paths** in that window
(`STATUS.md`, `tasks/*`, `reviews/*`, `logs/_s1393_*`, `goals.json`). Intersection with the slice's
7 paths: **empty**. So all 7 are **LANE-TOUCHED, zero MAIN-MOVED, no 3-way graft required** — the
one lift the master had scoped by hand (`ContractFamilies.ts`, because main moved it ~355 lines at
`cbf0e143`) was already resolved by the runner, and `cbf0e143` predates the lane base.

| Path | Class |
|---|---|
| `src/meta/ContractFamilies.ts` | LANE-TOUCHED |
| `src/world/Terrain.ts` | LANE-TOUCHED |
| `assets/contracts/epoch-1-frontier/contracts.json` | LANE-TOUCHED |
| `e2e/agent-view.spec.ts` · `e2e/fixtures/e1-mechanics-manifests.json` | LANE-TOUCHED |
| `e2e/tile-identity-pass.spec.ts` · `e2e/gt-05-water-depth.spec.ts` | LANE-TOUCHED |

Landed as a single path-scoped graft (house practice — recent drains `8e20d8ca`, `cbf0e143`,
`32cfc878` are all single-parent), citing both lane shas.

## Adjacent suites — RE-DERIVED, not inherited

s1393's set was `gt-05-water-depth`, `e2-hill-mine`, `072-era-activation` (+ the slice's own
`tile-identity-pass`, `agent-view`, `contract-bundle-validation`). I re-derived from the
**identifiers the slice introduces**, then narrowed to the actual failure class: the slice makes
`normalizeContractDescriptor` **backfill** `size`/`fords`/`harvestAnchors`/`water` from the family
template, so **runtime `tileParams` gains keys the source document lacks**. Any suite asserting
runtime `tileParams` `toEqual` a document is therefore in the blast radius. That surfaced **two
suites s1393 never ran**:

- `e2e/cp02-charter-boot.spec.ts:55` — `expect(active.tileParams).toEqual(JSON.parse(mutant.document).tileParams)`
- `e2e/cp03-press-loop.spec.ts:125` — `expect(tileParams).toEqual(JSON.parse(contractDescriptorJson(shipped)).tileParams)`

Both were added to the battery. `cp02` passes; `cp03` fails **on clean main too** (see below).

## Evidence

All runs in `gate-s1394/`, **`--workers=1`** per §3.1.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, built in 1.10s |
| `npm run test:node-guards` | **rc=0** (desk-declaration 115/115, ruling-propagation PASS) |
| Boot probes (`_s106-prospector`, `profile-first-boot`, `e10-river-boot-guard`) | **16/16 pass**, desktop + 390px, zero console errors |
| 9-suite adjacent battery — **merged tree** | **79 pass / 13 fail** / 4 skipped (6.8m) |
| 9-suite adjacent battery — **clean-main CONTROL** | **79 pass / 11 fail** / 4 skipped (7.2m) |
| `gt-05-water-depth` (the F-1393-1 blocker) | **GREEN both projects on the merged tree — cured** |

### The 2-red delta is NOT a regression — proved, not argued

Keying on **project + test title** (never line number; the slice shifts this file by 40 lines), the
merged tree adds exactly one failing title on both projects:
`tile-identity-pass` › *"The Claim keeps the default tile params and seeded flat-claim fingerprint"*.

That is exactly what a real regression looks like, and it is not one. The refutation is a **matched
whole-file control** — same file, same project, same harness, on clean main:

| Run | desktop *"keeps the default tile params"* |
|---|---|
| merged, whole file (×2) | **FAIL** |
| merged, that test alone (`-g`) | **PASS** (4.1s) |
| **clean main, whole file** | **FAIL** (as `:57`) |

Whole-file, both projects, merged vs control is then **identical by title**: desktop *"keeps the
default…"* fails in both; *"E1 contracts load…"* fails desktop+mobile in both; mobile *"keeps the
default…"* passes in both. The red is a **pre-existing contamination-sensitive determinism failure**
(`expect(second.hash).toBe(first.hash)` on re-open), surfaced by scheduling, not by this slice.
The big-run comparison alone would have mis-filed it — the same trap s1393 recorded at its own expense,
and the reason a matched control at the same resolution is worth the extra 25 seconds.

The slice's **own new test** (`:96`, *"Claim, Night Shift, and Baron declare the exact shared geometry
and reject a collapsed river"*) **passes on both projects.**

### Pre-existing reds carried (every one reproduces on the clean-main control, keyed by title)

`072-era-activation` *"fresh E1 profile stays unchanged…"* (desktop) · `agent-view` *"all five E1
mechanics manifests match their byte-stable fixture"* (both — F-1380-2) · `cp01-charter-roundtrip`
*"the epoch ships the five expected fixtures"* (both) · `cp03-press-loop` *"the Press loop: edit,
stamp, shelve, launch a real run, and return"* (both) · `e2-hill-mine` *"Hill Mine render descriptor
auto-activates mesh relief…"* (both) · `tile-identity-pass` *"E1 contracts load place descriptors…"* (both).

## Findings

- **F-1394-1 (🟡, non-blocking, NEW):** `cp01-charter-roundtrip` and `cp03-press-loop` are **red on
  clean main**, both projects. They sat outside every recent gate's derived adjacent set, so this fire
  is the first in this window to run them. **Neither red is attributable to this slice** — the control
  proves it — but neither is in the known inventory either. Recorded here rather than acted on:
  `suite-red-inventory.md` is not to be hand-edited (s1393 standing order), and a fire that discovers
  a red outside its slice should report it, not absorb it.
- **F-1393-1: ✅ CLOSED.** The gt-05 blocker is cured; verified green on both projects on the merged tree.
- **F-1381-3 / F-1381-4: ✅ CLOSED.** Both gate-side conditions discharged by command, re-derived this fire.
