# Version rigor — s1712 gate hold

## Slice

- Branch: `lane/d`
- Tip: `8e53834ff39252170f457e8e48dcf7b10818e21b`
- Base: `0b5c2fe914d3d3f89c9d6978de3b115782849c00`
- Detached candidate: `5090faee2c2456ad1d4d48a7717f3a5ae995937e`

## Verdict

**HOLD — NOT MERGED.** The validator change is in scope and its own 26 browser cases passed, but the required adjacent gate found six deterministic fixture casualties across desktop and 390 px mobile. `e2e/field-book.spec.ts` and `e2e/milk-county-board.spec.ts` still POST harness declarations without versions, so the new validator correctly returns `bad_payload` before those tests reach their intended aggregation and party assertions.

## What it does

New submissions that declare `stack.harness` must also declare a non-blank `stack.harnessVersion`; stored Season-1 rows keep their historical shape. The public skill states the same law, and route tests cover accepted, rejected, undeclared, model-only, and stored-row cases.

## Evidence

Full transcript: `artifacts/version-rigor-gate-s1712.txt`.

| Gate | Result |
| --- | --- |
| Live goal policy | CLEAR |
| `npx tsc --noEmit` | PASS, 5.6 s |
| `npm run build` | PASS, 34.1 s |
| Diff-selected worker guards | `test:stats` PASS 12 s; `test:accounts` PASS 3 s; `test:mp` PASS 5 s; task/citation/caller guards PASS |
| Full node guard | Environment-red under Node 23.11.1 at `node-guards-timeout.test.mjs`; its own diagnosis requires the `.nvmrc` Node 26.4.0 pin (standing F-1507-1) |
| Power budget | Load-red at 0.994 ms p95 versus 0.500 ms while a separate heat-3 player was live outside this repo |
| Browser, three standings suites, both projects | 44 PASS / 6 FAIL in 126.7 s; all 6 failures are the version-less fixture class below |

## Merge classification

All three candidate paths are LANE-TOUCHED only. Main did not move any of them after the lane base.

| Path | Classification | Decision |
| --- | --- | --- |
| `functions/api/standings.ts` | LANE-TOUCHED | Correct validator seam; held with the slice |
| `public/skill.md` | LANE-TOUCHED | One lawful honesty-law sentence; held with the slice |
| `e2e/lb-01-county-standings.spec.ts` | LANE-TOUCHED | Own route and plain-boot coverage; held with the slice |

## Findings

- **F-1712-1 — BLOCKING, corrective queued.** `e2e/field-book.spec.ts:95-98` posts four harness-bearing stacks without `harnessVersion`; `e2e/milk-county-board.spec.ts:114-116` does the same in two shared party fixtures. The candidate returns 400 for those submissions, causing the Field Book aggregation test and two party tests to fail on both projects. Corrective: `tasks/lane-a-f1712-1-standings-fixtures.md`. Add fixture versions only; do not weaken the validator or reclassify historical stored rows.
