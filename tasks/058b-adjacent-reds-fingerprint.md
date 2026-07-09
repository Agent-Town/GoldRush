# Task 058b: fingerprint + clear two pre-existing main reds (feedback-fx:28, xp-economy-audit:92) — commit prefix "fix:"

**FIRE-AUTHORED (s254, attended review welcome).** Not yet queued — needs an attended judgment call (real regression → fix, vs. stale spec after the story-loop/save-slots rework → update spec). Do NOT auto-run blind.

You are Codex/attended on Robin's Mac, repo root. READ FIRST: `reviews/058-device-tiers.md` §F-058-2; `e2e/feedback-fx.spec.ts:28` (opening announcement banner) + `e2e/xp-economy-audit.spec.ts:92` (seeded dense-kill XP-once); the recent boot/HUD-flow merges `20753ac` (story-loop drain) and `4c85d51`/`5f8b9da` (SAVE SLOTS); `src/story/StoryRuntime.ts` + `src/ui/Hud.ts` (announcement) + the XP-banking path.

## WHY (evidence, dated)
s254 drain of 058 ran the affected adjacent suites and found two tests **RED on current main**, independent of 058 (058's delta is diagnostics-read-only — verified diff — and touches zero HUD/XP code). Both fail consistently isolated (workers=1, 2 retries, quiet machine):
- `feedback-fx.spec.ts:28` — `getByTestId('hud-wave')` is empty; expected "Stake your claim." at plain boot `/?timescale=2`.
- `xp-economy-audit.spec.ts:92` — seeded dense kill windows bank XP off-by-one (expected 0, received 1; predicate timeout).
Both failing paths were last modified by the story-loop drain (`20753ac`) and SAVE SLOTS (`4c85d51`/`5f8b9da`), NOT 058. 4 sibling adjacent tests (m2-02/04/05, base-damage) flake-passed on re-run under load — these two do not.

## Scope
1. **Bisect origin** (detached worktrees per Mistake #12): confirm each test is green at a pre-story-loop / pre-save-slots tip and identify the exact merge that turned it red. Record the first-bad commit per test.
2. **Decide + act per test:** (a) genuine behavior regression → minimal fix in the owning system (StoryRuntime/Hud announcement pipeline; XP-banking dedup); (b) the rework legitimately changed the contract (e.g. the opening notice moved/renamed by the story-loop) → update the SPEC/test to the new truth with an owner-quotable rationale, NOT a silent test edit.
3. **Prove:** both tests green desktop-chrome; then a full serial regression (or the affected milestone suites) green, zero console/page errors.

## Firewall
Touch ONLY: the owning system's fix (announcement/XP) OR the two spec files (if respec), + evidence. NO render-tier code, NO sim rewrites, NO unrelated suites.

## Self-check
tsc/build; feedback-fx + xp-economy-audit green (3× isolated for the formerly-red cases); affected milestone suites green; zero console errors; first-bad-commit per test recorded in the review. End: READY-FOR-GATES + the bisect table + fix-vs-respec decision per test.
