# Ticker digest — 2026-07-25 (TK-01, compiled s1062 fire 2026-07-26 05:52 local)

Micro-headlines from yesterday's ACTUAL merges (verified on main's linear history by hash and diff, not by commit messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

Where 2026-07-24 was a one-merge launch-blocker day, 2026-07-25 was **the biggest build day of the saga so far**: the frontier got dramatically lighter to open, the maps got a night of hand-work, all ten epochs were walked end-to-end on a single profile, and a long-standing lie in the deploy path was caught.

## The frontier the family opens

- The claim opens light — the built frontier drops from 1.0 GB to 411 MB, and the release cut from 188 MB to 73 MB. `436deb71`
- The trail loads one step ahead of you — menu-time prefetch and a cascade so the next map is already coming up the road. `611b4558`
- Ten epochs walked on one profile, end to end, and the rig that carries them repaired to do it honestly. `8229d6e0`
- The Deepwater siege counts the wave you are actually fighting, not the one the HUD wished for. `9a1454a4`
- Release townsfolk walk again and the Dry Gulch spring takes a sluice — two launch-blockers from the owner's blessing walk. `cb8185f5`
- The complaint desk accepts what you hand it — upload, fit, and an honest version line, round two. `9fa96680`

## The look of the place

- A night of 3D by hand: the Twin Banks re-cut as a true two-channel braid, mask-proven against the old course. `7efc41f3`
- Red Fields dresses its full cast for Era 9 — the swatch contract holds across the whole town. `a6e2bd5b (archive: pruned by the A3 rewrite)`
- Era 9 boots into its own wardrobe instead of falling back to Era 8's, desktop and pocket alike. `4705f66f`
- Deep Sky puts on Era 10 — the last era's town cast, the capstone of the wardrobe arc. `d251ad35 (archive: pruned by the A3 rewrite)`
- Eight maps judged fresh at the gameplay camera, the way a player meets them. `3d346034`

## The Assay Office

- The Ticker and the Gazette quote one endpoint and one only — TL-03's third window closes the spine. `a30661bf`
- An empty office says so plainly instead of pretending the wire is quiet. `e46793b8`

## Behind the counter (no player-visible change — logged, not tickered)

The day's other merges were the factory auditing its own instruments, and they found a lot: the "geometry leak" was async upload (`bebc1b1f`), the 25 MB gate was not measuring the bundle it named (`386cce80`), the Deepwater load guard was measuring Chromium's 250-entry timing buffer (`e67f55da`), the m2-01 draw-call guard never reached its assertion (`1ee47bbd`), four of five resource-timing guards were vacuous (`480ddc0f`), the m2-05 drift was two races rather than a leak (`011f959e`), and four ED-04 editor guards were dying in setup before they could judge anything (`2c892e29`). Two laws landed: **the Retention Law** — pruning stops, history is strength (`107b09a5`) — and the dry-board guard that keeps fires off the model when there is provably nothing to do (`6bb3daad`). The dashboard came back to life after ten hours frozen (`70108e7d`) and stopped re-listing closed history as live blocks (`d0c0fef4`).

_Caught at 23:58 and worth the owner's eye: the deploy path's success line was a false green — the live site proved 174 commits had never been published (`c885128d`). The correctives were queued the same night and landed after midnight, so they count to the 2026-07-26 digest, not this one._

_Compilation note, stated rather than hidden: the TK-01 duty says "first fire after 06:00 local" and this was compiled at 05:52 — eleven minutes early. The covered day closed nearly six hours prior, so the data is complete; five consecutive fires (s1057–s1061) had correctly deferred this digest and s1061 flagged a sixth deferral as the real risk. Deviation named, not papered over._
