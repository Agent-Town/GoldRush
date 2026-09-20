# Version rigor — declared harnesses name their version

**Slice:** `lane-d-version-rigor.md`
**Branch / tip:** `lane/d` / `8e53834ff39252170f457e8e48dcf7b10818e21b`
**Merge:** `a41ae5be8eb688878c846f4d7cb28e097025b092`
**Verdict:** **MERGED — new standings cannot declare a harness without a non-blank version; stored Season-1 rows remain valid history.**

## What it does

The standings POST validator now rejects a named harness whose version is absent or blank. Model-only and undeclared riders remain legal, while the stored-row read path deliberately keeps older version-less declarations. The public skill states the same rule. Four route tests cover the accepted, rejected, undeclared/model-only, and historical-row paths.

## Evidence

| Gate | Result |
|---|---|
| `drain-block-check --strict` | CLEAR before detached gate and merge |
| Runtime | Node `26.4.0`, npm `11.17.0` |
| `npx tsc --noEmit` | PASS |
| `npm run build` | PASS; Vite built in 1.49 s; asset diet green |
| Three standings suites, both projects | 50/50 PASS in 57.5 s; desktop and 390 px mobile, `--workers=1`; plain-boot console/page-error assertions green |
| Diff-selected non-node guards | 7/7 PASS; power p95 0.329 ms; stats, accounts, multiplayer, task, citation, and gate-caller arms green |
| Standalone `test:node-guards` | 458 tests / 453 pass / 5 intentional skips / 0 fail in 508.5 s |

Full append-only transcript: `artifacts/version-rigor-gate-s1714.txt`.

## Merge classification

Base `0b5c2fe914d3d3f89c9d6978de3b115782849c00`. Before merge, each candidate path had the same blob on main as at the lane base, so all three were LANE-TOUCHED only. The branch merged without conflict after the complete detached battery.

| Path | Classification | Decision |
|---|---|---|
| `functions/api/standings.ts` | LANE-TOUCHED | Keep the shared POST validator guard and stored-history exception |
| `public/skill.md` | LANE-TOUCHED | Keep the one-sentence honesty law |
| `e2e/lb-01-county-standings.spec.ts` | LANE-TOUCHED | Keep the four route-level cases |

## Findings

- **F-1713-1 remains non-blocking gate-infrastructure debt.** This standalone Node 26 run finished in 508.5 seconds, but the immediately preceding identical battery took 637.6 seconds and was SIGTERM-killed by `run-guards` at its fixed 600-second outer ceiling. Preserve the per-test timeouts; correct only the outer wrapper budget.
- A fresh final Heat-3 Omp arm existed during this gate but was sleeping at 0% CPU. The power control passed at 0.329 ms p95 and every timing-sensitive arm stayed green, so no load exception was used.
