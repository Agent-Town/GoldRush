# Review — Town T1: walkable square scene

**Slice:** Town v1 T1 (`specs/town-v1/README.md`) · **Branch:** lane/m4 · **Lane tip:** `2d9c438` · **Merged to main:** `7eb62f4` (s136 fire, hand-graft) · **Base:** `3c851cd` (m4-10, main ancestor)

## Verdict: MERGED — GREEN

## What it does
First Town v1 slice. Adds an **"Enter Town"** button to the start menu (plain boot, no
`?debug` — player-reachable, not a debug seam) that opens a walkable **town square** scene:
the player moves around a square with four building-**shell** prompts (placeholder-first,
per §3), and an exit that returns to the menu → normal claim run. New self-contained
`src/town/` module (`TownScene.ts` 378, `townLayout.ts` 50, `town.css` 109) wired through
`main.ts` (+11) and `StartMenu.ts` (button + `onEnterTown` option + action handler). Adds
`window.__GR_TOWN_DIAGNOSTICS__` for test observability. The game sim / combat / economy are
untouched — this is a separate scene reached from the menu.

## Evidence
| Check | Result |
|---|---|
| `npx tsc --noEmit` | CLEAN |
| `npm run build` | GREEN |
| town-t1-square spec — both projects | PASS 4/4 (menu→square, prompts at four shells, exit, then starts normal run; exit reachable; square renders at 390px) |
| 044-start-screen regression — both projects | PASS 12/12 (New Claim / Profile / Continue / Research / Settings all intact; plain boot still shows menu; the new Enter Town button did not disturb the menu) |
| Player-visibility (Mistake #10) | Enter Town button is on the plain-boot start menu; town-t1 spec drives it without `?debug` |
| Screenshots | `artifacts/town-t1/{desktop,mobile}-chrome-{square-overview,shell-prompt,mobile-390}.png` |

Ran single-worker (load-flake discipline from the gt-02 drain this fire). 16/16 total.

## Merge classification
Cherry-pick not allowlisted headless → hand-grafted `2d9c438` onto CLEAN main. Parent
`3c851cd` (m4-10) is a main ancestor; main drifted since only on `StartMenu.ts` (050 mute
control) and `vite-env.d.ts` (050 audio + gt-02). town-t1's hunks on both are **disjoint**
from that drift (StartMenu: menu-options type / button list / action handler; vite-env:
Window `__GR_TOWN_DIAGNOSTICS__`@552) → clean additive 3-way via Edit. New files + `main.ts` +
`044-start-screen.spec.ts` had no drift → `git checkout 2d9c438 --` verbatim.

## Findings
None blocking. **Next Town slice = T2 naming** — its master is preserved at
`tasks/failed/noop-preflight-stop-lane-b-town-t2-naming.md` (+ rc1 copy); it STOPs correctly
until T1 lands. Now that `src/town/TownScene.ts` is on main (`7eb62f4`), T2 can be re-queued
to lane-b (owner-priority, gates E2).
