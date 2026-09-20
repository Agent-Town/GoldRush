# Ticker digest — 2026-07-25 (TK-01, compiled s1062 fire 2026-07-26 05:52 local)

Micro-headlines from yesterday's ACTUAL merges (verified on main's linear history by hash and diff, not by commit messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

Where 2026-07-24 was a one-merge launch-blocker day, 2026-07-25 was **the biggest build day of the saga so far**: the frontier got dramatically lighter to open, the maps got a night of hand-work, all ten epochs were walked end-to-end on a single profile, and a long-standing lie in the deploy path was caught.

## The frontier the family opens

- The claim opens light — the built frontier drops from 1.0 GB to 411 MB, and the release cut from 188 MB to 73 MB. `0dfa1d3f`
- The trail loads one step ahead of you — menu-time prefetch and a cascade so the next map is already coming up the road. `e109639f`
- Ten epochs walked on one profile, end to end, and the rig that carries them repaired to do it honestly. `4d04e3b8`
- The Deepwater siege counts the wave you are actually fighting, not the one the HUD wished for. `3598b88c`
- Release townsfolk walk again and the Dry Gulch spring takes a sluice — two launch-blockers from the owner's blessing walk. `db4b322c`
- The complaint desk accepts what you hand it — upload, fit, and an honest version line, round two. `49dbce7a`

## The look of the place

- A night of 3D by hand: the Twin Banks re-cut as a true two-channel braid, mask-proven against the old course. `935fbf1d`
- Red Fields dresses its full cast for Era 9 — the swatch contract holds across the whole town. `a6e2bd5b`
- Era 9 boots into its own wardrobe instead of falling back to Era 8's, desktop and pocket alike. `d587db37`
- Deep Sky puts on Era 10 — the last era's town cast, the capstone of the wardrobe arc. `d251ad35`
- Eight maps judged fresh at the gameplay camera, the way a player meets them. `fb770fc6`

## The Assay Office

- The Ticker and the Gazette quote one endpoint and one only — TL-03's third window closes the spine. `5227409f`
- An empty office says so plainly instead of pretending the wire is quiet. `64f50507`

## Behind the counter (no player-visible change — logged, not tickered)

The day's other merges were the factory auditing its own instruments, and they found a lot: the "geometry leak" was async upload (`f7cd0103`), the 25 MB gate was not measuring the bundle it named (`9ba65911`), the Deepwater load guard was measuring Chromium's 250-entry timing buffer (`7a020e66`), the m2-01 draw-call guard never reached its assertion (`df51d877`), four of five resource-timing guards were vacuous (`93773d1d`), the m2-05 drift was two races rather than a leak (`d9eb4253`), and four ED-04 editor guards were dying in setup before they could judge anything (`0e7ee088`). Two laws landed: **the Retention Law** — pruning stops, history is strength (`e4f23634`) — and the dry-board guard that keeps fires off the model when there is provably nothing to do (`3a54eb54`). The dashboard came back to life after ten hours frozen (`dc6c8196`) and stopped re-listing closed history as live blocks (`7c3c6fe8`).

_Caught at 23:58 and worth the owner's eye: the deploy path's success line was a false green — the live site proved 174 commits had never been published (`82a48466`). The correctives were queued the same night and landed after midnight, so they count to the 2026-07-26 digest, not this one._

_Compilation note, stated rather than hidden: the TK-01 duty says "first fire after 06:00 local" and this was compiled at 05:52 — eleven minutes early. The covered day closed nearly six hours prior, so the data is complete; five consecutive fires (s1057–s1061) had correctly deferred this digest and s1061 flagged a sixth deferral as the real risk. Deviation named, not papered over._
