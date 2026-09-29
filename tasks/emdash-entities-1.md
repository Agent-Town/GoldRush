# Task emdash-entities-1: the six HTML-entity em dashes leave the screen and the guard learns to see entities (LANE-B, Astra, commit prefix "fix:")

CODEX: model=gpt-6-astra

You are Codex (gpt-6-astra), implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b` (branch `sol/wave-lane-b`; the branch name is history, your commits are path-scoped). You do not touch STATUS.md, reviews, tasks or other lanes. Lane-b's `node_modules` is a symlink to the primary checkout: expected, not dirt; do NOT run `npm install`/`npm ci`.
READ FIRST: AGENTS.md; `scripts/no-emdash-guard.test.mjs` and `scripts/no-emdash-scan-space.mjs` (the owner's no-em-dash law as a guard: today it matches only the literal character); `src/ui/ProspectorPanel.ts:12` and `:190`; `src/encyclopedia/reader.ts:811`, `:816`, `:909`, `:1129`; `docs/marketing/BRAND-BOOK.md` (voice; the Herald's ledger register for any placeholder glyph).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL; the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B sol/wave-lane-b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work; resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence (`artifacts/**`, `reviews/shots-*`, any `.png`) are NEVER work and NEVER a STOP; discard them and PROCEED, listing what you discarded. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` must be clean, with the FACTORY-CHURN EXCEPTION (F-1407-1): `logs/**`, `artifacts/**`, `reviews/shots-*` and any `.png` are always expected, never a STOP; what still STOPs is modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (attended, 2026-09-29, from the launch-thread review)
The owner's law forbids em dashes in anything a reader sees. Six `&mdash;` entities render as em dashes on screen and the guard cannot see them because it looks for the character, not the entity: `src/ui/ProspectorPanel.ts:12` ("acts with your approval &mdash; repairs, pickups", the charter rung copy, visible in the launch film's Prospector charter) and `:190` ("… &mdash; secured claims advance the Prospector"), and four blank-cell markers in `src/encyclopedia/reader.ts` (`:811`, `:816`, `:909`, `:1129`, each a "no showing"/"unavailable" cell with an aria-label).

## Scope
1. `ProspectorPanel.ts`: rewrite the two sentences without a dash and without losing meaning (a colon or a comma; the rung copy stays one line).
2. `reader.ts`: replace the four `&mdash;` blank markers with one shared blank glyph that is not a dash (recommendation: a middle dot `·` or the word "none" in the Field Book's own small caps; pick one, use it at all four sites, keep every aria-label).
3. Extend `scripts/no-emdash-guard.test.mjs` so the scan also fails on `&mdash;`, `&#8212;`, `&#x2014;`, `\u2014` and `&ndash;`/`&#8211;` in the same scan space; prove it with a fixture: the test must red on a string containing `&mdash;` and stay green on the repaired tree.
4. Report `artifacts/emdash-entities-1/report.md`: before/after of the six sites, the guard's new patterns, screenshots of the Prospector charter rung copy and one Field Book blank cell (desktop and 390 px). If you find yourself about to exit without changes, WRITE WHY into your report first.

## Firewall
Touch ONLY: `src/ui/ProspectorPanel.ts` (the two strings), `src/encyclopedia/reader.ts` (the four markers), `scripts/no-emdash-guard.test.mjs`, `scripts/no-emdash-scan-space.mjs` (only if the scan space must name a new key), `artifacts/emdash-entities-1/**`.
NO changes to: any other `src/**` file, sim or gameplay values, `e2e/**` assertions, `site/**`, `tasks/**`, `specs/**`, `reviews/*.md`, `STATUS.md`, other lanes' work.

## Self-check (evidence, not vibes)
`node --test scripts/no-emdash-guard.test.mjs` green on the repaired tree and red on the fixture; `npx tsc --noEmit` and `npm run build` green; `e2e/task-025-bandits-dont-swim.spec.ts`, `e2e/m2-01-build-menu.spec.ts` and the Prospector panel / Field Book specs that exist (`ls e2e | grep -iE 'prospector|field-book|encyclopedia'`) unmodified-green both projects; zero console/page errors in plain boots; screenshots as named. `src/**` changed: this is a PINNED landing (same era).
End: READY-FOR-GATES + the six replacements as landed + the guard's new patterns + spec counts + commit hash.
