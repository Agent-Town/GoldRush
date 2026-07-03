# Review: m0/01-scaffold-boot

Date: 2026-07-03 · Implementer: Codex (session 019f2632, chunked exec) · Reviewer: Claude · **Verdict: PASS**

## Evidence (independently rerun by reviewer)
- `npm run build` ✓ (vite 8, 19 modules, ~110 ms)
- Playwright `2 passed` (desktop-chrome 1280×720 + mobile-chrome 390×844) ✓
- Canvas inspection: nonblank, variance 246, 54 color buckets, `consoleErrors: []`, `pageErrors: []` ✓
- Fresh screenshots at both viewports, zero console errors: `reviews/m0-01-desktop.png`, `reviews/m0-01-mobile.png` — scaffold demo (capsule + relays + HUD) renders and plays ✓

## Spec conformance
- package name `gold-rush`; three `^0.184.0` (matches Founders Plot precedent) ✓
- Owned deviations only: testDir → `e2e/` ✓, `base: './'` ✓, `src/core/Rng.ts` (mulberry32, string/number seed normalize) + `src/core/DebugParams.ts` (`?debug ?seed ?timescale ?nospawn ?stress`, typed) ✓
- Demo intact, no redesigns ✓; no touches to vendor/docs/specs/assets ✓

## Accepted deviations
- Playwright mobile project runs **chromium** (not webkit) — webkit isn't installable in the sandbox (CDN blocked). Fine: mobile = framing check only. Revisit if a real webkit bug surfaces.

## Environment findings (recorded in STATUS.md)
- Codex must work in `~/gr` (home copy) — its process bus-errors under heavy edits on the mount. Flow: rsync mount→~/gr, codex works there, reviewer verifies, rsync back, commit on mount.
- No background processes survive bash calls (`--die-with-parent`); Codex runs chunked via `timeout 38 codex exec` + `resume`.
