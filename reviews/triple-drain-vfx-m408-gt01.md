# Review — triple drain: vfx-layering + M4-08 attribution + GT-01 substrate (attended, s61, 2026-07-07 ~13:35)

**Verdict: PASS ×3 — merged serially (0b8xxx/…/b846a32), one combined battery.**
**Forensic context (why this drain existed):** s115/s116 fires ANNOUNCED these drains in lock commits, then deferred — the announcements were read as completions by later sessions (including attended s61, which falsely marked w1-07 SHIPPED off a message-grep). Ground truth at 13:25: all three sat unmerged on their lanes; w1-07 had self-stopped TWICE at pre-flight (correctly — lane/polish held the unmerged vfx commit). This review corrects the record. New law: CLAUDE.md Mistake #16.

## What merged
1. **vfx-layering** (lane/polish 094d9fe): `src/core/RenderLayers.ts` ladder (terrain < decals < entities < impact-vfx < world-UI) — grenade/blast explosions render ABOVE rubble decals (owner finding, "a real gap"). Embodiment + generated.ts touched for layer constants.
2. **M4-08 attribution** (lane/m4): actor-tagged economy events (EventBus/Economy), run-ledger split lines ("Panned: you X / the Prospector Y") per owner ruling "attribute everything". Player-only runs show no split (proven).
3. **GT-01 substrate** (lane/perf): `src/sim/TileHeight.ts` data module, flat-identity epoch-1 (all-zero heights — zero behavior change), tile-descriptor socket in the epoch manifest, `simHeightDiagnostics()` seam. The gameplay-terrain ladder's foundation.

## Evidence
Each output's own run: green self-checks (m4-08's Codex-review step alone was skipped — OAuth revoked mid-run, noted, tests passed). Attended battery on the TRIPLE-merged tree: tsc CLEAN · build green · **57/57 both projects** (all 3 own specs + task-025 + m1-01 + m2-01 + m4-06 + perf-02 bench incl. determinism envelopes).

## Merge classification
Pairwise-disjoint surfaces verified pre-merge (vfx: RenderLayers/Embodiment/BuildSystem-render · m4-08: EventBus/Economy/ledger-UI · gt-01: new sim module/manifest/diagnostics). ONE conflict total: gt-01's diagnostics line vs M6's `primaryActor` rename — resolved main-wins + kept the new `sim:` diagnostics line. vite-env auto-merged (known additive-collision file).

## Findings
- **F-S61-1 (resolved in-pass):** the announced-drain record corruption — w1-07's false SHIPPED line reverted; w1-07 re-queued on the now-clean lane/polish (picked up 13:33, RUNNING).
- lane/m4, lane/perf, lane/polish all 0-ahead post-merge; no salvage needed.
- Next drain pile (fires, PILE MODE, suggested order): **045 megaproject → audio-integration → w1-05 → gt-02 → edge-read** (045 + audio are owner-facing unlocks).
