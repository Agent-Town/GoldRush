# Task f1624-1: root the two orphan test files and make `gate-caller-audit` able to SEE the class (LANE-B, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome)** — s1624, from F-1624-1 recorded at the `stack-directory` drain (`reviews/stack-directory.md`, merged `4fff07381b5a2b5ca7c727b67dcbc23036ffd580`).

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; `reviews/stack-directory.md` (the finding, its measurement and its explicit refusal to fix this as a drain drive-by); `scripts/gate-caller-audit.mjs` **in full, including its header comment** — it states that its edge vocabulary IS a claim and that the claim is enumerated in `EDGE_SOURCES` and asserted by a fixture test, which is exactly the contract you are about to change; `scripts/gate-caller-audit.test.mjs`; `scripts/gate-caller-baseline.json` (the grandfather file — READ three existing entries before writing one, the house reason-voice matters).

SEQUENCING: verify the stack-directory merge is on main by **FILE PROBE, never by grepping commit messages** — `git ls-files src/encyclopedia/stackDirectory.test.mjs` must print that path; empty → **STOP and report "stack-directory not landed"**. ⚠️ **This is Mistake #16 and it was live in this master's first draft:** the obvious check, `git log --oneline | grep -q 'stack-directory — county-curated learn-more links'`, returns **2** on main — the merge `4fff07381` *and* the attended authoring commit `1a101f55d`, which carried the same phrase **before any code existed**. A message grep matches every announcement of a thing; only a file probe sees the thing. Then verify the subject line is still what this master claims:
`grep -c "f.endsWith('.test.mjs')) continue;" scripts/gate-caller-audit.mjs` → **must be 1**. If it is 0, the audit has been restructured under this master; **STOP and report the drift** rather than guessing where the skip moved.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Why (F-1624-1, s1624 2026-08-10, measured at the stack-directory drain — every number below was re-derived from the live tree, not inherited)

The `stack-directory` slice shipped `src/encyclopedia/stackDirectory.test.mjs`: 2 tests, 11 assertions, the whole eight-rig + three-mind matcher table. It **passes** (`node --test`, 2/2, 80.4 ms). **Nothing calls it.** And `gate-caller-audit` — the guard that exists precisely to find gate-shaped things nobody calls — returned **PASS** on that merged tree, correctly, because a test file is not one of its subjects at all:

> `scripts/gate-caller-audit.mjs`, the guard-script subject loop: `if (!f.endsWith('.mjs') || f.endsWith('.test.mjs')) continue;`

So `.test.mjs` files are skipped **before** the guardish-name test is even applied. That is a defensible original choice — a test file is normally reached through the npm script that lists it — but it means **the audit cannot report an orphan test, anywhere in the tree, ever.**

**The class is repo-wide, and it already had an older casualty that nobody had noticed.** Measured s1624 over all tracked `*.test.mjs` (67 files):

| bucket | count | meaning |
|---|---|---|
| named in `test:node-guards` (a ROOT) | 58 | genuinely reached |
| named ONLY in `test:ledger-guards` | 7 | reached from a caller that is itself deliberately unrooted (F-1300-4) |
| named in **neither** | **2** | **the defect** |

The two are `src/encyclopedia/stackDirectory.test.mjs` (new, this drain) and **`scripts/master-shipped-classifier.test.mjs`** — which sits in `scripts/` itself, carries **12 tests, all passing** (verified by running it, 206 ms), and guards `master-shipped-classifier.mjs`, the census tool s1595 leaned on for its "988 masters, 575 SHIPPED, 0 candidates" measurement. **A guard over the shipped-master census has had 12 unrun tests for an unknown number of fires, inside the very directory the audit does read.** That kills the tempting reading that this is a `src/`-only problem caused by one unusual slice.

⚠️ **Do NOT read the 7 middle-bucket files as defects.** They are reached via `test:ledger-guards`, which is unrooted **on purpose** — F-1300-4: it runs the guards that read the LIVE ledger and must run AFTER the drain-bookkeeping commit, so rooting it into a pre-merge battery would reintroduce the bug it cures. Their siblings (`desk-carryforward-guard.mjs`, `desk-state-audit.mjs`, `attended-owed-audit.mjs`, `status-archive-audit.mjs`, `desk-birth-guard`) are already grandfathered in this audit for exactly that reason, with the reason written out. **Widening the subject set surfaces these 7 for the first time; grandfathering them with the inherited F-1300-4 reason is scope item 2, and getting it wrong turns a real cure into a red board.**

*The reusable half, for the header comment: an audit's green is only ever as wide as its subject set, and the subject set is the one thing the audit cannot audit.*

## Scope

1. **Widen the subject set to tracked `*.test.mjs` files, tree-wide.** In `scripts/gate-caller-audit.mjs`, add a third subject loop over every tracked `*.test.mjs` path (`kind: 'test file'`), reached exactly as other subjects are — by the existing edge vocabulary (a path named in a package.json script, a `scripts/**` file, a `*.config.ts`, or `.github/**`). **Do NOT change the existing guard-script loop's behaviour** for non-test `.mjs` files; the `.test.mjs` skip there stays, since those files are now handled by the new loop rather than ignored. Honour `--include-untracked` for the new bucket the same way the existing buckets do.
2. **Grandfather the 7 `test:ledger-guards`-only files in `scripts/gate-caller-baseline.json`**, one entry each, each stating the F-1300-4 inheritance in the house voice — read the existing `scripts/desk-carryforward-guard.mjs` and `scripts/status-archive-audit.mjs` entries first and follow their shape: *reached only from `test:ledger-guards`, which is itself deliberately unrooted, and reachability here is computed from ROOTS, so a caller that is itself an orphan cannot confer reachedness.* Name the file that reaches them so a future reader can check it.
3. **Root the two genuine orphans** by adding both paths to the `test:node-guards` file list in `package.json`: `scripts/master-shipped-classifier.test.mjs` and `src/encyclopedia/stackDirectory.test.mjs`. Both must PASS inside the battery, not merely when run by hand. **Report the battery's new totals** (files, tests, wall time) against the s1537 baseline of 363 tests / 360 pass / 3 skipped / 181.3 s — the battery is MEANT to grow; count it, never prune it back.
4. **Update the audit's own claim.** Its header comment enumerates what it reads and states that the edge vocabulary is a claim asserted by a fixture test. If your change makes that paragraph or `EDGE_SOURCES` false, fix the words in the same commit, and extend `scripts/gate-caller-audit.test.mjs` with at least one fixture proving an orphan TEST file is now caught. A stale header on this file is worse than on any other, because the header is what a reader trusts instead of re-reading the code.
5. **Prove the teeth by MANUFACTURING the defect, not by a green** (the s1299/s1300 standard — a passing guard never executes its violation path, so its green is not evidence about its red). After scopes 1–3 land: create a throwaway `scripts/zz-orphan-probe.test.mjs` containing one trivial passing test, run `node scripts/gate-caller-audit.mjs`, and confirm it exits **non-zero naming that file**. Then delete the probe and confirm the audit returns to **PASS**. Paste both outputs. ⓘ The audit reads **tracked** files, so `git add` the probe (do not commit it) or use `--include-untracked` — **say which you used**, because the two prove slightly different things and the difference is the F-1576-1 lesson.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `scripts/gate-caller-audit.mjs`, `scripts/gate-caller-audit.test.mjs`, `scripts/gate-caller-baseline.json`, `package.json` (the `test:node-guards` file list ONLY — two paths added, nothing reordered, no other script changed).

NO changes to: `src/**` (including `stackDirectory.test.mjs` itself — you are ROOTING it, not editing it) · `e2e/**` · any other guard under `scripts/` · `test:ledger-guards`' contents or its unrooted status (F-1300-4 — rooting it would reintroduce the bug it cures, and this master explicitly forbids that "fix") · the `.test.mjs` skip's siblings in other audits · other tasks' fresh work.

⚠️ **The 7 grandfathered entries are the sharp edge.** If your widening makes any file OTHER than those 7 and the 2 rooted ones appear as a new orphan, do **not** grandfather it to get green — **STOP and report it**. An unexpected orphan is a finding, and quietly baselining it is the exact failure mode this audit exists to prevent.

## Self-check (evidence, not vibes)

`npx tsc --noEmit` + `npm run build` green. `node scripts/gate-caller-audit.mjs` **PASS** with its printed subject/orphan/grandfathered counts pasted (before AND after your change, so the delta is legible). `npm run test:node-guards` green **run ALONE** — it is ~3 minutes and overlapping it with a second battery contaminates both (s1536 hung ~19 min doing exactly that). `npm run test:ledger-guards` green (it runs `gate-caller-audit.test.mjs`). The scope-5 manufactured-defect transcript, both directions. No screenshots — this slice renders nothing.

End: READY-FOR-GATES + report: (a) the before/after subject and orphan counts; (b) the new `test:node-guards` totals vs the 363/360/3/181.3 s baseline; (c) the manufactured-defect output proving the new bucket has teeth, and whether you armed it tracked or with `--include-untracked`; (d) **any file that surfaced as an orphan which this master did not predict** — that is the finding, report it rather than baselining it.
