> ⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, verified s1074 2026-07-26).** Landed as `12bc9099` *"e1: SECURE-WAVE TRUTH — Dry Gulch and Twin Banks state how they are won"*, verified `git merge-base --is-ancestor 12bc9099 main` = true. Retained per the RETENTION LAW as the authoring record; the "run it" line below is HISTORY, not an instruction.

# DRAFT — E1 SECURE-WAVE TRUTH: two release maps must state how they are won
STATUS: DRAFT (authored by the E1-depth review session, 2026-07-25). Not queued. RATIFIED-SCOPED by the owner ruling below — run it.
WHY: `reviews/e1-gameplay-depth.md` F-E1-1 (✓ VERIFIED at source). Instance of register class **MQ-7** (player-facing promises vs engine truth) — do NOT re-file the class.


## OWNER RULING (2026-07-26, verbatim — SCOPE LAW for this task): "The later maps can end at 20 and 25 waves. It is more about helping the player get a quick win first." → the WAVE NUMBERS STAND (Dry Gulch 20, Twin Banks 25 — no renumbering, no Balance change); the fix is PURE CLARITY: each map STATES its win beat where a stranger sees it (the card GOALS line names the secure wave plainly; the in-run HUD/pause shows "secure at wave N — you are at M" per the pause-goal precedent; the first-win framing stays the Claim's job). Smallest change that makes the win legible.

## THE EVIDENCE (exact datum)
- `src/game/Game.ts:4532` — `secureWaveForRun()` returns `this.activeContract.twist.secureWave ?? Balance.run.secureWave`.
- `src/game/Balance.ts:807` — `run.secureWave: 20`.
- `assets/contracts/epoch-1-frontier/contracts.json`:
  - `e1-dry-gulch` — `twist` has **no** `secureWave` → resolves to **20**. Card goals: `["Work the dry washes around the lone spring."]`.
  - `e1-twin-banks` — `twist: {}` → resolves to **20**. Card goals: `["Build on either bank and watch both fords."]`.
  - Contrast: `the-claim` = 10 and says so; `e1-night-shift` = 25 and says so; `e1-baron` = 20 and says so.
- Unlock order makes it sharp: `e1-dry-gulch.boardRow.unlock = "wave10OnClaim"` — the player arrives having just been taught "secured = wave 10", and gets 20 with no notice.

## THE FIX (smallest change first, two layers)
1. **Copy (the actual defect).** Add the win condition as the FIRST goal line on both cards, in the voice the other three use:
   - `e1-dry-gulch.briefing.goals` → prepend `"Hold the gulch through wave 20."`
   - `e1-twin-banks.briefing.goals` → prepend `"Hold both banks through wave 20."`
2. **Data (make the promise explicit, not inherited).** Set `twist.secureWave: 20` explicitly on both contracts. Behaviour-identical today (it is already the default), but it stops the number being an invisible inheritance — the next map that omits the key is the next silent 20.

NO scope creep: do NOT retune wave counts, spawn tables, or `seamYieldMult`. Whether 20 is the *right* length for these maps is a separate, play-answered question (and Dry Gulch's 2× jump straight off a 10 is worth an owner look — flag it, do not fix it here).

## EXPECTED EFFECT
A stranger reading either card knows what ends the run, and the Claim→Dry Gulch step stops being an unsigned difficulty cliff. Directly serves RF-02's founding evidence (the first external tester *"did not exactly understand what to do"*).

## HOW TO VERIFY
1. `node -e` dump of `assets/contracts/epoch-1-frontier/contracts.json` shows both `twist.secureWave === 20` and the new first goal line.
2. Boot each map and assert the rendered briefing contains its wave number:
   `?debug&contract=e1-dry-gulch` and `?debug&contract=e1-twin-banks` → `[data-testid="contract-briefing"]` text matches `/wave 20/`.
3. Assert engine agreement in the same boot: `__THREE_GAME_DIAGNOSTICS__` secure wave for the run === 20 on both (resolve the exact field first — the review saw `run.secureWave` read `null` at boot on the Claim, which is **✗ UNVERIFIED** and must be checked before it is used as the assertion).
4. Regression: `the-claim` still reads 10, `e1-night-shift` 25, `e1-baron` 20.
5. Zero console/page errors on both boots, desktop + 390 px.

## FIREWALL
TOUCH-ONLY: `assets/contracts/epoch-1-frontier/contracts.json` (the two rows) · the e2e spec that asserts the briefing copy.
NO: `src/` · `Balance.ts` · any other contract row · wave tables · art.
NOTE: tonight's E1-E5 asset owner is `sculpt/map-fix-early` — this touches contract DATA + copy only; coordinate if that lane is live.
