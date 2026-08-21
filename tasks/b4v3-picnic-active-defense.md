# Task b4v3-picnic-active-defense: the hold is earned, not stood upon — e6-picnic door-ready (lane-b, prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; **the OWNER RULING (2026-08-21, verbatim: to "should a merely-standing hero count as defending a stake?" — "picnic - no, just standing there should not win")**; tasks/b4v2-picnic-stake-pressure.md (v2's design stands; this v3 adds the ruling); tasks/done/stopped-s2090-law2-hero-pins-own-stake-20260820-205454-b4v2-picnic-stake-pressure.md + the s2090 run log tail in tasks/runs/ (WHY v2 stopped: even with ruled stake pressure, the idle hero's body permanently contests the west stake — one stake always survives, the hold cannot be lost); the v1+v2 WIP ON YOUR LANE BRANCH (commits `7a320da26` + `1731de225`: PicnicHoldSystem + stake-pressure weight + census + hooks).

## Pre-flight — BUILD-ON-PREDECESSOR (RESET FORBIDDEN)
`git log lane/b --not main` shows the two WIP commits above — deliberately preserved undrained work (Mistake #2 protection). Verify, then BUILD ON TOP. Merge current main INTO lane/b first (main moved substantially — resolve with the union discipline, keeping both sides' content; the WIP files are yours alone so conflicts should be light). FACTORY-CHURN EXCEPTION (F-1407-1) as usual. `npm install --no-audit --no-fund`; build green.

## The ruling made mechanical
A stake's disc is CONTESTED by: (a) a standing turret/structure inside the disc, or (b) the hero WHILE ACTIVELY DEFENDING — the smallest true-to-ruling form: the hero has dealt damage within the last 5 seconds (an active-defense window; pick the exact seam from what CombatSystem already tracks — no new bookkeeping if a recent-damage timestamp exists). A hero merely standing in the disc contests NOTHING. Comment the ruling verbatim at the contest predicate.
Consequence to prove: an idle hero at sandwich-west deals no damage → the west stake falls to the ruled pressure like the others → all three fall → idle LOSES (or dies first). A defended run contests with turrets + active fighting and holds ≥1 to the secure terminal.

## Scope
1. The contest-predicate change per the ruling (both engines, hold-consumer-gated — no other contract's behavior may move; prove via floors byte-unmoved for non-picnic rows).
2. Whatever v2's stop left unfinished (read its run log: complete the hold consumer + pressure weight to the master's v2 spec).
3. Prove: public-verb prover secures ×2 both seeds (`--contract e6-picnic` explicitly, F-PROTO-5 discipline; active defense + turrets hold the line); **idle floors ×2 now LOSE — report the terminal (stakes-all-lost vs death)**; if idle STILL survives, STOP per Law 2 and name the mechanism.
4. Admission completion per the v2 master's item 5 (anchors if still absent, er01-e6-census per-id truth, skill.md, baseline, floors regen --check all secured:false, audit + pins re-measured verbatim on YOUR tree with the ADMISSION MOVE comment, revert-and-reproduce attribution).

## Firewall
Touch ONLY: PicnicHoldSystem + the contest predicate + the v2 targeting weight, the two engines' hooks/loss surface, e6-picnic contract block (anchors ONLY), MechanicsManifest, er01-e6-census, skill.md fences, door baseline, floors+audit regen, pins (attributed), the WIP e2e (extend), BACKLOG row.
NO: global targeting for other contracts, WrangleSystem internals, showroom/glow-mesa/hollow anything, balance values, hero-start selection, CombatSystem semantics beyond READING an existing recent-damage signal (if none exists, add the minimal timestamp WRITE at the one damage-dealing site, hold-gated read).

## Self-check
tsc + build green; full node-guards (contention → solo, say so; bracket pgrep); er01-e5 + er01-e6 + ap16-4 both projects; adjacent task-025 + m1-01 + m2-01 both projects; plain boots ×2 viewports asserting the RESOLVED contract id; floors --check clean 0 secured:true.
End: READY-FOR-GATES + report: the contest predicate as built (which damage signal), secure hashes ×2, idle terminals, anchors, gate counts, pins.

## No-op / honesty guard
If idle still false-greens, STOP and name the mechanism precisely. No buffs, no minting, never soften an assertion.
