# E5 Stillwater front crew — honesty stop — lane/c — 2026-09-05

## Verdict

**STOPPED. No gameplay, contract, fixture, test, or pin change lands.** The measured size-1
candidate preserves the ordinary played and idle outcomes, but it cannot satisfy scope 3(a)'s
required unkillable-rider isolation. The task's no-op/honesty guard therefore applies.

The candidate was applied, measured, and reverted. The tracked Stillwater contract and mask table
are byte-identical to `main@32af81521`; `assets/engine-era.json` remains on `b061540c...`.

## Candidate measurement: size 1, 32 second cycle, first front at 8 seconds

The existing `artifacts/e5-stillwater/prover.mjs` supplied the ordinary played/idle arms.

| Arm | Seed 01 | Seed 02 |
|---|---|---|
| played, plain | SECURE w12 at 360000 ms, 103 kills, `fnv1a32:7661ca43` | SECURE w12 at 360000 ms, 161 kills, `fnv1a32:3d3ea0fc` |
| played, in-process | SECURE w12 at 360000 ms, 77 strikes, `fnv1a32:4e99e655` | SECURE w12 at 360000 ms, 77 strikes, `fnv1a32:897e18b8` |
| idle, plain | LOSS w3 at 104433 ms, `fnv1a32:ba80f970` | LOSS w3 at 93367 ms, `fnv1a32:7ab6a335` |

The in-process ride keeps the noise hunt live after the first front: the asserted source/event ids
remain `air-pump`, `engine`, and `harpoon-reload`; the terminal trail is `harpoon-reload`, with 77
strikes and one deck still standing on both seeds.

These are measurements only, not pins. The predecessor's table differs because it was measured on
its lane tree; this table was freshly measured after fast-forwarding lane/c to current main.

## Required unkillable-rider isolation: failed

`artifacts/e5-stillwater-front-crew/isolation-probe.mjs` gives the no-order rider 100000 HP, copies
the already-authored `corsair_skiff` row in memory, and tries the whole permitted timing grid. Every
arm reaches generic wave 3 without terminating. `eventLogHash` is therefore `null`: there is no
terminal outcome to hash, and inventing one by killing the rider in the probe would falsify the
acceptance claim.

| Cycle | First front | State at wave 3 | First corsair | Fronts / corsairs | Minimum corsair-to-boat distance | Hash |
|---:|---:|---|---:|---:|---:|---|
| 24 s | 8 s | alive, HP 100076 | 8033 ms | 4 / 4 | 30.0000 | none: nonterminal |
| 24 s | 12 s | alive, HP 100076 | 12033 ms | 4 / 4 | 30.0000 | none: nonterminal |
| 24 s | 16 s | alive, HP 100076 | 16033 ms | 4 / 4 | 30.0000 | none: nonterminal |
| 32 s | 8 s | alive, HP 100076 | 8033 ms | 3 / 3 | 30.0000 | none: nonterminal |
| 32 s | 12 s | alive, HP 100076 | 12033 ms | 3 / 3 | 30.0000 | none: nonterminal |
| 32 s | 16 s | alive, HP 100076 | 16033 ms | 3 / 3 | 30.0000 | none: nonterminal |
| 40 s | 8 s | alive, HP 100076 | 8033 ms | 3 / 3 | 30.0000 | none: nonterminal |
| 40 s | 12 s | alive, HP 100076 | 12033 ms | 2 / 2 | 30.0000 | none: nonterminal |
| 40 s | 16 s | alive, HP 100076 | 16033 ms | 2 / 2 | 30.0000 | none: nonterminal |
| 48 s | 8 s | alive, HP 100076 | 8033 ms | 2 / 2 | 30.0000 | none: nonterminal |
| 48 s | 12 s | alive, HP 100076 | 12033 ms | 2 / 2 | 30.0000 | none: nonterminal |
| 48 s | 16 s | alive, HP 100076 | 16033 ms | 2 / 2 | 30.0000 | none: nonterminal |

## Root cause

This is not a timing problem:

- `DeepwaterClaimTile.corsairsFor` places a size-1 front at `z = 0`
  (`src/world/DeepwaterClaimTile.ts:146-165`). Stillwater's Claim-Boat is anchored at `(0, 30)`.
- `DeepwaterSocket.spawnCorsairs` sends every non-Flotilla corsair straight to the east edge with
  `scriptMoveTo(wave.toX - 2, z, ..., { ignoreTerrain: true })`
  (`src/sim/DeepwaterSocket.ts:246-264`). The measured closest approach to the boat is 30 wu.
- The only boat-loss callback is `resolveHullContacts`, and it delegates to
  `this.flotilla?.advance(...)` (`src/sim/DeepwaterSocket.ts:165-167`). Stillwater has no Flotilla.
- Otherwise enemy contact resolves against the hero (`src/sim/HeadlessContractSim.ts:1827-1834`).
  Making that rider unkillable removes the only terminal loss route.

Changing cycle or first-front timing cannot add a Claim-Boat damage route. The smallest honest
successor is a separately authorised shared Deepwater Claim-Boat contact/loss seam in both engines;
only after that exists can this contract-data candidate and its pins be landed truthfully.

## Gates and omissions

- predecessor split on main: PASS (`036cb6037`)
- clean fast-forward to `main@32af81521`: PASS
- `npm install --no-audit --no-fund`: PASS
- untouched baseline `npm run build`: PASS
- isolation grid probe: PASS as an instrument; 12/12 arms disqualify the candidate
- candidate contract and mask changes: REVERTED
- node guard, Playwright parity, screenshots, null-floor regeneration, and engine pin: not run/not
  produced because the master explicitly says to stop without committing data when the triad fails

