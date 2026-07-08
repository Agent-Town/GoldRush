# Task 052: the download diet — 87MB → ≤12MB first load (MAIN slot, commit prefix "perf:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; vite.config (build options, sourcemap setting); src/assets/generated.ts (how processed art is imported — every import lands in the bundle); scripts/extract-alpha.mjs (what image lib the pipeline already has — REUSE it for compression; if none, sips is native on macOS for resize, document the choice); the chunk-size warning every build prints. Pre-flight: zero staged/modified tracked files under src/ e2e/ configs — EXEMPT artifacts/ logs/ reviews/shots docs/ tasks/ (list briefly, proceed).

## Owner finding (2026-07-07 ~21:45, FIRST FAMILY QA — the owner's son: "it is laggy")
MEASURED: dist = **87MB**. index.js.map 4.0MB SHIPPED TO PROD; tavern backdrop 3.9MB; menu backdrop 3.2MB; terrain tiles ~2.4MB ×4; building sprites ~2.2MB each. Raw-resolution PNGs wired straight in. Owner: "quality is crucial but raw might not be needed" — correct: display size ≪ stored size.

## Budgets (the gate — numbers, not adjectives)
- First-load transfer (boot to playable claim, cold cache): **≤12MB** (measure via playwright network capture, report before/after table).
- No single image >600KB after the pass; sourcemaps OFF in production build (keep for dev).
- Zero visible quality regression at gameplay zoom (before/after screenshot pairs at 100% for: terrain, a building, the menu — human-checkable in artifacts/).

## Scope
1. **Kill prod sourcemaps** (vite build config; dev unaffected).
2. **Image optimization pass**: script `scripts/optimize-assets.mjs` — resize each processed asset to its maximum in-game display resolution ×1.5 (derive from how it's rendered: sprite scale/tile size; document per-class targets) + PNG re-encode (palette/quality via the pipeline's existing lib, else sips + note). Idempotent (safe re-runs); originals PRESERVED untouched in assets/raw + assets/processed-full (the optimized copies are what generated.ts imports — quality is never destroyed, only the SHIPPED copies shrink).
3. **Lazy-load the heavies**: tavern-interior backdrop loads on tavern entry (dynamic import), menu backdrop on menu open if it isn't the boot screen's first paint; audio stays lazy (verify — 28 files must NOT fetch on boot, diagnostics count).
4. **Chunk sanity**: if the JS chunk warning is a real multi-MB three.js monolith, apply manualChunks (three separate); no further code-splitting adventures.
5. **The pipeline law forward**: extraction/processing (fire-side) gains the optimize step so FUTURE batches ship pre-dieted — update the LEDGER header note.

## Firewall
Touch ONLY: vite config (sourcemap/manualChunks), the optimizer script, re-encoded processed assets (originals preserved per scope 2), lazy-load wiring for the two named backdrops, LEDGER header note, e2e/perf capture, artifacts. NO gameplay/sim changes, NO art regeneration, NO new npm deps without documenting why nothing existing sufficed.

## Self-check
tsc/build; the before/after transfer table (playwright network capture, cold cache) hitting the budgets; visual pairs in artifacts/052 (zero regression at gameplay zoom, stated per pair); full battery m1-01 + m2-01 + task-025 + audio-integration + town-t1 both projects (nothing broke from lazy-loading); zero console errors incl. the lazy paths. End: READY-FOR-GATES + the size table (per-class savings) + total first-load number.
