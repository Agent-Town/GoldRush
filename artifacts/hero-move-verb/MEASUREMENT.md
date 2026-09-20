# hero-move-verb: what the MOVE_HERO verb actually buys

Measured 2026-09-06 on branch `feat/hero-move-verb`, base `22cf98cfe`, Node 26.4.0, no balance
number changed. Every ride is `scripts/gr-sim.mjs` driven over stdin/stdout in the door's public
vocabulary; no engine import, no private handle, no minted gold.

## 1. The verb works, and it is deterministic

`artifacts/hero-move-verb/verb-probe.mjs` sends one `MOVE_HERO` a turn on `the-claim` and reports
where the hero actually is on the next turn:

| turn | t | hero before | order | hero after |
|---|---|---|---|---|
| 0 | 0.0 s | (0, 12) | `MOVE_HERO {x:0,z:-6}` | |
| 1 | 30.0 s | | `done` | (0, -5.70) |
| 2 | 49.2 s | | `MOVE_HERO {x:8,z:10}` -> `done` | (7.85, 9.85) |
| 3 | 55.0 s | | `MOVE_HERO {x:0,z:12}` -> `done` | (0.21, 11.94) |

Two rides byte-identical (`identical: true`). The Prospector follows on its own drift, which is the
pre-existing `Embodiment.driftNearHero` behaviour and not something the verb touches.

**Replay:** `kite-01.tape.json` is a door-recorded tape carrying `MOVE_HERO` orders. It replays
through `AgentTapeReplaySession` to `fnv1a32:335f880f`, which is the hash the tape itself carries,
twice (`kite-01.replay.json`, `replayIdempotent: true`).

**Floors:** `node scripts/null-floor-anchors.mjs --check` on this tree reports exactly one
difference, the `eraStamp` (`pinned="44a7f506a" derived="22cf98cfe"`). Every recorded floor is
byte-identical. The idle policy issues no orders, and `heroOrderIntents` returns the `IDLE_INTENTS`
object itself when nothing is steering, so an idle run walks the object graph it walked before.

## 2. Ember Shore: the ladder (`ladder.json`, seed `e10-ember-shore-01`)

`artifacts/hero-move-verb/prover.mjs` is `artifacts/e10s-4-door/prover.mjs` with one policy change
and two switches: `--kite` adds emergency `MOVE_HERO` legs, `--defence N` truncates the six-site
defence ladder. Without `--kite` at `--defence 6` it is the E10S-4 policy verbatim.

| defence | control | kite (retreat, hp<0.6, 4 legs) |
|---|---|---|
| 0/6 | lost, wave 4, **136.2 s**, 72 kills | lost, wave 4, **140.0 s**, 71 kills |
| 2/6 | SECURED, wave 12, 360.0 s, 410 kills | SECURED, wave 12, 360.0 s, 410 kills |
| 6/6 | SECURED, wave 12, 360.0 s, 414 kills | SECURED, wave 12, 360.0 s, 414 kills |

The `--defence 0` control dying at **136.2 s** is the 136 s the E10S-4 prover header records. Kiting
buys **+3.8 s** there and does not secure. At 2/6 and 6/6 both arms secure and the hashes are
IDENTICAL to the E10S-4 baseline (`fnv1a32:84aace38` / `fnv1a32:de0f1cb5`), because with guns up the
hero never falls below the kite threshold and the clause never fires. Full two-seed, two-ride proof
in `prover-kite.json` (`identical: true`, both seeds secured) and `prover-control.json`.

**Two failed policies, recorded because the failure is the finding.** Attempt 1 (one far retreat leg
a turn, triggered on a threat count) kept the vent and still lost the hero at 114.8 s
(`prover-kite-attempt1.json`). Attempt 2 (a 14-unit circuit around the vent, several legs a turn)
lost it at 109.7 s, EARLIER than the welded control's 136.2 s. Both are worse than standing still
for one reason: the welded hero is most of this run's damage, its Spark Rig fires at whatever is
nearest, and a hero that walks is a hero that is not killing. Distance is not the currency on this
map; damage is.

## 3. Relay Valley: does kiting alone cross wave 18? (**no**)

`ctrl-v3-kite.mjs` is `artifacts/relay-valley-winnable/ctrl-v3.mjs` with one added block and an env
switch. Seed `e7-relay-valley-01`, driven by `relay-run.mjs`.

| arm | grit | kite | result | tape hash |
|---|---|---|---|---|
| A grit baseline | +300 | off | **SECURED wave 20**, 600.0 s, 90 g, 749 kills | `fnv1a32:bf2ad127` |
| B grit + kite | +300 | hp<0.6, 4 legs | **SECURED wave 20**, 600.0 s, 50 g, 738 kills | `fnv1a32:d39f653f` |
| D welded control | none | off | lost wave 15, **460.333 s**, 40 g, 537 kills | `fnv1a32:f9866fc8` |
| E kite, gentle | none | hp<0.3, 2 legs | lost wave **15**, **461.9 s**, 0 g, 536 kills | `fnv1a32:ef6dc43e` |
| G kite, mid | none | hp<0.45, 4 legs | lost wave 13, 401.5 s, 424 kills | `fnv1a32:f77dbe47` |
| C kite | none | hp<0.6, 4 legs | lost wave 13, 401.5 s, 424 kills | `fnv1a32:f77dbe47` |
| F kite, always | none | always, 6 legs | lost wave 10, 308.8 s, 301 kills | `fnv1a32:b4422f33` |

Rows A and D reproduce `reviews/relay-valley-winnable.md`'s two recorded rides EXACTLY, hash for
hash, which is what makes the rest of the table mean anything.

**The answer: no.** The best kiting arm without the grit reaches wave 15 at 461.9 s, one and a half
seconds past the welded baseline's 460.333 s and the same wave. F-RVW-5 stands unchanged: at wave 18
the board holds 57 enemies, 37 of them thieves, and only hit points cross it. Kiting harder makes it
strictly worse, monotonically (wave 15 -> 13 -> 10 as the kite budget rises), for the Ember Shore
reason: the hero is the damage.

**Rows C..G required removing `twist.hero` from `e7-relay-valley` for the duration of the
measurement.** The file was restored with `git checkout --` immediately afterwards and verified
byte-identical to `HEAD` by blob hash (`65632f5126f1e1a98e7a6d589f715a8f544a7e47` before and after).
No balance number is changed by this slice.

## 4. What the verb is for, then

Not for winning the two maps that already had answers. For CLOSING THE ASYMMETRY: until this slice a
human could walk their fighter out of a swarm and a rider could not, and `same-game-audit` could not
even ask the question. It now asks it on every contract (42 new rows: 37 equal, 5 agent-lacks on the
contracts the door refuses before play). Whether walking is the right move is now the rider's
problem, which is exactly where a species-blind benchmark wants it.
