# Entity dash repair

Status: READY-FOR-GATES, with pre-existing Field Book API reds attributed by control. PINNED landing, same era.

Base: `4cd9cfc6124c059dcee55f1e0d8860dcc45d7af0`, branch `sol/wave-lane-b`.

## Root cause and repair

The guard matched only the literal em dash, so HTML entities rendered forbidden punctuation without triggering it. A single shared regular expression now covers the existing TypeScript, public Markdown/text, and selected contract-text scan surfaces. Source comments remain excluded. The scan space remains 301 tracked TypeScript files, 293 scanned and 8 existing exceptions; no exclusions were added.

| Site | Before | After |
| --- | --- | --- |
| `src/ui/ProspectorPanel.ts:12` | `acts with your approval &mdash; repairs, pickups` | `acts with your approval: repairs, pickups` |
| `src/ui/ProspectorPanel.ts:190` | `${bonusCopy} &mdash; secured claims advance the Prospector` | `${bonusCopy}, secured claims advance the Prospector` |
| `src/encyclopedia/reader.ts:811` | aggregate cost `&mdash;` | `·` |
| `src/encyclopedia/reader.ts:816` | absent Field Book cell `&mdash;` | `·`, `aria-label="No showing"` preserved |
| `src/encyclopedia/reader.ts:909` | absent party cell `&mdash;` | `·`, `aria-label="No showing"` preserved |
| `src/encyclopedia/reader.ts:1129` | missing submission time `&mdash;` | `·`, `aria-label="Submission time unavailable"` preserved |

The shared blank glyph is the same literal middle dot at all four sites; no new helper or constant was needed. The aggregate-cost marker had no aria-label before the task. The two existing `No showing` labels and the submission-time label remain intact.

New forbidden forms: `&mdash;`, `&#8212;`, `&#x2014;`, literal source escape `\u2014`, `&ndash;`, `&#8211;`, plus the existing literal em dash. Matching is case-insensitive. Regex: `/—|&(?:mdash|ndash|#821[12]|#x2014);|\\u2014/i`.

## Verification

- Baseline `npm run build`: exit 0 before source edits.
- `node --test scripts/no-emdash-guard.test.mjs`: extended guard failed on the unrepaired source, naming exactly the two affected files (`guard-before.log`), then passed 2/2 on the repair (`guard-after.log`).
- An actual temporary `&mdash;` mutation in the tracked Prospector copy made the full guard exit 1 (`guard-fixture-red.log`); repaired bytes restored in `finally`. The committed fixtures also check every requested form through the source and contract-field detectors, and verify comment exclusion.
- `node --test scripts/no-emdash-guard.test.mjs scripts/no-emdash-scan-space-guard.test.mjs`: 10 passed, 0 failed (`guard-final.log`).
- `npx tsc --noEmit`: exit 0 (`tsc.log`).
- `npm run build`: exit 0 (`build.log`). Existing Vite/asset-quantization warnings remain.
- `node artifacts/emdash-entities-1/capture.mjs`: exit 0. Both desktop 1280 x 800 and mobile 390 x 844 have zero console/page errors, including plain `/` boots with a deterministic standings API fixture (`capture-results.json`). Prospector capture uses `?nowaves&nolevel&seed=emdash-entities-1`, dismisses Begin and opens the normal HUD panel; no debug mode or DOM substitution.
- Screenshots inspected: rung copy occupies one line at both viewports; dot blank cells are visible. Mobile Field Book uses its existing horizontal scroll to bring the missing contract cell into view.

| Surface | Desktop | 390 px |
| --- | --- | --- |
| Prospector charter | [Screenshot](prospector-desktop.png) | [Screenshot](prospector-mobile-390.png) |
| Field Book blank cell | [Screenshot](field-book-desktop.png) | [Screenshot](field-book-mobile-390.png) |

## Adaptations and boundaries

- No ahead commits; no reset needed. Initial untracked `logs/guard-stats.jsonl` is expected churn and was preserved.
- The task both prohibits dependency installation into the lane's shared `node_modules` and later requests it. Followed the explicit prohibition; the existing dependency link supported all checks.
- Port 5188 was already occupied. Started this lane's Vite server on 5198; used `GR_CAPTURE_BASE_URL=http://127.0.0.1:5198 GR_CAPTURE_EXTERNAL_SERVER=1` and `--workers=1` for the suites. The initial default-port attempt ran no tests.
- Initial screenshot probes were corrected to select the expanded row's blank cell and dismiss the contract introduction before photographing the charter. Final capture is `capture-final.log` and `capture-results.json`.
- No e2e assertions or simulation/gameplay values were changed. No engine-era change. Vault writes are outside the task's TOUCH-ONLY firewall, so this report is the durable task handoff.

## Browser results and attribution

The unmodified six-spec run used both `desktop-chrome` and `mobile-chrome`, one worker, and finished in 5.9 minutes: **40 passed, 1 skipped, 3 failed**, exit 1 (`e2e.log`).

| Spec | Passed | Skipped | Initial failures |
| --- | ---: | ---: | ---: |
| `task-025-bandits-dont-swim.spec.ts` | 10 | 0 | 0 |
| `m2-01-build-menu.spec.ts` | 14 | 0 | 0 |
| `_s106-prospector-boot-probe.spec.ts` | 2 | 0 | 0 |
| `field-book.spec.ts` | 6 | 0 | 2 |
| `m4-07-prospector-panel.spec.ts` | 6 | 1 | 1 |
| `task-026-prospector-collects-xp.spec.ts` | 2 | 0 | 0 |

The skipped desktop case explicitly requires mobile. No encyclopedia-named spec exists beyond the discovered Field Book spec.

Control: `control.py` restored all three implementation files to the exact pre-task base, asserted their diff against the base was empty, ran the failing scenario names in both projects, and restored every repaired byte in `finally`. Result: **2 passed, 2 failed**, exit 1 (`control.log`).

- Field Book aggregation fails identically on both trees and both viewports at `e2e/field-book.spec.ts:147`: expected HTTP 200, received 400. The fixture's `tape()` has no `meta.era`/`meta.engineHash`, while `functions/api/standings.ts:1243` rejects missing current-era papers. Those files are outside the task firewall and were not changed.
- Initial desktop consent failure: the death overlay intercepted the checkbox in the accelerated stress scenario. Both pre-task control consent cases passed. A focused desktop rerun on the repaired tree also passed **1/1**, exit 0 (`consent-recheck.log`); recorded as intermittent, not hidden or attributed to a deterministic source regression.
- After restoring the repair, the guard again passed **2/2**, exit 0 (`guard-restored.log`).

Commands:

```sh
GR_CAPTURE_BASE_URL=http://127.0.0.1:5198 GR_CAPTURE_EXTERNAL_SERVER=1 npx playwright test e2e/task-025-bandits-dont-swim.spec.ts e2e/m2-01-build-menu.spec.ts e2e/_s106-prospector-boot-probe.spec.ts e2e/field-book.spec.ts e2e/m4-07-prospector-panel.spec.ts e2e/task-026-prospector-collects-xp.spec.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --output=artifacts/emdash-entities-1/test-results --reporter=line
python3 artifacts/emdash-entities-1/control.py
GR_CAPTURE_BASE_URL=http://127.0.0.1:5198 GR_CAPTURE_EXTERNAL_SERVER=1 npx playwright test e2e/m4-07-prospector-panel.spec.ts --grep 'auto-collect consent' --project=desktop-chrome --workers=1 --trace=off --output=artifacts/emdash-entities-1/consent-recheck-results --reporter=line
```

Ten tracked screenshots regenerated by the existing suites were restored to their pre-task bytes; their paths are listed in `regenerated-evidence-restored.txt`. The newly generated adjacent panel shots were moved under this task's artifact directory. Large raw traces remain local regenerated evidence; the committed logs, report, four requested screenshots, and capture/control scripts carry the review evidence.

## Commit and remaining list

Implementation commit: `f1b31ceec33908832d7c7c1c4bfd6c9d084bbae3`. Evidence is in the following `fix:` commit on the same lane.

No remaining implementation work in this slice.

1. Orchestrator reviews this PINNED, same-era landing and integrates through its gates.
2. Separately repair the pre-existing Field Book submission fixtures within an authorized slice.
3. If the accelerated consent scenario continues to flake, investigate its death-overlay timing independently.
