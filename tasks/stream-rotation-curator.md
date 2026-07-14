# stream-rotation-curator — the channel gets a program director (lane-d; commit prefix "feat:")
ROLE: pipeline tooling. WORKDIR: lane-d (worktrees/lane-d). CODEX: model=gpt-5.6-sol effort=medium
ATTENDED-AUTHORED 2026-07-14 — owner: "the stream will extend over time? Should we not rotate the content itself and make sure there is a good distribution of certain content segments?"

Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.

## READ-FIRST: docs/marketing/STREAMING.md (the delegation boundary — approved classes ONLY, manifest = the reviewable action) · assets/stream/loop-manifest.json (current schema) · scripts/stream-sync.sh (consumes the manifest; numbering = order).

## SCOPE:
1. `scripts/stream-curate.mjs` (node, no deps beyond ffprobe for durations): reads content POOLS (marketing/raw/gen reels, marketing/raw/stream captures, era cards, ceremony recordings — approved classes only), applies the ROTATION POLICY, rewrites loop-manifest.json deterministically (seeded by date so each day's program differs but reruns agree).
2. POLICY (constants at top, documented): target loop 35-45 min · mix ≈ 50% gameplay / 25% reels / 15% cards / 10% ceremonies (by duration, cards count as their still-duration) · interleave pattern card→gameplay→reel→gameplay→ceremony (cycled, classes skipped gracefully when pools are thin) · freshness: newest-N per class in rotation + 1-2 dated "classics" resurfacing per curation · never two items of the same class adjacent when avoidable.
3. Provenance guard: only files matching the approved-class pools enter; anything else in the pools dirs is IGNORED with a log line (never an error). Manifest entries keep the class-delegation approval tag; schema stays sync-compatible.
4. Fire duty line: append to docs/marketing/STREAMING.md — curate runs before sync each fire cycle (curate → sync → watchdog).
5. FADE LAW (owner: white flashes between clips): every clip normalizes through a 0.25s fade-in/out from/to BLACK before concat (the hand-built v2 pipeline in ~/GoldRushStream/.faded is the reference — per-clip intermediates make the final concat a stream-copy, so daily rebuilds are fast).
6. HEADLESS CAPTURES ARE BANNED from the pools (owner: "gameplay is very slow" — headless browsers throttle the frame loop): only real-speed footage enters (owner OBS recordings, or future headed captures on a virtual display). The three 07-10 headless webms stay retired.
7. PLAYLIST LAW (owner ruling 2026-07-14: live-mutable playlist, NOT a compiled file — "the playlist could also be changed while I am not at the PC and the stream will be changed"): the deliverable chain is manifest → sync → loop/loop.json → scripts/stream-player.html (the OBS Browser-source player, SHIPPED — it re-reads loop.json between clips). The curator only ever edits the manifest; NO program.mp4, NO re-encoding beyond the per-clip fade normalization.
8. Validation: a --check mode prints the program (order, durations, mix percentages) without writing; a unit-ish node test (node --test) asserts mix bounds + interleave rules + determinism on a fixture pool. npm build unaffected.

## Firewall
Touch ONLY: scripts/stream-curate.mjs, assets/stream/loop-manifest.json (regenerated), the STREAMING.md duty line, the node test, artifacts/stream-curator/. NO stream-sync.sh changes (it already consumes order), NO OBS/publishing anything, NO content generation.

## Self-check
node test green · --check output shows a legal program from the CURRENT pools (paste it in the report) · stream-sync.sh runs clean on the regenerated manifest · tsc/build untouched-green.
If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + the day's program listing + mix table.
