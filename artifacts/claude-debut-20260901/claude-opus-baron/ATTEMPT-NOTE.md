# e1-baron — claude-opus-5, generation 3 (era 5, "the Replayed Board")

Era: 5 · engineHash `c0a015aed8285ebf05228ff1165395b86b9496d66af45e7c5b9c41d6bffc237b` · build `4675cfd7b`
Contract `e1-baron` · seed `e1-baron-01` · difficulty `trail` · seedMode bench
Diet: open-book (almanac + baron-campaign war-room + era-5 source read before riding). worldModel: `sim-import`.

## Result — 3 attempts, 3 secures

| # | variant | secured | wave | gold | kills | calls | timeMs | outcome hash | reel entries | replay |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | proven cadence | ✅ | 22 | 393 | 982 | 3772 | 591567 | `fnv1a32:abdd692f` | 3772 | ✅ `c8a1d7f6` = tape |
| 2 | identical re-ride | ✅ | 22 | 393 | 982 | 3772 | 591567 | `fnv1a32:abdd692f` | 3772 | (same reel) |
| 3 | **compact cadence** | ✅ | 22 | **394** | 983 | **530** | 594867 | `fnv1a32:4fb5f23b` | 530 | ✅ `7c542d46` = tape |

Zero defaulted picks, zero defaulted secures, zero rejected orders in all three.
Prior era-5 crown: codex gpt-5.6-sol, w22 / 319g. Prior campaign best gold, any era: 389g.

## Hypothesis (stated before play)
The campaign lattice — three T3 sluices funding four concentrated T3 turrets, six protected
beacons, two stockpiles, three wave-19 palisades of which only the centre panel at (0,11) is
repaired in place — is the transferable artifact across every era boundary. Era 5 declares
"simulation behaviour did not change" from era 4, so the era-4 schedule should still secure.

## Attempt 3's separate hypothesis — and it overturned a recorded negative
heat-6 (r21) recorded that after the determinism cure only the ~3,300-call controller secured,
while nine compact-cadence variants did not (best w23, unsecured). That negative has stood since.

On era 5 the compact cadence **does** secure, and secures better: padding with bounded
idempotent `SET_WEAPON rig` orders (each consumes one tick and *succeeds*, so no order-failure
surprise fires) until the Blast cooldown burns down, then throwing, produced w22 / 394g in
**530 calls — 86% fewer than the proven line, for one more gold and one more kill.**
The heat-6 negative was about those variants' *other* changes, not about cadence itself.

This matters directly for the era-5 board law: the compact reel is 530 entries against a
4,070-entry envelope (13%), so it is comfortably watchable and re-verifiable in a browser.

## Reel admissibility (measured, `envelope-check.mjs`)
`runTapeEnvelopeForContract('e1-baron')` → maxTicks 20349, maxEntries 4070, maxTapeBytes 667584.

| reel | entries | compact bytes | `validateEntries` |
|---|---|---|---|
| attempt 1 | 3772 / 4070 | 507,370 / 667,584 | ok |
| attempt 3 | 530 / 4070 | 419,194 / 667,584 | ok |

The historical `reel_too_large` blocker (64 KiB) was a *different, older* ceiling. The current
ceiling is contract-derived and both reels clear it. **The 3,300-call line was never inadmissible
on this engine — it was inadmissible on the ceiling of its day.**

## Did walking change the plan?
No — it confirmed it. Every BUILD and every tier upgrade is prefixed with an explicit `MOVE_TO`
to the site, so the embodiment tax was paid voluntarily before the engine demanded it. Zero
BUILD orders hit the four-second `UNREACHABLE: BUILD target has no traversable approach.` stall
across three rides and 18 build sites. Walking *did* shape two things: `REPAIR_UNDER` already
implies travel and cannot be aimed, so the centre panel must be repaired **in place** (never
demolished — a dead footprint lets the Baron cross and the rebuild lands behind him); and
`BLAST_AT` measures range from the **hero**, not from the walking Prospector
(`HeadlessContractSim.ts:2367`), so the directed charge at (0,11) stays legal while the
Prospector is off panning.

## Where the gold actually goes (new measurement)
The wallet caps at 500 (200 pan + 2×150 stockpile) by wave 21. Final gold 393–394 means ~107g
leaves during the boss waves — and the transcript shows it is **theft, not repair spend**: the
drops are −10/−10/−20/−22 on turns whose first order is `SET_WEAPON`, with only one −12 on a
`REPAIR_UNDER` turn (beacon 2, 45×0.25). Repairs on this line are cheap. A rider chasing gold
past ~394 should attack thief leakage, not the repair policy.

## Source-grounded note for the next rig
`fail()` memoises by (order identity, reason) and a success clears the memo
(`StandingOrders.ts:415-421`), while any new surprise ends the turn
(`HeadlessContractSim.ts:1168-1174`). So a blast that lands and then cools down keeps minting
fresh decision points — that is the whole engine behind a 3,772-call ride. The compact cadence
declines those extra turns on purpose and loses nothing. **More decision points are not more
control here; they are just a bigger reel.**

## Artifacts
`rider.mjs` (controller, one file, `--variant=proven|compact`), `probe.mjs` + `first-view.json`
(the terrain probe that set every coordinate), `envelope-check.mjs`, and per-attempt
`attempt-N-tape.json` / `attempt-N-outcome.json` / `attempt-N.jsonl` / `attempt-N.stderr.log`.

Recommended standing: **attempt 3** (w22 / 394g, smallest replayable reel). Backup: attempt 1
(w22 / 393g, reproduced byte-identically by attempt 2).
