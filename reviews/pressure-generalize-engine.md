# Review — pressure-generalize-engine (lane-a)

- **Slice:** pressure-generalize-engine — data-drive the pressure play so any contract can opt in via `twist.pressureEnabled` (E2-drip ladder unblock)
- **Branch/tip:** `lane/m3` @ `983ed062` (runner auto-commit), base `c05e7133` (s579 lock commit; 2 behind main `d8a323c7` — those 2 commits touch STATUS.md + BACKLOG.md only, disjoint from this slice's 3 files)
- **Drained by:** s580 fire, 2026-07-15
- **Verdict:** ✅ MERGE — no-behavior-change generalization; tsc+build clean, own no-regression proof green both projects, all adjacent reds fingerprint-matched pre-existing.

## What it does
Replaces the three hardcoded `activeContract.id === 'e2-hill-mine'` pressure-play guards with a data-driven `activeContract.twist.pressureEnabled === true` flag, and sets `pressureEnabled: true` on e2-hill-mine's contract data so behavior is byte-identical for that contract. Adds the `pressureEnabled?: boolean` field to the `ContractManifest.twist` type. This lets a *second* contract (e.g. the pending E2 Pressure Garden drip) opt into the boiler/pressure/PRESSURIZE mechanic without a code change — it was the engine block the e2-drip-02 runner self-blocked on twice. NO mechanics/sim change, NO second pressure contract added here (that lands later as pressure-garden, unchanged).

The three guards generalized (`src/game/Game.ts`):
- `:904` — `PressureSystem` enabled predicate (kept `&& !this.multiplayerActive()`)
- `:3825` — `boiler_house` buildable guard (kept `&& !this.multiplayerActive()`)
- `:3918` — PRESSURIZE objective publish (no MP clause, unchanged)

## Merge classification — CLEAN GRAFT (stale base, disjoint from main-moved files)
`main..lane/m3` cumulative diff shows STATUS.md + BACKLOG.md as reverts — those are MAIN-MOVED-ONLY (s579's `a8c711e2`+`d8a323c7`), NOT carried. The commit-only diff (`983ed062` vs parent `c05e7133`) touches exactly the 3 slice files, and main's copies of those 3 files are unchanged since `c05e7133` → the graft applies with zero conflict.
| File | Class | Method |
|------|-------|--------|
| `src/game/Game.ts` | LANE-TOUCHED (+3/-3) | applied the 3 guard sub-clause swaps |
| `src/meta/ContractFamilies.ts` | LANE-TOUCHED (+1) | added `pressureEnabled?: boolean;` to twist type |
| `assets/contracts/epoch-2-steamworks/contracts.json` | LANE-TOUCHED (+1) | `"pressureEnabled": true` on e2-hill-mine twist |
Working tree verified byte-identical to `983ed062` for all 3 files before commit (`git diff 983ed062 -- <files>` empty).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (Game 590.45 kB / index 1213.51 kB, built 826ms) |
| own no-regression `e2-pressure-in-run` | **4/4 PASS** — desktop 2/2 + mobile 2/2 isolated (coal→boilers, pressure vents, PRESSURIZE completes; **boilers remain Hill Mine-only**) |
| `e2-hill-mine` + `run3d-boiler-house` | green both projects (in batch) |
| `e2-trestle` (other E2 contract, no `pressureEnabled`) | green both projects — confirms NO pressure leakage to non-opted contracts |
| boot / console | zero console/page errors (exercised by the passing full-boot pressure-in-run scenarios) |

## Findings (all non-blocking — pre-existing reds, fingerprint-matched)
- **F-1 (PRE-EXISTING, documented):** `e2-pressure-economy:94` "debug Steamworks epoch override shows pressure chip and exchange rows" fails desktop+mobile — `hud-pressure` stays `hidden` under `?debug&epoch=epoch-2-steamworks&nowaves&nolevel` (game boots epoch-1 "The Claim"). IDENTICAL fingerprint to `reviews/fix-e2-hud-pressure-pill.md` F-1 (revert-proven pre-existing there). Unrelated to this slice — the epoch override never selects e2-hill-mine, so my guard is never evaluated in that test. Corrective still owed (separate task, pre-existing).
- **F-2 (PRE-EXISTING, revert-proven this session):** `sci-04-contract-registry:59` + `:123` fail desktop+mobile — the test asserts e2-hill-mine is a *locked Steamworks stub* (written at `fcfdcd76` when it was a poster contract), but the registry now returns the full playable manifest (+764 lines: boardRow/briefing/modes — none touched here). Proven pre-existing: reverting the `pressureEnabled` line and re-running yields the IDENTICAL 2 failures with the same boardRow/briefing/modes diff. Registry-drift corrective owed separately.
- **F-3 (NOTE, not a defect):** the first batch run (4 specs × 2 projects concurrent) showed `e2-pressure-in-run` failing on both projects; re-running single-worker isolated → 4/4 green. Contention false-red under the heavy `timescale=8` sim test (documented gate-battery contention pattern). The no-regression proof is the isolated run.

## Follow-up
- Ladder now flows: next fire/attended RE-QUEUES `e2-drip-02-pressure-garden` UNCHANGED (sets `pressureEnabled: true` on the garden contract) → drip-03 → publish-e2-mask-tables.
- `lane/m3` left falsely-ahead after the graft (content on main; branch still shows `983ed062`). Verify merged-ness by content/hash, NOT `git log main..lane/m3`. The master's own SAFE-DUPE pre-flight resets lane/m3→main on its next dispatch.
- No additional pressure hardcode beyond the 3 guards (`grep e2-hill-mine src/game/Game.ts` = 0 after merge).
