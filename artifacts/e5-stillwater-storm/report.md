# e5-stillwater-storm — STOPPED ON THE MASTER'S OWN HONESTY GUARD (lane/c, Claude implementer, 2026-09-05)

**Verdict: NO CODE SHIPPED. The master's no-op/honesty guard fired, and it fired correctly.**
Master: `tasks/e5-stillwater-storm.md`, final clause — *"If the quiet objective and a storm wave
cannot coexist in the sim without a scheduler change (name the line), STOP and report the fork."*

They cannot. The scheduler change is named below at file:line, it lives in files this master's
firewall excludes, and **both** of the routes that ARE inside the firewall were measured breaking a
shipped law — on both bench seeds, deterministically, not as a judgement call. The tracked tree is
byte-identical to `main@7dc8672f0`; the engine hash is unmoved.

---

## 1. What the audit asked for, and what the code actually allows

Audit row (`docs/audits/2026-09-02-era-mechanic-audit.md:37`) and its smallest-slice line (`:78`):

> `e5-stillwater` — schedule at least one adversarial weather-triggered wave without removing its
> quiet/noise objective.

Three facts, each read in the file rather than inferred:

1. **A storm front carries a wave only through `corsairWaveSize`.** `DeepwaterClaimTile.corsairsFor`
   is `Array.from({ length: this.deepwater.corsairWaveSize }, ...)`
   (`src/world/DeepwaterClaimTile.ts:158`). At Stillwater's authored `corsairWaveSize: 0`
   (`assets/contracts/epoch-5-deepwater/contracts.json:348`) every front is crewed by nobody. There
   is no second seam: `DeepwaterSocket.spawnCorsairs` iterates `wave.enemies` only
   (`src/sim/DeepwaterSocket.ts:243-268`).
2. **`corsairWaveSize > 0` also switches the run's whole wave clock off.** The single shared
   predicate is

   ```ts
   // src/world/DeepwaterClaimTile.ts:177-179
   export function deepwaterStormDrivesWaves(contract: ContractManifest): boolean {
     return (contract.tileParams.deepwater?.corsairWaveSize ?? 0) > 0;
   }
   ```

   It is the `scheduledDisabled` port in BOTH engines — `src/game/Game.ts:1494` and
   `src/sim/HeadlessContractSim.ts:1087` — and `WaveSystem.update` **returns early** on it
   (`src/systems/WaveSystem.ts:293-296`): no wave planning, no pulses, no trickle.
3. **Stillwater's only pressure is generic-schedule pressure.** Its roster is a single
   `machine_leviathan` (`contracts.json:387-406`), and that variant is exactly what the noise-hunt
   steers (`NoiseHuntSystem.steer` bails on `if (!leviathanVariantId) return;`,
   `src/systems/NoiseHuntSystem.ts:324-325`). The shipped e2e already states this in words —
   *"the run still ends at wave 3, killed by the ordinary leviathan pressure the contract's own
   spawn edges field"* (`e2e/e5-stillwater-noise.spec.ts:267-269`).

So (1) + (2) + (3): the ONLY authored key that makes a front carry a wave is also the key that
deletes the only pressure the quiet objective consumes. **That is the fork.**

## 2. The fork, measured on both bench seeds (not argued)

Two probes, each a contract-data-only mutation applied to `e5-stillwater` and reverted immediately.
Both use the era's own already-shipped cadence copied verbatim from the three EXERCISING E5 maps
(`cycleSeconds 24 / clearSeconds 5 / telegraphSeconds 3 / stormSeconds 10 / 0.72 / 0.58 / 0.28`,
`contracts.json:81-88`), so no new balance number is invented anywhere in this experiment.

The instrument is preserved and re-runnable: `artifacts/e5-stillwater-storm/probe.mjs`
(`node artifacts/e5-stillwater-storm/probe.mjs assets/contracts/epoch-5-deepwater/contracts.json unsuppressed|crewed`),
following the `artifacts/e5-stillwater/prover.mjs` precedent.

| | P0 baseline (shipped) | P1 `corsairWaveSize: 0`, storm un-suppressed | P2 `corsairWaveSize: 3` + boat archetype |
|---|---|---|---|
| Fronts in a ride (`now.deepwater.storm.waves`) | **0** | 5 (idle), 12 (played) | 12 |
| Corsairs the fronts carried | 0 | **0** | **36** (30 recycled at exit) |
| Generic spawns (`now.threats.spawnedTotal`, idle) | 62 | 62 | **0** |
| Leviathan pressure / noise-hunt | live | live | **inert** (`trail.target: null`, `strikes: 0`) |
| Law-2 idle floor | `secured:false, waves:3` OK | `secured:false, waves:3` OK | **`secured:TRUE, waves:12`** BROKEN |
| Played secure | wave 12 @ 360000 ms OK | **wave 9 @ 272000 ms** BROKEN | wave 12 @ 272000 ms, kills 97->26 BROKEN |

**P1 breaks the SECURE rule.** `DeepwaterSocket.advance` emits a `wave_started` for **every** storm
front regardless of whether the storm is the run's clock (`src/sim/DeepwaterSocket.ts:137`;
browser twin `src/game/Game.ts:6068`), and `RunManager` secures on that number
(`src/game/RunManager.ts:104-108`, `this.maybeSecureRun(event.wave)`). Storm cycle 12 lands at
`scheduledAt: 272` (= 5 + 3 + 11 x 24), so the run secures **three waves early, at exactly
272000 ms, on both seeds**. Un-suppressing the storm alone — entirely inside this master's
firewall, one JSON block, zero code — silently makes Stillwater easier to win.

**P2 breaks the quiet objective and the Law-2 floor.** The front does carry an adversarial wave
(36 corsairs, 12 fronts) — and the generic schedule is dead, so zero `machine_leviathan` ever
spawns, the noise-hunt never takes a trail or lands a strike, and an **idle** run now secures at
wave 12. The mechanic the map exists to teach is switched off in order to switch the era's mechanic
on. That is the audit's "without removing its quiet/noise objective" clause, violated literally.

### The front and its wave, in the event evidence

From `probe-P2-crewed-idle-01.log` (last view, `now.deepwater`):

```
storm.weather : {"era":5,"contractId":"e5-stillwater","phase":"storm","cycle":11,
                 "simTime":272.0000000000007,"movementMultiplier":0.72,
                 "visibilityMultiplier":0.58,"hazeStrength":0.28}
front[0]      : {"wave":1,"cycle":0,"scheduledAt":8,"direction":"west-to-east","fromX":-64,"toX":64}
front[11]     : {"wave":12,"cycle":11,"scheduledAt":272,"direction":"west-to-east","fromX":-64,"toX":64}
corsairWaves  : 12   corsairsSpawned: 36   corsairsRecycledAtExit: 30
```

From `probe-P1-unsuppressed-idle-01.log` — the front exists and is published on `now` in exactly the
shape the other E5 maps use (no new field shape), but crews nobody:

```
storm.waves : 5   frontX: -37.5466...   phase: "storm"
corsairWaves: 5   corsairsSpawned: 0
threats     : {"alive":20,"spawnedTotal":62,"defeatedTotal":42}   <- generic schedule still the clock
```

## 3. The scheduler change that is actually owed (named, and out of firewall)

The corrective needs the conflated predicate SPLIT — "the storm crews a wave" is not the same
question as "the storm REPLACES the generic schedule" — plus a matching decision about the socket's
`wave_started` emission. Concretely:

| # | File:line | What it must become | In this master's firewall? |
|---|---|---|---|
| A | `src/world/DeepwaterClaimTile.ts:177-179` | `deepwaterStormDrivesWaves` keyed so a map that declares its own hunt (`tileParams.stillwater`) can crew a storm wave WITHOUT disabling `WaveSystem`. Shared by both engines, so parity is free. | **NO** - not in TOUCH-ONLY |
| B | `src/sim/DeepwaterSocket.ts:137` (+ browser twin `src/game/Game.ts:6068`) | Emit `wave_started` for a storm front only where the storm IS the clock; otherwise the front must not feed `RunManager.maybeSecureRun`. | **NO** - firewall says *"NO changes to `DeepwaterSocket.ts` behaviour"*, and `Game.ts` is not listed at all |
| C | `assets/contracts/epoch-5-deepwater/contracts.json` (`e5-stillwater`) | era cadence + `corsairWaveSize` + a boat archetype | yes |
| D | `src/sim/HeadlessContractSim.ts:1087` | the scheduler selection | yes, but **useless alone** |

D is the line the master licenses, and editing D alone is the one thing that would have been
actively wrong: its browser twin (`Game.ts:1494`) reads the same shared function, so a headless-only
override diverges the two engines and breaks the both-engines-agree law by construction.

Also owed by any such corrective, because they pin the current numbers:
`e2e/e5-stillwater-noise.spec.ts:185-186, 212-213, 253-254` (six hashes),
`scripts/null-floor-anchors.mjs`'s generated idle floor, `assets/engine-era.json` (a content-only
same-era re-pin), and `docs/audits/2026-09-02-era-mechanic-audit.md:37` (RESKIN -> EXERCISES).

**Recommendation for the successor master:** widen TOUCH-ONLY to A + B + the browser twin, keep the
`NO` on `StormWaveScheduler.ts`, the other three E5 maps and `Balance.ts`, and require the P0/P1/P2
table above to be reproduced green (idle floor still `waves:3`, played secure still wave 12 at
360000 ms, noise-hunt strikes still 76-77) alongside the new `storm.waves >= 1` with a non-empty
crew. `probe.mjs` re-runs the whole experiment in one command.

## 4. Changes made in this lane

| File | Change |
|---|---|
| `artifacts/e5-stillwater-storm/*` | evidence only: 10 ride logs, 3 hash tables, 5 gate logs, `probe.mjs` |
| `tasks/BACKLOG.md` | one open `F-E5STORM-1` row recording the fork and the owed corrective |
| - | **zero** changes to `src/**`, `assets/contracts/**`, `e2e/**`, `specs/**` |

Tracked-tree proof: `git diff 7dc8672f0 --stat` (the base this lane was cut from) is exactly the
seventeen files above — sixteen under `artifacts/e5-stillwater-storm/` plus one added `BACKLOG`
line, 8867 insertions, zero deletions, and not one byte under `src/`, `assets/contracts/`, `e2e/`
or `specs/`. The engine hash re-derived from `ENGINE_SOURCE_INPUTS` is
`3d0f567dd4cab4f9a643d88d293e2fa00db2e666e3cea3a3d646eb9a0baadb58` — byte-identical to the banked
`assets/engine-era.json` value. No pin is owed.

Note for the drain (verify-don't-inherit): `main` advanced by two unrelated commits DURING this
session (`6c7b11184` gauntlet-heat11, `2ba7a9f3d` heat-11 docs), so `lane/c` is two behind. Neither
touches E5 or `ENGINE_SOURCE_INPUTS`; a plain diff against live `main` will therefore also show
their `assets/rotations/winnability-receipts.json` and `public/skill.md` edits, which are NOT this
lane's work.

## 5. The both-engine hash table

Nothing in either engine moved, so every shipped hash must reproduce. All six were re-measured this
session through `artifacts/e5-stillwater/prover.mjs` and every one matches its pin in
`e2e/e5-stillwater-noise.spec.ts`:

| Arm | Door | Seed | Measured `eventLogHash` | Pinned at | Match |
|---|---|---|---|---|---|
| secure (bait) | plain (`scripts/gr-sim.mjs`) | `e5-stillwater-01` | `fnv1a32:f9967071` | spec:185 | yes |
| secure (bait) | plain | `e5-stillwater-02` | `fnv1a32:8fb9ae74` | spec:186 | yes |
| secure (bait) | in-process | `e5-stillwater-01` | `fnv1a32:be2e0c63` (77 strikes, `starboard:turret:57`) | spec:212 | yes |
| secure (bait) | in-process | `e5-stillwater-02` | `fnv1a32:201e03cd` (76 strikes, `starboard:turret:60`) | spec:213 | yes |
| idle floor | plain | `e5-stillwater-01` | `fnv1a32:91a34a6a` | spec:253 | yes |
| idle floor | plain | `e5-stillwater-02` | `fnv1a32:bd5a9d8f` | spec:254 | yes |
| audit ride | plain, `--policy idle` | `e5-stillwater-01` | `fnv1a32:e323e4fa` | audit:37 | yes |

**Browser side.** This repo's browser engine computes no run hash of its own — `eventLogHash` is
`HeadlessContractSim`'s (`src/sim/HeadlessContractSim.ts:1326`); browser agreement is realised by
replaying a headless tape IN the browser (`src/game/Game.ts:7370`,
`e2e/assay-replay-roundtrip.spec.ts:73`). Since no engine byte moved, the browser is proven here by
`e2e/e5-stillwater-noise.spec.ts:276` (plain boot, both projects, zero console errors) plus the
identical engine hash. Raw: `hash-table-baseline.log`, `hash-table-P1.log`, `hash-table-P2.log`.

The probe hashes, recorded so the fork is re-checkable rather than re-argued:

| Arm | Seed | P1 (un-suppressed) | P2 (crewed) |
|---|---|---|---|
| secure (bait, plain) | 01 | `fnv1a32:8ed4758e` (w9 @272 s) | `fnv1a32:ced68166` (w12 @272 s, kills 26) |
| secure (bait, plain) | 02 | `fnv1a32:032c3354` (w9 @272 s) | not run (see section 7) |
| idle (plain) | 01 | `fnv1a32:9b7be873` (w3, correct) | `fnv1a32:ca6bc1f8` (**w12 SECURED**) |
| idle (plain) | 02 | `fnv1a32:8f98923e` (w3, correct) | `fnv1a32:87b86825` (**w12 SECURED**) |

## 6. Gates - every exit code, as measured

| # | Gate | Command | Exit | Notes |
|---|---|---|---|---|
| 1 | tsc | `npx tsc --noEmit` | **0** | clean |
| 2 | build | `npm run build` | **0** | `built in 2.35s`; asset-diet ran |
| 3 | node guards (lane) | `npm run test:node-guards` | **1** | 642 tests, 636 pass, **3 fail** |
| 3c | node guards (CONTROL) | same, in a detached worktree of `main@7dc8672f0` | **1** | 640 tests, 634 pass, **4 fail** - a strict SUPERSET of the lane's |
| 4 | stats | `npm run test:stats` (Node 23.11.1) | **1** | environmental: `assay worker requires Node 26.4.0 exactly; found 23.11.1` |
| 4b | stats (canonical Node) | same under `~/.nvm/versions/node/v26.4.0` | **0** | 87 + 252 KV + 252 SQLite + 26 ledger, census 42/24/18/0 |
| 5 | e2e subject, both projects | `npx playwright test --config playwright.s2517c.config.ts e2e/e5-stillwater-noise.spec.ts --workers=1` | **0** | **10/10** desktop-chrome + mobile-chrome (390 px), zero console errors |

**Gate 3 attribution (control, never `git stash`).** A fresh `git worktree add --detach` of
`main@7dc8672f0` — the exact commit `lane/c` sits on, carrying none of this session's files — was
run through the identical battery in the same load window. It reproduced every one of the lane's
failures and added one more:

| Failing test | lane/c | control main |
|---|---|---|
| `all 121 scripts/*.test.mjs fixture owners remove their temp directories` | FAIL 284.7 s | FAIL 289.8 s |
| `goal tree schema is valid` | FAIL | FAIL |
| `scripts/gr-sim.test.mjs` | FAIL timeout @300000 ms | FAIL timeout @300000 ms |
| `a per-test timeout still overrides the default...` | FAIL 1050 ms vs 1000 ms budget | FAIL 1059 ms |
| `contention is advisory, correctly counted, and absent when alone` | pass | FAIL 758 ms |

**Not mine, and provably so:** the lane's tracked tree is byte-identical to the control's. The
signature (multi-second budgets missed by 5%, a 300 s timeout, a contention guard that only reds
under load) is machine contention — four Claude lane implementers were dispatched concurrently
(`tasks/BACKLOG.md:1`). A re-run under canonical Node 26.4.0 degraded further (12 fails, individual
guards taking 77-598 s against normal sub-second durations) and was abandoned at ten minutes; it is
recorded here as measurement noise, not as a tree verdict.
Logs: `gate-node-guards-lane.log`, `gate-node-guards-control-main.log`, `gate-stats-node26.log`,
`gate-e2e-stillwater.log`, `gate-build.log`.

Gate hygiene: the e2e ran on a scratch config/port (`playwright.s2517c.config.ts`, port 5241,
gitignored) rather than the shared 5188, precisely because three sibling lanes are live
(Mistake #12).

## 7. Undone, and why

| Undone | Reason |
|---|---|
| Scope 1 - a front that carries a wave | Impossible inside the firewall; section 2 measures both attempts breaking a law. Master's honesty guard says STOP. |
| Scope 1 - SECURE gates on the front | Same fork. Worse: the in-firewall half of it (P1) makes SECURE fire *early* rather than late. |
| Scope 3 - floor ride secures with the mechanic live | No mechanic was landed, so there is nothing to ride. The floor ride WITHOUT it is re-measured green (section 5). |
| P2 secure arm on seed 02 | The prover's `--idle` arm under P2 does not terminate (no pressure exists to end the run) and burned a 10-minute budget; seed 02 was measured through `scripts/gr-sim.mjs` instead, same verdict. Seed 01's P2 secure arm ran and is tabled. |
| `docs/audits/...` row flip, engine re-pin, e2e re-pins | Correctly not owed: nothing shipped, so `e5-stillwater` remains a RESKIN and the era-5 pin stands unmoved. |
| Browser-vs-headless hash comparison for the NEW behaviour | There is no new behaviour. The existing browser boot is green and the engine hash is unmoved. |

## 8. Files

- Evidence: `artifacts/e5-stillwater-storm/` (this report, 10 ride logs, 3 hash tables, 5 gate logs, `probe.mjs`)
- Ledger: `tasks/BACKLOG.md` - open `F-E5STORM-1`
- Master: `tasks/e5-stillwater-storm.md`
- Audit row: `docs/audits/2026-09-02-era-mechanic-audit.md:37` and `:78`
