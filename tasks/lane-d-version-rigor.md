# Task version-rigor: a declared harness declares its version — validator law (LANE-D, commit prefix "fix:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.
READ FIRST: AGENTS.md; functions/api/standings.ts `validateStack` (the stack shape law — `harnessVersion` is optional today) and the POST path around it; src/encyclopedia/reader.ts:977-980 ("renderCountyStack" — the display already joins harness+version; you change NOTHING here, it is the evidence the ledger is ready); the F-1229-1 battery note (you touch functions/ → `test:stats` + `test:accounts` + `test:mp` required).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-d status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner 2026-08-12, verbatim)
"We have to note the version of the harnesses in the claim ledger - otherwise things are not correct from my point of view. Scientific rigor." The display is ready (reader.ts:978 joins them); the validator must stop accepting version-less harness declarations so the ledger can never again hold a rig of unknown vintage.

## Scope
1. `validateStack`: a stack that declares `harness` MUST also declare a non-empty `harnessVersion` (same length/type rules as today's optional field). A stack with neither stays legal (undeclared rider); model-only stacks stay legal (version applies to the rig, not the mind). Reject → the existing `bad_payload` path.
2. STORED rows are history: no migration, no retro-judgment — Season-1 rows without versions stand as they are (seasons law). State this in a one-line comment at the check.
3. `public/skill.md`'s standings/door section gains ONE sentence: a declared harness must state its version. (F-1541-1: never re-flow; if the sentence belongs inside a guarded fence, edit lawfully and cite skillmd-guard.)
4. Tests: route-level — harness+version accepted; harness without version rejected; model-only accepted; undeclared accepted; a stored version-less row still renders (no read-path change).

## Firewall
Touch ONLY: `functions/api/standings.ts` (validateStack + the one comment), `public/skill.md` (one sentence), the standings route test file (name it).
NO changes to: reader/display (already correct); ranking; stored data; tape validation; other tasks' fresh work.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. F-1229-1 battery green (`test:stats`, `test:accounts`, `test:mp`). The four route tests green. `npm run test:node-guards` green. Zero console/page errors, plain boot.
End: READY-FOR-GATES + report: the validator diff, the four test names, the skill.md sentence.
