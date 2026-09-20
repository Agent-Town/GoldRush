# e1-baron / e1-baron-01 / trail — generation 55

Engine era `86e53f37…`, harness Claude Code CLI 2.1.257, worldModel `sim-import`.

## Measured

| run | tape | result | notes |
|---|---|---|---|
| 1 | probe (idle, no tape) | — | read the manifest and the first two views |
| 2 | `tune-1.json` | **w20 / 536.200s / 200g / 862 kills / 137 calls**, `fnv1a32:41f0518d` | full ladder, 175/175 at the horn |
| 3 | `tune-2.json` | w20 / 540.867s / 125g / 869 kills / 145 calls, `fnv1a32:d859a3ef` | tier-2 sink refused; −440 gold panned |

Envelope on tune-1: `durationTicks` 16086, 137 entries, 444,049 bytes — inside every ceiling. Moot: the run is unsecured and must not be submitted.

## Outcome

**Not secured.** Best ride: `tune-1.json` — **waves 20, timeAlive 536.200 s, gold 200, calls 137**. Three sim runs (one idle probe, two controller rides); **one scored attempt** (`tune-1`, named in `gauntlet-outcome.json`'s `tape` field). **Nothing is put forward** — the run ends `hero_down`, and an unsecured run is not a standing.

Both controller rides reached wave 20 with the hero at its full 175/175 running maximum, all four turrets and all six sentry beacons standing, and only one work wrecked in twenty waves. The Baron's horn lands at t≈522 and the hero is dead at t=536.2 — **fourteen seconds**. The claim never lost a wave; it lost the boss.

## What the map asked

It asked about **E1 survival and the bank cap** — and the bank cap is where I lost, in the exact way the era intends. The bank cap is 200 and `Economy` refuses a credit while the purse is full, so a pinned purse does not merely waste surplus, it **switches panning off**. tune-1 panned 1,480 gold and finished pinned at 200 from wave 18 with `goldPanned` flat: roughly **900 gold of income that the map paid me and I had nowhere to put**. The ladder this contract sells is finite — 4 turrets (50/70/95/125) and 6 beacons (25/35/45/55/75/95), 815 gold total, complete by t=245 of a 536-second run — so from wave 9 onward the whole economy was a ceiling with no sink under it. That is the era's signature mechanic doing its authored job, and answering it is the contract. The fields that carried the run were `now.gold` against the cap, `now.score.goldPanned` (the flat line that names a dead sink), `now.seams[].active/x/z` (three live of six anchors ~9–10 wu from the claim on the north bank — a kind commute), `now.works.byKind`/`entries`, `now.hero.hp/maxHp/level`, `now.threats.alive` and `now.pendingOffer`. The orders were `BUILD`, `HARVEST`, `PICK_UPGRADE`, `BLAST_AT`, `MOVE_TO`, `CONTEXT_ACTION upgrade`, `REPAIR_UNDER` and `HOLD`. There is no E1 verb.

The second half of the ask is the boss, and it is a real spatial gift rather than a wall: `pursuitRange: 18` means the Baron walks the hero welded at (0,12), so a tight ring reaches him without any chasing. What he brings is `hpScale: 240`, `contactDamageScale: 5`, `buildingDamageScale: 16` and a 3×18-damage rocket volley every 8 seconds — against which 815 gold of guns is simply not enough damage.

My notebook remembers this map: generation 4 secured it on engine `c0a015ae` at w22/594.867s/394g. **It does not play the way I remember.** Gen-4 finished at wave 22 with 394 gold — 394 is above a 200 bank cap, so either the cap or the Baron's scaling has moved since. On this engine the purse cannot hold what gen-4 banked, and the same fort shape that beat him then dies in fourteen seconds now.

## Winnability

**Undecided-leaning-yes, and what stopped me was my own budget, not a wall:** survival to the horn is solved outright — full ladder, 175/175, one work lost in twenty waves, with ~900 gold of income spare — so the whole contract is "convert a capped purse into boss damage," and the two sinks that do it went untested (`stockpile`, 60 g ×2, +150 cap each, which is the *published* counter to the cap and would have banked ~300 more for the fight, and `palisade`, 10 g ×48, a 480-gold body-block ring that makes the Baron chew timber inside four turrets' fire); the third, `CONTEXT_ACTION upgrade` to turret tier 2, I did test and it is **refused on this build** — `works.entries[].tier` stays 1 for all ten works across 195 views — while its `MOVE_TO` walks cost 440 gold of panning, so it is a trap on this contract, not a lever.

## Lessons for my notebook

- **A notebook row can be arithmetically impossible against the current constants, and that is the loudest expiry signal there is.** Generation 4 records `the-claim`-family gold of 394 and 680 on a board whose bank cap is 200. I have now hit this twice in two generations (gen 54 caught the same 680 on `the-claim`). **When an inherited number exceeds a cap I have just read in `Balance`, the constant wins and the whole entry is a hypothesis** — including its strategy, which on this map was "a fort like gen-4's secures the Baron." It does not, any more.
- **Test the sink before designing the endgame around it.** I spent my second and last ride proving that turret tier-2 is refused here — `Balance` has no tier row for `turret` on this build, `entries[].tier` never leaves 1 — and the proof cost 440 gold of panning, because `CONTEXT_ACTION` does not travel and the `MOVE_TO` in front of it drags the Prospector off the seams every view. **A sink that silently refuses is worse than no sink: it charges you the commute and pays nothing.** One view's worth of check (does `tier` change after the first attempt?) would have freed the ride.
- **Enumerate the sinks against the cap BEFORE the first order, and rank them by certainty, not by dps.** This contract sells `stockpile` (60 g, +150 cap, ×2) and `palisade` (10 g, ×48) — 600 gold of *certain* placement — and I ranked both below a 150-gold tier upgrade I had not verified exists. On a map whose ladder finishes at 40% of the run, the question is never "what is the strongest purchase" but **"what is the largest purchase that cannot be refused."**
- **`goldPanned` going flat while `gold` sits at the cap is still the most diagnostic pair on the board — fifth generation running.** It named gen-39's dead sink, gen-45's capped purse, gen-49's ungated spend, and here it named the whole contract in one column: flat from wave 18, 900 gold of income unconverted.
- **On a boss map, budget the runs against the BOSS, not against the run.** Both my rides spent their whole diagnostic value on waves 1–19, which were never in doubt after the first one — full HP, one work lost. The fourteen seconds that decide the contract got zero dedicated experiments. **When a probe shows survival solved, the next ride's only job is the fight**, and it should start from a save of the pre-horn state rather than re-riding 522 seconds to reach it. The door publishes exactly that: `--resume <tape> --to-tick <n>` replays a reel to any recorded tick. On a wave-20 boss contract that is worth more than any controller change — I could have ridden the boss fight five times in the wall I spent riding the approach twice.
- **A tight ring works when the boss comes to you.** `pursuitRange: 18` against a hero welded at (0,12) means no arc computation and no interception problem — every beacon inside 8 wu and every turret inside 16 wu of the claim is guaranteed to engage. That part of the plan was right and needs no rework; what it needs is more money spent on it.
- **Write the outcome file after every run, before the analysis.** Sixteenth generation saying it, thirteenth doing it — the runner wrote `gauntlet-outcome.json` on every child exit, so a truthful row existed from the first ride onward, and when the wall arrived the only thing left was to hand-write which tape I meant. **Check the file says what you mean**: my best-so-far comparator ranked tune-2 above tune-1 on equal waves and would have put the *worse* tape forward.
