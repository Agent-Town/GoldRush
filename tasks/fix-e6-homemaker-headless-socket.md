# Task fix-e6-homemaker-headless-socket: make the Glow Mesa boss resolve headless (MAIN slot, prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (MAIN slot).
READ FIRST: AGENTS.md; `reviews/milk-twin-sockets.md` (F-MTS-4); `src/systems/CrawlerBossSystem.ts` (proven guard/wiring precedent) and `src/systems/DredgeQueenBossSystem.ts` (sibling boss getting the same fix — copy the pattern); `src/systems/HomemakerBossSystem.ts`; `src/sim/HeadlessContractSim.ts`; `src/game/Game.ts:902` (browser construction to mirror); `src/sim/AtomicSocket.ts` (already sockets the rest of Glow Mesa correctly — the boss is the ONLY unsocketed piece).

Pre-flight: `git status --short` no modified TRACKED file outside factory-churn — STOP if so. FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`; `artifacts/**`/`reviews/shots-*`/`.png`. Then `npm install --no-audit --no-fund`; `npm run build` green first.

## Why (owner directive 2026-08-14 + measured scope)
`e6-glow-mesa` is door-exempted (F-MTS-4, now VERIFIED): `HomemakerBossSystem.ts:150` is a field initializer calling `pictogramSprite()` (`:711` → `document.createElement`), crashing headless before construction — identical class to E5's Dredge-Queen. Same guard fix. But Homemaker has ONE extra dependency the fix must satisfy: it is built via `createHomemakerBossSystem(host)` (`:85-142`) whose FIRST line (`:86`) is `host.goldPickups.setDemolishCollector(...)`, requiring a real `GoldPickupPool` (`src/entities/GoldPickup.ts:102`) — and `HeadlessContractSim` has NONE (zero `goldPickups`/`GoldPickupPool` matches). No balance change, no new gameplay.

## Scope
0. **PROBE FIRST (before committing to full scope)**: read `src/entities/GoldPickup.ts`'s constructor for browser-only assumptions (DOM, sprites, THREE render objects). Decide: construct the REAL `GoldPickupPool` headless if it's clean, OR build a minimal headless-safe object satisfying exactly the interface `createHomemakerBossSystem` uses (`{setDemolishCollector, spawn, goldHoldings, …}` — confirm the full surface by reading the factory). Report which path and why.
1. **Guard the construction-time DOM**: `pictogramSprite()` (`HomemakerBossSystem.ts:711`) — early `if (typeof document === 'undefined') return new THREE.Sprite();`.
2. **Guard the per-tick DOM**: `publishHomemaker3d()` (`:641`) first line `if (typeof document === 'undefined') return;`; `ensureHomemaker3d()` (`:554`) same guard (no GLTF `file://` load headless). Mirror `CrawlerBossSystem.ts:509`.
3. **Provide the gold-pickup collaborator** per §0 (real pool if clean, else minimal stub), available to the boss factory in `HeadlessContractSim`.
4. **Construct + wire the boss**: call `createHomemakerBossSystem({...})` in `HeadlessContractSim`, gated on `manifest.twist.baron?.variantId === 'homemaker_9000'`, mirroring `Game.ts:902` field-by-field; forward `.onComponentKilled`/`.onWaveStarted`/`.update()` through `bindEventLog()` (Crawler/Dredge-Queen pattern). `postBaronDefeat` is generic — no new secure logic.
5. **Re-admit** (only once measured secure): remove `e6-glow-mesa` from `CONTRACT_ADMISSION_EXEMPTIONS`; regenerate `docs/bench/same-game-audit.md`; regenerate `assets/contracts/null-floors.json` for it (idle floor MUST be `secured:false` — Law 2).

## Firewall
Touch ONLY: `src/systems/HomemakerBossSystem.ts`, `src/sim/HeadlessContractSim.ts` (construction site — standalone like Crawler, or folded into `AtomicSocket.ts` if you prefer grouping E6 — either is fine), `assets/contracts/null-floors.json` (regenerated), `docs/bench/same-game-audit.md` (regenerated), `tasks/BACKLOG.md`.
NO changes to: `src/entities/GoldPickup.ts` public API (REUSE, do not reshape — unless §0 proves a real blocker, then STOP and report rather than reshape silently), `WrangleSystem.ts`/`E6TileConsumerSystem.ts` (already correct), `src/game/Game.ts` (reference only), any other E6 contract, `Balance.*` (no balance change), determinism ordering, existing e2e assertions.

## Self-check
Boss constructs headless without throwing. Both bench seeds reach a SECURE terminal within the step ceiling; two same-seed runs byte-identical hashes (report). `e6-glow-mesa` removed from exemptions; `same-game-report-guard.test.mjs` green; `npm run test:node-guards` green. `e2e/er01-e6-census.spec.ts` + adjacent E5/E6 specs green desktop+mobile. tsc + build clean. Zero console/page errors, plain non-`?debug` boot desktop + 390px.
End: READY-FOR-GATES + report: the §0 gold-pickup decision, construction fix, both seeds' secure waves + hashes, exemption removed.

## No-op / honesty guard
If §0's gold-pickup dependency turns out materially bigger than a stub (real pool has deep browser deps), STOP and report the sizing rather than forcing it — that becomes a scoping decision. Do NOT add balance changes to force a secure; report any fight-winnability gap instead.
