# e9-dome-basin-socket — E9CanalSystem socketed headlessly as `E9CanalSocket`

**Slice:** `lane-e9-dome-basin-socket.md` (ERA-SOCKET class #6) · **branch:** `lane/b` · **tip:** `ae9371c6a` · **base:** `6f6d17b7b`
**Merge:** `716f3e298` (`--no-ff`) · **drained by:** s1503 fire, 2026-08-07 · **authored by:** s1502 fire

## VERDICT: MERGED — all gates green, headline provably unmoved.

## What it does

`E9CanalSystem` — the Dome Basin canal: three ordered stage holds (C1/C2/C3), quarry work, persistent
stage state, canal wetting, and dust-devil displacement — previously existed only inside the browser.
This slice adds `src/sim/E9CanalSocket.ts` (93 lines), which drives that production system headlessly
in the browser's own tick order, and asserts it from the E9 census.

It is the sixth socket in this class and the first whose subject arrived **already clean**: `E9CanalSystem`
needed no presentation split (s1502 measured zero DOM hits on it and on `WeatherSystem`, its only system
dependency), so the slice adds a consumer and edits the system not at all.

**Crucially, it does NOT admit a contract.** `e9-dome-basin` still fails the support gate, and the census
headline still reads `AGENT-READY: 0 of 4`. Socketing a system and admitting a contract are two acts;
the census's own cure says "socket ... **and derive their vocabulary**", and this is one of them. The two
steps the browser runs that this socket cannot — `OldDiggerBossSystem` and `E9ArsenalSystem` — are
**counted**, not dropped, so the census can assert the gap exists rather than infer it from an absence.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (merged tree) |
| `npm run build` | **green**, built in 1.57s |
| `e2e/er01-e9-census.spec.ts --workers=1` | **8 passed** (20.4s) — 4 per project × 2 projects, exactly the count the master DERIVED |
| `test:node-guards` (F-1460-1, diff adds under `src/sim/`) | **345 tests · 342 pass · 0 fail · 3 skipped** (241s) |
| `gr-sim` Baron pin | **did not move** — `gr-sim.test.mjs` green, as the master required |
| Zero console errors | asserted in-suite (`expect(consoleErrors).toEqual([])`) and green on both projects |
| Determinism | both drives `sha256:d2cb3ebbb6df6650e02218a3787e9bd53cd0b93dec7da1e92310265c844949cf` — **byte-identical** |
| Refusal counters | 210 ticks driven → `bossStepsRefused` **210**, `arsenalStepsRefused` **210** |
| Behaviour proven | stage reached **3**, `canal.wet` true, 1 quarry harvest, **31** dust-devil shoves / **6.2** displacement |

The 3 skips are the documented fire-shell cross-engine exclusions (F-1408-2), which label themselves
"NOT coverage" in their own skip message. They are an instrument property of the fire shell, not this slice.

**Instrument note:** the runner reported `test:node-guards` at 343/345 with two timeout-precedence reds on
Node 23.11 (the lane shell). Re-run in the fire shell on Node v26.4.0 the same battery is **0 fail**. Two
shells, two answers, neither about this slice — the standing "shell + node version ARE the instrument" lesson.

### The unmoved-headline proof

`docs/bench/e9-readiness-census.md:9` still reads **`AGENT-READY: 0 of 4`**. The four `HeadlessContractSim`
throws-assertions — `e2e/er01-e9-census.spec.ts:55-59`, in the test titled
`${contract.id} census rejects the unsocketed Red Fields mechanic` — are green and **unedited**; the suite
still mints exactly one `test(...)` per contract, so the 8/8 count is unchanged from before the slice.
`SUPPORTED_CONTRACTS`, `HeadlessContractSim` and `E9CanalSystem` are untouched, as the master's firewall required.

## Merge classification

Base `6f6d17b7b`; the lane and main moved on **fully disjoint** path sets, so this was a clean `--no-ff`
merge with **no graft and no conflict resolution**.

| Path | Class |
|---|---|
| `src/sim/E9CanalSocket.ts` (new, 93 lines) | LANE-TOUCHED |
| `e2e/er01-e9-census.spec.ts` (+58) | LANE-TOUCHED |
| `docs/bench/e9-readiness-census.md` (+4/-4) | LANE-TOUCHED |
| `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-e9-arsenal-socket.md`, `tasks/lane-e9-dome-basin-socket.md` | MAIN-MOVED |
| — | BOTH-MOVED: **none** |

## Adjacent suites

The master's adjacent list named `er01-e5`, `er01-e6` and `e9-canal-stages`. **That list was perishable and
was re-derived from the tree at drain time** (`ls e2e | grep -iE "e9|canal"`), which holds **five** E9 specs,
not one. Run: `er01-e5-census`, `er01-e6-census`, `e9-arsenal`, `e9-boss-old-digger`, `e9-research-tree`,
`e9-roster` — **32 passed, 6 failed**, both projects, `--workers=1`.

All 6 failures are **pre-existing and not attributable to this slice**, established two ways rather than assumed:

- **`e9-arsenal.spec.ts` — "Cure-Arms free people and power fevered machines down without death events"**
  (2 failures, both projects). **KNOWN-RED** in `logs/suite-red-inventory.md` with a recorded blast radius of
  15/20 (75.0%) on each project. Fingerprint matches.
- **`e9-roster.spec.ts` — ":113 E9 placeholders preserve siege/thief flags and cure-arms exits" and
  ":167 plain Red Fields boot stays error-free without the debug harness"** (4 failures, both projects).
  These are **CLEAN-IN-INVENTORY**, so the ledger could not exonerate them. **Proved pre-existing by CONTROL
  RUN**: a detached worktree at the pre-merge commit `389f5181a` fails **identically** — same 4 tests, same
  two titles, both projects. Both assertions are about the **arsenal** (`e9Arsenal.eraActive` false;
  `cure.fires.terraformCannon` 0), and this slice touches no arsenal code.

## Findings

**F-1503-3 (NON-BLOCKING, needs no owner word) — `e9-roster.spec.ts` is red on main but CLEAN-IN-INVENTORY,
so the known-reds ledger cannot exonerate it and the next drain will re-pay the control run.**
`logs/suite-red-inventory.md` reports `CLEAN-IN-INVENTORY` for `e2e/e9-roster.spec.ts`, yet 4 of its tests
fail on main at both `716f3e298` and the pre-merge `389f5181a`. The reds are therefore real, unattributed,
and **invisible to the instrument built to answer exactly this question** — which cost this drain a full
control worktree to settle something a lookup should have answered in one second. Both failing assertions
concern `E9ArsenalSystem` (`eraActive` false under a plain boot; `terraformCannon` never fires), which is
suggestive: the arsenal's `enabled()` gate is `activeEpoch.order >= 9 && !multiplayerActive() && heroWeaponsEnabledFor(...)`
(`src/game/Game.ts:1355-1366`), so a plain Red Fields boot not activating the E9 era is the likelier cause
than the weapons themselves. **This is fire-authorable**: either re-run the inventory so the ledger stops
under-reporting, or file the arsenal-era red as its own finding. Recommend the inventory refresh first —
a stale exoneration ledger is worse than no ledger, because it converts "unknown" into a false "clean".

*(No finding is filed against the slice itself. It did what its master said, reported honestly, and its own
report volunteered the two gaps it left — including the DOM-clean measurement of `E9ArsenalSystem` that the
follow-on master was already authored against this fire.)*

## Duties

- **Gazette:** no item. The filter law asks whether the review names a **player-visible** change; this is a
  headless census socket with no rendering, no balance and no UI surface. Nothing to tell the family.
- **Deploy:** correctly **skipped** — `src/sim/E9CanalSocket.ts` is imported by no game code, so nothing
  gameplay-affecting merged.
- **Goal leaf:** `e9-dome-basin-socket` → `merged`, with this merge hash, in the drain bookkeeping commit.
- **Successor:** `tasks/lane-e9-arsenal-socket.md` (era-socket #7, epoch-wide) was authored earlier this same
  fire and deliberately held undispatched behind this drain — its pre-flight STEP 3 requires
  `src/sim/E9CanalSocket.ts` to exist. That predecessor gate is now satisfied by this merge.
