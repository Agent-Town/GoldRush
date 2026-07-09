# Sol findings — product, content, and accessibility

- **Branch:** `sol/repository-audit-findings`
- **Base:** `7802ed6`
- **State:** UNTRIAGED — no implementation authorized.
- **Scope:** progression/story correctness, identity/canon, onboarding, difficulty, controls, generational rules, narrative ownership, accessibility, and tone.

## Summary

| Finding | Severity | Backlog overlap | Suggested future branch if accepted |
|---|---|---|---|
| `F-SOL-PRODUCT-001` Sky-Rocket unlock and story signal contradict Baron capture | P1 bug | E2 science work blocked; no E1 corrective found | `sol/sky-rocket-capture-gate` |
| `F-SOL-PRODUCT-002` Research sells future promises as current rewards | P1 design | Science tree shipped; E2 socket blocked | `sol/research-live-value` |
| `F-SOL-PRODUCT-003` Baron gate lets players skip authored E1 variety | P1 owner decision | Contract roster/Baron shipped | `sol/frontier-graduation-gate` |
| `F-SOL-PRODUCT-004` Human and Prospector identities are confused | P1 canon bug | Hero canon ruling exists; UI not corrected | `sol/claim-holder-naming` |
| `F-SOL-PRODUCT-005` First-run teaches navigation, not the game/partnership | P1 | Task 061 and POLISH-04 partially overlap | `sol/first-run-gameplay-teaching` |
| `F-SOL-PRODUCT-006` Difficulty is stored but not a player-facing choice | P1 family UX | No selector task found | `sol/difficulty-selection` |
| `F-SOL-PRODUCT-007` Weapon cycling has become an input exploit | P1 gameplay | Owner playtest/053 overlap | `sol/weapon-control-prototype` |
| `F-SOL-PRODUCT-008` Generational premise lacks continuity/consent rules | P1 design gate | Time v1 planned, not specified | `sol/generational-continuity-proposal` |
| `F-SOL-PRODUCT-009` Story beats can be permanently lost before display | P2 bug | No corrective found | `sol/story-seen-on-display` |
| `F-SOL-PRODUCT-010` Town story/presence is fixed and under-authored | P2 product depth | Town style revamp already banked | `sol/town-authorship-proposal` |
| `F-SOL-PRODUCT-011` Accessibility is materially behind touch support | P1 public gate | No accessibility ladder found | `sol/accessibility-baseline-proposal` |
| `F-SOL-PRODUCT-012` Baron defeat copy uses a harsher violent imperative | P2 owner tone | Warm illustrated rule exists; no copy ruling found | `sol/baron-defeat-copy` |

## F-SOL-PRODUCT-001 — [P1] Sky-Rocket Battery can precede the Baron and its capture beat listens to the wrong event

**Evidence**

- `src/meta/ResearchTree.ts:151-157` calls the node "Captured Baron science" but requires only `powder_math`.
- `src/meta/ResearchTree.ts:280-292` checks only prerequisite node IDs; it does not require the Baron medal/capture flag.
- `lore/characters.md:13-17` says defeating the Baron captures sky-rocket science into E2.
- `src/story/beats.ts:149-154` triggers the capture beat only on `science-complete` plus a capture flag.
- `src/game/Game.ts:2858-2877` awards the medal and emits `boss-defeat`, not `science-complete` or a dedicated capture signal.

**Impact**

The player can research "captured" science before capturing it; after the actual defeat, the authored capture beat may wait for a later science event or never show.

**Recommendation for triage**

Medal/capture-gate the node and emit a dedicated `rocket-cart-captured` story signal at Baron defeat. Keep the E2 science socket work separate.

## F-SOL-PRODUCT-002 — [P1 design] Seven research picks have no immediate live effect

**Evidence**

- `src/meta/ResearchTree.ts:75-209` contains sixteen Frontier nodes; seven omit `live: true` and describe only "banks +1 ... toward" a future effect.
- `src/meta/ResearchTree.ts:295-310` increments the science track for every accepted node regardless of whether an effect is live.
- `specs/science-dimension/README.md:14-18` defines a node as one concrete, legible unlock whose change fits one sentence.
- The spec says fifteen nodes/five per branch (`specs/science-dimension/README.md:39-46`), while runtime has sixteen and Arsenal has six.

**Impact**

The between-run choice can consume a scarce pick while changing nothing visible. It also advances the player toward epoch graduation with placeholder value.

**Recommendation for triage**

Either give every offered node a small immediate effect or remove future-only nodes from live offers until their effect exists. Reconcile node count/branch shape with the binding spec.

## F-SOL-PRODUCT-003 — [P1 owner decision] The Baron gate rewards repetition over authored contract breadth

**Evidence**

- The owner-ratified science law lets any completed contract, including failure, grant a research pick (`specs/science-dimension/README.md:6-12`).
- `src/meta/ResearchTree.ts:368-385` marks science complete at the six-step epoch threshold.
- `src/town/TownScene.ts:1312-1314` unlocks the Baron on that meter alone.
- No distinct-contract or secured-contract condition participates in the Baron unlock.

**Impact**

A player can repeat The Claim, ignore Dry Gulch/Night Shift/Twin Banks, reach six science, and graduate to the Baron. This undercuts the story-spine "board opens wide" beat and wastes the strongest E1 variety.

**Recommendation for triage**

Preserve failure progress, but ask Robin whether graduation should require a light Frontier ledger condition such as six science plus two distinct non-default contracts attempted/secured. This is an owner decision, not a silent code correction.

## F-SOL-PRODUCT-004 — [P1 canon bug] The first human profile is named as the Prospector

**Evidence**

- `lore/characters.md:3-10` reserves "Prospector" for the agent and calls the human the miner/claim-holder.
- `src/ui/menu/StartMenu.ts:156-165` asks "Who's prospecting?" and uses placeholder `Prospector name` for the human profile.
- `docs/GOLD_RUSH_BRIEF.md:300` contradicts itself: it bans calling the hero prospector, then mandates the phrase "a young female prospector" in generation prompts.

**Impact**

The opening confuses the central human/agent relationship and the contradictory prompt law will keep regenerating incorrect copy/art.

**Recommendation for triage**

Use "Claim-holder name" or "Miner name" for the human and correct the brief's mandatory generation sentence. This branch should be copy/canon-only.

## F-SOL-PRODUCT-005 — [P1] First-run guidance stops before the actual game and agent partnership

**Evidence**

- `tasks/061-first-claim-onboarding.md:5-10` intentionally covers Town → Tavern → Launch and excludes in-run teaching.
- `tasks/lane-c-polish-04-first-run-hints.md:1-2` proposes five toast hints but only "first B open" for building.
- A successful build requires selecting a structure, understanding valid/invalid placement, moving the ghost, confirming, and sometimes rotating; the proposed hint does not teach that sequence.
- `src/game/Game.ts:3231-3241` introduces the Prospector with "Chip by weapon; claim wins grow it," which is system jargon rather than a plain role explanation.
- `docs/GOLD_RUSH_BRIEF.md:195-204` frames onboarding as a two-participant ritual in which both human and agent matter.

**Impact**

New players can reach combat without understanding panning exposure, building, theft response, or what the Prospector is supposed to do.

**Recommendation for triage**

Keep task 061 narrow. Reslice a separate first-run gameplay lesson that ends only after the first successful placement and explains the roles plainly. Coordinate with `F-SOL-SIM-003` without merging time ownership and tutorial content into one branch.

## F-SOL-PRODUCT-006 — [P1 family UX] Difficulty exists in storage but cannot be selected normally

**Evidence**

- `src/game/ProfileStorage.ts:70-83` creates a fresh default profile using the Robin name and the legacy/default difficulty path; the default preset constant is declared at `src/game/ProfileStorage.ts:19-20`.
- `src/game/ProfileManager.ts:371-377` displays the difficulty preset as text but exposes no selector.
- The setter is exposed through debug/test plumbing, not normal profile or contract-board UI.
- `src/game/Balance.ts:478-497` makes Greenhorn affect thief concurrency and palisade HP, but not enemy HP, contact damage, boss pressure, or general pacing.

**Impact**

Family testing cannot choose an easier mode, and the nominal easy mode does not soften the full failure curve.

**Recommendation for triage**

Expose difficulty before the first contract and on the board/profile. Ask Robin to verdict the Greenhorn contract—especially contact damage, wave cadence, and boss pressure—before implementation.

## F-SOL-PRODUCT-007 — [P1 gameplay] Optimal weapon use has become high-frequency Q cycling

**Evidence**

- `docs/playtests/2026-07-07-robin-playtest-02.md:41-50` records 1,991 weapon toggles in one run and roughly 80% of damage from Blast.
- The same owner playtest explicitly calls out Q-spam as the dominant interaction.
- `src/core/InputController.ts:3-18` maps one fixed toggle action rather than independent/held weapon actions.

**Impact**

The tactical choice becomes repetitive input strain and an ergonomic exploit, especially poor for children, mobile, and accessibility.

**Recommendation for triage**

Prototype one concern with measured alternatives: separate actions, hold-to-alternate, commitment cooldown, or automatic alternation with deliberate overdrive. Preserve active participation without rewarding thousands of toggles.

## F-SOL-PRODUCT-008 — [P1 design gate] The generational premise has no continuity or consent bible

**Evidence**

- `docs/VISION-EPOCHS.md:4-9` makes aging, marriage, children, schooling, and succession central pillars.
- `docs/VISION-EPOCHS.md:18-19` plans Time v1 before the E2 transition.
- `lore/characters.md:19-24` already plans the Elder's death and youngster succession.
- No Time v1 spec defines calendar cadence, consent for marriage/birth events, adoption/family representation, permanence/death tone, divergent profile histories, or multiplayer reconciliation.

**Impact**

E2 content can make irreversible emotional/canon assumptions before the system governing the saga is designed.

**Recommendation for triage**

Attended proposal only: write continuity, consent, representation, death/permanence, and multiplayer-history laws before the E2 transition ceremony. Do not implement via a generic task branch first.

## F-SOL-PRODUCT-009 — [P2] Once-per-profile story beats are marked seen before the player sees them

**Evidence**

- `src/story/StoryRuntime.ts:58-68` calls `markStoryBeatSeen` while constructing the queue.
- Display/scheduling occurs afterward (`src/story/StoryRuntime.ts:69-77`).
- Navigation, interruption, disposal, or queue clearing after line 67 can permanently suppress a beat that was never presented.

**Impact**

Authored once-only story can silently disappear from a profile.

**Recommendation for triage**

Mark seen when the beat becomes visible or is explicitly dismissed; add interruption/navigation regressions.

## F-SOL-PRODUCT-010 — [P2 product depth] Named town characters and profile towns have little authored ownership

**Evidence**

- `src/story/speakers.ts:15-39` labels portraits only `Elder`, `Tavernkeeper`, and `Assay Clerk`.
- `src/town/townsfolk.ts:46-125` gives them names—Marta Vale, Elder Rowan, Ada Pike—and only three rotating E1 barks each.
- `specs/town-v1/README.md:10-16` renders growth from a fixed manifest; apart from naming, profiles converge on the same town.
- Live inspection found a coherent title/HUD but a rudimentary flat Town blockout; `tasks/BACKLOG.md:112` already records Robin's style/detail revamp direction.

**Impact**

The story reacts to progress but the player has little civic authorship, and named relationships are weakened by generic presentation.

**Recommendation for triage**

Deduplicate visuals against the banked Town revamp. Separately propose one small permanent civic/cosmetic choice per epoch and use actual character names in story surfaces; avoid a branching-RPG explosion.

## F-SOL-PRODUCT-011 — [P1 public gate] Touch support is not an accessibility baseline

**Evidence**

- `src/core/InputController.ts:3-18` hard-codes keyboard controls; no remapping or gamepad path was found.
- `src/ui/menu/StartMenu.ts:137-148` settings cover audio, Tales, performance, and telemetry only.
- `index.html:14-20` marks the entire touch-control container `aria-hidden`.
- Only one reduced-motion rule was found, at `src/town/town.css:646-649`.
- No UI/text scale, reduced-flash, high-contrast/colorblind mode, or general non-color build-validity setting was found.

**Impact**

Keyboard, motor, vestibular, low-vision, and assistive-technology users have no equivalent path despite a family audience and substantial mobile work.

**Recommendation for triage**

Proposal only: define and owner-ratify a pre-public accessibility ladder. Split remap/gamepad, accessible touch semantics, reduced motion/flash, UI scale, non-color-only placement validity, and contrast work into independently gated implementation branches after that ruling.

## F-SOL-PRODUCT-012 — [P2 owner tone] Baron defeat copy uses a harsher violent imperative than the warm illustrated rule

**Evidence**

- `docs/GOLD_RUSH_BRIEF.md:243-250` rejects a grim or violent Western and says violence should remain illustrated, not gory, and "warm even when tense."
- `assets/contracts/epoch-1-frontier/contracts.json:293-297` says "End him" and "Kill the Baron".
- The contract copy elsewhere frames enemies as outfits to repel or claims to defend; these two imperatives are notably more final and violent.

**Impact**

The family-facing climax speaks in a harsher register than the surrounding non-gory defeat framing.

**Recommendation for triage**

Robin decides the line. If accepted, keep the branch copy-only and replace the two imperatives with defeat/turn-back language; do not use this finding to relitigate deliberate weapon, mortar, or Tavern-to-Saloon spec terminology.
