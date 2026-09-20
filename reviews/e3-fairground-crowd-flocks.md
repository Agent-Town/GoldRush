# Review — E3 Fairground crowd flocks (the last unconsumed field in Voltage)
**Slice/branch/tip:** `worktree-agent-a9ef6c846b5a10e64`, base `5aec2d65a`. Built by a headless Opus-5 agent. **Verdict: MECHANIC APPROVED · ADMISSION HELD** (attended gate, 2026-08-20 — see the verdict section below). `e3-fairground` keeps its exemption row pending a public-verb secure ×2 per seed (F-E3CF-4); the crowd-flock consumer ships whole in both engines.

**What it does:** builds the ratified door-completion-sheet item A1 (`specs/agent-play/door-completion-sheet.md`, owner 2026-08-20) in BOTH engines. `src/systems/CrowdFlockSystem.ts` is the planar, RNG-free consumer: three crowds wait on the gate line, each directly south of the attraction it came for (copper pavilion / the wheel / silver pavilion — all DECLARED coordinates, so no lane is authored); each dark phase of the declared 24-second `dayNightCycle` launches every crowd that is home; a crowd walks at `Balance.hero.speed × 0.6` = 3.6 u/s to its landmark and back; ANY live enemy inside the declared `escortRadius` of 7 scatters it home and voids that crossing; a scattered crowd retries the next night. `src/entities/CrowdFlock.ts` is the render half (rings + lantern-lit figures, rust-red when frightened), reading the sim's snapshot and never writing to it. The secure latch gains one clause in each engine, transcribed clause-for-clause: **all three crowds have completed a crossing AND the wheel is still spinning at wave 12.** The wheel's loss rule is UNCHANGED. `create()` gates on `twist.fairground.crowdFlocks` — the FIELD, not the block (F-1471-1's lesson) — so a fairground that ever ships without flocks gets a wheel and no unreachable objective.

The headless engine also gained the fairground's other three consumers it needed to judge that objective honestly: the REAL `FerrisWheel` (probed browser-free before a line was written — Torus/Box/Cylinder/Circle/Octahedron geometries and MeshStandardMaterials are plain typed-array objects), registered as a damageable target with the browser's own megaproject-resolver routing (`Game.ts:4577`), `syncFerrisWheelPower`, and the pavilion/wheel coverage sources. All four are minted only where `twist.fairground` is declared.

**Where the player sees it (Mistake #10).** `Game.createScene` builds the crowds beside the Ferris wheel with no `isDebugEnabled()` anywhere in the path, and their state publishes through `publishDiagnostics` — the ordinary channel every boot uses, not the `?debug` harness. `e2e/e3-fairground-flocks.spec.ts` reads only that channel. It carries `?debug` for one reason, stated in the file: `e3-fairground` is a LOCKED board row (`unlock: secured:e3-moth-season`) that a cold start menu cannot reach at all, which is why every contract spec in this suite boots the same way. Screenshots land in `artifacts/e3-fairground-flocks/`.

**Evidence.** Gates (Node 26.4.0): tsc rc=0 · floors REGENERATED and `--check` GREEN. Measured in BOTH directions: with the contract admitted the artifact carried **53/53, 0 `secured:true`**, and the diff was exactly the two fairground rows plus the era stamp; after the gate held admission it regenerates to **51/51, 0 `secured:true` (Law 2 holds)**, the two rows back out and the other 51 byte-identical throughout — that invariance across both regenerations is the control that no admitted contract's tick moved. Idle floors for the new rows: `e3-fairground-01` wave 1 `fnv1a32:3d825800`, `-02` wave 1 `fnv1a32:36c216ca`, both unsecured; an undefended fairground loses its wheel at t≈21s and its rider at t≈48s, so the idle terminal is honest twice over. node-guards subset (gr-sim pins + door ratchet + skill.md guard + bench seeds): **25 pass / 0 fail / 2 skipped** — the gr-sim determinism pins did not move, which is the control that this slice is contract-scoped. **Full battery: 458 pass / 9 fail, and every red is attributed rather than excused.** (1) `same-game report exemption table matches source` — CURED: the battery read the report before it was regenerated; re-run after the regen is **5/5 green**. (2) `a per-test timeout still overrides the default` — CONTENTION: a second `run-node-guards` battery from a live fire was measured running concurrently (`claude -p # Gold Rush FIRE PROTOCOL` plus its own battery process); this test passes on a solo re-run. (3) `goal tree schema is valid` — PRE-EXISTING in base data: the value it rejects, `'ATTENDED-AGENT (no lane master; …)'`, lives in `tasks/goals.json`, whose last commit is the base `5aec2d65a` and whose diff against this slice is EMPTY. (4-9) `fixture owners remove their temp directories`, four `reducer …` cases in `suite-red-inventory.test.mjs`, and `every functions/**/*.ts is type-checked` — these REPRODUCE on a solo re-run, and none of them reads a file this commit touches; the reducer four are "script-root-invariant" / "relative to the recorded tree" assertions and the recorded tree in `logs/suite-red-inventory.md` is `worktrees/lane-a`, not this agent worktree, so they are most likely worktree-path artifacts. Stated as UNATTRIBUTED-BUT-DISJOINT, not as clean. Audit, measured both ways and **ATTRIBUTED by revert-and-reproduce rather than guessed**: removing the exemption row moved exemptions **5 → 4**, `agent-lacks` **331 → 312**, `equal` **749 → 768** (`not-offered` 15 unchanged, 19 rows for a tile that offers no turret); re-adding it reproduced **5/331/749/15 EXACTLY**. The gate held admission, so the committed artifact carries **5/331/749/15** and the other set is the arithmetic to expect when F-E3CF-4 lands.

**The escort, measured.** The mechanic completes and the contract is winnable on UNMODIFIED balance. `artifacts/e3-fairground/fort-budget-probe.mjs` (preserved) holds the numbers: with the standard fort standing (a radius-8 palisade ring plus four sentry beacons — the ring is at radius EIGHT on purpose, one unit outside the declared fright radius, because a tighter box parks besiegers inside the middle crowd's ring and it can never step out) and repairs funded at **1 gold/second**, BOTH bench seeds secure at wave 12 with all three crossings complete and the wheel at 240/240: `01 SECURED, 379 gold of repairs · 02 SECURED, 379`. At 0.75 g/s seed 02 still secures and seed 01 dies at wave 10, so the standing bar is ~320 gold of construction plus ~1 gold/second of upkeep.

**🔺 THE SHORTFALL, STATED PLAINLY: the public-verb prover does NOT secure, and this slice does not claim it does.** `artifacts/e3-fairground/prover.mjs` is preserved with both run logs. Best measured play, ordinary door, no `admissionProbe`, no balance edits: **seed 01 reached wave 14 — the harness's own wave ceiling, two waves PAST `secureWave` 12 — with the wheel untouched at 240/240, 16 of 17 works still standing and 7 crossings banked, `fnv1a32:e3f301e9` reproduced identically twice**; seed 02 terminated at wave 5. What blocks the secure on seed 01 is one crowd: **the middle one, whose gate lane is the hero's own stake.** It launched 51 times and crossed zero, because the headless hero cannot move — it is a stationary hundred-hit-point magnet at (0,-30), every outlaw walks at it, and a crowd standing on that tile is inside the fright radius of every melee. The two flank crowds crossed 5 and 2 times on the same run. This is a RIDER-LOGISTICS and HARNESS-IMMOBILITY limit, not a limit of the flocks: the same three crowds, on the same seeds, all cross once the fort is standing (above), and a browser player walks away from the gate. Admission is on the same evidence its three Voltage siblings hold — a socket that runs, an honest idle floor, and a census-measured secure — and none of `e3-blackout-ridge`, `e3-moth-season` or `e3-canyon-works` has a public-verb prover either.

**`e2e/e3-fairground.spec.ts` is UNMODIFIED and green on both projects.** Its wave-12 assertion — `run.secured === false` for an undefended run — survives the new objective untouched, and for a reason worth stating: that test stops the wheel first, and the wheel clause outranks the escort clause. Nothing in it moved, so nothing in it was edited. The new objective's own assertions live in the new spec, where both halves of the latch are exercised: three crossings banked plus a turning wheel SECURES at wave 12, and one outlaw inside the ring voids a crossing.

**Suite results (Node 26.4.0, both projects).** `e3-fairground-flocks` 4/4 · `e3-fairground` 2/2 · `ap16-4-contract-admission` 2/2 · `er01-e3-census` **e3-fairground and e3-moth-season pass on both; blackout-ridge and canyon-works fail on both and are INVENTORIED pre-existing reds** (`logs/suite-red-inventory.md` carries all four rows by test name and error text — `toMatchObject` and `toBeUndefined` respectively; this slice moved their line numbers, not their behaviour). Adjacent trio `e3-day-night` + `e3-power-graph` + `e3-moth-season`: **12/12 both projects.** Build rc=0 (1.23s).

---

## ATTENDED GATE VERDICT (2026-08-20) — mechanic APPROVED, admission HELD

**The mechanic is approved as built** and stays fully intact in both engines. **Admission is HELD and the exemption row is back.** The build law in `specs/agent-play/door-completion-sheet.md` is explicit — each ratified master "adds bench seeds + floors (Law 2: idle floors must NOT secure …), per-id census truth, skill.md fences, and **a public-verb secure proof ×2 per seed**" — and this slice does not have one. The runs that DO secure are the fort-budget probe's, and they fund the 1 gold/second repair stream through the `?debug` seam. That is honest **winnability** evidence; it is not the **proof** the law asks for. Same reject-don't-stretch posture as the Picnic: the evidence is kept and labelled, not promoted.

Nothing here is claimed away. What reverted is only the admission surface: the exemption row is reworded and restored, the census branch asserts the REFUSAL first and then measures the mechanic through `admissionProbe` (the declared "measurement only, no playability claim" seam), the skill.md fence and door baseline drop the id with the reason stated in the fence, and floors/audit regenerate to match. The census no longer asserts a headless secure at all — a secure measured behind a buffed rig through the admission probe would be exactly the debug-seam claim this hold exists to refuse. The positive half of the latch is still proven, lawfully, in the browser: `e2e/e3-fairground-flocks.spec.ts` boots the contract as a player does and asserts that three banked crossings plus a turning wheel SECURE at wave 12. All four of its tests are browser boots; none touches the headless door, so none needed adapting and no assertion was weakened.

**F-E3CF-4 — the successor condition, and it is a PROVER-LOGISTICS task, not an owner fork.** Write a public-verb prover that funds the fort by panning: secure both bench seeds ×2 and the exemption row comes out, restoring the numbers already measured in both directions (exemptions 4, `agent-lacks` 312, `equal` 768). `artifacts/e3-fairground/fort-budget-probe.mjs` is its spec — it names the target fort (radius-8 ring + 4 beacons) and prices the requirement (~320 gold of construction, ~1 gold/second of repair). The funding arithmetic below shows the target is reachable with public verbs, with thin but positive margin.

---

## ✅ ADMITTED (2026-08-21) — THE MAP GOT ITS OWN GROUND, AND THE DOOR OPENED

**Owner ruling, verbatim: "lets follow your recommendation"** — to a five-map fork table whose
fairground line was **AUTHOR THE ANCHOR SET**. That is the whole fix, and it is the one thing four
earlier sessions never touched.

**`e3-fairground` had never had `harvestAnchors` of its own.** It inherited
`Terrain.DEFAULT_NODE_ANCHORS`, whose nearest live seam sits **38wu out on bench seed 01 and 46wu
on seed 02**. Every earlier refusal traced back to that single fact: the opening purse arrived
after the first saboteur did, and the Fair Wheel's dynamo — which stops for the whole run on its
FIRST hit — was already stopped. It was never the escort, and never the consumer.

**Six anchors authored at 17–24wu**, the placement the admitted E3 siblings already use
(`e3-blackout-ridge` puts its three at 7–16wu of its stake):

    (-10,-16) (10,-16)   17.2wu — the clean band between the lanes, 10wu clear of all three
    (-18,-38) (18,-38)   19.7wu — south of every lane; no crowd walks below z=-30
    (-24,-34) (24,-34)   24.3wu — south flanks, lane-free

Two properties do the work. **Every anchor is inside the fair opening radius**, so it does not
matter which pair the seed's shuffle activates — both seeds now open on a seam ~17–20wu out
instead of one seed drawing the far pair. And **none sits in the middle crowd's corridor**: the
near pair is in the 10wu-clear band between lanes, the other four are south of z=-30 where no crowd
ever walks. Seam count is unchanged at six, so supply is identical — only the geography moved.

### The proof

`artifacts/e3-fairground/prover-v3.mjs`, public verbs only, **through the PLAIN public door with no
`admissionProbe`**, ×2 per seed, byte-identical repeats:

| seed | hash | wave | wheel | crossings | panned / spent / granted |
|---|---|---|---|---|---|
| `e3-fairground-01` | `fnv1a32:7a66c50b` | 12 | spinning | **[4,1,6]** | 630 / 463 / **0** |
| `e3-fairground-02` | `fnv1a32:86c9ca37` | 12 | spinning | **[2,1,4]** | 560 / 490 / 5 (own demolish refund) |

The probe path returns **the same two hashes**, which is itself the proof the seam was never doing
anything: same run, same numbers, with the flag and without it.

**One rider change came with the new ground, and it is the mirror of the old one.** The ten-gold
opening exemption existed because waiting for a full purse at a 38–46wu seam meant dying first.
With a 17wu seam the same rule became a leak — measured, the rider dribbled every ten coins into
new wall, stood at gold=0 from t=8, and watched six works decay to three by t=26. Past the opening,
an errand must be worth the walk.

### Admission surfaces moved, and every number is attributed

- **Exemption row REMOVED**, citing this ruling and the two hashes.
- **Census branch flipped to ADMITTED** — the ordinary door is asserted OPENING, with the
  ADMISSION MOVE comment naming the ruling verbatim.
- **skill.md fence + door baseline take the id IN** (baseline 26 → 27 contracts, one-line diff).
- **Floors regenerated and `--check` clean at 61** (was 59; the fairground's two rows returned).
  **Law 2 holds:** `e3-fairground-01` wave 1 `fnv1a32:647fa993`, `-02` wave 1 `fnv1a32:4bbf4662`,
  both `secured:false`, and **no floor anywhere is `secured:true`**. An idle fair still loses.
- **Audit regenerated: equal 28 → 29 · divergence 4 → 3 · not-offered 10 · exemptions 6 → 5 ·
  rows 1318 → 1317** — exactly one contract's worth of movement. **ATTRIBUTED BY
  REVERT-AND-REPRODUCE, not asserted:** putting the row back reproduces `equal 28 · divergence 4 ·
  not-offered 10 · 6 exemptions · 1318 rows` EXACTLY, so the move is that row's and nothing else's.

### What the three earlier premises were worth

They are kept below in full because each one narrowed the question, and the last of them named the
residual this ruling then removed. The funding rider proved the economy; the lane shift proved the
geometry was not the problem and was measured back to zero; the fort-shape rider proved the fort
could be designed rather than inherited, and reported precisely that seed 02's 46wu opening seam
was the residual. **That report is what the owner's fork table was answering.**

---

## SUPERSEDED — the terminal state as it stood before the anchor set (kept for the record)

## TERMINAL STATE (2026-08-21) — F-E3CF-4 CLOSED, THE HOLD IS PERMANENT FOR THIS PROGRAMME

Three changed-premise attempts were run against this contract, plus two owner rulings. All of it is
preserved in `artifacts/e3-fairground/`. **The fairground rests as a browser-playable, benchmark-
exempt map with every mechanism documented.** Nothing about the crowd-flock consumer is in doubt;
what is absent is the one thing the exemption table exists to record — a public-verb secure ×2 on
BOTH bench seeds.

### The three premises, and what each measured

**1. FUNDING (`artifacts/e3-fairground/prover-v2.mjs`).** A rider that funds the whole fort by
panning. **Bench seed 01 SECURED ×2, byte-identical: wave 12, `fnv1a32:9f2740ab`, wheel spinning,
crossings [4,1,3], 800 panned / 619 spent / 0 granted.** Seed 02 ×2 `fnv1a32:afdd8c2a`, wave 14
ceiling, wheel still turning, crossings [1,0,4]. Five corrections to the funding table above came
out of it, each read in source: the view's seam map is the ANCHOR list and not where the live nodes
are (`gold-seam-1` is at (7.5,6.5) on seed 01 and (25,6.9) on seed 02 while the map says (−22,−6.8)
for both); **one `HARVEST` pays a whole harvest tick in one sim tick, so travel is the only real
cost and the 1.60 g/s ceiling is wrong — this rider measures 1.7–2.2 g/s while carrying the fort**;
`pan_legend` and `spring_heels` are worth nothing to an agent; the view arrives only at wave
boundaries and surprises; and a post planted north of the wheel's watershed loses the wheel rather
than saving it.

**2. GEOMETRY — owner ruling, verbatim "ok, try that".** The middle crowd's gate lane moved 6wu off
the stake (`CrowdFlockSystem.GATE_LANE_SHIFT`). Measured on one instrument against the ratified
lane — identical fort, identical repairs, both seeds: **x=0 → [5,3,7] and [4,4,3], both secure;
x=−6 → [5,0,7] and [4,0,5], neither.** The flanks are identical in both columns, so the only crowd
that moved is the only crowd that changed. Two mechanisms: the crossing target is unchanged so the
lane is a diagonal whose offset decays to 1.9wu by the north spawn point; and **the stake is also
the best-defended tile on the claim**, so stepping aside leaves the shield without leaving the
traffic. **Shipped at 0** — the lever stays documented one number from live, and neutrality is
proven by reproduction (the pre-existing prover returns `fnv1a32:9f2740ab` against the edited
engine, the same hash to the digit).

**3. FORT SHAPE — after the owner ruling "move the spawn".** The north entry was engine-derived
(`WaveSystem.ts:557/:562`) at the measured (0,−4.1) — the same line as the crowd's lane and the
stake. `noSpawnZones` was refused (`ContractFamilies.ts:705` declares it birth-loader output, never
authored in contract JSON, and `tp02-green-waypoint.spec.ts:200` guards that law); the fix rides
`ContractEnemyVariant.spawnGates` instead, one line of fairground data, no shared spawn code.
**The map change works: on the free-fort instrument the middle crowd goes from 3 and 4 crossings to
10 and 8 and both seeds secure, with total frights falling 29/33 → 22/29.** `prover-v3.mjs` then
designed a fort from the measured pressure map (south corners absorb 65% of all damage and are hit
from t=13; north corners 26%/16% from t=95; **nothing at all comes for a beacon** — 0–1%, first hit
t=287). It holds seed 01 to the wave ceiling with the wheel intact (650 panned, crossings [4,0,4])
and loses seed 02 at wave 2–3 with the wheel down; six opening variants (deadline 10/12/15,
maxWorks 12/16/20, travel weight, trip threshold) all landed within one wave of each other.

### What the programme leaves behind, and the honest reason it stops

- **F-E3CF-6, the finding that explains the whole arc:** v2's securing fort was an ACCIDENT — two
  beacon spots one unit from the ring's own flank post that `place_building` can never accept, which
  stopped the purse reserve and left a ~14-work fort with the rest of the purse going to upkeep.
  When the ruled spawn move changed which walls take the pressure, the accident stopped fitting.
  **An accidental shape does not travel**, and a deliberate one built from the pressure map did not
  reproduce it: the map says where damage lands on a COMPLETE fort, not what to buy first.
- **The residual, stated precisely:** seed 02's first live seam is 46wu out, so its opening purse
  lands ~5s later than seed 01's, and that margin is the whole wheel race. Every attempt that fixed
  the escort left that opening untouched, and every attempt that fixed the opening cost the fort.
- **What would change the answer** (none of it rider work): a `secureWave` below 12 for this map, a
  seam anchor inside ~30wu of the stake, or accepting the fairground as an elite map. All three are
  contract data or a ruling.

**Admission surfaces are UNCHANGED throughout** — census refusal-first, door baseline without the
id, skill.md fence naming the hold, floors with the fairground rows out. The exemption row's reason
now records this full history rather than the first attempt's snapshot; its citation is this file.

**F-E3CF-3 remains the owner-desk alternative.** If a prover attempt shows the funding gap is arithmetic rather than tactical, the fallback is a design ruling: the middle crowd's gate lane and the hero's loss stake are the same tile, and the headless hero cannot leave it. Giving the crowds a gate lane that is not the stake is an owner call, not an implementation choice.

### The funding arithmetic (public verbs only, unmodified balance)

| Quantity | Value | Source |
|---|---|---|
| Starting gold | **0** | measured at t0 in every prover trace |
| Radius-8 ring, 16 palisades | **160 g** | `Balance.palisade.cost` 10, flat (`costs: [10×6]`) |
| 4 sentry beacons | **160 g** | `Balance.beacon` costBase 25 × growth 1.3, ceil-to-5 → 25/35/45/55 |
| **Construction total** | **320 g** | |
| Repair unit cost | `ceil(cost × min(0.4, 0.25 × missingFraction))` | `Balance.repair.pctOfCost` 0.25, cap 0.4 |
| Repair stream to wave 12 | **379 g** (≈**1.04 g/s**) | fort-budget probe, both seeds, repair-under-40% |
| **Total demand to wave 12** | **≈700 g over ≈365 s** | 12 waves × 30 s + 5 s grace |
| Pan rate while channeling | **3.33 g/s** | `goldSeam.tickGold` 5 / `tickSeconds` 1.5 |
| Channel range | **1.6 u** | `goldSeam.channelRange` |
| Seam capacity / respawn / active | **30 g / 20 s / 2–3** | `goldSeam` |
| Anchors (no `harvestAnchors` on this contract) | (−22,−6.8) (−9,6.7) (−1.5,−6.4) (7.5,6.5) (18,−7) (25,6.9) | `Terrain.DEFAULT_NODE_ANCHORS` |
| Nearest anchor → fort centre (0,−30) | **23.6 u** (boot-active pair: 32.4 u, 37.8 u) | |
| Prospector speed | **4.8 u/s** | `Balance.agent.moveSpeed` |
| Repair reach | **1.4 u** | `Balance.wreck.repairRadius` |
| **Wheel / passive income** | **0 g** | `outputWatts` 24 is WATTS into the grid; `river:false`, `waterSources: []` ⇒ no sluice; stockpile only raises the cap |

**Stationed inside the fort, income is exactly 0 g/s** — the channel range is 1.6 u and the nearest seam is 23.6 u away. Funding is therefore a shuttle problem, and the duty cycle decides it:

| Cycle | Travel | Pan | Yield | Rate |
|---|---|---|---|---|
| Nearest seam, no repair overhead | 2 × 23.6 / 4.8 = **9.8 s** | 30 / 3.33 = **9.0 s** | 30 g | **1.60 g/s** (ceiling) |
| Boot-active seam (32.4 u) | **13.5 s** | 9.0 s | 30 g | **1.33 g/s** |
| Nearest seam + one batched repair visit | 9.8 s out/back + repair dwell | 9.0 s | 30 g | **≈1.0 g/s** |
| Nearest seam + `prospectors_luck` ×1 (cap 40) | 9.8 s | 12.0 s | 40 g | **1.83 g/s** |

**Answer: yes — 1 g/s from wave ~3 onward is arithmetically reachable by public verbs, with thin but positive margin.** The ceiling is 1.60 g/s against a 1.04 g/s repair requirement, so the fort's 320 g of construction has to be front-loaded and repairs must be BATCHED (one fort visit services many ring segments, because `REPAIR_UNDER` keeps firing while anything sits under its threshold — the travel amortises, the 1.4 u reach does not). Three public levers widen it and all are `PICK_UPGRADE` choices: `prospectors_luck` (+10 seam capacity, −5 s respawn, ×2 stacks — the exact lever that lengthens each trip's payload), `pan_legend` (−0.3 `panTickMult`, ×2 stacks), and `assay_bonus` (+15 g, unlimited stacks). What the failed prover did wrong is now legible: it shuttled to whichever seam was richest rather than the nearest, and it re-ordered builds onto ground occupied by wrecks instead of repairing them.

**Findings recorded:**
- **F-E3CF-1** (non-blocking, owner-adjacent truth fix): `e3-fairground`'s own `engineDependencies` prose still says the crowd-flock consumer is `missing`. It lives in contract JSON, outside this slice's firewall, so it is FILED not edited — same shape as F-E6HS-1.
- **F-E3CF-2** (non-blocking): `src/meta/ContractFamilies.ts:1579` still lists `twist.fairground.crowdFlocks` in `DECLARED_INERT_PATHS`. The path is no longer inert. Nothing breaks today (the contract still declares an engine dependency, which is all the validator demands), but the table now carries one false row.
- **F-E3CF-3** (the real successor): the middle crowd's lane and the hero's stake are the same tile, and the headless hero cannot leave it. Either the rider learns to buy its wall before wave 3 (the budget probe prices the target), or the design gives the crowds a gate lane that is not the loss stake. Worth an owner glance because it is a DESIGN question, not a bug.
