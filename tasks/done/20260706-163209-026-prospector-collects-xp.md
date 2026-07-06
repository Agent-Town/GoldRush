# Task 026: the Prospector gathers XP (MAIN slot, after 025)
ROBIN ASK: mote collection eats his time — the agent should sweep it.
1. New tool et.goldrush.collect_xp (ToolSurface, thin wrapper — XP banks into the SAME progression, no new writers): the Prospector gathers motes that are AGED >Balance.agent.xpMoteAgeS (default 4s — the player gets first chance at fresh drops near the action) whenever no higher-priority behavior runs (priority: chase_mark > repair > collect_xp > pan_at when hero fighting; tune order as knobs).
2. Receipts: batched per sweep ("Gathered 14 XP"), not per mote (feed spam guard). Level-up offers trigger exactly as if the player collected (threshold logic untouched — assert).
3. The Prospector RESPECTS 025: never enters deep water (he doesn't swim either); ford-only crossings.
4. e2e: aged motes across the claim + hero pinned in combat -> agent sweeps them, XP conservation holds (021 invariant: deaths x perKill == total banked, regardless of collector); fresh motes near hero are left alone for >ageS; receipts sum == swept XP; zero agent positions in deep-water zone across the sim.
Firewall: src/agent/* + Balance.agent + e2e; no progression/economy internals. Canaries: m4 suites, vp-02, m1-06 offers. READY-FOR-GATES + sweep evidence.
