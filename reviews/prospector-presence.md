# Review — prospector-presence ("the owner couldn't find his robot")

**Drain:** s106 fire, drain 2 of PILE MODE. Source `lane/m4 de3cd6d` (lane-b).
**Verdict:** PASS — grafted to main.

## What it does (owner F-0707-5a/5b from playtest-02)
Makes the Prospector companion present and alive in normal play: idles near the hero
from frame one, first-contact ledger-voice beat once per run, permission chip wired
(portrait + level + abilities + growth), floats above terrain (F-0707-5a half-sunk fix),
and acts at level 0 (follow-drift, ledger observations, XP-mote gathering — F-0707-5b inert fix).

## Graft method
Base `15f8116`. Main drifted since base ONLY on `src/vite-env.d.ts` (additive anim-diagnostics
hunk @378); everything else (Game.ts, CombatSystem.ts, Hud.ts, Embodiment.ts, XpMote.ts,
styles.css, m4-05/m4-06 specs) had NO main drift → loss-free `git checkout lane/m4 -- <files>`.
`vite-env.d.ts` hand-merged: lane's embodiment fields (drifting/terrainY/clearance @213) are
disjoint from main's anim hunk @378 → both applied.

## Gate (native, port 5188, serial to dodge the concurrent-load artifact below)
- `npx tsc --noEmit` clean; `npm run build` green
- **m4-06 embodiment 9/9 + m4-05 closeout + m4-01 tool-surface + task-027 + combat-readability = 40/40 both projects** (serial). New prospector assertions all green: plain-boot presence w/ no debug gate, chip (portrait/level/abilities/growth), floats above terrain at 3 probe points, XP-mote gathering when permission allows, defers gather for higher-priority receipt, sprite loads/faces pan, no collider.
- **m1-01 + m2-01 20/20** both projects — incl. stress draw calls <200 with palisades/beacons (CombatSystem.ts change did not bust the budget)
- **boot probe 2/2** — plain boot (`?nowaves&nolevel`), prospector visible, zero console/page errors, shots `reviews/shots-prospector-presence/`

## Finding F-S106-1 (env, NON-blocking, PRE-EXISTING — flag for Robin/next fire)
task-027-victory-must-matter **double-counts meta tracks (+2 instead of +1) when run in
PARALLEL (4 workers) alongside the m4-05/m4-06/m4-01 specs.** PROVEN pre-existing, NOT prospector:
- Clean main f204710 (prospector reverted), combined 4-worker batch → task-027 desktop FAILS identically.
- Clean main, same batch, `--workers=1` → 26/26 GREEN.
- task-027 ALONE (with or without prospector) → 2/2 GREEN.
This is the documented concurrent-load flake family (cf. F-042-1, combat-readability p95). It may
also hint at a real re-entrant victory→award path that only fires twice under timing pressure — worth
a dedicated look, but out of this drain's scope. Recommend a `fix-task027-parallel-isolation` corrective.
