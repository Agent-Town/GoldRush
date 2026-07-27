> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, verified s1130 2026-07-27).** Optimisation **1** landed and that satisfies this draft on its own terms — it says verbatim *"Do not do all of them; land one, measure, then decide."* Content probe: `src/game/Balance.ts:828` **and** `:1014` both read `doubleTapCoilMaxStacks: 3` (the draft asked 6→3, "both literals"). Merge **`d2279d32`** *"drain: e1-midgame — Double-Tap Coil capped 6->3 in both literals"*, found via `git log -G` on the datum. ⚠️ **BACKLOG:1329 mis-attributes this to `5b61349e`, which is actually the base-path commit** *"the game learns to live at agenttown.app/goldrush"* — cite `d2279d32`. Options **2/3/4 were deliberately not taken** and remain unclaimed measurement work. Retained per the RETENTION LAW; the "Not queued" line below is **HISTORY, not an instruction**.

# DRAFT — THE E1 MIDGAME HAS NO DECISIONS (sixteen dead waves on Dry Gulch)
STATUS: DRAFT (E1-depth review, leg 2, 2026-07-26). Not queued. Balance-sized; do not start before `DRAFT-e1-river-camp.md`.
WHY: `reviews/e1-gameplay-depth.md` F-E1-8 and F-E1-9, both played.

## THE EVIDENCE (✓ VERIFIED — three honest runs, `reviews/shots-e1-depth/*-report.json`)
| Map | Outcome | Buildings bought (and when) | Level | Kills | Damage taken w3→w19 |
|---|---|---|---|---|---|
| e1-dry-gulch | **secured w20** | 7, all before wave 3 | 2 → **28** | 863 | **zero** |
| e1-twin-banks | died w17 | 9, all before wave 6 | 1 → 25 | 722 | some (died) |
| the-claim | secured w10 | 8, waves 0–2 | 1 → 3 | 23 | 8 hp |

Dry Gulch's middle sixteen waves — about eight of its ten minutes — ran with **one hero position (±3 m), one build set, no damage, and no decision but the level-up card every ~40 s.** The map's own signature never came up: it sells sluices-beside-the-spring and +40 % seams, and a sluice (40 g) was never affordable once pressure started, so the spring was scenery.

Mechanism, verified at source: `Balance.sparkRig` (dmg 12, rate 2/s, range 10) compounds with the offer — 6× Double-Tap Coil (+25 % rate each), 3× Heavy Spark (+30 % dmg), 2× Split Spark (+1 volley), 2× Long-Barrel Resonator (+20 % range) — while the wave curve tops out at `Balance.waves.aliveCap: 60`. Past roughly wave 9 the rig deletes a Trail wave before it can touch the hero. The build ladder (beacon 25 / sluice 40 / turret 50 / stockpile 60 / assay 80) is priced against a pan economy of `tickGold: 5` per 1.5 s of **standing still**, which is exactly what the midgame never asks for and never rewards.

## THE OPTIMISATIONS, SMALLEST CHANGE FIRST
Each is one datum with a stated expected effect and a check. Do **not** do all of them; land one, measure, then decide.

1. **Cap the compounding, not the player.** `Balance.upgrades.doubleTapCoilMaxStacks` currently allows six Double-Tap Coils in a 20-wave run. Reducing the fire-rate stack cap to 3 (matching Heavy Spark's 3) leaves the same power ceiling reachable but forces the offer to diversify. *Expect:* damage taken becomes non-zero in the late midgame; *check:* re-run Dry Gulch, expect at least one wave where hp falls between waves 10 and 19.
2. **Make the alive cap bite later.** `Balance.waves.aliveCap: 60` is reached by wave 4 on the Claim and wave 17 on Dry Gulch, after which pressure is flat by construction — every wave past the cap is the same wave. Raising the cap costs frames; instead ramp enemy **hp** past the cap wave so the curve keeps climbing without more bodies. *Check:* peak-enemies column stays ≤ 60 while wall-seconds per wave stops being constant at 15.
3. **Give the midgame one thing to buy.** The pan economy is the bottleneck only because standing still is unaffordable under pressure. A single mid-run gold event — the seam that pays out on a wave clear, or a payout at the map's named feature (Dry Gulch's spring, Twin Banks' fords) — restores the build ladder without touching prices. *Check:* a run that buys something after wave 10.
4. **Shorten what has nothing in it.** If 1–3 are refused, the honest alternative is that a 20-wave map with a 3-wave decision arc should be a 12-wave map. That is one datum per contract (`twist.secureWave`) and it pairs with `DRAFT-e1-secure-wave-truth.md`.

## HOW TO VERIFY ANY OF THEM
`node rehearsal/segments/e1-depth-play.mjs <contract> <label> 2 13`, then read the report's per-wave table: the columns that matter are `hpIn` (must move in the midgame), `at` (must move), `goldIn` (must be spendable after wave 10) and `wallSeconds` (must not be a constant). Baselines to beat are the three runs above. Zero console/page errors; desktop and 390 px.

## FIREWALL
TOUCH-ONLY: `src/game/Balance.ts` (one datum per attempt) or the E1 contract twists.
NO: `src/systems/` · the upgrade definitions themselves (`src/game/Upgrades.ts` — changing what a pick *does* is a different task) · other epochs.
