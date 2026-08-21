# Bench terrain contract scope

Measured: 2026-08-21

The SSR bench resolved Terrain's module-scoped contract as `the-claim`.

## First declared build-zone centre

| contract | centre x | centre z | Terrain.isBuildable | result |
|---|---:|---:|---|---|
| e1-twin-banks | 0 | -18.5 | true | AGREE |
| e2-hill-mine | 0 | 12 | true | AGREE |
| e2-trestle | 0 | -18.5 | true | AGREE |
| e2-pressure-garden | 0 | 11.5 | true | AGREE |
| e2-incline | 0 | -18.5 | true | AGREE |
| e3-blackout-ridge | -12 | -23 | true | AGREE |
| e3-moth-season | -20 | 0 | false | DIVERGE |
| e3-canyon-works | 0 | -40 | false | DIVERGE |
| e3-fairground | 0 | -25 | true | AGREE |
| e4-dust-flats | 0 | -1 | false | DIVERGE |
| e4-long-road | -136 | -14 | false | DIVERGE |
| e4-gusher-county | 0 | -4 | false | DIVERGE |
| e4-boneyard | 0 | -45 | false | DIVERGE |
| e5-deepwater-claim | 0 | 30 | true | AGREE |
| e5-regatta | -49 | 0 | false | DIVERGE |
| e5-stillwater | 0 | 30 | true | AGREE |
| e5-flotilla | -26 | 21 | true | AGREE |
| e6-glow-mesa | 0 | -32 | true | AGREE |
| e6-showroom | 0 | -41 | false | DIVERGE |
| e6-half-life-hollow | 0 | -47 | false | DIVERGE |
| e6-picnic | 0 | -33 | false | DIVERGE |
| e7-relay-valley | -45 | 41 | false | DIVERGE |
| e7-echo-canyon | 0 | -16 | true | AGREE |
| e7-dead-band | 0 | -15 | true | AGREE |
| e7-relay-rush | -45 | 41 | false | DIVERGE |
| e8-mare-claim | -44 | 47 | false | DIVERGE |
| e8-far-side | 0 | -39 | false | DIVERGE |
| e8-low-orbit | 0 | 0 | false | DIVERGE |
| e8-eclipse | -44 | 47 | false | DIVERGE |
| e9-dome-basin | -38 | 48 | false | DIVERGE |
| e9-seed-run | 0 | -48 | false | DIVERGE |
| e9-devils-alley | 0 | -48 | false | DIVERGE |
| e9-old-canal | 0 | -48 | false | DIVERGE |
| e10-ember-shore | 3 | -10 | true | AGREE |
| e10-archive-world | 0 | -46 | false | DIVERGE |
| e10-last-claim | 0 | 0 | false | DIVERGE |

- AGREE: 14
- DIVERGE: 22
- contracts declaring build zones: 36

## Terrain seam census

- direct `ACTIVE_CONTRACT` reads: 21
- calls routed through `currentContract()`: 7

## What this means

A browser boot can select a contract from its URL, so its placement answers come from that contract's ground. Direct in-process SSR bench callers with no browser location currently bake `the-claim` into Terrain instead. Browser placement reasoning is therefore not established by those bare-SSR bench answers until the headless Terrain seam is rewired. CLI paths such as `gr-sim.mjs` install a contract URL before importing Terrain and are outside this no-location measurement.
