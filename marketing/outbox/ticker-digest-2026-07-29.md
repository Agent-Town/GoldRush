# Ticker digest — 2026-07-29 (TK-01, compiled s1243 fire 2026-07-30 05:33 local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**A correction the next fire should not inherit.** Two handoffs in a row (s1241, s1242) told whoever
compiled this digest that it would be "honestly thin — all five coverage-day merges are test-only," and
named them: `47538c08`, `7ed72bc0`, `f8eddce8`, `89e3d9c2`, `0b66d361`. **Every one of those five is
dated 2026-07-30 local** (01:53 through 04:52) — they are *this* morning's guard ladder, not yesterday's
work. Compiled from the day itself, 2026-07-29 is one of the fuller days on record.

**The shape of the day, measured:** 254 commits landed on main. **Sixteen** touched what a player can see
(`src/`, `public/`, `assets/`), **thirty-one** touched the factory's own tools and nets, and **207 were
bookkeeping** — the ledger talking to itself. If 2026-07-28 was the day the frontier finished turning to
face the eight winds, 2026-07-29 was the day it **started printing a newspaper and keeping records**: the
Greenhorn's Gazette arrived with a newsie at the door, the county began writing down who its prospectors
were, and the agent stopped merely reacting and was handed **a plan and a view of its own**.

## The frontier the family opens

- The Greenhorn's Gazette ships text-first — pinned issue #1 *is* the tutorial, read rather than tooltipped. `97c6a257`
- A newsie brings it to the door: the welcome plays three skippable anchored beats, once and only once. `9825441f`
- The Gazette sits still for its plates — the panel engravings and herald boards land processed and wired. `15e00755`
- The county keeps standings now: the records remember which prospectors passed through. `ab801307`
- Standing orders arrive — the Prospector gets a plan its reflexes obey instead of pure instinct. `960edc38`
- THE VIEW and the Almanac open to the agent, firewalled so a collection stays a collection. `d85b3ad1`
- Rail Tough walks the diagonals — the one E2 sheet whose rows are settled, bound after its row was re-proved. `af232c57`
- Two more eight-winds rows come back from repair; two are honestly held back for another pass. `305af1f4`
- The town camera leans in, so the inhabitants read close up (owner's ruling, same day). `68cd23dc`
- The Run Ledger reports what a secured rush actually banked — the four-track meta payout, in writing. `a62cf788` `aff16268`
- The staged launch says what it cleared, out loud, where it can be watched. `3c0922ce`
- The bench keeps its own memory — a declared stack and the seed it ran on, stored blind. `36e6c1b7`
- And the bench seeds freeze: the comparability law that was ratified in words finally gets its mechanism. `5c151ef2`

## The tools and the nets

- Worker code had been merging through **every** drain gate ungated — `functions/` sat outside the type net entirely. The gate is now chosen from the diff. `6fd091be`
- The drain gate adopts the two guards aimed at what a drain *writes*; the two that would dirty its own tree stay out, with reasons written down. `b0b7c74e`
- The citation "cheap half" stops being advice and becomes a guard. `fdb6f85e`
- A "25% mobile-only flake" turned out to be a deterministic spec-sequencing bug — measured 0/8 on the control, 32/32 green on the cure. `855f4d74`
- Contract ids are now asserted globally unique — the property the frozen seed set silently leaned on. `adb27b3b`
- The concurrency-class failure rates get a measured table instead of a reputation. `854a5612`

## Notes for the owner

- Nothing here is published. This is the digest; the approval is the one action.
- `305af1f4` shipped as **ACCEPTED-PARTIAL** on purpose — two rows landed, two were refused rather than
  stretched. Row 0 of Coal Thief and row 1 of Steam Wrecker are still on your desk (F-1193-3).
- The town zoom (`68cd23dc`) came from your ruling that day; the clamp values are still an open question
  on the desk.
