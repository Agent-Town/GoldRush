# Task AP-16-6C: re-land final verbs with truthful headless terminal receipts (LANE-D, commit prefix `fix:`)

**FIRE-AUTHORED s1697 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

## This is a one-seam corrective re-land

AP-16-6B passed its own review and self-checks but was **not merged**. Its exact output is preserved at `save/ap16-6b-s1697-9cf0bad0`, tip `9cf0bad00fd626c86fda3132d1a3696fc2e5ee66`. Read its one-commit diff and `reviews/ap16-6b-final-verbs-reland.md` first. Reuse the saved implementation; do not re-derive or broaden it.

## Pre-flight

The lane is reset only after the saved ref exists. A clean lane at main is expected. If either command disagrees, STOP and report:

```sh
git rev-parse save/ap16-6b-s1697-9cf0bad0
# must be 9cf0bad00fd626c86fda3132d1a3696fc2e5ee66
grep -Fc "headless bank terminals omit the reason" reviews/ap16-6b-final-verbs-reland.md
# must be 1
```

Then run the normal clean-lane pre-flight, install, and baseline build. **FACTORY-CHURN EXCEPTION (F-1407-1):** `logs/**`, `artifacts/**`, `reviews/shots-*`, and PNG evidence are discardable; tracked source/task/spec/review dirt is a STOP.

## Scope

1. Re-land the saved AP-16-6B commit unchanged on fresh main.
2. Fix F-1697-1 at its root: `HeadlessContractSim.diagnostics().run` must publish `lastRunEndedReason: "secured"` only for a banked terminal (`secureChoice === "bank"`), and `null` while the choice is pending or the run continues in rush.
3. Keep `View.ts`'s `lastRunEndedReason` boundary. Do **not** restore `runState === "secured"` as a fallback: that state also covers the pending decision and overtime.
4. Use the two existing red `gr-sim` contract drivers as the load-bearing regression. Add at most one focused assertion in an existing AP-16-6 spec if those drivers do not directly prove pending/rush stay nonterminal. No new suite or abstraction.

## Firewall

Touch only the fourteen paths in saved commit `9cf0bad00fd626c86fda3132d1a3696fc2e5ee66`, with the new correction confined to `src/sim/HeadlessContractSim.ts` and an existing AP-16-6 or `gr-sim` test if needed. No balance, PowerGraph, contract-data, rankings/API, or AP-16-7 changes. Do not re-pin a hash or expected outcome merely to make a red green.

## Self-check

- Before the fix, reproduce the two `scripts/gr-sim.test.mjs` titles named in the review as `held !== secured`; after the fix, both pass with `secured`.
- Prove pending bank/rush choice remains nonterminal and rush remains playable.
- `npx tsc --noEmit`; `npm run build`.
- Full `npm run test:node-guards` alone: zero failures.
- Re-run the AP-16-6B browser matrix and plain desktop + 390px boots with `--workers=1`; zero console/page errors.
- Regenerate the same-game audit twice and prove the second run byte-identical.

End with `READY-FOR-GATES`, the before/after receipt values, and the exact saved-ref commit replayed. If the one diagnostic field is not sufficient, STOP and name the new evidence instead of widening scope.
