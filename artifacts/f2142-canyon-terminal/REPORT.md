# F-2142-1 — the campaign harness runs every leg on the DEFAULT claim's terrain

**Fire:** s2142 · **Date:** 2026-08-21
**Subject:** why `e3-canyon-works` ends at wave 2 under `scripts/gr-sim-campaign.mjs`
**Probe:** `scripts/f2142-canyon-terminal-probe.mjs` (committed, re-runnable)
**Raw:** `harness-url-run.json` (the harness's own URL) · `control-contract-named-run.json` (the control)

## Verdict

**The wave-2 terminal is an artifact of the HARNESS, not a fact about the contract.**

`scripts/gr-sim-campaign.mjs:17` sets `globalThis.location` to `http://gr-sim-campaign.local/?debug`
— `?debug` with **no `contract=` parameter**. `ContractFamilies.activeContractSelection()` reads that
query string (`currentSearch()`, `ContractFamilies.ts:2328`), finds no requested id, and returns the
**fallback contract**. `src/world/Terrain.ts:78` binds `const ACTIVE_CONTRACT = activeContract()` at
**module-evaluation time**, and derives `CLAIM_WIDTH`/`CLAIM_HEIGHT` (`:85`–`:86`), `buildZones`
(read by `isBuildable`, `:238`), anchors, water and landmark blockers from it.

So the campaign harness runs `HeadlessContractSim` with the **right manifest** — `this.manifest =
loadContract(this.contractId)` (`HeadlessContractSim.ts:690`), which is why the `canyonConnect`
diagnostics exist at all — on the **wrong ground**.

For `e3-canyon-works` the claim is **96×112**; the fallback's is **64×64**. The two base pylon sites
sit at `z = ±36`, outside a 64-wide claim's half-extent of 32. They are therefore not buildable and
not walkable, `sentry_beacon` is refused `out_of_zone`, and — because both base pylons are
**cut-vertices** on the only wire paths from `sub-hall` to either gallery — `powered` can never leave
0. The rider, meanwhile, stands at the stake and is killed in 60 seconds.

## The two runs, same probe, same seed, same player, same checkpoint

The **only** difference is the URL the modules are evaluated under.

| | harness URL `?debug` | control `?debug&contract=e3-canyon-works` |
|---|---|---|
| `Terrain.CLAIM_WIDTH × CLAIM_HEIGHT` | **64 × 64** | **96 × 112** |
| `pylon-west-base` buildable disc (r=2.5) | **0 / 317** | **317 / 317** |
| `pylon-east-base` buildable disc | **0 / 317** | **317 / 317** |
| beacons built | **0** | **5** |
| `canyonConnect.powered` | **0** / 2 | **1** / 2 |
| `canyonConnect.failed` | false (never reached) | **true** (deadline latched) |
| terminal wave | **2** | **8** |
| turns observed | **10** | **540** |
| kills | 24 | 126 |
| `eventLogHash` | `fnv1a32:6437f65b` | `fnv1a32:fb21d525` |

**Terminal cause, both runs: `rider-down (dead)`.** `HeadlessContractSim.terminal` is
`this.dead || this.secureChoice === 'bank'` (`:1331`); with `secured:false` and no bank choice the
run ended because the rider went down. In the harness-URL run that happens at 60.03 s with hp 0,
having never placed a beacon.

⚠️ **The `activeContractId` field in both JSONs reads `null` and carries NO signal** — `ACTIVE_CONTRACT`
is a module-private const in `Terrain.ts`, not an export, so my probe read `undefined`. The
discriminator is `claimWidth`/`claimHeight`, which moved exactly as predicted. Stated here so a
later reader does not mistake my probe's blind field for a measurement.

## How the refusal was read, rather than inferred

The harness loop only checks `receipt.outcome.ok`, which is true for an order that is **accepted at
submit time and refused at execution time** — so the refusal is invisible where the census looked.
It is legible in the standing-order records the view publishes (`StandingOrders.finishAction` → `fail`):

```
turn 3  BUILD sentry_beacon (-12,-36) when goldGte 25   status: pending
turn 5  BUILD sentry_beacon (-12,-36) when goldGte 25   status: failed
        reason: "FAILED (out_of_zone): BUILD action was rejected."
turn 6  BUILD sentry_beacon ( 12,-36) when goldGte 35   status: failed  (same reason)
```

`out_of_zone` is `BuildSystem.rejectionDetail`'s mapping of `invalid_placement` (`BuildSystem.ts:78`)
— i.e. `matchesPlacement()` said no. It is **not** the range check, which reports `out_of_reach` and
sits one rung lower in the same ladder (`:974`–`:986`). `sentry_beacon` is `placement: 'bank'`
(`buildables.ts:45`), so the binding predicate is `Terrain.isBuildable(x, z)`.

## The control that refuted my first reading, and why it mattered

My first conclusion was that the two base pylon sites sit on non-buildable ground and the contract is
therefore unsecurable. **`e2e/e3-canyon-works.spec.ts:52` ("strings the gorge, holds the night, and restores a cut span") refutes it**: in the browser, all six sites
place and `powered` reaches **2**. The obvious escape — "the spec uses a debug door that skips
validation" — is **false**, and I checked rather than assumed: `BuildSystem.placeFree` skips gold and
range but **does** call `matchesPlacement` (`:1094`). So the browser genuinely finds that ground
buildable, and the disagreement had to be in the terrain binding, not the contract. That is what sent
me to `CLAIM_WIDTH`, and it is the whole reason this report says "harness" instead of "contract".

## Scope — measured, not estimated

**40 of 42 board contracts declare their own tile geometry.** Only `the-claim` (the fallback itself),
`e1-night-shift` and `e1-baron` share the default 64. Size is not the whole exposure: `buildZones`,
`harvestAnchors`, `authoredTerrain`, water and landmark blockers all bind from the same
`ACTIVE_CONTRACT`, so a same-sized contract still gets the fallback's *features*.

✅ **THE PINNED E1 BASELINE IS NOT AFFECTED — I asserted that it was, and the check refuted me.**
My first draft of this section claimed the five-leg walk pinned at `fnv1a32:4f363fd5`
(`scripts/gr-sim-campaign.test.mjs:71`) had walked four legs on the-claim's terrain, since it runs
under the same parameter-less URL. **False.** `runCampaign()` (`:168`) invokes the harness with
`--test-fixture`, and that flag takes the `playerModule.fixtureOutcome()` branch
(`gr-sim-campaign.mjs:97`–`:101`) which **never constructs `HeadlessContractSim`** and therefore never
touches `Terrain`. The pin is a fixture hash. Curing the binding does **not** move it.

The live exposure is to **real** (non-fixture) campaign runs — which is exactly what the canyon
censuses were, and is why this went unseen: the guarded path and the used path are different paths.

## Why the cure is not simply "set the URL"

`Terrain.ts`'s claim geometry is `const`, evaluated once at module load. A multi-leg campaign changes
contract between legs and therefore **cannot** re-bind in one process. So:

- **Single-contract runs** (`--contract <id>`, the census path) are curable cheaply and completely:
  set the query **before** the modules are loaded.
- **The multi-leg walk** is not curable that way at all: one process, one binding, many contracts.
  Its pinned test is a fixture and is unaffected, but a *real* multi-leg walk remains wrong for every
  leg past the fallback. That half is REPORTED, not fixed — it is **F-2142-2**, and the honest options
  (one process per leg, or a re-bindable terrain) are a design fork, not a mechanical cure.

## Relation to prior findings — ⚠️ THE CLASS WAS ALREADY KNOWN, AND I NEARLY FILED IT AS NEW

**`F-A10-1` / `F-2134-1` own this mechanism and got there first.** `tasks/BACKLOG.md:24` has carried
*"F-A10-1 (bench Terrain `ACTIVE_CONTRACT` SSR default — re-prices placement legality claims)"* as a
filed engine debt, and s2134 re-measured it at source with a committed probe:

> **22 of the 36 contracts that declare `buildZones` have the centre of their OWN first declared zone
> rejected by `Terrain.isBuildable` under SSR** — … **e3-canyon-works** · …
> The bench is not applying the wrong zones, it is applying **the wrong ground**.

That row **names `e3-canyon-works` explicitly**, and its diagnosis — module-scope `ACTIVE_CONTRACT`,
fallback to `the-claim`, baked 64×64 bounds — is mine, arrived at independently and one day later.
I record that plainly rather than dressing this up as a discovery.

**What is actually new here, and it is worth the fire:**

1. **The route differs, and the difference is the cure.** F-2134-1's mechanism is *"`currentSearch()`
   returns `''` **with no `globalThis.location`**"*. The campaign harness **does** set
   `globalThis.location` — to `?debug` — and reaches the same fallback by a different road. That
   matters because the harness already fabricates its URL, so **for the harness the cure is one
   line**, entirely separate from the large rewire F-2134-1 contemplates.
2. **Nobody had connected the class to the census.** Seven fires (s2086 → s2141) reasoned about
   beacon cost, route length and deadline margin, while a ledger row named this contract as one whose
   own ground the bench rejects. **The answer was already written down, three lines above the work.**
3. **The end-to-end control is new evidence.** No prior artifact had shown the cure's *effect*: with
   the contract named, the census player builds 5 beacons, `powered` reaches 1, the leg survives to
   wave 8 and `failed` latches — the deadline observation the whole thread was for.

🚫 **This slice is NOT the F-2134-1 rewire and must not be confused with it.** That successor —
*"route the NINETEEN legality reads through `currentContract()`"* — **re-baselines every bench floor,
pin and admission exemption in the repo** (the s2138 row records that widening
`gr-sim.test.mjs:630`'s assertion would red 22 contracts) and is attended-gated. This is the cheap,
contained, harness-only slice that unblocks the census without touching a single pin.

**The reusable half:** when a harness fabricates an environment, every module that binds that
environment at import time is part of the harness's contract with the sim — not just the one the flag
is named after. **And the second half, which cost more: before spending a fire on a mystery, grep the
ledger for the subject's own name.** F-2134-1 was one day old and named this contract.
