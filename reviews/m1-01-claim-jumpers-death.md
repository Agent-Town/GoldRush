# Review: m1/01-claim-jumpers-death

2026-07-03 · Codex session 019f266c-2120 (gpt-5.5, xhigh→medium) · Reviewer: Claude · **Verdict: PASS**

Evidence (reviewer-run): build ✓ · new spec 4/4 (T-spawn count, ?nospawn respected, double-restart geometry-leak gate, ?stress=120 pool+draw-call budget) ✓ · visual.spec.ts regression 5/5 ✓ · zero console errors ✓ · `reviews/m1-01-combat.png`: swarm surrounds hero, HP 68/100 falling, poncho-cone jumpers read illustrated-menacing, no gore ✓.

Seams: EventBus typed union + unsubscribe ✓ · Enemy pool 96, module-shared geometries/materials ✓ · contact damage 8 / 0.8s cd / 0.5s iframes per Balance ✓ · DeathOverlay "Stake Again" + R → resetRun, no reload ✓ · firewall clean: no combat-shooting/waves/economy files touched ✓.
