# Review — fix-enemy-pathing-wrecker-read-2 (finite-line routing corrective, RE-LAND of attempt-1)

- **Slice:** enemy-pathing / wrecker gap-flow — attempt-2 (finite-line routing fix + attempt-1 wins re-landed)
- **Branch/tip:** `lane/m3` @ `276fd778` (single runner commit on base `98019311`)
- **Merged to main:** `7161d36b` (--no-ff merge, s471 drain)
- **Salvage-ref:** attempt-1 `d010af89` = `save/enemy-pathing-wrecker` (the rejected tip whose verified wins were re-applied verbatim)
- **Verdict:** ✅ PASS — MERGED. Supersedes the attempt-1 REJECTION in `reviews/fix-enemy-pathing-wrecker-read.md` (F-1 fixed).

## What it does
The lone-enemy finite-palisade-line stall (attempt-1's regression) is fixed. attempt-1 committed a blocked enemy to the nearest gap in a wall *run* and held its side until the run ended or the gap was reached; a **finite** line's gap is at its END, so a lone runner mis-routed/stalled past the 20s watchdog. The corrective keeps only the nearest blocker in each direction in the route graph, so clearance-sized enclosure gaps stay sealed while a dense finite line's real endpoints are no longer hidden — the runner routes around the nearest end and resumes direct pursuit. attempt-1's verified wins (crowd 8-through-a-gap, enclosure gnaw at `gnawMult=0.25` + watchdog + stop-on-breach, wrecker rust tell `#a0522d`, gnaw suspend/restore diagnostics) are re-landed unchanged.

## Evidence (independently re-run this fire, lane-a worktree @ 276fd778, both projects)
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (573ms) |
| `e2e/enemy-gap-flow.spec.ts` | **16/16** both projects — incl. new `:113` "lone runner clears a finite side-by-side palisade line" |
| `e2e/m2-01-build-menu.spec.ts` | **14/14** both projects — incl. `:220` "single enemy slides around a finite palisade line without passing through" (**the exact attempt-1 killer, was RED, now GREEN**) |
| adjacent: m1-01 / e2-escort-mode / task-025 | 24/24 both projects |
| boot probe `_s106-prospector-boot-probe` | 2/2 — zero console/page errors, prospector visible in plain boot |
| finite-line telemetry | lone runner reached `(0.03, 11.98)` beside hero `(0, 12)` @ 10s sim, `stuckWatchdogTrips: 0`, `gnawing: 0` both projects |

Runner's own report (`artifacts/enemy-gap-flow/report.md`) corroborates and fingerprints the baron battery: 10 stale baron assertions reproduce byte-for-byte on clean base `98019311` (live 240×HP / `science-complete+2-secured` vs old 160×/`science-complete` expectations + claim-sprite load race) — pre-existing, NOT introduced; 41 passed / 1 skipped, no baron spec edited.

## Merge classification
Base `98019311`; main advanced only by STATUS-only bookkeeping (s468–s471) since that base → **zero src/e2e overlap**, conflict-free `--no-ff` merge. 24 files, all within attempt-1's already-approved footprint (the exact 8 src files F-1 fingerprinted: `Enemy.ts`, `pools.ts`, `Game.ts`, `RunSuspend.ts`, `BuildSystem.ts`, `Balance.ts`, `registry.ts`, `vite-env.d.ts`) + `e2e/enemy-gap-flow.spec.ts` + `artifacts/enemy-gap-flow/`. No scope creep beyond the salvaged attempt-1 set. `m2-01` spec (the guard) UNMODIFIED — made to pass, not edited.

## Findings
- **F-1 (attempt-1 blocker) — RESOLVED.** m2-01:220 finite-line guard green both projects; new gap-flow finite-line case guards it at the unit layer.
- **F-2 (non-blocking, OWNER-CHOICE):** `Balance.wreck.gnawMult = 0.25` slightly weakens fully-sealed walls (ordinary enemy 2 dmg/0.9s gnaw vs wrecker base 8). Runner flags owner may veto/retune after playtest. Display-safe; carried to OWNER'S DESK.
- ⚠ **Process note:** runner dispatched at `model_reasoning_effort=medium` though the master asked `effort=high` (runner config, not fire-controllable). It did NOT underperform — gate is clean — so no action, logged only.
