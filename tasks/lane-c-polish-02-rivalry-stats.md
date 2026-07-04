# Lane C / POLISH-02: run stats + rivalry scoreboard (worktree lane-c, branch lane/polish, prefix "polish:")
READ: AGENTS.md, north star (teen rivalry: per-player records), m2-07 acceptance (base-play must beat kiting).
1. Death/victory screen: expanded run ledger — waves, gold panned/sluiced/stolen/reclaimed, buildings built/lost/repaired, damage dealt per weapon (spark vs blast), upgrades taken by family. Data from Economy log + run summary (read-only, no new writers).
2. Best Claims scoreboard v2 (gr.scores.v2, migrate v1): each entry stores wave + BASE VALUE (peak gold invested in standing buildings) + weapon split + timestamp; list shows "wave 25 · baseless" vs "wave 18 · 240g base" style lines — makes the base-vs-kiting comparison VISIBLE (m2-07 acceptance evidence, and sibling rivalry later).
3. e2e: ledger totals equal Economy replay; v1→v2 migration keeps old records (flagged legacy); scoreboard sorts by wave then base value.
UI files + Scoreboard/persistence only; no Balance/sim changes; install()/no Game.ts. READY-FOR-GATES + files + results.
