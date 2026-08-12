# F-1700-1 — lane auto-commit must not sweep pre-existing dirt

**FIRE-AUTHORED s1700 (attended review welcome).**  
**CODEX: model=gpt-5.6-sol effort=medium**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. ⚠️ The trap this closes: a run that STOPPED still ran playwright and still regenerated screenshots, so a stopped predecessor leaves tracked dirt that freezes its successor — three consecutive masters (gazette-welcome-drift-observation-frame v1/v2, newsie-drift-shell-divergence-rate) died before measuring anything, the third killed by the exhaust of the first two.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE, WHICH THE LANE TEMPLATE OWED AND DID NOT CARRY UNTIL s1505 (F-1505-1): `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Goal

Make the ordinary lane runner commit only paths dirtied by the run it just executed. A pre-existing tracked or untracked evidence file may remain in the worktree, but it must not enter the runner commit merely because the task finished successfully.

## Read first / freshness gate

Read `AGENTS.md`, the ordinary-lane commit block in `scripts/lane-runner-v3.sh`, `scripts/runner-commit-decoupling-guard.test.sh`, and the F-1700-1 row in `tasks/BACKLOG.md`.

Before editing, run:

```sh
grep -Fc 'Those two lawful local readings compose into an unlawful firewall sweep.' tasks/BACKLOG.md
```

Expected: exactly `1`. Otherwise STOP: the evidence this master is written against moved.

## Measured cause

Runner tip `b0caf31a138ced22c929e153a7ad40ae5d7dd824` combined a one-file, 16-line test deletion with the already-present 158,154,953-byte `logs/suite-red-inventory-raw.json`. The ordinary lane completion block runs `git add -A -- .` and a path-scoped `git commit` over the same broad tree. Separately, lane masters deliberately treat `logs/**` as factory churn at pre-flight. The raw report had already recurred across suite-inventory runs, so another filename exclusion or a template-only wording change does not fix the class.

The shared runner boundary owns the fix: remember what was dirty before Codex starts, then withhold those paths from the success commit. Do not infer ownership from a task report.

## Scope

1. For ordinary git-worktree lanes only, capture the pre-run dirty-path set immediately before launching Codex.
2. On successful completion, commit only paths that became dirty after that capture. Preserve additions, edits, deletions, and renames made by the run.
3. A path already dirty at capture stays uncommitted even if its bytes later move; log the withheld path(s) so the drain can see the ownership collision.
4. Keep the existing `.wrangler`, `logs/factory-usage.json`, and `logs/usage-history.jsonl` exclusions. Do not change main-slot or art-slot ownership semantics.
5. Keep temporary baseline state outside the repo and clean it on both success and failure. Path handling must not split on spaces; use git's NUL-delimited forms or an equivalently safe existing primitive.
6. Extend the existing runner commit guard rather than creating a parallel test harness. Manufacture a scratch lane with:
   - a pre-existing untracked `logs/raw.json`,
   - a pre-existing tracked dirty file,
   - one clean file changed by the simulated task.

   Prove the task file is committed, both baseline-dirty paths remain outside the commit, and the index is clean. Then manufacture the old broad-commit behavior on a scratch runner copy and prove the guard goes red.
7. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Touch only

- `scripts/lane-runner-v3.sh`
- `scripts/runner-commit-decoupling-guard.test.sh`

Do not edit task masters, ledgers, generated logs, gameplay, specs, or any other guard.

## Gates

```sh
bash -n scripts/lane-runner-v3.sh
bash scripts/runner-commit-decoupling-guard.test.sh
npm run build
git diff --check
git diff --name-only main...HEAD
```

The final path list must be exactly the two TOUCH-ONLY files. Report the manufactured red arm, the chosen baseline representation, and whether the currently running detached runner needs a helper-script restart after this branch is drained. End `READY-FOR-GATES` only if every gate is green.
