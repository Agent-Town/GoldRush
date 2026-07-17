# Task <id>: <imperative title> (<SLOT>, commit prefix "<type>:")
<!-- Optional routing header, one line, e.g.: IMPLEMENTER: model=<model> effort=<tier> -->

You are <implementer>, for <project>, running in <workdir>.
READ FIRST: AGENTS.md; <the spec slice / review / playtest doc that authorizes this — real paths you have opened>.
<SEQUENCING LAW if any — as a verifiable git check: "verify <slice-name> is merged via `git log --oneline | grep -q '<slice-name>'` (search the WHOLE log, never `-N` with a small N); if missing, STOP and report '<dep> not landed' — never improvise the dependency.">

<PRE-FLIGHT — copy the template for the slot VERBATIM; every word earned by an incident:>
<!-- LANE slots: -->
> Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B <lane-branch> main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then <install deps>; <build> green before touching anything.
<!-- MAIN slot: -->
> Pre-flight: `git status --short` must show ZERO staged/modified TRACKED files — if any exist, STOP and report (a live drain or another task owns the tree). Untracked `??` host debris is EXPECTED — list briefly, proceed.
<!-- GENERATION/ART slot: no git pre-flight; instead: the style-anchor sentence verbatim in every prompt, exact absolute filenames, explicit dimensions/cells, measured self-QA, ledger entry, NO processing, NO product-code edits, no commits. -->

## Why (<evidence source, dated>)
<Owner words verbatim in quotes, or the F-ID finding with its evidence, or the spec slice. Include premise facts you VERIFIED on current main, quoted as file:line — a task with a false premise no-ops or flails.>

## Scope
1. <Each item independently testable. If an item can't fail a check, it isn't scope, it's prose.>
2. …

## GATE-AUTHORSHIP LAW — FIXED
<The acceptance assertions, written HERE by the task's author, before any implementation exists. The implementer makes THESE pass; it may not substitute its own. E.g.: "<action> → <observable state>; <failure input> → <fallback state>; <named suites> unmodified-green; all target platforms.">

## Firewall
Touch ONLY: <explicit path list>.
NO changes to: <explicit list — always include: core semantics unless that IS the task, existing test assertions, other tasks' fresh work>.
<!-- Reporting adjacent problems = good; fixing out of scope = violation. -->

## Self-check (evidence, not vibes)
<typecheck> + <build> green. <New/updated spec> green on <all target platforms>. <Adjacent suites by name> unmodified-green. Zero console/page errors in a plain boot (no debug flags — where does the USER see this?). <Screenshots/artifacts to exact paths.> <Perf line if anything renders.>
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.
End: READY-FOR-GATES + <the specific things to report: root cause found / numbers measured / what was adapted>.

<!-- Author's checklist before saving (delete): not already shipped (grep BACKLOG) ✓ premise verified file:line on current main ✓ right slot ✓ pre-flight verbatim ✓ every scope item testable ✓ gates fixed, not self-seeded ✓ firewall two-sided ✓ suites named not implied ✓ no-op guard present ✓ BACKLOG ladder line written in the same commit ✓ -->
