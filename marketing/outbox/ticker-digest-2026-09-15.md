# Ticker digest — 2026-09-15 (TK-01, compiled s2583 fire 2026-09-16 00:55 local)

Micro-headlines from yesterday's ACTUAL merges, classified by **touched paths on main** and never by
commit messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, stated because it is the half that goes wrong.** The day's commits were bucketed on their own
`%cs` with **no `--since`/`--until` window at all** (F-2562-2: git fills a bare date with the *current
time-of-day*, so a windowed query slides through the day and confidently answers about a neighbouring one).
Control asserted before any count was believed — 11,846 first-parent commits in the whole history — so a
zero here would have been an answer and not a failed read. The player-path test is **imported** from
`scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`), never re-typed, per F-1261-1.

**One method note this day forced, and it would have tripled the headline.** Diffing each merge against its
first parent — the rule that stops a merge reading as empty — **over-counts when the merge runs the other
way.** `4b90b0e25` is *"Merge remote-tracking branch `origin/main` into `drain/sprite-animator`"*: its first
parent is the drain branch, its second is main, so a first-parent diff attributes **265 player files to it
that were already on main**. The honest question is what is NEW ON MAIN across the day, so it was asked
directly — `git diff` from the day's first commit's parent (`ccbd3809a`) to the day's last (`bbbbba4f0`).
**When a branch merges main into itself on the way home, ask the day, not the commit.**

**The shape of the day: 82 first-parent commits, the busiest since the outage.** **Four touched player-visible
paths, and all four are one piece of work.** Net across the day main gained **344 player-visible files** —
318 processed art sheets and a 26-file code half. **Thirty-six** touched the factory's own tools and law.
**Forty-two were bookkeeping** — thirteen fire sessions (s2568–s2582) talking to the ledger.

## The county's news

**The town breathes.** Astra's sprite-animation runtime came home. Seven of the town's people hold a living
idle clip instead of one frozen pose, the newsie gets his era-1 portrait, and the Prospector carries his own
cells for every direction he faces as he pans across a claim and swings at it. This was already filed to the
gazette as a ROUNDUP the same day (`b1ba8df4f`) — it is repeated here because a digest reports the day, and
this was the day.

- `dca019e23` — The runtime lands: the per-body animator, the orientation resolver that lets an idle keep its
  own heading instead of collapsing to four, and 331 lines of new frame data.
- `92137d813` — The 53 art files the runtime reads come with it: seven town idle clips and their cells, the
  newsie's portrait, and the hero's per-direction pan and attack sheets.
- `696c3b027` — Four assertions the animation made obsolete are re-pointed, and the era-6 seal is re-pinned
  so the county's engine hash moves with the art, as it should.
- `8aa8a5b93` — Deployed and verified the same evening, after one transient Cloudflare failure.

**And five older complaints came home with it.** The runtime's branch was the missing source half of a code
review from the 8th, so landing it also landed the fixes the county had guards for but no cure:

- A destroyed turret stops firing. Ruined, zero-HP and suspended turrets no longer shoot later-era weapons
  out of an indestructible wreck.
- A duo champion stops being evicted by solo traffic on the standings board.
- **Save works without editing.** The name the game pre-filled for a manual save contained a comma, which the
  name rule rejects — so pressing Save and accepting the offered name always failed, every time.
- Browser-to-browser desync detection works again in rooms that contain an agent.
- The Old Digger keeps its heading across a restore.

## Not player-visible

Thirty-six commits went to the factory's own tools and law, and forty-two to bookkeeping. Nothing here is
news; it is listed so the day is whole.

- **The retention chain kept auditing itself, and finally checked its own arithmetic.** Five consecutive
  fires sharpened one question — *is this backed-up evidence really recoverable?* — from the label on the
  bucket (`de5427c32`, `f701227d1`) into the verifier's keys (`233a4643e`) into the shape of a manifest entry
  (`969d93864`), and then s2582 asked the question none of them had: every one of those verifiers proves the
  parts **exist**, and not one had ever proved they **reconstruct** (`f33a71cc5`). It then ran the check —
  743 MB streamed, 23 of 23 parts verified by checksum and byte count, every file rebuilding exactly. The
  county's backups are sound, and now somebody has actually tried to open one.
- **The fires' own law gained three corrections**: a stale residue figure retired (`e8ec45c75`), an attended
  self-update that had been reading as a destroyed handoff (`598acb8a4`), and the LB-01 exposure gate's clean
  verdict made reachable again after a new database column had quietly blocked it since the 4th (`53079a980`).
- **The whole board was played, end to end, for the first time.** The attended session ran a playability
  census over all 42 contracts (`8fdb2188d`) — every map booted the way a human boots it, no debug seam, and
  asked six questions of each. **76 of 84 runs pass.** Three maps kill an unassisted first-time player before
  wave 2 (E2 Trestle, E2 Incline, E6 Picnic) and one row is a census defect rather than a map defect (the
  Drill Yard has no waves to reach). On the owner's word the census became a standing duty for the fires
  (`c30c3de14`), and an all-epochs preview alias now exists for his own play.

---
*Compiled by the s2583 fire. Day boundary `ccbd3809a`..`bbbbba4f0`. 82 first-parent commits, 4 player-path,
344 player-visible files net. No commit message was used to classify anything.*
