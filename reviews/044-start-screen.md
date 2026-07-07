# Review — 044 start screen + menu (MAIN slot)

**Verdict: PASS — merged to main (s107 fire drain).**

Owner directive (2026-07-07): "make a logo for the game start screen, make a good menu." The game now has a front door.

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — ✓ built (only the pre-existing >900kB chunk-size advisory).
- e2e (both projects, desktop-chrome + mobile-chrome): `044-start-screen` + gate-compat suites `m1-01-claim-jumpers-death` + `m2-01-build-menu` + `task-025-bandits-dont-swim` = **42 passed**. The `?debug`/query skip proven to keep existing flows virgin (all three legacy suites green unmodified).
- Boot probe: the 044 spec IS the boot probe — every test buckets `console` errors + `pageerror` and asserts empty, across plain menu boot, `?debug` skip, New Claim game-start, disposal leak-check, Continue gating, Research/Settings — on both viewports. Zero console/page errors.
- Screenshots: `artifacts/044/{desktop,mobile}-chrome-menu.png` + `*-placeholder-emblem.png`. Visual review: Storybook shell (left-column menu), typeset "GOLD RUSH" wordmark in canonical serif + "an Agent Town tale" gold-underlined subtitle, placeholder emblem crest + gradient backdrop, full-width 44px tap targets on 390px, Continue correctly hidden with no suspended run.

## Firewall & canon check
- Touched: `src/ui/menu/StartMenu.ts` (new), `src/main.ts` (boot wiring), `src/styles.css`, `e2e/044-start-screen.spec.ts`, plus backward-compatible hooks in `src/game/Game.ts` (`onReturnToMenu?` optional param + `finishRunLedger` routing death-overlay onDone to menu when present, `resetRun` fallback otherwise), `src/game/ProfileManager.ts` (`InstallOptions {showTitle,skipTitle}` — entry relocated, system untouched), `src/systems/AudioSystem.ts` (volume store/read/write applied to blip gain — the Settings row ships a WORKING volume, not the forbidden "(coming)" stub).
- `openAssayBench` param intact on Game.ts (s106 GATE RIDER concern — no committed code removed).
- Wordmark is typeset in code (`<h1>`), NOT a generated image — brief §4.2. ✓
- Naming §9.4: "an Agent Town tale". ✓
- Placeholder-first law: emblem + backdrop are `data-asset-state="placeholder"` slots (batch-009 `ui-title-emblem` / `ui-menu-backdrop`, dormant until processed). ✓
- Plain boot (`search === ''`) shows menu; ANY query param (incl. `?debug`) → straight to profiles/game = gate-compat preserved. ✓
- Clean dispose (listeners + root removed, no leaked handlers). XSS-safe `escapeHtml` on research content. Esc-in-menu = no-op (no run behind it). No secrets client-side. ✓

## Findings
None blocking. Settings currently exposes volume only (polish-04 first-run help is its future home, per spec — not yet due).
