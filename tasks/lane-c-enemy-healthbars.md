# Task enemy-healthbars: tough bandits show their ledger (LANE-C, branch lane/polish, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c. READ FIRST: AGENTS.md; the building HP-bar machinery (m2-05 damaged-only bars — the pattern + pooling to reuse); the boss bar (054, lane-b — DISTINCT: the boss bar is unique/segmented; this task is the RANK-AND-FILE version, coordinate visually but don't touch it); Enemy HP scaling by wave (where maxHp grows); the object-frame law (bars anchor to their enemy, never billboard-drift); 200-enemy stress budgets. Pre-flight: safe-dupe rule (ahead-merged lane commits → `git checkout -B lane/polish main && git clean -fd`, proceed; STOP only on unmerged content or foreign edits); npm install; build green. SEQUENCING: after world-info-notes (this lane's queue).

## Owner order (2026-07-08 ~07:45)
"For the boss it might also be good to have a health bar [054 has it ✓] — also later when the bandits get more health in later waves, a healthbar would be interesting."

## Scope
1. **Threshold-gated bars**: enemies whose maxHp ≥ `Balance.ui.enemyBarMinHp` (tune so waves 1–15's trash stays CLEAN — no bar noise early; veterans/elites/thieves-with-loot in later waves qualify) get a thin ledger-sliver HP bar.
2. **Damaged-only** (the m2-05 law): full-HP enemies show nothing; the bar appears on first damage, fades 2s after full/death.
3. **Pooled + cheap**: instanced/pooled bar quads (the building-bar pool pattern); 200-enemy stress with 60 bars visible stays in frame envelopes (measured, stated); bars cull with distance/off-screen.
4. **Readable, not busy**: 1px-class sliver, warm-parchment empty / oxblood fill (matches the damage grammar), positioned above the sprite per scale (elites higher). NO numbers, NO names (the boss bar owns ceremony).
5. Knob documented for the owner (threshold value + how to tune).

## Firewall
Touch ONLY: the enemy-bar module (reuse/extend the bar pool), Balance additive UI knob, e2e, artifacts. NO boss-bar changes (054's), NO enemy stats/behavior, NO building bars, NO hit-flash resurrection (owner cut it).

## Self-check
tsc/build; new `e2e/enemy-healthbars.spec.ts`: below-threshold enemy damaged → NO bar · above-threshold damaged → bar appears/tracks/fades · stress perf in envelope (numbers) · bars anchor through movement (object-frame sampled); combat-readability + m1-01 + m2-01 + task-025 unmodified green both projects; zero console errors; screenshots (late-wave veterans with slivers, early wave clean) into artifacts/enemy-healthbars/. Commit on lane/polish. End: READY-FOR-GATES + the threshold chosen + perf numbers.
