---
status: READY-FOR-GATES
task: F-1288-3
date: 2026-07-31
---

# F-1288-3 — STOP: lane base predates `place_building`

Scope 0 cannot be run on this checkout.

| Revision | Commit | `AgentAbility` contains `place_building` | `requiredAbility(BUILD)` |
|---|---|---:|---|
| checked-out `lane/m4` | `88db2677` | no | `null` |
| `origin/main` | `19cc608b (archive: pruned by the A3 rewrite)` | yes | `'place_building'` |

The lane is 1 commit ahead and 85 commits behind `origin/main`. Its
`AgentConsentStore` registers only four abilities, so a typed state with
`place_building: true` cannot be created and the requested
capture → decode → restore four-cell control is not meaningful:

| Ability | Capture | Decode | Restore |
|---|---|---|---|
| `place_building` | unavailable | unavailable | unavailable |
| `light_duty: true` | supported | `true` | `true` |

`origin/main` does contain the exact defect described by the task:
`AgentConsent` captures and restores `place_building`, while `decodeAgent`
omits it and `normalizeLockstepAction` rejects it.

No source, test, spec, backlog, status, or git-history changes were made.
No gates were run because the mandatory preflight stopped the task before
implementation. Refresh lane-b losslessly to `origin/main`, then rerun this
task.

---

# s1288 TRIAGE — LAWFUL STOP, ACCEPTED (not a failure, and not a re-queue)

**Verdict: the runner was right and the master was wrong about one thing — it never checked that its subject existed on the lane.** Harvested to main by the authoring fire so the evidence is not stranded on a frozen branch (Retention Law).

✓ **The STOP is correct at source.** `worktrees/lane-b` is checked out at `lane/m4`, which this fire measured at **2 ahead / 87 behind main**. The report's own two-row table is the proof, and its independent re-derivation of the defect **on `origin/main`** (`:26-28`) corroborates F-1288-3 from a second vantage — the runner reached my conclusion from the opposite direction, on a checkout that could not see my code.

⚠️ **Scope 0 was an ABORT gate for the wrong state.** I wrote it to catch *"the defect is already fixed"*. It caught a third state I had not enumerated: **the subject is not present at all.** A `capture → decode → restore` control cannot be run against an `AgentConsentStore` that registers four abilities. **Naming files in READ-FIRST is not a guard; the guard has to assert the subject's presence.**

🔒 **Why the lane is stale is the real finding — see F-1288-4.** The freeze is self-perpetuating: `lane/m4` is *false*-ahead (its content is absorbed in main), the LANE-SAFETY pre-flight refuses to `reset --hard` anything ahead of main, so the worktree never advances — **and each refused task commits its own STOP report, adding another ahead-commit and deepening the freeze.** This run took it from 1 ahead to 2.

🚫 **Deliberately NOT re-queued.** §7.5 forbids an identical retry; the premise must change first, and the premise here is the lane's base. **The cure is a lossless refresh, not a re-dispatch** — and it is one command in a worktree this fire is permission-gated from entering. Tip archived at `archive/lane-b-s1288-preflight-tip` (`230dd49f`) so the refresh is provably lossless before anyone runs it.

**Loss check on the branch, at line resolution:** `src/game/Game.ts` **ABSORBED** (all added lines in main), `artifacts/county-standings/mobile-chrome.png` is regenerated screenshot evidence (never gate on byte-identity of a regenerated shot), and this review file — the only genuinely lane-only content — is now on main. **The branch holds nothing unique.**

---

# s1289 rerun — READY-FOR-GATES

**Slice:** F-1288-3 · **branch:** `lane/m4` · **base/tip before runner commit:** `7b790f04`

**Verdict:** READY-FOR-GATES. The refreshed lane reproduced both omissions, carries
`place_building` across the save decoder, and accepts it at the multiplayer
normalizer. The earlier lawful STOP remains above as history.

## Scope 0

The real game capture/normalize/restore path produced:

| Ability | Captured | Decoded before | Restored before | Decoded after | Restored after |
|---|---:|---:|---:|---:|---:|
| `place_building` | `true` | `undefined` | `false` | `true` | `true` |
| `light_duty` control | `true` | `true` | `true` | `true` | `true` |

Restore returned `true` before and after. The ABORT condition did not fire.

## Changes

- `src/game/RunSuspend.ts:2661`:
  `place_building: abilities.place_building === true,`
- `src/mp/LockstepClient.ts:1053`: added `ability === 'place_building'` to the
  existing `set_agent_ability` allow-list.
- `e2e/ap-standing-orders.spec.ts:298`: new full capture → decode → restore
  assertion for both optional abilities. The existing legacy assertion at
  `:270` remains unchanged and returns `{ok: true, placeBuilding: false}`.
- `e2e/mp-02-lockstep.spec.ts:44`: closest existing lockstep coverage now
  asserts the normalizer returns the `place_building` action. No narrower
  normalizer spec existed.

The three-boolean validation and its reason string were not touched.

## Verification

| Check | Result |
|---|---|
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS |
| `npm run test:node-guards` | PASS, 190/190 node tests plus findings/ruling guards |
| New + legacy save assertions, both projects | PASS, 4/4 |
| New multiplayer assertion, both projects | PASS, 2/2 |
| Full `ap-standing-orders.spec.ts --workers=1`, both projects | PASS, 12/12 |
| `git diff --check` | PASS |
| `git diff main -- src/` | exactly `src/game/RunSuspend.ts`, `src/mp/LockstepClient.ts` |

Grep-derived adjacent run (`--workers=1`):

| Spec | Result |
|---|---|
| `ap-standing-orders.spec.ts` | PASS 12/12 in its required standalone run |
| `m4-01-tool-surface.spec.ts` | PASS 8/8 |
| `m4-05-agent-closeout.spec.ts` | PASS 6/6 |
| `m4-09-agent-rung-clarity.spec.ts` | PASS 12/12 |
| `m4-10-agent-actions-integrity.spec.ts` | PASS 4/4 |
| `mp-02-lockstep.spec.ts` | 11 pass, 9 skip, 1 did not run, 1 unrelated red |
| `mp-balance-harness.spec.ts` | 4 pass, 2 unrelated reds |
| `pb01-intent-capture.spec.ts` | PASS 8/8 |

The `mp-02` red is the town Ride Together connection check timing out at its
existing 15-second wait; it reproduced alone. The `mp-balance-harness` reds are
the same stale expected fingerprints on desktop and mobile:
`739cb920 → 8081d388` and `113ffdf1 → 1c28471c`. Neither failing assertion nor
its owning implementation differs between `main` and this lane, and both are
outside this task's firewall; no timeout, matcher, artifact, or baseline was
changed.

`codex review --uncommitted` inspected the complete diff and affected flows but
wedged when its liveness probe waited on its own review process. It emitted no
code finding before termination. The only actionable observation was tracked
evidence regenerated by adjacent specs; those exact files were restored, leaving
only the four intended code/test paths plus this report.

---

# s1290 DRAIN — VERDICT: MERGED

**Slice:** F-1288-3 · **branch:** `lane/m4` · **lane tip:** `89558216` · **base:** `7b790f04`

**Verdict: MERGE.** The resume path carries `place_building` across both serialization boundaries;
the two reds in the adjacent battery are **pre-existing, proven by a matched control**, not caused
by this slice.

## What it does

Two lines. `RunSuspend.ts:2661` carries `place_building` out of `decodeAgent` using the `=== true`
idiom already used by `light_duty` one line above; `LockstepClient.ts:1053` adds it to the
`set_agent_ability` allow-list. Before this, saving and resuming a run silently revoked building
consent at the fresh-start default of `true` — the Prospector stopped placing buildings in the
**default** configuration.

## Merge classification

`lane-freeze-classify lane/m4` → `paths=5`, **LANE-ONLY 5, DUPLICATE 0, MAIN-ONLY 0, BOTH-MOVED 0**,
every path reporting `base == main` (main never touched them). Path-scoped checkout of exactly
those 5 files. ⚠️ The two-dot diff also listed `STATUS.md`, `tasks/BACKLOG.md` and `tasks/goals.json`
— **MAIN-MOVED by this fire's own lock commit, never touched by the lane**; the classifier's
`paths=5` is what proves it. A wholesale copy would have reverted this fire's work.

## Acceptance criteria set by s1289 — all met, mechanically

| Criterion | Result |
|---|---|
| `git diff main -- src/` = exactly `RunSuspend.ts` + `LockstepClient.ts` | **PASS** |
| No diff touching `:2578` / `:2583` (would fail EVERY pre-existing save) | **PASS** — untouched |
| Legacy test still returns `{ok:true, placeBuilding:false}` | **PASS** — `:270` green both projects |

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **PASS** |
| `npm run build` | **PASS**, 2.22 s |
| Own spec `ap-standing-orders.spec.ts` `--workers=1`, both projects | **PASS 12/12** |
| — `:270` legacy save (the named trap) | **PASS** both projects |
| — `:298` new place-building round-trip | **PASS** both projects |
| `m4-01-tool-surface` | **PASS 8/8** |
| `m4-05-agent-closeout` | **PASS 6/6** |
| `m4-09-agent-rung-clarity` | **PASS 12/12** |
| `m4-10-agent-actions-integrity` | **PASS 4/4** |
| `run-suspend` | **PASS 8/8** |
| `restore-validation` | 34/36 — 2 pre-existing, see below |
| `mp-02-lockstep` (full 491 s run) | 11 passed / 1 failed — pre-existing, see below |

Adjacents **grep-derived**, not inherited from the runner's list
(`grep -rlE "place_building|placeBuilding|set_agent_ability|decodeAgent|light_duty" e2e/`), plus
`run-suspend` and `restore-validation` because `RunSuspend.ts` owns them. Every arm records its
literal `Running N tests using 1 worker` line (F-1217-2) and an `executed=YES` proof.

## The two reds, attributed by CONTROL rather than by argument

Control arm = `src/` and `e2e/` reverted to clean main (`git diff HEAD --stat -- src/ e2e/` empty),
same shell, same hour, same `--workers=1`.

**1. `restore-validation.spec.ts:656` — PRE-EXISTING.** Fails on **both** arms, **both** projects.
Matches the known finding **F-1095-1** (`BACKLOG:1745`: same file, same line, "fails on both
projects, deterministically", "Pre-existing-and-exposed, NOT slice-caused").
⭐ The control arm was **noisier than the treatment**: control 29/36 (7 reds — `:186`, `:549`,
`:620`, `:656`) vs treatment 34/36 (2 reds — `:656` only). `:186`/`:549`/`:620` passed *under* the
merge and failed *without* it, so no honest reading makes this merge a regression.

**2. `mp-02-lockstep` "town Ride Together card creates a claim word and joins two named riders" —
PRE-EXISTING.** Control `:629`, treatment `:638` — **the same test**, offset by exactly the **+9
lines this merge adds to that spec file**. Cite the test, never the coordinate. This is also
precisely the red the runner itself reported ("the town Ride Together connection check timing out
at its existing 15-second wait").

**3. `mp-02-lockstep.spec.ts:134` "two clients advance 500 ticks with identical lockstep hashes" —
A FLAKE OF A TRUNCATED RUN, NOT A DETERMINISM REGRESSION.** It went red in the first treatment
battery — and it was the one adjacent red a `LockstepClient` change could plausibly cause, so it
was the one worth being slowest about. That run finished in **90 s** with **8 of 22 tests never
executed**; the control took **483 s**. Re-run complete on the treatment arm (**491 s, 22 tests**):
`:134` **PASSED**, and the only red was the Ride Together test.
⚡ **A red from a run that did not finish is not a red — and the incomplete run was the one that
accused my own diff.**

## Findings

- **F-1290-2 — the instrument reported `0 failed` twice while executing nothing.** Two full
  adjacent batteries exited rc=1 in **0 s per spec** because an orphaned dev server held port 5188
  and `playwright.config.ts:42` sets `reuseExistingServer: false`; a naive parse of `failed=` found
  no failures. **A probe that executes nothing reports zero, and zero reads exactly like green.**
  The probe now refuses to start while 5188 is held, and stamps each arm `executed=YES/NO` from the
  literal worker line — an arm without one is marked `RESULT IS NOT EVIDENCE` rather than counted.
- No blocking findings against the slice. `:2578`/`:2583` untouched; firewall exact.
