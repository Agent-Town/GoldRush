# THE GREENHORN'S GAZETTE — the first issue teaches the game
STATUS: RATIFIED by owner direction 2026-07-29 (verbatim: "the tutorial for new players. I think we have to be more explicit about things and explain more what the user can do, what the goal of the game is and what the player has to do." + "Could be the first newsletter actually has the tutorial images in it? How do the weapons work, freeing the bandits, seams give gold, how to build and so on.")

## THE IDEA (owner's synthesis)
The Claim Herald's FIRST ISSUE is a pinned, illustrated greenhorn edition. Diegetic teaching in the house voice: the town's newspaper explains the town's game. No modal tutorial, no overlay arrows — a newspaper you can always reopen.

## THE SIX PANELS (each = engraved illustration + 2–3 lines, house voice, canon-true)
1. THE CLAIM AND THE GOAL — what winning is: hold the claim through the posted waves; the win locks in and the town grows.
2. SEAMS GIVE GOLD — pan the glittering seams; a sluice on running water pans while you fight.
3. THE WORKS — gold buys works: palisades slow trouble, turrets and beacons watch the night; build where the trouble walks.
4. THE ARMS — how weapons fire and upgrade between waves; frontier-tech, never firearms (ADR-001).
5. FREEING THE FEVERED — the bandits are neighbors under the Gold Fever; you turn them back, never slay them (canon: the Baron's fever, victims not villains).
6. THE TOWN SERVES YOU — the tavern board posts claims · the schoolhouse charts science · the tailor dresses partners · the complaints desk pays bounties for trouble reported.

## SURFACES
- Fresh profile: Herald badge pulses; the first issue is PINNED as issue #1 forever (re-readable; "each once" law does not apply to a newspaper).
- The greenhorn offer's "Yes — ease me onto the trail" additionally opens the Gazette on first town entry.
- Trail Guide barks stay the in-moment layer; the Gazette is the reference layer. Two teachers, one voice.

## LAWS
- Placeholder-first: the issue SHIPS text-first (typeset panels, no art) — engravings replace placeholders when the art batch lands (NO-BLOCKER).
- Canon: enemies-as-victims wording per lore/story-arc.md §THE GOLD FEVER. Never "kill the bandits."
- The GAZETTE-ART reusable class engravings (BACKLOG ladder) remain a separate, later batch for ONGOING issues; this spec's six panels are bespoke.

## SLICES
- GG-01 wiring (lane): pinned first issue + fresh-profile badge + greenhorn-offer hook + six text panels. e2e: fresh boot shows badge → issue opens → six panels present → reopenable; offer-yes path opens it.
- GG-02 art (art slot): six engraved panels + masthead vignette (exact filenames in the master; style-anchor: the contract plates).
- GG-03 swap (lane, after GG-02): panels gain their engravings; 390px legibility screenshots.

## THE WELCOME (owner ruling 2026-07-29, verbatim: "The tutorial is like the welcome for the player into town - it happens once and can be retriggered, but it is a distinct experience from entering town later? I think that makes sense.")
The first town entry after naming is a DISTINCT experience — THE WELCOME — not ordinary town plus a badge:
1. The NEWSIE runs to the player and hands over issue #1 ("hot off the press — your first Gazette, free to a new face"). The paper opens in hand.
2. Closing it, the welcome walks 2–3 anchored beats at the player's pace (the tavern board where the first claim is posted → the works/build moment → the schoolhouse chart), then DISSOLVES into normal play. No gates, skippable at every step.
3. ONCE-LAW: the welcome never replays uninvited. Ordinary later entries are clean — no badge nag, no repeated beats.
4. RETRIGGER: ask the newsie anytime — prompt offers "Read issue #1 again" and "Show me around again" (replays the welcome walk). The retrigger is diegetic; no settings toggle.
SLICE GG-01b (after GG-01): the welcome choreography + newsie delivery + retrigger prompt. The pinned-issue substrate from GG-01 is its dependency.

## THE ONGOING ILLUSTRATED HERALD (owner 2026-07-29→30: "for the news paper images would be amazing" → "Can you continue to illustrate the other newspaper later down the road? I think we should start working on that.")
Every Herald item gains an engraving by HEADLINE CLASS (reusable set, not per-item): board/claims · trail/terrain · river/water · schoolhouse/science · ledger/records · boss/threat · town-growth · ceremony. Renderer maps item class → engraving (heraldReader already loads gazette-panel-*.webp — same pipeline). New classes earn new engravings in later batches; unmapped classes render text-only (placeholder-first).

## THE MANDATORY WELCOME (owner ruling 2026-07-30, verbatim: "it should be mandatory for all new accounts, and then we can remove the option whether a user is new or not, we know that from their account. So then we only have to ask their name and the name of their town and can then let them do the tutorial flow.")
- Profile creation asks NAME only; town naming follows as today. The "First time prospecting?" question is REMOVED.
- A FRESH profile (no imported progress, no prior claims) ALWAYS runs THE WELCOME on first town entry. Imported ledgers and existing profiles never see it uninvited.
- The welcome stays skippable-at-every-step and newsie-retriggerable (the once-law + retrigger stand unchanged) — mandatory means DEFAULT, not imprisonment.
- Difficulty: greenhorn-question's difficulty side effect is replaced by the existing default (trail) + Settings; the welcome's board beat may mention it.
