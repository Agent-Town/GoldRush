# Ticker digest — 2026-08-02 (TK-01, compiled s1420 fire 2026-08-03 06:0x local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**The shape of the day, measured:** **276 commits** landed on main, **5** of them merge commits.
**15** touched player-visible paths (`src/`, `public/`, `assets/`) — but one of those is a markdown
credit note filed under `assets/`, so **14** carry code, collapsing to **ten distinct pieces of work**
once each lane's `runner(...)` commit is paired with the `drain(...)`/`merge(...)` that landed it.
**20** touched the factory's own tools and nets. **241 were bookkeeping** — the ledger talking to itself.

**The through-line: 08-02 is the day the factory unbanked itself.** The 08-01 digest closed on a board
that had run dry at 14:33 and stayed dry for twenty-one fires. Yesterday did not answer that by authoring
new work — it answered it by **re-landing content that was already written and stranded on lanes**. Seven
of the ten pieces below are a re-land, a path-scoped graft, or a re-gate of banked lane output
(`1352ef45`, `f2aa4d2c`, `34800b22`, `9a95f99d`, `75b07024`, `2258daf3`, `b6a6b613`). A dry queue and an
empty warehouse are not the same condition, and yesterday is the proof: the queue was empty while the
lanes were full.

⚠️ **The instrument misdescribed itself again — third day running, and this time it announced a change
main had already had for two weeks.** `bb999f2f` is titled *"run3d-15b: restore plain boot 3D default"*,
which reads as a landing: 3D becomes the default in a plain boot. It is not. Measured against main at
`119c36b9 (archive: pruned by the A3 rewrite)` (the last commit before the coverage day opened), the `?run3dPilot` flag-gate was **already
absent** and `selection` **already defaulted to `'all'` — since `00e6b502`, 2026-07-18.** What that commit
restores is a default **the lane itself had disabled while it worked**, and the restore never leaves the
lane's own file. Had this digest classified by headline it would have credited the day with the single
biggest player-visible change of the month, two weeks late and to the wrong day.
**07-30 said a path is a hint about audience, not a verdict. 07-31 said a headline names intent, only the
diff names content. 08-01 said the diff can sit under a headline that denies it. 08-02 says a headline can
announce, in perfect good faith, a state the tree was already in — and the only probe that catches it is
reading the file at the coverage day's own opening commit.**

---

## What the family can see

**Escort mode comes off the URL and boots from the claim itself.** `b6a6b613` · `48f8cab8`
A mode you previously had to ask for by hand in the address bar is now part of the contract's own boot
data, read the same way by the game and by the headless sim. Same escort, one source, no query string.

**The Drill Yard stages itself from its contract.** `81c18ee5` · `6e4e728e`
The practice yard's furniture used to be placed by code that knew the yard by name. It now lifts into the
contract, and the mechanics manifest **derives** the staging rather than restating it — so the yard and
the card that describes it cannot drift apart.

**Dry Gulch's seam yield has exactly one home.** `75b07024`
The contract's own twist now sets the yield; the duplicate tuning row in the balance table is gone. The
number a player feels and the number the contract promises were two values that happened to agree.

**The Claim's ground is declared, not inferred.** `f2aa4d2c`
Shared claim geometry is written down in the contract and honoured by the terrain, with the water-depth
and tile-identity passes taught to tolerate it. The map stops being a thing the code guesses at.

## What the Prospector's own sim learned

**Wave scaling now comes out identical on both engines.** `a05171ce`
`Math.pow` replaced by repeated multiplication — a one-unit-in-the-last-place divergence between the
browser's engine and the sim's was enough to make the same wave two different waves. Determinism is not a
nicety when the ledger is the score.

**The Claim's headless contract sim re-lands.** `1352ef45`
The bench can run The Claim again on current main, with its seeds and its hash pins carried across
rather than re-derived.

**Every epoch's authored bundle is now validated — all ten.** `9a95f99d`
Contract families gained 355 lines of validation and nine epochs' contracts were brought up to it, re-gated
against the repaired E1 release door. Ten epochs are specced; as of yesterday all ten are also *checked*.

**Four dead words retired from the contract vocabulary.** `2258daf3`
`sluicesNeedWaterSource`, `slopeMax`, `waterline` and `damChannel` are out of the contracts, the mask
tables and the manifest. Vocabulary that no longer means anything is worse than vocabulary that is
missing — it reads like a promise.

## The 3D pilot: eight props on screen, two more waiting in the wings

**The 3D registry grew from eight models to ten, and both newcomers ship opt-in.** `f554d78a` · `34800b22`
A gold seam and a rail element were modelled, exported and instanced — the rail path's sleepers now draw
as a single instanced mesh rather than one object per tie. Both are **explicitly excluded from the plain
boot**: a player still sees the same eight props as the day before, and the two new ones answer only to
`?run3dPilot=gold_seam` and `?run3dPilot=rail_element`. New art landing behind its own switch is the
placeholder-first law working as designed, and it is the reason the "restore the default" headline above
is so easy to misread.

## What the factory did to itself (20 merges, no player surface)

The **main-slot lock gate** was found wrong in both directions and fixed (`059d1f8f`): it now reads line 1
only and matches *ACTIVE-and-not-CLEARED*, after the old literal was measured false-blocking every handoff
and false-releasing 31 of 58 real lock states. `blocked` was carrying **two opposite refusals under one
word** and was split into owner-forks and gate-side holds (`257644c5`) — the first freed a slice that had
been parked as needing an owner word it never needed. The **E1 release door** stopped reading a content
hash as an era tag (`ff7a3af2`, refuting the finding that preceded it) and was taught to boot all six E1
contracts (`f9d7fae8`), with the roster census asserting the sixth (`7f5b8017`). A guard now proves that a
**cure written into a template cannot reach a master already authored** (`04ce49d1`) — the defect was
manufactured to prove the red path, not inferred from a green. `fire.md`'s §3.0 gate-side clause was made
**executable** after its first real use proved the single-commit reading jointly unsatisfiable
(`718b9cb0`), and three stale facts in the fire-runner's own header were corrected (`e0b28fae`). Twice more,
law pointers into shifting code were re-based by reading rather than by arithmetic (`c86ebc7d`, `53ae7491`).

**The quiet lesson of the day:** every one of those factory merges is the factory discovering that a
sentence it wrote about itself had stopped being true — a lock predicate, a status word, an era tag, a
line number, a header fact. Ten pieces of the game moved yesterday. Twenty pieces of the map the factory
uses to find the game had to be corrected first.
