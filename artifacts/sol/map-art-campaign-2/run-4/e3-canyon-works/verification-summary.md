# Canyon Works verification receipts

- TypeScript/default/full builds: pass (`build-gates.json`).
- Four timing runs per arm/width: one comparable mode, +0.51% desktop / -1.02% phone p95, unchanged draw and triangle counts (`performance-summary.json`).
- Plain boot four arms: no errors or debug/test hook; normal HUD (`plain-paired.json`).
- Saved sources: five landmarks and panorama re-export exactly; original geometry/UVs preserved except 97 render-only apron positions.
- Own Canyon/connect/crawler cases: 12 pass. Escort case fails twice, `cw-02-escort.spec.ts:128`, expected HP39/actual40; exact base reproduction in `base-escort.json`.
- Shared brightness/collision: 16 pass, four skips (`e2e-pack-gates.json`).
- Visual map census: two pass. Headless E3 census: two failures at `er01-e3-census.spec.ts:61`, expected connect deadline6/actual8. Both reproduce on exact code 500c950f0 + store 213e677; candidate restored exactly (`base-census.json`).
- 34 render guards and three named guards pass. Changed-since invokes the forbidden full node battery; HELD for drain, not claimed green.
- Loading/repeat probes pass 8/8 + 2/2 (`probes-gates.json`).

No existing assertions, gameplay state, camera/HUD, or engine-era pin were changed. Source/atlas and test failures are separately owned.
