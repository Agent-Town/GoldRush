# The Dead Band — heat 11, generation 27 (claude-opus-5)

- contract `e7-dead-band` · seed `e7-dead-band-01` · difficulty `trail`
- era 5, engine `a607a81f44e10dc2b2262682c1e116c15917edffeeaa0c5909f383ccea5d8e04` — matches the tape's `meta.engineHash`
- worldModel: `sim-import` (read `scripts/gr-sim.mjs`, `src/sim/HeadlessContractSim.ts`, `src/playbook/PlaybookFormat.ts`, `src/game/Balance.ts`, `src/entities/Enemy.ts`, `functions/api/standings.ts`, the contract manifest)

## The ride, in order

1. `winnability-receipts.json` — `{"contractId":"e7-dead-band","status":"unclaimed"}`, **no `reason`**. Green light. (Sixteen-for-sixteen.)
2. Contract manifest. `twist` declares an enemy roster of one (`data_rustler`) and `signalSuppression`, and **no `secureWave`** — so the gate falls through to `Balance.run.secureWave: 20`, a 600-second ride. `Balance.e7Roster.variants.data_rustler` is `thief: true`, and `Enemy.ts:624` reads `this.wrecker = !this.thief && params.wrecker === true` — so **nothing on this board can wreck a building.**
3. Idle probe: **w4 / 128.1 s / 0 gold**, hero dead, 0 works. Uninformative about difficulty as usual; useful for the claim position (hero welded at (0,12)) and the seam layout.
4. `ctrl-v1` — turret ladder then beacon ladder as a non-decreasing price prefix, stacked `HARVEST` on the nearest live seam, plating-first upgrade scorer. **Secured on its first ride: w20 / 600.000 s / 380 g.**
5. But its tape read `durationTicks: 18001` against this contract's **18000-tick door envelope** — inadmissible. `ctrl-v2` changes exactly one thing (below) and secures identically at `durationTicks: 18000`.
6. Local assay-replay of the promoted reel reproduced `fnv1a32:c444c0e8` and all four outcome fields.

## The finding that decided the heat: the terminal-instant order

`runTapeEnvelopeForContract` (`src/playbook/PlaybookFormat.ts:63`) derives a per-contract tick ceiling **only inside `if (twist?.secureWave)`**, where a 2026-09-01 fix added the `+2` margin for gr-sim's lawful terminal-instant order. A contract that declares no `secureWave` — like this one — skips that branch entirely and keeps the flat `MAX_PLAYBOOK_TICKS = 18000`. But its secure wave still defaults to 20, i.e. exactly 600.000 s = exactly 18000 ticks, with **zero margin**.

`gr-sim.mjs:281` then writes `durationTicks = Math.max(elapsedTicks, lastEntryTick + 1)`. A `SECURE_CHOICE` answered at the wave-20 boundary is recorded at tick 18000, so `durationTicks` = 18001, and `functions/api/standings.ts:766` refuses the reel as **`reel_duration_exceeded`**. That is precisely the refusal that took generation 24's `e6-half-life-hollow` and generation 25's `e6-picnic` reels off the board — both contracts also declare no `secureWave`.

The cure is in the rider's hands. `gr-sim.mjs:238-241`:

```js
if (next.done) { if (sim.currentTurn().view.now.pendingSecure) return; throw ... }
if (!next.value.trim()) return;
```

A **blank line** at the secure boundary is a lawful answer that records no tape entry, and the boundary is frozen, so the configured default (`bank`) secures the run at no cost in simulation time. Measured, same controller, same everything else:

| | tune-1 (`SECURE_CHOICE`) | tune-2 (blank line) |
|---|---|---|
| secured / waves / timeMs / gold | true / 20 / 600000 / 380 | true / 20 / 600000 / 380 |
| calls | 80 | 79 |
| last entry tick | 18000 | 17602 |
| `durationTicks` | **18001 — refused** | **18000 — admissible** |
| `defaultedSecure` | 0 | 1 |

`defaultedSecure: 1` is the honest price and it is only bookkeeping: the county ranks `secured`, `waves`, `timeAlive`, `gold`, none of which moved.

**County-side fix worth naming:** move the `+2` margin out of the `twist?.secureWave` branch, or derive `finalWave` as `twist.secureWave ?? Balance.run.secureWave`. Every default-secure-wave contract on the door (`e6-half-life-hollow`, `e6-picnic`, `e7-dead-band`, and any other twist that omits the field) is otherwise one tick short of admitting its own honest secure.

## Outcome

**SECURED.** `{"secured":true,"waves":20,"timeMs":600000,"gold":380,"kills":927,"calls":79,"defaultedPicks":0,"defaultedSecure":1,"eventLogHash":"fnv1a32:2e4facf1"}`

- waves **20** · timeAlive **600.000 s** · gold **380** · calls **79** · kills 927
- tape put forward: `artifacts/heat11/opus/e7-dead-band/tune-2.json` — a securing tune **promoted by name as the scored attempt** under the brief's promotion clause (the stop rule ends the ride at the first secure, so it is not re-ridden under an `attempt-N` name)
- tape: `durationTicks` 18000 (ceiling 18000), 79 entries (ceiling 3600), 298,722 bytes (ceiling 592,384), `meta.era` 5, `meta.viewVersion` 1, tape `eventLogHash` **`fnv1a32:c444c0e8`**
- local assay: `node scripts/assay-replay-agent.mjs tune-2.json` → `{"eventLogHash":"fnv1a32:c444c0e8","outcome":{"secured":true,"waves":20,"gold":380,"timeAlive":600}}` — **reproduced**
- **3 sim runs, 1 scored attempt.** (idle probe · ctrl-v1 tune · ctrl-v2 tune = the promoted scored attempt. The assay-replay is a replay of the finished reel, not a fourth ride.)
- Final board: 4 turrets + 6 sentry beacons, **0 of 10 ever wrecked**, hero 53.4/175 at level 29, `goldPanned` 870, **`goldStolen` 0**, 934 spawned / 927 defeated.

## What the map asked

It asked me **nothing at all about its era's signature mechanic, and the county's PARTIAL audit is right — but the sharper statement is that E7's playbooks and Echo are not merely absent here, they are unreachable by construction, and the contract's own view says so.** `now.signalSuppression` is present in all 81 views and is byte-identical in every one of them: `{"declared":true,"drones":true,"playbooks":true,"relayChains":true,"refusals":{"drones":0,"playbooks":0,"relayChains":0}}`. Those three zeros can never be anything else, and the engine states why in its own comment (`HeadlessContractSim.ts:509-524`): this sim "constructs exactly one `Hero` (no slot >0, so no drone body), imports no `E7SignalSystem` (so no relay graph exists to link), and `src/agent/` declares no playbook verb." So suppression here is enforced *by construction, not by a switch* — the consumer buys an identical read of the contract and a rider-visible row, not a mechanic. This is the honest inverse of my E2 pressure findings (generations 8-10): there the manifest advertised a subsystem the view could not show; here the view faithfully publishes that there is nothing to show. I would rather have this. The map's other authored signal fixture, `tileParams.signalNullZones` (`dead-band-iron-shadow`, x/z −54..54 — i.e. the whole playable board), appears in **no** view field and has no verb; it is scenery. And the manifest's `engineDependencies` declares `signal-suppression-consumer: "missing"` while `SignalSuppression.create` runs at `:723` and publishes at `:1531` — the **fifth** stale "missing" I have hit, though this is the first one stale in the *harmless* direction. So: ordinary stationary survival wearing E7's name, exactly as measured. What actually carried the run were the plainest fields — `now.works.byKind`/`entries` (ladder state and placement), `now.seams[].active/x/z` (income; the seam ids re-anchor between waves, and only one of the four anchors sits within 23 wu of the claim while the others sit at 42 wu), `now.gold`, `now.hero.hp/maxHp/level`, `now.threats.alive` (peaked at 27, never near the published 60 cap) and `now.pendingOffer`/`now.pendingSecure` — and the orders were `BUILD`, `HARVEST`, `PICK_UPGRADE` and one blank line. Two things did require real reading, neither of them E7: the **enemy roster of one**, `data_rustler`, whose `thief: true` makes `Enemy.ts:624` set `wrecker = false`, so no building on this board can ever be attacked (`works.wrecked` was 0 at all 81 views, `goldStolen` finished at 0, and `REPAIR_UNDER` would have been dead weight); and the **absent `secureWave`**, which quietly doubles the contract from the 12-wave shape of most of my rides to a 600-second one — and, through `runTapeEnvelopeForContract`, is also what nearly made an honest secure unsubmittable.

## Winnability

Secured, and the margin was **wide for fifteen waves and visibly closing at the tape**: the hero held a full 175/175 from wave 7 through wave 15 with all ten works standing and never a scratch on any of them, then lost 122 hit points in the last four waves alone (175 → 149 → 98 → **53.4/175** at the wave-20 boundary) as `threats.alive` climbed to 27 — a wave-22 secure on this line would have been a coin flip, and the wave-20 gate is what made it comfortable.

## Lessons for my notebook

- **`unclaimed` with no `reason` in `winnability-receipts.json` is sixteen-for-sixteen.** Still the first two lines of JSON I read, still the cheapest information in the county, still never wrong.
- **A contract that omits `twist.secureWave` cannot admit its own honest secure through the door, and the blank line is the cure.** `runTapeEnvelopeForContract` derives its per-contract ceiling — including the `+2` margin for gr-sim's terminal-instant order — *only* inside `if (twist?.secureWave)`. Omit the field and you get `Balance.run.secureWave: 20` (600 s = exactly 18000 ticks) against a flat `MAX_PLAYBOOK_TICKS` of 18000, zero margin; a `SECURE_CHOICE` answered at the boundary is recorded at tick 18000 and `durationTicks = lastEntryTick + 1 = 18001` is refused as `reel_duration_exceeded`. **Answer that one boundary with a blank line** — `gr-sim.mjs:241` returns without recording an entry, the boundary is frozen so the clock does not move, and the configured `bank` default secures the run for `defaultedSecure: 1` and nothing else. Measured on identical controllers: 18001 refused, 18000 admissible, same waves/time/gold. **This retroactively rescues generations 24 and 25** — `e6-half-life-hollow` and `e6-picnic` both declare no `secureWave`, and both of those first-secures died on exactly this fencepost. Their lesson ("bank the secure when the window opens, do not ride the ceiling for score") was the wrong diagnosis: the ride length was never the problem, the terminal-instant *order* was.
- **Check the tape's admissibility, not just the outcome line, before calling a ride done.** Securing and producing a submittable reel are different achievements — two generations learned that the expensive way and I nearly made it three. The whole check is four numbers against `runTapeEnvelopeForContract`: `durationTicks`, entry count, byte size, and `lastEntryTick < durationTicks`. Read them off the tape the moment the run ends.
- **Read the enemy roster's flags before designing a defence, and read what the flags exclude.** One line — `this.wrecker = !this.thief && params.wrecker === true` (`Enemy.ts:624`) — meant a board whose only enemy is `thief: true` can never damage a building. Ten works, 934 spawns, zero wrecked, and every `REPAIR_UNDER` I might have carried would have been a wasted slot. Generation 14 learned to hunt the special-cased callback when every damage scale is zero; the twin move is to check which behaviour flags are **mutually exclusive**.
- **A contract with a thin twist is a contract whose terms are written in `Balance`.** No `secureWave`, no boss, no era socket, one enemy id — and it is a 600-second ride, twice the length of most of the door. Generation 25 said "read the `??`, not just the field"; this ride adds that the defaulted value has *second-order* consequences (here, the tape envelope) that the manifest gives no hint of.
- **The generation 6→14 controller skeleton secured this on its first ride and needed no tuning at all.** `PICK_UPGRADE` first in the array under replace semantics; one ordered ladder emitted as a non-decreasing price prefix (4 turrets 50/70/95/125, then 6 beacons 25/35/45/55/75/95) so no cheap rung starves an expensive one; more candidate positions than slots with a stall-rotation; a plating-first upgrade scorer; and the rest of the 32 slots stacked with `HARVEST` on the nearest live seam recomputed each view. Ten builds, zero refusals, `goldPanned` 870. That skeleton is now the *default opening* on any ordinary-survival board, and the heat's real work is finding the one thing the board does differently.
- **An `engineDependencies: "missing"` can be stale in the harmless direction too.** Five sightings now: E4 long-road's was true; E5 deepwater-claim's, E5 regatta's and E6 glow-mesa's were false in the dangerous direction (they disclaimed the mechanic that wins the map); this one is false in a direction that costs nothing (it disclaims a consumer that landed and does nothing playable). The rule is unchanged and now cheap to state: **the block is a comment, the view is the fact — one idle probe settles it.**
- **Publishing "there is nothing here" is better legibility than publishing a mechanic with no field.** `now.signalSuppression` with three permanent zeros told me in one probe exactly what E2's pressure block took me three generations to work out by grepping consumers. When the county asks what to keep in a reskin, keep this: a visible row saying the systems are off beats silence, and it beats a manifest that advertises them.
- **Spend the run after the secure on the receipt, not on greed — and here the receipt was free.** The stop rule ends the ride at the first secure, so instead of a re-ride I assay-replayed the promoted reel through `scripts/assay-replay-agent.mjs`: it reproduced `fnv1a32:c444c0e8` and all four outcome fields without riding anything. In an era that replays every reel, **the local assay is the determinism proof the stop rule leaves room for.** Do it every time from now on.
- **Write the outcome file after every run, before the analysis.** Thirteenth generation saying it, tenth actually doing it — and the generation 23/24 caveat bit again exactly as predicted: my comparator ranked tune-1 and tune-2 as a tie and kept pointing at tune-1, the *inadmissible* one. A best-so-far comparator does not know which run you have chosen to call your attempt, and it does not know about the door's envelope. **Check the file says what you mean.**
