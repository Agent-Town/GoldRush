# `e5-regatta-boat-03` — rider parity for the Regatta boat (slice 3 of `specs/agent-play/e5-regatta-steerable-boat.md`)

**READY-FOR-GATES.** Branch `feat/e5-regatta-boat-03`, base `45607635a`, port 5336, implementer
Claude Opus 5 on the owner's Anthropic subscription (never Codex), scratch worktree.
**Owner** 2026-09-20 "A14 - do it"; the parity law, 2026-09-07 verbatim: *"no, AI and human users
have to have the same options and tools, otherwise it is unfair. fairness is crucial."*

Closes **F-RB2-4** (`reviews/e5-regatta-boat-02.md`): after slices 1 and 2 the boat was the racing
body and the race counted it, and **the view published nothing of the boat, the forfeit or the
buoys**. A human at the keys reads three things off a plain boot: `canvas.dataset.claimBoat` for the
hull, `canvas.dataset.regattaBuoys` for which mark is next and which are rounded, and that same
readout's terminal word. A rider read none of them, so a rider could sail the course and never learn
it had already forfeited.

| Commit | Item |
| --- | --- |
| `945563f84` | 1 — the view gains the boat and the race (`now.regatta`), view schema 2 to 3 |
| `5d9ff6e70` | 2 — `NOT_ABOARD` and `UNREACHABLE_WATER` join the published refusal vocabulary |
| `a25f834cc` | 3 — the door document names the Regatta |
| `91a876c15` | 4 — the manifest's `regatta_race` / `regatta_boat` rows, and the last copy of the stale 1.35 |
| `ca0b254bf` | 5+6 — the audit's verdict, the E5 census re-pointed, the winning view tape |
| `27ce274b6` | the one e2e red, re-pointed: the manifest pin `e5-regatta-race.spec.ts` itself flagged for slice 3 |

---

## 1. The view block as published, one JSON sample from each engine

Both engines publish one key, `diagnostics.regatta`, in one compiler-pinned shape
(`AgentRegattaSource`, `src/agent/View.ts`); `View.readRegatta` is its only reader and reads it
field by field, rounding exactly as `now.hero` rounds. `Game.regattaDiagnostics` and
`HeadlessContractSim.regattaDiagnostics` are the two publishers, and they read the hull's own motion
getters and `RegattaRaceSystem.diagnostics` — the SAME two sources `ClaimBoatView` and
`RegattaBuoysView` draw the human's readouts from, so the two pictures cannot drift.

**HEADLESS** (`gr-sim`, `e5-regatta` / `e5-regatta-01`, boot door; `headless-view-sample.txt`):

```json
{"boat":{"id":"claim-boat","x":-49,"z":0,"heading":0,"speed":0,"aboard":false},"nextBuoy":{"id":"start-beacon","x":-49,"z":0,"radius":6},"buoysPassed":[],"state":"racing","finished":false,"forfeited":false,"fastWaterMultiplier":1.5}
```

**BROWSER** (dev server 5336, `?debug&contract=e5-regatta&seed=e5-regatta-01`, read off the live
`window.__GR_AGENT__.view`; `browser-view-sample.json`):

```json
{"boat":{"id":"claim-boat","x":-49,"z":0,"heading":0,"speed":0,"aboard":false},"nextBuoy":{"id":"start-beacon","x":-49,"z":0,"radius":6},"buoysPassed":[],"state":"racing","finished":false,"forfeited":false,"fastWaterMultiplier":1.5}
```

**EQUAL, element for element**, with zero console errors on the browser probe. Boarded (the hero
walked off the deck and back onto it one fixed step apart, which is the same act in both engines)
they agree again:

| Field | headless aboard | browser aboard |
| --- | --- | --- |
| `boat` | `{"id":"claim-boat","x":-49,"z":0,"heading":0,"speed":0,"aboard":true}` | identical |
| `nextBuoy` | `{"id":"northwest-checkpoint","x":-28,"z":38,"radius":6}` | identical |
| `buoysPassed` | `[{"id":"start-beacon","atSeconds":0.07}]` | `[{"id":"start-beacon","atSeconds":0.73}]` |
| `state` / `finished` / `forfeited` / `fastWaterMultiplier` | `racing` / `false` / `false` / `1.5` | identical |

The single difference is `atSeconds`, and it is not a parity gap: it is the run second the start
beacon fell, and the browser boots a real page before the probe can board, so its hero crosses the
rail later in ITS run than the headless hero does in its own. Every other row, the hull's position
and heading included, is byte-identical.

**CONTROL, the other half of contract-scoping:** `e5-deepwater-claim` publishes `now.regatta`
**undefined**, as do `e5-flotilla` and `e5-stillwater` (asserted in the census for all four). That
is what keeps the field out of the canonical `viewSchema.fields` set, built from `the-claim` —
exactly the shape `e2e/er01-e2-census.spec.ts` asserts for `now.pressure`.

**Where the radius comes from.** `nextBuoy.radius` is the EFFECTIVE gate radius, not the authored
one. The five beacons author 6; the sixth and last gate is the `heroStart` stake, which authors
none, so it falls back to `REGATTA_GATE_RADIUS_FALLBACK`. That constant now lives in
`src/agent/MechanicsManifest.ts`, where the literal `6` already sat as the `regatta_race` rule's
`gateRadiusFallback`, so the view names the number without adding a THIRD copy of it.
`RegattaRaceSystem` keeps its own private `DEFAULT_GATE_RADIUS` because this slice's firewall
forbids editing that file; a new guard pins the two by source text so they cannot drift.

## 2. The version bump

`assets/engine-era.json` `viewSchema.version` **2 to 3**; `public/skill.md` says
`Current view schema version: **3**.` and gains the version-3 table row. `viewVersion: 3` measured
on both engines. The era pins in that file are untouched — the pin is the drain's.

**The master's cited precedent is false, and that is a finding rather than a silent choice.**
READ-FIRST says F-HEAT14-3 added `now.pressure` "as an additive, contract-scoped field **with a
version bump** — copy that shape exactly". It did not. Commit `b0613970e`'s own message says:

> NO VIEW-VERSION BUMP, and that is the registry's own rule rather than an omission (F-RP-1 in the
> report): the canonical field set is built from `the-claim`, which declares no pressure, so a
> contract-scoped `now` field is outside the stamped set exactly like now.preserve / now.gravity /
> now.air / now.motor / now.playbookUse — skill.md says so in its own words.

The bump is made anyway, because two directive sources ask for it and neither depends on that
precedent: spec law 5 (RATIFIED) says *"a view-version bump, because it is new information, not
duplicated"*, and the master's scope item 1, firewall and end-report all repeat it. It is **lawful
rather than required**: `scripts/view-schema-guard.test.mjs` demands `version === previous + 1` only
when the stamped FIELD SET grows and asserts `version >= previous` otherwise, so for a
contract-scoped field a bump is permitted and no bump would also have passed.

Cost of the bump, checked rather than assumed: nothing rejects an older `viewVersion`. It is tape
METADATA (`RunTape.ts`, `AgentTapeReplay.ts`, `LanternShow.ts` and `functions/api/standings.ts` all
accept it as optional and never compare it); `assets/engine-era.json` is **not** in
`ENGINE_SOURCE_INPUTS`, so the bump alone rotates no engine hash (`view-schema-guard`'s third test
proves this directly); and the two e2e specs carrying the number interpolate it from the registry
rather than hardcoding it.

Because skill.md's own words were what F-HEAT14-3 relied on, they are corrected in the same commit
so the door document stays true about BOTH cases: contract-scoped fields are outside the stamped set
and so *do not have to* move the version and usually do not (`now.pressure` did not), but the slice
that adds one may declare a bump when the field is new information, and version 3 is that case.

## 3. The refusal list's new pins

```
["HERO_NOT_YOURS","UNREACHABLE_TERRAIN","UNREACHABLE_APPROACH","HERO_UNAVAILABLE","NOT_ABOARD","UNREACHABLE_WATER"]
```

Measured on `the-claim` and on `e5-regatta` alike: the vocabulary belongs to the VERB, not to the
map, exactly as `arriveRadius` and `pilots` beside it do (hero-move-verb, owner 2026-09-06). A
boatless engine carrying a published word it has no consumer for is the shape
`CAPTURE`/`GRADE`/`HAUL` already have. `HERO_ORDER_REFUSALS` now SPREADS `BOAT_ORDER_REFUSALS`
rather than retyping the words, so the two cannot drift, and the pair is APPENDED so every index a
rider may have depended on keeps its meaning.

Four pins re-pointed, all in `5d9ff6e70`, each carrying the cause
**"e5-regatta-boat-03: the boat's refusals published"**:

| Pin | What moved |
| --- | --- |
| `scripts/gr-sim.test.mjs:923` | the `hero_orders` rule's `refusals` array, plus an 11-line dated cause above the assertion |
| `e2e/agent-view.spec.ts` | the `WAVE_THREE_SNAPSHOT` list, plus a dated paragraph in the file's header note |
| `scripts/regatta-boat-steer.test.mjs` | slice 1's own "deliberately outside the vocabulary" pin, now ALSO asserting containment so a later hand edit that retypes six literals cannot quietly un-publish the pair |
| `e2e/fixtures/e1-mechanics-manifests.json` | REGENERATED from the live deriver (`regen-e1-fixture.mjs`); byte-clean, 18 insertions / 6 deletions, all six the refusal array |

`src/agent/StandingOrders.ts`'s slice-1 note is rewritten rather than deleted: it recorded WHY the
pair was held out and named slice 3 as the one censused act that would publish them. The new note
says this is that act, and why the two lists stay separately declared (only
`DeepwaterClaimTile.boatOrderRefusal` can raise the pair).

## 4. The census cause

`e2e/er01-e5-census.spec.ts`, re-pointed 2026-09-20, cause **`e5-regatta-boat-03`** (slice 3, law 5
"the view tells the truth" and law 6 "same-game audit"; owner 2026-09-20 "A14 - do it"). The door
state moved and the census records what it moved to, asserted rather than described:

- `viewVersion` is 3, and the whole `now.regatta` block at the Regatta's boot door is pinned **by
  value** (`toEqual`, not `toMatchObject`), so a field appearing or disappearing reds it.
- the manifest's `regatta_race` row: six gates as RACED, `gateCount: 6`, the finish, the fallback
  radius, `fastWaterMultiplier` read from the contract's own authored physics rather than pinned as
  a literal, `leavingTheBoatForfeits`, `view: "now.regatta"`.
- the manifest's new `regatta_boat` row: source, `boatId`, `helm: "MOVE_HERO"`, the boat's two
  refusals, `topSpeed` from the authored physics, `view: "now.regatta.boat"`.
- **the other half of contract-scoping, for all four E5 contracts:** a map with no `raceCourse`
  publishes no `now.regatta` and no `regatta_*` rule; the Regatta publishes exactly
  `['regatta_boat', 'regatta_race']`.
- **the published `hero_orders` vocabulary on all four**, boat refusals included.

`EXPECTED_SOCKET_RULES` is untouched: neither new rule id starts with `deepwater_`.
`FORBIDDEN_SOURCE` is satisfied: both rows are sourced to their CONSUMER
(`RegattaRaceSystem.advance+movementMultiplierAt`, `ClaimBoat.board+steer+stepAshore`), never to
`tileParams.raceCourse`.

## 5. The same-game audit's verdict on the Regatta

**EQUAL, and no table change was needed.** Re-run on this tree
(`node scripts/same-game-audit.mjs --json`, banked at `audit-after-item4.json`):

| Measure | Value | Against the pin |
| --- | --- | --- |
| ADR-005 controls table | equal **15** · agent-only **0** · human-only-richer **0** | unchanged |
| mechanics summary | agent-exceeds 0 · agent-lacks **511** · equal **1252** · not-offered 0 | identical to `same-game-audit.test.mjs`'s `assert.deepEqual` pin |
| rows / exemptions | 1763 / 3 | unchanged |
| `e5-regatta` rows | 42, of which 10 `agent-lacks` | the SAME ten every one of the 38 contracts carries (the tape-exemption class: `restart`, `debug_spawn`, `debug_xp`, `skip_ceremony`, `research_skip`, `set_pause`, `research_pick`, `death_action`, `set_agent_rung`, `set_agent_ability`), measured contract by contract against `e5-deepwater-claim`, `e5-flotilla` and `the-claim`, all 10 of 42 |

So nothing about the Regatta reads unequal, and `scripts/same-game-audit.mjs` is **unchanged**: the
master permits touching it "only if the table must learn the boat rows", and it does not, because
this slice adds no verb. `MOVE_HERO` was already mapped and already `equal`; while aboard it steers
the hull down the same `Intents.move` seam a human's keys drive, which is that row's own claim.

One observation left for the drain rather than edited in: the `MOVE_HERO` row's note reads "walks
the hero to a point down the same Intents.move seam a human's keys drive" — true, but silent about
the helm. A one-clause extension naming the Regatta would make the table more honest without moving
a verdict; it is outside what this master authorised.

`docs/bench/same-game-audit.md` is NOT regenerated and does not need to be: its guard
("the committed same-game report carries a controls row for every door verb") compares the
VERB-NAME SET only, and no verb moved. That committed report's line-number citations were already
stale at my base (`Game.ts:8470` vs the live `8559`), so regenerating it here would have mixed an
unrelated repair into this slice.

## 6. The tape hash

The bench-seed registry (`assets/contracts/bench-seeds.json`) is a contract-id to seed-id map and
takes **no tape**, so per the master the hash is recorded here and the registry is left to the
drain. `e5-regatta` is already seeded (`e5-regatta-01`, `e5-regatta-02`).

| Tape | Hash | Shape |
| --- | --- | --- |
| **slice 3, the winning rider tape (NEW)** | **`fnv1a32:9e79d1e9`** | 137 samples, 4137 ticks, course won in **137.90 s**, `finishedAt` 137.967 s |
| slice 1, the boat tape | `fnv1a32:dd4116bf` | 42 samples — **UNCHANGED** by this slice, re-verified on this tree |

The new tape (`view-tape.json`, minted with `GR_BOAT_TAPE_MINT=1` and re-verified unminted) rides
slice 2's own winning orders, but it steers by the **published** `nextBuoy` and samples the
**published** view beside the hull every second. That is the point: it pins what a rider can
actually read, not what the engine holds, so if `now.regatta` stops mirroring the race the hash
moves. Each row is
`[tick, view.x, view.z, view.heading, view.speed, aboard, nextBuoy.id, buoysPassed.length, state, hull.x, hull.z]`,
and the whole 137-row track is banked so a future rot is diagnosable rather than merely detectable.

The finish, in the human's own words, asserted against the pin:

```json
{"boat":{"id":"claim-boat","x":-43.43,"z":2.15,"heading":-3.11,"speed":1.65,"aboard":true},"nextBuoy":null,"buoysPassed":[{"id":"start-beacon","atSeconds":0.07},{"id":"northwest-checkpoint","atSeconds":24.3},{"id":"midcourse-checkpoint","atSeconds":42.23},{"id":"northeast-checkpoint","atSeconds":59.9},{"id":"finish-beacon","atSeconds":83}],"state":"finished","finished":true,"forfeited":false,"fastWaterMultiplier":1.5}
```

**Worth knowing when reading it: the course is SIX gates but `buoysPassed` lists FIVE.** The sixth
gate is the `heroStart` stake serving as the finish line, and the engine records it as `finishedAt`
rather than pushing it onto `gatesPassed` — slice 2's rule, unchanged here. The track's last sampled
row shows exactly that: `nextBuoy` `"claim-boat"` with `buoysPassed` 5, one second before the line.

## 7. The engine hash, before and after

| | Hash |
| --- | --- |
| before (base `45607635a`) | `c8229bd4e2e1bd7d351255ba1460f640c8a67bc9f01c4c335ca17c27517d50a3` |
| after (branch tip) | `ba36fee64a4008f08936c25f0e7da3374bfac73234bf77d94726ea1d99dae482` |

`src/` moved, so the content re-hashes. **The pin is the drain's** — nothing in the `pins` array of
`assets/engine-era.json` was touched, and that file is not in `ENGINE_SOURCE_INPUTS` so the
`viewSchema` bump contributes nothing to this hash. No simulation behaviour changed: this slice is
an OBSERVATION surface plus one published vocabulary, the null floors are byte-identical, and slice
1's determinism tape replays to its unchanged hash.

## 8. Gates

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | **rc 0**, clean |
| `npm run build` | **rc 0** |
| `node scripts/null-floor-anchors.mjs --check` | **`83 of 83 null floors match assets/contracts/null-floors.json (324.7s)`** — a view field moved no floor |
| node guards: `gr-sim` + `same-game-audit` + `deepwater-rider-parity` + `deck-movement` + `regatta-boat-steer` | `ℹ tests 43 · pass 41 · fail 0 · skipped 2` (350.1 s) |
| `regatta-boat-steer` alone, unminted | `ℹ tests 11 · pass 11 · fail 0`, both tapes at their pins |
| `view-schema-guard` | `3/3`, including the mutation proofs and the "editing viewSchema does not rotate computeEngineHash" test |
| `skillmd-guard` | `16/16`, including BOTH manufactured-defect positive controls |
| `no-emdash-guard` | `1/1` (it bit my first skill.md draft; the em dashes were removed) |
| `hero-move-verb` | `6/6` |
| `same-game-audit.test.mjs` summary pin | `0 / 511 / 1252 / 0` over 1763 rows, 3 exemptions — matched exactly |
| physics, re-measured on this tree | full turn **2.001 s**, 98 m crossing at top speed **59.394 s**, fast water **x1.500** |
| `node scripts/null-floor-anchors.mjs --check`, final re-run on the branch tip | **`83 of 83 null floors match assets/contracts/null-floors.json (639.8s)`** |
| `GR_GUARD_NO_ARTIFACT=1 node scripts/run-guards.mjs --changed-since 45607635a` | **4 of 5 PASS** — `test:power-budget` (p95 0.370 ms), `test:task-guards`, `test:citations`, `test:gate-callers` all rc 0; `test:node-guards` rc 1 on `law-pointer-guard` alone, attributed below |

### `run-guards` red: `law-pointer-guard`, attributed by revert-and-reproduce

`run-guards --changed-since` matched no path rule and fell to the base gate, so it ran the full
node-guards battery. One guard reds: `law-pointer-guard`, "THE REAL TREE: every law-surface pointer
in this repo currently holds", with **5 problems**. Re-run alone on a quiet box it reds the same
way, so this is not the contention advisory.

**Attributed by revert-and-reproduce, not by arithmetic.** With `public/skill.md` checked out at the
base `45607635a` and every other line of this slice in place, the guard reports **3** problems:

```
POINTER DRIFT scripts/fire.md -> fire.md:26                            (x2)
POINTER DRIFT scripts/fire.md -> marketing/outbox/gazette-queue.md:2116
```

Those three are **PRE-EXISTING on the base** — neither `scripts/fire.md`, `fire.md` nor
`marketing/outbox/gazette-queue.md` is touched by this branch, and their `was:`/`now:` previews are
identical, so the drift is below the 100-character preview. They are not this slice's.

With my `public/skill.md` the count is **5**: the same three, plus

```
POINTER DRIFT scripts/fire.md -> public/skill.md:367   (x2)
    was: ""
    now: "<!-- skillmd-guard:seeds:end -->"
```

**That pair IS mine**, and it is the routine, predicted lifecycle `CLAUDE.md` §4.10b describes and
that slice 2 already hit once (F-RB2-5, "`scripts/fire.md → src/game/Game.ts` rotted by +3 with the
race handoff; re-based by measurement", cured at the drain). Measured, by re-grepping the cited
CONTENT rather than by carrying a delta:

| | line |
| --- | --- |
| the sentence `fire.md` actually cites — *"closed rotations remain public history"* — at base `45607635a` | `public/skill.md:368` |
| the same sentence on this branch tip | `public/skill.md:371` |
| the coordinate `scripts/fire.md` carries | `public/skill.md:367` (the blank line above the sentence at base; the citation was already one line high before this slice) |
| my delta | **+3** exactly: one version-table row, plus the Regatta paragraph and its blank separator |

**The cure, for the drain:** re-point `scripts/fire.md`'s two `public/skill.md:367` citations to
**`public/skill.md:371`**, which is the sentence the claim is about rather than the blank line above
it, then `--update` the baseline. `scripts/fire.md` is outside this master's firewall, and slice 2
cured the identical class at the drain, so it is reported rather than edited here (F-RB3-8).

One untracked file appears as a side effect of `run-guards`: `logs/guard-stats.jsonl`, which the
runner appends to on every invocation. It is untracked at my base too and is not committed here.

### The e2e battery, both projects, `--workers=1`, `GR_CAPTURE_EXTERNAL_SERVER=1` on port 5336

First pass (`e2e-batch.log`): **52 tests, 50 passed, 2 failed (6.2m)**. Both failures were the SAME
test in the two projects, `e2e/e5-regatta-race.spec.ts:28`, and both were this slice's own to close
— see the row below. After the re-point (`e2e-race-repoint.log`): **6 passed (55.7 s)**, so the
whole battery is green.

| Spec | Result |
| --- | --- |
| `agent-view` | 10/10 (5 per project) — includes the re-pointed `WAVE_THREE_SNAPSHOT` and the six-manifest fixture |
| `er01-e5-census` | 10/10 (5 per project) — the re-pointed E5 census |
| `er01-e2-census` | 8/8 (4 per project) — unchanged, green; the `now.pressure` contract-scoping control |
| `e5-regatta-boat` | 6/6 (3 per project) |
| `e5-regatta-race` | 6/6 (3 per project) after the re-point; 4/6 before it |
| `task-025-bandits-dont-swim` | 10/10 (5 per project) |
| `drill-yard-manifest` | 2/2 (1 per project) — the other reader of the regenerated E1 fixture |
| zero console/page errors on a plain boot of `e5-regatta` | asserted by `e5-regatta-race.spec.ts:216` "plain boot resolves the Regatta contract without browser errors", green both projects; and by the browser probe, whose console-error list is `[]` |

**`er01-e1-census` does not exist.** `e2e/` carries `er01-e2` through `er01-e10` and no `er01-e1`;
playwright filters by substring and silently ran nothing for that path. The E1 census the master
means is `e2e/agent-view.spec.ts`'s "all six E1 mechanics manifests match their byte-stable fixture"
plus `e2e/drill-yard-manifest.spec.ts`, which are exactly the two readers of the fixture this slice
regenerated. Both were run and both are green, so the E1 half of the "every other contract's view is
byte-identical" claim is covered — and the stronger proof is `view-schema-guard`, which rebuilds the
canonical view from `the-claim` and finds the stamped field set unchanged.

### The one red, and why it was mine

`e2e/e5-regatta-race.spec.ts:82` pinned the manifest's `regatta_race` row at values slice 2 knew
were wrong, with a comment naming slice 3 as the fixer, verbatim:

> ⛔ F-RB2-3, FOR SLICE 3: the published manifest still says 1.35, which is the number this slice
> DELETED from the engine. `MechanicsManifest.ts:564` hardcodes it and that file is slice 3's (the
> view bump, the fence, the manifest and the census pin are one censused act). Asserted at the
> manifest's real value so the lie is measured, not hidden.

Measured failure, exactly as predicted before the change:

```
- Expected "fastWaterMultiplier": 1.35        + Received "fastWaterMultiplier": 1.5
  gates Array [ ... "finish-beacon",          + "claim-boat",  ]
```

Re-pointed in `27ce274b6` with a dated cause, and `fastWaterMultiplier` is now asserted AGAINST THE
CONTRACT rather than against a literal so it cannot rot the same way. That file is outside the
master's firewall (F-RB3-7).

### Perf

No renderer, sim or asset change: this slice adds one observation field, one published vocabulary,
two manifest rows and prose. `now.regatta` is built only where a contract declares a race course,
from getters the two render views already call, and `Game.regattaDiagnostics` runs once per
`publishDiagnostics` rather than per frame. No frame table is taken and none is owed — the gate's
trigger is "when anything renders", and nothing new does.

### Evidence hygiene

Six `.png` screenshots and two `.json` measurement files under `artifacts/e5-regatta-boat/` and
`artifacts/e5-regatta-boat-02/` were rewritten by my e2e re-run and have been RESTORED by explicit
name. The master said "by `.png` name only"; I went one file type wider on purpose and say so here:
`plain-boot-course-{desktop,mobile}-chrome.json` are **slice 2's banked evidence**, cited by
`reviews/e5-regatta-boat-02.md`, and they are wall-clock noise by F-RB2-6's own finding (the spec
drives the boat with wall-clock key holds), so the re-run values differed by tenths — for example
`northeast-checkpoint` 6.221 vs 7.344 on desktop. Leaving my noise on top of a landed review's
numbers would have corrupted that review's evidence trail. Nothing else under `artifacts/` outside
`e5-regatta-boat-03/` is modified.

## 9. Findings

- **F-RB3-1 (non-blocking, for the drain).** The master's READ-FIRST mis-states F-HEAT14-3's
  precedent: `now.pressure` landed on 2026-09-19 **without** a view-version bump, and commit
  `b0613970e` says so in its own message. The bump is made here on the strength of spec law 5 and
  the master's own scope item, and `skill.md`'s version-schema paragraph is corrected so the door
  document is true about both cases. Full reasoning in §2. Nothing to fix; recorded so the next
  slice does not inherit a false precedent from this master.
- **F-RB3-2 (non-blocking, firewall).** `src/vite-env.d.ts` is not in the master's touch list, and a
  new published browser diagnostics key **cannot** be added without it: F-PICNIC-2 deliberately
  removed the blanket `as ThreeGameDiagnostics` cast from `publishDiagnostics`'s literal, so every
  key must be declared there or `tsc` reds. The change is eight lines, type-only, zero behaviour:
  `regatta: import('./agent/View').AgentRegattaSource | null` plus its note. A master that adds a
  browser diagnostics key should list this file.
- **F-RB3-3 (non-blocking, firewall).** `e2e/fixtures/e1-mechanics-manifests.json` is the same
  published-manifest pin as `e2e/agent-view.spec.ts`, in JSON, and is read by
  `e2e/drill-yard-manifest.spec.ts` as well. The master named the spec but not its fixture.
  Regenerated from the live deriver; the diff is byte-clean.
- **F-RB3-4 (non-blocking, owed guard).** There is no standing BROWSER guard on `now.regatta`. The
  browser half is measured here (`probe-browser.mjs` and its banked sample, zero console errors) and
  the SHAPE is held by the compiler plus a new source-text guard requiring both engines to build the
  key's `boat` literal from the identical expression, to gate on `declared`, and to publish `race`.
  What is missing is a live browser assertion; its natural home is `e2e/e5-regatta-boat.spec.ts`,
  outside this master's firewall.
- **F-RB3-5 (non-blocking, latent bug this slice cured).** The manifest's `regatta_race` rule
  published `fastWaterMultiplier: 1.35` — the LAST surviving copy of the on-foot fast-water number
  slice 2 deleted from the engine when it closed F-RB1-2 and made the contract's 1.5 the single
  source. A rider reading `stablePrefix.mechanics` was told the water runs at 1.35 while the hull
  steers on 1.5. The same row also published FIVE gates for a course raced over SIX. Both are fixed,
  and both are now asserted against the contract rather than against literals.
- **F-RB3-6 (non-blocking, deferred cleanly).** `REGATTA_GATE_RADIUS_FALLBACK` lives in
  `src/agent/MechanicsManifest.ts` rather than in `src/systems/RegattaRaceSystem.ts`, whose private
  `DEFAULT_GATE_RADIUS` is the number the race actually applies, because this slice's firewall
  forbids editing that file. The two are pinned against each other by source text in
  `scripts/regatta-boat-steer.test.mjs`. A later slice permitted to touch the race system should
  move the constant there and export it.
- **F-RB3-7 (non-blocking, firewall).** `e2e/e5-regatta-race.spec.ts` holds the `regatta_race`
  manifest pin and its own comment names slice 3 as the fixer, but the master's firewall named
  `MechanicsManifest.ts` without it. It was the only e2e red and it is re-pointed with cause.
- **F-RB3-8 (non-blocking, the one guard red, cure measured and handed over).**
  `law-pointer-guard` reds on the real tree with 5 problems. THREE are pre-existing on the base,
  proved by revert-and-reproduce (`fire.md:26` twice and `gazette-queue.md:2116`, in files this
  branch never touches). TWO are mine: `scripts/fire.md`'s citation of `public/skill.md:367` rotted
  by exactly +3 when the door document gained its version-3 table row and the Regatta paragraph.
  The cited sentence, *"closed rotations remain public history"*, sat at `:368` at the base and sits
  at `:371` now, so the cure is to re-point both citations to `public/skill.md:371` and `--update`
  the baseline. `scripts/fire.md` is outside this master's firewall and slice 2 cured the identical
  class at the drain (F-RB2-5), so it is measured and handed over rather than edited here. Full
  working in §8.
- **Not this slice, as instructed:** F-RB2-2 (disembark by key near a rim, on the owner's desk), the
  slice-4 heat, and any physics or race-rule change.

## 10. Evidence in this directory

| File | What |
| --- | --- |
| `view-tape.json` | the slice-3 winning rider tape: hash, final view, and the full 137-row track |
| `browser-view-sample.json` | the browser's `now.regatta` at boot and aboard, plus its console-error list (empty) |
| `headless-view-sample.txt` | the headless equivalents and the `e5-deepwater-claim` control |
| `manifest-regatta-rows.json` | the two new manifest rows, and their absence on the three boatless E5 maps |
| `audit-before.md`, `audit-after-item4.json` | the same-game audit either side of the slice |
| `e1-fixture-before.json` | the E1 manifest fixture as it stood at the base |
| `engine-hash-before.txt`, `engine-hash-after.txt` | the hash pair |
| `null-floors-item1.log`, `null-floors-final.log` | the 83-of-83 runs |
| `guards-item4.log`, `steer-guard-pinned.log`, `mint-view-tape.log` | the node-guard transcripts |
| `e2e-batch.log`, `e2e-race-repoint.log` | the e2e battery and the re-run after the re-point |
| `run-guards.log` | `run-guards --changed-since 45607635a` |
| `probe-headless.mjs`, `probe-browser.mjs`, `probe-manifest.mjs`, `probe-refusals.mjs`, `regen-e1-fixture.mjs` | the probes, so every number above can be re-taken |
