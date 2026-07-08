# Task 053: the Q-cycling audit — WHY is toggle-spam the highest DPS? (MAIN slot, commit prefix "balance:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in the repo root (main slot). READ FIRST: AGENTS.md; the weapon toggle/swap implementation (Q handling, spark/blast state machines, blast charge mechanics — Hero/CombatSystem weapon paths); docs/playtests/2026-07-07-robin-playtest-02.md (toggle trend 616→1,375→1,991; owner: "It is the highest dps way of playing the game I know of, so I use it"). Pre-flight: zero staged/modified tracked files under src/ e2e/ configs — EXEMPT artifacts/ logs/ reviews/shots docs/ tasks/ (list briefly, proceed). SEQUENCING: after 052 download-diet merges.

## The assignment: MEASURE AND EXPLAIN — do NOT rebalance (owner decides after)
1. **Instrument the mechanism**: seeded DPS probes (existing harness) comparing: pure-spark · pure-blast (charge-and-release rhythm) · rapid-cycle at the owner's cadence (~85 toggles/min from his ledgers). Report DPS numbers for each vs a fixed target wall.
2. **Name the WHY**: identify exactly what cycling exploits — swap-canceling blast charge? parallel cooldown recovery? fire-rate reset on toggle? state-machine seam? Cite file:line for each contributing mechanic.
3. **Cost the fix options (numbers, not opinions), NO implementation**: (a) BLESS IT — keep cycling optimal but add feel (swap animation frames, tempo cap ~X/s, sound per swap via the governor) making it an intended "weapon juggling" mastery; (b) NORMALIZE — swap carries a brief shared cooldown or charge persists across swaps so cycling ≈ committed play within ±10%; (c) HYBRID — mild normalize + a real late "rotation" upgrade family that legitimizes juggling as a build choice. For each: what changes, DPS deltas, which of the owner's 46-wave habits survive.
4. Write the findings as `docs/design/weapon-cycling-audit.md` (1 page) ending with a recommendation + the three options for the OWNER'S one-word pick.

## Firewall
Touch ONLY: the probe spec/harness additions (test-side), the audit doc, artifacts. **ZERO gameplay/Balance changes** — this task ships knowledge, not knobs.

## Self-check
tsc/build; probe results reproducible (seeded, two runs match); the audit doc complete with file:line citations + the numbers table; m1-01 + m2-01 canary green both projects. End: READY-FOR-GATES + the one-paragraph answer to "why is Q-spam optimal" + the recommendation.
