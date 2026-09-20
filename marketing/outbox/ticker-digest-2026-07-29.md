# Ticker digest — 2026-07-29 (TK-01, compiled s1243 fire 2026-07-30 05:33 local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**A correction the next fire should not inherit.** Two handoffs in a row (s1241, s1242) told whoever
compiled this digest that it would be "honestly thin — all five coverage-day merges are test-only," and
named them: `ac12332c`, `032eca5a`, `d606946d`, `dc3aecc8`, `8b08f9c5`. **Every one of those five is
dated 2026-07-30 local** (01:53 through 04:52) — they are *this* morning's guard ladder, not yesterday's
work. Compiled from the day itself, 2026-07-29 is one of the fuller days on record.

**The shape of the day, measured:** 254 commits landed on main. **Sixteen** touched what a player can see
(`src/`, `public/`, `assets/`), **thirty-one** touched the factory's own tools and nets, and **207 were
bookkeeping** — the ledger talking to itself. If 2026-07-28 was the day the frontier finished turning to
face the eight winds, 2026-07-29 was the day it **started printing a newspaper and keeping records**: the
Greenhorn's Gazette arrived with a newsie at the door, the county began writing down who its prospectors
were, and the agent stopped merely reacting and was handed **a plan and a view of its own**.

## The frontier the family opens

- The Greenhorn's Gazette ships text-first — pinned issue #1 *is* the tutorial, read rather than tooltipped. `d2fc1b06`
- A newsie brings it to the door: the welcome plays three skippable anchored beats, once and only once. `8993da33`
- The Gazette sits still for its plates — the panel engravings and herald boards land processed and wired. `b5be7ab3`
- The county keeps standings now: the records remember which prospectors passed through. `4c72f2e7`
- Standing orders arrive — the Prospector gets a plan its reflexes obey instead of pure instinct. `94dd863b`
- THE VIEW and the Almanac open to the agent, firewalled so a collection stays a collection. `48cf8830`
- Rail Tough walks the diagonals — the one E2 sheet whose rows are settled, bound after its row was re-proved. `7ed00040`
- Two more eight-winds rows come back from repair; two are honestly held back for another pass. `f61843c0`
- The town camera leans in, so the inhabitants read close up (owner's ruling, same day). `fa5bcc4d`
- The Run Ledger reports what a secured rush actually banked — the four-track meta payout, in writing. `91c22f2e` `5027c211`
- The staged launch says what it cleared, out loud, where it can be watched. `390e585b`
- The bench keeps its own memory — a declared stack and the seed it ran on, stored blind. `b5cb6c60`
- And the bench seeds freeze: the comparability law that was ratified in words finally gets its mechanism. `af226e93`

## The tools and the nets

- Worker code had been merging through **every** drain gate ungated — `functions/` sat outside the type net entirely. The gate is now chosen from the diff. `3011b1a8`
- The drain gate adopts the two guards aimed at what a drain *writes*; the two that would dirty its own tree stay out, with reasons written down. `302fb921`
- The citation "cheap half" stops being advice and becomes a guard. `0b375503`
- A "25% mobile-only flake" turned out to be a deterministic spec-sequencing bug — measured 0/8 on the control, 32/32 green on the cure. `a0aae876`
- Contract ids are now asserted globally unique — the property the frozen seed set silently leaned on. `17a03b7d`
- The concurrency-class failure rates get a measured table instead of a reputation. `534c7d28`

## Notes for the owner

- Nothing here is published. This is the digest; the approval is the one action.
- `f61843c0` shipped as **ACCEPTED-PARTIAL** on purpose — two rows landed, two were refused rather than
  stretched. Row 0 of Coal Thief and row 1 of Steam Wrecker are still on your desk (F-1193-3).
- The town zoom (`fa5bcc4d`) came from your ruling that day; the clamp values are still an open question
  on the desk.
