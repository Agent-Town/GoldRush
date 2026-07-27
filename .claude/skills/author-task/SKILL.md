---
name: author-task
description: Write a Gold Rush task master that cannot fail the known ways — correct pre-flight for its slot, evidence-quoted WHY, testable scope, firewall, exact gates. Use whenever work needs a new task file (correctives, spec slices, re-lands, re-runs), whether fire-authored or attended.
---

# /author-task — write a master that survives contact with the factory

## 0. Before writing ANYTHING, verify three facts (two minutes, saves a wasted run)
1. **Not already shipped**: run `node scripts/drain-block-check.mjs <master> --queue` — exit 1 means STOP (`ALREADY SHIPPED — DO NOT QUEUE` or a block); corroborate with a grep of `tasks/BACKLOG.md` for the work (Mistake #8: the 824k Flail). Partially shipped → scope ONLY the delta and cite the shipping commit.
2. **The premise is true on current main**: grep/read the actual code lines your task will claim ("the bench is ?debug-gated at AssayBench.ts:189" — go LOOK). A task with a false premise no-ops or flails. Quote file:line in the task.
3. **The right slot**: main = repo-root serial (fixes/balance/cross-cutting) · lane-a meta/science · lane-b agent · lane-c world/visual/polish · lane-d perf/foundation · art = generation only. Sequencing law needed? (e.g., "after X MERGES") — write it as a verifiable git check, with the SEARCH WINDOW WARNING below.

## 1. The skeleton (every section mandatory)
```markdown
# Task <id>: <imperative title> (<SLOT>, commit prefix "<type>:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in <workdir>.
READ FIRST: AGENTS.md; <the spec slice / review / playtest doc that authorizes this — real paths>.
<SEQUENCING LAW if any — see §2 wording>
<PRE-FLIGHT — copy the exact template for the slot, §3>

## Why (<evidence source, dated>)
<Owner words verbatim in quotes, or the F-ID finding with its evidence. Include verified file:line facts.>

## Scope
1..N. <Each item independently testable. If an item can't fail a check, it isn't scope, it's prose.>

## Firewall
Touch ONLY: <explicit list>. NO changes to: <explicit list — always include: sim semantics unless that IS the task, existing e2e assertions, other tasks' fresh work>.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. <New/updated spec> green desktop+mobile. <Adjacent suites by name> unmodified-green both projects. Zero console/page errors. <Screenshots/artifacts to exact paths.> <Perf line if anything renders.>
End: READY-FOR-GATES + <the specific things to report: root cause found / numbers measured / what was adapted>.
```

## 2. Sequencing-law wording (prevents two real failures)
- Gate on a merge: `verify <commit-ish or a grep of git log --oneline | grep -q '<slice-name>'> — do NOT gate on git log -N with a small N` (a prior task no-op'd because its dependency was 20 commits back — search the WHOLE log or by pattern).
- If the dependency is missing: `STOP and report "<dep> not landed"` — never improvise the dependency.

## 3. Pre-flight templates (copy VERBATIM — every word earned by an incident)
**LANE slots (a/b/c/d):**
> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

**MAIN slot:**
> Pre-flight: `git status --short` must show ZERO staged/modified TRACKED files (lines not starting `??`) — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris (art raws, .claude/) is EXPECTED — list briefly, proceed.

**ART slot:** no git pre-flight; instead: the style-anchor sentence verbatim in every prompt, exact absolute filenames, grid/cells explicit, NO mirrors, #ff00ff for sheets, measured self-QA, LEDGER entry, NO processing and NO src/ edits, no commits.

## 4. The no-op guard (write it into every corrective/re-run)
> If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## 5. Queue discipline (after writing)
- Master lives in `tasks/<name>.md`; the queue gets a COPY (`cp`, not `mv`).
- Respect THROTTLE (main ≤1 queued while ≥3 drains wait) and LANE-SAFETY (never queue into a lane with undrained content). During bursts: one task per lane per drain cycle (Mistake #9).
- Same-commit ledger: add the BACKLOG ladder line WHEN you write the master (Completeness Law).

## 6. Self-review before saving (the checklist from CLAUDE.md §6)
Role line ✓ paths real (you opened them) ✓ premise verified with file:line ✓ pre-flight verbatim for the slot ✓ every scope item testable ✓ firewall two-sided ✓ suites named not implied ✓ evidence paths exact ✓ no-op guard present ✓ BACKLOG line written ✓.
