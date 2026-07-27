# vp-02e runner report — diagonal clip resolution

- **Slice:** `lane-vp-02e-diagonal-clip-resolution`
- **Branch / base:** `lane/m4` from `main` @ `ccdf0668`
- **Status:** **READY-FOR-GATES**

## Pre-repair runtime measurement

Measured on desktop Chromium at 1280×800 before changing `src/`, using a plain
debug boot and live `spriteAnimations['char.hero']` diagnostics. The boot
reported zero console errors and zero page errors.

| heading | runtime `direction` | runtime `frameKey` |
|---|---|---|
| `s` | `s` | `char-hero-sheet-rotation-f-r0c1.png` |
| `se` | `se` | `char-hero-sheet-rotation2-f-r0c2.png` |
| `e` | `e` | `char-hero-sheet-rotation2-f-r0c2.png` |
| `ne` | `ne` | `char-hero-sheet-rotation2-f-r0c3.png` |
| `n` | `n` | `char-hero-sheet-rotation-f-r2c1.png` |
| `nw` | `nw` | `char-hero-sheet-rotation-f-r1c0.png` |
| `w` | `w` | `char-hero-sheet-rotation-f-r1c1.png` |
| `sw` | `sw` | `char-hero-sheet-rotation-f-r1c1.png` |

This refines F-1135-1: the final runtime map does contain diagonal keys, but the
active `walk8.aliases` builder pass overwrites each explicit diagonal rotation
orientation with its pure-side alias (`se`/`ne` → `e`, `sw`/`nw` → `w`). The
walk-only diagonal blocks are loaded successfully before that overwrite; absence
of an `idle` clip and key normalization are not the cause.

## Repair

`createRuntimeSlot` now declines a hero walk-sheet alias when
`char.hero.rotations.directions` already owns that target direction. This is
one guard in the shared builder: the hero's explicit contract art wins, while
aliases still serve other slots and slots that have no explicit block.
`OrientationResolver` and the coarse fallback are unchanged.

The clean-refactor/review pass found that a generic explicit-direction guard
would also preempt Claim Jumper's walk8 aliases. The guard is deliberately
scoped to `char.hero`, leaving that separate slot's current and future contract
unchanged.

Post-repair runtime diagnostics:

| heading | runtime `direction` | sampled runtime `frameKey` |
|---|---|---|
| `s` | `s` | `char-hero-sheet-rotation-f-r0c1.png` |
| `se` | `se` | `char-hero-sheet-rotation-f-r0c3.png` |
| `e` | `e` | `char-hero-sheet-rotation2-f-r0c3.png` |
| `ne` | `ne` | `char-hero-sheet-rotation-f-r1c3.png` |
| `n` | `n` | `char-hero-sheet-rotation-f-r2c1.png` |
| `nw` | `nw` | `char-hero-sheet-rotation2-f-r1c0.png` |
| `w` | `w` | `char-hero-sheet-rotation-f-r1c0.png` |
| `sw` | `sw` | `char-hero-sheet-rotation2-f-r0c1.png` |

The post-repair probe and screenshot boot each reported zero console errors and
zero page errors.

## Fallback proof

`char.bandit_base` has no `rotations` block and still resolves through its
`walk8` contract. A live `spawnPack(1, 5)` assertion passed on desktop and
mobile: `clip: walk`, `frameCount: 8`, and all eight
`char-bandit-base-sheet-walk8-r0c0.png` … `r0c7.png` frames were observed.
Both boots reported zero console errors and zero page errors.

## Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — green.

### `e2e/vp-02b-rotation-resolver.spec.ts`

| Test | desktop-chrome | mobile-chrome |
|---|---|---|
| `hero locomotion resolves all 8 contract directions` (`:113`) | PASS | PASS |
| `resolver hysteresis holds across small boundary oscillation` | PASS | PASS |
| `idle resolver keeps pure sides and snaps diagonals to hemispheres` | PASS | PASS |
| `pure side idle stays side while diagonal idle snaps to a hemisphere` | PASS | PASS |
| `east and west idle cells resolve explicitly while southeast stays south` | PASS | PASS |
| `action clips stay on coarse orientation cells and jumper diagnostics stay old shape` (`:233`) | KNOWN RED: waits for absent `char.claim_jumper`; `spawnPack()` exposes `char.bandit_base` | same |
| `captures rotation scale-pulse review shots` (`:292`) | STALE RED: waits for NE to emit east keys | same |

The `:292` red is a contradictory stale assertion exposed by the repair:
`:113` requires NE's contract keys
`char-hero-sheet-rotation-f-r1c2/c3.png`, while `:292` still waits for the
retired east keys `char-hero-sheet-rotation2-f-r0c2/c3.png`. It passed only
while the defect was present. The task firewall excludes this test file, so it
was reported rather than rewritten.

### Adjacent `e2e/vp-02-sprite-animation.spec.ts`

Measured before in a detached worktree at base `ccdf0668`, then after in this
lane. Outcomes are unchanged on both desktop-chrome and mobile-chrome:

| Test | Before | After |
|---|---|---|
| `hero test clip advances on sim time and holds during hit-pause` | PASS | PASS |
| `missing sheet cells fall back to the existing one-frame billboard without drift` | RED: stale non-`-f-` route/key | same |
| `warmed test clip swaps do not grow renderer memory or draw calls` | PASS | PASS |
| `hero rotation contract fires both stride cells for all 8 headings` | RED: stale non-`-f-` keys | same |
| `hero walk frameKey alternates while each 8-way heading is held` | RED: stale non-`-f-` keys | same |
| `east heading uses explicit rotation2 files with unmirrored pixels` | RED: stale non-`-f-` keys | same |
| `damped heading sweep visits every orientation in order` | PASS | PASS |
| `180-degree reversal crosses intermediate orientations` | PASS | PASS |
| `small boundary wiggle does not oscillate orientation` | PASS | PASS |
| `orientation swap crossfades once and adds no draw call at rest` | PASS | PASS |
| `captures VP-02 desktop and narrow screenshots` | RED: waits for absent `char.claim_jumper` | same |

This is the expected lane-a-owned staleness cluster plus the known jumper-slot
red; no adjacent outcome regressed.

## Desktop diagonal screenshots

- `reviews/shots-vp-02e/desktop-chrome-walk-se.png`
- `reviews/shots-vp-02e/desktop-chrome-walk-ne.png`
- `reviews/shots-vp-02e/desktop-chrome-walk-nw.png`
- `reviews/shots-vp-02e/desktop-chrome-walk-sw.png`

Each was captured mid-`walk` after asserting its diagonal direction and its own
contract frame key.
