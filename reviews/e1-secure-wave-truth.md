# e1-secure-wave-truth — drain review (s1068)

**Slice:** `lane-e1-secure-wave-truth.md` (E1 release blocker: two maps must state how they are won)
**Branch:** `lane/m3` · **Tip:** `4401778f3e17e4db5c800bed3c17523b48b2fdf8` (`runner(lane-a)`, 2026-07-26T07:31:35+07)
**Lane base:** `ab7cba01` · **Merged onto:** `026fcb99` (clean main)
**Verdict: MERGE — and it repairs a red that was already live on main.**

## What it does

Two E1 contracts (`e1-dry-gulch`, `e1-twin-banks`) inherited their secure wave silently from
`Balance.run.secureWave: 20` and their briefing cards never said so — while the three maps around them
(`the-claim` 10, `e1-night-shift` 25, `e1-baron` 20) all state theirs. The unlock order made it sharp:
`e1-dry-gulch.boardRow.unlock = "wave10OnClaim"`, so the player arrives having just been taught
"secured = wave 10" and is handed 20 with no notice.

The slice does two things, both minimal: it prepends the win condition to each card's goals
("Hold the gulch through wave 20." / "Hold both banks through wave 20.") and sets `twist.secureWave: 20`
explicitly on both rows. The data change is behaviour-identical today — 20 was already the resolved
value — but it stops the number being an invisible inheritance. No `src/`, no wave retuning.

## Merge classification

| File | Class | Handling |
|---|---|---|
| `assets/contracts/epoch-1-frontier/contracts.json` | LANE-TOUCHED only | straight graft |
| `e2e/contract-briefings.spec.ts` | LANE-TOUCHED only | straight graft |

`git diff ab7cba01 main -- <both files>` is **empty** — main never moved either file after the lane's
base, so no 3-way was needed and no main-side hunk was at risk. TOUCH-ONLY was respected exactly:
the commit is 2 files, +20/−8, and touches nothing on its NO list.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (no output) |
| `npm run build` | **green** — `✓ built in 1.59s`; asset-diet 235 GLBs 84% cut, 53 PNGs 87% cut |
| Own spec — desktop, `--workers=1` | **5 passed / 2 failed** (clean main: 4 passed / **3** failed) |
| Own spec — mobile 390px, `--workers=1` | **5 passed / 2 failed** — identical two |
| Adjacent: `board-era-chapters` + `board-gating-and-profiles` | **4/4 green** |
| Adjacent: `061-first-claim-onboarding` | 1 passed / 3 failed — **fingerprint-matched pre-existing** (identical 3 test names on clean main) |
| Dedicated capture, desktop + 390px | **4/4 passed**, zero console + zero page errors |
| Screenshots | `reviews/shots-e1-secure-wave-truth/{desktop,mobile}-chrome-e1-{dry-gulch,twin-banks}.png` |

The capture spec is tracked at `artifacts/secure-wave-shots/shots.spec.ts`. Its runner,
`playwright.securewave.config.ts`, is **untracked by house convention** — `.gitignore:26` is
`playwright.s*.config.ts`, i.e. scratch gate configs stay out of git; it remains on disk. To recreate:
`testDir: './artifacts/secure-wave-shots'`, `webServer: npm run dev -- --port 5233 --strictPort`,
projects desktop-chrome 1280×800 and mobile-chrome 390×844, both `channel: 'chromium'`. Scratch port
5233 was chosen so it could not collide with the attended session's live 5207/5231/5247. The capture
asserts the rendered card contains "wave 20" **and** that
`__THREE_GAME_DIAGNOSTICS__.contract.secureWave === 20` on both maps. That closes the master's own
open item — it listed criterion #3 as **✗ UNVERIFIED** ("the review saw `run.secureWave` read `null`
at boot on the Claim … must be checked before it is used as the assertion"). It is now **✓ VERIFIED**:
the field resolves and agrees with the card on both maps, both viewports.

## Findings

### F-1068-1 — main was RED before this drain, and the slice is the repair (resolved by merging)
Clean main fails `every current contract launch shows manifest briefing goals and rules`:

```
- Expected: "Pan. Build. Hold the claim."
+ Received: "Hold the claim through wave 10."
```

The attended leg-1 landing put the new `the-claim` copy into `contracts.json` but left
`e2e/contract-briefings.spec.ts` asserting the old line. Data and spec have contradicted each other on
main since. This slice's spec hunk updates `the-claim` to the shipped copy, and that test **passes with
the graft and fails without it**. Net on the slice's own suite: **3 reds → 2**.

### F-1068-2 — `contract.fallbackReason === "debug-disabled"` on a plain, no-debug boot (was MASKED)
`plain no-debug board launch still briefs The Claim` now reaches line 363 and fails there:
`expect(fallbackReason).toBeNull()` receives `"debug-disabled"`. On clean main this test died earlier,
at the F-1068-1 copy mismatch, so **the copy red was hiding it**. This is Mistake #10 shape — what the
player sees in a plain boot — and it is E1-release-verdict material.
**Not introduced here:** this slice changes only contract copy and two `twist` values; it cannot set a
contract-loading fallback reason.

### F-1068-3 — `e1-baron` board card is locked where the spec expects it unlocked (was MASKED)
`board cards show the same briefing data` fails on
`data-contract-locked` = `"true"`, expected `"false"` (the id is in the spec's `UNLOCKED_BOARD_CONTRACTS`).
On clean main this test failed earlier at a `toContainText` copy assertion — again masked. The slice does
not touch `UNLOCKED_BOARD_CONTRACTS` or any unlock rule.

> F-1068-2 and F-1068-3 are the honest cost of the repair: fixing the copy contradiction lets both tests
> run *further*, where they hit pre-existing defects that the earlier red was concealing. The suite is
> more truthful after this merge than before it, and 1 fewer red. Neither is fire-fixable — both sit in
> the E1 area the attended session is actively holding — so they are written up, not patched.
> **Corrective master: `tasks/e1-briefing-truth-unmasked.md` (authored, deliberately NOT queued —
> `lane/m3` still carries the undrained `2d0739f5`, so LANE-SAFETY forbids a lane-a refill).**

### F-1068-4 — `061-first-claim-onboarding` 3 reds are pre-existing and untouched
Same 3 test names fail on clean main with the graft reverted (1 passed / 3 failed, both runs).
Recorded so the next fire does not attribute them to this merge.

## Note for the attended session

This landed while your E1-depth campaign was live in `gr-task-e1-gameplay` on
`review/e1-gameplay-depth`. It was safe to merge because the worktrees are disjoint and this slice's
files are not the ones you are editing — but F-1068-2 and F-1068-3 both bear directly on the E1 release
verdict you are writing, and F-1068-1 means the pre-drain main was contradicting itself on your own
leg-1 copy change.
