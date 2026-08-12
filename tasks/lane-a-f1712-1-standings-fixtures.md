# Task F-1712-1: give live standings fixtures their declared harness versions (LANE-A, commit prefix `test:`)

FIRE-AUTHORED 2026-08-12; attended review welcome.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `reviews/version-rigor-s1712-gate-hold.md`; `tasks/lane-d-version-rigor.md`; `e2e/field-book.spec.ts` at `const stacks = [`; `e2e/milk-county-board.spec.ts` at `const RIDERS =`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

SEQUENCING LAW: verify main contains `reviews/version-rigor-s1712-gate-hold.md` and `grep -Fq 'HOLD — NOT MERGED' reviews/version-rigor-s1712-gate-hold.md`. If either check fails, STOP and report `version-rigor gate evidence not landed`; do not infer the dependency from a short `git log` window.

## Why

F-1712-1 is the blocking finding from the detached version-rigor gate. The candidate correctly rejects live harness declarations without versions, but two adjacent suites still manufacture that now-illegal payload and fail six times across desktop and mobile. Historical stored-row fixtures stay untouched because the version-rigor law explicitly preserves them.

## Scope

1. In `e2e/field-book.spec.ts`, add the same short non-blank fixture `harnessVersion` to each of the four live-submission entries in the `stacks` array used by `minds and rigs aggregate the same standings without changing county ranking`.
2. In `e2e/milk-county-board.spec.ts`, add a short non-blank fixture `harnessVersion` to the two harness-bearing `RIDERS` entries (`codex` and `gr-sim`). Do not add a harness to model-only riders.
3. Preserve every assertion, expected count, rank, cost, composition, and production path. This is fixture conformance only.

## Firewall

Touch ONLY:
- `e2e/field-book.spec.ts`
- `e2e/milk-county-board.spec.ts`

NO changes to `functions/api/standings.ts`, `e2e/lb-01-county-standings.spec.ts`, `public/skill.md`, application code, validator behavior, stored-row fixtures, thresholds, or assertions.

## Self-check

- `npx tsc --noEmit`
- `npm run build`
- `npx playwright test e2e/field-book.spec.ts e2e/milk-county-board.spec.ts -c playwright.scratch.config.ts --project=desktop-chrome --project=mobile-chrome --workers=1 --reporter=line`
- Confirm both files are the entire diff.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

End with `READY-FOR-GATES` and report the six fixture declarations updated plus the exact desktop/mobile counts.
