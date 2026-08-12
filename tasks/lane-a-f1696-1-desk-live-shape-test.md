# Task F-1696-1: stop requiring a live slug-keyed owner-desk item (LANE-A, commit prefix `test:`)

**FIRE-AUTHORED s1699 (attended review welcome)**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` finding **F-1696-1**; `scripts/desk-declaration-guard.test.mjs` in full; `scripts/desk-declaration-guard.mjs` only to understand the two key shapes. This is a test-only corrective. Do not change the guard.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. **THEN A CLEANLINESS LINE: `git -C worktrees/lane-a status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.**

## Premise checks

Run these after the lane is refreshed. Every count must be exactly `1`; otherwise STOP and report the current titles rather than guessing at a replacement.

```sh
grep -Fc "the live desk carries BOTH shapes — the slug axis is not vacuously green" scripts/desk-declaration-guard.test.mjs
grep -Fc "a SLUG-keyed desk item WITH a declaring row passes" scripts/desk-declaration-guard.test.mjs
grep -Fc "MANUFACTURED F-1534-2: a SLUG desk item with NO row exits 1 and names the slug" scripts/desk-declaration-guard.test.mjs
grep -Fc "a desk of ONLY slug items does not trip the zero-keyed-items refusal" scripts/desk-declaration-guard.test.mjs
```

## Why (F-1696-1, measured 2026-08-12)

The live owner's desk now carries 21 F-IDs and zero goal slugs. That is a valid state, but the test titled **“the live desk carries BOTH shapes — the slug axis is not vacuously green”** makes a mutable owner queue part of a parser's unit-test fixture and goes red whenever no current decision happens to use the slug spelling. The manufactured tests immediately around it already prove all useful slug behavior: declared passes, undeclared fails and is named, citation-shaped mentions do not declare, prose backticks do not become items, an F-ID plus slug alias remains one item, and a slug-only desk is accepted.

The lazy correct fix is deletion: a live queue is not a stable unit fixture, and duplicating another synthetic slug arm would add no discriminator.

## Scope

1. Delete only the test titled **“the live desk carries BOTH shapes — the slug axis is not vacuously green”** and its now-local explanatory comments.
2. Keep every manufactured slug-axis test byte-for-byte unless formatting requires otherwise. Do not replace the deleted live-population test with a weaker copy of an existing fixture.
3. Leave `desk-declaration-guard.mjs` unchanged. Its parsing, refusal codes and grandfather set are not defective.
4. If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `scripts/desk-declaration-guard.test.mjs`.

NO changes to: `scripts/desk-declaration-guard.mjs`; `STATUS.md`; `tasks/BACKLOG.md`; `tasks/goals.json`; any other `scripts/**`, `src/**`, `e2e/**`, `specs/**`, `reviews/**`, or package/config file. This creates no new guard and changes no gate topology.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit`; `npm run build`.
- `node scripts/desk-declaration-guard.test.mjs` passes with **28/28** tests. Report the count so deletion cannot masquerade as a skipped file.
- Prove the three load-bearing manufactured slug arms still execute: declared slug passes, undeclared slug exits 1 naming the slug, and a slug-only desk does not trigger the zero-keyed-items refusal.
- `npm run test:ledger-guards` green.
- `git diff -- scripts/desk-declaration-guard.test.mjs` shows one test block removed and no parser/fixture weakening elsewhere.
- No Playwright or screenshots: this renders nothing and changes no runtime.

End with `READY-FOR-GATES`, the before/after test count, and the exact deleted title.
