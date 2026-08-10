# Task mint-season-2: the registry turns the page — Season 2 "The Same Game" (LANE-B, commit prefix "feat:")

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-b.
READ FIRST: AGENTS.md; src/seasons/registry.ts (the WHOLE file — SEA-1's shape: `SEASONS` const, `eraStamps`, `resolveSeasonAt` half-open ranges); specs/seasons/seasons-v1.md (boundaries) + specs/agent-play/ap-16-same-game-law.md `## Slices` (the SEASON-2 ERA STAMP record: `b8cf2332d`, the ap16-2b keystone — the last behavior slice, merged 2026-08-10); the SEA-1/SEA-2 e2e coverage (find the specs asserting registry/page contents — your change must update their fixtures/assertions honestly, not fight them).
SEQUENCING: verify `b8cf2332d` is on main (whole-log grep). Absent → STOP "keystone not landed".

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. THEN A CLEANLINESS LINE: `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (owner rulings 2026-08-10)
The Same-Game Law's three behavior slices are merged (keystone `b8cf2332d`); the AP-16 spec records the Season-2 stamp and the seasons spec defines the boundary. The county's history law (owner, verbatim in specs/seasons/seasons-v1.md) wants the page turned in the app: Season 1 closes, Season 2 "The Same Game" opens.

## Scope
1. `src/seasons/registry.ts`: close `founding-season` (`endsAt` = the keystone merge moment — use the commit timestamp of `b8cf2332d`, `git show -s --format=%ct b8cf2332d` × 1000, stated in the report) and append `same-game-season`: id `same-game-season`, name `Season 2 — The Same Game`, `startsAt` = that same moment, `endsAt: null`, `eraStamps: ['b8cf2332d']`, summary in county voice (one sentence: agents and humans now draft, blast, and build under one rulebook; the pick clock paces both species).
2. `resolveSeasonAt` needs NO logic change (half-open ranges already handle it) — assert that by test, don't restate it.
3. Update SEA-1/SEA-2 tests/fixtures that pin the registry contents (season count, current-season resolution, page render) — extend honestly (two seasons now; rows submittedAt after the boundary resolve to Season 2).
4. Nothing else: no API changes (SEA-1's derivation is registry-driven), no reader layout work.

## Firewall
Touch ONLY: `src/seasons/registry.ts`, the SEA test/spec files you name in the report.
NO changes to: standings ranking; the Season Page layout; `functions/**` beyond what SEA-1's derivation already reads from the registry (expected: nothing); other tasks' fresh work.
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)
tsc + `npm run build` green. The seasons/field-book specs green desktop+mobile both projects, zero console/page errors. A row stamped after the boundary renders "Season 2 — The Same Game" on the page (screenshot to `reviews/shots-mint-season-2/`). `npm run test:node-guards` green.
End: READY-FOR-GATES + report: the exact boundary epoch-ms used, the fixture diffs, the screenshot.
