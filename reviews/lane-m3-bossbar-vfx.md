# Review — lane/m3 drain: boss health-bar semantics + terrain-anchored world VFX

**Slice/branch/tip:** `lane/m3` @ `06f0e1b5` (2 commits: `d46e1c34` lane-boss-healthbar, `06f0e1b5` lane-vfx-visualy) · base `257e72fd` (07-19 15:18) · merged onto main `4caa128d`.
**Drained by:** s746 fire (recovered s745's DEAD mid-graft — see F-2).
**Verdict:** ✅ MERGE — both owner-directed playtest fixes; tsc+build green, both slice specs green ×2 projects, adjacent battery 24 green, boot probe zero-error ×2. One pre-existing main red (065, F-1) proven graft-independent — non-blocking.

## What it does
Two owner playtest fixes, both landed on lane-a:
1. **Boss health-bar semantics** (owner verbatim 2026-07-19: *"can we make it green and when he takes damage that part of the bar gets red? that is really easy to understand."*). The shared boss bar (`EnemyPool` in `src/entities/pools.ts`) now renders REMAINING = green, DEPLETED = warm red via `BOSS_HP_STYLE` tokens (health: `#6bb36b`/`#a0522d`; edge `#f5e6c8`). Bars carry a `semantic: 'health' | 'resistance'` — the Old Digger's no-kill **resistance** bar keeps its distinct dark-red read (`variantId === 'old_digger' → 'resistance'`), every other boss + the Baron = health. A `publishBossHpBar()` seam writes `data-boss-bar-*` datasets (visible/semantic/remaining/depleted/colors) on `#game-canvas` for the spec. Materials gain `toneMapped:false, fog:false` for stable warm color.
2. **Terrain-anchored world VFX** (owner, Twin Banks 2026-07-19: *"the animation from collecting seems is swallowed by the terrain"*). New `Terrain.visualAnchorY(pos, lift)` wrapper over `visualY`; float texts, gold floats, xp motes, seam-collect bursts, combat puffs/rings/ticks, and the blast-aim reticle now ride `visualAnchorY` + a small lift instead of the flat y-plane, so they float above raised sculpt. Harvest gold float also gains a 1.7× scale. `lastFloatText` diagnostics seam added for the spec.

## Merge classification (base 257e72fd → main; stale-base 3-way graft)
| File | Class | How resolved |
|------|-------|--------------|
| e2e/lane-boss-healthbar.spec.ts, e2e/vfx-visualy.spec.ts | LANE-NEW | direct from lane |
| reviews/shots-bossbar/*.png (2) | LANE-NEW | direct from lane |
| src/entities/GoldPickup.ts, XpMote.ts | LANE-TOUCHED-only | `checkout lane/m3` (main did not move) |
| src/systems/CombatVfx.ts, HarvestSystem.ts, PressureSystem.ts, Vfx.ts | LANE-TOUCHED-only | `checkout lane/m3` |
| src/world/Terrain.ts | LANE-TOUCHED-only | `checkout lane/m3` (additive `visualAnchorY` only) |
| **src/entities/pools.ts** | **BOTH moved** | 3-way: lane boss-HP hunks (≤L1211) hand-applied; main's changes (L1454-1600) untouched — **disjoint regions** |
| **src/game/Game.ts** | **BOTH moved** | 3-way: 3 lane hunks (floatText scale, `lastFloatText` diag, blast reticle `visualAnchorY`) hand-applied onto main; main's 177-line delta preserved |
| **src/vite-env.d.ts** | **BOTH moved** | 3-way: lane's `lastFloatText` type line added into the ThreeGameDiagnostics.vfx block; main's other additions preserved |

Faithfulness verified: worktree-vs-lane diff for pools.ts confined to main's L1479-1602 region only; all 5 lane additions present (grep count = 1 each); tsc clean.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built 1.24s |
| e2e/lane-boss-healthbar.spec.ts | ✓ desktop + mobile (green life over red loss) |
| e2e/vfx-visualy.spec.ts | ✓ desktop + mobile (seam-collect float stays above raised terrain) |
| e2e/vfx-layering + e9-boss-old-digger + combat-readability | 24 passed |
| e2e/065-shots-follow-terrain | 2 failed — **F-1, pre-existing, graft-independent** |
| _s99 boot probe (zero console/page errors) | ✓ desktop + mobile |

## Findings
- **F-1 (non-blocking, PRE-EXISTING main red):** `065-shots-follow-terrain.spec.ts › flat Claim shots keep the old zero-height bolt plane` fails desktop+mobile: `expected.startY` = `terrainVisualY(x,z,0.72,padRadius)` returns **1.05** with `world.terrainRelief=0` + `terrainFeatureRelief=0`, expected **0.72** (Δ 0.33 = `samplePaddedHeight` not flattening to 0). **Proven graft-independent:** the value derives solely from `Terrain.visualY`/`samplePaddedHeight`, which `git diff HEAD -- Terrain.ts` shows are byte-identical between main and this graft (lane's only Terrain change is the additive `visualAnchorY` wrapper). Root cause is a main-side terrain-relief-flatten gap (relief=0 no longer zeroes padded height on flat Claims) unrelated to lane/m3 — flat claims may show bolts floating ~0.33 above plane. **Recommend an attended corrective** (why relief=0 doesn't flatten samplePaddedHeight — gameplay-terrain territory).
- **F-2 (process, resolved):** s745 fire died mid-3-way draining this lane — staged 11 lane-touched files, left pools/Game/vite-env.d unstaged mid-resolution, wrote no review. s746 discarded the untrusted partial graft (Mistake #15) and redid the 3-way clean. No lane content lost (lane/m3 immutable).
