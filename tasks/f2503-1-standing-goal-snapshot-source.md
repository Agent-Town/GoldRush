# Task F-2503-1: make the verified standing come from the secure event, not the rider (lane-a, commit prefix "fix:")

FIRE-AUTHORED s2503 (attended review welcome)

LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: e2e/standing-formula-explained.spec.ts
EXPECTED-HOLDS: functions/api/standings.ts
EXPECTED-HOLDS: public/skill.md
EXPECTED-HOLDS: reviews/shots-standing-formula-explained/desktop-chrome.png
EXPECTED-HOLDS: reviews/shots-standing-formula-explained/mobile-chrome.png
EXPECTED-HOLDS: scripts/skillmd-guard.test.mjs
EXPECTED-HOLDS: scripts/standing-rule-surfaces.test.mjs
EXPECTED-HOLDS: scripts/test-standings.mjs
EXPECTED-HOLDS: site/assay-office.js
EXPECTED-HOLDS: site/index.html
EXPECTED-HOLDS: site/standing-rule.d.ts
EXPECTED-HOLDS: site/standing-rule.js
EXPECTED-HOLDS: src/game/Game.ts
EXPECTED-HOLDS: src/ui/DeathOverlay.ts
EXPECTED-HOLDS: tasks/BACKLOG.md

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

Read first: `AGENTS.md`; the predecessor master from main with `git show main:tasks/standing-formula-explained.md`; the gate finding with `git show main:reviews/standing-formula-explained.md`; `src/game/RunManager.ts` at the `run_secured` emission; the same event handler in `src/sim/HeadlessContractSim.ts`; `src/replay/AgentTapeReplay.ts`; `scripts/assay-replay.mjs`; `scripts/assay-worker.mjs`; the assay-verdict handler in `functions/api/standings.ts`; and the existing run-suspend capture/restore path.

## Pre-flight — extend the held lane

`lane/a` must still be at `d3814a1af` or an obvious descendant, and its held paths must be exactly the EXPECTED-HOLDS set above. Confirm the predecessor anchor appears exactly once:

```sh
git grep -Fc "securedSnapshot = tape && current.find" lane/a -- functions/api/standings.ts
```

It must print `1`. Do not reset, rebase, clean tracked files or merge main into this lane. The predecessor is complete work that this corrective extends. STOP if the tip is unrelated or any tracked held path falls outside the declared set. The FACTORY-CHURN EXCEPTION applies (F-1407-1): untracked `logs/**`, `artifacts/**`, `reviews/shots-*` and image churn are expected; list them and proceed.

## Goal

Preserve the predecessor's comparator, shared rule text and UI. Replace its client-first authority with one immutable verified snapshot `{ waves, gold, timeAlive }` captured at the canonical `run_secured` event.

The same secure-event snapshot must flow through browser and headless replay. The assay worker sends it only after a successful replay; the assay-verdict endpoint validates it and rewrites the pending row's standing fields before that row can rank. The public score submission schema must not accept a rider-declared goal snapshot. Keep final tape-outcome verification intact.

A suspended Rush run must restore the same browser snapshot so the score screen and eventual submission still show the official-goal values after reload. Reuse the existing run-suspend state; do not add a parallel persistence abstraction.

The predecessor's first-write check may remain as optimistic duplicate suppression, but it is not evidence and must not decide a verified standing. E10 preserve ranking, party rows, operator-probe exclusion and all contract/order/balance semantics stay unchanged.

## Minimum proof

1. A headless Rush tape secures, continues, and finishes with different values. Replay returns both the final outcome and the earlier `run_secured` snapshot.
2. The assay worker's verified verdict carries that snapshot, and the endpoint ranks the rewritten secure values. A one-shot overtime submission cannot freeze its final values.
3. A public POST containing a forged goal-snapshot field cannot influence storage or rank.
4. A browser suspend/resume after securing retains the original snapshot; the focused desktop and 390px e2e proves it with zero console/page errors.
5. Existing standings fixtures and the predecessor's three-surface rule test remain green.

## Firewall

Touch the predecessor's held paths plus only the existing source and tests needed for this transport: `src/sim/HeadlessContractSim.ts`, `src/replay/AgentTapeReplay.ts`, `scripts/assay-replay.mjs`, `scripts/assay-worker.mjs`, `scripts/assay-worker.test.mjs`, `src/game/RunSuspend.ts`, `src/game/RunManager.ts` and focused existing/new tests. No balance, contract, seed, event ordering, public assay internals, era pin or unrelated standings branch changes.

## Self-check

Run `npx tsc --noEmit`, `npm run build`, `npm run test:stats`, the focused assay/replay and standings tests, and the focused desktop + 390px e2e. Because this task touches `src/sim/**`, run the complete `npm run test:node-guards` alone, with no concurrent local test process. End `READY-FOR-GATES` with the one-shot overtime before/after row, the suspend/resume snapshot, exact counts and screenshot paths.

## Honesty guard

If the authoritative snapshot cannot be derived without changing the canonical `run_secured` event or contract semantics, STOP and report the coupling. Do not accept a client field or use first-write retention as a substitute.
