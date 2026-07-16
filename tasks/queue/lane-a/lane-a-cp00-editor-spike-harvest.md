# Task lane-a-cp00-editor-spike-harvest: CP-00 — harvest the editor spikes into main's L1/L2 substrate (LANE-A, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-a.
CODEX: model=gpt-5.6-sol effort=high
READ FIRST: AGENTS.md; specs/charter-press/README.md (§laws + CP-00 — this task IS that slice); src/editor/ on your base (DescriptorInspector.ts, PlacementEditor.ts, TerrainBrush.ts — what already lives on main behind ?editor); the four spike branches (read via git, do NOT blind-merge): origin/sol/ed-02-brush-v2 (terrain brush), origin/sol/ed-02-terrain-brush (v1 + its "terrain substrate blocker" review — read the blocker finding FIRST), origin/sol/ed-03-placement-validator, origin/sol/ed-04-gizmos (touches TerrainBrush + ContractFamilies), origin/sol/ed-05-palette (touches DescriptorInspector).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (charter-press CP-00; owner 2026-07-17: "What about E10 and the Charter Press?... Take your time but do them perfect.")
Four editor spikes sit banked on sol/ branches while main's src/editor carries a partial L1. Before ANY charter work (CP-01+), main must hold the best-of-spikes as one coherent, fully ?editor-gated substrate — and an honest map of what L2 still lacks.

## Scope
1. **Per-branch audit** (all four + the ed-02 v1's blocker review): what does each add over main's current src/editor? Is it still compatible (main moved — check what each branch's touched files look like on main today)? Verdict per branch: HARVEST (apply cleanly), RE-LAND (wanted but stale — reimplement the idea fresh, citing the spike), RETIRE (superseded by main).
2. **Execute the verdicts**: land harvest/re-land work as SMALL separate commits (one branch's content per commit, `feat(editor):` prefix), everything strictly behind the existing ?editor flag — zero plain-boot surface change.
3. **The L2 gap map**: artifacts/cp00-editor-harvest/report.md — matrix: capability (brush / palette / gizmos / validator / inspector) × state (on main / harvested / re-landed / retired / MISSING), plus the ed-02 blocker's current truth (does the terrain substrate issue still hold on today's main, post-15/15-slate?).
4. Retired branches: list them for the archive/ lifecycle in the report (do NOT delete branches — attended archives).

## Firewall
Touch ONLY: src/editor/**, editor css, the ?editor install site in main.ts if wiring needs it (≤10 lines), the report. NO gameplay/sim files (if a spike touched ContractFamilies.ts, evaluate WHY — if its change is editor-read-only, land the editor side and REPORT the ContractFamilies need instead of applying it), NO new player-facing surface, NO charter schema work (that is CP-01, not yours).

## Self-check (evidence, not vibes)
tsc + `npm run build` green. Plain boot: zero console/page errors AND byte-identical behavior (no ?editor = no editor code runs — verify via a plain-boot probe). ?editor boot: zero console errors, each landed capability demonstrably present (screenshot per capability to reviews/shots-cp00/). Adjacent unmodified-green both projects: task-025 baseline. task-level e2e for the editor is NOT required this slice (debug tooling) — the probes + screenshots are the evidence.
No-op guard: if you exit without changes, WRITE WHY into your report first.
End: READY-FOR-GATES + the harvest matrix + the L2 gap map + the ed-02 blocker's current truth.
