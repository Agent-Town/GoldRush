# Heat 14 — the era-6 re-ride — operator's note (written by the operator, 2026-09-18)

Operator: an Opus operator agent hosting headless `claude -p` rides (Claude Opus 5 through the public
door) from the detached arena `<scratchpad>/arena-heat14-e3949bfa` at the DEPLOYED build `e3949bfa`
(`builtAt 2026-09-17T19:33:59Z`), branch `heat14/era6-reride`. Owner: 2026-09-13 "we then have to make
another run in the future but not immediately" · 2026-09-17 "Lets do them all." · "All on the Anthropic
subscription". Rig: heat 13's `*.mjs`, adapted (`make-charter` rewritten for era 6, `harness:
heat14-operator`, `artifacts/heat14/opus/<contract>` workspaces, CLI **2.1.272**).

**The heat ran to completion. All 37 board contracts were ridden; the weekly limit never fired.**
Per-ride record: `matrix.md` (37 rows); rides under `rides/<contract>/` (charter, ride logs, work tree,
submission, verdict, notebook entry); the rig's own workspaces under `../heat14/opus/<contract>/`;
`queue2.log` is the driver log for blocks q01b–q07, `rides/the-claim.driver.log` for ride 1.

## 1. The arena and the era gate (both proofs PASS, before the first ride)
| proof | result |
|---|---|
| the refusal | heat 13's VERIFIED probe reel (era 5, `09838c35…`), byte-identical, re-POSTed → **HTTP 400 `{"ok":false,"error":"reel_not_current","message":"This reel rode era 5; the county accepts era 6 'the Re-surveyed Claims'."}`** |
| the fresh probe | the same orders replayed order-for-order in this arena → SECURED w10 / 300.000 s / 335 g, `eventLogHash fnv1a32:1c431865` → **`assay: verified`, `ranked: false`, `assayHash fnv1a32:b131e18e`**, papers `buildId e3949bfad · engineHash 540b49af… · era 6 · viewVersion 2` |

The fresh probe's `assayHash` is **identical to the era-5 probe's** (`fnv1a32:b131e18e`): the-claim's sim
is byte-identical across the era bump for those orders, which is what the era-6 land review predicted
("the-claim HOLDS"). The probe also proves the county's assayer droplet is in sync with the deployed
tree — it replayed an era-6 reel and verified it.

**Headroom (F-HEAT14-1):** the CLI exposes no headroom surface — no `usage` subcommand, no rate-limit
state on disk. The only measurable fact is whether a one-turn `claude -p` answers. So the heat rode in
BLOCKS OF SIX and re-probed between blocks, per the master: **seven probes, all `rc=0`, all `"OK"` in
5–8 s** (`headroom/probe-1..7.json`). 8.15 hours of rider wall, 1.02 billion cache-read tokens and
4.64 M output tokens later, the limit still had not fired.

## 2. The receipts delta — measured from the live API before and after
| moment | boards | ranked rows | retired reels counted |
|---|---|---|---|
| **2026-09-17T23:38:04Z**, before the first ride | 37 | **0** | **69** |
| **2026-09-18T11:28:18Z**, after the 37th | 37 | **18** | **56** |

(`receipts-before.json`, `receipts-after.json`; `e1-drill-yard` answers HTTP 400 — it is the training
ground, not a board.) **All 18 ranked rows are heat-14 rows** (`harness: heat14-operator`): the-claim,
e1-dry-gulch, e1-night-shift, e1-twin-banks, e10-ember-shore, e2-pressure-garden, e2-trestle,
e3-blackout-ridge, e3-fairground, e3-moth-season, e4-long-road, e5-deepwater-claim, e6-glow-mesa,
e6-picnic, e7-relay-rush, e7-relay-valley, e8-far-side, e8-mare-claim.

**Why 18 and not 31.** Thirteen secured reels do not stand: twelve were accepted by the door
(`{"ok":true,"stored":true,"rank":1,"decidedBy":"crown"}`) and then dropped out of the assay index
(F-HEAT14-6, below), and one — `e9-dome-basin` — was refused by the proxy before the door saw it
(F-HEAT14-4). The rides themselves are receipts either way; the board is not.

**The retired counter is not monotonic (F-HEAT14-5, informational).** 69 → 56 is −13, and it is exactly
explained: of the 18 boards that gained a row, **13 lost exactly one retired reel each**, and the five
that did not (`e1-night-shift`, `e10-ember-shore`, `e2-trestle`, `e3-fairground`, `e8-far-side`) are
precisely the boards where this rider had no retired reel of its own — ember-shore never had one, and
heat 13 FAILED the other four. The "one standing per rider" rule reaches back into the retired list: a
rider's new verified reel supersedes that rider's own retired reel and the county stops counting it.
Heat 13's note read retired counts as an independent measure; they are not.

## 3. The rides
**Ridden 37, secured 31, not secured 6, never ridden 0.** One wall hit (`e1-night-shift`, which secured
anyway at the wall). Rider wall 8.15 h; 2,182 assistant turns, 1,070 tool calls.

**Secured (31):** the-claim w10/498g · e1-dry-gulch w20/328g · e1-twin-banks w20/556g · e2-incline
w12/129g · e2-pressure-garden w12/227g · e3-blackout-ridge w12/499g · e3-moth-season w12/455g ·
e4-gusher-county w12/135g · e7-dead-band w20/5g · e7-echo-canyon w20/200g · e7-relay-rush w20/200g ·
e7-relay-valley w20/200g · e8-mare-claim w20/260g · e9-devils-alley w20/200g · e9-dome-basin w20/12g ·
e5-deepwater-claim w12/200g · e5-flotilla w12/200g · e5-regatta w12/200g · e6-glow-mesa w15/109g ·
e6-half-life-hollow w20/200g · e6-picnic w20/500g · e10-ember-shore w12/60g · e10-last-claim w8/90g ·
e1-night-shift w25/200g · e2-trestle w14/176g · e3-fairground w12/62g · e4-boneyard w12/200g ·
e4-long-road w12/30g · e5-stillwater w12/200g · e8-far-side w20/60g · e10-archive-world w12/200g.

**Not secured (6):** e3-canyon-works (w20/21g) · e8-eclipse (w19/500g, died 13.6 s short with 500 gold
idle) · e1-baron (w20/166g) · e2-hill-mine (w13/89g) · e4-dust-flats (w13/175g) · e8-low-orbit
(w13/60g).

**Never ridden: none.** The weekly limit that ended heat 13 at 27 of 36 did not fire this time.

**First-ever secures in county history (2).** `e10-ember-shore` (w12/60g, hero took zero damage across
the run) and `e10-archive-world` (w12/200g) — the only two board contracts the county's own registry
still lists as `unclaimed` in `public/skill.md` AND whose live board shows zero reels ever retired.
Both stand on the era-6 board… `e10-ember-shore` does; `e10-archive-world`'s reel was refused on the
transport and is being re-delivered (F-HEAT14-7).

**What changed against heat 13.** Five maps heat 13 rode and could NOT secure, this heat secured:
**e2-trestle** (heat 13 w12/76g), **e3-fairground** (w6/36g), **e1-night-shift** (w23/116g),
**e4-long-road** (w14/0g, an owner's-desk open question, A15) and **e8-far-side** (w14/443s). Three
maps heat 13 secured, this heat did not: **e3-canyon-works** (heat 13 w15/270g), **e8-eclipse**
(w20/80g) and **e4-dust-flats** (w14/0g). The eight boards heat 13 never reached all secured.

**The L2 answer is unanimous, and it is the heat's headline.** Every one of the six not-secured rides
names the same cause in its own `## Winnability` line: **the rider's own budget**, never the map. Three
say "Yes — winnable" outright (e8-eclipse, e4-dust-flats, e8-low-orbit) and three say
"Undecided-leaning-yes" (e3-canyon-works, e1-baron, e2-hill-mine). **No board contract on era 6 was
reported unwinnable through the door by the rider that rode it.**

## 4. The three cured maps — did the rider's first minute match the census's?
Each rider opened with its own idle probe: a no-orders run, which is exactly what the county records as
a null floor. All three reproduce `assets/contracts/null-floors.json` **to the millisecond**.

| map | the census / the county's re-recorded floor (seed 01) | the rider's own idle probe | match |
|---|---|---|---|
| **e2-trestle** (five spawn gates, pin #4) | `1 wave / 70,700 ms / 13 kills`, `fnv1a32:48102054` | **1 wave / 70.7 s** | **exact** |
| **e2-incline** (south lane edge dropped, coal_thief north gate, pin #4) | `2 waves / 119,333 ms / 35 kills` — the cure report's own "null floor goes from wave 1 / 73.9 s to wave 2 / 119.3 s on seed 01" | **2 waves / 119.333 s** | **exact** |
| **e6-picnic** (20-second claim stand-down, pin #8) | `3 waves / 97,967 ms / 35 kills` — the pin's own "73.0/47.3 s → 98.0/98.5 s, both still lose" | **3 waves / 97.967 s** | **exact** |

And all three then SECURED — the Trestle at w14/176g, the Incline at w12/129g, the Picnic at w20/500g
(every ranking axis maxed; the rider finished holding two of three stakes). The Picnic is the sharpest
result of the three: the 2026-09-17 census had it dying to an objective loss at 36.9 s with the hero at
full HP, and the cure shipped the day before this heat.

## 5. Findings
- **F-HEAT14-1 (operations, F-HEAT13-1's successor):** the CLI still publishes no headroom surface —
  no `usage` subcommand, no on-disk rate-limit state, no headers a rig can read. The block-of-six
  re-probe cadence is the only measurement available, and it only answers "not yet". It cost seven
  five-second probes to learn nothing more than that, and this time nothing more was needed.
- **F-HEAT14-2 (operations, cured in the rig):** the notebook charter has outgrown argv. At 742,647 B
  it was already 71 % of this host's 1,048,576 B `ARG_MAX` (args + environment), and each landed ride
  appends ~9.6 KB, so an argv charter would have hit `E2BIG` around ride 25 of 37 — silently, with no
  log naming the cause. `ride-wall.mjs` now delivers the charter on **stdin** (`claude -p` with no
  prompt argument); the prompt bytes are identical, only the transport differs. By ride 37 the charter
  was ~1.09 MB — past the limit the old shape would have hit.
- **F-HEAT14-3 (design, rider-measured, recurring):** the E2 pressure mechanic is **invisible through
  the door**. On both the Trestle and the Incline the rider enumerated the union of `now` keys across
  every view of its run and found *no pressure value, no band, no coal count, no boiler fuel* — while
  `twist.pressureEnabled` is true, `boiler_house` is on the roster at 70 g × 3, and `twist.coalSeams`
  authors three seams ~11 units from the stake. The grammar has no vent verb. The rider's conclusion,
  its own words: 210 gold of boiler is "a strictly dominated purchase", and F-MAPL-1's
  `boilerHouse.coalSeconds` 12 → 36 "only triples the duration of a process I cannot observe, cannot
  steer and cannot spend". It says the map has asked it nothing about its era's mechanic for "the
  tenth time across my generations". **A balance change to an unobservable quantity cannot reach a
  rider.** Owner's desk: either publish pressure in the view or stop pricing the boiler as a choice.
- **F-HEAT14-4 (transport, new):** `e9-dome-basin`'s secured reel was refused by **nginx with HTTP 413
  Request Entity Too Large** — a 1,206,243 B submission body against what looks like a 1 MB
  `client_max_body_size`; the largest body that got through this heat was `e1-night-shift`'s 853,315 B.
  The county's own envelope would likely have refused this reel too (`16 KiB + maxEntries × 160` put
  dome-basin's ceiling near 592 KB when heat 12 lost the same map to `reel_too_large` at 621,674 B),
  but we cannot know: **the proxy answered before the door could**, so the rider got an nginx HTML page
  instead of a county refusal reason, and `land-ride` died parsing it as JSON. Two costs: the reel is
  lost, and the refusal taxonomy never saw it. Cure: raise `client_max_body_size` above the largest
  lawful reel, or have the door refuse oversize bodies itself so the answer is a county reason.
- **F-HEAT14-5 (accounting, informational):** the retired-reel counter is not monotonic — see §2.
- **F-HEAT14-6 (F-HEAT13-2's recurrence, worse):** **12 of the 31 accepted submissions (39 %) dropped
  out of the assay index.** Every one POSTed `{"ok":true,"stored":true,"rank":1,"decidedBy":"crown"}`
  and then answered `assay_not_found` on every later poll: e2-incline, e4-boneyard, e4-gusher-county,
  e5-flotilla, e5-regatta, e5-stillwater, e6-half-life-hollow, e7-dead-band, e7-echo-canyon,
  e9-devils-alley, e10-last-claim and e10-archive-world's re-delivery. Heat 13 saw three; this heat saw
  twelve, so the drop scales with submission rate and it is still not cured. **A stored standing with a
  crown rank and no assay slip is invisible on the board** — the county silently keeps 18 of 31 honest
  receipts.
- **F-HEAT14-7 (county law, measured in the source — and it caps a heat):** the standings door allows
  **30 submissions per `anonId` per hour** (`functions/api/standings.ts:166`, `MAX_REQUESTS_PER_ANON = 30`,
  `RATE_TTL_SECONDS = 3600`), and this heat used **exactly 30**: 29 accepted ride POSTs plus one
  accepted re-POST. The 31st submission — ride 37's own, `e10-archive-world`, secured at 11:16Z — was
  refused `{"ok":false,"error":"rate_limited","message":"The county clerk needs a spell."}`. **A 37-board
  heat does not fit inside the county's own per-rider submission cap.** Two mechanisms make it worse
  than it reads: (a) `bumpCounter` (`functions/api/_ratelimit.ts`) re-`put`s the counter with a FRESH
  one-hour TTL on every accepted submission, so under traffic more frequent than hourly the window
  never rolls and "30 per hour" becomes **30 per heat**; (b) a refusal does not bump the counter, so the
  window only starts expiring an hour after the last ACCEPTED submission — this heat's cap cleared at
  about 12:03Z, an hour after the re-POST at 11:03:06Z, and not before.
  **My share of it, recorded against myself:** I spent the 30th slot on a re-POST sweep for F-HEAT14-6
  while ride 37 was still riding. Without that sweep `e10-archive-world` would have had the slot. A
  heat's own live submissions have right of way; a re-POST sweep belongs after the last ride, and now
  we know it also belongs an hour after it. `deliver.mjs` in this directory is that rule made a script
  (one reel at a time, 15-minute cadence, a 429 is not a delivery so the same reel is retried rather
  than skipped); it re-delivers the thirteen once the cap clears.
  **For the county, the cure is a ruling, not a script:** either raise `MAX_REQUESTS_PER_ANON` above the
  board count (37 today, and a heat legitimately needs one submission per board plus re-POSTs), or stop
  refreshing the TTL on each bump so the hour is a real hour, or exempt a declared operator harness.
- **F-HEAT14-8 (measurement, closing F-HEAT13-3):** heat 13 found that `e8-far-side`, which the
  `e8-air-logical` prover secured, "did not secure for the rider" and concluded "the map's difficulty
  for a human-shaped rider is real". This heat's rider secured it at w20/60g — with the hero bottoming
  at 11.0 % of maxHp and saved by a draft heal, so the difficulty is real but it is not a wall. The
  same correction applies to `e4-long-road` (open question A15), which heat 13's measurements
  "predicted" could not secure and which this rider banked with 243 seconds of errand slack.

## 6. What the drain should know
Nothing in the arena's tracked tree was touched (`finish-ride.mjs`'s firewall check ran on every ride
and stayed clean). The branch `heat14/era6-reride` carries the rig, the era-gate probes, the receipts
snapshots and all 37 rides; the largest blob is 14.3 MB (`e1-night-shift`'s view log), there is no
`trace.zip`-class file, and no county row or tape was edited or deleted. The notebook
`~/Claude/Projects/goldrush-gauntlet/memories/claude__opus-5/NOTEBOOK.md` gained generations **97–133**.
