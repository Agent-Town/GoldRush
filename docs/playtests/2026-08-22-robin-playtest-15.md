# Robin playtest 15 — 2026-08-22, live production (agenttown.app/goldrush)

**Build context**: live production Pages (E1-only release build, GR_RELEASE=e1, the deploy behind the /goldrush worker proxy). First owner run on the shipped E1 walk since the county went machine-verified. Two screenshots archived in Messages (wave 17, e1-night-shift, "Claim Paused" panel + a zoom of the pin scene).

## His words, verbatim
> "Is it correct to do the testrun at https://agenttown.app/goldrush ? I played through the first three levels, got stuck in the night floor once - could not move anymore"

## Triage

### 1. EXPECTATION — the testrun venue (answered, no task)
Production `https://agenttown.app/goldrush` is the right venue for the E1 launch walk: it is exactly what a visitor gets (E1-only by his own ruling, 2026-08-22 "that is the production page - I don't think we should deploy E9 there"; the `?debug` door is stripped there too). E2+ testing (his coal/pressure intent) lives on the full preview build: `https://preview-e9.gold-rush-3in.pages.dev` (verified 200 today). Told him both.

### 2. BUG — **F-PT15-1: the hero pinned unmovable at the lampworks_yard corner (e1-night-shift, wave 17)** → task `tasks/c3-hero-move-pin.md` (lane-c, codex)
Verified mechanism map (read at source, this session):
- The black slab in his screenshots is `lampworks_yard`, night-shift's only landmark blocker (rect 8.604×4.248 at (8,18), `assets/pilots/map-rebuild-spike/landmark-collision-contract.json` maps.night-shift), rendered black under night darkness.
- The pin lever: `Hero.ts:141` scales target velocity by the CURRENT cell's `speedMul` — any `walkable:false` cell is an absolute pin from inside.
- The verified entry vector: the axis-slide fallback (`Hero.ts:177-180`) never re-checks the combined `(nextX, nextZ)` — a diagonal approach can commit a position inside a padded blocker corner. His hero sat exactly at the yard's corner.
- The escape gap: the only per-frame heal (`Hero.ts:136` → `Game.ts:3042`, `depenetrateFromBlockers`) consults blockers ONLY — terrain-unwalkable cells (deep water, out-of-bounds, elevation) have no heal at all, and the heal itself can push onto them (`LandmarkCollision.ts:86`).
- Corroboration in his own zoom: an outlaw stands frozen INSIDE the yard — enemies share the speedMul law (`Game.ts:2336`), so the footprint is enterable in live play and pins whatever enters.
- Darkness itself provably does NOT gate movement (LightField is coverage math; consumers are render cutoff + the in-dark enemy multiplier `Game.ts:5934-5935`) — "the night floor" was the stage, not the mechanism.
- WHY his pin persisted (the heal should recover a corner clip in ~1 frame) is the master's INVESTIGATE half; the cure (combined-position re-check + full-sample escape + watchdog diagnostic) ships regardless.

### 3. BUG — **F-PT15-2: a run suspended while pinned restores INTO the pin** → same task, scope 4
`RunSuspend.ts:926-931` (`restoreHero`) copies the saved position verbatim with no walkable-seek (spawn has one, `Game.ts:4163`). His panel read "Ledger saved at wave 16" at the pin — his saved claim may itself be poisoned. The cure gives restore the spawn path's nearest-walkable relocate, with a poisoned-save e2e probe.

### 4. CONFIRMATION — banked
The shipped E1 walk is playable through its first three contracts on live production by the owner, cold, no coaching. Not yet the full launch blessing (that is his call at the end of the walk, vE1.0 tag + announcement per the launch list), but the walk's front half held.

## Filed this pass
- `tasks/c3-hero-move-pin.md` authored + leaf `c3-hero-move-pin` + dispatched to `tasks/queue/lane-c/` (codex, per the 2026-08-22 routing ruling).
- BACKLOG row F-PT15-1/-2 (same commit as this file).
- Open with him: nothing blocking — he can keep walking E1; if the resumed night-shift claim is still pinned, abandon it for a fresh claim until c3 lands and deploys.
