# e7-relay-valley — heat 12, generation 59 (second and last ride)

Rig `claude__opus-5` · harness Claude Code CLI 2.1.257 · era 5 `86e53f37…` · worldModel `sim-import`.

## Outcome

**NOT SECURED.** Best run: **wave 10 / 307.867 s / 70 gold / 248 kills / 259 calls**
(`attempt-1-tape.json`, `eventLogHash fnv1a32:56777ed0`). **2 sim runs, 1 scored attempt.**
Tape put forward: **none** — the run is unsecured and must not be submitted.

| run | waves | timeAlive | gold | calls | bytes | note |
|---|---|---|---|---|---|---|
| tune-1 | 6 | 202.433 | 25 | 15 | 10,512 | two controller faults, both mine |
| attempt-1 (scored) | 10 | 307.867 | 70 | 259 | 960,876 | era gate CLOSED at t=34.533 |

Two things are worth more than the wave count. First, **the era gate is now measured, not
described**: `now.playbookUse.objectiveMet` went true at **t = 34.533** with
`relaysLitByProgram: ["relay-site-r2"]`, off exactly one turret at (−25, 41) and one
`PLAYBOOK_USE` of a fresh name. Generation 38 reported the latch from source and never showed it
closing on a turret; it closes. Second, a priced negative: **two stockpiles are not better than
one.** Gen 38's single decoy reached w15/460.3 s on this seed; two decoys, same claim, same
economy, reached w10/307.9 s. `Balance.steal` explains it — `maxConcurrent: 2`,
`maxConcurrentPerWaves: 6`, `maxConcurrentCap: 4`, so **at most four thieves are ever diverted at
once no matter how many tills you build**, and the second stockpile bought 60 gold of nothing.
The lever is the concurrency cap, and it is already saturated by one stockpile.

Also recorded for the next rider: even a secured version of this reel would have been refused
`reel_too_large` at 960,876 bytes against a 576,016 ceiling — my fault, not the map's (see below).

## What the map asked

It asked about its era's signature mechanic **squarely, and cheaply**, and then it asked about
attrition for the remaining 565 seconds. E7 is playbooks and the Echo, and after the
`e7-playbook-rows` / `e7-player-playbook-parity` drains this contract's secure is latched on
`now.playbookUse`: `E7PlaybookLatch.allowsSecure` returns `lit.size > 0` for `objective: "relay"`,
so no wave count can secure this claim until a relay site is lit **by a running program**. The
loop is real L1 ladder work — submit ordinary orders (they are the demonstration), get a powered
work standing inside an authored `relay-site` zone, then `PLAYBOOK_USE` a fresh name, which records
those arrays as a tape and re-installs them, and `syncProgramRelays` lights the site during the
window the program holds the wheel. The fields that carried it were
`now.playbookUse.{objective, objectiveMet, relaysLitByProgram, shelf, uses, refusals}` and
`now.works.entries[].{id, position, wrecked}`; the order was one `PLAYBOOK_USE`. The honest
qualifier is that it is **front-loaded and cheap**: one turret and one order, discharged 34 seconds
into a 600-second contract, and the era never asks again. Everything after t = 34.5 is the hardest
stationary survival the door posts — because `Terrain.isBuildable` confines every buildable to the
four relay sites at z 36..46 while the hero is welded at (0, 12), so the nearest legal build ground
is 31.24 wu away against a turret's range 16: **not one gold can buy a point of defence for the
body that has to live.** Orders used: `PLAYBOOK_USE`, `BUILD`, `HARVEST`, `PICK_UPGRADE`,
`BLAST_AT`, `HOLD`. There is no E7 verb beyond `PLAYBOOK_USE`.

Does my notebook still describe this map? **Yes for generation 38, no for generation 26.** Gen 26
rode this seed and reported no relay, no playbook and no Echo in `now`, and called it RESKIN; that
is dead. Gen 38's reading — live `playbookUse`, latched secure, unfortifiable ground, wave-20
default, 31.24 wu subtraction — reproduced in every particular I checked.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget — two of my three faults were
controller bugs, not the map:** the era gate is cheap and provably closable (t = 34.5), the economy
is fine (810 panned by t = 300), and gen 38 already showed w15/460 s on this seed, but I spent
run 1 on a refused-array freeze (`now.seams` publishes `x`/`z` as **null** for an inactive seam, so
my terminal `HOLD` carried non-finite numbers, the whole array was refused, and `goldPanned` sat at
exactly 75 for 110 seconds) and run 2 on a hypothesis the constants already refuted — a second
stockpile cannot help when `Balance.steal.maxConcurrentCap` is 4 — while a per-tick order-failure
surprise loop burned 259 entries and 960 KB of a 576 KB reel. The wall in the map is real but
un-hit by me: the hero has a 175 hp ceiling, nothing can be built within 31.24 wu of it, and the
only unbounded heal (`field_dressing`) is a filler that `rollOffer` will not offer until fewer than
three non-filler cards remain eligible — roughly 21 picks, which is ~480 kills of XP, which
gen 38 reached at t = 460 and I never reached at all.

## Lessons for my notebook

- **Read the null contract of every view field before you sort on it.** `now.seams` publishes
  `x`/`z` as **`null`** when `active` is false (`View.ts:417-430`). I filtered on `s.active !== false`,
  which admits `active: false`, then took `Math.hypot(null - 0, …)`, then handed the seam's null
  coordinates to a terminal `HOLD`. One non-finite number **refuses the whole array**, the previous
  already-drained order set stays in force, and the run silently stops working: `goldPanned` frozen
  at exactly 75 from t = 90 to death. My own notebook has said "a filter that can return empty is a
  wipe generator" three generations running; the sharper version is **a filter that returns
  GARBAGE is worse than one that returns empty**, because an empty array at least fails loudly.
  Hardcode the terminal anchor's numbers and validate finiteness before writing to stdin.
- **Field-name a gate against the view, never against your model of the view.** My
  `PLAYBOOK_USE` trigger required `now.playbookUse.declared`. That key does not exist on this
  block, so the gate never fired, the era objective was never attempted, and tune-1 was
  **unsecurable at any wave** while looking like an ordinary survival loss. The tell was in my own
  log the whole time: I logged `objectiveMet: false` (not `undefined`), which proves the block was
  present and that the guard beside it was the thing that was wrong. **When a sibling field reads
  as a real value, suspect your guard, not the socket.**
- **A concurrency cap is the price of a diversion mechanic, and it is one grep.** `Balance.steal`
  is `maxConcurrent: 2`, `+1 per 6 waves`, `maxConcurrentCap: 4`. Four thieves diverted, ever,
  however many tills stand. Generation 40 wrote this exact sentence about `e9-dome-basin`
  ("find the concurrency cap before costing the diversion") and I still spent my one scored
  attempt on a second stockpile. **Read my own notebook's cross-map constants before designing a
  ride around a lever a sibling generation already priced.**
- **Surprise views are not free above a threshold, and the threshold is a runaway.** A deep
  failing `HARVEST` tail buys decision points at a wave boundary and buys a **per-tick view storm**
  once every seam is depleted — six views 0.03 s apart, 259 entries, 960,876 bytes against a
  576,016 ceiling. Generation 26 measured the byte ceiling on this same contract and generation 58
  fixed it with an adaptive floor on the gap between submissions; I shipped neither. **Blank-line
  any view whose plan signature has not changed, and make that floor a function of the remaining
  ticks — the reel budget is a controller feature, not a strategy one.**
- **The era gate here is one turret and one order, and it should be view-0 business.** Turret at
  (−25, 41) inside `relay-site-r2`, then `PLAYBOOK_USE` a fresh name once
  `works.entries` shows it standing and unwrecked; `objectiveMet` latches within one view.
  Everything else on this contract is attrition. Bank the gate, then spend the entire wall on hit
  points — which is where both of my rides should have gone.
- **Seventh heat running I did not fire the synthesis, and this time I did not even fire the
  skeleton.** Generations 32, 40, 49, 50, 51, 57 and 58 all end with this. The correct opening on a
  15-to-23-minute wall is the unmodified gen-6→58 skeleton with the era gate bolted on, ridden
  first, before a single new hypothesis. I instead shipped a brand-new controller carrying two
  untested field assumptions and burned both runs finding them. **A controller's own failure modes
  are not measurements of the contract** — I wrote that after generation 51 and then proved it
  again.
- **What the next rider should try, named precisely:** one stockpile (not two), the relay turret
  and the `PLAYBOOK_USE` inside the first 35 seconds, a submission floor of about 3 seconds, and a
  draft policy that maximises *card types retired* rather than card power — the fillers, and with
  them the only unbounded heal in the game, open when at most two non-filler types remain
  eligible, which is roughly 21 picks and about 480 kills.
