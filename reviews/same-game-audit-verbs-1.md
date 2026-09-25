# Drain review: `same-game-audit-verbs-1`, the bench audit exempts the rider's channel and measures the dispatch pairing (Opus 5.5 implementer at max effort; F-DTG2-1)

**Branch** `fix/same-game-audit-verbs-1` at `26dd076b1` · **merge** `729d97af0` · engine hash unchanged (`755400f8`, no pin) · drained attended 2026-09-25 22:22Z in a detached chain worktree with the scratch store at `5793a96`; no deploy (scripts/attended/land.sh, config `sga1`).

**Verdict: LANDED.**

### What it does
The same-game audit counts every door verb the agent harness lacks; grammar-2 taught the door two client verbs and the pinned summary moved 511 to 595 with nothing removed. This slice (Opus 5.5 implementer at max effort; the attended session as the audit's owner ruled: `agent_orders` exempt, the dispatch pairing measured) makes the audit true again. **Measurement 1, the exemption:** `agent_orders` is the seated rider's own order channel (the seat writes it, `SeatedLockstepSim.ts:208`; the browser applies it only for a headless slot, `Game.ts:3744-3750`), so its 42 rows leave the table through a `parityRow` flag on the exemption entry (the four older exemptions keep their rows): agent-lacks 595 to 553, equal unchanged, rows 1847 to 1805, and the row sets differ by exactly those 42. **Measurement 2, the pairing:** `Game.ts`'s own dispatch methods lifted into the headless sim (the way the audit already lifts `isBuildableEnabled`) ran beside a HARVEST order and a no-command control on the same contract and seed, each arm twice: all 38 boards the door admits pair (same walk, same arrival tick, the same seam panned once for the same gold, same remaining gold and economy; control 0 pans; every arm reproduced itself; the dispatch pans 2 ticks later and leaves the seam 26 ticks sooner; the Claim's lifted dispatch pans at 1.867 s, the figure the browser e2e recorded for a player's dispatch). 38 rows go from agent-lacks to equal. Re-pinned **0 / 515 / 1290 / 0 over 1805**; the four attribution corners each measured (exemption only 553/1252 over 1805; pairing only 557/1290 over 1847). The bench doc regenerated (F-KV2-5's moved citation fixed) and three rotted `Game.ts` exemption citations resolve live again. Where the player sees it: nowhere; this is the bench's honesty.

### Measured
tsc and build green; `same-game-audit` and `same-game-report-guard` 9 of 9; node-guards under the drain lock 1,009 of 1,018 with the usual worktree reds (two backup-pull rows and the sweep's `ledger-backup-fill-gaps-guard` child needing `.env.local`, the contention row while another battery ran), each identical on a clean-main archive of the same files. No `src/`; the engine hash did not move.

### Merge classification
LANE-TOUCHED: `scripts/same-game-audit.mjs` (the exemption flag, the lifted dispatch probe, the citations), `scripts/same-game-audit.test.mjs` (the re-pin with its reasons), `docs/bench/same-game-audit.md` (regenerated), `artifacts/same-game-audit-verbs-1/**`. The branch changes the pin dtg2's drain set (595), which is what it is meant to do.

### Findings
- **F-SGA1-2 (the owner's, on the desk):** with two `pan_legend` stacks, the harness's HARVEST order earns one extra passive pan per order, double the dispatch's gold on 41 of 41 boards with a seam (the receipt keeps the Prospector on the seam 0.9 s and in the harness the Prospector is the passive panner; with one stack or none the gold is equal; reach is unaffected, so the pairing stands). An agent-versus-human economy asymmetry in the bench: decide whether the bench sim should pan like the browser.
- **F-SGA1-5 (a corrective to author, verify first):** inferred from reading, not run: the debug-spawn key T is ungated on the lockstep action path (`LockstepClient.ts:860` to `Game.ts:3763`); in a plain boot it would spawn a debug pack on every multiplayer peer and while a playbook records, and a solo replay would diverge from its own hash.
- **F-SGA1-1, -3, -4, -6 (the audit owner's notes):** tape citations take the first match in the whole file (the 42 rows had cited `standings.ts:934`); the harness's `applyWireAction` honours `place_build` only, so a dispatch on the wire is ignored; the 380 agent-lacks left on admitted boards are ten tape actions, 190 of them cited exemptions that still count and `restart` uncited; two stale prose pointers.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| tsc / build / e1 | `0 / 0 / 0` |
| law-pointer | `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards | `ℹ pass 137 ℹ fail 0` |
| full npm run test:node-guards (before the pin) | `rc=1 ℹ tests 1025 ℹ pass 1019 ℹ fail 1 ℹ skipped 5  22:22Z` |
| engine hash | `merged: 755400f89e096800cd8fa08e2bde744d15cca76e74d17f59c87d2f20468b89fa (pinned 755400f89e096800cd8fa08e2bde744d15cca76e74d17f59c87d2f20468b89fa)` |
