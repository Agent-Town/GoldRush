# THE LIVING PAPER — the Herald prints what the player did
Status: RATIFIED-BY-DIRECTIVE 2026-08-04 (owner, verbatim, in-session): "right now the newspaper never changes. Even after I beat the Baron, same newspaper. It would be amazing if it would change after each contract? Then the user has the impression that the town knows about it. I know that the tavern keeper is already talking about it and that the player is getting congratulated. But for story telling I think it would be good to use the newspaper for that. In the first edition, it should highlight that a new person has entered town and how this is a special event as it does not happen often. Then this person becomes a hero and clears a contract! That is amazing progress. And so on and forth? ... I just like the feature a lot with the visuals."

This spec RESOLVES `specs/world-dispatches/` (DRAFT, "awaiting owner nod on the vehicle mix"): **the newspaper is the vehicle.** It extends `specs/gazette-house/README.md` (the Claim Herald) and composes with `specs/greenhorn-gazette/` (RATIFIED: Issue No. 1 is the pinned illustrated tutorial) and `specs/story-spine/`.

## Laws
1. **The paper is a FUNCTION OF THE PROFILE.** Editions derive deterministically from progression facts already stored (welcome done, `FIRST_CLAIM_DONE_KEY`, per-contract secured flags/scores, epoch beaten). Same profile ⇒ same paper. NO timers, NO boot-time writes (the Runaway Generator grave), NO new persistence beyond at most a "last read edition" marker for the unread-badge.
2. **The town knows the player's name.** The mandatory welcome (owner ruling) captured the name and the town's name; the lead stories print them. A paper that doesn't name its hero is the old static paper with extra steps.
3. **Issue No. 1 stays the greenhorn edition AND becomes THE ARRIVAL.** The owner's 2026-07-29 ruling folded the tutorial into the first newsletter; today's ruling gives it its lead story: a new hand has entered town, and that this is rare. One issue, both duties: arrival lead above, guide panels below, all existing guide/controls behavior unchanged.
4. **Editions never retire.** The stack of published editions is the run's story; every unlocked edition stays re-readable (archive strip). The CURRENT edition opens first.
5. **In-world voice, era-true, lore-cited.** The rarity of a new citizen ties to the Calculating House canon (read `lore/agent-town-heritage.md` + `lore/` before writing copy; new canon lands same-commit, cited). The `INTERNAL_HERALD_PATTERNS` filter in `src/news/herald.ts` remains the guard against factory jargon leaking in-world.
6. **Placeholder-first art.** Editions ship with the existing engraving pool (`gazette-panel-*.webp`, class-mapped); per-edition mastheads are an ART-slot batch (GZ-L2), never a gameplay blocker.
7. **The static feed demotes to filler.** `news/herald.json` items become the small "around town" column beneath the lead — never the headline again once Edition ≥ 1 exists.

## The edition ladder (E1)
| № | Unlock fact | Lead story |
|---|---|---|
| 1 | welcome completed | THE ARRIVAL — "<Name> takes a claim in <Town>"; a new citizen, and how rarely that happens (+ the pinned guide panels, unchanged) |
| 2 | first contract secured | THE FIRST CLAIM HOLDS — the newcomer becomes a hero; names the contract, prints the deed |
| 3..N | each further E1 contract secured (order = the player's own order) | one edition per contract, contract-flavored lead (the drill yard does NOT print — it is training, not news) |
| final | Baron beaten | THE BARON EDITION — the epoch's close, full-width; sets up what comes next (world-dispatches fragment allowed here) |

## Slices
- **GZ-L1 — the engine + the E1 ladder** (this dispatch): `editionLadder(profile)` in `src/news/`; reader shows current edition + archive strip; unread-badge when a new edition exists; arrival lead folded into Issue No. 1; per-contract + Baron editions with existing art; herald.json demoted to filler column. GATE: e2e proves — plain boot, no `?debug` — that securing a contract changes the paper (seed a profile with N secured → paper shows edition N+1's masthead; Baron-beaten profile shows the finale), determinism (same profile twice ⇒ identical DOM), welcome-name interpolation, and the greenhorn guide panels still render in Issue No. 1. Both projects, zero console errors.
- **GZ-L2 — masthead art batch** (ART slot, later): one engraving per edition class; placeholder law until then.
- **GZ-L3 — world-dispatch fragments** (later, per `specs/world-dispatches/`): backstory fragments ride later editions; separate ratification of fragment content.

## Integration map
Touches: `src/news/*` (new module + reader), the town surface that opens the reader (badge only), `e2e/` (own spec). Does NOT touch: sim, Balance, Economy, contracts, welcome flow, tavern-keeper lines (the paper joins them, replaces nothing).

## Ratification questions (batched, defaults chosen, non-blocking)
1. Defeat editions — should a lost run print (survive-framing)? DEFAULT NO: only progress prints, defeats stay in the tavern keeper's voice. One word flips it.
2. Should the Baron edition tease E2 (a world-dispatches fragment)? DEFAULT YES, one paragraph, no mechanics named.
