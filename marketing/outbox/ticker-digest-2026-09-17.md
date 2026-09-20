# Ticker digest — 2026-09-17 (TK-01, compiled s2612 fire 2026-09-18 00:05 local)

Micro-headlines from yesterday's ACTUAL merges, classified by **touched paths on main** and never by
commit messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, unchanged and re-run rather than inherited.** The day's commits were bucketed on their own `%cs`
with **no `--since`/`--until` window at all** (F-2562-2), and the offset-explicit windowed form was run
beside it as a control — both read **106**, so the day boundary is not a timezone artifact. A second control
was asserted before any count was believed: **12,021** first-parent commits in the whole history, so a zero
here would have been an answer and not a failed read. The player-path test is **imported** from
`scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`), never re-typed, per F-1261-1. The day was asked as a
day — `git diff c9cf4f78f^..a3fc5a78f` — rather than commit by commit, because of the merge-direction
over-count F-2583-1 names.

**The shape of the day: 106 first-parent commits, and the player-visible half is 691 files wide.** Four
commits touched a player path; net across the day main gained **691 player-visible files** and 844 files in
all. **Eighty-two of the hundred and six carry a fire's session prefix** — seventeen sessions, s2596 through
s2612, every one of them on a board that was dry both ways. This is the mirror image of the 16th, which moved
five player files: yesterday the county changed almost nothing about how it plays and a great deal about how
it *looks*, and all of it arrived in the last ninety minutes of the day.

## The county's news

**The county's two big machines were built again, and they cost less to carry.** Astra's rebuilt Dredge Queen
and Old Digger landed with their loaders rewritten to demand the new shapes rather than hope for them.

- `acde76581` — **The Dredge Queen's claw now opens.** The model gains an `Cycle_OpenGrab` cycle and the
  loader drives it on the same curve as the fallback jaws, so the grab is one motion instead of a swap. The
  Old Digger's bucket wheels were **split into port and starboard** and now turn in place on measured pivots.
- **Both bosses got smaller while getting better.** The Old Digger drops from 16,104 triangles to 7,192 and
  its atlas from 2.2 MB to 1.35 MB; the Dredge Queen from 44,920 to 33,124. Shipped boss bytes fall **12.8 %**.
  The first town is unchanged — no boss rides in it.
- **The Salvage Claw was held back, and the reason was measured, not guessed.** Its rebuild came out
  byte-for-byte the same shape as the one already on main — same meshes, same materials, same triangles — so
  it gains the player nothing. It stays as it is until it has something to add.

**Nine outlaws learn to face every way.** Nine of the county's E6–E9 machines and toughs had only ever been
drawn facing one direction, and turned by cheating.

- `a8b41aac4` — **612 fresh cells across 60 families, and every one of the nine now registers all eight
  headings.** The Baron gains clean north-east and west plates with the ground wedge under him cut from 739
  dark pixels to 380; the thief gets a real south-east; the rail tough, coal thief and steam wrecker get true
  back views instead of mirrored fronts.
- **The first town download did not move — +0 B.** None of this rides in the opening payload.
- **What is still owed is written down rather than quietly skipped:** the Baron's east face, the Claim
  Jumper's north and west, and diagonals for the Steam Wrecker and Coal Thief all still need cells cut. That
  is a future art batch and waits on the owner's word.

**The era seal was re-pinned twice — same era, not a new one.** `6c46f1430` and `e75211c1d` append pins #6 and
#7 to era 6, so the engine hash moves with the render-side code and the new cells. Nothing about the
Re-surveyed Claims changed underneath a rider's existing reels.

## Not player-visible

Eighty-two commits went to the factory's own tools, law and bookkeeping across seventeen fire sessions. None
of it is news; it is listed so the day is whole.

- **The recurring subject was again the law's own accuracy**, and every correction was made against a
  measurement rather than an argument: a `FIRE END` count that returns a silent zero when routed through the
  law's own fallback; a `/tmp` reaper that had already emptied every heat arena while a tree's mtime read
  "fresh" because a deletion is a modification; a weekly-mint duty whose fence takes the whole registry and
  not the rotation just minted; a salt verified **correct** by re-deriving seeds it had already produced,
  without ever reading it.
- **A guard that landed in the morning was caught leaking eleven temp directories** on main by the evening's
  drain (hygiene item 7) — the fixture sweep reds on main independently of anything that landed with it.
- **The county book took its daily offsite copy** and the series reads whole: 25 of 25 days present,
  2026-08-24 through 2026-09-17, every key county-standings class and none of it account data.
- **The board was dry both ways for the entire day** — every one of those seventeen fires found nothing to
  drain, because the day's real work was done by attended sessions and their implementers.

*Already reported.* The two landings above reached the gazette on the day as a single ROUNDUP
(`marketing/outbox/gazette-queue.md`), batched rather than headlined because the week's three standalone
slots were already spent; the two era pins were judged there and dismissed as same-era appends. It is
repeated here because a digest reports the day, and this was the day.

---
*Compiled by the s2612 fire. Day boundary `c9cf4f78f^`..`a3fc5a78f`. 106 first-parent commits, 4 player-path,
691 player-visible files net, 844 files in all, 17 fire sessions. No commit message was used to classify
anything.*
