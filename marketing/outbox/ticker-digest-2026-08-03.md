# Ticker digest — 2026-08-03 (TK-01, compiled s1453 fire 2026-08-04 06:0x local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.
Classifier committed at `artifacts/tk-2026-08-03/classify.mjs`, so every count below is re-derivable.

**The shape of the day, measured:** **256 commits** landed on main's first-parent walk, **13** of them
merge commits. **28** touched player-visible paths (`src/`, `public/`, `assets/`) — the highest
player-facing count of any day this digest has covered. **18** touched the factory's own tools and nets.
**210 were bookkeeping** — the ledger talking to itself.

**The through-line: 08-03 is the day the owner played the game and the factory answered, in one shift.**
Nine of yesterday's merges close findings from a single owner playtest dated 2026-08-03 — the **F-BW**
series, running from **F-BW-4** to **F-BW-17**. This is not the factory grooming its own backlog: it is
the shortest loop the project has yet run between *a person noticing something while playing* and *the
thing being different*. And it landed on the same morning as the **beauty pass**, six maps drained in
fifteen minutes. Yesterday the game got both prettier and more honest.

⚠️ **The instrument misdescribed itself again — fourth day running — and this time the headline denied a
feature the family can see in a plain boot.** `c12ad434` is titled *"s1443: correct
reviews/lane-boss-healthbar-steady.md — gates ran on 5188, not 5199 (F-1443-4)"*, which reads as a
one-line correction to a review file's port number. It is that. It is **also 196 insertions across five
`src/` files plus a modelled `.blend`/`.glb`/atlas family** — the Baron's launcher, rocket and powder keg
as real 3D props. Measured, not assumed: the loader is called from
`Game.ts:3938` behind `activeContractUsesBaronPresentation()` — **a contract test, not a debug flag**, so
unlike the 3D pilot props of 08-02 this one is **default-on** for every Baron contract. Had this digest
classified by headline, the day's single largest player-visible landing would have been filed as a typo fix.

**07-30 said a path is a hint about audience, not a verdict. 07-31 said a headline names intent, only the
diff names content. 08-01 said the diff can sit under a headline that denies it. 08-02 said a headline can
announce a state the tree was already in. 08-03 says the denial can run the other way — a bookkeeping
headline can be telling the truth about itself and still be hiding a feature.**

---

## What the family can see

**Six maps got their beauty pass, drained in fifteen minutes.** `6a9dc297` · `2af8a044` · `78d972ab` · `1fb0c180` · `c08d9b43` · `10586b90`
Town, Night Shift, The Claim, Dry Gulch, Twin Banks and the Baron each landed sculpted terrain — a
modelled `.glb`, its atlas, its contract — plus the lighting, scatter and water work that dresses it.
Six shifts, one morning, gates green on both projects (`ba02c0cd`).

**The Baron brings his own artillery, in three dimensions.** `c12ad434`
The launcher, the rocket and the powder keg stop being flat stand-ins. Default-on wherever the Baron
appears; the flat rocket is suppressed where the modelled one flies, and the Baron no longer wears the
carry-marker meant for haulers.

**The drill yard leaves the claims and becomes THE TRAINING GROUND.** `9240479c` (F-BW-5)
It stops being a thing on a map and becomes a place you go. **And it now says what it lends** —
`a04ea810`: the yard names what it offers, the bell names what it calls, and the straw men answer every
time.

**The braid reads as a river.** `4db6254d` (F-BW-13) · `c031ae96` (F-BW-7)
Twin Banks' channels stop reading as plastic planks, and painted water now ends exactly where the sim's
water ends — the shoreline you see is the shoreline you wade.

**The town burns flame, never electricity.** `5214f340`
E1's lights derive from an era grammar rather than from whatever looked bright, so a frontier town cannot
accidentally light itself like a garage. Nearby, the Elder and the Assay Clerk stepped clear of the
buildings they were standing inside (`3987c8f7`, owner playtest).

**Gold is coins, not floats.** `af506002` (F-BW-12)
Quantized end to end. A ledger that shows you `12.999999` is a ledger you stop trusting.

**The boss bar stops dancing.** `f790c09f` (F-BW-17) — and **the mill site explains the horizon**
(`d093dbc5`, F-BW-15), and **the dark keeps its fear while the ground keeps its shape** (`a20055db`).

**The Gazette learns which finger does what.** `4091d0ef` (gg-04)
Owner playtest, verbatim: *"the players have to understand which buttons to press to do what"*. Panel 7,
THE PROSPECTOR'S HANDS, renders the keyboard set on desktop and the touch names on mobile — and derives
every one from the same binding table the input controller now reads, so the card cannot drift from the
controls it documents.

**Two ghosts evicted.** `08e317d7` · `af463bd9` (F-BW-6)
A legacy save no longer resurrects the removed Territory I ring, and the ring's replacement — the palisade
kit — grants its row correctly at tier zero.

## What the Prospector's own sim learned

**Twin Banks and the Baron join the headless bench.** `2c22b2ab` · `1a4831df` · `cf005d59`
Driver four of five re-lands, the Baron's re-land carries the component-boss secure predicate — the sim
now withholds auto-secure until the Baron is actually beaten, matching the game — and a guard closes the
branch behind it.

**One less allocation per frame, on the render side only.** `d60adf88` (F-BW-11)
An E1 render-allocation pass, with its own spec deliberately withheld rather than shipped unproved.

## What the factory did to itself (18 merges, no player surface)

The concurrency harness was found to be measuring the wrong thing and repaired (`08ec76b5`), then
**guarded against the two decisions that had stayed green under deletion** (`e94bfd40`) — a test that
passes when you delete the thing it tests is not a test. `lane-absorbed-lines` stopped shrugging at
content absent from the base (`3233415c`), the usage census was anchored to the real repo root
(`b85c3e3d`), and `lane-usable` learned to narrow its reassurance when `tasks/` has drifted (`eef64eeb`).
Malformed janitor requests now **fail visibly instead of being filed as successes** (`2921d2ce`). Twice
more, law pointers into shifting code were re-based by reading rather than by arithmetic (`5bda0ce0`), and
`fire.md` §2E gained the dispatch-order law (`03891635`).

## One commit that looked like a catastrophe and was not

`bb23d766` is a **handoff** commit — pure bookkeeping by its headline — and it carries **625 changed lines
of `src/world/Water.ts`**, landing four minutes after the Twin Banks beauty drain touched the same file.
That is the exact signature of the s1294 hazard: a broad `git add` sweeping a stale working copy over work
that landed minutes earlier. The first read of the diff supported it — the twin-banks braid rationale,
the ribbon constants and a shader cache key all appeared as deletions.

**It was wrong, and the correction is the point.** Probed against main today: `RIBBON_EDGE_FADE_METRES`,
`RIBBON_FOAM_INSET_METRES` and `RIBBON_TINT` are all present and in use at nine sites — the fade constant
since **tuned from 0.34 to 0.18** by the F-BW-13 water pass, which can only happen to a value that
survived. The removed cache key was the **narrower of two** assignments to the same property, and the
wider array-form key that outlived it carries strictly more of the config. Nothing was lost; the commit
resolved a duplication rather than causing one.

**What remains true anyway:** 625 lines of player-visible shader churn rode into main under a headline
that announced a handoff, where no reviewer would think to look. The outcome was benign and the practice
is not — a sweep is invisible precisely when it is harmless, which is why it is still there the day it
isn't. **The digest's own lesson, turned on the digest:** four days of watching headlines lie about
content made a lie the obvious hypothesis, and the obvious hypothesis was false. The probe that settled it
was reading the constants on main, not reading the diff harder.
