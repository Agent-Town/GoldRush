# Task 035 (F-033-1): Assay Bench occludes the Build button on mobile — CORRECTIVE to 033 (MAIN slot)

You are Codex, implementer for Gold Rush. Claude orchestrates and gates. This is a **corrective** on top of the still-uncommitted 033 crafting-pipeline changes in the working tree — DO NOT revert 033; fix the one regression below and keep everything else 033 landed.

## The regression (gate evidence, s57 fire)
033 moved `.assay-bench` from top-left to top-right AND populated the default `local_prospector` profile with new approved+rejected fixtures, so the bench panel is now TALL. In `?debug` mode the bench is mounted VISIBLE on load (src/main.ts → AssayBench install gated on `?debug`). On the 390px Pixel-5 mobile viewport the panel is effectively full-width (`min(430px, 100vw-24px)` = 366px, right-anchored) and `max-height: calc(100vh-174px)` lets its reject-pile list grow down to the bottom of the screen — directly over the Build button, which lives bottom-left (`.hud-panel--build { position:absolute; left:18px; bottom:18px; width:min(340px,100vw-36px) }`).

Result: `e2e/lane-c-activations-assay-office.spec.ts` test "build menu shows the five processed building portraits" FAILS on **mobile-chrome** — `page.getByTestId('hud-build').click()` times out because a bench `<li data-reason-code="stat_cap" ...>` from `<section data-testid="assay-bench">` intercepts the pointer. (Desktop passes; the wider desktop viewport keeps the bench clear of the bottom-left build panel.) Screenshot proof: bench covers the whole play area below the HUD on mobile.

Part-B of 033 explicitly promised "panel no longer occludes HUD chips" — it fixed the top-left vitals/gold occlusion but traded it for a bottom-left Build-button occlusion on mobile.

## Fix (bench UX only — same firewall as 033)
1. On mobile viewports, keep the visible/pointer-active bench clear of BOTH the top HUD chips (already done — m5-04 asserts no overlap with hud-vitals/hud-gold) AND the bottom-left Build panel. Options (your call, pick the clean one): cap the bench so its bottom clears the Build panel's footprint (note the menu grows UP from `bottom:18px` when open — leave real clearance), and/or make the debug bench start collapsed/closed and open via the ✕-toggle or the office Enter interaction so it never blocks controls it isn't being used with. If you make it start closed, update `e2e/m5-04-offline-queue.spec.ts` `openBench()` to open it first, and KEEP the both-verdicts law + the existing hint/close/overlap assertions.
2. Extend `e2e/m5-04-offline-queue.spec.ts` (or the lane-c office spec if more appropriate — but prefer m5-04, it's your firewall) so the "avoids HUD chips" test ALSO asserts the bench does not overlap `getByTestId('hud-build')` on BOTH projects — lock this regression out.

## Firewall
Touch ONLY: src/styles.css (`.assay-bench` rules), src/crafting/AssayBench.ts (open/close default state if you go that route), e2e/m5-04-offline-queue.spec.ts. Do NOT touch the Hud/BuildButton/buildables/Game/Balance. No commits.

## Self-check (report as READY-FOR-GATES)
- tsc + build clean.
- `e2e/m5-04-offline-queue.spec.ts` green both projects (all existing + new hud-build overlap assertion).
- `e2e/lane-c-activations-assay-office.spec.ts` green both projects — especially "five processed building portraits" on mobile-chrome.
- Confirm in the report: bench still opens/interacts as the m5-04 flow expects; hint + ✕ + Esc still work.
