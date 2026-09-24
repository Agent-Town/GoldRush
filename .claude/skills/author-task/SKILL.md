# /author-task — write a master that survives contact with the factory

Compacted 2026-09-24 on the owner's order; the incident behind every rule is in `docs/law/skill-author-task-archive-2026-09-24.md` (grep the F-ID).

## 0. Before writing ANYTHING, verify four facts (two minutes, saves a wasted run)
1. **Not already shipped**: `node scripts/drain-block-check.mjs --strict --queue <master>`; exit 1 means STOP (`ALREADY SHIPPED — DO NOT QUEUE`, a block, or `ALREADY DISPATCHED`); corroborate with a grep of `tasks/BACKLOG.md` (Mistake #8). Partially shipped → scope ONLY the delta and cite the shipping commit.
2. **The premise is true on current main**: grep or read the actual lines the task will claim. Quote `file:line` in the task. A task with a false premise no-ops or flails.
3. **The right slot**: main = repo-root serial (fixes, balance, cross-cutting) · lane-a meta/science · lane-b agent · lane-c world/visual/polish · lane-d perf/foundation · art = generation only · a scratch worktree beside the primary checkout for an Opus implementer (the `assets/pilots/*` symlinks resolve only from a sibling path). A sequencing law is written as a verifiable git check, never `git log -N` with a small N.
4. **The finding you author FROM is not itself stale**: open its subject file and read the first line of any master or row it points at; a ⛔ banner (`SHIPPED`, `SUPERSEDED`, `SCOPE CONSUMED`) means the slot is gone.

## 1. The skeleton (every section mandatory)
```markdown
# Task <id>: <imperative title> (<SLOT>, commit prefix "<type>:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in <workdir>.   (or: the Opus implementer in scratch worktree <path>, branch <fix|feat|test>/<id>, cut from main)
READ FIRST: AGENTS.md; <the spec slice, review or playtest doc that authorizes this: real paths>.
<SEQUENCING LAW if any, as a git check; missing dependency = STOP and report>
<PRE-FLIGHT: the exact template for the slot, §3>

## Why (<evidence source, dated>)
<Owner words verbatim in quotes, or the F-ID finding with its evidence, with verified file:line facts.>

## Scope
1..N. <Each item independently testable. If an item cannot fail a check, it is prose, not scope.>
If you find yourself about to exit without changes, WRITE WHY into your report first.

## Firewall
Touch ONLY: <explicit list>. NO changes to: <explicit list: sim semantics unless that IS the task, existing e2e assertions, other tasks' fresh work>.
A conditional scope item ("and fix it if you find it") needs a NAMED lift (`🔓 FIREWALL LIFT: <file>`); a blanket NO outranks every conditional above it and the runner will correctly STOP.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. <New or updated spec> green desktop and mobile. <Adjacent suites by name> unmodified-green both projects. Zero console and page errors. <Evidence to exact paths.> <Perf line if anything renders.>
End: READY-FOR-GATES + <the specific things to report: root cause found, numbers measured, what was adapted, the commit hashes, REMAINING LIST IN ORDER>.
```

## 2. Pre-flight templates (copy VERBATIM; every word was earned by an incident)
**LANE slots (a/b/c/d):**
> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL; the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work; resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence (`artifacts/**`, `reviews/shots-*`, any `.png`) are NEVER work and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/<lane> status --short` must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*` and any `.png` are always expected, never a STOP; what still STOPs is modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

**MAIN slot and scratch worktrees:**
> Pre-flight: `git status --short` must show no staged or modified TRACKED file outside the two factory-churn classes; if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris is EXPECTED; list briefly, proceed. FACTORY-CHURN EXCEPTION (F-1407-1): (a) `logs/**` (the fire and runner accounting, rewritten every cycle); (b) `artifacts/**`, `reviews/shots-*` and any `.png` (regenerated evidence, the F-1266-1 class). What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`. A scratch worktree adds: `git log main..HEAD --oneline` empty (a fresh cut).

`scripts/banked-master-preflight-guard.test.mjs` reds on any `status: "queued"` master whose pre-flight lacks the `F-1407-1` / `FACTORY-CHURN EXCEPTION` clause.

**ART slot:** no git pre-flight; the style-anchor sentence verbatim in every prompt, exact absolute filenames, grid and cells explicit, NO mirrors, #ff00ff for sheets, measured self-QA, LEDGER entry, NO processing and NO `src/` edits, no commits.

## 3. Queue discipline (after writing)
- **Gate the master BEFORE the queue copy:** `node scripts/drain-block-check.mjs --strict --queue <master>` as the LAST act before the `cp`; exit ≠ 0 = STOP and repair. The order is enforced: `--queue` refuses `⛔ ALREADY DISPATCHED` when a runner already holds the master, so a repair after copying belongs to the NEXT run (let the live run finish; never re-copy).
- The master lives in `tasks/<name>.md`; the queue gets a COPY (`cp`, not `mv`).
- THROTTLE (main ≤1 queued while ≥3 drains wait) and LANE-SAFETY (never queue into a lane with undrained content); one task per lane per drain cycle in bursts (Mistake #9).
- **Same commit:** the BACKLOG ladder line (Completeness Law) and the goal leaf in `tasks/goals.json` (Goal Registration Law, owner 2026-07-16) with `taskFile` set to the master's filename; a master with no leaf is invisible to the block check.
- **CITATION LAW:** every `spec:line` citation in `tasks/**` carries the test title as written in the source (templated titles quoted literally); `citation-title-guard` refuses a new bare coordinate and a title not recoverable at the cited line. A cited spec that lives outside the default playwright config (`release-build`, `release-base-path`, `accounts-sync`) names its owning config.
- A master run by an Opus implementer carries in its brief: the drain-lock protocol for every server plus playwright batch, "stop only the PIDs you started, never `pkill -f`", path-scoped commits with the prefix, and the report under `artifacts/<id>/report.md`.

A headless fire runs the `npm run` and `node scripts/…` commands this skill names through node (`execFileSync`) where its permission gate refuses the bare form.

## 4. Self-review before saving
Role line ✓ paths real (you opened them) ✓ premise verified with file:line ✓ pre-flight verbatim for the slot ✓ every scope item testable ✓ firewall two-sided ✓ suites named not implied ✓ evidence paths exact ✓ no-op guard present ✓ BACKLOG line and goal leaf in the same commit ✓ the pre-queue gate green ✓.
