# E9 roster regression bisect

Date: 2026-08-07  
Predicate: `npx playwright test e2e/e9-roster.spec.ts --workers=1` in this worktree and shell.

## Validated endpoints

| Revision | Result | Verdict |
|---|---:|---|
| `eb3a8a01200b57cbbfce73ddc44898361669b391` | 6 passed | GOOD |
| `2d8872dda1dfbc38bbf28346f53bff51a9bdef00` (lane/main head at pre-flight) | 4 failed, 2 passed | BAD |

The predicate distinguished both endpoints exactly as required before the bisect began.

## Bisect log

| Revision | Result | Verdict | Subject |
|---|---:|---|---|
| `87b27cda37a3` | 6 passed | GOOD | s1353: discharge F-1345-2's GATE by measurement |
| `928695addffb` | 6 passed | GOOD | s1443: correct reviews/lane-boss-healthbar-steady.md |
| `84bf12a545cb` | 5 failed, 1 passed | BAD | s1470 handoff: f1464-1 halo batch merged |
| `52664cf2c9d4` | 4 failed, 2 passed | BAD | drain: the far ground |
| `5edec1c3e1ec` | 6 passed | GOOD | s1452 handoff: f1451-1 merged |
| `519b9722ce33` | 6 passed | GOOD | s1455: mechanize the stale-HOLD-verdict class |
| `e883ba1c7131` | 6 passed | GOOD | ops: bind MULTIPLAYER_RATE_LIMITS |
| `290419c71935` | 4 failed, 2 passed | BAD | Merge branch `lane/c` into HEAD |
| `d8c0a7c8ce9d` | 6 passed | GOOD | gazette: GZ-L1 review |
| `a9250ba1d3f2` | 6 passed | GOOD | Merge branch `beauty2/gazette-living` into HEAD |
| `9146212fc36d` | 4 failed, 2 passed | BAD | runner(lane-c): lane-tape-02-lantern-show.md |

At `84bf12a545cb`, the two target titles failed in both projects with the same values as the bad endpoint; the fifth failure was the other roster title and did not change the target predicate.

## Culprit

First bad commit: `9146212fc36dd751d2c5b952bd23e8ff967eb75b` — `runner(lane-c): lane-tape-02-lantern-show.md`.

`git show --stat`:

```text
e2e/tape-02-lantern-show.spec.ts                   | 152 +++++++++++
reviews/shots-tape-02/desktop-chrome-lantern-show.png | Bin 0 -> 988093 bytes
reviews/shots-tape-02/desktop-chrome-version-refusal.png | Bin 0 -> 348618 bytes
reviews/shots-tape-02/mobile-chrome-lantern-show.png | Bin 0 -> 1530713 bytes
reviews/shots-tape-02/mobile-chrome-version-refusal.png | Bin 0 -> 422759 bytes
src/core/Loop.ts                                   |   7 +-
src/game/Game.ts                                   | 244 ++++++++++++++++--
src/game/ProfileStorage.ts                         |  11 +
src/game/RunTape.ts                                |  25 +-
src/main.ts                                        |  64 ++++-
src/meta/ContractFamilies.ts                       |  12 +-
src/playbook/PlaybookSession.ts                    |   3 +-
src/styles.css                                     |  79 ++++++
src/town/TownScene.ts                              |   6 +
src/ui/LanternShow.ts                              | 279 +++++++++++++++++++++
15 files changed, 841 insertions(+), 41 deletions(-)
```

## Failing assertions and diagnosis

### E9 placeholders preserve siege/thief flags and cure-arms exits

Assertion: `expect(result.cure.fires.terraformCannon).toBeGreaterThan(0)` at `e2e/e9-roster.spec.ts:159`.

- Expected: greater than `0`
- Received: `0`
- Reproduced in desktop and mobile Chrome.

### plain Red Fields boot stays error-free without the debug harness

Assertion: `expect(window.__THREE_GAME_DIAGNOSTICS__.e9Arsenal.eraActive).toBe(true)` at `e2e/e9-roster.spec.ts:178`.

- Expected: `true`
- Received: `false`
- Reproduced in desktop and mobile Chrome.

The culprit replaced `selectActiveEpoch()` with the epoch owning `activeContract`. Seed Run is deliberately unavailable (`harvestAnchors: []`), so contract selection falls back to the E1 Claim contract in both probes. The new line therefore changed the game's active epoch from the requested/persisted E9 to the fallback contract's E1. `E9ArsenalSystem` gates on `activeEpoch.order >= 9`; E1 makes that predicate false, directly producing both observed values: the cannon never fires (`0`) and diagnostics publish `eraActive: false`.

## Cure branch

Scope 5 taken: the cure is three source lines and is directly provable. Contract-derived epoch selection is retained only for `?replay=...` Lantern routes, the behavior the culprit introduced it for. Ordinary and debug runs again use `selectActiveEpoch()`. No test or inventory file was changed.

## Verification

- Pre-flight and final `npm run build`: passed.
- Final `npx tsc --noEmit`: passed.
- Final `e2e/e9-roster.spec.ts --workers=1`: 6 passed across desktop and mobile Chrome (before cure: 4 failed, 2 passed).
- `grep -rln "Game.ts" e2e --include='*.spec.ts'` derived four literal source-consumer specs; those four passed in both projects.
- The owning `e2e/tape-02-lantern-show.spec.ts` passed on desktop. Its mobile run missed the transient intertitle once, then passed in isolated re-run (1 passed).
- The directly related E9 arsenal battery reproduced its existing Cure-Arms failure in both projects; `red-inventory-lookup` classified the exact title and assertion as `KNOWN-RED` with the recorded 75% blast radius.
- The optional node-guard battery was 343/345. Both reported failures reduce to the unchanged `scripts/node-guards-timeout.test.mjs` fixture timing out at 1000 ms; an isolated re-run reproduced it. This cure changes no `scripts/**` file, and node guards are not mandatory for a `src/game/**`-only cure under this task.
