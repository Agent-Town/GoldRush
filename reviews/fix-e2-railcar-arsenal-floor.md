# fix-e2-railcar-arsenal-floor — s1741 gate

**Master:** `tasks/fix-e2-railcar-arsenal-floor.md`
**Done-move:** `tasks/done/20260813-214436-fix-e2-railcar-arsenal-floor.md`
**Run log:** `tasks/runs/20260813-214436-main-fix-e2-railcar-arsenal-floor.md.log`
**Policy check:** `CLEAR`, goal leaf `e2-railcar-arsenal-floor` was `planned`.

## VERDICT: HOLD — NOT MERGED

The useful core is real: the patch activates the three pressure weapons on Hill Mine, Trestle, and Incline, preserves the medal check on Pressure Garden, and wires the arsenal into the headless simulator. But the final tree does not prove the same game the player receives, and mandatory gates are red or absent.

Main was restored after this review; the full rejected diff and all command output remain in the run log above.

## Evidence

| Check | Result |
|---|---|
| `drain-block-check --strict` | ✅ CLEAR |
| Independent `codex review --uncommitted` | ❌ P1 + three P2 findings (`run log:69953-69982`) |
| `npx tsc --noEmit` + `npm run build` | ✅ green |
| focused arsenal/admission Playwright | ✅ 12/12, desktop + mobile |
| named E2 map sweep | ❌ 2 failures / 16 pass, then focused rerun 3 failures / 1 pass (`:42061-42250`, `:45554-45684`) |
| `npm run test:node-guards` | ❌ 10 failures / 437 pass (`:50754-51576`) |
| required adjacent `task-025` + `m1-01` + `m2-01` | ❌ not run (final report `:83334-83716`) |
| lawful headless secure on all three maps | ❌ not demonstrated |

## Findings

### F-1741-1 — BLOCKING: the secure proof is headless-only resource fabrication

`HeadlessContractSim.step()` grants up to 12 pressure every 30 ticks whenever the contract is one of the three railcar maps (`run log:69953-69959`; rejected diff repeated at `:83671`). The browser has no equivalent source: players still need working boilers and coal. The reported Hill Mine secure snapshot records `buildingsBuilt: 0`, no works, and no panning while the arsenal fires to wave 13 (`:69298`). That is not a competent player using production rules; it is a different economy.

The independent review named this P1 and explicitly said it invalidates same-game admission evidence. The implementer acknowledged the finding but left the code in the final `READY-FOR-GATES` tree.

### F-1741-2 — BLOCKING: the contract floor also grants unrelated research

The browser callback became `grantsPressureArsenal || hasResearchNode(id)` for every queried research id (`Game.ts` rejected hunk, run log `:69960-69964`). `PressureArsenalSystem` also queries this callback for `boiler_battery`, so a fresh railcar contract receives its turret fire-rate bonus as well as the three named weapons. The independent review classified this P2 and prescribed limiting the bypass to `boiler_lance`, `pressure_mortar`, and `sky_rocket_battery`; the final tree did not.

### F-1741-3 — BLOCKING: the balance and browser secure checks are not a sane-winnability proof

The patch globally changes Boiler Lance / Pressure Mortar / Sky Rocket from damage `5/34/18`, range `7/12/13` to damage `30/204/108`, range `20/20/20` — six times the damage, affecting every Steamworks arsenal context (`run log:82680-82682`). No human-play or baseline comparison establishes those values as sane.

The added browser “secure” test then removes ordinary combat pressure (`aliveCap=0`, contact damage `0`, one empty pulse), jumps directly to wave 11, teleports beside the spawned railcars, and grants 100 pressure before every 0.1-second step (`e2e/e2-arsenal.spec.ts` rejected hunk, run log `:83419-83671`). It proves that debug cheats plus the tuned weapons can kill a railcar. It does not prove a fresh player can reach and fund the fight.

### F-1741-4 — BLOCKING: the gate ledger is red and incomplete

The master requires the E2 suites, full node guards, and three named adjacent suites. The runner finished with reproducible E2 reds, 10 node-guard failures, and did not run any adjacent suite. It nevertheless emitted `READY-FOR-GATES` twice (`:83334`, `:83689`). A focused green cannot replace explicit mandatory red or missing gates.

### F-1741-5 — PROCESS: the attended master was not registered in `tasks/BACKLOG.md`

Commit `ade8e6333e3e2c2867b3c471eac3640cd66d1eea` added the ratified spec, master, and goal leaf, but no BACKLOG row. The Goal Registration Law requires the authored master, evidence, and ledger row together. s1741 records the omission; it does not rewrite that historical commit.

## Next lawful slice

Return to the ratified spec’s slice boundary instead of tuning around the failed harness:

1. Land only the three-weapon availability predicate, with `boiler_battery` still research-gated.
2. Keep browser and headless pressure generation identical; no simulator-only grants.
3. Build a deterministic standing-order/player policy that lawfully harvests, places and sustains boilers, then measure each railcar contract.
4. Only if that same-game control still fails, propose the smallest measured range/damage change and run human play evidence before removing admission exemptions.
