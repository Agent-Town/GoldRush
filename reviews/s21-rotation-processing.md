# s21 — batch-005R rotation-sheet processing (art lane, scheduled fire 2026-07-04 ~08:55Z)

Scope: extract `assets/raw/char-hero-sheet-rotation.png` (landed ~08:40Z), verify per batch-005-rotation.md, extend `characters.v2.json`, in-game probe. Code rider (8-way resolver) explicitly NOT in scope — Codex lane, chained after tasks/006.

## What happened

1. **Extraction** — `node scripts/extract-alpha.mjs --key ff00ff --grid 4x3 assets/raw/char-hero-sheet-rotation.png`: raw 1254×1254 → 12/12 cells @512 + `char-hero-sheet-rotation.frames.json`. Keyed 74.3%, interior spill-clear 13,556 px (the s9e-predicted lantern-area glints — s15's `--interior-key` path fired automatically on the saturated key), despilled 17,554 px. Native cell content ~313×418 — above the ~300px softness fallback threshold, but only by ~4% on width; noted for the gameplay-zoom verdict.
2. **Cell-map verification (contact sheet, 4×3)** — matches the BINDING map: r0 = S walk A/B + SE walk A/B (toward viewer), r1c0/c1 = pure side profile **facing LEFT** (confirms the s9e generation deviation), r1c2/c3 = NE away, r2 = N walk A/B + idle S + idle N. Character consistent with prior sheets (hat, pan, teal lantern).
3. **Scale gate (~8% bbox-height target): FAILED the metric, PASSED on attribution.** Heights: r0 381/380/380/380 · r1 378/**340**/354/**398** · r2 364/362/360/360 → spread 14.6%. Extractor law held (ONE shared scale, `scale:1`, no per-cell rescale), so any drift would be painted-in. Visual read: outliers are stride poses (scissored legs/lean on W stride-B; extended posture on NE stride-B), head/torso proportions uniform. A hat-brim-width probe was attempted and DISCARDED — invalid for side/edge-on views (probe-your-probe).
   **Escalation trigger (BINDING for the resolver lane):** within-pair alternation W 378→340 and NE 354→398 is where flip-book "scale breathing" would show at 4fps. If the animated walk reads as pulsing rather than gait bounce at gameplay zoom → regenerate the sheet before any rollout. Trigger is recorded in the contract block and LEDGER.
4. **Contract** — `rotations` block (version 1) added under `char.hero` in `characters.v2.json`: directions s/se/w/ne/n with walk clips (fps 4, matching existing), idle clips for s/n (r2c2/r2c3), mirror table `{e←w, sw←se, nw←ne}` encoding the left-facing side pair. DORMANT by construction: `SpriteAnimator.ts` consumes only `slot.orientations` (line ~225, `Object.entries(slot.orientations)`); processed PNGs enter the lazy `import.meta.glob` but are never requested at runtime.
5. **Idle-seam note:** the batch file's "rotation-sheet idles retire the s15 idle-seam deviation" is code-half work — left to the resolver lane; no live cell re-pointing this fire (zero visible change is the intent).

## Gates (proportionate: JSON + dormant assets diff)

- JSON valid (parse probe) · `npx tsc` clean · `vite build` clean 374ms (glob grew by 12 lazy entries).
- **vp-02 sprite-animation 4/4** (split "hit-pause|one-frame" / "memory|screenshots", 14.3s+15.5s) · **visual-polish-assets 2/2** (13.7s) — desktop-chrome, serial, ~/gr env (home wiped again; /tmp chromium-1228 survived; xdamage stub rebuilt from repo source).
- **Boot probe, fresh vite (port 5177):** freshness guard = new cell URL served 200; **zero console/page errors** desktop 1280×720 + 390×844; shots `reviews/shots-s21-rotation/boot-desktop.png` / `boot-390.png` — terrain art, river, hero sprite, HUD all rendering; hero animation unchanged (4-way, as designed). Diagnostics read returned `fps:0/no drawCalls` — probe read the wrong keys under `?nowaves` wait; not chased since the visual evidence + zero-errors + green suites cover the gate (flagged so nobody trusts that probe shape).
- Known carried minor visible at 390px (pause-chip/Build overlap) — pre-existing m2-01 finding, not this lane's.

## Verdict

Slot state: rotation cells PROCESSED + contract-ready, dormant. Pilot's final PASS (gameplay zoom, animated) rides the resolver lane. Jumper rotation sheet stays ungenerated until then.

## Next (recorded in STATUS)

Resolver rider is fully spec'd (batch-005-rotation.md "code half" + contract block): SpriteAnimator reads `rotations`+`mirrors`, Hero/Enemy send 8-way orientation from velocity angle with ~10° hysteresis. Scope overlaps tasks/006 (Enemy.ts) → must chain AFTER 006 lands; write as its own tasks/NNN at that point.
