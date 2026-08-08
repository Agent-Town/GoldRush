# F-1570-1 — no-trace banner column

## Verdict

READY-FOR-GATES. The classifier now names its residual bucket `NO-TRACE`, records a strict `DO NOT QUEUE` / `DO-NOT-QUEUE` marker from each master's own first six lines, and keeps bannered residuals out of the candidate count without treating declarations as shipped evidence.

The seven `TRULY-BANKED` sites in `scripts/master-shipped-classifier.mjs` were re-derived with `rg` before editing and renamed. The JSON shape now carries `counts.NO-TRACE`, `counts.CANDIDATES`, and a `banner` string on all 970 verdict records. I did not add the optional wider `SHIPPED|SUPERSEDED|RETIRED|⛔` field: the strict marker is the only input to candidate exclusion, and keeping one definition avoids merging the measured 67 and 101 populations.

## Live corpus

Default CLI rc 0. Strict CLI rc 1 because 268 candidates remain. A missing-root error also returned rc 0, preserving the advisory contract.

```text
TOTAL 970 · SHIPPED 551 · RAN-UNMERGED 84 · NO-TRACE 335, of which 67 self-declare DO NOT QUEUE → 268 candidates · DISAGREES 92
```

The required residual/candidate prediction matched exactly: **335 residual / 67 bannered / 268 candidates**. The full corpus moved from the banked s1569 snapshot's 969/550/84/335/92 to 970/551/84/335/92 while this task was in flight; I report that live aggregate rather than tuning it away. The regenerated table is `artifacts/f1570-1-live-corpus.txt`.

The evidence model is unchanged. Banner text annotates every verdict record and is displayed in the `BANNER` column, but it never contributes to `SHIPPED`. `--strict` retains its direction and now keys on `CANDIDATES`, not raw `NO-TRACE`; it remains the only non-zero path.

## Manufactured RED

I temporarily replaced the six-line match with `const banner = ''`, ran the complete fixture file, then restored the matcher by file edit.

```text
tests 7
pass 6
fail 1

✖ a no-trace master records its DO NOT QUEUE banner and is not a candidate
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

'' !== 'DO NOT QUEUE'

actual: ''
expected: 'DO NOT QUEUE'
```

After restoration, the same command returned **7 tests / 7 pass / 0 fail**. `git diff` confirms the six-line regex is restored:

```js
masterText.split('\n').slice(0, 6).join('\n').match(/DO NOT QUEUE|DO-NOT-QUEUE/i)?.[0] ?? ''
```

The boundary fixture places `DO-NOT-QUEUE` on line 9 and confirms `banner === ''` and one candidate. The bannered fixture records the exact matched text `DO NOT QUEUE` and confirms zero candidates.

## Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green; Vite **1.18 s**; asset-diet Herald **1,158,214 / 1,500,000 B**, 235 GLBs **592,044,952 → 92,718,740 B (84% cut)**, 54 plate PNGs **187,042,157 → 24,822,346 B (87% cut)** |
| `node --test scripts/master-shipped-classifier.test.mjs` | **7 tests / 7 pass / 0 fail** |
| `npm run test:ledger-guards` | rc 0; **15 files / 132 tests / 132 pass / 0 fail** |
| Live default / strict / error CLI | rc **0 / 1 / 0** |

The ledger command ran its chained leaves: findings-state PASS; blocker-panel PASS; ruling-propagation PASS; citations PASS; desk-declaration and desk-birth correctly SKIP under the live ACTIVE lock; status-archive audit clean; attended-owed audit rc 0 with its one attended-side open item; main-lock, janitor rejection, lane-dispatch safety, and NUL audits all PASS.

No Playwright and no `test:node-guards` were run or claimed: this slice touches no `src/**`, `e2e/**`, `src/sim/**`, `src/systems/**`, or `src/entities/**`.

## Scope and adjacent findings

Firewall held. No master, `tasks/**`, `STATUS.md`, spec, e2e file, source file, prior artifact, or `scripts/tmp-s1046-unshipped.mjs` was changed. No adjacent defect was found and left unfixed.

