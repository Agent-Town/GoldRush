# Ticker digest — 2026-09-22 (TK-01, compiled s2669 fire 2026-09-24 17:50 local)

*Filed TWO DAYS LATE, and the lateness leads the file. TK-01 wants the first fire after 06:00 local; no fire
ran between 2026-09-20 and 2026-09-24 15:35 local (F-FIRE-1 — 478 consecutive ticks died on the macOS
argument limit, `logs/fire-2026092*.log`, rc=126). s2668 filed 2026-09-23 first, as the freshest day, and
recorded the three older ones as owed (F-2668-1). This is the largest of those three: **28 of the sweep's 51
standing candidates sit on this one day**, and every one of them is given a verdict below.*

Micro-headlines from the day's ACTUAL merges, classified by **touched paths on main** and never by commit
messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, re-run rather than inherited.** The day's commits were bucketed on their own `%cs` with **no
`--since`/`--until` window at all** (F-2562-2: git fills a bare date with the current time-of-day, so a bare
window slides through the day). A control was asserted before any count was believed: **11,788** first-parent
commits in the whole history. The player-path test is **imported** from `scripts/gazette-backfill-sweep.mjs`
(`isPlayerPath`), never re-typed (F-1261-1). The script is s2668's, re-run from a copy of its own at
`artifacts/s2669/day.mjs`, not trusted from its output.

**The day was asked twice, per F-2623-1.** On the first-parent walk it holds **94** commits; asked of ALL
commits reachable from HEAD it holds **146**, so **52 sit off the walk, 22 of those touch a player path** —
and each of the 22 was tested for containment: **19 are contained in a walk commit of this day, 3 are not.**
Those three (`29e4e8ec9`, `e680325d5`, `a36f6ad68` — the entry-framing lane work on the Far Side, the Dead
Band and the Glow Mesa) are **not orphans**: all three landed in `eaeb38a98` at 2026-09-23, and the 09-23
digest already tells their news. Nothing of this day is unreachable or unreported.

**A caution about dates, because a reader WILL hit it.** The machine runs at **UTC+07** and these buckets are
local, as TK-01's own window rule requires. `reviews/sol-map-art-corrections-4.md` stamps its slices in **Z**,
so its slices 4, 5 and 6 are headed "2026-09-21 17:40Z / 18:27Z / 19:52Z" for commits that bucket on **this**
day (00:15, 01:27 and 02:52 local). The review is not wrong and neither is this file: three of that review's
six slices are reported here and three in the 21st's digest.

**The shape of the day: 94 first-parent commits, 3,222 files changed, 19 distinct player-path files.**
Twenty-eight of the 94 touched one of them. **Zero commits carry a fire session prefix** — the fires were dead
all day, and every landing below was made by attended sessions draining three streams at once: Astra's lane-c
art run, Astra's lane-b wave, and two Opus implementers in scratch worktrees answering owner rulings the same
day they were given.

**It was the busiest day of the four, and it was busy in three different ways at once**: art fidelity on nine
maps, two sim rules ruled and landed by name, and a rider-facing view schema going 3 → 4.

## The county's news

**The Regatta boat stops throwing her racer over the bow.** `aa0320a04` lands F-RB2-2 ruling (a) (owner
2026-09-22, verbatim: *"F-RB2-2: gangway-reach only"*): disembarking is bounded by a gangway reach of
**6.4 m** — deck half-width 4.4 plus one plank — measured from the deck anchor in every direction, so a
keel-ward key now reaches **6.40 m instead of 16.25 m**, a point still inside her own 28.5 m deck where the
existing refusal clause takes it and the hull clamps as before. Beam-ward keys reach exactly what they always
did, so stepping off within a plank of the rail still disembarks and still forfeits after the start beacon.
Riders get the same predicate by ADR-005 — a `MOVE_HERO` point 1 m past the bow, accepted last week, now
answers `UNREACHABLE_WATER`. The recorded Regatta tape never disembarked, so its hash `fnv1a32:dd4116bf` is
unchanged headless and in the browser on both projects. `reviews/f-rb2-2-gangway-reach.md`.

**A reel that finished the race now outranks one that only walked.** `b5596d6e2` lands F-HEAT15-4 ruling (a)
(owner 2026-09-22, verbatim: *"F-HEAT15-4: yes"*). For `e5-regatta` the county compares `secured`, then
**whether the replay finished the race**, then waves, gold, time and submission — so every row assayed before
this ranks below a row whose race the county's own replay completed, and `decidingKey` says `'mechanic'` when
that is what decided it. The engine declares the outcome in ONE table (`HeadlessContractSim.MECHANIC_OUTCOMES`),
the assayer forwards it only on `verified`, and **the door accepts it as an assay verdict field and never from
a rider's POST** — a rider's own claim of it is stripped, a malformed one refuses the verdict. Standing
heat-15 rows earn the flag on re-assay, and the re-queue deletes a stale one so it is re-earned by the replay,
not inherited. `reviews/f-heat15-4-mechanic-beats-walk.md`.

**The Regatta's view now says where the shore is and when the race ended.** `fb60f599a` lands
`sol-regatta-view-parity` — **view schema 3 → 4**: `now.regatta` gains `finishedAt` and `forfeitedAt` in run
seconds (null before the event), the finish stake arrives as the sixth and last `buoysPassed` row with the
same timestamp, and `canStepAshore` is a deterministic sixteen-heading probe at the gangway reach computed by
one query both the browser and the headless diagnostics call — so the two boot views compare as identical JSON
on desktop and phone. The movement tape replays to `fnv1a32:dd4116bf` and the schema-3 view track to
`fnv1a32:9e79d1e9`, unchanged.

- **The task's own premise was corrected by measuring it, and the published rule says the measured thing.**
  F-HEAT15-2 was filed from heat 15's single blocked point; the sweep found the shore reachable at **149 of
  273** sampled hull positions inside the clamp (the contract's radius-64 spring pond is walkable shallows at
  depth 0.2) and blocked at 124. The `regatta_boat` rule publishes that boundary with `gangwayReach` 6.4
  instead of the universal "no" the master asked for — and no terrain, movement or forfeit rule was changed to
  manufacture either answer. (F-RVP-1, `reviews/sol-regatta-view-parity.md`.)
- **And the rule's own sentence was rewritten to obey the house style.** `271a2cd2a` — the published shore
  sentence carried an em dash, which the visitor-copy guard forbids in `public/skill.md`; it reads with a colon
  now, in the manifest, the skill prose and the re-rendered contracts fence.

**The phone stops hiding the thing a map opens with.** `b017ebdbb` lands `sol-phone-hud-entry` on the owner's
word (verbatim: *"There will be a reset in the next 24 hours. Lets hit it! Full Codex power."*). One file
changes runtime behaviour — `src/ui/theme.css`, inside a bounded 390–430 px by ≥701 px phone range — so vitals
and gold share the top rail with a 44 × 44 Pause target, Weapon, Prospector and Tape Reel become small
separate surfaces, and the world notes take a 154 px column. **Every desktop panel rectangle is byte-identical**
and no TypeScript, number source, testid, input mapping, camera or asset moved.

- **Measured at the plain entry of six maps, every phone HUD union falls between 39.45% and 44.70%**: Low Orbit
  **24.24% → 13.41%**, the Seed Run **21.45% → 12.12%**, the Archive World **24.05% → 14.56%**, the Dead Band
  **24.50% → 14.23%**, Relay Rush **24.50% → 13.82%**, the Glow Mesa **19.19% → 11.28%**.
- **The landmarks come out from behind the panels.** Low Orbit's claw rig **46.89% → 7.66%** covered, the Seed
  Run's vault **23.18% → 2.12%**, the Archive gate **15.32% → 7.27%**, the Dead Band's warning frame
  **22.81% → 0%**; every visible entry body ends at or under **9.59%**.
- **What the cure does not reach is recorded as such.** Bodies already offscreen at the phone entry (the Glow
  Mesa's cooling rack, Relay Rush's charting station and west dishes) stay recorded as OFFSCREEN, never as 0%,
  and the guard refuses an omitted or vanished body. The Dead Band's radio rises 3.75% → 9.59% while its
  warning frame clears — inside the requested ceiling, and not dressed up as every body improving.
  `reviews/sol-phone-hud-entry.md`.

**Four maps get the solid bodies they were already registered for.** `aaa06d8d1` lands F-CORR4-2 (owner
2026-09-22, verbatim: *"F-CORR4-2: ok, lets do it"*): the collision resolver now maps an aliased contract to a
LIST of registry maps and unions their blockers, so the Picnic, the Dead Band, Relay Rush and the Far Side
mount the footprints `landmark-collision-contract.json` had registered but the parent alias never read. The
Picnic's shade at (0,40) joins five parent bodies (**9 → 10** bodies, +216 triangles), the Dead Band's null
post and two tool caches (**7 → 10**, +3,792), Relay Rush's start horn (**9 → 10**, +552) — every transform
matching the registry to the centimetre. **No parent footprint, height, mask, route, site or contract number
moved.** Movement probes stop the hero within **0.12 m** of every composed blocker on every outer face at both
viewports, both spawns stay walkable, and all 19 / 10 / 15 published stakes, harvest points, stations and
sites stay reachable through the real terrain sampler. E1 payload **+69 B** a map, all of it the shared
resolver's compiled delta and none of it art. `reviews/f-corr4-2-variant-footprints.md`.

- **And because these are real blockers, two recorded games changed, which is the honest half of the story.**
  `c797afadd` re-records the null floors on the merged tree with the ruling as its cause: both Picnic seeds
  moved (97,967 → 97,367 ms with kills 35 → 24, and 98,533 → 100,200 ms with kills 32 → 25) with the shade at
  (0,40) as the only new blocker. **Every other floor is byte-identical** — 81 of 83 unmoved — so the change is
  bounded to the map that gained a solid.

**The raw River gets its own pack instead of a borrowed one.** `e878fe5c1` lands F-CORR4-18 (owner
2026-09-22, verbatim: *"F-CORR4-18: ok, give the raw route its own small pack"*): a dedicated 128 × 128 m
terrain grid on a 1 m step (16,641 vertices, 32,768 of 60,000 triangles) that keeps the captured visual
heights and the planar sim, a 1,024-triangle dawn panorama from the exact River plate, and five nonblocking
shoreline groups — 132 stones meeting the sampled terrain with the centre **2.2 m** strip left clear, no
colliders and no walk surfaces. Raw boots keep `fallbackReason: null` and report `ready/glb`. The one contract
edit is a description sentence, quoted to the ruling. Where a player meets it: **the quiet return after the
credits.** `reviews/f-corr4-18-river-pack.md`.

**Astra's corrections run 4 finished its list in the small hours — three slices, seven maps.** `c76d6456e`,
`ed3263b12` and `1b386e550` land slices 4, 5 and 6 on the owner's no-cap word of the 21st.

- **The Seed Run's centre vault loses its flat red roof** for a curved teal shell on five brass ribs, four
  stanchions with shoes and four seed canisters (**800 → 2,148** of 3,000 triangles, base plan area **−29.29%**
  at the original bounds and collision footprint), and continuous dry-route pigment follows the four caravan
  segments and three published green rectangles (RMS **−59.39% / −62.50%**). Its 3 m station takes phone HUD
  **53.76% → 0%**.
- **Devil's Alley's three wind anchors become braced coil housings** — drums, spindles, radial supports, feet
  and brass coils at 1,848 / 2,192 / 2,536 of 3,000 triangles inside the original bounds and footprints — and
  the black square footings become eight-sided stone with **29.29% less plan area**. The 3 m stations take
  phone HUD from **7.07% to 0.004%**.
- **The Old Canal's translucent slab is gone.** Each undecided band is one opaque merged rubble mesh of 46 low
  masonry blocks with gaps for the existing crossable surface (**12 → 552** triangles a band, one draw each),
  the state still reports exactly three undecided cuts, and **no false entry water** is drawn. The three
  decision markers gain supported hand wheels and a drive spindle.
- **The Last Claim — the verdict that opened the whole campaign — is answered with a pack** (`ed3263b12`): a
  dedicated terrain grid whose vertices match the captured fallback heights to **0.00000006 m**, a separate
  star panorama, and five monuments standing 3 m behind the three published preserve sites with sites, marker
  state and interaction radii unchanged. The ordinary phone entry now shows a recognisable lantern (body
  median **0.461 / 0.460**). Astra's verdict on the full concept **stays UNACCEPTED**, as the campaign's bar
  requires; only the sculpt-pack clause of its run-1 verdict is closed.
- **The Ember Shore stops being near-black** (`1b386e550`): one world-space basalt shader covers the sculpt and
  its 160 m continuation with **zero height gap** at the 128 m boundary, median **0.053 → 0.337** desktop /
  **0.061 → 0.321** phone and pixels under 0.1 luminance **100% → 0%** in both regions; the inherited shelf
  becomes a cooled recovery titan at 2,356 of 3,000 triangles in the same bounds, footprint and mount.
- **The Archive World's filled gate becomes a portal you can see through** — two piers, a **7.64 m** central
  opening, **69.81% less footing**, gate median **0.232 → 0.494** — and its warm light pools follow
  `restoredWingIds` so **no unearned wing is ever lit** (a 0 → west → all → none state test returns exactly
  [0,0,0] → [1,0,0] → [1,1,1] → [0,0,0]).
- **One regression was reported rather than hidden**, and it is the clearest thing in the run: at the Archive
  gate's declared 10 m inspection the phone HUD now covers **68.72%** of its visible body, up from 40.55%,
  because the central mass went while the piers sit under the side panels. Astra states plainly that **no
  tested distance solves that gate's phone framing and HUD together** and hands it to the camera and UI owners.
  `reviews/sol-map-art-corrections-4.md`.

**Then the same maps were done AGAIN, to a higher bar, the same day.** `4b4ec03bc`, `4472bb0b5` and
`4c6111aab` land Astra's fidelity run 1, slices 1 to 3 — the Last Claim, the Ember Shore and the Archive World
— answering the clauses run 6 had HELD, each measured against **its own earlier numbers**.

- **The Last Claim's deck becomes native engraved bronze** with radial material coordinates, three local pools
  with contact collars under the lanterns, a native star vista and a 32-bay perimeter; the panorama grows
  **1,024 → 3,584** of its 4,000-triangle budget for one extra draw, ground RMS falls **12.21%** desktop and
  **7.81%** phone against run 6, and the square floor, every terrain triangle, the heights, masks, monument
  bounds, mounts and collision authorities are unchanged.
- **The Ember Shore's south-east tone step is 88.78% smaller** in signed vertical difference now that terrain,
  continuation and panorama ground share one pigment with exact edge normals; the median rises
  **0.337 → 0.370** desktop and **0.321 → 0.349** phone with no sampled near-black pixel. The RMS rises about a
  fifth **because the texture now carries contrast the flat paint lacked** — stated, not smoothed over.
- **The Archive World's earned light now cycles exactly none → west → all → none** without touching the source
  state, and the same-region warm-light control rises **0.314 → 0.508** where run 6 managed 0.247 → 0.395; four
  colonnaded perimeter ruins rise **wholly outside the unchanged playable square** for 864 triangles.
- **Frame p95 moved by hundredths of a millisecond across all three**, over four runs an arm: 9.10 → 9.05 and
  9.15 → 9.00 (the Last Claim), 9.10 → 9.10 and 9.05 → 8.90 (the Ember Shore), 9.90 → 9.95 and 9.95 → 9.80 (the
  Archive World), with draws up by one or two. **Astra's verdict on all three full concepts stays UNACCEPTED**
  and each names what its independent reviewer still holds against it.
  `reviews/sol-map-art-fidelity-1.md`.

**The era seal was re-pinned thirteen times, and it is still era 6.** `3aab225b0` (#38, re-measured after the
main merge), `ac5148c86`, `92e007f8a`, `b37a552ad`, `fdfe2667e`, `528df74c3`, `ec91f782c`, `9296dfa11`,
`97547b82b`, `2d012380b`, `d891514b7`, `a99c4918b` and `860544d7d` append a row each for the day's slices and
rulings. Same era, no bump: **no rider's existing reel was re-hashed and nothing they already earned changed
underneath them.** Each pin was read by its own `cause` field on the merged tree, never by its subject line.

**What the day cost in download, at the two points it was measured.** The E1 first-town payload reads
**34,279,221 B** at the phone-HUD landing and **34,283,328 B** at the view-parity landing — **+4,107 B** across
the pair, with the variant-footprint work adding **69 B** a map as compiled resolver code and no E1 art in any
of it.

## Not player-visible

NOT PLAYER-VISIBLE — `e4c1f99d3`: a merge of main into the regatta-view-parity chain, fire bookkeeping, pass
1. The era registry row it carries is main's own and the chain's pin was re-measured on top of it — that pin is
the `#38` entry reported above as part of the seal, and **its hash is deliberately not repeated here** (F-1613-1:
a hash named inside a NOT PLAYER-VISIBLE paragraph is classified by it, so repeating it would re-file one pin as
dismissed while its twelve identical siblings read as reported). No runtime, contract, art or player text
changed in this commit.

The rest of the day's 94 commits are the factory's own paper: reviews, ledger rows, goal-leaf updates, the
handover sections through 13z-4, the lane dispatches that carried the owner's rulings into tasks, and the
post-fast-forward battery note that closed the day green (**950 / 0**). None of it is news; it is named so the
day is whole.

## What this digest does NOT cover

The three off-walk lane commits named above (`29e4e8ec9`, `e680325d5`, `a36f6ad68`) are told in the
**2026-09-23** digest, where their merge `eaeb38a98` landed. With this file and its two siblings, the GZ-01
sweep's remaining standing candidates are the **17 that sit on 2026-09-24** — a day whose own digest is not due
until the first fire after 06:00 local on the 25th.

---
*Compiled by the s2669 fire. Day boundary `c76d6456e^..38fc2639a`. 94 first-parent commits (bucketed on their
own `%cs`, no window), 146 reachable on the day with 52 off-walk — 22 player-path, 19 contained, 3 landing on
the next day — 3,222 files changed, 19 distinct player-path files, 28 walk commits touching one of them, 0
commits carrying a fire session prefix. Thirteen slices and rulings landed. The GZ-01 sweep counted 28
candidates on this day before this file; every one of them is given a verdict above. No commit message was used
to classify anything.*
