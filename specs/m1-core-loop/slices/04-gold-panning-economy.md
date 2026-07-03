# m1/04-gold-panning-economy

**Contract:** gold exists and only the Economy can move it; the leave-safety-to-pan tension exists. The M3 server-authority seam is shaped here and goes no further.

**Seam:** `src/game/Economy.ts` — single owner of gold. `EconomyEvent = { id: string /* uuid-shaped */, at: number /* sim time */ } & ({ type:'gold_panned'; nodeId; amount } | { type:'gold_spent'; sink:'build_sentry_beacon'; amount } | { type:'run_reset' })`; `apply(e) → { ok, gold } | { ok:false, reason:'OUT_OF_RESOURCES' }` (error vocab from brief §6.3); exported pure `reduce(state, e)`; capped ring-buffer `log`. Nothing else — no idempotency handling, no persistence (review reject). `src/entities/GoldNode.ts` — **Gold Seam**: ochre nugget cluster + glint sparkle (slot `node.gold_seam`) on `Terrain.nodeAnchors` (2–3 of 6 active). `src/systems/HarvestSystem.ts` — hero within 1.6 m and slow → channel: progress ring mesh (with a little wobble — charm), 5 gold per 1.5 s tick, 30 capacity, progress decays ×2 when you step out; depleted node relocates (respawn 20 s). HUD gold counter live (coin-tick).

**Playable checkpoint:** wade to a seam, pan under no pressure (lane A may not be merged), watch gold climb, deplete it, find the next.

**Verification:** GATE-STD; e2e: scripted walk to anchor (deterministic `?seed`) → `gold >= 5` after one tick; leave mid-pan → decay asserted; depletion → relocation after 20 s; unit probes at the seam: `apply` rejects overspend with `OUT_OF_RESOURCES`, `log.length === mutations`, `reduce(replay(log)) === state`; screenshot with progress ring.

**Deps:** M0 only. **Fully parallel with 01–03** (touches only Economy/GoldNode/HarvestSystem + listed Game.ts registration lines).

**Firewalls:** zero imports from Enemy/Combat/Wave code. No second gold variable anywhere — HUD reads snapshot, spenders call `apply`. No shop/build UI (05).
