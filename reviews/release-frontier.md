# reviews/release-frontier.md — RF-01 THE RELEASE FRONTIER

**Slice:** RF-01 (lane-a / lane/m3, tip `0d30f8bad3c8a4a5d06d427ddd15212ce4306a19` `runner(lane-a): lane-release-frontier.md`)
**Drained:** s901 fire, 2026-07-22
**Verdict:** PASS — merged to main (3-way `--no-ff`, base `6d6fc7f4`).

## What it does
Caps the shipped Book at Epoch 1 in-world, without touching era logic. Adds two data on `Balance`:
`releaseFrontier: 'epoch-1-frontier'` (default; `false` = full game) and `releaseFrontierHorizonLine`
(owner-tunable copy: "The era turns when the wider world sends word."). In `TownScene`, when the frontier
flag is set, the active epoch equals it, and `?debug` is absent, the T1 Stamp-Mill door renders THE HORIZON
BEAT — a `data-door-state="horizon"` panel ("The Stamp Mill stands ready." + the horizon line) instead of the
arming action; the `site` surface returns the horizon span only. Debug + `&era=` doors bypass the frontier
entirely (testing continues past E1). No era/chapter logic changed — the secrets law already hides E2+; this
is the *in-world face* of the frontier (the build-variant enforcement is RF-05b's job, still planned).

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.45s |
| `e2e/release-frontier.spec.ts` (own spec) | 3 tests **PASS desktop + mobile** |
| `e2e/072-era-activation.spec.ts` (adjacent, modified: added `disableReleaseFrontier` helper so its arm-path assertions keep working) | **PASS both projects** |
| combined run | **15 passed / 1 skipped (49.8s)**, zero console errors |
| Player-visibility (Mistake #10) | the own spec seeds a **plain non-debug** ready-frontier profile → asserts the schoolhouse T1 door shows `data-door-state=horizon`, the horizon line text, NO `raise-stamp-mill` button, and E2 **absent from the contract board DOM** — that IS the plain-boot proof, both projects |

Screenshots: none captured — the frontier surface is **text-only house chrome** (no art renders); the no-debug
e2e asserts the exact rendered DOM (door state, horizon copy, arm-button absence, E2-absent) on desktop+mobile,
which is the visual proof. Frontier-off path also asserted (door returns to `ready`, arm re-activates E2).

## Merge classification
Base `6d6fc7f4` (lane forked here); main advanced to `be8d353e` (owner's "THE FRONTIER IS PHYSICAL" ruling) +
the s901 lock. Clean 3-way, **zero conflicts**.
- LANE-TOUCHED (4, all additive): `src/game/Balance.ts` (+2), `src/town/TownScene.ts` (+13),
  `e2e/072-era-activation.spec.ts` (+9), `e2e/release-frontier.spec.ts` (new, +133).
- MAIN-MOVED (preserved automatically): `specs/release-e1/README.md` (owner's FRONTIER-PHYSICAL section — the
  two-dot diff showed it as a phantom deletion; `git diff 6d6fc7f4..lane/m3 -- README` was **EMPTY**, i.e. the
  lane never touched it — stale-base phantom, main's owner ruling kept intact), `tasks/BACKLOG.md`,
  `tasks/goals.json`, `tasks/lane-release-build.md`, `tasks/queue/*` — none touched by the lane.

## Findings
- **F-rf01-1 (non-blocking, note):** RF-01 is a *client flag* — a hacked ledger could flip `releaseFrontier`
  to `false` and reach the arm. This is BY DESIGN for this slice; the owner's anti-hack ruling
  (`be8d353e`, "THE FRONTIER IS PHYSICAL") is enforced by the still-planned RF-05b build-variant master
  (release build excludes E2+, debug stripped, imports clamp). RF-01 is the in-world face; RF-05b is the wall.
  No action — recorded so the two aren't conflated.
