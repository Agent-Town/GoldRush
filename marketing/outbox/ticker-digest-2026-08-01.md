# Ticker digest — 2026-08-01 (TK-01, compiled s1360 fire 2026-08-02 01:10 local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

⏰ **Timing note, stated plainly, and it is the reason this digest exists at all:** TK-01 says *first fire
after 06:00 local*. It is 01:10. This digest is **five hours early, deliberately** — the coverage day
closed an hour ago and nothing about it can still change. The 07-31 digest was compiled 40 minutes early
by s1316 for exactly this reason, after two fires had each correctly observed they ran before 06:00 and
each deferred. **Four consecutive handoffs (s1356–s1359) have now carried this same duty forward unattempted,
each one restating the 06:00 gate rather than testing whether the day was compilable.** It was. A duty that
has been re-described four times and performed zero times is not being deferred, it is being dropped
slowly; the house rule is to attempt a repeated ask before restating it.

**The shape of the day, measured:** **322 commits** landed on main — the factory's heaviest day in the
window, and **the day it ran itself dry**. Every player-visible landing below is stamped **before 14:33
local**; by **16:04** the s1336 fire was already writing *"board dry"* in its lock line, and it has stayed
dry for the twenty-one fires since. Yesterday was not the last day before the drought — it was the day
that produced everything and then reached the end of the queue. **Sixteen** commits touched player-visible paths (`src/`,
`public/`, `assets/`), collapsing to **twelve distinct pieces of work** once each lane's `runner(...)`
commit is paired with the `merge(...)`/`drain(...)` that landed it. **Thirty-nine** touched the factory's
own tools and nets. **255 were bookkeeping** — the ledger talking to itself.

⚠️ **The instrument used to write this digest has a blind spot, found while using it, and it is worth more
than any single headline.** `git log --name-only` prints **no paths at all** for a merge commit. Twelve of
yesterday's 322 commits are merges — including `199f7f60` (The Drill Yard, 964 insertions) and `07f0bcad`
(stockpile tiers) — so a path classifier reads the day's **biggest landings as empty**. They were only
recovered by re-reading each against its first parent. Content is never lost, because the lane-side
`runner(...)` commit carries it, but **the landing event and its content are in different commits**, and a
classifier that trusts `--name-only` will silently score a merge-heavy day as a quiet one.

⚠️ **And yesterday produced a textbook instance of the exact hazard the 07-31 digest described — one day
later, and running in the opposite direction.** `73710a72` is titled *"THE DRILL YARD ratified + PC-01
authored/queued (owner pick)"* — a pure bookkeeping headline. Its `--stat` contains **the entire F-1318-1
float-fit work**: `src/systems/Vfx.ts` +14, `e2e/vfx-float-legibility.spec.ts` +50, and the whole
`artifacts/f1318-1-float-fit-class-wide/` report and screenshots. Meanwhile `5d5929e4 (archive: pruned by the A3 rewrite)`, titled
*"merge(lane-a): f1318-1 float-fit class-wide"*, contains **two refreshed PNGs and nothing else — zero
insertions, zero deletions.** The headline and its content are not merely apart, they are **swapped**.
Classifying by message would have credited F-1318-1 to a commit holding none of it and lost the
ratification's real payload entirely. The 07-30 digest said *a path is a hint about audience, not a
verdict*; 07-31 said *a headline names intent, only the diff names content*; **08-01 says the diff can sit
under a headline that denies it.**

So: **seven** things the family can see — including a whole new claim — **three** changes to the
Prospector's own sim, and a day whose remaining two-thirds was the factory hardening its own nets.

---

## What the family can see

**The Drill Yard opens — the forty-second claim, and the first that records nothing.** `199f7f60`
A practice ground: bells call waves of dummies, you build and fight, and when you leave the county ledger
is exactly as you found it. 334 new lines of yard, a contract card of its own, and the wave system taught
to run a claim that keeps no score.

**The Drill Yard got its plate.** `26906c98`
The 42nd contract no longer borrows another claim's face on the board — it has its own painted plate, card
and board art, and the board-card image census flips two reds to green.

**Stockpiles are now something you buy your way up.** `07f0bcad`
Purchasable rungs instead of one fixed capacity, with the tier-aware cap enforced at all four places that
write it — and save, restore and demolish each proven to carry the tier rather than quietly reset it.

**The Stockpile Yard learned to say which rung it is on.** `8c8d6139`
The upgrade float and the build-menu capacity line now name the tier out loud, so the number on the yard
and the number in the menu can no longer disagree.

**Upgrade sentences fit their sign.** `efa3b252` · `73710a72`
Long upgrade text used to render as a mid-word fragment hanging off the edge of the float. It now fits —
and the guard behind it derives all eight sentences from the tier table, so a new rung cannot reintroduce
the overflow unseen.

**The Frontier's cards say "survive" where survive is the truth.** `ef1db83c`
An owner ruling of 08-01, landed in the copy the player actually reads: briefings, cards, the pause panel
and the wave-13 line all now describe the claim you are on rather than one you are not.

**The ground reads faster under the same seed.** `66af4433`
Twenty-eight URL-parameter constructions per height sample became one. Nothing looks different; the map
just stops paying a toll it never needed to.

## What the Prospector's own sim learned

**The Claim's pin comes off, with the door named rather than left ajar.** `f05fd161`
The headless sim now carries an explicit supported-contract set and throws by enumeration when asked for
one outside it, plus a determinism case — so an unsupported claim fails loudly instead of drifting.

**Night shift places its fixtures before it admits the claim.** `90003628`
Pre-placed buildables are set generically ahead of e1-night-shift, so the sim stops special-casing one
contract's furniture.

**`lossCondition` is now `heroStart`, everywhere at once.** `8efae704`
A repo-wide rename across all ten epochs' contracts and mask tables — 43 files, no behaviour change. The
field had stopped meaning what it was called, which is how vocabulary quietly starts lying.

## What the factory did to itself (39 merges, no player surface)

The keep-run-tape button gained a **plain-boot** guard (`2871c127`) — the Mistake #10 shape, proving a
player-facing control exists without `?debug` rather than trusting that it does. The charter fuzz rig was
made **total** over its mutation space and then taught to address arms by label (`04438027`, `d961bcd3`),
restoring whole-suite collection from 0 to 2,476 tests. Three separate nets were tightened around the
ledger's own coordinates: the citation gate moved to the queue copy rather than after dispatch
(`434b52a8`), `law-pointer-guard` began watching the goal ledger's live owner gates (`996202dc`), and
BACKLOG line-coordinates were banned from non-terminal blocked reasons (`c68cae0b`) — after all four
pointers guarding live owner gates were found rotted (`b0c697a5`). Lane **usability** was separated from
lane **safety** on every verdict (`d3349fc0`), and a queue copy of a master a runner already holds is now
refused outright (`e95ab2cd`). Deploy survived two of its own bugs: a whitespace-only env var that slipped
`${VAR:-default}` and aborted a successful run (`ded31e64`), and a verify window too short for a slow alias
(`2f629f52`). Sixteen specs stopped defining their own console watcher and now import one (`892026d2`).

**The through-line, and it is the third day running:** the factory keeps finding that its instruments
describe themselves inaccurately — rotted pointers, a headline swapped with its content, and a path
classifier that reads the biggest merges of the day as empty. Yesterday it found three more and fixed
them — and then, at 14:33, stopped having anything left to land. The board has been dry ever since, which
is the quietest possible confirmation that the queue was finished rather than abandoned.
