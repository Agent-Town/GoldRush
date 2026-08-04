CODEX: model=gpt-5.6-sol effort=high

# lane-ap06d-stack-cost-board — model × contract × cost: THE FIELD BOOK

ROLE: implementer on lane-b. WORKDIR: worktrees/lane-b (branch lane/b). You implement EXACTLY this task, commit on the lane branch with prefix `ap06d:`, and never touch STATUS.md, reviews/, tasks/queue/, or other lanes.

PRE-FLIGHT (LANE-SAFETY INVARIANT): `git branch --show-current` must print `lane/b`. Run `git status --porcelain` — if ANY dirty tracked blob exists that is not reachable in git, STOP and report instead of resetting. If the branch is stale vs main, `git checkout -B lane/b origin/main` ONLY when the worktree is clean. Verify not-already-shipped: `grep -n "tokensIn\|tokensOut\|byStack\|field-book" functions/api/standings.ts src/` must show no implementation. If present, STOP and report SAFE-DUPE.

## WHY (dated evidence)
Owner, 2026-08-04, verbatim: "We also probably need a 'model <> contract <> budget/tokens used' overview to see how the different models/harness are doing on the different contracts? It would be good to have a timestamp for them as well and potentially their harness." The standings row ALREADY carries `submittedAt`, `difficulty`, `seed`/`seedMode`, and the self-declared `stack` (`model`/`harness`/`harnessVersion`/`config` — LB-02). The two gaps: (1) COST is not in the schema; (2) there is no cross-contract OVERVIEW — standings render per contract only.

## READ-FIRST (in order)
1. `functions/api/standings.ts` — `SelfDeclaredStack`, `StoredRow`, `POST_KEYS`, the LB-02 validation style (bounds-checked, reject-don't-stretch) and the F-1216-2 lesson (required-vs-optional on a public contract: COST FIELDS ARE OPTIONAL — a row without cost is still a valid row).
2. The standings UI (grep the standings board component + LB-03's difficulty chips — your view extends this surface's grammar).
3. `specs/agent-play/README.md` §AP-06 (county standings laws: species-blind ranking unchanged — cost is INFORMATION, never a ranking input) + the preview-origin allowlist pattern shared by all six API files (F-E1W-2).
4. `reviews/lb-03*.md` if present — how the last standings slice was gated.

## SCOPE (numbered, each testable)
1. `SelfDeclaredStack` gains optional `tokensIn?: number`, `tokensOut?: number`, `calls?: number` — self-declared like the rest, validated as non-negative integers with sane caps (reject beyond 10^12), NEVER required (F-1216-2's lesson: an old client must keep posting cleanly).
2. GET gains a `view=byStack` read (same endpoint, read-only, no new route): rows grouped `model × contract`, per cell: best score, secured?, difficulty, tokensIn/tokensOut/calls (when declared), harness+harnessVersion, `submittedAt`. Undeclared stacks group under "unregistered rig". Ranking law untouched.
3. THE FIELD BOOK view in the standings UI: a matrix — model rows, contract columns, cell = best result + cost + age (relative timestamp); a row click expands harness/config/timestamp detail. In-world voice ("the county's field book of rigs and their showings"). Reachable from the standings surface on a plain no-debug boot (Mistake #10).
4. The GR-SIM headless driver and skill.md submission docs mention the new optional fields (one paragraph each) so agents self-declare cost going forward.
5. e2e `e2e/field-book.spec.ts`: POST rows with+without cost fields (both accepted), byStack view groups correctly, matrix renders both, ranking unchanged by cost, zero console errors. Both projects.

## TOUCH-ONLY
`functions/api/standings.ts` (additive) · standings UI module(s) · `public/skill.md` or its source (the agent-facing doc) · GR-SIM driver docs line · `e2e/field-book.spec.ts` · `tasks/BACKLOG.md` (goal-leaf, same commit).

## NO
Ranking/scoring logic · required-field tightening of the POST contract · tape code · `_bugs`/`_accounts`/other endpoints · new routes · any cost-based sorting default (timestamp/score sorts only).

## SELF-CHECK (before done-move)
tsc clean · build green · `e2e/field-book.spec.ts` green desktop+mobile · existing standings suite green UNMODIFIED · zero console/page errors plain boot · screenshots: the field book desktop + 390px into `reviews/shots-field-book/`.

READY-FOR-GATES. Report: schema diff, the byStack response shape, screenshot paths.
