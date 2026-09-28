# same-game-audit-verbs-1: report

READY-FOR-GATES. Branch `fix/same-game-audit-verbs-1` in `/Users/robin/Claude/Projects/wt-sga1`, cut from main at `3b12c4236`, which carries door-tape-grammar-2 (`320797e15` is its ancestor). Never merged or rebased. Implementer: Claude Opus 5.5 at maximum effort, Node v26.4.0 first on PATH. Nothing was deployed, and nothing this slice ran contacted the county door, the live site or the droplet (the two ledger guards in the battery exit before any network step, see Gates).

Commits, prefix `fix:`, path-scoped, one concern each:
1. `c4f783860` the class-8 exemption citations resolve live instead of three rotted `Game.ts` literals.
2. `342b64251` the wire's `agent_orders` is exempt as the seated rider's own order channel, with no parity row (scope 1).
3. `42b607688` `prospector_dispatch` pairs with `HARVEST`, measured with the sim on every board (scope 2).
4. `6b6252920` `docs/bench/same-game-audit.md` regenerated on the tree (scope 3, F-KV2-5).
5. `f6a90a262` comments only: the pairing note and the pin's reason say "at base stats" and name the measured pan-speed yield gap (F-SGA1-2).
6. this report and its evidence (scope 4).

## Verdict in one paragraph
Both measurements came back clean, and the summary moved by exactly their sum. The wire's `agent_orders` is the seated rider's own order channel, not a human control, so it is exempt and publishes no parity row: its 42 rows left `agent-lacks` and none entered `equal`. The `HARVEST` pairing HOLDS in reach, measured rather than inferred: Game.ts's own dispatch methods, lifted into the harness, and a `HARVEST` sent through the harness's public door walk the same path, arrive on the same tick and pan the same seam once for the same gold on all 38 boards the door admits, and at base stats the yield is identical too. Only the cadence differs (the dispatch pans 2 ticks later and leaves the seam 26 ticks sooner). One measured caveat goes to the owner (F-SGA1-2): once panning is upgraded to a 0.6 s tick (two `pan_legend` stacks), GR-SIM's `HARVEST` earns one more, passive, pan per order than the dispatch (double the dispatch's gold on 41 of 41 boards with a seam: 10 against 5, and 14 against 7 on Dry Gulch), because its receipt holds the Prospector, which is GR-SIM's harvest actor, on the seam for 0.9 s. The audit's rows measure reach, so the pairing stands; the yield gap is a Same-Laws question. Summary: **0 / 595 / 1252 / 0 over 1847 rows before, 0 / 515 / 1290 / 0 over 1805 rows after** (agent-exceeds / agent-lacks / equal / not-offered).

## Pre-flight (as the master wrote it)
- `git status --short`: only `?? node_modules`, the untracked symlink to the primary checkout's. No modified tracked file.
- `git log main..HEAD`: empty (0 commits); `main` and `HEAD` both `3b12c4236`.
- `npm run build`: rc=0 before touching anything (2026-09-25T17:10:14Z to 17:10:38Z, 1-minute load 40.9).
- No `.env.local` in the worktree (existence checked, nothing read).

## Measurement 1: the `agent_orders` exemption (scope 1)

**What the action is.** door-tape-grammar-2 taught the county door the lockstep wire's `{ type: 'agent_orders', version, orders, submissionId }` (`functions/api/standings.ts:1773`). Its writer is the rider's seat: `SeatedLockstepSim.submitOrders` normalizes the rider's orders into exactly that action (`src/sim/SeatedLockstepSim.ts:203-217`, the literal at `:208`). Its only reader is `Game.applyMultiplayerAction`, which hands the orders to a rider body only when the slot's client is `headless` (`src/game/Game.ts:3744-3750`; the `submit` call at `:3747`). A human has nothing to press here, and an agent cannot lack its own channel. The audit read it as a human tape action because its tape-action reader collects every `value.type === '...'` literal in `validTapeAction` (`scripts/same-game-audit.mjs:154-164` at the base). The solo tape's `{ kind: 'agent_orders' }` (`standings.ts:1744`) never made a row, because that reader cannot see a `kind`.

**What changed.** The tape exemption table (`scripts/same-game-audit.mjs:246-259`) now tells two kinds apart with `parityRow`:
- `parityRow: true` (the four existing entries): a human control the agent lacks by design. The rows stay and count as `agent-lacks`; the exemption only says why no verb is owed. This is exactly how they behaved before.
- `parityRow: false` (`agent_orders` only): not a human control at all, so the action publishes no parity row (`:261`, skipped at `:745`).

The report's class-8 table gained a "parity rows" column that says which kind each entry is, and the citation resolves live: `src/game/Game.ts:3747 · src/sim/SeatedLockstepSim.ts:208`.

**The measurement.** `node scripts/same-game-audit.mjs --json` on the base and on `342b64251`, rows compared as whole tuples (contract, surface, humans-get, agents-get, direction, evidence):

| tree | agent-exceeds | agent-lacks | equal | not-offered | rows |
|---|---:|---:|---:|---:|---:|
| base `3b12c4236` | 0 | 595 | 1252 | 0 | 1847 |
| exemption `342b64251` | 0 | 553 | 1252 | 0 | 1805 |

Rows gone: 42, all `tape action agent_orders | no agent_orders standing order | agent-lacks`, one per contract. Rows added: 0. No other row changed. So the 42 left `agent-lacks` without entering `equal`. The grammar test now pins the exemption list, the one `parityRow: false` entry, and zero `agent_orders` rows (`scripts/same-game-audit.test.mjs:504-512`). On the base tree those assertions fail (42 rows), so they bite.

## Measurement 2: the `prospector_dispatch` pairing (scope 2)

**What a solo dispatch does in the sim** (read, `src/game/Game.ts`): the HUD input calls `dispatchProspector(node)` (`:8256`), which queues `{ type: 'prospector_dispatch', node }` and records it on the tape. At the top of the next fixed tick `beginProspectorDispatch` (`:8265`) resolves the node through `prospectorDispatchPoint` (`:8309`: an active seam by id, or `sluice-N` to the Nth active sluice), refuses unless playing and unpaused, and gives the Prospector `assignWork(point, 0)`. Right after `prospector.updateSimulation` each tick (`:3321`), `advanceProspectorDispatch` (`:8277`) waits until the Prospector is within `Balance.agent.arriveRadius`, settles `PROSPECTOR_DISPATCH_SETTLE_TICKS` = 4 ticks (`:395`), then calls `panAgentAt(node)` once (`:8295`). What the harness's order does (`src/agent/StandingOrders.ts:673-686`): `HARVEST {seam}` or `{sluice}` resolves the same two target kinds, walks the acting body there with `{ movement: point }` until it is within `arriveRadius` and not moving, then calls `pan_at` once, which in the harness is `HeadlessContractSim.panAt` (`src/sim/HeadlessContractSim.ts:2966`), the twin of `Game.panAgentAt`. In GR-SIM the acting body is the same `ProspectorEmbodiment` class the browser moves.

**Method: the audit's own, twice over** (`artifacts/same-game-audit-verbs-1/dispatch-pairing.mjs`).
1. Where the audit cannot run the browser it lifts Game.ts source and evaluates it in node (`browserPredicate`, `scripts/same-game-audit.mjs:625`). The probe does the same with the dispatch itself: `beginProspectorDispatch`, `advanceProspectorDispatch`, `prospectorDispatchPoint`, `distanceSq2` (`:10972`) and the settle constant are read out of `src/game/Game.ts` at run time, transpiled with TypeScript, and run against the harness's world. Nothing of the dispatch is retyped, so a change to it in Game.ts changes the measurement. The three substitutions are the Prospector (`sim.prospector`, the same class), the pan (`sim.panAt`, the one `pan_at` a HARVEST reaches in this engine, so both arms pan through one function) and the run state (playing until terminal; the harness has no pause). Begin runs before the tick and advance after it, which is where Game.ts runs them.
2. The audit measures the door by booting `HeadlessContractSim` per contract with its own seed (`same-game-seam-<id>`, the seam row). Every arm boots exactly that, with `admissionProbe: true` as the audit does.

Arms, each on a fresh sim after one warm-up tick (the e2e's own step before issuing): **D** one dispatch; **H** one `HARVEST` through `sim.submitOrders`; **C** no command. D and H each run twice. Target: the active seam nearest the Prospector in the rider's own view (`currentTurn().view.now.seams`). Window: 30 s after the command (900 ticks), or 10 s past the straight-line arrival when the seam is further (only `e4-long-road`, 188.6 wu, 1479 ticks). A board pairs only if ALL of these hold: both commands accepted; the command caused a pan (D and H each pan the target more than C does); the same pan amounts on the target; the same gold panned; the same remaining after; the same pans elsewhere; the same economy total at the end; the same walk tick for tick up to the same arrival tick; both pans taken within `arriveRadius` of the seam; and each arm reproduced itself exactly on its second run.

**Result, all 42 boards** (`dispatch-pairing.txt` and `.json`). First run 2026-09-25T17:29:31Z to 17:31:17Z at `c4f783860` (wall 106 s, 1-minute load 57.1 at start and 223.9 at end), which is the evidence `42b607688` shipped; re-run with the final script 17:54:25Z to 17:55:15Z at `6b6252920` (wall 50 s, load 27.5 to 17.6), results, wire and sluice identical, only `wallMs` differs; `src/` is identical on both trees and on the tip:

| contract | door admits | target (distance wu) | window ticks | dispatch: first pan tick, gold | HARVEST: first pan tick, gold | control pans | pan D minus H | left seam H minus D | verdict |
|---|---|---|---:|---|---|---:|---:|---:|---|
| the-claim | true | gold-seam-2 (8.3506) | 900 | 56, 5 | 54, 5 | 0 | 2 | 26 | pairs |
| e1-drill-yard | true | gold-seam-1 (8.3506) | 900 | 56, 5 | 54, 5 | 0 | 2 | 26 | pairs |
| e1-dry-gulch | true | gold-seam-1 (8.3506) | 900 | 56, 7 | 54, 7 | 0 | 2 | 26 | pairs |
| e1-night-shift | true | gold-seam-3 (10.3012) | 900 | 68, 5 | 66, 5 | 0 | 2 | 26 | pairs |
| e1-twin-banks | true | gold-seam-2 (20.7095) | 900 | 133, 5 | 131, 5 | 0 | 2 | 26 | pairs |
| e1-baron | true | gold-seam-2 (26.7119) | 900 | 170, 5 | 168, 5 | 0 | 2 | 26 | pairs |
| e10-ember-shore | true | gold-seam-2 (31.2286) | 900 | 199, 5 | 197, 5 | 0 | 2 | 26 | pairs |
| e10-archive-world | true | gold-seam-3 (19.5688) | 900 | 126, 5 | 124, 5 | 0 | 2 | 26 | pairs |
| e10-last-claim | true | gold-seam-2 (65.3269) | 900 | 412, 5 | 410, 5 | 0 | 2 | 26 | pairs |
| e10-river | false | none | - | - | - | - | - | - | no active seam |
| e2-hill-mine | true | gold-seam-2 (19.8435) | 900 | 128, 5 | 126, 5 | 0 | 2 | 26 | pairs |
| e2-trestle | true | gold-seam-1 (13.8313) | 900 | 90, 5 | 88, 5 | 0 | 2 | 26 | pairs |
| e2-pressure-garden | true | gold-seam-2 (16.6098) | 900 | 107, 5 | 105, 5 | 0 | 2 | 26 | pairs |
| e2-incline | true | gold-seam-1 (45.2653) | 900 | 286, 5 | 284, 5 | 0 | 2 | 26 | pairs |
| e3-blackout-ridge | true | gold-seam-3 (6.5837) | 900 | 45, 5 | 43, 5 | 0 | 2 | 26 | pairs |
| e3-moth-season | true | gold-seam-3 (10.3012) | 900 | 68, 5 | 66, 5 | 0 | 2 | 26 | pairs |
| e3-canyon-works | true | gold-seam-2 (81.5196) | 900 | 513, 5 | 511, 5 | 0 | 2 | 26 | pairs |
| e3-fairground | true | gold-seam-3 (19.1401) | 900 | 123, 5 | 121, 5 | 0 | 2 | 26 | pairs |
| e4-dust-flats | true | gold-seam-2 (75.7696) | 900 | 477, 5 | 475, 5 | 0 | 2 | 26 | pairs |
| e4-long-road | true | gold-seam-2 (188.5742) | 1479 | 1182, 5 | 1180, 5 | 0 | 2 | 26 | pairs |
| e4-gusher-county | true | gold-seam-2 (52.8802) | 900 | 334, 5 | 332, 5 | 0 | 2 | 26 | pairs |
| e4-boneyard | true | gold-seam-2 (62.2826) | 900 | 393, 5 | 391, 5 | 0 | 2 | 26 | pairs |
| e5-deepwater-claim | true | gold-seam-2 (50.9618) | 900 | 322, 5 | 320, 5 | 0 | 2 | 26 | pairs |
| e5-regatta | true | gold-seam-1 (5.2101) | 900 | 36, 5 | 34, 5 | 0 | 2 | 26 | pairs |
| e5-stillwater | true | gold-seam-1 (50.9618) | 900 | 322, 5 | 320, 5 | 0 | 2 | 26 | pairs |
| e5-flotilla | true | gold-seam-2 (9.2469) | 900 | 61, 5 | 59, 5 | 0 | 2 | 26 | pairs |
| e6-glow-mesa | true | gold-seam-1 (55.6018) | 900 | 351, 5 | 349, 5 | 0 | 2 | 26 | pairs |
| e6-showroom | false | gold-seam-2 (35.1162) | 900 | 223, 5 | 221, 5 | 0 | 2 | 26 | pairs |
| e6-half-life-hollow | true | gold-seam-2 (27.7169) | 900 | 177, 5 | 175, 5 | 0 | 2 | 26 | pairs |
| e6-picnic | true | gold-seam-3 (3.4387) | 900 | 25, 5 | 23, 5 | 0 | 2 | 26 | pairs |
| e7-relay-valley | true | gold-seam-1 (12.4107) | 900 | 81, 5 | 79, 5 | 0 | 2 | 26 | pairs |
| e7-echo-canyon | true | gold-seam-3 (20.8678) | 900 | 134, 5 | 132, 5 | 0 | 2 | 26 | pairs |
| e7-dead-band | true | gold-seam-1 (41.4305) | 900 | 262, 5 | 260, 5 | 0 | 2 | 26 | pairs |
| e7-relay-rush | true | gold-seam-1 (8.0412) | 900 | 54, 5 | 52, 5 | 0 | 2 | 26 | pairs |
| e8-mare-claim | true | gold-seam-2 (25.2021) | 900 | 161, 5 | 159, 5 | 0 | 2 | 26 | pairs |
| e8-far-side | true | gold-seam-2 (16.618) | 900 | 107, 5 | 105, 5 | 0 | 2 | 26 | pairs |
| e8-low-orbit | true | gold-seam-1 (12.3315) | 900 | 81, 5 | 79, 5 | 0 | 2 | 26 | pairs |
| e8-eclipse | true | gold-seam-2 (20.9615) | 900 | 135, 5 | 133, 5 | 0 | 2 | 26 | pairs |
| e9-dome-basin | true | gold-seam-1 (44.412) | 900 | 281, 5 | 279, 5 | 0 | 2 | 26 | pairs |
| e9-seed-run | false | gold-seam-1 (2.6391) | 900 | 20, 5 | 18, 5 | 0 | 2 | 26 | pairs |
| e9-devils-alley | true | gold-seam-3 (12.2468) | 900 | 80, 5 | 78, 5 | 0 | 2 | 26 | pairs |
| e9-old-canal | false | gold-seam-1 (13.6494) | 900 | 89, 5 | 87, 5 | 0 | 2 | 26 | pairs |

**Read of the table.**
- **38 of 38 door-admitted boards pair**, every check true. The three door-refused boards that have seams (`e6-showroom`, `e9-seed-run`, `e9-old-canal`, measured through `admissionProbe` as the audit does) pair too; `e10-river` has no active seam, by design, so there is nothing to dispatch to. The control never panned a target on any board, so every pan in D and H was caused by its command, and every D and H arm reproduced itself exactly on its second run.
- **Cadence, identical on all 41:** the dispatch's pan lands 2 ticks after HARVEST's (the fixed 4-tick settle against the executor's live `actorMoving` wait), and HARVEST leaves the seam 26 ticks after the dispatch does (the receipt's linger, F-SGA1-2). Same seam, same gold per pan (5, or 7 on `e1-dry-gulch`), same remaining, same economy total.
- **The browser agrees.** On the Claim the lifted dispatch pans at tick 56, which is 1.867 s after the command: exactly the figure the same-laws e2e recorded in the browser for the player's dispatch on the same seam position (-9, 6.7) on 2026-09-02 (`artifacts/same-laws-harvest-parity/parity-desktop-chrome.json` and `parity-mobile-chrome.json`, rel 1.867). The lift reproduces the real dispatch's timing; nothing was tuned to get there.
- **The sluice half pairs** (the Claim; each arm got the same 40-gold `debug` grant through the Economy and one sluice placed through the harness's public wire seam at (0, 7), then `sluice-1` against `HARVEST {sluice: 0}`): both arrive on tick 27 by the same walk, neither pans, the dispatch queue empties and the order is `done`, and the economy ends at 15 gold in both (the sluice's own cycles).
- **The wire does nothing in GR-SIM:** `applyWireAction({ type: 'prospector_dispatch', node })` returns `false` and the Prospector ends exactly where the control ends, with no pan (F-SGA1-3).

**Verdict: the pairing holds, so it is paired** (`42b607688`). `tapeDoorVerb` gains `prospector_dispatch: 'HARVEST'` with the evidence above it (`scripts/same-game-audit.mjs:209-227`), and the report's list of verbless tape actions now reads the same pairing, so `prospector_dispatch` left that list. The rows read `tape action prospector_dispatch | HARVEST standing order reaches prospector_dispatch | equal` on the 38 admitted boards.

## The summary, before and after (scope 3)

Attributed by revert-and-reproduce, all four corners measured on this branch with `node scripts/same-game-audit.mjs --json` (the "pairing only" corner: the one line that builds `tapeNotAControl` emptied for one run, then the file restored and checked with `cmp`, sha256 prefix `e57493eed85531c96e3f` before and after):

| exemption | pairing | agent-exceeds | agent-lacks | equal | not-offered | rows |
|---|---|---:|---:|---:|---:|---:|
| no | no (the base) | 0 | 595 | 1252 | 0 | 1847 |
| yes | no | 0 | 553 | 1252 | 0 | 1805 |
| no | yes | 0 | 557 | 1290 | 0 | 1847 |
| yes | yes (shipped) | 0 | **515** | **1290** | 0 | **1805** |

The two moves are independent and add: the exemption is worth 42 rows out of `agent-lacks` and out of the table; the pairing is worth 38 rows from `agent-lacks` to `equal`, one per admitted board. The pairing's rows cite `functions/api/standings.ts:1772 · src/agent/StandingOrders.ts:51`; the four door-refused boards (`e10-river`, `e6-showroom`, `e9-seed-run`, `e9-old-canal`) keep `no prospector_dispatch standing order | agent-lacks`, the refusal every verb row inherits there. The pin sits at `scripts/same-game-audit.test.mjs:473` with both moves and the four corners written above it, and the grammar test pins every dispatch row to its contract's admission (`:515-519`).

**What the 515 are now.** 135 sit on the four door-refused boards, where every row inherits the refusal. The other 380 are ten tape actions times the 38 admitted boards, and nothing else (no buildable, ability, choice, seam or economy row lacks): five cited-by-design exemptions still counted (`death_action`, `research_pick`, `research_skip`, `set_pause`, `skip_ceremony`: 190), the two debug actions (`debug_spawn`, `debug_xp`: 76), the two Prospector policies ADR-005 records as human-only-richer (`set_agent_rung`, `set_agent_ability`: 76), and `restart` (38). See F-SGA1-4.

## The regenerated report and F-KV2-5 (scope 3)

`docs/bench/same-game-audit.md` had last been generated on 2026-09-14 (`c010f5f69`): it still read 511 / 1252 over 1763 rows, carried no row for the two verbs grammar-2 added, and cited `functions/api/standings.ts:1556` to `:1576` for a grammar that now sits at `:1750` to `:1776` (F-KV2-5). The audit resolves every citation live, so the cure is the regeneration: `node scripts/same-game-audit.mjs --write-report` at `42b607688`, committed as `6b6252920`. Each of the ten `standings.ts` lines it now cites was read and is its action's clause in `validTapeAction` (`:1750` the simple set, `:1752` place_build, `:1756` set_pause, `:1757` pick_upgrade and research_pick, `:1758` death_action, `:1760` secure_choice, `:1762` context_action, `:1772` prospector_dispatch, `:1774` set_agent_rung, `:1776` set_agent_ability). With every `file:line` normalized, the only content changes are this branch's: the summary, the class-8 table, 42 `prospector_dispatch` rows, and the worst-offender counts of the four refused boards (+1 each). The other 1737 changed lines differ only by a moved coordinate (git counts +1791 / -1748; the normalized diff is +54 / -11). The generator reproduces the file byte for byte, and its 13 em-dash lines are pre-existing source strings (13 before, 13 after).

**The same defect one table over** (`c4f783860`). The class-8 table carried the file's only unresolved citations: `src/game/Game.ts:2902`, `:2909` and `:2886`, typed as literals in `08fba1d64` (2026-08-12). Read today they land on a shooter unsubscribe, a cloth dispose and a megaproject clear, and the committed report published them as current. They now resolve through `line()` onto the lines where `Game.applyMultiplayerAction` applies each action (`:3776` death_action, `:3783` and `:3787` research_pick and research_skip, `:3760` set_pause), so the next move reds the audit instead of rotting. Measured: the `--json` rows are byte-identical before and after that commit.

## Adapted, and why
1. **The exemption removes rows instead of adding a direction.** "Leave `agent-lacks` without entering `equal`" could also have been a fifth direction such as `exempt`. It was not: the row schema's four directions and the summary's four keys are asserted by the audit's own test (`scripts/same-game-audit.test.mjs:34`) and pinned by `deepEqual`, and an action that is not a human control is not a parity row in the first place, exactly as the solo tape's `kind: 'agent_orders'` never was one. The exemption still stands in the table with its reason and live citation, so the doc says why the rows are absent.
2. **The pairing was measured in GR-SIM, with the browser's own dispatch lifted into it, not in a browser.** The only engine that implements the dispatch is Game.ts, which needs a page; a browser run needs a vite server and playwright, and the master budgets the drain lock for the node-guards battery and the functions gates only. The lift is the audit's own technique, it runs the real Game.ts methods rather than a transcription, and on the Claim it reproduces the browser's recorded dispatch timing to the tick (1.867 s). Nothing about the pairing rests on the older e2e, which was read, not re-run.
3. **The live `Game.ts` citations (`c4f783860`) are one step past F-KV2-5's letter.** F-KV2-5 names a `standings.ts` line, which regeneration alone cures. The same table I was editing carried the file's only three unresolved citations, rotted onto unrelated lines, and a regenerated report would have republished them as current. It is its own commit, byte-neutral on the rows, so the drain can drop it without touching the rest.
4. **One more file joins the audit's citation sources** (`src/sim/SeatedLockstepSim.ts`, read for citations only, like the other eighteen), so the `agent_orders` exemption can cite its writer as well as its reader.
5. **The report's verbless-actions line now reads `tapeDoorVerb`** (`scripts/same-game-audit.mjs`, `newlyEnumeratedTapeActions`), so a paired action stops being listed as having no verb. Before this, `weapon_toggle` only escaped that list because it was hard-coded out of it.
6. **The probe grew two options after the county run** (`SGA1_PAN_LEGEND_STACKS`, `SGA1_OUT`); the committed JSON and table were then re-run with the final script, so the evidence and the script agree.

## Gates (self-check), with the 1-minute load beside every timing
| gate | tree | result | when, load |
|---|---|---|---|
| `npm run build` (pre-flight) | `3b12c4236` | rc=0 | 17:10:14Z to 17:10:38Z, load 40.9 |
| `node --test scripts/same-game-audit.test.mjs` | `342b64251` | 6/6 pass | 55 s, load 224 at start, 136 at end |
| `node --test scripts/same-game-audit.test.mjs` | `42b607688` | 6/6 pass | 46 s, load 59.8 to 34.5 |
| `node --test scripts/same-game-report-guard.test.mjs scripts/same-game-audit.test.mjs` | `6b6252920` | 9/9 pass | 67 s, load 16.5 to 54.1 |
| `npx tsc --noEmit` | `6b6252920` | rc=0 | 17 s, load 83.9 |
| `npm run build` | `6b6252920` | rc=0 | 23 s, load 73.2 |
| `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, under the drain lock (`dlock.sh`, one blocking call, detached, waited on through its output file) | `6b6252920` | rc=1: 1018 tests, 1009 pass, 4 fail, 5 skipped (the ruled era-6 and F-E2S-3 skips); every same-game test green (`same-game-audit` 6/6, `same-game-report-guard` 3/3); the runner stamped "CONTENDED, 2 concurrent batteries" at start and end | lock held 17:49:02Z to 18:04:04Z (901.7 s), load 19.5 at start, 14.5 at end |
| `node --test scripts/same-game-audit.test.mjs scripts/same-game-report-guard.test.mjs` (after the comment-only commit) | `f6a90a262` | 9/9 pass; `--json` rows byte-identical to `42b607688`'s; the regenerated report byte-identical to the committed one | 47 s, load 14.2 to 12.4 |

**The four reds, attributed by a control on clean main** (`red-attribution-control.txt`). The control is `git archive 3b12c4236` of `scripts/`, `ops/` and `package.json` in the scratchpad, with no `.env.local`; each red file ran alone there and on the tip, node-only (no lock needed), 18:05:35Z and 18:05:38Z, load 9.9 and 10.1, with no other battery running. The red files and every script they spawn are byte-identical between the base and the tip (`git diff --quiet`), and none of them reads a file this branch touches.

| red in the battery | base `3b12c4236` alone | tip alone | attribution |
|---|---|---|---|
| `ledger-backup-pull`: "dry run prints a bounded plan without contacting the droplet" and "today's local backup makes the pull an offline no-op" | red, same message | red, same message | pre-existing and environmental: "ledger-backup-pull: GR_DROPLET_HOST missing from the environment and .env.local" (`scripts/ledger-backup-pull.mjs:8-9`). A scratch worktree has no `.env.local`, and none was read. No request left the machine: the script exits 2 before any network step. |
| `fixture-teardown`: "all 161 scripts/*.test.mjs fixture owners remove their temp directories" | its only failing child, `ledger-backup-fill-gaps-guard`, red 7 of 8, same message | same, 7 of 8 | the same missing host, one level down: the sweep reports that one owner failing, not a surviving fixture. |
| `node-guards-contention`: "contention is advisory, correctly counted, and absent when alone" ("node-guards board did not stay quiet for 300ms") | green (2.7 s) | green (2.4 s) | environmental: another session's battery was running for the whole of mine (the runner's own CONTENDED stamp); alone, it is green on both trees. |

Not run, and why: the functions gates (`test:accounts`, `test:mp`, `test:stats`), because `git diff --stat 3b12c4236..HEAD -- src functions` is empty; no playwright or preview server was started by this slice. The two raw logs committed here (`node-guards-battery.txt`, `red-attribution-control.txt`) carry em dashes inside the battery's own test names, verbatim; none is in anything written for this slice.

## Findings (reported, not fixed unless the commit list says so)

- **F-SGA1-1 (the audit, in the firewall but outside this scope; a latent mis-citation).** Every tape row cites `standings.ts` through a file-wide first match on the quoted action (`scripts/same-game-audit.mjs:758`, the needle `` `'${action}'` ``). `'agent_orders'` first occurs at `functions/api/standings.ts:934` (`decisionCount`, which counts the solo tape's `kind` form), so the 42 rows grammar-2 added cited `:934` from birth instead of the grammar clause at `:1773`. The exemption removes those rows, and every one of the ten remaining tape citations was read and lands on its clause today. The next action whose literal appears earlier in `standings.ts` will be mis-cited the same way, silently. Suggested cure: resolve the needle inside `tapeBlock`, as `verbDeclarationLine` (`:531`) already does for the union. Not done here: it changes no row today.
- **F-SGA1-2 (GR-SIM yield once panning is upgraded, measured; the one place the order does MORE than the dispatch; owner and audit owner).** The pairing holds in reach on every board, and at base stats in yield too, with two cadence differences that are the same on all 41 measured boards: the dispatch pans 2 ticks after `HARVEST` (its fixed 4-tick settle against the executor's live `actorMoving` wait; in the browser that wait reads presentation-stale diagnostics, which is why the same-laws e2e saw both at 1.867 s, F-SLHP-1), and `HARVEST` holds the Prospector at the seam 26 ticks longer, because its `pan_at` receipt sends the Prospector to the point it already stands on and that arrival works `Balance.agent.workSeconds` (0.9 s; `src/agent/Embodiment.ts` `handleReceipt`, then `stepTowardTarget`), while the dispatch pans without a receipt and leaves at once. In GR-SIM the Prospector is the harvest actor `'0'` (`src/sim/HeadlessContractSim.ts:3020-3026`, kept there on purpose by the rider-parity audit's item 2b, `docs/bench/rider-parity-audit.md:151` and `:219`), so standing at a seam channels it. At base stats (pan tick 1.5 s) the linger earns nothing: 0 extra pans on 41 of 41. With pan speed upgraded it does, and the probe measured where, on the whole county, both arms given the same stacks through Progression's own stat path: with one `pan_legend` stack (panTickMult 0.7, a 1.05 s pan tick) all 41 boards with a seam still pair; with two, the upgrade's own maximum (`src/game/Upgrades.ts:92-98`; panTickMult 0.4, a 0.6 s pan tick), `HARVEST` earns a second, passive pan 17 ticks after its first on 41 of 41 (38 of 38 admitted): 10 gold against the dispatch's 5 on 40 boards and 14 against 7 on Dry Gulch, seam remaining 20 against 25; the control never pans. In the browser the harvest actors are the heroes (`Game.visibleHarvestTargets`, `src/game/Game.ts:1284-1292`), so no linger there earns anything. The audit rows measure reach, so the pairing stands; the yield gap is a Same-Laws question for the owner (owner playtest 16, 2026-09-02: "The laws for human and AI players have to be the same."). Evidence: `dispatch-pairing-pan-legend-1.json` and `dispatch-pairing-pan-legend-2.json`.
- **F-SGA1-3 (GR-SIM seat, measured; recorded for the audit owner).** The harness's only door for a peer's action honours `place_build` alone (`src/sim/HeadlessContractSim.ts:1882-1885`). A `prospector_dispatch` handed to it returns `false` and moves nothing: on the Claim the Prospector ends exactly where the no-command control ends and no pan lands. So a GR-SIM agent seat cannot see a human's dispatch in a mixed room. Engine-crossed rooms already disagree by construction (`src/sim/SeatedLockstepSim.ts:196-198`, the desync message), so this is a known class, not a new break.
- **F-SGA1-4 (what the remaining agent-lacks rows mean; the audit owner's call).** On the 38 admitted boards the 380 remaining `agent-lacks` rows are ten tape actions and nothing else. 190 are the five cited-by-design exemptions (`parityRow: true`), which the table explains but the total still counts. 76 are `set_agent_rung` and `set_agent_ability`, the human-only-richer policies ADR-005 records. 38 are `restart`, uncited, although the headless terminal is already the run end exactly as the `death_action` exemption says. 76 are `debug_spawn` and `debug_xp`, which ADR-005 rule 1 says do not count as human controls in a plain solo boot (both are gated by `isDebugEnabled()` at `src/game/Game.ts:3037-3041`). Two questions for the owner: whether a cited-by-design lack should keep counting, and whether `restart` joins `death_action`.
- **F-SGA1-5 (src, outside the firewall; the F-RPA-4 class, INFERRED from a read of the code, not exercised in a page).** F-RPA-4 gated the solo T key (`src/game/Game.ts:3036-3037`, `isDebugEnabled()`), but the sampled-action path carries the same key ungated, and everything that funnels through `applyMultiplayerAction` applies it ungated (`src/game/Game.ts:3763`, while `debug_xp` beside it is gated at `:3765-3768`). The chain: `KeyT` sets `intents.debugSpawn` with no debug check (`src/core/InputController.ts:25`, `:294`), `lockstepInputFromIntents` copies it (`src/mp/LockstepClient.ts:954`) and `lockstepActionsFromSample` emits `debug_spawn` on its edge (`:860`). Three consequences follow from the code: (a) in a multiplayer room a plain-boot T spawns a debug pack on every peer (`captureLocalActions`, `:819-823`); (b) while a playbook is being recorded the sampled actions are applied live (`src/game/Game.ts:4118-4125`) and `debug_spawn` is not in `RECORD_SKIP_ACTIONS` (`src/playbook/PlaybookSession.ts:47-53`), so T spawns a pack in a plain solo boot; (c) the solo run tape records the press (`src/game/RunTape.ts:171-174`) that live play ignored, and its replay applies it (`src/game/Game.ts:7833-7839`), so the replay would spawn a pack the run never had and diverge from its own hash. The relay names neither verb (a grep of `functions/` and `ops/` finds only the standings grammar, which accepts both in a tape). A corrective belongs to its own master.
- **F-SGA1-6 (stale prose pointers into the audit; outside the firewall).** `scripts/board-launchable-guard.test.mjs:71` and `:135` and `src/meta/ContractFamilies.ts:2575` cite `scripts/same-game-audit.mjs:104` for the unavailable-contract regex, which was at `:166` on the base and is at `:169` now; `scripts/same-game-report-guard.test.mjs:23` cites `same-game-audit.mjs:345` for `cell()`, at `:796` on the base and `:843` now. Prose only; no guard reads them. Also: the regenerated report's "Verification" paragraph under the AP-16-4 section is hardcoded historical prose ("446 tests") that every regeneration republishes as if current.

## Evidence in this directory
| file | what it holds |
|---|---|
| `dispatch-pairing.mjs` | the probe: Game.ts's dispatch lifted into the harness, beside HARVEST and a control, per contract |
| `dispatch-pairing.json`, `.txt`, `.run.txt` | the county run at base stats: 42 boards, every arm without its tick trace, the wire probe and the sluice arm; the table; the run's clock, load and head |
| `dispatch-pairing-pan-legend-1.json`, `dispatch-pairing-pan-legend-2.json`, `dispatch-pairing-pan-legend.txt` | the same county run with one and with two `pan_legend` stacks in both arms, with their clocks and loads (F-SGA1-2) |
| `audit-summaries.json` | the attribution corners from `--json`: summary, row count, `agent_orders` rows and the dispatch rows' directions for each |
| `node-guards-battery.txt` | the full `test:node-guards` run under the drain lock at `6b6252920`, verbatim |
| `red-attribution-control.txt` | the battery's three red files alone on clean main and on the tip, verbatim |

## Remaining list, in order
1. Drain this branch (the attended session): six `fix:` commits (five on the audit, its test and its report, one for this report and its evidence); the pin is `0 / 515 / 1290 / 0` over 1805 rows.
2. F-SGA1-2 to the owner's desk: whether the rider's HARVEST may out-yield the player's dispatch in GR-SIM once panning is upgraded (the receipt's linger at a seam), or whether the linger, the dispatch or the harness's harvest actor should change. Not touched here (src/).
3. F-SGA1-5, a corrective for the lockstep `debug_spawn` gate (src/, the F-RPA-4 class).
4. F-SGA1-4, the audit owner's two questions (counted exemptions; `restart`); F-SGA1-1, the block-scoped tape citation; F-SGA1-6, the stale prose pointers.
