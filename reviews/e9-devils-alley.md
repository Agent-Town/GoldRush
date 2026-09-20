# e9-devils-alley — A9, "the wind replans"

**Slice:** door-completion-sheet §A9 (RATIFIED 2026-08-20, owner verbatim: "Group 1: approved (with any tweaks)") · **Branch:** `worktree-agent-afb0b4a8ee24d0d5f` · **Base:** `4d2491587`

## Verdict

**MECHANIC SHIPPED AND THE DOOR IS OPEN.** The scheduled relocation runs in BOTH engines, the
public-verb prover secures wave 20 on both bench seeds twice each with byte-identical repeats, the
idle floors lose at wave 3, and `e9-devils-alley` joins the derived door. It is the FIRST A-wave
contract since A7 to be admitted rather than exempted.

**AND IT CARRIES ONE TWEAK, WHICH IS THE FINDING TO READ FIRST (F-A9-1).** The sheet's design as
literally written cannot fire on this tile — not "rarely", not "in practice": zero times, ever, by
arithmetic. The tweak is the smallest one that keeps the ratified sentence true and the mechanic
alive, and the arithmetic that forced it is below.

## What it does

Three dust devils sweep the three authored `lanes.patrolRoutes` (z −26 / 0 / +26) on the ratified
cadence — one sweep per wave, alternating routes in authored order, 20 s per crossing. A standing
work inside the column's reach and outside every anchor's hold is **lifted** (offline, undamaged),
**carried** along the route, and **set down at the sweep's end point alive**. A work inside an
anchor's hold is never taken, and every refusal is counted. Nothing here writes hp, wrecks, refunds
or gates the secure: A9 declares a hazard, not an objective, and the consumer is built so it cannot
become one by accident (F-1471-1's lesson — an undischargeable latch pins a run unsecurable
forever, so this slice adds no latch at all).

Everything is read from what the contract already declares: the routes are the authored patrol
routes, the anchors are the authored `stakeMarkers` paired to the `*-anchor-bay` buildZones that
contain them, the column's reach is `Balance.e9Canal.dustDevil.radius` (the existing Red Fields
devil's own reach — the sheet's "the dust-devil entity already exists"), and the hold radius is
`min(halfWidth, halfDepth)` of each bay. The only data this slice adds to the contract is
`harvestAnchors`, which the door needs.

## F-A9-1 — THE TWEAK, AND THE ARITHMETIC THAT FORCED IT

The sheet says: *"buildings inside the three anchor-bay buildZones are ANCHORED and immune."*
Read as a whole-rectangle immunity, **the mechanic can never fire on this tile.** Measured
2026-08-21 against the authored data, all four steps verified by reading the files:

1. **Buildings may stand ONLY inside a declared buildZone.** `Terrain.isBuildable`
   (`src/world/Terrain.ts:238–243`) answers `zones.length === 0 || zones.some(contains)`, and every
   entry in `src/game/buildables.ts` is `placement: 'bank'` or `'river-adjacent'` — both require
   `buildable`. There are exactly five legal areas on this tile.
2. **The published sweep corridors** (`mask-tables/e9-devils-alley.json`, pinned verbatim at
   `scripts/e3-mask-tables.test.mjs:364`) are z −34..−18, z −8..8 and z 18..34.
3. **The two YARDS are z −54..−42 and z 42..54.** Neither meets any corridor; the nearest gap is
   **8 world units**.
4. **The three BAYS are therefore the only buildable ground any corridor touches** — and under the
   literal reading they are exactly the ground that is immune.

Zero relocatable buildings, forever. Widening the corridors does not rescue it either: the south
corridor would need a half-width of **28** (z −54..2) to cover the south yard, which would swallow
the centre bay whole.

**THE TWEAK:** an anchor bay is anchored **by its anchor**, and the anchor's hold is the circle
**inscribed in the bay it stands in**. That is not an invented number —
`min(halfWidth, halfDepth)` of the authored bay is **8** for all three of this tile's 20×16 bays,
and each stake sits dead centre, so the hold is exactly inscribed and the **four corners of every
bay** are what the wind may take. The bays remain the shelter the briefing promises ("with
protected bays set west, center, and east"); what the wind now tests is whether you packed your
guns around the anchor or out at the bay's edge — which is the contract's own stated teaching
intent, verbatim: *"anchor what matters and adapt when the wind replans the rest."*

**This is a design decision taken under "with any tweaks" and it is reversible in one constant.**
If the owner would rather the sheet's literal rule stood, the honest consequence must be stated
with it: the consumer becomes decoration and the contract should be re-exempted, because a hazard
that can never fire is not a mechanic.

## Evidence

Battery: `artifacts/e9-devils-alley/run-evidence.mjs`, twelve runs, **every repeat byte-identical**.

| policy | seed | secured | waves | kills | sweeps | works moved | anchored refusals | event-log hash |
|---|---|---|---|---|---|---|---|---|
| public-verb, anchored fort | 01 | **true** | **20** | 928 | 19 | 0 | 652 | `fnv1a32:947390e6` |
| public-verb, anchored fort | 02 | **true** | **20** | 928 | 19 | 0 | 652 | `fnv1a32:a92b5ed1` |
| public-verb, UNANCHORED control | 01 | false | 17 | 770 | 16 | **4** | 0 | `fnv1a32:2859b0c3` |
| public-verb, UNANCHORED control | 02 | false | 19 | 883 | 18 | **4** | 0 | `fnv1a32:62c9b358` |
| idle floor (Law 2) | 01 | **false** | 3 | 55 | 2 | 0 | 0 | `fnv1a32:1a15181a` |
| idle floor (Law 2) | 02 | **false** | 3 | 53 | 2 | 0 | 0 | `fnv1a32:aa33adf0` |

**THE CONTROL IS THE POINT.** The two rows in the middle are the SAME ten works, each pushed out
of the anchor's hold (8.25 to 10.30 from the stake, every one strictly beyond the 8.00 hold) and
still inside `center-anchor-bay` — so every one of them is a legal placement. The only thing that
changed is that the anchor no longer reaches them, and the run stops securing. The wind took four
works on each seed and the fort lost the map at waves 17 and 19. That is what prices the skill:
**anchored placement is worth the run.**

**AND THE CONTROL'S FIRST DRAFT WAS WRONG IN A WAY WORTH RECORDING (caught by re-deriving the
distances rather than trusting the label).** Its seventh pad was `(0,-8)` — **exactly 8.00** from
the stake — and `anchored()` tests `d² <= r²`, so that pad was HELD, not exposed: one tenth of a
control named "unanchored" was anchored in fact. Moved to `(2,-8)` (8.246) and the whole battery
re-run; the shape is unchanged (`moved 4`, waves 17/19, kills 770/883) and only the two control
hashes moved, which is exactly what one shifted work should do. *An inclusive boundary makes
"just outside" a claim you have to compute, not eyeball.*

**THE ANCHORED FORT STANDS INSIDE THE CENTRE CORRIDOR ON PURPOSE.** All ten pads sit on the north
arc of `anchor-center`'s 8 wu hold (7.62 to 8.00 from the stake), which puts them bodily in
`center-devil-sweep`'s path — the column walks straight through the fort every third wave and takes
nothing. `refusals.anchored = 652` is that fact counted rather than asserted.

**Idle loses by ordinary pressure, and the wind is not why.** An idle run builds nothing, so there
is nothing to relocate (`moved 0`) and the devils are harmless to it; it dies at wave 3 to the
drones, exactly as every other Red Fields floor does. Law 2 holds for the honest reason.

*(Both anchored seeds report `kills=928` and `waves=20`: the wave schedule is deterministic and this
contract's roster is a single enemy kind, so the two seeds diverge only in trickle timing — which is
why the event-log hashes differ and the turn counts do (72 vs 73).)*

## Findings

**🔺 F-A9-1 (design, above) — the anchor hold replaces whole-bay immunity.** Owner-visible, one
constant to reverse, and the alternative is a decorative consumer. Recommendation: **keep it.**

**🔺 F-A9-2 (truth, non-blocking — the E7/E8/A8 precedent, unchanged).** The contract's
`engineDependencies` still names `scheduled-relocation-consumer` as `missing`, which is now false.
It is NOT edited here for the same reason A8 left its own row alone (F-A8-3):
`twist.scheduledRelocation` is in `DECLARED_INERT_PATHS` (`ContractFamilies.ts:1606`), which is what
*obliges* a non-empty `engineDependencies` at all (`:1713`), and `ContractFamilies.ts` is outside
this slice's firewall. One truth-pass master should retire the whole class at once — it now covers
`e7-dead-band`, `e6-glow-mesa`, `e9-seed-run` and `e9-devils-alley`.

**🔺 F-A9-3 (stale artifact, NOT mine alone — measured).** `artifacts/map-census/table.md` still
records **`e9-devils-alley` AND `e8-low-orbit`** as `PASS-exempt: contract unavailable`. Admission
makes both tiles fully censusable, and A7 did not regenerate the table when it admitted low-orbit
either, so this is a **two-contract class** rather than this slice's residue. `npm run census` is
the regeneration and it is ~14 minutes; it is deliberately NOT run here because the diff would mix
A7's un-regenerated rows with mine and neither would be attributable. `e2e/map-census.spec.ts`
asserts nothing per row (only `expect(CONTRACTS).toHaveLength(42)` in `afterAll`), so it is a
report, not a gate, and nothing is red because of this.

**🔺 F-A9-4 (surface, deliberate, worth knowing).** `sluice` and `assay_office` cannot be
relocated: their pools have no `moveTo` and `BuildSystem.relocateBuilding` returns false for them,
counted as `refusals.immovable`. That is not a hole on this tile — both are `river-adjacent`
placements and Devil's Alley declares `river: false` with no `waterSources`, so neither can stand
here in the first place. A future relocation map with water would need those two pools taught to
move, and this is where that is written down.

## Gates (Node 26.4.0)

All playwright runs used `playwright.a9-scratch.config.ts` — a self-booting **dev** server on port
**5276** (5279 was already taken by a neighbour; 5188 is never touched, and a *preview* server would
manufacture reds on any spec that runtime-imports `/src/*.ts`).

| gate | result |
|---|---|
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **rc=0**, `✓ built in 2.68s` |
| `npx playwright test --list` | **2932 tests / 422 files**, against a MEASURED base of **2928 / 421** (`--grep-invert "A9 (plain boot\|the wind)"` on the same tree) — **exactly the +4/+1 this slice's two tests across two projects add, and not one test lost anywhere else.** This is F-A8-7's own instrument: a both-engines module that imports render code collapses it to `Total: 0 tests in 0 files`, so the number is checked by subtraction rather than by eye. |
| battery determinism | **12 runs, every repeat byte-identical** |
| `null-floor-anchors` regen + `--check` | **67 floors match, rc=0** (65 before + this contract's 2). ⭐ **The whole regen diff is 19 insertions / 1 deletion = the git-derived `eraStamp` (`72da08d6a` → `4d2491587`, my own merge-base) plus the 18 lines of the new block. EVERY other contract's floor is byte-unmoved, which is the strongest available proof that this consumer changes nothing off its own map.** Law 2 asserted by the guard: both new rows `secured: false`. |
| door guards (`same-game-audit` ×3, `same-game-report-guard` ×3, `door-admission-ratchet`, `bench-seeds`, `null-floor-anchors`, `e3-mask-tables`, `skillmd-guard` incl. its positive control) | **45 tests / 45 pass / 0 fail**, 352.8 s |
| `e9-devils-alley-relocation`, both projects | **4/4** |
| `er01-e9-census`, both projects | **8/8** |
| adjacent (`tp02-green-waypoint`, `task-025-bandits-dont-swim`, `m1-01-claim-jumpers-death`, `m2-01-build-menu`), both projects | **38/38** |
| zero console/page errors | asserted in-spec by the shared `watchErrors`/`expectNoConsoleErrors` pair on both new browser tests; the only suppressed lines are the known `THREE.GLTFLoader: Couldn't load texture blob:` transients (F-1304-1 / F-1180-2), 4 of them on mobile |
| screenshots | `artifacts/e9-devils-alley/shots/{desktop-chrome,mobile-chrome}-plain-boot.png` (1280×800 and 390 px) |
| node-guards (full battery, run ALONE — pre/post `pgrep` bracket showed no neighbour) | **477 tests / 469 pass / 6 fail / 2 skipped**, 251.0 s, rc=1 — **all six attributed to ONE environmental cause, verified rather than inherited (below)** |
| tail guards (the `&&` chain the rc=1 short-circuits) | `test-ticker-stats` **rc=0**; `npm run test:ledger-guards` **rc=0**, `RESULT: 0 failure(s)`, `nul-audit: CLEAN` — run LAST per F-1300-4, after every ledger edit here |

**TWO OF MY OWN REDS, BOTH REAL AND BOTH THE SAME BUG — recorded rather than quietly fixed,
because the shape is reusable.** The first drafts of the browser spec and the census block put the
"sheltered" beacon at **(0, 6)**, asserted `refusals.anchored > 0`, and got **0**. The pad was
inside the anchor's 8 wu hold, so it read as a correct test — but it was also **6 wu from the
column's centre line against a column radius of 4**, so it was never a *candidate* and therefore
never *refused*. The assertion would have passed for the boring reason (nothing was ever tested)
rather than the interesting one (the anchor held). Moved to **(0, 3)**, inside both the hold and
the reach, and both specs went green. *A "safe" fixture has to be inside the hazard to prove the
shelter.*

**THE SIX BATTERY REDS ARE ONE FACT, AND I NAMED IT RATHER THAN INHERITING A8's "pre-existing".**
This git worktree has **no `node_modules/typescript`**; the repo root has one, which is why `npx
tsc` and `npm run build` both resolve here (npx walks up) and the absence is invisible to every
other gate. Four `suite-red-inventory` reducer rows die on `Cannot find package 'typescript'`;
`worker-type-coverage` spawns the hardcoded `<cwd>/node_modules/typescript/bin/tsc`; and
`fixture-teardown` fails **because** its child is `suite-red-inventory.test.mjs` — its assertion
body quotes that child's own 11-pass/4-fail run. Six symptoms, one cause, and this slice touches
zero files under `functions/`, zero reducer code and no fixture. Same six A8 recorded
(`reviews/e9-seed-run.md:141-156`). **Zero unattributed reds.**

**A THIRD RED, ALSO MINE, ALSO INSTRUCTIVE:** the census's first derivation of `admitted` used only
the door's FIRST half (`harvestAnchors.length > 0`) and reddened on **`e9-seed-run`** — which
authored anchors with A8 and is *still* refused because it carries a cited exemption. The
derivation now subtracts `CONTRACT_ADMISSION_EXEMPTIONS`, exactly as `HeadlessContractSim.ts:182`
does. Deriving half a rule is worse than listing it, because it looks derived.

## Merge classification

Base `4d2491587`. Every file below is LANE-TOUCHED only.

- **New:** `src/systems/ScheduledRelocationSystem.ts`, `src/systems/DevilsAlleyPresentation.ts`,
  `e2e/e9-devils-alley-relocation.spec.ts`, `artifacts/e9-devils-alley/*`,
  `reviews/e9-devils-alley.md`
- **Consumer seams:** `src/systems/BuildSystem.ts` (`relocateBuilding` + `moveSlot`, the one writer
  of a standing building's position — plus `LanternPostPool.moveTo`, which lives in that file),
  `src/entities/{SentryBeacon,Palisade,Stockpile,Turret,BoilerHouse}.ts` (one additive `moveTo`
  each), `src/game/Game.ts` (construct/tick/reset/mount/dispose/resample/diagnostics),
  `src/sim/HeadlessContractSim.ts` (same, plus the view row and the hash row),
  `src/agent/MechanicsManifest.ts` (one rule, sourced from the consumer), `src/vite-env.d.ts`
- **Data:** `assets/contracts/epoch-9-redfields/contracts.json` +
  `mask-tables/e9-devils-alley.json` (`harvestAnchors` only), `assets/contracts/bench-seeds.json`
  (+2), `assets/contracts/null-floors.json` (+1 contract), `scripts/door-admission-baseline.json`
  (+1), `public/skill.md` (seeds + door-contracts fences), `e2e/er01-e9-census.spec.ts`,
  `scripts/same-game-audit.test.mjs` + `docs/bench/same-game-audit.md`, `tasks/BACKLOG.md`
- **Untouched, and deliberately so:** `e9-dome-basin`, `e9-seed-run` (its exemption row is
  unchanged — the Seed Run stays exempt) and `e9-old-canal` data and behaviour;
  `src/meta/ContractFamilies.ts`; `tasks/goals.json`; `STATUS.md`.
