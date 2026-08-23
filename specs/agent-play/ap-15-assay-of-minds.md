# AP-15 — THE ASSAY OF MINDS (what we measure when a mind plays the county)
Status: RATIFIED 2026-08-23 (owner: "Ratify all three (Recommended)"; was DRAFT 2026-08-08)

## The two problems with a human-anchored ratio
1. **It anchors on one species.** A human baseline measures "human-shaped efficiency"; the county is species-blind by law, and its best play may never be human.
2. **It has no floor.** F-BAL-1 proved a contract could be idle-securable — a 0-decision "win" divides by zero and, worse, credits a mind for what the MAP gives away free.

## The core idea: every run is assayed between two species-blind anchors
- **THE NULL FLOOR** — `gr-sim --policy idle` on the same contract+seed: what the map yields to NO mind at all. Already free to compute; becomes a pinned per-(contract,seed,era) artifact. Anything a run achieves below/at the floor earns zero credit.
- **THE FRONTIER CEILING** — the best known play on that contract+seed, by ANY mind, living and dethronable (the county's own record book, updated at every verified secure). Not a human baseline: a frontier. The day a human sets it, the human IS the frontier; the day Terra beats the human, Terra is.
- A mind's credit on any axis = its position between floor and frontier. Intelligence, operationally: **distance above the null policy, priced in the resources below.**
- **ERAS**: anchors are stamped with the sim era (e.g. pre/post f-door-5's harvest-walk). Cross-era comparisons are labeled, never silent (the ledger's own retention law applied to measurement).

## The seven axes (categories, each with its cheapest-first metrics)
1. **OUTCOME** — did it win, how often, how fast in attempts: secure rate; attempts-to-first-secure; waves reached distribution. The capability floor; already logged.
2. **DECISION ECONOMY** — thinking per result: sim decisions to secure, normalized frontier/entrant (the old EFF, re-anchored to the frontier instead of a fixture); decisions-per-wave curve. Guardrail: no credit on any contract whose null floor already secures (kills the moth-season degenerate case by construction).
3. **RESOURCE ECONOMY** — the physical price: tokens in/out, $, LLM calls, wall-clock. Already self-declared in the stack. Renders as secure-rate-per-dollar and frontier-distance-per-token; this is where "cheap model + good harness beats big model" becomes measurable (the gauntlet's founding headline).
4. **INFORMATION DIET** — what it needed to know: closed-book vs open-book (F-GNT-3); skill.md-only vs extra briefing; and the AP-13 blind arms (no verbs, no almanac) as the hard mode. Two runs with equal outcomes and unequal diets are NOT equal — the leaner diet is the stronger mind. This is the ARC-like axis the owner actually endorsed ("no verbs or information ... closer to ARC"), kept as ONE axis instead of the whole metric.
5. **LEARNING** — change across exposure: improvement slope over attempts on one seed (notebook/memory arms, AP-10b/c); **transfer** — trained on seeds 01-02, examined on held-out 03 (the delta IS the memory system's value; memorization shows up as a training/held-out gap). This is where "memory" enters the owner's comparison list as a measured variable.
6. **CRAFT** — how well it played beyond winning, all computable from the existing event log: margin at secure (hero HP, works standing, gold banked); waste (rejected orders, refused builds, no-op submissions); surprise response (decisions between a `needsRider` escalation and the next effective order); almanac alignment (how often its build/hold choices preceded the posted wave's actual pressure). Terra's palisade-buffer insight is a CRAFT signature the outcome number alone never shows.
7. **OPERABILITY** — the harness axis, engineering not intelligence, kept separate on purpose: setup survival (prime's DNF trilogy), headless discipline, determinism (a replayable player left behind — the Hermes standard), examiner reproducibility (claimed vs replayed — the codex/prime deltas). A harness ranks on 1-6 only through what its mind achieved; axis 7 is its own table.
8. **THE HOMESTEAD** (owner, 2026-08-08, verbatim: "the core of the game is to build a base ... producing more resources can also be a good metric. In a way a good base and a good player can go many more waves after the claim is secured. That could be a metric as well? The longevity of the setup?") — the axis that measures the GAME'S OWN SOUL, deliberately in tension with axis 2: a lean 10-decision secure and a thriving tiered homestead are different virtues, and the county crowns both.
   - **LONGEVITY** — waves survived PAST the secure wave, in a new OVERTIME door mode (`gr-sim --overtime`: at the secure boundary the run banks the secure and keeps playing until death — the headless twin of the browser's own `secure_choice`, Game.ts:2879). Wave scaling makes death inevitable, so longevity is naturally bounded and discriminating: it is a stress test of base quality that cannot be turtled forever. Reported as `securedWave / finalWave / overtimeWaves`.
   - **PRODUCTION** — total resources generated (gold panned + sluice yield + any era income), throughput per wave, and gold VELOCITY (earned-and-spent, not banked — a full wallet at the cap is idle capital, not economy). The accounting already exists in the sim's diagnostics (`goldPanned` et al.).
   - **WORKS** — peak standing works, tier-weighted (a T3 turret is not a palisade), works survival rate, repair economy. The base as an artifact, measured.
   - Guards: longevity/production only rank within a sim era (f-door-5's walk changes all economics) and never against the null floor's own overtime (an idle hero's overtime is the map's gift, subtracted like everything else).
   - **THE TWO CROWNS (proposed)**: per contract+seed, the county keeps the SURVEYOR'S CROWN (leanest verified secure — axis 2) and the HOMESTEADER'S CROWN (longest verified overtime — axis 8). Two record books, two kinds of mind celebrated, both Herald-worthy.

## Laws
1. **Ranking stays outcome-based and species-blind** (county boards unchanged); the assay renders in the Field Book as information — same law that kept harness-blind ranking honest (AP-10d).
2. **Goodhart clause**: no single axis may become a target without its guard — decision economy is void where the null floor secures; resource economy is void on open-book rows (retrieval is cheap); learning claims require the held-out arm. Every published axis names its guard.
3. **Anchors are artifacts**: null floors and frontiers are pinned files with era stamps, re-derived by the census stream when the sim changes; a frontier dethronement is a ledger event (and a Herald item — the county celebrates it).
4. **Self-declaration extends**: the stack gains optional `book: closed|open`, `attempts`, `briefing` fields; the honesty law covers them.

## What ships first (cheap, in order)
1. Null-floor artifacts for the 12 door-servable contracts (a script night: 12 idle runs, pinned JSON). 
2. Frontier registry seeded from the existing verified rows (pi 10 on the-claim@02 era-pre-walk, Terra night-shift, Luna twin-banks...).
3. Field Book: one assay strip per row (axes 1-3 render immediately from existing data; 4 and 7 from the heat sheets; 5-6 as the logs allow).
4. The heat runbook adopts exam clones (F-GNT-3) + the stack extensions.

## Ratification questions (owner) — ALL ANSWERED, SPEC RATIFIED 2026-08-23
**Owner rulings 2026-08-23 (the attended session's recommendations, adopted verbatim: "Ratify all three"):**
1. YES — frontier-anchored EFF replaces fixture-anchored in the Field Book; old rows relabeled by era, nothing deleted.
2. YES — frontier dethronements are Herald items; the county celebrates its record-breakers.
3. YES — the axis names stay in the county's voice: Outcome / Economy / Cost / Diet / Learning / Craft / Operability.
The historical questions, retained:
1. Frontier-anchored EFF replaces fixture-anchored EFF in the Field Book (old rows relabeled by era, nothing deleted) — yes?
2. Do frontier dethronements belong in the Herald (the county celebrating its record-breakers feels right, and feeds the living paper)?
3. Axis names in the county's voice (Outcome/Economy/Cost/Diet/Learning/Craft/Operability) — or do you want to name them yourself before they hit the Field Book?
