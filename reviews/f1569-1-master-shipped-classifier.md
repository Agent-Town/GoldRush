# F-1569-1 — master shipped classifier

## Verdict

READY-FOR-GATES. The advisory classifier reports one evidence-bearing verdict for all 969 live masters without changing or queueing any master.

| Verdict | Count |
|---|---:|
| SHIPPED | 550 |
| RAN-UNMERGED | 84 |
| TRULY-BANKED | 335 |
| DISAGREES | 92 |

`TRULY-BANKED=335` agrees with neither filename-derived headline: it is 228 above 107 and 269 above 66. That is expected, not tuned away. The classifier asks the narrower specified evidence question; 92 masters change verdict between full-stem and slot-stripped matching, more than twice the earlier 41-master swing. The 335-master candidate set is not small enough for a cheap manual follow-up sweep, so no list is duplicated here; the complete list and evidence are in `artifacts/f1569-1-live-corpus.{txt,json}`.

## Evidence model

The classifier consults:

- `tasks/goals.json`: exact `taskFile` match on a `merged` or `shipped` leaf, recording leaf id and `mergeHash` when present.
- `reviews/**/*.md`: exact review-stem match under both the full and slot-stripped task stem.
- `tasks/done/**`: ordinary run trace, plus `drained-<hash>-...` as SHIPPED evidence with the hash recorded.
- `tasks/failed/**`, `tasks/running/**`, `tasks/runs/**`, `tasks/stopped/**`, `tasks/queue-paused/**`, `tasks/queue/**`, and any `tasks/queue-*` directory: run traces, recursively.
- The master's literal first line: printed as the human title, truncated to 72 characters in the table.

Each JSON verdict carries structured evidence. Text output says `empty set` for TRULY-BANKED. `transforms.full`, `transforms.slotStripped`, and the `DISAGREES` column expose F-1569-1 directly. Default and error paths exit 0; `--strict` returned 1 because TRULY-BANKED is non-empty; `--json` emits the machine shape.

Rejected as shipped evidence: BACKLOG banners, task prose, source/e2e/spec content probes, branch names, commit-message greps, and arbitrary filenames outside the named evidence directories. They are either declarations rather than merge evidence or outside this slice's explicit contract.

## Manufactured RED

I temporarily collapsed `const bare = byName[bareStem(fullStem)]` to `const bare = full`, ran the fixture test, then restored the two-transform resolver.

```text
RED_RC=1
tests 5
pass 4
fail 1

✖ a slot-stripped review ships the master and manufactures F-1569-1
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ 'TRULY-BANKED'
- 'SHIPPED'
```

Restored green: 5 tests / 5 pass / 0 fail.

## Gates

- Pre-edit sequencing keys: `1`, `1`.
- `npx tsc --noEmit`: rc 0.
- `npm run build`: rc 0; Vite 1.18 s; Herald dev-path art 1,158,214 / 1,500,000 bytes; 235 terrain/landmark GLBs 592,044,952 → 92,718,740 bytes; 54 plate PNGs 187,042,157 → 24,822,346 bytes.
- `node --test scripts/master-shipped-classifier.test.mjs`: 5 tests / 5 pass / 0 fail.
- `npm run test:ledger-guards`: 15 files / 132 tests / 132 pass / 0 fail; 12/12 chained leaves green.
- Live default CLI: rc 0. Live strict CLI: rc 1, solely because 335 TRULY-BANKED masters exist.
- No Playwright and no `test:node-guards` run or claimed: this slice touches no `src/**`, `e2e/**`, `src/sim/**`, `src/systems/**`, or `src/entities/**`.

The independent `codex review` second-opinion command was attempted three times. Two runs stopped after repository discovery without a verdict; the focused run failed inside the local CLI model cache (`missing field base_instructions`). No review finding was produced to accept or dismiss.

## Superseded instrument

`scripts/tmp-s1046-unshipped.mjs` received only the required warning comment. Its executable code is unchanged. If its firewall were lifted, I would remove the absolute home-directory path, the done-only scan, and the filename-substring theory; the new classifier already replaces all three, so changing the historical instrument would add risk without value.
