> ⏸️ **OWNER-BANKED POST-RELEASE — DO NOT QUEUE without a fresh owner ruling (verified s1130 2026-07-27).** Owner's disposition, verbatim (BACKLOG:1063): *"hold-the-claim (stake loss conditions) BANKED post-release (recommendation: E1 strangers lose by body-death; real siege-loss ships with E2 depth — one word reverses)."* ✅ **The draft's central fact was RE-VERIFIED at source today and still holds — this is banked, not stale:** `Game.ts:6352 endRun()` still has no defeat path but hero death (its two call sites, `:1754` and `:6375`, are the **same** path — `:6375` sits inside `finishPendingDeath()`, exactly as the draft describes), and `lossCondition` still has **no loss consumer**: `Game.ts:7558` uses the loss-stake only to pick the hero's **start position** (`contractHeroStart`), `props.ts:101` only to size the post. Nothing below is implemented. **This is a live design fork awaiting one word, NOT dead work** — do not archive it, and do not queue it either.

# DRAFT — GIVE E1 A DEFEAT ITS MAPS CAN ACTUALLY SUFFER ("hold the claim" should mean holding something)
STATUS: DRAFT (E1-depth review, leg 2, 2026-07-26). Not queued. **Design fork — needs an owner ruling before anyone writes code.**
WHY: `reviews/e1-gameplay-depth.md` F-E1-6. Every E1 card says *hold*, *watch*, *survive*. The engine implements exactly one of those.

## THE FACT (✓ VERIFIED at source — traced, not grepped)
`src/game/Game.ts:6352 endRun()` is the **only** defeat path in the game, and its only caller is hero death (`Game.ts:1754` via `finishPendingDeath`). There is no building-loss defeat, no claim-loss defeat, no timer.

Twin Banks' data believes otherwise. `tileParams.stakeMarkers` declares `south-claim-stake` with **`lossCondition: true`** at (0, −12). Every consumer was traced:
- `Terrain.lossStakeMarker()` → the hero's spawn point (`Game.ts:7557`)
- → the multiplayer spawn centre (`Game.ts:3275`)
- → a world-info label (`Game.ts:5685`)

Nothing can lose because of it. The flag names a rule the game does not have — and it is the *only* map that even tries.

## WHY IT IS THE ROOT UNDER TWO OTHER FINDINGS
- **F-E1-5 (the river camp):** camping wins because survival *is* the win condition. Fix survival-as-win and the camp stops being a strategy even where the water allows it.
- **F-E1-8/9 (optional buildings, dead waves):** a player builds to protect something. E1 gives them nothing to protect, so the build economy is decoration — played evidence: Dry Gulch secured at wave 20 having bought one beacon and six palisades, none after wave 2, and took zero damage from wave 3 to 19.

## THE FORK (owner ruling needed — these are different games)
**(A) The claim is a place, and jumpers can take it.** The loss-condition stake becomes real: jumpers that reach it chip it; at zero, the run ends as a *loss of claim*, not a death. Buildings and kill-lanes exist to stop that. This is the tower-defence reading, it is what every card already implies, and it is the biggest change.

**(B) Securing requires the claim to be quiet.** Keep the wave goal, add a condition: you do not secure while N+ jumpers stand on the claim. Small, general, kills the camp on every map at once, and turns the last wave into a real fight instead of a countdown. Recommended as the cheapest fix that makes the words true.

**(C) Leave it, and change the words.** If the intended E1 game really is "survive N waves", then the cards should say *survive*, not *hold*, `lossCondition` should be renamed to `heroStart`, and the river camp gets fixed as a pure terrain matter (`DRAFT-e1-river-camp.md`). Cheapest of all, and honest — but it concedes that E1's buildings are optional.

Recommendation: **(B) for E1's release, (A) as the E2 Steamworks-era design**, with (C)'s renaming done regardless because `lossCondition: true` is a lie in the data today and will mislead the next author.

## HOW TO VERIFY (whichever branch is chosen)
1. `node rehearsal/segments/e1-depth-rivercamp.mjs the-claim camp-after 4 8` → must NOT report `secured`.
2. `node rehearsal/segments/e1-depth-play.mjs the-claim regress 1 8` → must still secure at wave 10 by playing (baseline `ghostfix2-report.json`).
3. A new e2e asserting the chosen defeat: for (B), spawn a pack onto the claim at the secure wave and assert `run.secured === false` until it is cleared.
4. Zero console/page errors; desktop and 390 px.

## FIREWALL
TOUCH-ONLY (for B): `src/game/Game.ts` secure resolution (`autoSecureWaveForRun`/`runWasSecured`) + one e2e + the five E1 cards if wording changes.
NO: the wave tables · `Balance.run.secureWave` (F-E1-1's draft owns that datum) · other epochs.
