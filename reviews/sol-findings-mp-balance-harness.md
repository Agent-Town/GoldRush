# Sol findings — multiplayer balance harness

- **Branch:** `sol/mp-balance-harness`
- **Fresh base:** `origin/main@df5b227846f66e98b8ad5d0ad61a171d687a2778`
- **Scope:** deterministic measurement only; no rider multiplier table or live Balance changes
- **State:** **STATIC READY — browser gates remain orchestrator-side**

## F-SOL-MPBAL-001 — current harvesting is one channel, not one channel per rider

The MP-BALANCE brief says income already multiplies because each rider pans. The current
engine does not implement that premise. `HarvestSystem` owns one `channelNode` and one
`progress`, selects one nearest eligible collector, and advances one tick stream
(`src/systems/HarvestSystem.ts:46-47`, `:154-188`, `:291-306`). More riders can keep
that shared channel occupied more often, but they cannot pan in parallel.

The harness therefore measures the current rule honestly: one shared progress channel,
with seeded rider duty cycles improving uptime only. It does not add an independent-pan
counterfactual or change live harvesting. Any true per-rider panning design needs a
separate owner-ratified slice.

## Harness contract

`src/mp/MultiplayerBalanceHarness.ts` runs a pure 1/30-step micro-sim over the same nine
seeds for 1/2/3/4 riders. It forces Trail inputs for the synchronous measurement and
restores the caller's mutable difficulty values afterward. Survival ends at the first
rider death, matching shared fate. Wave budgets, pulse distribution, lulls, alive cap,
enemy HP/speed/contact, hero HP/iframes, and base Spark Rig damage/rate/range come from
the live `Balance` object. Multiplayer riders use the live 1.2-unit circular formation;
each pulse uses seeded distinct edges and the live group spread, then each enemy selects
the nearest rider, matching `WaveSystem` and `EnemyPool.update` targeting
(`src/game/Game.ts:208`, `:1998-2008`; `src/systems/WaveSystem.ts:296-309`, `:399-417`;
`src/entities/pools.ts:508-512`, `:1255-1267`).
The report and Balance/model input set use the lockstep `stableHash`.

This is a deliberately conservative relative baseline: stationary riders, instant-hit
base Spark Rigs, base Claim Jumpers only, no Baron/variants, upgrades, buildings,
Prospector, projectile travel, or candidate rider scaling. Gold is gross panned gold
before the bank cap, using a disclosed seeded 58–72% rider availability model.

The channel is lazy-loaded only for `?debug&mpbalance`; ordinary boot and `?mpbalance`
without `debug` expose nothing. Browser coverage checks deterministic identity, changed
seed identity, row/delta arithmetic, finite/range invariants, Trail isolation/restoration,
and both query gates (`src/main.ts`, `src/vite-env.d.ts`,
`e2e/mp-balance-harness.spec.ts`).

## First measurement — unscaled live inputs

Seed corpus: `mp-balance-v1:1` through `:9`; horizon: 600 seconds; Balance fingerprint:
`fnv1a32:df245d4f`; report hash: `fnv1a32:f7ae1af8`. Local pure-module runtime was
47.114 ms. Exact report: `artifacts/sol/mp-balance-harness/first-report.json`.

| Riders | Survival median (min–max) | Censored | Survival Δ | Team gold/min | Team Δ | Gold/rider/min | Per-rider Δ |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 78.933s (77.433–82.600) | 0/9 | 0.0% | 107.0 | 0.0% | 107.000 | 0.0% |
| 2 | 141.767s (140.767–142.000) | 0/9 | +79.6% | 147.0 | +37.4% | 73.500 | -31.3% |
| 3 | 195.867s (192.133–200.467) | 0/9 | +148.1% | 164.5 | +53.7% | 54.833 | -48.8% |
| 4 | 226.900s (218.833–248.167) | 0/9 | +187.5% | 177.0 | +65.4% | 44.250 | -58.6% |

## Interpretation

The unscaled combat advantage is large and monotonic: four base rigs extend median
first-death survival by about 187% over solo even without movement, builds, upgrades, or
Prospectors. That is directional evidence for conservative sub-linear pressure scaling,
but not enough to ratify multiplier numbers; the family playtest remains the feel gate.

Resource availability moves the other way. A fourth rider raises team gross panning by
only about 65% while cutting gross gold per rider by about 59%. The immediate balance
problem is scarcity under one shared channel, not runaway N-times income. Do not tune a
"seam richness curve" on the assumption that current panning is parallel.

No tuning values were written. The next decision belongs to the orchestrator/owner:
use this table as the pre-playtest baseline, then decide whether richer shared seams are
enough or whether per-rider panning earns its own engine slice.

## Static evidence

```text
git diff --check
PASS (exit 0)

npm exec -- tsc --noEmit --pretty false
PASS (exit 0)

npm run build -- --logLevel error
PASS (exit 0; lazy MultiplayerBalanceHarness chunk emitted)

npm exec -- playwright test e2e/mp-balance-harness.spec.ts --list
PASS (4 desktop/mobile cases discovered)

npm exec -- playwright test e2e/m5-03-stat-sim-harness.spec.ts e2e/perf-04-determinism.spec.ts e2e/mp-02-lockstep.spec.ts --list
PASS (30 adjacent desktop/mobile cases discovered)

live harness report vs artifacts/sol/mp-balance-harness/first-report.json
PASS (deep-equal; hash fnv1a32:f7ae1af8; fingerprint fnv1a32:df245d4f)
```

`codex review --uncommitted` was attempted with reasoning effort `xhigh`, but the CLI
could not open `/Users/robin/.codex/state_5.sqlite` in this read-only sandbox. A separate
read-only review agent was used instead. It caught the initial uniform-aggro model, then
the intermediate per-enemy edge smoothing; both were corrected to the live formation,
per-pulse edge grouping/spread, and nearest-rider behavior. Its final review was CLEAN.

Browser/listener execution is not claimed here. The orchestrator owns:

```bash
npm exec -- playwright test e2e/mp-balance-harness.spec.ts --workers=1
npm exec -- playwright test e2e/m5-03-stat-sim-harness.spec.ts e2e/perf-04-determinism.spec.ts e2e/mp-02-lockstep.spec.ts --project=desktop-chrome --workers=1
```
