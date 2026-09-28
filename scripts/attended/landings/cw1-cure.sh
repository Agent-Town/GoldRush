#!/bin/bash
# cw1 cure (in the chain after the merge): republish the hand-kept mask-table mirror, write the report the implementer's
# harness refused, declare the two owner-facing findings as desk rows.
G=$1
node - <<'NODE' >> "$G" 2>&1
const fs=require('fs');const p='assets/contracts/epoch-3-voltage/mask-tables/e3-canyon-works.json';
let t=fs.readFileSync(p,'utf8');const n=(t.match(/"creekBlendStart": -8,/g)||[]).length;
if(n!==1){console.log('mirror: expected exactly one creekBlendStart -8, found '+n+' — needs hands');process.exit(1)}
fs.writeFileSync(p,t.replace('"creekBlendStart": -8,','"creekBlendStart": -14,'));console.log('mirror: creekBlendStart -14');
NODE
node --test scripts/e3-mask-tables.test.mjs > /dev/null 2>&1 && echo "mask-tables guard green" >> "$G" || { echo "mask-tables guard RED after the mirror edit — needs hands" >> "$G"; exit 1; }
mkdir -p artifacts/canyon-works-traversal-1; cat > artifacts/canyon-works-traversal-1/report.md <<'REPORT'
# canyon-works-traversal-1: implementer report (written by the attended drain from the implementer's final message; its harness refused the file)

Branch `fix/canyon-works-traversal-1`, Opus 5.5 at max effort, 2026-09-25, cut at `90a26053c`. Seven commits: `8bb893bfd` contract, `e564dffe6` spec, `063243a57` tables, `3ab86f977` boards, `ec8348bba` phone acceptance, `b416b64cd` desktop acceptance, `2bba21639` drain logs.

## The change
One line in the `e3-canyon-works` elevation block: `creekBlendStart` -8 to -14. `creekBlendEnd` (-6), `creekHeight` (0.5) and `railHeight` (-1) unchanged, so the amplitude stayed. Why 8 m: the run this map's own t1 ramp and the Hill Mine's 1.5 m terraces already use; the Hill Mine's 7 m window would read 0.3192, a margin of only 0.031. In sim terms the works bench holds 0.5 to z -14, then drops 1.5 m over 8 m; the channel is exactly -1 from the shallows (z -6.25) through the ford.

## Peak gradient (the sim's own simSlope and isTraversable, loaded through vite SSR the way gr-sim does)
Before: 1.0313 at z -7; the band z -7.87..-6.13 refused at x 0, +/-24 and +/-44 (Astra's stop at z -7.88 reproduced). After: 0.2798 at z -10, margin 0.0702 under 0.35, no refused point. On foot: 6 of 6 pylon sites and the bridge reachable (before 4 of 6, bridge not).

## Float or sink: 0.000 m
The render stands the hero on the GLB's baked grid, a constant 0.06 m lift, on 142/139 bank samples in plain boards at 1280 and 390, zero console or page errors. The sim ground now sits up to 1.44 m below the visible bank because the GLB keeps its 1.5 m face at z -8..-6 (131 of 142 samples differ by more than 0.3 m): F-CW1-2 for the art owner.

## Moved floors: none
`null-floor-anchors --check` 83 of 83; both canyon seeds' view streams byte-identical to the pins. Engine hash c63def1b... to 3f4e5c11f74f0b6eba83b046a368d1b848d0b79b04f7e1cb643cae52c6b229d2 (the drain pins it).

## Tests
`e2e/e3-canyon-works-traversal.spec.ts` green on both projects (bridge and x +/-24 pass z -6 at 1.75 s of sim, no stalls); `e3-canyon-works`, `task-025`, `m2-01` 28/28 unchanged; tsc, build, GR_RELEASE=e1 build rc 0; guard trio 25/25. Acceptance (Astra's spec unchanged, GR_NATIVE_PROOF=1, both projects): traversal passes (crossed=true, hero at z -5.53); first failing assertion `secures` (driver.ts:949, "CONNECT deadline missed ... gold=0"): the hero crosses the bridge and stops at z 19.8, the foot of the t2 ramp, so no seam is reachable and the purse stays 0. Desktop attempt 1 never booted (another worktree's dev server re-optimised the shared node_modules/.vite mid-load; kept in the evidence); attempt 2 used a private vite cache.

## Reds for the drain (caused by this change): e3-mask-tables (the mirror said -8; republished by the drain), engine-era-guard and bench-seeds (the hash; pinned by the drain). Pre-existing: er01-e3-census canyon row expects byWave 6 while the contract says 8 since the owner's 2026-09-06 ruling.

## F-CW1-1 (blocks the win)
The t2 ramp (0.5 to 4.5 m over z 18..28) peaks at 0.598 and refuses z 19.8..26.2 at every x; all 4 seams, both galleries, the lamps and the turrets stay unreachable. The spec wants "switchback descents (slope-legal)". Measured in memory only: windows 13..33 (peak 0.2998) or 14..32 (0.333) open every gallery target; gt-03's goal-side rows may rely on this wall (not run against a change).

Evidence: before/after slope tables, `boards/`, `native/`, `moves/` beside this file.
REPORT
node scripts/attended/desk-row.cjs F-CW1-1 "(2026-09-25, from the canyon-works-traversal-1 landing): the Canyon Works is STILL not winnable on foot; the second wall is the t2 ramp.** With the creek bank cured (peak gradient 1.03 to 0.28, all six pylons reachable), Astra's acceptance now stops at the foot of the t2 ramp (0.5 to 4.5 m over z 18 to 28, peak 0.598 against the 0.35 limit, refused z 19.8 to 26.2 at every x): all four seams, both galleries, lamps and turrets unreachable, purse 0. The spec wants switchback descents that are slope-legal; a window of 14 to 32 (peak 0.333) opens every target. Recommendation: the contract-only corrective \`canyon-works-traversal-2\` (widen to 14 to 32, re-baseline gt-03 with the reason, Astra's acceptance to \`secures\`), which the attended session authors and runs on the same subscription unless you say the wall is intended." >> "$G" 2>&1
node scripts/attended/desk-row.cjs F-CW1-2 "(2026-09-25, from the canyon-works-traversal-1 landing, art): the Canyon Works bank face in the GLB no longer matches the sim ground.** The sim bank now drops 1.5 m over 8 m (z minus 14 to minus 6) while \`canyon-works-terrain.glb\` keeps its 1.5 m face at z minus 8 to minus 6, so the hero walks a sim ground up to 1.44 m below the visible bank (131 of 142 samples differ by more than 0.3 m; the render stands the hero on the GLB's baked grid, so nothing floats or sinks on screen). Regrade the bank face in the GLB and its terrain-contract copy: an art-slot batch, image edits of existing art per the consistency law." >> "$G" 2>&1
git add -- assets/contracts/epoch-3-voltage/mask-tables/e3-canyon-works.json artifacts/canyon-works-traversal-1/report.md tasks/BACKLOG.md && git commit -q -m "drain: canyon-works-traversal-1 — the mask-table mirror republished (creekBlendStart minus 14), the report written from the implementer's message, F-CW1-1 (the t2 wall) and F-CW1-2 (the GLB bank face) declared as desk rows

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>" && echo "cure cw1: committed $(git rev-parse --short HEAD)" >> "$G"
