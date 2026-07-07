# Review — batch-009 start-menu shell art (processed + integrated)

**Verdict: PASS — integrated into the 044 start menu (s107 fire, DRAIN 3 / art).**

Closes Robin's "make a logo for the game start screen, make a good menu" loop: 044 shipped the menu with placeholder slots; batch-009 (codex-art-run-006) generated the real emblem/backdrop/panel; this drain processes + wires them.

## Raw QA (vs codex-art-run-006 measured criteria)
- `ui-title-emblem.png` (1254², 40.0% #ff00ff key) — brass gold pan + glinting nuggets, teal-glowing survey rod crossed diagonally, rope-and-timber ring, river/sluice claim vignette at base. No text/letters/firearms/gore/Native imagery. Reads at 128 and 512. PASS.
- `ui-menu-backdrop.png` (1672×941, 1.777) — golden-hour river valley from a bluff, sluice works, palisade line, distant town hints; left third intentionally dark (measured lum 28.4 vs center 90.3 / right 115.0). No text/UI/characters-in-focus/firearms. PASS.
- `ui-menu-panel.png` (1254²) — warm parchment with inked edge border, worn corners, quiet center. No text/symbols. PASS.

## Processing
- Emblem: `extract-alpha --key ff00ff --size 512` → 39.9% keyed, spill/despill cleared; alpha verified programmatically (corner α=0, center α=255).
- Backdrop: `extract-alpha --full-bleed --size 512`… → kept native 1672×941 (extractor square-resize would distort the non-square backdrop; it fills the viewport at native anyway).
- Panel: `extract-alpha --full-bleed --size 512` (square, safe downscale).

## Integration
- `StartMenu.ts`: `new URL('../../../assets/processed/…', import.meta.url).href` for all three (Vite-bundled). Emblem/backdrop divs get inline `background-image` + `data-asset-state="ready"`; panel set as `--gr-menu-panel` on root.
- `styles.css`: `[data-asset-state="ready"]` overrides — emblem `background contain` + `background-color: transparent` (crest floats, its own rope ring frames it; killed the placeholder cream square) + drop-shadow, clip-path/border/box-shadow cleared; backdrop `cover center-right`, opacity 1; buttons layer `var(--gr-menu-panel, none)` under a high-alpha parchment gradient so text stays legible.
- `ui.v1.json`: all three slots `state: integrated`, emblem/panel sizes 512.
- `044-start-screen.spec.ts`: placeholder→ready assertion; emblem screenshot renamed `-emblem.png`.

## Evidence
- `npx tsc --noEmit` clean; `npm run build` ✓ (UI assets bundled: emblem 485KB, panel ~450KB, backdrop 3.4MB).
- 044 spec **12/12 both projects** (desktop + mobile-chrome) — ready-state, `?debug` skip, New Claim, disposal, Continue gating, Research/Settings; each asserts zero console/page errors.
- In-game visual PASS desktop + 390px: `artifacts/044/{desktop,mobile}-chrome-menu.png` — emblem crest, painted valley backdrop, legible left column, parchment buttons with subtle grain.

## Findings
- **F-S107-1 (non-blocking):** backdrop ships as a 3.4MB no-alpha PNG. Convert to JPEG (or add a non-square downscale to the extractor) to cut ~3MB of first-boot payload. Boot-menu only, no gameplay fps impact — deferred.
- Placeholder-first law honored throughout: the menu shipped playable with placeholders in 044; real art replaced them in this planned batch.
