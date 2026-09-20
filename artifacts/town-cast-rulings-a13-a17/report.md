# town-cast-rulings-a13-a17 — the Elder patrols, the newsie's loop is clear, the youngsters wear their names

READY-FOR-GATES. Branch `feat/town-cast-rulings-and-picnic`, scratch worktree cut from main `54bbaa91e`, Node 26.4.0,
own dev server on 127.0.0.1:5420, Playwright one worker, `--trace=off`, both projects (desktop-chrome 1280x800 and
mobile-chrome 390x844). Implemented on the Anthropic subscription while `tasks/CODEX-WALL` stands; never Codex.

Owner rulings implemented, verbatim:
* **A13** (2026-09-14): *"A13 - sounds good"* — the Elder takes the tavernkeeper's cycle.
* **A17** (2026-09-14): *"A17 - not sure what placeholder names? They are Pip and Juniper as I know them?"* — the town's
  names are the canon on the story cards too.

## 1. Scope, item by item

| # | Item | Outcome |
|---|---|---|
| 1 | The Elder patrols | **DONE.** One entry in TownScene's patrol-loop map, the tavernkeeper's cycle exactly. Spec TS-04 amended in the same commit. |
| 2 | The newsie's loop leaves the monument (F-SSL-1) | **ALREADY CURED ON MAIN; RE-MEASURED, ROOTED, RETIRED.** No `src/` change was needed or made — see section 3. Guard rooted in `test:node-guards`, baseline reason deleted, inventory row retired. |
| 3 | Pip and Juniper on the cards | **DONE.** Five card entries + the convention comment; the lore line was already on main and now records the landing. |
| 4 | The player sees it | **DONE.** Two new tests in `e2e/town-t5-townsfolk.spec.ts`, plain boot (no `?debug`), green on both projects; shots below. |
| 5 | Report | this file. |

## 2. The Elder's route, as the guard measures it

Her loop is DERIVED from her placed post, not authored in `townsfolk.ts` — the same shape the tavernkeeper and the
storekeeper have had since the plaza landed. `trailId: schoolhouse-cast`, two points, `seconds: 8`,
`phase: 0`, `pauses: { 0: 3, 1: 30 }` (the tavernkeeper's values, copied, not invented).

| Segment | From | To | Closest approach to the pan monument (footprint radius **0.680**) |
|---|---|---|---|
| 0 | her schoolhouse post `(-6.50, 5.25)` | the schoolhouse approach `(-6.60, 2.40)` | **7.023** |
| 1 (closing) | the approach `(-6.60, 2.40)` | her post `(-6.50, 5.25)` | **7.023** |

Leg length 2.852 u; 8 s buys the round trip, so ~4 s out and ~4 s back. Her 41 s cycle reads: 0-3 s standing at the
post, 3-7 s walking out, 7-37 s standing at the approach, 37-41 s walking back.

**Measured in a plain boot, both projects** (`e2e/town-t5-townsfolk.spec.ts` "a plain boot walks the Elder off her
schoolhouse post (A13)", annotation `A13`):

| Project | Left her post by | at town elapsed | cell in hand |
|---|---|---|---|
| desktop-chrome | **1.59 u** | **5.23 s** | `char-elder-sheet-walk8-r3c1.png` |
| mobile-chrome (390 px) | **1.60 u** | **5.24 s** | `char-elder-sheet-walk8-r3c1.png` |

Well inside the master's 40 s budget, and the cell proves it is her REGENERATED WALK SHEET in motion (row 3, column 1),
not the idle clip. Shots: `desktop-chrome-elder-patrol.png`, `mobile-chrome-elder-patrol.png` (this directory).

Two supporting edits inside the same map, named so they are not read as drive-bys: the two id-keyed branches in
`TownActorRuntime.update` that snap a cast walker back to its authored `facing` when it stops
(`src/town/TownScene.ts`, the resting arm) now ask `isPlazaPatrolActor(id)` instead of listing the tavernkeeper and the
storekeeper by name, so the Elder stops facing south at her post exactly as they do.

## 3. The newsie's segment 5 — the cure was already on main, and nobody had re-measured it

**F-SSL-1 IS NOT RED ON THIS TREE AND WAS NOT RED ON MAIN TODAY.** Verify-don't-inherit (CLAUDE.md mistake #4): the
first thing this task did was run the guard, and it passed — 1 pass / 0 fail, 0.30 s, on the untouched cut of main.

The cure landed in **`c7f284ad4`** (2026-09-15, *"retain: Astra's uncommitted source half of the sprite campaign ...
committed as found by the attended session ... never gated"*), which re-wrote the newsie's loop from
`[...reverseTrail('tavern'), ...townTrail('tavern').points.slice(1)]` at 19 s to
`[...reverseTrail('tavern').slice(0, -1), ...townTrail('tavern').points.slice(2, -1)]` at 16 s, with its own comment
*"Turn before the monument; keep the original walking pace on the shorter trail"*. That drops the two trail points that
sat ON the plaza centre — the radial trail for `tavern` starts AT `(0, 0)`, which is the monument — and is why the
guard's message read `(0)`.

Today's per-segment census of the newsie's ten segments:

`0: 5.775 · 1: 4.622 · 2: 3.469 · 3: 2.315 · 4: 1.159 · 5: 1.159 · 6: 2.315 · 7: 3.469 · 8: 4.622 · 9: 5.775`

Segment 5 — the segment the guard named — is the turn back out of the plaza and clears the 0.680 footprint by
**1.159**, a 70 % margin. Nothing in `src/town/townsfolk.ts` was changed by this task (`git diff main -- src/town/townsfolk.ts`
is empty).

### The guard is rooted, and its census is wider than the one that was red

* `package.json` `test:node-guards`, FIRST `run-node-guards.mjs` stage: `scripts/town-patrol-monument.test.mjs` added
  beside `scripts/town-era-props-node-safety.test.mjs`.
* `scripts/gate-caller-baseline.json`: the F-SSL-1 reason deleted, exactly as it instructed
  (*"Rooted when the corrective in src/town/townsfolk.ts lands"*). `node --test scripts/gate-caller-audit.test.mjs`
  **45 pass / 0 fail** after the deletion.
* `scripts/town-patrol-monument.test.mjs`: the census now runs every actor through `townActorPlazaPlacement` (newly
  exported from TownScene) instead of reading `TOWN_ACTORS` alone. **That is not cosmetic: three of the town's six
  patrols were invisible to it**, because the plaza cast carries no `loop` field in `townsfolk.ts`. A named assertion
  keeps the Elder in the census so a future refactor cannot quietly drop her.

Full census on this tree (the guard's own numbers):

| Actor | trail | points | seconds | closest approach | tightest segment |
|---|---|---|---|---|---|
| tavernkeeper | `tavern-cast` | 2 | 8 | 6.930 | 0 |
| storekeeper | `general_store-cast` | 2 | 7 | 7.200 | 0 |
| **elder (new)** | `schoolhouse-cast` | 2 | 8 | **7.023** | 0 |
| youngster_a | `ring-road` | 16 | 18 | 5.885 | 0 |
| youngster_b | `ring-road` | 16 | 21 | 5.885 | 0 |
| newsie | `tavern` | 10 | 16 | 1.159 | 4 and 5 |
| prospector | `claim_office` | 11 | 23 | 1.159 | 0 |

Guard result after widening: **1 pass / 0 fail, 1.71 s** (0.30 s before; the extra 1.4 s is SSR-loading TownScene).

## 4. The seven card entries (five names + the convention that named them)

`grep -rn "Youngster A\|Youngster B" src` returned seven lines on main: five `name:` fields and the two-line comment
that explained why they were letters. All seven moved; **no id moved**.

| # | `src/story/speakers.ts` | Was | Now |
|---|---|---|---|
| 1 | `youngster-a-e2` `name` | `Youngster A` | **`Pip`** |
| 2 | `youngster-a-e4` `name` | `Youngster A` | **`Pip`** |
| 3 | `youngster-a-e8` `name` | `Youngster A` | **`Pip`** |
| 4 | `youngster-b-e2` `name` | `Youngster B` | **`Juniper`** |
| 5 | `youngster-b-e4` `name` | `Youngster B` | **`Juniper`** |
| 6-7 | the NAMES paragraph in the cast comment (two lines that ended *"A future owner word naming them on the card reaches these two entries only"*) | the letters explained as the convention | the ruling quoted, the exception stated, and the role convention explicitly left standing for everyone else |

`grep -rn "Youngster A\|Youngster B" src` now returns exactly ONE line: the sentence in that comment which quotes the
retired placeholders. The speaker ids `youngster-a-e2/e4/e8` and `youngster-b-e2/e4` are untouched, so the portrait
chain and the future CLERK LINE consumer are unaffected.

`lore/characters.md` already carried the canon line dated to the ruling itself (2026-09-14, under THE YOUNGSTERS), so
**no new line was added** — the existing one was extended with a dated LANDED clause naming the five entries. Adding a
second line would have duplicated a ruling the lore already records.

## 5. Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (rc 0) |
| `npm run build` | **green**, `built in 1.66s`, asset-diet table printed |
| `node --test scripts/town-patrol-monument.test.mjs` | **1/1 green**, 1.71 s, with the widened census |
| `node --test scripts/gate-caller-audit.test.mjs` | **45/45 green**, 5.6 s, after the root |
| `node --test scripts/suite-red-inventory.test.mjs scripts/red-inventory-lookup.test.mjs scripts/citation-title-guard.test.mjs` | **51/51 green**, 3.2 s (the three guards that read the file I edited) |
| `e2e/town-t5-townsfolk.spec.ts`, both projects | **14 passed (1.0 m)** — 5 existing tests unchanged + 2 new |
| `e2e/elder-walk8-woman.spec.ts`, both projects | **6 passed** — green, but MODIFIED, see F-TCR-1 |
| `e2e/cast-motion-wiring.spec.ts`, both projects | **2 failed — PRE-EXISTING ON MAIN, NOT THIS TASK**, see F-TCR-2 |
| Console / page errors, plain boot, desktop + 390 px | **zero** — `assertNoErrors` runs inside the new Elder test on both projects |
| `computeEngineHash()` | **`20816391cfdced49632b3e06050482f48a70f26e60e95a9a7ea48be72c559e84`** at the end of THIS commit (pinned in `assets/engine-era.json`: `df1784d4...`). NOT pinned here, per the firewall. The Picnic commit moves it again; the drain pins once, off the branch tip. |

## 6. Findings

### F-TCR-1 — the A13 tripwire in `e2e/elder-walk8-woman.spec.ts` had to be re-pointed (the master's self-check cannot hold as written)
The master's self-check asks for `e2e/elder-walk8-woman.spec.ts` **unmodified-green**, and that is impossible under
A13: the spec asserts, in its own words, *"SHE STANDS; SHE DOES NOT PATROL ... Asserted rather than assumed, so that
granting her a loop later is a deliberate change that has to come past this line"* —
`expect(elder.loop, 'the Elder has no patrol loop today').toBe(false)`. Granting the loop reds it by design. The line
was written as a gate for exactly this ruling, so it was re-pointed rather than worked around, with the ruling quoted
and dated in place (the same file re-pointed itself the same way on 2026-09-15 for the idle clip):
* `elder.loop` `false` -> `true`, with the reason.
* `elder.moving` `false` -> dropped; her motion contract now lives in `town-t5` where it is measured against her post.
* `elder.frameKey` `toBe('char-elder-idle-r0c0.png')` -> `toMatch(/^char-elder-(idle|sheet-walk8)-r\d+c\d+\.png$/)`,
  plus `if (!elder.moving) expect(...).toBe('char-elder-idle-r0c0.png')` so the standing contract still bites exactly
  when it applies. **Everything else in the file — feet anchored at 0.02, sprite height, the per-cell footline read out
  of the PNG, the 32-cell sheet measurements — is untouched and still green.**
One word reverses the whole master if the owner did not mean the tripwire to fall.

### F-TCR-2 — `e2e/cast-motion-wiring.spec.ts` is RED ON MAIN with two stale expectations, and neither is this task's
Measured here, both projects, and **attributed by reading rather than assumed**:
1. `:64` `expect(...assay_clerk.position).toEqual({ x: 7, z: 3.4 })` — receives **`{ x: 8.35, z: 6.8 }`**. That is
   `townActorPlazaPlacement`'s output for an actor that HAS a `fullBody` sheet: the placement reads
   `townPlazaLayout.actorOffsets.assay_clerk` `(-1.05, 3.4)` from the assay-office anchor `(9.4, 3.4)`, and the
   `portraitPost` offset `(-2.4, 0)` the expectation encodes is only consulted for actors WITHOUT a full body.
   `git diff main -- src/town/townsfolk.ts` is empty and this task's TownScene diff never touches that branch, so main
   produces the same number. **This may be a real regression rather than a stale test**: `3987c8f7b` deliberately moved
   the clerk's post *"clear of the building's visual footprint"* through `portraitPost`, and the full-body wiring has
   since made that offset unreachable. Re-pointing the test would launder it, so nothing was changed. Corrective owed.
2. `:99` `char-preacher-sheet-walk8-a-r\d+c\d+\.png` — receives **`char-preacher-idle-r0c0.png`**. Same class as the
   Elder's own 2026-09-15 re-point: the animation runtime gives the standing cast an idle clip, and this spec was never
   re-pointed for it. A straightforward re-point, but another e2e's assertion and outside this firewall.
**This task's own edit to that file is proven green.** With `:64` temporarily relaxed to the measured value (a
measurement run only; the line was restored byte-for-byte and `git diff` shows only the Elder re-point), the test ran
PAST the re-pointed tavernkeeper pair at `:86-:95` and failed next at `:99` — so the pair that was touched passes on
both projects. The Elder had to leave that pair: it compares one actor's cell across two samples ~40 s apart, and she
now walks for 8 of every 41 seconds. The tavernkeeper stays.
Neither red is in `logs/suite-red-inventory.md`; both are filed here so a drainer does not read them as this task's.

### F-TCR-3 — the inventory row was RETIRED BY APPENDING, not by deletion
The master says *"Remove the row from `logs/suite-red-inventory.md`"*. That file's own law, three lines above the
table, is **"ADDITIVE ONLY. The tables below ... are never rewritten — overwriting an observation that was true when
taken launders history"**, and the precedent for a cure (`F-CELL-2`, `64b32ff22`) is a `+1`-line appended correction.
So the cure is recorded as a new dated correction row that outranks the 2026-09-14 one, and the old row stands as the
observation it was. Net effect for a reader is the same; the history is intact. Reverse with one word if the master
meant the letter.

### F-TCR-4 — the engine hash moved and is NOT pinned here
`src/town/**` and `src/story/**` are both in `ENGINE_SOURCE_INPUTS`, so a move was expected and the firewall forbids
pinning it. Reported in section 5. The sibling Picnic commit on this same branch moves it again; the drain should pin
the branch tip's value once, not this one.
