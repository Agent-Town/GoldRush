# Ticker digest — 2026-09-21 (TK-01, compiled s2669 fire 2026-09-24 17:40 local)

*Filed THREE DAYS LATE, and the lateness leads the file. TK-01 wants the first fire after 06:00 local; no fire
ran between 2026-09-20 and 2026-09-24 15:35 local (F-FIRE-1 — 478 consecutive ticks died on the macOS
argument limit, `logs/fire-2026092*.log`, rc=126). s2668 filed 2026-09-23 first, as the freshest day, and
recorded the three older ones as owed (F-2668-1). This is the second of those three; 2026-09-20 and
2026-09-22 are filed alongside it by the same fire.*

Micro-headlines from the day's ACTUAL merges, classified by **touched paths on main** and never by commit
messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, re-run rather than inherited.** The day's commits were bucketed on their own `%cs` with **no
`--since`/`--until` window at all** (F-2562-2: git fills a bare date with the current time-of-day, so a bare
window slides through the day). A control was asserted before any count was believed: **11,788** first-parent
commits in the whole history, so a zero here would have been an answer and not a failed read. The player-path
test is **imported** from `scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`), never re-typed (F-1261-1).
The script is s2668's, re-run from a copy of its own at `artifacts/s2669/day.mjs`, not trusted from its output.

**The day was asked twice, per F-2623-1.** On the first-parent walk it holds **13** commits; asked of ALL
commits reachable from HEAD it holds **24**, so **11 sit off the walk, and all 11 touch a player path**. Nine
of the eleven are contained in a walk commit of this day. **The other two are not, and they are not orphans
either** — `9d388a981` (Devil's Alley) and `64c3661c6` (the Seed Run) are lane commits whose merge `c76d6456e`
landed at 00:15 local on the 22nd, so their news belongs to the **2026-09-22** digest and is told there. The
day is whole; nothing of it is unreachable or unreported.

**A caution about dates on this day, because a reader WILL hit it.** The machine runs at **UTC+07** and these
buckets are local, as TK-01's own window rule requires. `reviews/sol-map-art-corrections-4.md` stamps its
slices in **Z**, so its slice 4, 5 and 6 headers read "2026-09-21 17:40Z / 18:27Z / 19:52Z" for commits that
bucket on **2026-09-22** local (00:15, 01:27 and 02:52). The review is not wrong and neither is this file:
three of that review's six slices are reported here, three in the 22nd's digest.

**The shape of the day: 13 first-parent commits, all of them after 20:54 local, and a single author.** The
day's first-parent history is only its last three hours — the fires were dead, so **zero commits carry a fire
session prefix**, and every landing below was made by the attended session draining Astra's lane-c run.
1,197 files changed, but only **two distinct player-path files** across them: `src/world/Terrain3dClaimPilot.ts`
and `assets/engine-era.json`. That ratio is the day's real story — the bytes are in `Agent-Town/GoldRush-assets`,
which the game reads through the `assets/pilots/*` symlinks, and the engine tree sees one mount file and one
seal.

## The county's news

**Nine maps had their run-6 residue answered in one uncapped evening run.** `25bd52869`, `4a039135e` and
`291683614` land Astra's corrections run 4, slices 1 to 3, on the owner's word (verbatim, 2026-09-21: *"Ok,
lets continue on the current ChatGPT subscription with the Astra work. Lets actually complete all the maps."*).
Every map keeps its heights, masks, mounts, collision footprints and station authority exact — the correction
is in what a rider sees, never in what the map does. `reviews/sol-map-art-corrections-4.md`.

- **The Boneyard's ground quietens and its sleeper becomes a pressure engine.** Fixed-region luminance RMS
  **−53.93%** desktop / **−48.91%** phone following the map's two real approach corridors; the northern cabin
  is rebuilt as barrel, chimney, three pairs of exposed wheels and rods at **1,842 of 3,000** triangles in the
  same envelope; the boiler's 5 m station takes phone HUD **45.00% → 0%**.
- **The Glow Mesa stops being self-lit.** Its five landmarks drop the whole-body emission exemption
  **3.0 → 0.45** (under the 0.6 cap) for lit diffuse paint — the pylon's 5 m median luminance reads
  **0.3832 / 0.3815** where it was a self-lit 0.7031 / 0.6997 — and the cap grades to pale stone, apron to warm
  earth, RMS **−41.49% / −39.21%**.
- **Half-Life Hollow's ravine stops reading as a black floor.** Pixels under 0.1 luminance go
  **25.43% → 0%** desktop and **37.65% → 0%** phone, median **+48.17% / +73.04%**, and the countdown gate's
  5 m station takes phone HUD from **66.27% to 0.17%**.
- **Three maps turn out to have had their art all along — the runtime never chose it.** The Picnic, the Dead
  Band and Relay Rush each had an authored variant pack that the renderer's parent alias skipped: the Picnic
  mounts three blankets and a staging gate (**5 → 9** bodies, +1,452 triangles), the Dead Band its iron-shadow
  warning frame and north silence gate (**5 → 7**, +336), Relay Rush four relay frames (**5 → 9**, +1,264,
  silhouettes **6.58 → 7.12 m**). Nothing was drawn to fix them; the mount selection was.
- **And their ground separates from their shelves.** Picnic RMS **−45.92% / −43.46%**; the Dead Band's
  near-black share **41.83% → 0%** and **47.78% → 0%**; Relay Rush **−51.24% / −49.40%** with dark share
  **25.06% → 0%** and **28.67% → 0%**. Station HUD falls with it: the Dead Band's radio **51.46% → 0.52%**,
  Relay Rush's west dish **76.11% → 6.60%**.
- **The Far Side gets fine regolith instead of the Mare's blurred bands**, its landing frame mounts
  (**5 → 6** bodies, +600 triangles), the inherited rail scar drops **36.09% → 1.56%** contrast and the
  Earthrise array's 3 m station takes phone HUD **37.22% → 10.75%**. The RMS RISES here (**+81.75% / +89.02%**)
  because fine detail replaces blur — recorded as detail, not claimed as quieting.
- **Low Orbit's claw rig becomes a salvage machine.** A recovery housing, pressure cells, a service ring and
  braces take it **2,360 → 2,972 of 3,000** triangles, the black rectangular stage becomes a chamfered
  eight-sided base with **29.29% less plan area** at the same extrema, and body pixels under 0.1 luminance fall
  **81.17% → 7.74%** desktop / **80.85% → 7.83%** phone.
- **The Dome Basin's dry canal follows its published route for the first time.** All five mask-truth segments
  take a lighter mineral pigment (near-black share **99.21% → 0%** / **98.77% → 0%**) and the lock works gain a
  double-rim geared drive wheel, axle, spindle and bearings at **452 → 1,580** triangles in the original bounds.
- **The frame budget held on all nine, and the two costs are named rather than averaged away.** Desktop p95
  moved between **−8.72%** (the Glow Mesa) and **+3.09%** (the Picnic), the phone between **−2.50%** and
  **+2.60%**, with draws unchanged or up by one or two. Low Orbit's phone entry overlap **rises**
  44.20% → 47.29% because the filled body is larger, and Relay Rush's low R2 platform covers **6.58% / 6.48%**
  of the hero sprite at the feet — both reported by the run, not discovered afterwards.
- **What was NOT touched is on the record too.** Every slice names its HELD clauses with the owner who owns
  them — camera framing, contract composition, elevation the sculpt does not have — and two maps carry an
  independent reviewer's note saying the improvement is real and the reference fidelity is not yet there
  (`run-6/e8-low-orbit/independent-review.md`, `run-6/e9-dome-basin/independent-review.md`).

**The era seal was re-pinned three times, and it is still era 6.** `b8a98b649` (#23 `d2f15b7a`), `3c6de00dd`
(#24 `36abad02`) and `25713cb00` (#25 `8e715460`) append a row per slice. Same era, no bump: **no rider's
existing reel was re-hashed and nothing they already earned changed underneath them.** Each pin was read by its
own `cause` field on the merged tree, never by its subject line.

## Not player-visible

The rest of the day's 13 commits are the factory's own paper: the lane dispatch that opened the run
(`362a3db5f`, 20:54 local, carrying the owner's no-cap word), the per-slice ledger rows and leaf entries, and
the handover phrases. None of it is news; it is named so the day is whole.

## What this digest does NOT cover

The two off-walk lane commits named above (`9d388a981`, `64c3661c6`) are told in the **2026-09-22** digest,
where their merge landed. Nothing else on this day is unreported.

---
*Compiled by the s2669 fire. Day boundary `362a3db5f^..b07e03d36`. 13 first-parent commits (bucketed on their
own `%cs`, no window), 24 reachable on the day with 11 off-walk — all 11 player-path, 9 contained, 2 landing on
the next day — 1,197 files changed, 2 distinct player-path files, 6 walk commits touching one of them, 0
commits carrying a fire session prefix. Three slices landed, nine maps corrected. The GZ-01 sweep counted 6
candidates on this day before this file; every one of them is given a verdict above. No commit message was used
to classify anything.*
