# vp-02d — side-idle resolver

- **Slice:** `lane-vp-02d-side-idle-resolver`
- **Branch / tip:** `lane/m4` @ `132e14e2` (runner(lane-b)), base `9b55c25f`
- **Drained by:** s1135 fire, 2026-07-27
- **Verdict:** **MERGE — PARTIAL ACCEPT.** Resolver rider + idle coverage accepted as authored. The runner's rewrite of the 8-direction walk table is **REJECTED and replaced with contract values**; doing so exposed a real runtime defect (F-1135-1) that the pre-existing staleness had been masking.

## What it does

`OrientationResolver.idleDirectionFor` previously hard-snapped every heading to `s` or `n`. This slice lets **pure E/W headings keep their own idle cell**, while diagonals stay hemisphere-snapped. That is exactly the rider the contract itself asked for: `characters.v2.json` → `char.hero.rotations.notes` says the `e` idle (`rotation2-f-r1c2`) and `w` idle (`rotation2-f-r1c3`) cells are *"wired but RUNTIME-DORMANT: idleDirectionFor + the SpriteAnimator idle remap hard-snap idle to s/n, so the W-idle-fallback retirement promised in batch-005R2 needs a resolver rider (src change, separate task) before it is real."* This is that task; the cells are now live.

Src change is one line (`OrientationResolver.ts:52`). Everything else is test coverage.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.35s |
| `vp-02b-rotation-resolver.spec.ts` (desktop + mobile) | **10 passed / 4 failed** — both failures pre-existing, fingerprinted below |
| New idle tests (3, both projects) | green; `consoleErrors`/`pageErrors` asserted empty |
| Screenshots | `reviews/shots-vp-02d/desktop-chrome-idle-east.png`, `…-idle-west.png` — unmirrored profiles, no scale pop |

### Red fingerprints (neither introduced by this slice)

1. **`:233` jumper diagnostics** (desktop + mobile) — `spawnPack()` exposes `char.bandit_base`, not `char.claim_jumper`; the wait times out. Runner reported this independently. Pre-existing, untouched by this slice.
2. **`:113` hero locomotion resolves all 8 contract directions** (desktop + mobile) — **red before this drain and red after, but for a different and better reason.** Proven by a pure-main baseline run this fire (main's spec + main's resolver): it fails at **row 1 (`s`)**, expecting `char-hero-sheet-rotation-r0c0.png` while the runtime serves `char-hero-sheet-rotation-f-r0c0.png` — the s459 `-f-` staleness cluster. With contract-correct keys it advances to **row 2 (`se`)** and fails there on F-1135-1.

## Merge classification

Base `9b55c25f`; `git log 9b55c25f..main` for both touched files is **empty** — main never moved them. Pure LANE-TOUCHED, no graft, no conflict resolution required. Landed file-by-file, path-scoped.

| File | Disposition |
|---|---|
| `src/assets/OrientationResolver.ts` | accepted verbatim |
| `e2e/vp-02b-rotation-resolver.spec.ts` | accepted **except** the `directions` table (see F-1135-1) |
| `reviews/shots-vp-02d/*.png` | accepted verbatim |

## Findings

### F-1135-1 — the runner encoded a live rendering defect as expected behavior; the diagonals do not use their own art (BLOCKING for the table, corrective queued)

s1134 struck this master's false scope-5 premise and left one narrow STOP: repair the keys by inserting `-f-`, but **do not reassign which cells the diagonals use**, because the contract gives all four diagonals their own explicit blocks. The runner reassigned them anyway:

| dir | contract walk cells | runner wrote | |
|---|---|---|---|
| `se` | `rotation-f-r0c2/c3` | `rotation2-f-r0c2/c3` | ✗ east's cells |
| `ne` | `rotation-f-r1c2/c3` | `rotation2-f-r0c2/c3` | ✗ east's cells |
| `nw` | `rotation2-f-r1c0/c1` | `rotation-f-r1c0/c1` | ✗ west's cells |
| `sw` | `rotation2-f-r0c0/c1` | `rotation-f-r1c0/c1` | ✗ west's cells |

Verified against `assets/layer-contracts/characters.v2.json` directly, not against s1134's prediction. All four diagonals have their own `frames.files` blocks; `mirrors` is `{}` (retired at s37, *"Robin call: no mirrors for the asymmetric hero"*).

**The reassignment made the suite agree with the runtime — and the runtime is wrong.** With contract-correct keys restored, at heading `se` the runtime serves `char-hero-sheet-rotation2-f-r0c3.png` (an **east** frame) while diagnostics correctly report `direction: 'se'`. So direction resolution is fine; **art selection for diagonals is not**.

Root cause, read at source: `SpriteAnimator.pickClip` (`src/assets/SpriteAnimator.ts:428`) tests `runtime.orientations.has(clipDirection)`. When the diagonal misses that map, `:429` falls back to `runtime.rotationMirrors` — which the contract retired to `{}` — so no clip is found, and control drops to the coarse fallback at `:443-447`, which serves a pure-side clip. The contract's explicit diagonal blocks are never consulted. **Why it stayed invisible:** the `-f-` staleness failed the test at row 1, so no run ever reached row 2.

Player-visible consequence: walking NE/SE/NW/SW shows the hero in pure east/west art.

**Not fixed here** — this is a src defect in `SpriteAnimator`, outside this slice's firewall, and the corrected master's own scope 2 defines *"runtime disagrees with the contract"* as a **STOP**, not something to encode. Corrective queued: `tasks/lane-vp-02e-diagonal-clip-resolution.md`. The table is merged at **contract** values so the red is honest and reproducible; it is not a new red.

### F-1135-2 — `MOVE_KEYS` reorder is unexplained (non-blocking)

The runner reordered `MOVE_KEYS` from `['KeyW','KeyA','KeyS','KeyD']` to `['KeyA','KeyD','KeyW','KeyS']`. It affects release order only, is harmless, and the report does not mention it. Accepted; noted so a future reader does not mistake it for meaningful.

## Note for the lane-a drain

`lane-vp-02-anim-key-staleness` repairs the same `-f-` class in `e2e/vp-02-sprite-animation.spec.ts`. Its self-check expects the repair to clear reds. **It will not clear all of them** — F-1135-1 says any assertion that exercises a diagonal walk cell stays red until `SpriteAnimator` consults the explicit blocks. Gate that slice against the per-test list, not against a green count.
