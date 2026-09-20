# Ticker digest — 2026-07-31 (TK-01, compiled s1316 fire 2026-08-01 05:40 local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

⏰ **Timing note, stated plainly:** TK-01 says *first fire after 06:00 local*. It is 05:40. This digest is
**forty minutes early, deliberately** — the coverage day is complete, and the 07-31 digest had already
been missed by two fires that each correctly observed they ran before 06:00. Nothing is lost by compiling
a finished day early; a third miss would have cost the day.

**The shape of the day, measured:** 184 commits landed on main. **Nine** touched player-visible paths
(`src/`, `public/`, `assets/`), **eighteen** touched the factory's own tools and nets, and **157 were
bookkeeping** — the ledger talking to itself.

⚠️ **One of yesterday's headlines describes work that is in a different commit, and this is the day's
sharpest lesson about its own method.** `e4336ba8` is titled *"LB-03: standings learn difficulty (owner
question exposed the blind row) + round-2 plays vein-hunter too"*. Its `--stat` contains **no standings
code at all**: it is the AP-06b adapter re-land (`AgentConsent.ts`, `ToolSurface.ts`, four e2e specs,
`reviews/ap-06b-adapter-reland.md`) plus the commit that *queued* the standings task. The real LB-03 work
is `d8d3b80d`, 37 minutes later — `functions/api/standings.ts`, the encyclopedia reader and its stylesheet,
`reviews/lb-03-standings-difficulty.md`. **Classifying by message would have counted LB-03 twice and lost
AP-06b entirely.** The 07-30 digest said *a path is a hint about audience, not a verdict — open the diff*;
this is the same law one layer up: **a headline names intent, only the diff names content.**

So: **three** things the family can see, **one** change to the agent's leash they will feel, and a day
whose real subject was the factory hardening its own guards.

---

## What the family can see

**Every run now leaves a tape, and a tape can be kept.** `c75890d7`
One button on the summary keeps a run past its turn; a kept run rides along when you send a score to the
county. The recorded tape replays to a byte-identical hash, so a kept run is the run you played.

**Every Frontier claim now names its own tongue on the board.** `d97bc4d5`
The river and its crossings, the springs, the lantern posts and the dark — read off the claim itself, so
no claim can advertise a thing the ground does not hold.

**The county standings now know which preset a score was played on.** `d8d3b80d`
An owner's question exposed a blind row: scores were being ranked without recording the difficulty they
were won at. The standings page now carries it, front and back.

## What the Prospector's leash learned

**HARVEST drops to rung two; BUILD stays at three; resuming a run no longer quietly revokes consent.**
`deb41db1` · `21985788` · `70ed004a` · `e5803de7`
Four merges landing one owner ruling of 07-30 in the places that actually **enforce** it rather than the
places that merely advertise it — and one real bug beside it: suspending and resuming a run used to take
back the permission to place buildings you had already granted. The conformance guard now pins the verb
table, so the ladder and the gate cannot drift apart again.

## What the factory did to itself (18 merges, no player surface)

Ledger guards became a post-bookkeeping duty rather than a pre-bookkeeping one — a fire could not
previously see a defect it was about to introduce (`1917d920`, `5b71dc3f`). Lane **usability** was
separated from lane **safety** after a lane measured safe-to-reset burned 27,000 tokens for zero edits
(`5436df3e`). Law-surface pointers are now fingerprinted, because coordinates rot every time anyone
inserts a line above them (`50a81660`, `eecfaf0a`). The verifiers package went real (`96e7b58b`), and a
stderr race inside it was fixed and proven (`088a9138`). Two law surfaces were corrected for stating what
their own code had stopped doing (`b309789e`).

**The through-line, and it is the same one as 07-30:** most of a heavy day was the factory auditing its
own instruments and finding several of them blind — including, yesterday, the instrument that decides what
goes in this digest.
