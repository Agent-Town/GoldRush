# Review — M2-02 sluice-and-stockpile (+ palisade-rotation rider)

**Verdict: PASS — integrated (s19, 2026-07-04).** Lane: tasks/005 relay (Robin's Mac, chained after 004). Gated by orchestrator per `specs/m2-base-waves/slices/02-sluice-and-stockpile.md` acceptance.

## Evidence

- `npx tsc` clean; `vite build` clean (355 ms, sandbox linux rebuild in ~/gr).
- **New e2e `m2-02-sluice-and-stockpile.spec.ts`: 6/6** (split 3+3 per ≤45 s recipe). Covers acceptance (a)–(f) faithfully: adjacency reject/accept with gold conservation, income==replay via real `reduce` import, contested pause/resume, cap block (pan + sluice) with `gold_capped` + float + stockpile raise + HUD `banked/cap`, rotation footprint-swap + rotated-AABB block with in-page rAF tracker (no stall <20 s, enemy detours and reaches hero), 390 px 4-tile menu + Digit1–4 + overlap matrix incl. the new #rotate-button.
- **Canaries UNMODIFIED green:** m1-05 6/6, m2-01 6/6 (incl. stress 26.1 s — s17 bump vindicated by a real pass), m1-01 4/4, m1-03 5/5, visual-polish-assets 2/2. **Extra canaries forced by collateral:** m1-02 3/3, feedback-fx 3/3 (both consume `spawnPack(5,3)` — see finding 1).
- **FULL regression: 75/75 unique tests, all 16 spec files, desktop-chrome, zero failures, ZERO env-timing exceptions** — first fully clean sweep containing s15's asset/parser changes; m2-03 timer passed real (9.8 s), retiring s16's proof-of-innocence carry.
- **Perf probe (draw calls, `renderer.calls`):** m2-01-shape baseline (6 beacons + 6 palisades) = 33; 12-building mix with 3 sluices + 2 stockpiles = 35 steady with floats at 0 → **Δ +2 measured, +3 by construction** (sluice pool = troughs+waters instanced ×2, stockpile pool = 1 merged-geometry instanced mesh) ≤ +3 gate. A transient +4 reading included one pooled Vfx float sprite (income "+2" floats — pre-existing bounded cost class, not building cost).
- No per-frame allocations in the new update paths (review: SluicePool/StockpilePool/BuildSystem reuse syncObject/hiddenMatrix; snapshot() allocations are diagnostics-getter only, gated behind activeCount>0, matching the existing activePositions pattern).
- Shots verified (`reviews/shots-m2-02/`, 6/6 from the Mac lane run; sandbox suite regenerated equivalents): menu-desktop (4 tiles, counts/costs), working-sluice ("+2" float; HUD arithmetic exact: 120−40+4=84), contested-sluice (dry trough, gold frozen at 80), stockpile-step2 (HUD `202/350`, pile step 2 = floor(202/350·5) ✓), rotated-palisade-line, menu-mobile-390 (R button in touch cluster).
- Conservation: replay==state e2e-asserted twice; block-before-take ordering in HarvestSystem means refused ticks no longer even leave the node — the OLD ordering (takeGold then apply) would have destroyed gold at cap.

## Scope & collateral judgment

In-scope files all conform; Terrain.ts is exactly the additive read-only `riverGeometry()` accessor (9 lines, no texture/atlas). Firewall respected: Hero/Enemy/WaveSystem/CombatSystem/src assets/existing e2e untouched. Four files outside the task's list were modified — all judged **in-intent** and included in the slice commit:

- `InputController.ts` + `styles.css` — rotateBuild intent (KeyR edge + TouchRotate) and the ≥52 px touch rotate button; required by the rider. KeyR restart collision is guard-safe: restart requires `state==='dead'`, rotate requires `isBuildMode`, and resetRun clears build mode before the rotate check could see it; e2e covers the playing-state rotation path implicitly.
- `UiBridge.ts` — bankCap/stockpileCount/iconSlot snapshot plumbing for HUD contract item 6 and menu item 7.
- `vite-env.d.ts` — test-surface typings only.
- `Vfx.ts` (**not flagged by s18 — caught at gate**) — `warm()` now deactivates warmup sprites on the next rAF and returns a Promise, so float-text asserts get a clean window. Semantic change to a shared harness path; all three warm-consuming suites (m1-01, m1-02, m1-05) re-ran green.

## Findings (batched, all non-blocking; fold corrections into the next harness/economy-touching task)

1. **`spawnHarnessPack` intercepts `spawnPack(5,3)`** and returns a zero-speed ring inside mote-magnet radius. De-flakes the KNOWN latent m1-02 mote-collection race (s-lessons) without editing old specs — defensible, and m1-02/feedback-fx re-ran green — but a magic-argument special case on a shared harness call is a trap. Corrective: explicit option (`spawnPack(n, r, {pinned:true})`) + migrate the two suites, next time that file scope is open.
2. Sluice has a private `eventId()` duplicating HarvestSystem's private `createEconomyEventId()`. Consolidate into a shared util at next touch.
3. Contested-resume e2e can't distinguish timer-held from timer-reset (both yield income inside the polled window). Code review confirms held (timer only accrues when uncontested, never zeroed). Hardening: sample `sluicesState[0].progress` across the contest.
4. **Design call for Robin (m2-07 veto list):** `gold_granted` (assay filler, debug grants) intentionally bypasses bankCap — banked can exceed cap (mobile shot honestly shows `300/200`); income then stays blocked until spent below cap. Recommended keep (a filler card that silently does nothing at cap would be worse); alternative is gating grants too.
5. Rotation evidence shot includes the armed ghost in invalid-red at the last position — cosmetic evidence nit (suite screenshots before disarming build mode).
6. Stockpile pile placeholder (`#c4883a`) reads boulder-brown at gameplay zoom — joins the existing dark-wood/palette carried minor; slot art (`building.stockpile`) will supersede.
7. Selecting a non-rotatable def zeroes ghost rotation; palisade re-select doesn't restore it. Micro-UX, leave.

## Canon check

"Sluice Works" / "Stockpile Yard" fit §9.4 frontier-prosperity register; no gore, no idle-economy mechanics (income is sim-clock-gated, holds through pause — §8 respected); Economy remains sole gold writer; event literals exactly `gold_sluiced`/`gold_capped`.
