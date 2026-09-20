---
finding: F-1319-3
date: 2026-08-01
branch: lane/perf
verdict: READY-FOR-GATES
---

# F-1319-3 — terrain seed URL parsing cure

## Outcome

`terrainSeed()` now caches by the raw `window.location.search` string. This is option 2(a): it invalidates itself whenever history changes the query, without coupling every URL writer to a reset export. The faster memoise-once option was rejected because a missed invalidation would silently select the wrong terrain.

## Scope 1 baseline

Command:

```sh
node scripts/gr-sim.mjs --contract e1-night-shift --seed e1-night-shift-01 --policy=idle
```

| Arm | Speed | Derived `advanceCpuMs` | Wall | `eventLogHash` |
| --- | ---: | ---: | ---: | --- |
| Seven wrecked fixtures | 0.21 waves/s | 19,048 ms | 20.01 s | `fnv1a32:c086ef19` |
| Fixture loop temporarily neutered, then restored | 2.48 waves/s | 1,613 ms | 2.40 s | `fnv1a32:84c22e10` |

The hashes reproduce s1320 exactly. The CPU ratio is 11.81x, close to the brief's approximately 11x, so the task proceeded. `src/sim/HeadlessContractSim.ts` was restored with an empty final diff.

## Cure and determinism

The cache reads `window.location.search` once per hash call, compares it with the cached raw string, and only constructs `URLSearchParams` plus runs `normalizeSeed` when that string changes. The final source diff SHA-256 is `9c3d00766f52c97595a09b5817f60d1e36aa4ac7a6a4d4bb80f3a377e509000e`.

After the cure, the same Night Shift run produced:

- speed: 0.87 waves/s, derived `advanceCpuMs`: 4,598 ms
- wall: 5.34 s
- `timeMs`: 126167
- `eventLogHash`: `fnv1a32:c086ef19`

Determinism therefore stayed byte-for-byte at both ends.

## Direct guard and manufactured RED

`e2e/terrain-seed-cache.spec.ts` loads `Terrain` in a minimal Vite-served document, replaces `URLSearchParams` with a counting proxy, changes the raw search string, and calls `sampleHeight` 200 times synchronously. It asserts exactly one derivation, without a timing threshold.

The cure was reverted to the shipped implementation and the guard was run on both projects. Both failed as required:

```text
Error: 200 sampleHeight calls took 5.80 ms
Expected: 1
Received: 5600
```

```text
Error: 200 sampleHeight calls took 6.00 ms
Expected: 1
Received: 5600
```

The identical three-line search-keyed cure was re-applied. Final result:

```text
2 passed (7.4s)
```

The final measured bracket was 2.00 ms / 200 calls on desktop and 2.10 ms / 200 calls on mobile.

## Browser-side number, report only

The isolated hero-height path fell from 0.0290 ms to 0.0100 ms per call on desktop and from 0.0300 ms to 0.0105 ms on mobile. At one hero ground-height lookup per frame, that is approximately 0.019–0.0195 ms saved per frame in this browser probe (about 65%). No rendering-side optimisation was attempted.

## gr-sim test near-miss

`node --test scripts/gr-sim.test.mjs` is green, 3/3. Its Night Shift case changed from 20,786 ms before to 5,393 ms after, adding about 15.4 seconds of headroom beneath the unchanged 30-second timeout.

## Derived adjacency

The required command was run exactly:

```sh
grep -rln "Terrain.sample\|valueNoise\|terrainSeed" e2e src
```

It named these files:

```text
src/agent/Embodiment.ts
src/entities/Enemy.ts
src/entities/XpMote.ts
src/game/Game.ts
src/sim/HeadlessContractSim.ts
src/systems/BuildSystem.ts
src/systems/CombatSystem.ts
src/systems/FreedWalkerVfx.ts
src/systems/WaveSystem.ts
src/world/Scatter.ts
src/world/Terrain.ts
```

It named zero existing e2e specs, so there was no additional grep-named spec to run. The new direct guard ran on desktop and mobile.

## Gates

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green; Vite built 2,166 modules |
| `node --test scripts/gr-sim.test.mjs` | 3/3 green |
| `npx playwright test e2e/terrain-seed-cache.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1` | 2/2 green; zero console/page errors |
| `npm run test:node-guards` before | 205/205 |
| `npm run test:node-guards` after | 205/205; delta 0 |
| `git diff --check` | clean |
| `codex review --uncommitted` | no actionable findings; focused gates independently green |

The 37 node-test files were: `agent-rung-conformance`, `assert-release-build`, `bench-seeds`, `blocker-panel-closed-guard`, `character-direction-assets`, `citation-title-guard`, `collection-guards-cwd-invariance`, `console-watch-single-source`, `drain-block-check`, `e3-mask-tables`, `entry-damage-table`, `findings-state-guard`, `fire-shell-serialisation`, `fixture-teardown`, `gate-caller-audit`, `gate-battery`, `glob-fallback-completeness`, `goal-closure-reason`, `goal-tracker`, `gr-sim`, `law-pointer-guard`, `probe-base`, `rehearsal-base`, `ruling-propagation-guard`, `run-guards`, `run-log-retention`, `script-tree-parse`, `site-contract`, `stream-curate`, `stream-director`, `stream-showcase-queue`, `subject-tree`, `suite-red-inventory`, `town-era-props-node-safety`, `town-spec-collection`, `whole-suite-collection`, and `worker-type-coverage`, all under `scripts/` with `.test.mjs` suffixes. The npm chain's ticker, findings-state, blocker-panel, and ruling-propagation checks also passed.

## Visual evidence

Current screenshots:

- `desktop-chrome.png` — 1280x800
- `mobile-chrome.png` — 1073x2321 (390 CSS px viewport)

Old-code comparison captures are retained as `baseline-desktop-chrome.png` and `baseline-mobile-chrome.png`. Inspection found the same seeded Night Shift terrain, geometry, props, and framing. Live-frame timing produced only tiny raster drift:

| Pair | MAE (0–255) | Pixels with grayscale delta >32 |
| --- | ---: | ---: |
| desktop | 0.106 | 0.0753% |
| mobile | 0.332 | 0.2641% |

No terrain-shape or content divergence was visible. Together with the unchanged event-log hash, the visual verdict is accept.

READY-FOR-GATES
