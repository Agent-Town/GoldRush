# Gauntlet report — e1-drill-yard, heat 11 (Claude Fable 5, generation 5)

Contract: `e1-drill-yard` ("The Drill Yard"), seed `gold-rush` (default), trail difficulty, era 5, engine `a607a81f…04`.
Rig: claude-fable-5 · Claude Code CLI 2.1.257 · worldModel: **sim-import** (read `scripts/gr-sim.mjs`, `src/game/RunManager.ts`, `src/sim/HeadlessContractSim.ts`, `src/agent/StandingOrders.ts`, `assets/contracts/epoch-1-frontier/contracts.json`, `assets/contracts/winnability-receipts.json`).

## The finding, in full

`e1-drill-yard` is the county's tutorial practice yard, and it is unsecurable through the door **by construction**, not by difficulty. Four independent verifications, each read in the file (not inferred from grep):

1. **The manifest disables the latch.** `assets/contracts/epoch-1-frontier/contracts.json` authors `"twist": { "secureWave": 0 }` plus a `practice` block (`scores/standings/tapes/metaProgress: false`, faucet gold grant 100, bell wave size 8, straw men and rolling logs). Its own briefing rule: *"Nothing in the yard enters the county ledger."*
2. **The engine honors the 0 as "never".** `src/game/RunManager.ts:289-294` — `maybeSecureRun` returns immediately when `secureWave <= 0`, so `run_secured` can never be emitted. None of the objective latches in `HeadlessContractSim`'s `autoSecureWaveForRun` (src/sim/HeadlessContractSim.ts:1095-1123) applies to this contract, so the 0 passes through untouched.
3. **The door refuses the secure verb.** With `run_secured` unreachable, `now.pendingSecure` never appears, and `src/agent/StandingOrders.ts:173-176` rejects any array carrying `SECURE_CHOICE`: field-observed mid-ride as `gr-sim rejected orders: SECURE_CHOICE requires a live secure window.`
4. **The ceiling ends every ride at wave 2.** Non-boss ceiling is `secureWave + 2` (src/sim/HeadlessContractSim.ts:1180-1183) = 2. Both my idle probe and my active rides ended at exactly `waves: 2, timeMs: 60033, endReason: "wave-ceiling", secured: false`.

Corroboration: the county's own `assets/contracts/winnability-receipts.json` already carries `e1-drill-yard: status "unclaimed", reason "standings-disabled"` — the yard was never meant to enter the book it is being ranked against.

Field runs (all deterministic; active controller reproduced `eventLogHash fnv1a32:73780fba` twice):

| run | tape | outcome |
|---|---|---|
| idle probe | `probe-idle.json` | secured:false, waves 2, 60.033s, gold 0, kills 23, rider-down at the ceiling boundary, `fnv1a32:134de7dc` |
| active tune | `tune-active-tape.json` | secured:false, waves 2, 60.033s, gold 15, kills 23, calls 4, `fnv1a32:73780fba` |
| **attempt 1 (scored)** | `attempt-1-tape.json` | secured:false, waves 2, 60.033s, gold 15, kills 23, calls 4, `fnv1a32:73780fba` |

The active controller panned gold-seam-2 (gold 0→15 proves the economy loop works), staged a turret build at `goldGte 50` (the 60s ceiling arrives before the purse does), kited the hero via `FALLBACK_IF enemiesGte 5` + `HOLD`, took `double_tap_coil` from the one upgrade draft, and stood ready to answer any `pendingSecure` with an instant `bank`. The window never opened; the county said so in as many words.

## Outcome

**Not secured — and unsecurable by construction.** Best ride: waves 2, timeAlive 60.033s, gold 15, kills 23, calls 4, `eventLogHash fnv1a32:73780fba`, `endReason: "wave-ceiling"`. Tape put forward: `attempt-1-tape.json` (as the evidence reel for the finding, not as a standing — the run is unsecured and must not be submitted). 3 sim runs total, 1 scored attempt; I stopped there because the wall is an authored constant (`secureWave: 0`), and no second attempt can move it.

## What the map asked

Nothing of the era's signature mechanic. E1's mechanic is survival against the bank cap — earn past the 200g pan cap by building stockpiles before the secure wave — but this map is the tutorial yard wearing a contract's clothes: `secureWave: 0` means there is no secure wave to bank toward, the 60-second/wave-2 ceiling closes the ride before the economy can even reach the first turret (≈15g panned by ceiling against a 50g turret and 60g stockpile), and the yard's real furniture — the assay-tent faucet (`top_up`), the drill bell (`ring`), the straw men and rolling logs (`strike`) — is browser-side interaction with no standing-order verb at all, so the door rider cannot touch the very stations the briefing names. The fields that carried what little there was: `stablePrefix.mechanics.interactables` (present but unreachable through the grammar), `now.seams`/`HARVEST` (the one working economy loop), and the almanac's wave packs + continuous trickle (ordinary E1 pressure). No `pendingSecure`, ever — which is the whole story.

## Winnability

**Not winnable through the door from its starting kit: the authored `twist.secureWave: 0` makes the secure latch unreachable (`RunManager.maybeSecureRun` refuses `secureWave <= 0`, so `pendingSecure` never opens and `SECURE_CHOICE` is rejected), and the wave ceiling of `secureWave + 2 = 2` ends every ride unsecured at 60s — a wall in the map's constants, not in the grammar, the economy, or my budget — consistent with the county's own receipt (`standings-disabled`): the practice yard is deliberately outside the ledger, and L2 arguably should not bind it, or else it needs either a real secureWave or removal from the door list.**

## Lessons for my notebook

- e1-drill-yard is the tutorial practice yard riding the door contract list: `twist.secureWave: 0` + `RunManager.maybeSecureRun`'s `secureWave <= 0` guard = `run_secured` unreachable, `pendingSecure` never opens, `SECURE_CHOICE` refused ("requires a live secure window"), ceiling `secureWave + 2` = wave 2, 60s. Do not spend attempts on play quality when the constants close the door — one honest scored ride plus the code trace is the complete finding.
- Check `assets/contracts/winnability-receipts.json` FIRST on any unclaimed contract: the county had already written `e1-drill-yard: standings-disabled`. Two minutes of receipts beats a wall of tapes.
- A contract's `practice` block (faucet/bell/targets, ledger suppression) is browser-only furniture: headless, the faucet and bell have no verb, so the briefing's own goals are unreachable through the grammar — but gr-sim still writes tapes and runs real waves with a continuous trickle on top of wave packs.
- The mid-ride refusal probe is cheap and safe: a rejected array never enters the tape (determinism holds, verified by identical `eventLogHash` across two rides), and the refusal string on stderr is quotable field evidence.
- `endReason: "wave-ceiling"` can coincide with rider-down at the same boundary (hero hp 0 at 60.033s in both probe and active rides); read `appendLog` for the per-wave outcome, not just the terminal line.
- Sub-90-second maps leave the E1 economy no room: ~15g panned by the wave-2 ceiling vs 50g first turret — on any future short-ceiling map, either the starting kit funds the defense or the defense never exists.
