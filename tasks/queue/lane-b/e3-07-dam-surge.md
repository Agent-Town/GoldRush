# e3-07-dam-surge — the timed flood (lane-b #2; commit prefix "feat:")
ROLE: hazard system. WORKDIR: lane-b. CODEX: model=gpt-5.6-sol effort=high
ATTENDED-AUTHORED 2026-07-14 — E3 spine 6/6: the last engine brick before the Canyon Works assembles.
Pre-flight (LANE-SAFETY): standard safe-dupe rules; LADDER-STALL protocol stands. Then npm install; build green.
## READ-FIRST: e3-voltage-bundle §B (dam surge: a telegraphed timed hazard field sweeping a channel) · the baron-salvo marked-ground telegraph pattern (REUSE the mark grammar) · Terrain water/speed sampling (the surge field modifies a CHANNEL region temporarily).
## SCOPE: (1) DamSurgeEvent: scheduled/triggered surge — telegraph marks along the channel (~2s), then a sweeping hazard field (damage + push, dodgeable by leaving the channel) with era-appropriate read (rushing water + debris, warm not gory); (2) planar law: the field is a sim-region effect (positions/damage on X/Z), visuals ride the render layer; (3) harness: ?debug&damsurge triggers on the dev tile; (4) e2e: telegraph→sweep timing, damage only in-channel during sweep, dodge proof, determinism (event-logged), zero console; both projects.
## Firewall: the surge module + harness + spec + artifacts. NO tile data, NO water mask changes, NO CombatSystem rules (damage via existing resolver).
## Self-check: tsc+build green · new + determinism suites green. If you exit without changes, WRITE WHY first.
END: READY-FOR-GATES + timing/damage table.
