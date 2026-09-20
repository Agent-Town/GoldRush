# Town Blender v3 — Tavern gate evidence

Branch baseline: `36995e6d`. Scope: Tavern proof only; the plaza/horizon second commit was not started.

## Branch-owned gates

- `npx tsc --noEmit` — pass.
- `npm run build` — pass. Vite emits separate `TownTavernPilot`, `GLTFLoader`, and hashed Tavern GLB assets.
- New pilot spec on the dev server, desktop + mobile — 6/6 pass.
- New pilot spec on the production preview, desktop + mobile — 6/6 pass.
- Flag off — facade source, zero Tavern GLB requests, zero console/page errors.
- Flag on FULL — one Tavern GLB request, GLB source, Tavern prompt/Board interaction unchanged, zero console/page errors.
- Flag on LITE — facade source, zero Tavern GLB requests.
- Invalid GLB — facade source and Tavern prompt/Board interaction preserved.
- Loaded Town exit — pilot disposer runs and publishes `disposed`.
- Renderer evidence — see `renderer-delta-desktop-chrome.json` and `renderer-delta-mobile-chrome.json`.
- Asset evidence — see `asset-contract.json`.
- Owner visual evidence — see `contact-sheet-facade-vs-glb.png` and `contact-sheet-tavern-closeup.png`.

## Requested untouched regression battery

The combined desktop + mobile run completed 58/62 green. The four failures are two assertions repeated across both projects:

1. `town-t4-growth.spec.ts` expects `town-growth-general-store`, while current main queues `ledger-page:the_claim` first.
2. `town-t6-surfaces.spec.ts` expects three menu actions, while current main also renders `Claim Ledger`.

An untouched detached worktree at `36995e6d` reproduced all four failures identically (0/4 pass). They are pre-existing main/test drift and cannot be repaired inside this branch's touch-only, visual-only territory.
