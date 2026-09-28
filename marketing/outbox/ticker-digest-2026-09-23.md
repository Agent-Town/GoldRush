# Ticker digest — 2026-09-23 (TK-01, compiled s2668 fire 2026-09-24 15:50 local)

*Filed LATE, and the lateness is the first thing in the file rather than the last: TK-01 wants the first fire
after 06:00 local, and no fire ran at all between 2026-09-20 and 2026-09-24 15:35 local (F-FIRE-1 — 478
consecutive ticks died on the macOS argument limit, `logs/fire-2026092*.log`, rc=126). This is the first fire
since the cure, so this digest is nine and a half hours past its trigger and the digests for the coverage days
**2026-09-20, 2026-09-21 and 2026-09-22 are still owed** (the newest digest before this one is 2026-09-19).
That gap is filed as a row, not left implied — see the closing note.*

Micro-headlines from yesterday's ACTUAL merges, classified by **touched paths on main** and never by commit
messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, re-run rather than inherited.** The day's commits were bucketed on their own `%cs` with **no
`--since`/`--until` window at all** (F-2562-2: git fills a bare date with the current time-of-day, so a bare
window slides through the day). A control was asserted before any count was believed: **11,781** first-parent
commits in the whole history, so a zero here would have been an answer and not a failed read. The player-path
test is **imported** from `scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`), never re-typed (F-1261-1).
The script is banked at `artifacts/s2668/day-2026-09-23.mjs`.

**The day was asked twice, per F-2623-1.** On the first-parent walk it holds **67** commits; asked of ALL
commits reachable from HEAD it holds **84**, so **17 sit off the walk, 7 of those touch a player path** — and
each of the 7 was then tested for containment: **all 7 are contained in a walk commit, 0 orphaned**. The day
is whole and nothing of it is unreachable or unreported.

**The shape of the day: 67 first-parent commits, 1,888 files changed, and only 7 distinct player-path files.**
Nineteen of the 67 touched one of those 7. **Zero commits carry a fire's session prefix** — the fires were
dead all day, and every landing below was made by an attended session draining Astra's lane-c run.

**And the shape is the story: this was a big art day whose bytes are almost all in another repository.** Ten
slices landed (one entry-framing run, nine map-fidelity maps), and in THIS tree they show up as eleven
one-file era pins, one pilot-terrain source file and one camera/manifest set. The art itself landed on
`Agent-Town/GoldRush-assets` main first, which the game reads through the `assets/pilots/*` symlinks — so the
sweep's scan space (`src/ assets/ public/ functions/ site/ index.html`) cannot see three of the nine maps at
all. The tool says it itself: *widen the list, not the verdict.* They are reported here by name anyway.

## The county's news

**The first seconds of a plain boot now look at the thing the map's picture leads with.** `eaeb38a98` landed
entry framing on five maps — the camera glances at the declared landmark from the existing rig, then returns
to the hero, with every hero start, view field, order and tape unchanged.

- **Three entries were fixed, two were already right and were left alone.** The Glow Mesa's starstone derrick
  enters the frame at **0 → 37,168 → 0** body pixels desktop and **0 → 41,400 → 0** phone (visible ~1.4–1.5 s
  inside the authored 2.5 s window); the Far Side's Earthrise listening array **0 → 26,144 → 0** and
  **0 → 28,996 → 0**; Half-Life Hollow's south countdown gate **0 → 26,671 → 0** and **0 → 29,787 → 0**
  (~1.7–1.8 s). The Dead Band's warning frame (6,714 / 7,570 px) and Relay Rush's relay shelf
  (21,662 / 24,145 px) were already in the resting frame, so they declare nothing and no glance runs there.
- **Nothing a rider already wrote against moved.** The headless `now` snapshots match the browser byte for
  byte, the 600 long-pan proof frames keep their original path, and the E1 first-town payload reads
  **34,309,830 B**.

**Nine maps had their art-owned residue answered, one map at a time, while the run was still working.** Astra's
second fidelity pass landed in mid-run slices: the Pressure Garden `79faa20b0`, the Incline `5d2748f27`, the
Canyon Works `155a99214`, the Dust Flats `a47d8c5ad`, the Long Road `8d3dd7b10`, Gusher County `6c5af175d`,
the Boneyard `e99defc97`, Half-Life Hollow `75f94354d`, the Picnic `bd266495f`. Every one carries its own
number against its own earlier run, and every one keeps bounds, mounts, collision footprints and station
authority exact — the fidelity is in what the rider sees, not in what the map does.

- **The Pressure Garden's river stops reading as dark blocks.** Centre-to-margin contrast **0.119 → 0.020**
  desktop and **0.119 → 0.015** phone (−83.1% / −87.4%), seventy-eight grounded stones, and the ±6 m ford
  still clear (closest vertex at |x| 8.33 m).
- **The Incline's ore cable house reads as a mechanism** — a spoked sheave, explicit cable returns and a wound
  drum replace a buried dark winch; **2,028 → 2,136** of 3,000 triangles with mount, footprint and inspection
  station exact.
- **The Canyon Works' dynamo house stops being a slab with wheel motifs**: a supported drum and rotor, a
  framed hall, ceramic terminals, **1,768 → 2,552** triangles.
- **The Dust Flats' two service landmarks read as what they are** — three connected fuel tanks (silhouette
  **24.65% less solid** at unchanged bounds) and an open lattice storm tower (**628 → 826**); the fixed-region
  ground RMS holds the previous run's numbers **to the sixth decimal**.
- **The Long Road's apron stops showing a boundary**: boundary luminance difference **0.0207 → 0.0021**
  (−89.8%); the way station opens into a canopy with a water tank and the covered hull becomes an articulated
  convoy.
- **All eight Gusher County derricks gain a coherent lattice**, pipe dressing, gauges and exposed flywheels at
  2,108–2,252 triangles each, with the zero-red-paint rule and the ground untouched.
- **The Boneyard's ground gets quieter and its wrecks get distinct**: same-box ground RMS **−25.12%** desktop
  and **−17.96%** phone; the sleeper **1,842 → 2,926**, the two flivver wrecks **512 → 1,370** and
  **512 → 1,250**.
- **Half-Life Hollow's countdown gate becomes an architectural clock arch** (**508 → 1,956**); luminance at its
  own station **0.252 → 0.297** desktop and **0.253 → 0.292** phone.
- **The Picnic's painted cross marks are gone** — a native ground pigment replaces them and the west blanket
  gains authored cloth props; ground RMS **−43.96%** desktop and **−29.56%** phone, centre median
  **0.164 → 0.586** and **0.168 → 0.583**.
- **The frame budget held on every one of them, and the largest single rise is named rather than averaged
  away.** Across the fourteen measured arms of the nine maps, desktop p95 moved between **−0.20 and +0.55 ms**
  and the phone between **−0.25 and +0.35 ms**; the +0.55 is Half-Life Hollow's gate view (**8.65 → 9.20 ms**),
  6.4% of its own base and nowhere near the 15% regression bar. Draws are unchanged or within one, with zero
  console and zero capture errors — the detail was bought at the triangle ceiling (3,000 a body), not out of
  the frame.
- **What it does cost is download, and only outside the opening epoch.** The E1 first-town payload ends the day
  at **34,311,999 B**, up from **34,309,830 B** at the entry-framing landing — **+2,169 B** across ten slices
  (+2,035 at the Pressure Garden, +1 at the Incline, +133 at the Canyon Works, unmoved after that), and **none
  of it E1 art**: every review records "no E1 art changes" for its own map. Meanwhile
  the raw runtime grew where the new maps live: **+15,677,584 B** at the Canyon Works (almost all of it the
  three-atlas panorama, 836,136 → 16,459,928 B, an explicit E3 cost), **+11.8 MB** at the Picnic, **+159,892 B**
  at the Boneyard and **+92,996 B** at Half-Life Hollow.

**The era seal was re-pinned eleven times, and it is still era 6.** `c3c8da434`, `6f7283c26`, `d4483c3e6`,
`651e58cf5`, `4c18b7ea1`, `3cd06a996`, `659947358`, `d14d6ac06`, `6fa5ac092`, `cc8039044` and `63af3c630`
append rows to the registry for the entry-framing slice and the nine fidelity maps. Same era, no bump: **no
rider's existing reel was re-hashed and nothing they already earned changed underneath them.** Each pin was
read by its own `cause` field on the merged tree, never by its subject line.

**Two defects were written down rather than worked around** — both fire-authorable, both from the day's own
gates: `bf0dc86bb` records that the E3 census expects a canyon-connect rule the manifest no longer publishes
(red since before the wave, F-F2-10), and `ad20d8889` records that the campaign checkpoint is read before its
write completes (F-F2-18, one battery red that passes alone). The battery on main was green after every leg
(950 / 0).

## Not player-visible

NOT PLAYER-VISIBLE — `00ae5ae61`: a merge of main into the entry-framing chain, fire bookkeeping plus the
test-truth landing carried into the chain; the era registry row it moves is main's own and the chain's pin was
re-measured on top of it — that pin is the second of the eleven reported above as part of the seal, and **its
hash is deliberately not repeated here** (F-1613-1, cured s2669: a hash named inside a NOT PLAYER-VISIBLE
paragraph is classified by it, so this file had been re-filing that one pin as dismissed while its ten
identical siblings read as reported). No runtime, contract, art or player text changed in this commit.

The rest of the day's 67 commits are the factory's own paper: reviews, ledger rows, handover sections 13z-5
through 13z-11, the queueing of the next leg on the owner's word, and the leg-by-leg split of the 22-map
master (`3040c89e0`) that the owner asked for. None of it is news; it is named so the day is whole.

## What this digest does NOT cover

Three coverage days before it are still unfiled — **2026-09-20, 2026-09-21, 2026-09-22** (137, 13 and 94
first-parent commits) — and the GZ-01 sweep counts **70 player-path merges since 2026-09-19 with no citation
in any owner-facing sink**, of which this digest discharges the nineteen that belong to 2026-09-23. The
remaining 51 sit on 09-21, 09-22 and today. That is the visible edge of F-FIRE-1's four dead days, and it is
filed as its own row (F-2668-1) rather than left to the next reader to notice.

---
*Compiled by the s2668 fire. Day boundary `eaeb38a98^..1e816ed6a`. 67 first-parent commits (bucketed on their
own `%cs`, no window), 84 reachable on the day with 17 off-walk — 7 player-path, all 7 contained, 0 orphaned —
1,888 files changed, 7 distinct player-path files, 19 walk commits touching one of them, 0 commits carrying a
fire session prefix. Ten slices landed, of which three (the Dust Flats, Gusher County, Half-Life Hollow) are
invisible to the sweep's scan space because their bytes are in `Agent-Town/GoldRush-assets`. No commit message
was used to classify anything.*
