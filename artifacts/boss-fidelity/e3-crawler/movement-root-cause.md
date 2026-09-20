# Crawler components now share the body's night speed

The Crawler's independent component actors crossed the hero lamp at different moments. Each actor sampled its own light coverage and could receive either 1.0 or 1.08 movement speed. That stretched the declared rigid formation while the renderer still displayed one chassis. This correction samples the existing night rule once, before any component moves, and applies it only to the matching Crawler boss group.

## Root cause and bounded correction

- `assets/contracts/epoch-3-voltage/contracts.json:267` declares the existing 1.08 outside-light boost and 0.35 coverage threshold. The Crawler appears at dark wave 14 in `e3-canyon-works`. Lines 331–337 declare speed 1.8, degradation multiplier 1, and component offsets 0/4/8.
- `src/systems/WaveSystem.ts:889` derives one route direction and `:909` / `:939` translates each component's spawn and route by its declared offset. These routes are already compatible with a rigid formation if all components receive the same movement multiplier. No route or actor position changes were necessary.
- `src/entities/Enemy.ts:683` and `:736` bypass terrain movement modifiers for these scripted `ignoreTerrain` routes. Their effective speeds were 1.8 and 1.944 when the light samples differed: 0.144 units/second of relative motion. HP loss does not independently slow a component, and the declared degradation multiplier is 1.
- `src/game/Game.ts:3088` and `src/sim/HeadlessContractSim.ts:1996` now clear and compute one derived sample before `EnemyPool.update`. They scan only when the active contract declares a Crawler. The deterministic anchor preference is **tracks → drain_mast → capacitor_bank**. The scalar is computed before the pool starts advancing any actor; reading the live tracks inside the per-actor callback would have introduced an order-dependent light-boundary error.
- `src/game/Game.ts:6487` and `src/sim/HeadlessContractSim.ts:2834` return that scalar only for a Crawler with the sampled group ID. All other actors retain the existing rule. Null/undefined groups use raw sampling safely. Keeping this in the existing method also makes the `enemyPositions` diagnostic at `Game.ts:2495` report the actual Crawler sample that was applied.
- The sample is private derived state, absent from the save payload. Successful restore paths clear it at `Game.ts:4326` / `:4339`; `resetRun` also clears it. The next step recomputes it from restored actors and the light field. It does not depend on the GLB, material loading, terrain tilt, or renderer tier.

## Alternate component order

`src/systems/CrawlerBossSystem.ts:404` returns while the mast is alive. Destroying tracks first must therefore leave the mast and capacitor moving in act 1; it must not pin the vehicle early. The anchor changes to the live mast on the next step. When both mast and tracks are destroyed, the existing pin operation (`:416`) sets survivors' scripted speed to zero. Sampling the remaining capacitor then has no movement effect.

| Kills so far | Next sample | Existing movement state |
|---|---|---|
| none, mast only, capacitor only, or mast + capacitor | tracks | moving |
| tracks only, or tracks + capacitor | mast | moving, act 1 |
| mast + tracks | capacitor | pinned |
| all three | none | no live components |

The sample point can change after a component is lost, so the body may change between the two existing speed values at that transition. No virtual reference point or new persistence rule is introduced.

## Measured evidence

Run from the repository root while scratch Vite is available at `http://127.0.0.1:5246`:

```sh
node artifacts/boss-fidelity/e3-crawler/check-movement.mjs
```

`movement-check.json` records the final source run with `passed: true`. All five arms passed. The legacy arms override only their isolated instance's night callback to restore the old per-component sampling; the production arms use the source implementation.

| Engine / arm | Spawn span | 10 seconds | 20 seconds | Maximum applied multiplier spread |
|---|---:|---:|---:|---:|
| Browser legacy control | 8 | 8.581456 | 9.199046 | 0.08 |
| Browser production, full | 8 | 8 | 8.000000000000137 | 0 |
| Browser production, lite | 8 | 8 | 8.000000000000137 | 0 |
| Headless legacy control | 8 | 8.581456 | 9.213411 | 0.08 |
| Headless production | 8 | 8 | 8.000000000000130 | 0 |

The check observes the real light field at the actual route positions. The hero is moved near the component centroid at each ten-second inspection, matching the lifecycle capture's lamp placement. The legacy controls cross split-light conditions on 255 browser ticks and 258 headless ticks. The browser and headless results are functional parity evidence; their light-refresh timing differs, so this check does not claim identical full-state trajectories between engines.

All production integrations used `1 / 30` seconds. Both 1.0 and 1.08 occurred; none of the parts' applied values differed from the pre-step anchor sample. Diagnostics matched the applied sample. Tracks-first left act 1 unpinned and moving with the surviving span stable within 1.3e-13 units; destroying the mast afterward pinned the last component with exactly zero travel. The check also verifies null/undefined-group fallback, same-page JSON restore, and a new browser page restoring the same JSON and reaching exactly the same subsequent positions in both full and lite modes.

`movement-drift.json` preserves the actual pre-correction source run: span 8 → 8.581456 → 9.199046. Its page-local cached-tracks counterfactual kept span 8. `movement-drift-no-nearby-hero.json` preserves the all-dark control: both old and counterfactual paths stayed at span 8 with no split-light tick. Thus route shape alone did not cause this drift.

## Limits and remaining gates

Existing saves with already separated components retain their saved positions and routes. Sharing the future multiplier prevents further differential-light drift; it does not teleport old components back into formation. The correction also does not change the existing terminal tick where lethal hero contact can stop the pool loop before later actors update. That is a final-tick artifact outside this bounded repair.

This is a simulation behavior correction. The focused check is not the full regression gate. Root coordinates build, independent review, and full regression before declaring E3 verified. Existing specifications remain untouched. Relevant unchanged first-pass suites are `e3-crawler-boss`, `wire-crawler-3d`, `e3-canyon-works`, `night-mode-truth`, `e3-day-night`, `e3-moth-swarm`, `e3-moth-season`, and `er01-e3-census`, plus existing suspend/replay coverage. No renderer-count expectation, combat amount, timing, route, contract, Enemy implementation, or E4 file was changed by this movement patch.
