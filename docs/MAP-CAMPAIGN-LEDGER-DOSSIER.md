# THE SURVEYOR'S DOSSIER — 25 campaign maps, probed for the owner's verdict evening

**Status:** MEASURED 2026-08-06 (milk shift `milk/surveyors-dossier`) · every number below was taken from a live boot of this tree, not inherited.
**Companion to:** [`MAP-CAMPAIGN-LEDGER.md`](MAP-CAMPAIGN-LEDGER.md) — that file holds the campaign's four build columns and the OWNER VERDICT column. This one exists to make each of those verdicts cost one look.
**Your bargain, verbatim (2026-07-17):** *"I want to greenlight all of these 27 maps. Lets build them as quickly as possible - I will have to test them all!"* — and in the ledger header, *"the last column is yours — verdict in one word, I file the rest."*

---

## READ THIS FIRST — 13 OF THE 25 MAPS WILL NOT OPEN, SO THERE IS NOTHING TO VERDICT ON THEM TONIGHT

The ledger and the `F-1368-1` desk row both tell you the campaign is finished and waiting on you. **The build columns they measured are true. The conclusion drawn from them is not.**

I booted all 25 wired campaign maps. **12 opened. 13 were refused at the door by the game itself**, which falls back to The Claim and prints its own reason in the briefing: *"&lt;Name&gt; is not ready for a direct claim; The Claim opened instead."*

The rule is one line of product code, and it is not a bug:

> `src/meta/ContractFamilies.ts:1328` — `else if (requested.tileParams.harvestAnchors?.length === 0) { fallbackReason = 'unavailable-contract'; }`

A map with **zero harvest anchors** has nothing to mine, so the game correctly declines to open it as a claim. Thirteen campaign contracts declare `harvestAnchors: []`.

**Why nobody caught it:** every gate that could have measures something adjacent.
- `docs/MAP-CAMPAIGN-LEDGER.md` derives `wired` from *"the map key is present in the `Terrain3dClaimPilot.ts` registry"*. All 25 are. But that registry is the **renderer's**, not the **door's** — they are different gates, and only the door decides whether you can play.
- `e2e/map-census.spec.ts:279` exempts any contract with no harvest anchors (`isAvailable`). Its last artifact, `artifacts/map-census/table.md`, shows **15 of 42 rows exempt on every single column** — and still prints `Census-closed: MQ-1, MQ-3`. An exemption reads exactly like a pass.
- `e2e/terrain3d-registry.spec.ts` proves all 25 mount their assets — by installing the pilot into a **detached scene**, never through the door.
- The mechanism *was* seen, twice, per-era: `docs/bench/e7-readiness-census.md` and `e5-readiness-census.md` both say these maps *"remain unavailable because `harvestAnchors: []`"*. **Nobody totalled it across the campaign, and no owner-facing document mentions it.** The two documents that know are era-scoped census reports; the one you read says all 25 are ready.

**This is the F-1368-1 shape again, pointing the other way.** That finding caught the ledger *under*-claiming and repaired it. The repair was honest about what it measured — and the columns it measured cannot see this.

> ⚠️ **The sibling ledger is NOT edited by this shift.** `docs/MAP-CAMPAIGN-LEDGER.md` still presents all 25 rows as awaiting only your verdict, and its four build columns remain correct as defined. Editing it is outside this shift's firewall, so the correction lives here instead. **The follow-up that shift did not have authority to do: add an `opens?` column to that ledger, derived from the door and not from the registry** — otherwise the next reader repeats the inference.

---

## WHAT YOUR EVENING ACTUALLY LOOKS LIKE

| what you can do | how many | which |
|---|---|---|
| ✅ **Full verdict** — plays and looks finished | **3** | Blackout Ridge · Moth Season · The Showroom |
| 🎨 **Look-verdict only** — walk it and judge the ground, art and mood; its signature mechanic is not built yet | **8** | The Trestle · The Pressure Garden · The Incline · The Fairground · The Long Road · Gusher County · The Boneyard · The Eclipse |
| 👀 **Look again** — opens, but something measurable is off | **1** | Stillwater (0 of 4 landmarks render) |
| 🚫 **Nothing to verdict** — the door will not open it | **13** | Flotilla · Regatta · Half-Life Hollow · Picnic · Echo Canyon · Dead Band · Relay Rush · Far Side · Low Orbit · Seed Run · Devil's Alley · Old Canal · Archive World |

**A "look-verdict" is still worth giving.** Eight of these maps are finished ground with finished dressing and no mechanic behind them yet. Your word on whether the *place* is right is exactly the feedback that is cheapest to act on now and most expensive to act on after the mechanic lands on top of it.

---

## THE TABLE

Two independent columns decide what a verdict means, and they do **not** move together — `The Eclipse` declares a missing mechanic and still opens; `The Picnic` declares nothing missing and is refused.

- **opens?** — did the contract door admit it, measured live via `__GR_CONTRACT_REGISTRY__.activeContractDiagnostics()`.
- **its mechanic** — does the map's signature system exist, from its own `tileParams.engineDependencies` declaration. ⚪ *undeclared* is **not** the same as ready: `F-1480-2` found that a contract with no such field reads as more finished than its honest siblings.
- **terrain / relief** — triangles mounted, and the vertical range the ground actually has, sampled at 121 stations through the render-side height source the eye reads (`terrainVisualY`), not the contract's promise.
- **landmarks** — mounted / expected, from the running pilot.
- **dressing** — whether the landmarks it mounts are its **own** pack or the **host** map's.
- **shot** — *spawn* is the shipped camera where you start. *landmark* is the same camera walked to the map's first landmark, because on most maps the spawn view does not contain the thing the map is named for.

| era | map | opens? | its mechanic | terrain | relief | landmarks | dressing | look-flag | shot | FACTORY SAYS | OWNER VERDICT |
|---|---|---|---|---|---|---|---|---|---|---|---|
| E2 | **The Trestle** | ✅ yes | 🟠 missing: `elevation-advisory-fields` | 32,768 tri | 2.054 m | 6/6 | own | — none | [spawn](../reviews/shots-campaign-dossier/e2-trestle.png) · [landmark](../reviews/shots-campaign-dossier/e2-trestle-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E2 | **The Pressure Garden** | ✅ yes | 🟠 missing: `elevation-advisory-fields` | 32,768 tri | 2.792 m | 5/5 | own | — none | [spawn](../reviews/shots-campaign-dossier/e2-pressure-garden.png) · [landmark](../reviews/shots-campaign-dossier/e2-pressure-garden-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E2 | **The Incline** | ✅ yes | 🟠 missing: `elevation-advisory-fields` | 32,768 tri | 4.324 m | 5/5 | own | — none | [spawn](../reviews/shots-campaign-dossier/e2-incline.png) · [landmark](../reviews/shots-campaign-dossier/e2-incline-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E3 | **Blackout Ridge** | ✅ yes | ⚪ *undeclared* | 32,768 tri | 7.327 m | 5/5 | own | — none | [spawn](../reviews/shots-campaign-dossier/e3-blackout-ridge.png) · [landmark](../reviews/shots-campaign-dossier/e3-blackout-ridge-landmark.png) | ✅ **SHIP-SHAPE** — plays and looks finished | — |
| E3 | **The Fairground** | ✅ yes | 🟠 missing: `fairground-crowd-flock-consumer` | 32,768 tri | 4.651 m | 5/5 | own | — none | [spawn](../reviews/shots-campaign-dossier/e3-fairground.png) · [landmark](../reviews/shots-campaign-dossier/e3-fairground-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E3 | **Moth Season** | ✅ yes | ⚪ *undeclared* | 32,768 tri | 3.659 m | 5/5 | own | — none | [spawn](../reviews/shots-campaign-dossier/e3-moth-season.png) · [landmark](../reviews/shots-campaign-dossier/e3-moth-season-landmark.png) | ✅ **SHIP-SHAPE** — plays and looks finished | — |
| E4 | **The Long Road** | ✅ yes | 🟠 missing: `convoy-claim-consumer` | 32,768 tri | 1.671 m | 5/5 | own | — none | [spawn](../reviews/shots-campaign-dossier/e4-long-road.png) · [landmark](../reviews/shots-campaign-dossier/e4-long-road-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E4 | **Gusher County** | ✅ yes | 🟠 missing: `wild-derrick-consumer` | 32,768 tri | 0.747 m | 10/10 | own | — none | [spawn](../reviews/shots-campaign-dossier/e4-gusher-county.png) · [landmark](../reviews/shots-campaign-dossier/e4-gusher-county-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E4 | **The Boneyard** | ✅ yes | 🟠 missing: `salvage-race-consumer` | 32,768 tri | 1.354 m | 12/12 | own | — none | [spawn](../reviews/shots-campaign-dossier/e4-boneyard.png) · [landmark](../reviews/shots-campaign-dossier/e4-boneyard-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E5 | **The Flotilla** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `distributed-base-consumer` | — | — | — | — | **0 harvest anchors** | [host sculpt](../reviews/shots-campaign-dossier/e5-deepwater-claim.png) | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E5 | **Stillwater** | ✅ yes | 🟠 missing: `noise-hunt-consumer` | 32,768 tri | 5.4 m | 0/4 | — | landmarks short (0/4); landmarks skipped (4× asset unavailable) | [spawn](../reviews/shots-campaign-dossier/e5-stillwater.png) | 👀 **LOOK AGAIN** — landmarks short, landmarks skipped | — |
| E5 | **The Regatta** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `regatta-race-consumer` | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E6 | **The Showroom** | ✅ yes | ⚪ *undeclared* | 32,768 tri | 1.801 m | 5/5 | own | — none | [spawn](../reviews/shots-campaign-dossier/e6-showroom.png) · [landmark](../reviews/shots-campaign-dossier/e6-showroom-landmark.png) | ✅ **SHIP-SHAPE** — plays and looks finished | — |
| E6 | **Half-Life Hollow** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | ⚪ *undeclared* | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E6 | **The Picnic** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | ⚪ *undeclared* | — | — | — | — | **0 harvest anchors** | [host sculpt](../reviews/shots-campaign-dossier/e6-glow-mesa.png) | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E7 | **Echo Canyon** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `broadcast-mirror-consumer` | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E7 | **The Dead Band** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `signal-suppression-consumer` | — | — | — | — | **0 harvest anchors** | [host sculpt](../reviews/shots-campaign-dossier/e7-relay-valley.png) | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E7 | **Relay Rush** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `interference-front-consumer` | — | — | — | — | **0 harvest anchors** | [host sculpt](../reviews/shots-campaign-dossier/e7-relay-valley.png) | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E8 | **The Far Side** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `far-side-contract-consumers` | — | — | — | — | **0 harvest anchors** | [host sculpt](../reviews/shots-campaign-dossier/e8-mare-claim.png) | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E8 | **Low Orbit** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `low-orbit-contract-consumers` | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E8 | **The Eclipse** | ✅ yes | 🟠 missing: `eclipse-contract-consumers` | 32,768 tri | 7.386 m | 5/5 | host (0/5 own) | — none | [spawn](../reviews/shots-campaign-dossier/e8-eclipse.png) · [landmark](../reviews/shots-campaign-dossier/e8-eclipse-landmark.png) | 🎨 **LOOK ONLY** — walkable and clean; its mechanic is not built yet | — |
| E9 | **The Seed Run** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `persistent-planting-consumer` | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E9 | **Devil's Alley** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `scheduled-relocation-consumer` | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E9 | **The Old Canal** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `persistent-canal-choice-consumer` | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |
| E10 | **The Archive World** | ❌ **no** — `unavailable-contract`; opens *the-claim* instead | 🟠 missing: `archive-world-consumers` | — | — | — | — | **0 harvest anchors** | — | 🚫 **NOTHING TO VERDICT** — the door will not open it | — |

<!-- derived from 29 probed boots: 25 campaign rows — 3 ship-shape, 9 look-only/look-again, 13 refused by the door, 0 broken -->

---

## FINDINGS

### 🔺 F-MSD-1 — the campaign's owner ask is 52% impossible, and the ledger says the opposite. **OWNER'S DESK.**
**Measured:** 13 of 25 wired campaign maps declare `harvestAnchors: []` and are refused by `ContractFamilies.ts:1328`; the game opens The Claim instead. Confirmed three independent ways — the source predicate, a live `fallbackReason: 'unavailable-contract'` on all 13, and the factory's own `artifacts/map-census/table.md` (15 of 42 rows exempt on every column).
**Cost:** the single largest owner ask on the board (`F-1368-1` desk row, `BACKLOG:2872`) asks for 25 verdicts. Twelve are possible.
**Not new to the factory, new to the desk:** the E5 and E7 census docs each recorded the mechanism for their own era. No document joins it to the 25-map ask, and no owner-facing document mentions harvest anchors at all.
**GATE: OWNER — one ruling, and it is a scope question, not a bug report.** Opening a map is a small data edit (`harvestAnchors` is a list of `{x, z}`; `The Eclipse` has six and opens, `Low Orbit` has zero and does not — the two contracts are otherwise structurally alike). But *placing* gold veins on a map is a design act, and for 11 of the 13 the map's signature mechanic is also unbuilt, so anchors alone would make them **openable but not the map you greenlit**. The three options, cheapest first:
- **(a) Do nothing yet** — verdict the 12 that open; the 13 come back when their mechanics land. Zero risk.
- **(b) Anchors-only pass on the 2 that declare nothing missing** (Half-Life Hollow, The Picnic) — smallest possible slice, makes 2 more maps walkable tonight-ish. ⚠️ *Undeclared is not proof that nothing is missing (F-1480-2); the first act of that task must be to probe for an undeclared consumer.*
- **(c) Anchors on all 13** — you could walk every map, but 11 would play as generic claims wearing the right scenery, which is a worse basis for a verdict than not playing them at all. **I do not recommend this**, and I would want your word before any fire did it.
**RECOMMENDED: (a), plus the ledger correction this shift already landed.**

### 🟡 F-MSD-2 — five reuse maps ship 25 bespoke landmarks the game can never mount, and the ledger counts them as present.
**Measured:** The Picnic, The Dead Band, Relay Rush, The Far Side and The Eclipse each ship a populated `landmarks/<slug>/` pack (5 `.glb` each, 25 total), and each pack **is** referenced by that map's own `-terrain-contract.json`. But the registry hands these maps the **host** contract (`e0052c6e`, the reuse ruling), so the file naming their landmarks is never loaded. Proven live on The Eclipse — the only one of the five the door opens: it mounts `earthrise-listening-array, lava-tube-survey-gantry, regolith-core-yard, west-rim-debris-catcher, east-rim-debris-catcher` (Mare Claim's) while its own `eclipse-shadow-dial`, `launch-shadow-gate` and two `solar-witness` bodies sit unused on disk.
**Why it reads as done:** `MAP-CAMPAIGN-LEDGER.md:5` derives the `landmarks` column from *"a populated pack under `landmarks/<slug>/`"* — file presence, not mounts. True on disk, false in the game. This is how `THE GREAT LANDMARK BACKLOG` (`BACKLOG:1835-1840`) closed on these five: the packs landed, the mount records were filled in, and they landed in the one file these maps never read.
**GATE: OWNER, one word — the reuse ruling was written about the *sculpt* (*"keeps the caprock sculpt and changes campaign rules only"*). Was it meant to cover the *dressing* too?** If yes, the 25 bodies are deliberate spares and the ledger column needs a footnote. If no, these five maps are each missing their own identity, and it is a small wiring slice per map. **I did not touch it either way.** Note that the standing prohibition at `MAP-CAMPAIGN-LEDGER.md:40` is narrower than this question — verbatim, *"Do not 'fix' a reuse mount **into a fresh sculpt** without an owner ruling; the reuse IS the ruling."* It forbids re-sculpting; it says nothing about dressing. That silence is why this is a question for you rather than a rule I can look up.

### 🟢 F-MSD-3 — the E5 Deepwater drowned town still renders nothing, three weeks after it was filed. **Not a new finding; a liveness check on an old one.**
**Measured:** `e5-deepwater-claim` and `e5-stillwater` both report `landmarks 0/4`, `skipped 4`, diagnostics verbatim: `drowned-claim-office: asset unavailable; drowned-chapel: asset unavailable; drowned-general-store: asset unavailable; drowned-stamp-mill: asset unavailable`. All four GLBs exist (1.38–1.58 MB each); the contract points at `assets/pilots/claim-office-3d/…`, which sits **outside** the pilot's `map-rebuild-spike/landmarks/**` glob, so no mount can resolve. This is the only contract of 37 using that path form.
**Already filed** at `BACKLOG:1712` as F-3, root cause named identically, *"Needs its own corrective."* I found no such corrective on the board. Stillwater is the visible cost: it renders as bare olive seabed (`reviews/shots-campaign-dossier/e5-stillwater.png`).
**INFERRED, not measured:** `e2e/terrain3d-registry.spec.ts:219-220` asserts `landmarks === 4` and `landmark-skipped === 0` for this contract, so that suite should be red on it. I did not run it — out of this shift's scope. Stated as an inference.
**NOTE for the DEEPWATER SURGERY shift (`milk/*`, `BACKLOG:3033`):** this is your neighbourhood, not mine. I measured and did not touch.

---

## METHOD, AND WHAT WOULD FALSIFY IT

- **Probe:** `scripts/campaign-map-dossier.mjs` (read-only). Boot recipe lifted **verbatim** from `e2e/map-census.spec.ts:94-100` so this probe and the house gate agree on what "booted" means: same query string, same `__GR_TEST__` + `frame > 10` wait, same briefing dismissal, same pilot-state wait, same door check.
- **Table:** `scripts/campaign-map-dossier-table.mjs`. Every verdict is a stated predicate over a measured number (see its `RULES`), so the **rule** can be argued with rather than a mood.
- **Run:** 29 boots (25 campaign + 4 hosts), 1280×800, Chromium headless, vite dev server on a scratch port owned by this worktree (`resolveBase` proves the listener's cwd). Median boot **18.5 s**. **Zero console errors and zero page errors across all 29** — nothing here is a crash report.
- **Raw evidence:** `artifacts/campaign-dossier/probe.json` (every dataset attribute, relief sample, frame histogram and diagnostic string per map) · 30 screenshots in `reviews/shots-campaign-dossier/`.
- **The screenshots are of the shipped camera**, in the game's own render path, with the debug HUD present because `?debug` is what installs the diagnostics API. They are **not** beauty renders and should not be judged as such.
- **Two things I deliberately did not do.** I did not photograph any refused map: the pilot mounts `activeContract.id` (`Game.ts:1741`), so a shot taken after a fallback is a picture of The Claim wearing another map's name, and a mislabelled shot in a dossier is worse than a missing one. Where a refused map reuses a host sculpt, the table links the **host**, labelled as the host. And I did not fill in a single `OWNER VERDICT` cell.
- **What would falsify the headline:** find any route that opens one of the 13 with its own terrain. I looked for one — board launch, staged launch, saga flagship and replay all reach the same `harvestAnchors` test at `ContractFamilies.ts:1328`, and the editor route substitutes a document rather than lifting the gate. If such a route exists, F-MSD-1 is wrong and I would want to know.

## FOOTNOTES

- **The Fairground and Moth Season declare no `harvestAnchors` field at all** (`undefined`, not `[]`). The door admits them — `?.length === 0` is false for undefined — and `Terrain.ts:167` then falls back to `DEFAULT_NODE_ANCHORS`. So both open and play, but with the **default** vein layout rather than one authored for their ground. Not measured as harmful; flagged because it is invisible in every column.
- **Gusher County has the flattest ground in the campaign** (0.747 m of relief against a 0.75–7.39 m range). Below the house floor of 0.3 m it would be flagged; it is above it. Mentioned only because a derrick field reading flat may or may not be the intent.
