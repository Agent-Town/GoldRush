# A2 — `e5-stillwater`, the noise-hunt

**Slice:** door-completion sheet item **A2** (RATIFIED 2026-08-20, owner: *"Group 1: approved (with any tweaks)"*)
**Branch:** agent worktree `agent-a9e7d8321e70f7a1f` · **Base:** `b9fd6fecb`
**Date:** 2026-08-21

## VERDICT

**MECHANIC SHIPPED · MAP STILL REFUSED.** The noise-hunt consumer is live in **both** engines and
proven there. `e5-stillwater` **does not secure** — best measured public-verb play tops out at
**wave 4 of 12 on both bench seeds** — so its `CONTRACT_ADMISSION_EXEMPTIONS` row is **REWORDED,
not removed**, per Law 2 and the standing instruction for this build. This is the third instance
of the A5/A8 shape and the widest gap any of them has measured: the whole policy spread is **one
wave wide** around an idle floor of wave 3.

**Nothing was seeded, admitted, or pinned into the door.** `bench-seeds.json`,
`scripts/door-admission-baseline.json`, `public/skill.md` and `assets/contracts/null-floors.json`
are **byte-unmoved** (proved below) — F-DOOR-4 forbids advertising a run the door refuses.

---

## 0. FIRST VERIFICATION DUTY — what was DECLARED vs what I authored

The task carried a warning that a fresh probe of the `e5-stillwater` block showed
`twist = {secureWave, weather, enemyRoster}` and did **not** surface `fogZone`/`quietZones`/
`noiseSources`, and asked whether they had to be authored per the B3 precedent.

**They did not. The data is fully DECLARED — the probe looked in the wrong place.** All three
blocks live at **`tileParams.stillwater`**, not under `twist`
(`assets/contracts/epoch-5-deepwater/contracts.json`, and typed at
`src/meta/ContractFamilies.ts:659`). Read completely, it matches the sheet **exactly**:

| Sheet says | Contract declares | Match |
|---|---|---|
| fogZone, whole map | `stillwater-fog` x/z −60..60 on a 128 tile | ✓ |
| 2 quietZones | `hand-pan-drift` (x −42..−18, z 8..24), `sail-trim-drift` (x 18..42, z 8..24) | ✓ |
| air-pump r18 | `{id:'air-pump', x:-3, z:29, radius:18}` | ✓ |
| engine r24 | `{id:'engine', x:3, z:29, radius:24}` | ✓ |
| harpoon-reload r14 | `{id:'harpoon-reload', x:0, z:26, radius:14}` | ✓ |
| machine_leviathan, depth-travel, both edges | `travelClass:'depth'`, `spawnEdges:['north','south']`, gates at (0,62)/(0,−62) | ✓ |

**I AUTHORED NO CONTRACT DATA.** `assets/contracts/epoch-5-deepwater/contracts.json` is
**untouched by this branch**. Everything the sheet lists as a DEFAULT rather than a declaration —
trail-hold, emission windows, strike damage, deck integrity, watch radius — is a **consumer
constant** in `NOISE_HUNT_RULES`, which is where the sheet puts them and where the census spec's
`FORBIDDEN_SOURCE` check requires them to be.

---

## 1. What it does

`src/systems/NoiseHuntSystem.ts` (new, 273 lines) is the consumer, built to the reviewed
`FlotillaHullSystem` shape: `static create(contract, ports)` returns **null** unless the contract
declares `tileParams.stillwater`, throws on incomplete data, holds a frozen `NOISE_HUNT_RULES`,
exposes one `advance()` and one diagnostics surface.

**The three machines, each read off a seam that already existed in both engines** — no new
plumbing, so the rule is one implementation rather than two:

| Machine | Runs while | Seam |
|---|---|---|
| `air-pump` | the harvest **channel** is engaged | `HarvestSnapshot.channeling` |
| `engine` | the boat is under way after a REANCHOR | `onReanchor(at)` from each engine's lever |
| `harpoon-reload` | the deck ballista fired | `DeepwaterArsenal.diagnostics.fires.harpoonBallista` |

**The hand-pan seam is free, and that is the point.** `panAt` (the public HARVEST verb) restores
the channel state it borrows, so a hand pan never sets `channeling` — the sheet's *"hand-pan =
harvest without pump noise"* falls straight out of the existing code rather than needing a flag.

**The machines ride the anchor.** Each declared source position is authored against the boat's
*initial* anchor, so the **offset** is what is real — exactly as deck buildings ride it
(`ClaimBoat.snapshot`: *"world position = anchor + pad offset"*). This is not bookkeeping: the
contract's second anchor, **`open-water` (−24,12), lies INSIDE the declared `hand-pan-drift`
quiet zone**, so REANCHOR — an existing public verb — is the map's own way to take the whole boat
silent. A source whose world position sits in any declared quiet zone emits nothing.

**The trail** is a two-state machine over declared radii: a running, unsilenced source is as loud
as it reaches (`level = radius`); the loudest audible one is trailed; **ties break by declared
order, never iteration order**, so the determinism hash cannot move. When everything falls silent
a quiet clock runs and the trail is dropped after `trailHoldSeconds` — the sheet's 8 seconds.

**Steering reuses the existing archetype and adds no AI**: `Enemy.scriptMoveTo`, the same call
`DeepwaterSocket` already makes for corsairs. Release is the entity's own zero-point route
(`scriptMoveRoute([])` → `scripted = false`), which hands the head back to ordinary pursuit.

**The strike can never touch the hero — structurally, not by tuning.** It only reduces deck
integrity, and a knocked-out deck leaves through the tile's existing `loseHull(padId)` seam, the
same one the Flotilla uses. The hero's danger on this map is the ordinary contact the leviathan
already carries, resolved where it has always been resolved, in `CombatSystem`. **Law 4 intact:
this system writes no damage.**

**The fog is presentation-thin and published, with NO steering effect, and that is a decision I
am flagging rather than burying.** The sheet asks for *"watch radius capped; render haze"*, and
the system caps and publishes `watchRadius` for riders and the render side. It does **not** cap
what the leviathan can find, because an untrailed leviathan that cannot see would make a
**silent** run — which is exactly what an idle run is — **safer** than a played one, and Law 2
forbids shipping that blind. The fog shrouds the eye of the reader, not the ear of the hunter.

---

## 2. The gates — third widening, and one thing the data forced

`DeepwaterClaimTile` and `DeepwaterSocket` were widened for `e5-stillwater` following the
Regatta/Flotilla pattern. Two things did **not** follow the pattern and both are declared-data
consequences, reported rather than stretched:

**(a) The corsair archetype is now required only where corsairs are DECLARED.** The tile demanded
a boat-class roster entry unconditionally. `e5-stillwater` authors `corsairWaveSize: 0` and a
single depth-travelling `machine_leviathan`, so the old gate would have refused the contract for
lacking a thing it deliberately declares none of. The requirement is now
`corsairWaveSize > 0 && !corsair → throw`, and `corsairsFor` still refuses a wave it cannot crew.
**No admitted contract's path changes** (all three declare `corsairWaveSize: 3`).

**(b) The storm track is the clock only where it CREWS a wave** — new
`deepwaterStormDrivesWaves(contract)`, seated identically in both engines at the two coordinates
that previously keyed on `deepwaterClaim !== null`:

| | before | after |
|---|---|---|
| `HeadlessContractSim.ts` wave clock | `deepwater?.diagnostics.corsairWaves ?? waves…` | gated on `deepwaterStormDrivesWaves` |
| `HeadlessContractSim.ts` `scheduledDisabled` | `deepwater !== null` | `… && deepwaterStormDrivesWaves` |
| `Game.ts:5823` wave clock | `deepwaterClaim ? corsairWavesSpawned : …` | gated on `deepwaterStormDrivesWaves` |
| `Game.ts:1387` `scheduledDisabled` | `deepwaterClaim !== null` | `… && deepwaterStormDrivesWaves` |

**Why this was not optional.** `e5-stillwater` authors its weather as `cycleSeconds: 3600`,
`stormSeconds: 0.25`, `hazeStrength: 0` — a **suppressed** storm — and `corsairWaveSize: 0`.
Reading `corsairWaves.length` as the wave there freezes the run at **wave 0 forever** and makes
its own `secureWave: 12` unreachable by construction. The contract confirms the other reading
itself: `lanes.spawnEdges: ['north','south']` and per-variant `spawnGates` are consumed **only**
by the ordinary `WaveSystem`, and are meaningless on a storm-clocked map (the three admitted ones
declare lanes that are never read). `replacesScheduledWaves` in the `deepwater_storm_track`
manifest rule now reports this honestly — `true` for the three admitted contracts (**byte-
unchanged**), `false` for Stillwater.

---

## 3. Evidence

All runs via `artifacts/e5-stillwater/prover.mjs` — public grammar only (BOAT_BUILD, REANCHOR,
HARVEST, HOLD, PICK_UPGRADE, SECURE_CHOICE), driven in-process through `boot.admissionProbe`
exactly as the A8 Seed Run prover is, so the evidence for an exempt contract stays re-runnable.
Battery: `artifacts/e5-stillwater/run-evidence.mjs` — **14 cases × 2 runs, every repeat
byte-IDENTICAL**; logs and `summary.json` preserved beside it per the retention law.

The directory carries **43 files**, which is more than the current battery emits: the first
pass used a different case set (`deck-three-beacons-silent-*`, `drift-three-beacons-*`) before
the `--harvest` premise separated the pump from the hand-pan and made the ceiling reachable.
Those logs are **kept, not pruned** — §4 10b. They are also the record of *how* the ceiling was
found, which is the part a later reader would otherwise have to re-derive.

| Policy | seed 01 | seed 02 | strikes | note |
|---|---|---|---|---|
| **deck gun,beacon,gun · harvest=off** | **wave 4** `fnv1a32:e83bc5ff` | **wave 4** `fnv1a32:96191e05` | 18 | **the ceiling**; all 3 decks lost |
| deck gun,gun,gun · harvest=off | wave 4 `fnv1a32:3c63c370` | wave 4 `fnv1a32:9f3d48b4` | 18 | gun choice is worth nothing |
| deck 3×beacon · harvest=off | wave 3 `fnv1a32:1ce4abec` | wave 4 `fnv1a32:ec8b01d8` | **0** | **total silence — decks all 96** |
| deck gun,beacon,gun · harvest=on | wave 3 `fnv1a32:86e8ab0d` | wave 2 `fnv1a32:23fdfac0` | 11 | panning is a net LOSS |
| quiet (run for quiet water on trail) | wave 1 `fnv1a32:7824db70` | wave 1 `fnv1a32:98e18e8c` | 1 | guns leave the hero |
| drift (stay in quiet water) | wave 0 `fnv1a32:abd27ca9` | wave 1 `fnv1a32:5a1ded5f` | 0 | guns never defend |
| **IDLE FLOOR** | **wave 3** `fnv1a32:824cf81d` | **wave 3** `fnv1a32:5291107a` | **0** | **unsecured — Law 2 holds** |

**The idle floors are honest and I checked the mechanism the task asked me to check.** The
prediction in the task was right: idle runs **no** machine, so the hunt never takes a trail and
never strikes (`trail: null, strikes: 0` on both seeds). It still **loses**, at wave 3, to the
ordinary `machine_leviathan` pressure the contract's own spawn edges field. So the floor is
honest **without** the new mechanic — which is what makes the mechanic's own cost measurable.

**Emission is attributable, not asserted.** The total-silence row is the control: no turret and
no HARVEST order records **strikes 0 with every deck at 96**. Every strike in every other row is
therefore caused by a machine the rider chose to run.

**Gates run:** `tsc --noEmit` clean · `npm run build` green (1.46s) · **30/30 desktop-chrome**
across `e5-stillwater-noise` (4, new) + `er01-e5-census` (4) + `e5-flotilla-hulls` (3) +
`e5-regatta-race` + `task-025-bandits-dont-swim` + `m1-01-claim-jumpers-death` +
`m2-01-build-menu` — every adjacent **unmodified and green**. Mobile-chrome (390px) pass over the
same seven specs. Scratch config `playwright.a2stillwater.config.ts` on port **5275** (default
5188 and the A3 scratch 5273/5274 untouched; two sibling agents, lane-a, and a live fire were all
running). Zero console/page errors; the plain `?debug&contract=e5-stillwater` boot resolves and
publishes the hunt in the browser's own diagnostics.

**Node guards** (quiet board, `pgrep -f run-node-guards` empty before the run):
`same-game-audit.test.mjs`, `same-game-report-guard.test.mjs`, `door-admission-ratchet.test.mjs`,
`bench-seeds.test.mjs`, `skillmd-guard.test.mjs` → **20 pass / 0 fail**, including every count
pin and the skill.md positive control. `gr-sim.test.mjs` re-run **solo → 17 pass / 0 fail / 0
cancelled**; its two reds under load were starvation, attributed in §5 (F-A2-2).

**Perf.** No other contract pays anything — `NoiseHuntSystem.create` returns null everywhere
`tileParams.stillwater` is absent, which is every contract but this one. On Stillwater the hunt
costs one extra `tile.snapshot()` per tick plus one integer read: the ballista counter is taken
through a new `DeepwaterArsenal.harpoonShots` accessor rather than `diagnostics`, which would
have allocated a bounded event array and five objects thirty times a second for one number.
**All 28 evidence hashes re-measured byte-identical after that refactor**, confirming it is a
pure read-path change.

---

## 4. The pins — measured, and what did NOT move

| Surface | State | Proof |
|---|---|---|
| `scripts/door-admission-baseline.json` | **byte-unmoved** | `git status --short` empty; `door-admission-ratchet.test.mjs` green |
| `assets/contracts/bench-seeds.json` | **byte-unmoved** | ditto; **deliberately unseeded** per F-DOOR-4 |
| `public/skill.md` | **byte-unmoved** | ditto; all 4 fences green incl. positive control |
| `assets/contracts/null-floors.json` | **byte-unmoved** | ditto |
| `docs/bench/same-game-audit.md` | regenerated | see below |
| `scripts/same-game-audit.test.mjs` | **byte-unmoved** | every count pin already true |

**The audit's count pins did not move and did not need touching**: `agent-exceeds 0 ·
agent-lacks 463 · equal 977 · not-offered 6`, `7 cited exemptions`, `Final derived door (29)`
— all re-measured verbatim after the change. Stillwater stays out of the door, so the door does
not move. (F-2084-1's warning about two lanes writing identical-looking pin arithmetic does not
apply: I changed no pin.)

`docs/bench/same-game-audit.md` was regenerated with `node scripts/same-game-audit.mjs
--write-report`. The diff is large (872±) but **the only non-coordinate change is the
`e5-stillwater` exemption row** — verified by filtering `.ts:<line>` out of the diff, which
leaves exactly two lines, the old reason and the new one. The rest is live `file:line` evidence
coordinates rotting because this branch adds lines to `Game.ts`, `HeadlessContractSim.ts` and
`MechanicsManifest.ts`. That is the audit working as designed.

**`node scripts/null-floor-anchors.mjs --check` → 1 difference, and it is NOT mine.** Every one
of the **65 contract × seed rows re-derived identical**, including all deepwater / regatta /
flotilla rows — so this branch causes **zero** gameplay drift for the 27 admitted contracts. The
single difference is the envelope's `eraStamp`: `pinned="1817cb273" derived="b9fd6fecb"`.
`1817cb273` is the **A3 echo-canyon drain**, a verified ancestor of this branch's base, and three
later main commits touched `null-floors.json` without refreshing the stamp. The stamp is computed
from `git merge-base` **alone** and is independent of every source edit here, so `--check` was
already red for it on main before this branch existed. **Not regenerated on purpose**: writing
this worktree's stamp would move a file that must stay byte-unmoved and would pin the wrong base
for main. → **F-A2-1**.

---

## 5. Findings

**F-A2-1 (non-blocking, ops).** `assets/contracts/null-floors.json`'s `eraStamp` is stale on
**main** (`1817cb273`, the A3 drain), so `null-floor-anchors.mjs --check` reports one difference
on any tree at a later base, unrelated to that tree's changes. Every data row is correct. The
next drain that legitimately regenerates the floors clears it; regenerating it from an agent
worktree would pin a branch-local base and is the wrong cure. No corrective task — it self-heals
on the next admission.

**F-A2-2 (non-blocking, tooling — RESOLVED BY RE-RUN, recorded for the class).**
`scripts/gr-sim.test.mjs` went red **twice under load and green solo**, and both reds were the
starvation class rather than the tree:

1. In a 6-file `node --test` batch, *"overtime banks the Claim secure…"* **cancelled** on its
   240 s inner timeout.
2. Solo but concurrent with this branch's own 28-run evidence battery **and a live fire**
   (`claude -p`, pid 26423), it failed at `gr-sim.test.mjs:122` — which is
   `assert.equal(first.status, 0)` on an `e4-long-road` child spawned with `timeout: 30_000`.
   A `spawnSync` timeout returns non-zero, so the assertion reports a **starved child**, not a
   logic failure. The error text (`actual: 1, expected: 0`) looks identical to a real red.

On a verified-quiet board (my side idle; only the fire outside) it is **17 pass / 0 fail / 0
cancelled**. Nothing in this branch touches that path: `the-claim` and the E4 contracts have no
`tileParams.deepwater`, so both re-gated coordinates take the identical `waves.diagnostics.wave`
branch they took before. **Do not run a `spawnSync`-with-timeout suite beside a vite battery.**

Worth recording separately: `gr-sim.test.mjs:95–102` **directly guards this branch's central
decision** — it asserts `gr-sim --contract e5-stillwater` exits non-zero with
`/AP-07 supports only …/`. It is green, so the reworded exemption really does still refuse the
contract by name at the door.

**F-A2-5 (found in self-review, FIXED before gating — recorded because the class is worth
keeping).** `Game.resetRun` resets `deepwaterClaim`, `regattaRace`, `flotillaHulls` and
`deepwaterArsenal`; my `noiseHunt` was **not** in that list. `deepwaterClaim.reset()` restores
pads a strike knocked out, so a hunt holding a stale integrity map would have **re-lost a
restored pad on the first strike of the next run**, and carried the previous run's trail, strike
count and shot counter across the boundary. Fixed at the same site (`Game.ts`, beside its
siblings). `HeadlessContractSim` has no reset path — each run constructs a fresh sim — so nothing
was owed there, which matches `RegattaRaceSystem`/`FlotillaHullSystem`. **The class: a new
per-run system must be added to the reset list in the same commit that adds it, and "does the
sibling system appear there?" is the check that finds it.**

**F-A2-3 (design, OWNER'S DESK).** **The map's geometry refuses the mechanic its own best use.**
Both anchors are extremes: `lagoon` (0,30) sits **ON** the hero, so every machine that runs is
loud exactly where the hero stands; `open-water` (−24,12) sits **INSIDE** `hand-pan-drift`, so it
silences everything **and** carries the guns 20wu off the body they defend. There is no third
station where noise is loud **away** from the hero, so the trail can be **paid for** or
**avoided** but never **aimed** — the decoy play the sheet's design implies is unreachable on the
declared anchor set. Related: `sail-trim-drift` (x 18..42) has **no anchor at all**, so of the two
declared quiet zones only one is reachable by the boat. **Cheapest fix if the owner wants the
decoy play: one more `claimBoat.anchors` entry outside both quiet zones and away from (0,30)** —
a data edit, no code. I did not make it: adding an anchor is contract authoring, and the
declared data was complete.

**F-A2-4 (design, OWNER'S DESK).** **Stillwater takes a land map's wave pressure with a
Deepwater map's defensive vocabulary.** Because the storm is suppressed, the ordinary schedule is
the clock and fields ~15 `machine_leviathan` per wave from two edges; but a Deepwater contract
refuses all land building, so a rider's entire defence is **three deck pads** and the hero cannot
walk (slot 0 on IDLE_INTENTS). The whole measured policy spread is **one wave wide** — public
play barely beats doing nothing — which says the gap is not a play the prover failed to find.
Options, cheapest first: (a) declare a small `corsairWaveSize`-style wave-size reducer or a
`waveMin` ramp for the leviathan; (b) give the Claim-Boat more pads; (c) accept the map as a
short, atmospheric loss and lower `secureWave`. **All three are owner calls** — every one changes
declared difficulty, which §7.3 puts on the desk, and the standing order for this build was
explicitly *no balance edits to existing values*.

---

## 6. Merge classification

Base `b9fd6fecb`. **All files LANE-TOUCHED; no MAIN-MOVED file, no conflicts.**

| File | Change |
|---|---|
| `src/systems/NoiseHuntSystem.ts` | **new** — the consumer |
| `src/world/DeepwaterClaimTile.ts` | gate widened; conditional corsair archetype; `deepwaterStormDrivesWaves` |
| `src/sim/DeepwaterSocket.ts` | hosts the hunt; `reanchor(id, at)`; `noiseHunt` diagnostics |
| `src/sim/HeadlessContractSim.ts` | exemption **reworded**; pan-channel port; both wave-clock gates |
| `src/game/Game.ts` | the hunt seated on the same readings; both wave-clock gates; published; run-reset |
| `src/entities/DeepwaterArsenal.ts` | **+1 accessor** `harpoonShots` (additive; no behaviour) |
| `src/agent/MechanicsManifest.ts` | `noise_hunt` rule from the consumer; honest `replacesScheduledWaves` |
| `e2e/e5-stillwater-noise.spec.ts` | **new** — mechanic, ceiling, idle floor, plain boot |
| `e2e/er01-e5-census.spec.ts` | new `SOCKETED_BUT_REFUSED` state |
| `playwright.a2stillwater.config.ts` | **new** — scratch config, port 5275 |
| `artifacts/e5-stillwater/*` | **new** — prover, battery, 28 logs, `summary.json` |
| `docs/bench/same-game-audit.md` | regenerated |
| `tasks/BACKLOG.md` | the row |

**`assets/contracts/epoch-5-deepwater/contracts.json` is NOT in this list** — no contract data was
authored or edited.

`e2e/er01-e5-census.spec.ts` gains a third state because A2 breaks an equivalence the census
relied on. Before this, every refused E5 contract was refused **because** nothing socketed it, so
`socketRules === []` and `DeepwaterSocket.create() === null` were fair proxies for *"no
consumer"*. Stillwater is socketed **and** exempt. Keeping the old proxies would have forced a
choice between deleting a working consumer and lying about the door.
