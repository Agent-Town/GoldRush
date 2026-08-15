---
verdict: MERGE
slice: assay-auto-tape
base: 14e13416fbbcb6139f9999656db1c5a4996700f2
merge: c5134f50be460ba14d16d8195b9b37145e3ccf9a
date: 2026-08-15
---

# Assay auto-tape — drain review

## Verdict

MERGE. The slice adds one browser contract around the existing submission path: a qualifying standing carries the run tape automatically, without the player pressing the manual local-shelf button. It changes no production code.

## Gate evidence

- `npx tsc --noEmit` — pass.
- `npm run build` — pass; asset-diet ceilings green.
- `npx playwright test e2e/assay-auto-tape.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1` — 4/4 pass.
- Existing plain tape-button boot coverage — 2/2 pass across desktop and 390px mobile.
- Runner adjacent battery — 32/32 pass across desktop and 390px mobile.
- Untouched-main desktop control for `task-025-bandits-dont-swim`, `m1-01-claim-jumpers-death`, and `m2-01-build-menu` — 16/16 pass.

## Findings

- **F-1793-4 (non-blocking, environment):** one long combined fire-shell battery ended 33 pass / 5 desktop failures after Chromium execution contexts and GLTF blob loads collapsed; its mobile arm passed. The candidate only adds `e2e/assay-auto-tape.spec.ts`, no affected suite imports it, the runner's same adjacent battery passed 32/32, and the untouched-main desktop control passed 16/16. The failures are therefore non-causal gate contamination, not a slice regression.

No player-visible production surface changed, so no screenshot, Gazette item, or deploy is owed.
