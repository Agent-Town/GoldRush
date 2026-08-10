# AP-16 — THE SAME-GAME LAW: agents and humans play the same game

STATUS: RATIFIED 2026-08-10 (owner directive, this file is its record). Slices DRAFT pending the AP-16-0 audit.

## The owner's words (2026-08-10, verbatim — the law)
> "this means that the agents are playing a different game from what the humans play. I use the grenade a lot, especially later in the game it is crucial. Then the agents also don't upgrade their skills or collect experience? I think we found a big gap that should become a law. **That agents and humans play the same game/contracts/use the same abilities and rules.**"

(The "grenade" is the **blast charge** in county canon — ADR-001 frontier-tech naming.)

## The verified gap, both directions (all file:line read 2026-08-10)

| # | Surface | Humans | Agents (door) | Direction | Evidence |
|---|---|---|---|---|---|
| 1 | Buildables, e1 | Manifest advertises `sentry_beacon` + `turret` only | Door accepts every BuildableId except conditional `boiler_house`/`capacitor_bank` — palisade, sluice, stockpile, lantern post, decoy shed pass on ANY contract | **agents exceed** | `src/agent/MechanicsManifest.ts:379-381` (registry buildables); `src/sim/HeadlessContractSim.ts:299-302` (enable predicate); grammar accepts all ids `src/agent/StandingOrders.ts` (BUILD validation) |
| 2 | Upgrade draft (the roguelite heart) | XP → offer → **player chooses** (`src/ui/UpgradeOverlay.ts`) | XP consumed, then **auto-picks the FIRST offer, every time**: `while (this.progression.offer?.[0]) this.progression.applyUpgrade(this.progression.offer[0].id)` | **agents lack agency** | `src/sim/HeadlessContractSim.ts:661-662` |
| 3 | Blast charge (owner: "crucial" late) | Cooldown ability, player-aimed (`src/game/Game.ts:612-618`, resumeKey `hero:0:blast`, `Balance.blast.cooldown`) | Pool exists in the sim (`HeadlessContractSim.ts:182`) but **no door verb reaches it** — the grammar is exactly BUILD · HARVEST · MOVE_TO · HOLD · REPAIR_UNDER · FALLBACK_IF | **agents lack** | verb enumeration `src/agent/StandingOrders.ts` |
| 4 | Everything unenumerated | weapon toggle, research picks, death actions, secure choices all exist in human tapes (`validTapeAction` list, `functions/api/standings.ts:590-613`) | none reachable by order | **unknown until audited** | AP-16-0's job |

Consequence already observed: prime × Sol's Baron plan legally tanks the Baron with a **palisade humans are never offered in e1** (`bench/gauntlet/heat2/prime-sol/e1-baron-report.md`, source anchors). Rows on today's boards were earned under this door.

## The law, operationalized
1. **One rulebook**: a contract's manifest is THE offer, for both species. The door accepts exactly what the manifest advertises; the browser menu offers exactly the same. Divergence is a red, not a doc bug.
2. **Same agency**: where a human makes a choice (upgrade draft, research pick, secure choice), the agent must be OFFERED the same choice through the view, with an order path to answer it. A default taken silently on the agent's behalf is a violation unless the human path defaults identically.
3. **Same abilities**: cooldown abilities (blast charge first) get an order verb honoring the same costs/cooldowns the human pays. No agent-only verbs; no human-only verbs, ever, without an owner ruling.
4. **Era honesty**: this changes the door's contract, so its landing mints a new era stamp (Walk Era precedent). Standing rows earned under the old door remain, labeled with their era; they are history, not cheats.

## Slices
- **AP-16-0 (audit, fire-authorable now)**: mechanical parity harness — for every contract, enumerate manifest buildables vs door-accepted vs browser menu; every human choice/ability vs door reachability. Output: parity table checked into `docs/bench/` + a failing-by-design list. No behavior changes.
- **AP-16-1 (buildable parity)**: door narrows to the manifest; manifest gains any browser-menu item it under-reports. Parity becomes a guard test.
- **AP-16-2 (the draft reaches the door)**: upgrade offers appear in the view; a pick path answers them; silence policy per ratification Q2.
- **AP-16-3 (the blast charge)**: `BLAST_AT` (or owner-named verb) with human cooldown/cost; then the remaining ability/choice list from AP-16-0.
- Each slice: era-stamp note, both-species e2e, gauntlet re-baseline note in `bench/`.

## Ratification questions — ALL ANSWERED (owner, 2026-08-10)
1. **Grandfathering → SEASONS (bigger than asked).** Owner verbatim: *"I would make that into seasons. Explain in a season page what happened in that season and then have the results and runs of the different models as well as a comment about them, their performance, what we learned from each of the experiments. This manifests this important step in history in the application. If users don't like we can later remove it. I think that its important."* → Standing rows stay, labeled by SEASON; each season gets a page in the app. Full design: `specs/seasons/seasons-v1.md`.
2. **Silence policy → THE PICK CLOCK, and it cures the HUMAN game first.** Owner verbatim: *"In the game for humans it acts like a pause button that can pause forever and that in itself also is something that should be changed, we should add a timer of greenhorn 30, trail 20, vein hunter 10 seconds to pick something, then the same applies for the agents."* ✓ VERIFIED: the draft is GameState `'levelup'` with the sim frozen and NO timer (`Game.ts:8301-8330` syncUpgradeOverlay; canon difficulty ids `Balance.ts:1022`). → AP-16-2 now carries BOTH species: browser countdown 30/20/10s by difficulty, expiry = first option; door offer answered in the same view exchange, silence = the identical first-option default; `defaultedPicks` counted in outcomes both sides. Browser half sliced immediately: `tasks/lane-d-upgrade-clock.md`.
3. **Verb naming: RATIFIED as proposed** ("sounds good") — `BLAST_AT`, `PICK_UPGRADE`, `RESEARCH_PICK`.
