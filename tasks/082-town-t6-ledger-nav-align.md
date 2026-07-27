> ✅ **RE-HOMED TO LANE-A AND QUEUED, s1136 2026-07-27.** The design was never the blocker — the *slot* was. Its old MAIN-slot pre-flight ordered *"tracked-clean … if `git status` shows tracked dirt, STOP"*, and main carries ~330 tracked artifact/log/screenshot churn files, so queueing it bought a guaranteed pre-flight STOP false-done (F-1132-9). s1135 named the fork: sweep the churn, or re-home. **Re-homing is the reversible half, so that is what this is** — the churn sweep remains an open owner-facing question and is NOT decided here.
> ✅ **AND THE LEDGER'S "FOLD IT IN" RIDER IS WITHDRAWN — it was wrong, verified at the seed (F-1136-3).** F-1132-9 said the nav is *"**5** when a manual save exists, via the conditional 'Load a claim' button at `StartMenu.ts:141` that the master does not mention (fold it into the fix)."* ✓ s1136 read `seedProfile` (`e2e/town-t6-surfaces.spec.ts:20-32`): it calls **`localStorage.clear()`** and then writes **only** the profile state and the town name — **no save slots, no suspend**. So at `:96` `slots.manual.length === 0` and `suspend` is absent, and *neither* conditional button renders. **Scope 1 below is correct exactly as originally written.** Folding in the conditional would have made a reachable assertion conditional on a branch this test's own seed makes unreachable.

# Task 082-town-t6-ledger-nav-align: align the town-t6 "plain menu" assertion with the shipped Claim Ledger nav button (LANE-A; workdir `worktrees/lane-a`; commit prefix "test:")
CODEX: model=gpt-5.6-sol effort=low
**FIRE-AUTHORED (s327; RE-HOMED s1136, attended review welcome).**

Pre-flight (lane, SAFE-DUPE): you are in `worktrees/lane-a` on branch `lane/m3`. Run `git log --oneline main..HEAD`. If it is empty, proceed. **If it lists commits, do NOT assume they are unmerged** — for each one run `git diff main HEAD -- <its files>`; if every diff is **empty**, the content is already on main (false-ahead) and `git reset --hard origin/main` (or `main`) destroys nothing, so proceed. **If ANY dirty or committed blob is UNIQUE — present here and absent from main — STOP and report it by path; do not reset.** (s1136 pre-proved this: `lane/m3` is 1 ahead at `b9f1d184`, whose only file `e2e/vp-02-sprite-animation.spec.ts` is **byte-identical to main** — merged at `96568621` — so the reset is safe as of authoring. Re-verify anyway; the lane may have moved.)

WHY (evidence, dated): `reviews/081.md` F-081-1 (s327 drain, 2026-07-11). `e2e/town-t6-surfaces.spec.ts:96` asserts the start-menu nav is exactly `['Enter Town', 'Profile', 'Settings']`, but `StartMenu.ts` render() emits an **unconditional** `start-menu-claim-ledger` ("Claim Ledger") button (`data-menu-action="ledger"`) between Enter Town and Profile. Verified: that button was added by `2ca5d58b` (2026-07-09 11:06) which did NOT update this assertion; the test was last aligned by `50386200` (s217, 2026-07-09 00:35). The suite has been RED on `main` since `2ca5d58b`, orthogonal to 081. 044's plain-boot test (`e2e/044-start-screen.spec.ts:45`) confirms the ledger button is intended (it only asserts enter-town/profile/settings are visible, not that ledger is absent).

✓ **Re-verified at source s1136** (do not take this on trust — it is one `sed` each): `StartMenu.ts:144-147` emits, unconditionally and in this order, `Enter Town` → `Claim Ledger` → `Profile` → `Settings`. Two buttons ahead of them are conditional: `continue` (on `suspend`, `:133`) and `load` "Load a claim" (on `slots.manual.length > 0`, `:141`). **Neither fires under this test's seed** — see the withdrawn rider above.

## Scope
1. In `e2e/town-t6-surfaces.spec.ts:96`, change the expected array to `['Enter Town', 'Claim Ledger', 'Profile', 'Settings']`. No other assertion changes; do NOT touch `StartMenu.ts` or any src.
2. **Measure before and after, and report a per-test list, not a count.** Run the suite once BEFORE your edit and once after; name each test and its desktop/mobile result both times. A bare "N green" is not evidence — if the count improves for a reason other than your one-line change, that is a finding and you should say so.
3. **If the nav renders anything other than those four entries, STOP and report the actual array verbatim.** Do NOT adjust the expectation to match whatever you observe, and do NOT touch `StartMenu.ts` to make the test pass. The shipped menu is the authority for what the test should say; a disagreement between them is an escalation, not an edit. (This is the vp-02d failure mode, s1135: a runner observed the runtime correctly and promoted its behaviour to a spec. Reporting the disagreement is the win condition here.)

## Gate
`e2e/town-t6-surfaces.spec.ts` **desktop-chrome AND mobile-chrome**, per-test list. Confirm `e2e/044-start-screen.spec.ts`, `profile-first-boot`, `m1-01` unchanged-green. `npx tsc --noEmit` clean. Zero console/page errors in every boot probe.

## Firewall
TOUCH-ONLY: `e2e/town-t6-surfaces.spec.ts`, your report.
NO: `src/**` (especially `src/ui/menu/StartMenu.ts`), any other spec, new tests, `assets/**`.

End: READY-FOR-GATES + the per-test before/after list for `town-t6-surfaces`, both projects.
