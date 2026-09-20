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



# DRAIN — s1571

**VERDICT: MERGED `ac58b314cac1f0dfa5aa195118745feb00aad8cb`.** Base `7aa2bd0ba`, four paths, **main moved on ZERO of them** → all LANE-TOUCHED / MAIN-UNMOVED, `ort` clean, no graft. Custody per §3.0b: gated in a detached worktree `gate-s1571`, never in main's tree, until the verdict was MERGE.

## Re-measured, not inherited

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green; vite **999 ms**; asset-diet Herald **1,158,214 / 1,500,000 B** |
| `node --test scripts/master-shipped-classifier.test.mjs` | **7 tests / 7 pass / 0 fail** |
| `test:ledger-guards` (run via node — the npm script name is bash-gated for fires) | **15 files / 132 tests / 132 pass / 0 fail** (8.4 s) |
| chained leaves | **12 of 12 PASS** |
| live CLI default / `--strict` / error path | rc **0 / 1 / 0** |

Live headline reproduced exactly: `TOTAL 970 · SHIPPED 551 · RAN-UNMERGED 84 · NO-TRACE 335, of which 67 self-declare DO NOT QUEUE → 268 candidates · DISAGREES 92`. **The predicted 335 residual / 268 candidates matched.**

**RED re-manufactured by direct file edit** (not a shell-quoted probe — the s1569 stub lesson): collapsing the six-line match to an empty string gives `1 fail`, `AssertionError: '' !== 'DO NOT QUEUE'` at `scripts/master-shipped-classifier.test.mjs:66`, in the test *"a no-trace master records its DO NOT QUEUE banner and is not a candidate"* — the runner's claimed red, reproduced verbatim. Restore proved **byte-identical to the lane blob by sha256 `f92b9eab…`**, suite back to **7/7**.

**Error path corrected mid-gate — recorded because the faulty probe was mine.** I first passed `--tasks-dir`, which is **not a flag**: it was silently ignored and the tool printed its normal summary at rc 0. That green proved nothing about the error path. Reading the CLI surface at `:151–:152` gave the real flag, `--root`; re-run with `--root /tmp/<absent>` it returns **rc 0 both with and without `--strict`**, matching the advisory contract asserted at `:159`. *An unrecognised flag makes a probe answer a question you did not ask.*

## The residual held at 335 — but not because nothing moved

The master predicted 335 residual / 268 candidates and said any deviation is a finding. There was none. **But a headline that holds is not the same as a corpus that did not move**, so I diffed every verdict against the banked `artifacts/f1569-1-live-corpus.json` instead of trusting the total:

- **334 masters** changed verdict by the **pure rename** `TRULY-BANKED` → `NO-TRACE` — the intended edit.
- **1 genuine reclassification:** `lane-c-f1569-1-master-shipped-classifier.md` **TRULY-BANKED → SHIPPED**. Correct: s1570 merged that very slice at `924e59711`, so it acquired real merge evidence between the snapshot and now.
- **1 master added:** `lane-c-f1570-1-no-trace-banner-column.md` → `NO-TRACE` (this slice's own master, authored s1570).

So the residual is `335 + 1 − 1 = 335`: **two real, offsetting movements, not stasis.** A fire checking only the headline would have concluded "nothing reclassified", which is false. Both movements are correct and neither blocks the merge. Recorded so the next reader knows this number is a net, not a constant — and so nobody reads the matched prediction as proof the corpus was inert.

## Firewall

**HELD.** The diff is exactly the four TOUCH-ONLY paths. Verified empty against the whole NO list: `scripts/tmp-s1046-unshipped.mjs`, the banked `artifacts/f1569-1-live-corpus` pair, `tasks/**`, `STATUS.md`, `src/**`, `e2e/**`, `specs/**`, and `reviews/f1569-1-*.md`.

**Evidence model unchanged — verified by READING it, not by the tests passing.** `winning` (`:97–:101`) is computed solely from the two trace verdicts; `banner` (`:109`) is a sibling field and never an input to it; bannered masters keep `verdict: 'NO-TRACE'` and are excluded only from `CANDIDATES` (`:125`). `--strict` keys on `CANDIDATES` (`:156`) and remains the only non-zero path. The rename is complete: **zero `TRULY-BANKED` occurrences remain** in the slice's files.

No Playwright and no `test:node-guards` owed or claimed — the diff touches no `src/**`, `e2e/**`, `src/sim/`, `src/systems/` or `src/entities/`.
