# Review — e2-drip-02-pressure-garden (RE-LAND attempt, s584 fire)

**Slice/branch/tip:** drip-02 pressure-garden · salvage source `lane/e2-arsenal @1e057810` (real drip-02: contract JSON +161, spec +151, screenshots) · re-land target = fresh `main @f8efb73e`
**Verdict:** ✅ **MERGED by s586** (see "s586 LANDED" section at the bottom — the authoritative record). The s584/s585 HOLD below is kept for the investigation trail; it was superseded when the `abb584e9` audit stack became the re-land source and the F-1 count was re-derived from real test output (`3→1`, not the predicted `3→2`).

## What it does (player-visible)
Adds **"The Pressure Garden"** (`e2-pressure-garden`) — the 3rd Steamworks contract, unlocked by `secured:e2-trestle`. A geothermal terrace map: 3 boiler beds + 4 stepped terraces + one clean water band; twist `pressureEnabled:true`, secureWave 12; roster rail_tough (S) / steam_wrecker (E+W) / coal_thief (N). Teaches the pressure/coal/boiler loop (keep ≥2 boilers hot through waves 8–12).

## Evidence (what s584 actually ran — all green)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` (spec imports src) | ✓ clean |
| `npm run build` | ✓ built 656ms |
| `e2-pressure-garden.spec.ts` **desktop-chrome + mobile-chrome** | ✓ **2 passed (7.7s)** — main's generalized pressure engine + this contract produce the asserted seams `[{-12,39},{-5,43},{3,39}]`, coal=4, hotBoilers=3, objective.complete=true, run.secured=true |
| contracts.json parse | ✓ 3 contracts (hill-mine, trestle, **pressure-garden**) |

→ The contract data and spec are **correct and engine-compatible on current main**. The re-land content itself is sound.

## Findings
### F-1 (BLOCKER, needs owner/attended design answer) — board-gating muted count 3→2
`e2e/board-gating-and-profiles.spec.ts:82` `expect(mutedDots [data-contract-playable="false"]).toHaveCount(3)` → **receives 2** once the real contract is present. On clean main pressure-garden shows as a **muted upcoming-survey** dot (part of the 3); adding the real contract flips it out of the muted set.
- ⚠ **The seed (`seedProfile(page,'epoch-2-steamworks')`) has NO trestle win** (fresh profile, no scoreboard). Yet the muted count drops as if pressure-garden became **playable** — its `unlock:"secured:e2-trestle"` gate is UNMET here. The passing pressure-garden spec only unlocks it *after* `seedTrestleWin()`. So `toHaveCount(3)→(2)` is **NOT a confident blind fixture bump** — it may be masking an unlock-gate / survey-accounting interaction. **Needs attended/design confirmation of the intended fresh-epoch-2 board state before the count is changed.**

### F-2 (NON-BLOCKING, fingerprinted PRE-EXISTING — attended `172143e5` debt, NOT this slice)
On **clean main (no pressure-garden)**, these 5 already fail — proven by reverting the contract and re-running:
- `sci-04-contract-registry.spec.ts:59` — registry now lists **`epoch-4-motor` + `epoch-5-deepwater`** (added by `172143e5`); test expects only `[frontier, steamworks, voltage]`. Pure e4/e5 fixture debt.
- `sci-04-contract-registry.spec.ts:123`, `board-upcoming-surveys.spec.ts:44`, `contract-briefings.spec.ts:259`, `e2-pressure-economy.spec.ts:94` — same contract-board suite, red on clean main independent of pressure-garden.
These are the `audit-drip-data-path` paradox territory (task 647cd7a4, deleted from queue by `172143e5`). **Attended owns them.** They should go green before / alongside landing any new epoch-2 contract, so board-gating's F-1 count can be judged against a stable suite.

## Re-land recipe (for the session that lands it once F-1 has a design ruling + F-2 clears)
1. Salvage source is `lane/e2-arsenal @1e057810` — cherry-pick CONTENT only (stale base; a blind merge REVERTS `172143e5`).
2. `git checkout lane/e2-arsenal -- e2e/e2-pressure-garden.spec.ts` (new file, clean).
3. Insert the `e2-pressure-garden` contract object into `assets/contracts/epoch-2-steamworks/contracts.json` (append to `contracts[]`). **Do NOT** apply the lane's stale `-pressureEnabled:true` deletion at the hill-mine/trestle twist (main's pressure-generalize already added it).
4. Update `board-gating-and-profiles.spec.ts:82` per the F-1 ruling (muted 2 vs 3).
5. Gate: tsc + build + `e2-pressure-garden` desktop+mobile (proven green) + the F-2 five green + boot probe.
6. GZ item on merge (new playable contract = player-visible).

## Working-tree note (s584 residual — git-unstage was sandbox-gated this fire)
Left staged/untracked, RECOVERABLE, source-of-truth is the lane branch:
- `A e2e/e2-pressure-garden.spec.ts` (staged; `git reset` + `rm` were all gated for this headless fire)
- `?? artifacts/e2-pressure-garden/*.png` (untracked gate evidence)
Next fire/attended: `git reset e2e/e2-pressure-garden.spec.ts && rm e2e/e2-pressure-garden.spec.ts` (or land it per recipe). Main's **committed** tree is clean — only the STATUS lock landed.

---
## s585 ADDENDUM (2026-07-15T17Z) — F-1 RESOLVED (mechanical, no owner decision) + the AUDIT supersedes this recipe

**Everything above predates `audit-drip-data-path` (commit `abb584e9` on `lane/perf`/lane-d), which ran at 16:13 — AFTER s584's read.** VERIFIED this fire:

### F-1 is NOT a bug and NOT an owner design fork — it is a stale fixture. RESOLVED.
Traced `src/town/TownScene.ts`: muting and locking are **two independent concepts** s584 conflated:
- **`data-contract-playable` / muted dot** (`TownScene.ts:1457`) = `'boardRow' in row` — *is this a full board contract or just an `upcoming`/teaser manifest entry?* Purely structural.
- **`data-contract-locked` / Launch enabled** (`TownScene.ts:1509`, via `contractUnlock()` `:2197-2201`) = the `secured:e2-trestle` scoreboard check.

On main, pressure-garden exists ONLY as a muted teaser (`manifest.json:9`, no boardRow) → one of the 3 muted dots. The full contract (`abb584e9` `contracts.json:475`, `boardRow.unlock="secured:e2-trestle"` at `:616`) **graduates it teaser→real board dot** → muted `3→2` is **CORRECT**. And because `seedProfile(page,'epoch-2-steamworks')` seeds **no scoreboard** (no trestle win), `contractUnlock` returns `unlocked:false` → the graduated dot renders **`data-contract-locked="true"`, Launch disabled**. The unlock gate is fully enforced — on `data-contract-locked`, not on muting. s584's "may be masking an unlock-gate interaction" is DISPROVEN.
→ **Fix on land: `board-gating-and-profiles.spec.ts:82` `toHaveCount(3)→(2)`, AND add `data-contract-locked="true"` + Launch-disabled assertions for `e2-pressure-garden`** (the real correctness guard). No owner ruling required — design intent was never open (the pressure-garden spec unlocks it only after `seedTrestleWin()`; the authored `unlock:secured:e2-trestle` IS the ruling).

### The audit is the AUTHORITATIVE re-land source — use `abb584e9`, NOT stranded `1e057810`.
`abb584e9` (its own report: build PASS; incline real-data E2E desktop+mobile 1/1; pressure-garden-into-current-main desktop+mobile 1/1) holds as ONE coherent unit: `contracts.json` with **both** `e2-pressure-garden` (`:475`) + `e2-incline` (`:636`); `mask-tables/{e2-pressure-garden,e2-incline}.json` (the real masks Sol 3D-D polls, never on main before); honest board-launch `e2e/{e2-pressure-garden,e2-incline}.spec.ts`; and `artifacts/audit-drip-data-path/report.md` — the full `?contract=` data-path map (`TownScene.ts:1543`→`main.ts:163-173`→`ContractFamilies.ts:5,582-615,854-861,681-683,885-904`→`Game.ts:438`→`PressureSystem.ts:23-31`). Resolves the "grep-absent" paradox: at `647cd7a4` main genuinely lacked the data; `172143e5`'s subject over-claimed — its tree did NOT contain garden/incline data or mask tables.

**Revised re-land = drain the `lane/perf` stack (`abb584e9`←`4e3e355f`←`094761a2`)**, stale-base, per `/drain`. Lands drip-02 AND drip-03 together, masks included. Intersects F-2 (epoch-2 contract-board fixtures shift as pressure-garden/incline graduate) → land it *with* the F-2 fixture-refresh in one gated pass. Substantial deliberate stale-base drain (Mistake #15 care) — left for a fire/attended with budget, NOT forced.

### ⚠ s584 task-D "reset `lane/perf` @4e3e355f" is now DANGEROUS — DO NOT reset.
`abb584e9` (sole copy of the audit resolution + mask-tables) sits atop `4e3e355f` on `lane/perf`. A reset destroys it. s584's reset instruction predates the 16:13 audit commit (stale-reset-req-predates-lane-content). The three `lane/perf` commits ARE the drip re-land source, not garbage.

### Working-tree: s585 corrected the residual.
s585 accidentally committed the pre-staged stranded spec (non-pathspec `git commit` swept the `A e2e/e2-pressure-garden.spec.ts`), then reverted it (`f37f6412`) — that lone spec fails on main (no `e2-pressure-garden` in main's `contracts.json`). Main's committed tree is clean. The stranded 1e057810 spec is parked at `.scratch-s585/e2-pressure-garden.spec.ts.stranded-1e057810` (superseded by `abb584e9`'s honest version anyway).

---
## s586 LANDED — drip-02 + drip-03 MERGED (RE-LAND, stale-base stack drained safely)

**Verdict:** ✅ **MERGED to main.** drip-02 pressure-garden + drip-03 incline (contracts + real mask-tables + honest board-launch specs) re-landed onto current main. board-gating fixture corrected WITH its real correctness guard. The 5 F-2 reds — and 4 MORE I found in the same surface — are PROVEN pre-existing `172143e5` e4/e5 debt (baseline run this fire), left for one coherent corrective, NOT blind-bumped.

### What actually landed (RE-LAND, not a blind merge)
Source stack `lane/perf @abb584e9←4e3e355f←094761a2`, base `0b04cf13` — **122 commits behind main** (Mistake #15 territory). Per-file classification proved most of the stack is already superseded:
| File | Class | Action |
|------|-------|--------|
| `assets/contracts/epoch-2-steamworks/contracts.json` | MAIN-MOVED (main added `pressureEnabled:true` to hill-mine; lane appended 2 contracts + stale-deleted that line) | 3-way: took lane content, **re-added main's `pressureEnabled`** → diff vs main = **390 insertions, 0 deletions** (pure append of `e2-pressure-garden` + `e2-incline`) |
| `assets/contracts/epoch-2-steamworks/mask-tables/{e2-pressure-garden,e2-incline}.json` | NEW | copied from lane tip (byte-verified vs `lane/perf`) |
| `e2e/{e2-pressure-garden,e2-incline}.spec.ts` | NEW | copied from lane tip |
| `src/world/Terrain3dClaimPilot.ts` | **SKIPPED** | lane copy is STALER than main — it removes main's `onVisualHeightSourceInstalled`. `wire-landmark-mounts` (094761a2) already landed on main in a newer form. Landing the lane copy would REVERT main. |
| `e2e/terrain3d-registry.spec.ts` | **SKIPPED** | lane copy DELETES main's "Hill Mine rails resample" test. Main is newer. |
| `artifacts/wire-landmark-mounts/*`, `artifacts/*/report.md` | SKIPPED | superseded artifacts / non-gameplay |

### Evidence (all on the merged tree; scratch config `playwright.s586.config.ts`, port 5234)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✓ clean |
| `npm run build` | ✓ built 840ms (Terrain3dClaimPilot bundles with main's newer version) |
| `e2-pressure-garden` + `e2-incline` **desktop+mobile** | ✓ **4 passed** |
| `board-gating-and-profiles` **desktop+mobile** | ✓ **2 passed** (after fix) |
| combined final run (3 specs × 2 projects) | ✓ **6 passed (37s)** |
| contracts.json diff vs main | ✓ 390 insertions / **0 deletions** (additive, `pressureEnabled` intact) |
| contracts.json JSON.parse | ✓ 4 contracts: hill-mine, trestle, pressure-garden, incline |
Screenshots: `reviews/shots-e2-drip-02-pressure-garden/` (pressure-garden board + boilers-hot desktop/mobile; board-gating steamworks-profiles desktop/mobile).

### F-1 (board-gating) — RESOLVED and LANDED, with a CORRECTED count
s585 predicted muted `3→2`. **Actual received is `3→1`** (verified, not inherited): BOTH `e2-pressure-garden` AND `e2-incline` carry a `boardRow`, so BOTH graduate out of the muted teaser set (s585 forgot incline also graduates). `board-gating-and-profiles.spec.ts:82` set to `toHaveCount(1)`; **added the real correctness guard** — after clicking the graduated pressure-garden dot, assert `data-contract-locked="true"` + Launch disabled (the epoch-2 seed has no e2-trestle win, so `unlock:"secured:e2-trestle"` stays unmet). Also fixed `:92` page-count: pressure-garden is now a real navigable (locked) page, so the click navigates to its page ("8 / 12"); the gating invariant is the DENOMINATOR == playable-profile count, asserted via `/^\d+ / ${playableCount}$/` (future-era still gated out). This is a fixture the drip legitimately necessitates, guarded against the masking risk s584 feared.

### F-2 (REVISED + EXPANDED) — 9 pre-existing `172143e5` reds, PROVEN, NOT blind-fixed
Baseline this fire: reverted `contracts.json` to main's 2-contract state (clean JSON slice) and re-ran — the SAME specs fail with 2 contracts as with 4. So these are `172143e5` e4/e5 fixture debt, **independent of the drip** (my +2 contracts only shifts some received COUNTS, e.g. board total 10→12; it turns NO spec green→red). The set is broader than s585's list of 5:
- `sci-04-contract-registry.spec.ts:59` — `listEpochs()` now returns 5 (`+epoch-4-motor, +epoch-5-deepwater`); expects 3. Pure epoch-list debt.
- `sci-04-contract-registry.spec.ts:123` — locked Steamworks stub now returns FULL contract objects (+1459 lines) not `[{id:'e2-hill-mine'}]`. **Registry-loader semantics** (a fire must not rewrite this blind).
- `board-upcoming-surveys.spec.ts:44` — `contract-upcoming-e2-trestle` "SURVEY PENDING" element gone. Board-composition change.
- `contract-briefings.spec.ts:259`, `e2-pressure-economy.spec.ts:94` — same board suite.
- `072-era-activation.spec.ts:246` — `research-next-epoch` element missing (next-epoch logic vs e4/e5). `:329` — same.
- `town-t3-board.spec.ts:157` — board page-count "1 / 6" → real "1 / 12" (stale by e4/e5). `:268` — last-page memory.

These are attended-owned (`172143e5`) and span board-pagination / era-activation / registry-loader semantics — NOT count-only bumps. Blind-bumping them across an attended surface is the exact Mistake #13 masking trap. Corrective authored: **`tasks/e2-contract-board-172143e5-fixture-refresh.md`** (FIRE-AUTHORED, attended review welcome). The drip merges over them as documented, baseline-proven known-reds (§6).

### Merge classification summary
Base `0b04cf13` (122 behind). Additive to main: 2 contracts (contracts.json append) + 2 mask-tables + 2 new specs. Modified on main: `board-gating-and-profiles.spec.ts` (fixture + guard, this fire's authorship). Zero deletions to any main file. No conflict on hot files (Game.ts/CombatSystem/main.ts untouched).
