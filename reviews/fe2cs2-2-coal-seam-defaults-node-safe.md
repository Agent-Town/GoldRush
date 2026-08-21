# fe2cs2-2 — give `DEFAULT_COAL_SEAMS` a node-safe home

**Slice:** `fe2cs2-2-coal-seam-defaults-node-safe`
**Branch:** `lane/c` · **Tip:** `969bed9bd` · **Base (merge-base vs main):** `0e18c43d6`
**Merged to main:** `1968127f5e921a26c529e1363dfdaec33f45c67d` (s2144 fire, 2026-08-21)

⚠️ **THIS ONE MERGE SHIPS TWO SLICES.** `lane/c` carried `fe2cs2-1` (`98ffc1507`) beneath its own
merge of main and then `fe2cs2-2` (`969bed9bd`), so landing the lane lands the held predecessor with
its cure. Both goal leaves flip on this hash; see *Leaves* below.

## Verdict

**MERGE.** The blocking finding that held `fe2cs2-1` is cured at its cause rather than worked around,
the cure is proved by the instrument that caught the defect, and the discriminator was **manufactured
on the merged tree** rather than inferred from a green.

## What it does

`fe2cs2-1` published a contract's declared coal seams onto the agent view, and to do so
`src/agent/View.ts` imported `DEFAULT_COAL_SEAMS` from `src/systems/PressureSystem.ts`. That import
is a chain: `PressureSystem` → `src/world/Terrain.ts` → the repo's **only** `?raw` JSON import. Under
Vite `?raw` is a loader directive; under plain node it throws
`TypeError: Module "…?raw" needs an import attribute of "type: json"` **during playwright's collection
pass**, so the whole e2e suite collected nothing. **A suite that collects zero tests does not go red —
it goes empty**, and every playwright gate behind it would have passed by running nothing. That is why
s2143 held the predecessor as blocking rather than filing a nit.

The cure moves the data, not the consumer: a new dependency-free leaf `src/systems/coalSeamDefaults.ts`
holds `CoalSeamAnchor` and the three `DEFAULT_COAL_SEAMS` coordinates — **byte-identical**, with the
existing explanatory comment moved across intact rather than rewritten. `PressureSystem` imports and
**re-exports** both, so every existing importer and the `'PressureSystem.DEFAULT_COAL_SEAMS'` seam-source
string keep working unchanged; `View.ts` imports the leaf directly and no longer reaches Terrain.
`grep -rn "^export const DEFAULT_COAL_SEAMS" src/` → **1**. The array is not duplicated, which was the
one way this cure could have shipped a coordinate drift.

`src/world/Terrain.ts` and its `?raw` import are **untouched**, as the master required — making Terrain
node-safe re-baselines a great deal and is emphatically not this slice.

## Evidence

Gates run on the **merged tree** in detached `gate-s2144` (§3.0b — undecided content never entered
main's working tree; the real merge and its commit were one act, never staged).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0, 4.7 s |
| `npm run build` | rc 0, 16.3 s, `built in 1.24s` |
| `npx playwright test --list` | rc 0 — **`Total: 2958 tests in 425 files`**, no `?raw` TypeError |
| `node --test scripts/whole-suite-collection.test.mjs` | rc 0, 1.9 s |
| `node --test scripts/coal-seams-on-the-view.test.mjs` | rc 0, 5.2 s (incl. the new no-probe arm) |
| `node scripts/gate-caller-audit.test.mjs` | rc 0, 2.9 s |
| `npm run test:node-guards` (cross-cutting, F-1460-1 — the diff touches `src/systems/`) | **489 tests / 483 pass / 1 fail / 0 cancelled / 5 skipped**, 499.3 s — the one red controlled below |

### The discriminator — manufactured, not inferred

A green says nothing about the red, so the cure was reverted **one line** on the merged tree and the
instrument re-run in the same shell:

| Arm | `playwright test --list` | `?raw` TypeError |
|---|---|---|
| cure present (merged tree) | rc 0 — `Total: 2958 tests in 425 files` | absent |
| **cure reverted** — `View.ts` import pointed back at `PressureSystem` | rc 1 — **`Total: 0 tests in 0 files`** | **present** |

`src/agent/View.ts` restored afterwards and verified by **content compare**, not by the absence of dirt
(F-1295-1): SHA-256 `74fb2a8e327da9fd…` before and after, `identical: true`.

⭐ This reproduces s2143's isolation exactly — the same `0 → 2958` swing, from the opposite direction —
so the held finding and its cure are now two independent measurements of one mechanism.

### The single red is INHERITED, and it was CONTROLLED rather than excused

`same-game report exemption reasons and citations match source` fails with
`stale exemption reason for 'e2-incline'`. The master predicted it as inherited (F-2143-4) and the
runner reported it as such, but a predecessor's attribution is a **claim** (Mistake #4), so this drain
measured it: a second detached worktree at **pre-merge `main`** runs the guard standing alone →
**rc 1, 3 tests / 2 pass / 1 fail, same test, same `stale exemption reason for 'e2-incline'` message.**

The structural reading agrees: the guard's only two inputs are `docs/bench/same-game-audit.md` and
`CONTRACT_ADMISSION_EXEMPTIONS` in `src/sim/HeadlessContractSim.ts`, and **this merge touches neither** —
its five paths are `package.json`, `scripts/coal-seams-on-the-view.test.mjs`, `src/agent/View.ts`,
`src/systems/PressureSystem.ts`, `src/systems/coalSeamDefaults.ts`. The report was **not** regenerated
inside this slice, deliberately: doing so would have destroyed the red's attribution, and
`docs/bench/same-game-audit.md` is currently dirty in main's working tree under a concurrent writer.

## Merge classification

Base `0e18c43d6` (merge-base of `main` and `lane/c`). **All five paths LANE-ONLY** —
`git diff 0e18c43d6..main` is empty over each, so main moved none of them and no graft was possible.
`git merge-tree --write-tree main lane/c` returned rc 0 before merging. `main..lane/c` **empty** after.
Merged `--no-ff` and committed as one act, never left staged (F-1589-5).

ⓘ The lane's own `package.json` conflict — two slices each prepending a guard to `test:node-guards` —
was resolved by the runner inside the lane exactly as its master specified (campaign-harness guard
first, coal-seam guard second), so it never reached this drain.

## Findings

**F-2144-1 (non-blocking, observation, no cure owed) — the cross-cutting battery has drifted again, in
the same direction, and this is now the fourth consecutive re-measurement to say so.** Measured here:
**489 tests / 483 pass / 1 fail / 0 cancelled / 5 skipped in 499.3 s**, against the law's current figure
of `472 / 467 / 0 / 5` in `404.7 s` (F-2099-1, s2099). The sequence is 284 → 363 → 424 → 472 → **489**
tests and 55.6 → 181.3 → 280.9 → 404.7 → **499.3** s. ⚠️ **Part of the wall-clock is arrangement, not
growth:** this run overlapped the live `lane-d` census (`f2144-1`, dispatched by this same fire at
23:02) at load avg ~4.5, and F-2099-1 already established that this battery's margins move with machine
load. **Do not read 499.3 s as the clean-shell figure** — read it as a floor for a contended one, and
budget the duty at ≥8 minutes when a lane is live. The test COUNT (+17) is real growth and is counted,
never pruned.

**F-2144-2 (fire-side, process, non-blocking, no cure owed) — a completion probe keyed on the wrong
prefix reported a finished battery as hung for ten minutes.** This drain polled the battery log for
`^# fail`, which is TAP's spelling; `node:test`'s default reporter writes its summary as
`ℹ tests / ℹ pass / ℹ fail`. The battery had **finished normally**; the probe simply could not see it,
and the log's byte count stopped growing at exactly the moment that made the false reading look
confirmed. It was caught only by asking `ps` for the process — which reported the pid **gone**, the one
observation inconsistent with "still running". 💡 **The reusable half: when a liveness probe and a
process probe disagree, the process probe wins** — and a probe that reports "not finished" should be
suspected first when its subject has also stopped producing output, because a *working* subject that
has gone quiet and a *finished* subject look identical to a byte-count. Cost here was ten minutes of a
fire's window and nothing else. No mechanism is proposed: the fix is to read the reporter's own
vocabulary, and a guard on ad-hoc drain probes would fire on every legitimate one.

## Leaves

Both flip on `1968127f5`, in the commit immediately following the merge (§3.0's two-commit rule — a
commit cannot contain its own hash):

- `fe2cs2-2-coal-seam-defaults-node-safe`: `queued` → `merged`.
- `fe2cs2-1-publish-coal-seams-on-the-view`: `blocked` (**`gate-side`**, never an owner debt) → `merged`.
  Its recorded lift condition was verbatim *"LIFTS when fe2cs2-2 lands the node-safe leaf module and the
  collection total is non-zero again"* — both halves are satisfied and measured above, so the hold is
  discharged by satisfying it, not by re-labelling it.

## Env exceptions

None. This slice renders nothing, so no screenshots, no perf table and no zero-console probe are owed —
the one player-facing question, *"where does the player see this in a plain boot?"*, is answered
**nowhere**: the published field is on the **agent** view, and the coal seams themselves shipped earlier.
No GAZETTE item is filed for that reason (GZ-01's filter is a player-visible change).
