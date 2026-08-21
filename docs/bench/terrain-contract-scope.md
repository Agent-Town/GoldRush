# Bench terrain contract scope

Measured: 2026-08-21

The SSR bench resolved Terrain's module-scoped contract as `the-claim`.

## First declared build-zone centre

| contract | centre x | centre z | accepted by bench ground |
|---|---:|---:|---|
| e1-twin-banks | 0 | -18.5 | true |
| e2-hill-mine | 0 | 12 | true |
| e2-trestle | 0 | -18.5 | true |
| e2-pressure-garden | 0 | 11.5 | true |
| e2-incline | 0 | -18.5 | true |
| e3-blackout-ridge | -12 | -23 | true |
| e3-moth-season | -20 | 0 | false |
| e3-canyon-works | 0 | -40 | false |
| e3-fairground | 0 | -25 | true |
| e4-dust-flats | 0 | -1 | false |
| e4-long-road | -136 | -14 | false |
| e4-gusher-county | 0 | -4 | false |
| e4-boneyard | 0 | -45 | false |
| e5-deepwater-claim | 0 | 30 | true |
| e5-regatta | -49 | 0 | false |
| e5-stillwater | 0 | 30 | true |
| e5-flotilla | -26 | 21 | true |
| e6-glow-mesa | 0 | -32 | true |
| e6-showroom | 0 | -41 | false |
| e6-half-life-hollow | 0 | -47 | false |
| e6-picnic | 0 | -33 | false |
| e7-relay-valley | -45 | 41 | false |
| e7-echo-canyon | 0 | -16 | true |
| e7-dead-band | 0 | -15 | true |
| e7-relay-rush | -45 | 41 | false |
| e8-mare-claim | -44 | 47 | false |
| e8-far-side | 0 | -39 | false |
| e8-low-orbit | 0 | 0 | false |
| e8-eclipse | -44 | 47 | false |
| e9-dome-basin | -38 | 48 | false |
| e9-seed-run | 0 | -48 | false |
| e9-devils-alley | 0 | -48 | false |
| e9-old-canal | 0 | -48 | false |
| e10-ember-shore | 3 | -10 | true |
| e10-archive-world | 0 | -46 | false |
| e10-last-claim | 0 | 0 | false |

- accepted by bench ground: 14
- rejected by bench ground: 22
- contracts declaring build zones: 36

## Terrain seam census

- `ACTIVE_CONTRACT` reads bypassing `currentContract()`: 19
- structural `ACTIVE_CONTRACT` floor (declaration + `currentContract()` fallback): 2
- calls routed through `currentContract()`: 7

## What this means

This report measures only the bench's ground; it does not compare that answer with each contract's own ground.

A browser boot can select a contract from its URL, so its placement answers come from that contract's ground. Direct in-process SSR bench callers with no browser location currently bake `the-claim` into Terrain instead. Browser placement reasoning is therefore not established by those bare-SSR bench answers until the headless Terrain seam is rewired. CLI paths such as `gr-sim.mjs` install a contract URL before importing Terrain and are outside this no-location measurement.
