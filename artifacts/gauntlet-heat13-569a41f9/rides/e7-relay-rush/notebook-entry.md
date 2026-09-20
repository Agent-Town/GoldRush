
## generation 63 — 2026-09-07T10:24:29.983Z
model: claude-opus-5 · harness: Claude Code CLI 2.1.257 · effort: n/a · era: 09838c3502b8d6038960dc9743f8a04c65522581ece88e6920079ae39dd7b5d4 · contracts: e7-relay-rush
cost: wallClock 658s · setupToFirstOutput 195s · tokens in 120 / out 101041 (+cache read 18437285) over 60 turns, 34 tool calls (measured from the CLI transcript) · $ unavailable (owner-authorized subscription)
- Scribe (operator, labeled): SECURED — w20 / 600.000s / 55g / calls 67 · runs 2 · scored attempts 1 · worldModel sim-import. Door: verified fnv1a32:e4238fc2, rank 1. Heat 12 (re-ride), ride 3.
- Winnability (rider, verbatim): Secured, and the margin was **wide on survival and exactly-nil on the deadline sample**: the hero never once dropped below its running maximum across all 72 views and no work was ever wrecked, but `litAtDeadline` came in at **3 against a target of 3** — one refused build coordinate on the r1 or r3 trip and the run would have been unsecurable at every later wave — and the one number I genuinely left on the table is gold, where a tier-upgrade sink fired in the last second and took a purse that had reached the 200 cap at t = 598.9 down to **55** at the secure tick.
- What the map asked (rider, verbatim): It asked its era's signature mechanic **squarely, twice, and both times the mechanic gates the secure** — this is not stationary survival wearing E7's name, and it is not the contract my notebook remembers. E7 is playbooks and the Echo, and Relay Rush's proof is `suspended`: I had to make a program of my own and then let the county's own wall catch it. The loop is genuinely of the era and genuinely legible from the view: submit the orders you want repeated (they are the demonstration), `PLAYBOOK_USE` a fresh name (which records them as a tape, installs the flattened tape as the standing order set, and hands the sim your own demonstration to run), then stand your hero where the static crosses. `syncProgramSuspension` clears the orders, counts one refusal, names `suspendedProgram`, and restores the set unchanged when the wall passes — muted is never damaged. That is L1 of the capability ladder working exactly as advertised, and it cost me one order and one blank line. On top of it sits the older half of the contract, the front as a **deadline**: three of four relay sites lit at the arrival of front 3, sampled once at t = 270 and latched forever. Because the claim at (−25, 41) sits inside `relay-site-r2` — and the four relay sites are the **only build ground on the map** — the fort and the first relay light are the same purchase, and the other two lights are a 20 wu and a 50 wu Prospector errand. The view fields that carried it were `now.playbookUse.{objective, objectiveMet, runningProgram, suspendedProgram, programSuspensions, shelf}`, `now.interferenceFront.{cadenceSeconds, crossingSeconds, halfWidth, centerX, phase, frontsArrived, relayTarget, deadlineFront, sites[].lit, litCount, litAtDeadline, deadlineResolved, objectiveMet}`, plus `now.hero.x/z` (which body the band is measured against), `now.works.entries`, `now.seams[].active/x/z`, `now.gold` against `now.score.goldPanned`, and `now.orders[].status/reason`. The orders were **`PLAYBOOK_USE`**, `BUILD`, `HARVEST`, `PICK_UPGRADE`, `MOVE_HERO`, `BLAST_AT`, `CONTEXT_ACTION upgrade`, and blank lines. The honest qualifier is that both gates are **front-loaded and cheap**: the playbook proof is discharged 97 seconds into a 600-second contract for one order, the third light lands at t = 150 for 105 gold, and waves 6–20 are ordinary stationary survival in a generous pocket against a roster (`rogue_automaton`, `data_rustler`) where neither entry is a `wrecker` — so no work can be attacked, `REPAIR_UNDER` and palisades are dead weight, and the fort is a monotone investment. **Does my notebook still describe this map? No — and the change is the whole heat.** Generation 33 rode this seed and reported that "there is no E7 verb — the front is answered entirely with epoch-1 grammar", that the objective was the relay deadline alone, and that a fourth beacon was worth buying as insurance against a wrecked light. Every one of those has moved: `PLAYBOOK_USE` exists and its refusal is now a second, independent secure gate; the front's mute is measured at the **hero**, a body that did not exist as a rider-positionable thing when generation 33 rode; and with no wrecker on the roster a lit site can never go dark, so the insurance beacon is pure waste. The geometry — the claim inside r2, the four ridge sites, the four harvest anchors at z = 32, the w2/81.3 s idle floor — reproduced to the tenth of a second.
- Lessons (rider, verbatim):
  - **A contract's standing in my own name dates the reel, not the map — eighth heat running, and this
    time the map grew a whole second secure gate.** Generation 33 secured `e7-relay-rush` and wrote
    "there is no E7 verb". `now.playbookUse.objective` now reads `"suspended"`, `PLAYBOOK_USE` is real
    grammar, and `E7PlaybookLatch.allowsSecure` pins the run unsecurable until the front has refused a
    playbook. Read `assets/engine-era.json` and the contract JSON as a **diff against the notebook**;
    on this ride the diff *was* the strategy.
  - **When a gate is a counter, find every site that MOVES it, not just the one the door document
    names.** `skill.md` describes the `suspended` objective as the wall suspending a running program.
    That is one of two writers of `interferenceFront.refusals.playbooks`; the other is `usePlaybook`
    itself, refusing a use requested under the band. Knowing both gave me a primary (the program, which
    fires on the fixed step and needs no view) and a fallback (a timed `PLAYBOOK_USE`, which needs a
    view but is instant). I shipped both in one controller and the primary fired.
  - **`syncProgramSuspension` reads the HERO now, and that is what makes the objective plannable.**
    Before ADR-005 stage 3 it read the Prospector — a body the rider could not position. The cure
    (`HeadlessContractSim.ts:3289`) makes the gate a function of where I walk, and the band's geometry
    is closed form: centre from `minX − 6` to `maxX + 6` over `crossingSeconds`, so a body at x is
    muted for exactly `2 × halfWidth / speed` = 2 s per crossing, at a time I can compute before
    writing an order. **Compute the mute window, then choose where the hero stands to meet it.**
  - **The program is the FIRST 32 orders of the concatenated demonstration, so make array one exactly
    32 orders.** `programOrders` flattens every recorded entry's orders into one array (skipping
    `PLAYBOOK_USE`) and truncates at `PROGRAM_ORDER_CAP` 32. Padding my opening array to exactly 32
    made the program provably identical to my own opening policy, so the ~30 seconds the sim spent
    running my demonstration was 30 seconds of my own plan rather than a mixture I never wrote.
  - **A blank line is what keeps a program running.** `gr-sim` returns on an empty submission without
    recording an entry, and `submitOrders` clears `runningProgram` on any ACCEPTED rider submission —
    so answering a view is how you take the wheel back, and silence is how you leave the program in
    place for the wall to catch. The blank line is now doing four jobs: banking the secure, keeping the
    last order inside the tick envelope, holding the reel to 67 entries / 236 KB, and holding the
    wheel.
  - **Read the roster for what it OMITS before designing the fort — and let it delete the insurance.**
    Neither `rogue_automaton` nor `data_rustler` carries `wrecker`, and `thief: true` forces
    `wrecker = false`, so `works.wrecked` was 0 at all 72 views and `goldStolen` was 0. A lit relay can
    therefore never go dark, which makes the deadline's "3 of 4" a **build-once** problem and makes
    generation 33's fourth-light insurance a 70 wu round trip bought against a risk that does not
    exist.
  - **On a fixed-wave secure, gold is the only free ranking axis, so the ladder's TAIL is the score.**
    Waves 20 and timeAlive 600.000 are pinned by the gate; my purse reached the 200 cap at t = 598.9
    and a `CONTEXT_ACTION upgrade` fired in the final second, banking **55**. The cure is one line I
    did not write: **stop spending at roughly t = secure − 80 s and let ~2.8 g/s refill the purse to
    the cap.** Generation 54 wrote "do the ranking arithmetic before writing the controller, not after
    the secure"; I did the arithmetic and then let a sink I had built for a different purpose undo it.
  - **Do not buy a stockpile on a thief-only roster.** `stockpile` is on this board (60 g, +150 cap,
    ×2) and looks like the answer to a 200-gold ceiling. It is also the thing that makes
    `nearestGoldHolding` non-empty (generation 38), which turns every `data_rustler` from a hero-chaser
    into a gold-grabber. On a map where gold is the ranking axis, raising the cap by inviting theft is
    a trade in the wrong direction.
  - **Ride the skeleton first and change nothing — fourth heat where that is the whole discipline, and
    the second in a row where it secured on ride one.** The gen-6→62 skeleton, retargeted to the new
    grammar (draft first under replace semantics with a plating-first scorer; a non-decreasing,
    cumulatively-gated ladder with more candidates than slots; a GROUND/ECONOMY-partitioned refusal
    blacklist fed from `now.orders[].reason`; `Number.isFinite` filtering on seam coordinates; one seam
    drained in a block of six before walking; a blank line at `pendingSecure`) plus the one thing this
    board does differently — the program-and-wall handshake — was the entire ride. Ten builds, zero
    stalls, both ladders capped.
  - **`MOVE_HERO` at a point the hero already occupies is free insurance, not a wasted slot.** It
    completes inside the 0.5 arrival radius on the first tick, returns `{}` and falls through, and it
    re-arms on every submission — which is what pins the hero on the claim (and therefore on the band's
    computed crossing time) without ever costing the Prospector a work assignment.
  - **The counter that gates this map is NOT the one published beside it.**
    `now.playbookUse.refusals` finished `{suppressed: 0, muted: 0, unrecorded: 0}` — all zero — on a
    run whose playbook objective was met. The refusal that counts lives on
    `interferenceFront.refusals.playbooks`, which the view does not publish; what a rider can see is
    `programSuspensions: 1` and `objectiveMet: true`. **Watch `programSuspensions`, not `refusals`.**
