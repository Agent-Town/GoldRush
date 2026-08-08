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

---

# DRAIN — s1570 (2026-08-08)

## Verdict

**MERGED** `8efbb0eac51ad961f8fc476d0b3934a7f0cc9570`. Slice branch `lane/c` @ `985a7f892`, base `b1a607e59`.

## Merge classification

Base `b1a607e59`; 6 paths, **all LANE-TOUCHED / MAIN-UNMOVED** — `lane-usable.mjs` reported every path `HELD LANE-ONLY` and main had moved none of them, so `ort` merged clean with no conflicts and no graft. Custody per §3.0b: the whole gate ran in a **detached worktree `gate-s1570`**, never in main's tree, until the verdict was MERGE.

| Path | Class |
|---|---|
| `scripts/master-shipped-classifier.mjs` | LANE-TOUCHED, main unmoved |
| `scripts/master-shipped-classifier.test.mjs` | LANE-TOUCHED, main unmoved |
| `scripts/tmp-s1046-unshipped.mjs` | LANE-TOUCHED (comment only), main unmoved |
| `reviews/f1569-1-master-shipped-classifier.md` | LANE-TOUCHED, main unmoved |
| `artifacts/f1569-1-live-corpus.{json,txt}` | LANE-TOUCHED, main unmoved |

## Evidence (re-measured on the merged tree, not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green; Vite 1.01 s; asset-diet 1,158,214 / 1,500,000 B |
| `node --test scripts/master-shipped-classifier.test.mjs` | 5 tests / 5 pass / 0 fail |
| Live CLI, my own run | **969 · SHIPPED 550 · RAN-UNMERGED 84 · TRULY-BANKED 335 · DISAGREES 92** — reproduces the runner's table exactly |
| `npm run test:ledger-guards` | **132 tests / 132 pass / 0 fail (8.3 s)**; findings-state, blocker-panel, ruling-propagation, citations all PASS |
| Playwright / `test:node-guards` | **not owed** — no `src/**`, `e2e/**`, `src/sim/**`, `src/systems/**`, `src/entities/**` in the diff |

`status-archive-audit` was red at gate time **by construction and not attributable to the slice**: it named `465f1533`, my own lock commit, for dropping s1569's line-1 — which §4 calls *"normal, not a defect"* when the fire's own handoff restores it. Cured in the handoff commit; re-run green as the fire's last act.

**Manufactured RED, re-derived rather than inherited.** I collapsed `const bare = byName[bareStem(fullStem)]` to `const bare = full` **by file edit** (not a shell-quoted probe — F-1569's own stub lesson) and got exactly the runner's claim: 5 tests / 4 pass / 1 fail, `a slot-stripped review ships the master and manufactures F-1569-1`, `actual: 'TRULY-BANKED'` vs `expected: 'SHIPPED'`. Restored and proved **byte-identical to the lane blob by sha256** (`5a0dd69e11281ead8946de27480ea1dac5095a9a51923dde753b712876402b63`).

## Findings

**F-1570-1 (s1570, OPEN, NON-BLOCKING, FIRE-AUTHORABLE) — the third bucket's NAME asserts far more than its evidence model supports, and the masters it is most likely to mislead a fire about are exactly the ones a prior fire already content-probed.**

The verdict word is `TRULY-BANKED` and the evidence column prints `empty set`. Both read as a positive finding of never-shipped-ness. The evidence model is narrower than that: the review's own "Rejected as shipped evidence" list excludes **BACKLOG banners, task prose, and source/e2e/spec content probes**. That exclusion is defensible for the SHIPPED verdict — a declaration is not a merge — but it is not defensible in the label of the residual bucket.

✓ **MEASURED on the merged tree, over the shipped corpus:**

- **67 of 335 TRULY-BANKED masters (20.0%)** carry an explicit **"DO NOT QUEUE"** in their own first six lines. Widening to the SHIPPED/SUPERSEDED/RETIRED/⛔ banner class: **101 of 335 (30.1%)**.
- **95 masters board-wide carry a DO-NOT-QUEUE banner, and 67 of them — 70.5% — land in TRULY-BANKED.** The bucket a sweep would draw from is where the forbidden masters *concentrate*.
- Named examples, all `TRULY-BANKED / empty set`: `001-m2-01-buildable-registry-and-menu.md`, `002-m2-03-wave-scheduler-v2.md`, `003-vp-03-terrain-variety.md`, `004-vp-02-sprite-animation.md`, `005-m2-02-sluice-and-stockpile.md` — each opening `⛔ **SHIPPED — DO NOT QUEUE (Mistake #8 guard, content-probed s1132 2026-07-27)**`, several stating in the same breath *"No done-move exists"*.

⚖️ **Why this is the F-1568-1 disease seen from the other side.** s1132 did the expensive content-probe, established shipped-ness, and wrote the verdict into the master's own first line — the durable-file discipline CLAUDE.md §4.8 asks for. The new instrument declines to read that record and then labels the master with the strongest available word for its opposite. ⓘ **And the superseded script was better here in exactly one respect:** `tmp-s1046-unshipped.mjs:19` tests `/DO-NOT-QUEUE|SHIPPED|⛔/` and flags `<<< HAS DO-NOT-QUEUE/SHIPPED BANNER` on every hit. The replacement dropped the one signal that guards Mistake #8.

🚫 **Not blocking, and the reasons are worth stating so nobody re-litigates them.** The tool is advisory and exit-0 by default; its master explicitly forbids performing the sweep it informs; the SHIPPED (550) and RAN-UNMERGED (84) buckets carry real evidence and are a genuine improvement over filename archaeology; and withholding the merge would leave only the worse instrument on the board. The defect is in the **vocabulary and a missing column**, not the mechanics.

➡️ **CURE (fire-authorable, small):** rename the residual verdict to something that states what was actually checked (`NO-TRACE`), add a `BANNER` column drawn from the master's own first lines, and split the count so a reader sees *"NO-TRACE 335, of which 67 self-declare DO NOT QUEUE → 268 candidates"*. **GATE: none.**

⚠️ **Standing warning until that lands: `TRULY-BANKED = 335` is NOT a candidate list, and at least 67 of its members must never be queued.**
