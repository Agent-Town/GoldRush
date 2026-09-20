# F-1285-3 №2 — BUILD consent ability gate

READY-FOR-GATES → **MERGED (s1288 drain verdict at the foot of this file)**

## Result

`requiredAbility()` now maps `BUILD` to the existing `place_building` ability. At rung 3, revoking the player-facing checkbox refuses a submitted BUILD standing order with:

`BUILD requires the granted place_building ability.`

The existing seeded test, **"seeded standing orders obey priority, gates, legal actions, surprises, and the live rung"**, carries the regression assertion. It opens the Prospector panel at rung 3, revokes `place_building`, submits BUILD, asserts `PERMISSION_DENIED` plus an empty order view, then grants the ability again before continuing the existing lifecycle.

Production scope is one added line in `src/agent/StandingOrders.ts`; `requiredLevel()` and `AgentConsent.ts` are unchanged.

## Lane safety and baseline

- `node scripts/lane-freeze-classify.mjs lane/m3`: ahead 1, 6/6 `DUPLICATE`, 0 lane-only, 0 both-moved, `LOSS-FREE`.
- Reset `lane/m3` to `main` as instructed; no uncommitted work existed.
- `npm install --no-audit --no-fund`: up to date.
- Pre-edit `npm run build`: green.

## Direct probe

Instrument: `logs/session-scratch/s1287-lane-a/consent-ability-probe.mjs`, using the scratch-only loader to call the private production `permissionDenial()` directly.

| Cell | Before | After |
|---|---|---|
| BUILD revoked | `null` | `BUILD requires the granted place_building ability.` |
| BUILD granted | `null` | `null` |
| REPAIR_UNDER revoked | `REPAIR_UNDER requires the granted auto_repair ability.` | same |
| REPAIR_UNDER granted | `null` | `null` |

The pre-fix BUILD defect reproduced and the REPAIR_UNDER control denied as required.

## Verification

- `npx tsc --noEmit`: clean after the final edit.
- `npm run build`: green after the final edit.
- Focused `scripts/agent-rung-conformance.test.mjs`: 3/3 passed.
- `npx playwright test e2e/ap-standing-orders.spec.ts --workers=1`: **10/10 passed**, desktop and mobile.
  - **"seeded standing orders obey priority, gates, legal actions, surprises, and the live rung"**: 2/2 passed.
  - **"consent restores a save from before place-building existed"**: 2/2 passed.
- `git diff main -- src/` file list: only `src/agent/StandingOrders.ts`.
- `git diff --check`: clean.

The required full `npm run test:node-guards` is not green on this `main`: **188/190 passed, rc=1**. Both failures have the same pre-existing cause outside the firewall: `tasks/goals.json` records `mergeHash: "4e3f1797"` instead of a 40-character hash, failing **"goal tree schema is valid"** and its fixture-teardown meta-test. `git diff main -- tasks/goals.json` is empty. The neighboring agent rung guard passes.

## Grep-derived adjacent suites

Command used: `grep -rln "place_building\|permissionDenial\|requiredAbility\|standing" e2e/`.

| Spec | Result at `--workers=1` |
|---|---|
| `e2e/agent-view.spec.ts` | 2/2 passed |
| `e2e/ap-standing-orders.spec.ts` | 10/10 passed |
| `e2e/lb-01-county-standings.spec.ts` | 16/16 passed |
| `e2e/m2-07-base-self-hold.spec.ts` | 4/6 passed; known unrelated blast-clump TTK red on both projects, ratio 6.5 vs ≤2 |
| `e2e/m4-01-tool-surface.spec.ts` | 8/8 passed |
| `e2e/m4-05-agent-closeout.spec.ts` | 6/6 passed |
| `e2e/m4-09-agent-rung-clarity.spec.ts` | 12/12 passed |
| `e2e/m4-10-agent-actions-integrity.spec.ts` | 4/4 passed |

## Second-opinion triage

`codex review --uncommitted` found no issue in the one-line mapping or its regression assertion. It raised the real neighboring P2 that `RunSuspend.decodeAgent()` drops `place_building`, which can default building consent off after resume. That is F-1285-3 №3, explicitly outside this task's touch-only firewall, so it is reported here and not fixed.

F-1285-3 №1 and №4 likewise remain unchanged.

## Discarded generated evidence

The required adjacent runs regenerated tracked PNG evidence. Per the task's evidence-artifact exception, these changes were discarded:

- `artifacts/agent-rung-clarity/panel-rung0-390.png`
- `artifacts/agent-rung-clarity/panel-rung0-desktop.png`
- `artifacts/county-standings/mobile-chrome.png`
- `artifacts/m4-10/agent-repair-receipt-desktop-chrome.png`
- `artifacts/m4-10/panel-real-functions-desktop-chrome.png`
- `reviews/shots-ap-06b-adapter-reland/plain-boot-desktop-chrome.png`
- `reviews/shots-ap-06b-adapter-reland/plain-boot-mobile-chrome.png`

---

# DRAIN VERDICT — s1288 (2026-07-31)

**MERGED.** Slice `lane-a-f1285-3-build-consent-ability-gate` · branch `lane/m3` · tip `052ca3a0` · base `986bffbb`.

## What it does

`requiredAbility()` gains one line mapping `BUILD → 'place_building'`, so `permissionDenial()`'s third gate now fires for BUILD orders. **The player-visible effect:** un-ticking *"Let the Prospector place buildings"* now actually withholds consent — before this the checkbox was decorative for BUILD at rung 3, the one state it exists to express. `requiredLevel()` is untouched, so the owner-ruled rung ladder is unmoved (s1287's explicit rejection criterion, checked and satisfied).

## Merge classification — no graft judgement was needed, and that was proven rather than assumed

`node scripts/lane-freeze-classify.mjs lane/m3` → `paths=5`, **LANE-ONLY 5 · BOTH-MOVED 0 · MAIN-ONLY 0**; every lane path reads `main == base`.

| Path | Class |
|---|---|
| `src/agent/StandingOrders.ts` | LANE-TOUCHED (`base=ed72408b lane=da917a99 main=ed72408b`) |
| `e2e/ap-standing-orders.spec.ts` | LANE-TOUCHED (`base=9e6932f0 lane=eec7def0 main=9e6932f0`) |
| `reviews/f1285-3-build-consent-ability-gate.md` | LANE-ONLY (new) |
| `logs/session-scratch/s1287-lane-a/{consent-ability-probe,ts-loader}.mjs` | LANE-ONLY (new) |

⚠️ **The two-dot diff `main..lane/m3` additionally lists `STATUS.md`, `tasks/BACKLOG.md` (`-4`) and `tasks/goals.json` — none of which the lane touched.** Those are **MAIN-MOVED**: this fire's own three commits (`02055918`, `e6a84173`, `28b23fd7`) landed after the lane's base. **A wholesale copy would have reverted the F-1288-1 fix and both new ledger rows.** Grafted the five classified paths only; post-graft `git diff lane/m3 -- <those five>` is **empty** (byte-identical to the tip) and `tasks/goals.json` still carries the repaired 40-character hash.

## Evidence (all re-derived on the merged tree, not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 2.10 s; dev-path art 1,158,214 B under the 1,500,000 B ceiling |
| Own spec `--workers=1`, both projects | **10/10** (37.3 s) |
| Adjacent `--workers=1`, both projects | **30/30** (1.7 m), **zero reds** |
| Console/page errors | `consoleErrors === []` asserted in-spec at `:231`, `:266`, `:365`, both projects |
| `git diff main -- src/` | `src/agent/StandingOrders.ts` only — acceptance criterion met |

**Adjacent set re-derived rather than inherited** (house law: derive by grep). My grep `place_building\|permissionDenial\|requiredAbility\|StandingOrder` returns **5** specs; the runner's used the looser token `standing`, which additionally matched `lb-01-county-standings` and `agent-view` — *county standings is an unrelated concept* — and `m2-07-base-self-hold`, the source of the only red in the runner's adjacent table (a known blast-clump TTK red it correctly called unrelated). **The better-aimed set is fully green, so that red never needed adjudicating.**

⭐ **`consent restores a save from before place-building existed` passes 2/2** — the `AgentConsent.restoreFutureState` trap s1287 named as this slice's main hazard is closed by direct evidence, not by argument.

## Findings

- **F-1288-1 (mine, closed by repair before this drain) — the runner's mandated `test:node-guards` red is NOT this slice's.** Its report records `188/190, rc=1` caused by `tasks/goals.json` holding an abbreviated `mergeHash`, a file its own firewall forbids it to touch. Cured on main by `e6a84173`. ✓ **The runner diagnosed it correctly and did not "fix" it out of scope — exactly right.**
- **Blast radius corrected from the runner's report, mechanism read at source:** the bad string reddened **two** tests, not one. `scripts/fixture-teardown.test.mjs:36-40` re-executes every `mkdtemp`-using `scripts/*.test.mjs` as a child and asserts `run.status === 0`; `goal-tracker.test.mjs` uses `mkdtemp`, so it is a subject and its non-zero child exit reds the meta-guard too. **A malformed string in a data file reddened a guard that never reads that file.**
- **No findings against the slice.** Scope, firewall and evidence all match the master.

## Owed onward (correctly outside this firewall, not fixed here)

F-1285-3 **⑴** (rung-1 side-effect gate vs rung-3 capability — *owner-gated, rides on the F-1279-2 ladder question*), **⑶** `RunSuspend.decodeAgent` drops `place_building`, **⑷** `LockstepClient.normalizeLockstepAction` drops it. ⑶ and ⑷ were verified at source by this drain — see the s1288 handoff.
