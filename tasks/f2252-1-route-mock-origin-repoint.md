# Task f2252-1-route-mock-origin-repoint: repoint the orphaned e2e route mocks at the canonical API origin (lane-b, prefix "fix:")

**FIRE-AUTHORED s2252 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST:
- `AGENTS.md`
- `tasks/BACKLOG.md` — the **F-2251-1** row (root cause, diagnosed by your predecessor) and the **F-2252-1** row (the widened blast radius this task exists for)
- `reviews/ap15-frontier-registry.md` — the two-arm control that attributed the red to main. **Do not re-derive it.**
- `src/app/GameApi.ts` — `GAME_API_ORIGIN` is defined at `:5`
- `e2e/release-base-path.spec.ts` — **this is the pattern to copy.** It imports `GAME_API_ORIGIN` at `:2` and route-mocks against it at `:20`. The correct shape already exists in this repo; you are propagating it, not inventing it.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-2251-1 diagnosed s2251; blast radius widened and measured s2252, 2026-08-24)

The L3 cutover `3158eaff4213a8e00817662e6d3aff1296fcb133` (owner-approved "go") deliberately moved
`GAME_API_ORIGIN` in `src/app/GameApi.ts:5` from `https://gold-rush-3in.pages.dev` to
`https://agenttown.app`. **The product is correct. The e2e fixtures were never swept.**

Every `page.route()` mock still registered against the OLD Cloudflare URL stopped intercepting that
instant, so LIVE sqlite standings reach the browser in place of the seeded fixtures. The failure
signature is unmistakable and identical everywhere: the seeded row is expected, and the live row
`Assay E2E Probe … anthropic/claude-opus-5 · goldrush-attended-assay-e2e` arrives instead.

⚠️ **s2251 scoped the cure to "the six route mocks in two files". That is roughly HALF the class.**
s2252 grepped the whole of `e2e/` and then ran the four files nobody had examined:

**Measured s2252, `--project=desktop-chrome --workers=1`, clean main — 6 failed / 5 passed:**

| Test | Title |
|---|---|
| `e2e/assay-auto-tape.spec.ts:54` | "a qualifying run posts its tape without pressing Keep this tape" |
| `e2e/assay-ledger-page.spec.ts:91` | "renders the county book and this claim from a seeded first run" |
| `e2e/assay-ledger-page.spec.ts:113` | "keeps local records visible when the county wire is quiet" |
| `e2e/assay-ledger-page.spec.ts:125` | "shows the honest county empty state" |
| `e2e/assay-season-roll.spec.ts:102` | "the county board opens on the season now riding and reaches the closed first ledger" |
| `e2e/sea-2-season-page.spec.ts:54` | "plain boot opens the season list and a season page without losing legacy standings" |

Those are IN ADDITION to the six s2251 already attributed, each of which also fails on mobile-chrome
(one citation per line — a wrapped title is unrecoverable to a line-oriented grep, F-1425-2):

- `e2e/lb-01-county-standings.spec.ts:247` ("public county rows carry submitted time while legacy rows keep the missing-time fallback")
- `e2e/lb-01-county-standings.spec.ts:630` ("secure submits the county row with pinned origin, hashes, and profile name")
- `e2e/lb-01-county-standings.spec.ts:730` ("Claim Ledger renders the seeded county board and its empty contract state")
- `e2e/milk-county-board.spec.ts:374` ("plain boot: a failing standings request adds no error of the application own")
- `e2e/milk-county-board.spec.ts:400` ("plain boot: standings accept pre-declaration rows but reject malformed or dishonest stacks")
- `e2e/milk-county-board.spec.ts:442` ("plain boot: posse chips rank within size, the field book counts hands, and a row watches its run")

⛔ **DO NOT REVERT THE CUTOVER. DO NOT EDIT ANY ASSERTION VALUE TO MATCH LIVE DATA.** The tests encode
the right expectations; only their *interception target* is stale. Greening a red by weakening an
assertion is forbidden (F-1441-3).

## Scope

1. **Repoint every route mock.** In each file below, add `import { GAME_API_ORIGIN } from '../src/app/GameApi';`
   (alongside the existing `../src/...` imports) and replace the hardcoded literal
   `https://gold-rush-3in.pages.dev` inside every `page.route(...)` target — and inside any module-level
   route constant — with a template using `GAME_API_ORIGIN`. The path and glob suffix (`/api/standings**`,
   `/api/stats`) stay EXACTLY as they are. Verified sites on current main:
   - `e2e/lb-01-county-standings.spec.ts` — `:232`, `:274`, `:737`
   - `e2e/milk-county-board.spec.ts` — `:381`, `:408`, `:454`
   - `e2e/assay-auto-tape.spec.ts` — `:45`
   - `e2e/assay-season-roll.spec.ts` — `:87`
   - `e2e/sea-2-season-page.spec.ts` — `:61`, `:135`
   - `e2e/assay-ledger-page.spec.ts` — `:8` (the `STATS_ROUTE` const; repoint the const, not its uses)
   ⓘ Coordinates are from main at authoring time and may drift by an import line as you edit — **find the
   sites by grepping the literal, not by trusting these numbers.** `grep -rn "gold-rush-3in.pages.dev" e2e/`
   must return ZERO route-mock hits when you are done.

2. **`e2e/mp-07c-3-invitation.spec.ts:47` ("the tavern invites an agent in one paste without closing the human door") — MEASURE FIRST, then repoint.** This one is NOT a mock: it is an
   assertion on product output. `src/town/TownScene.ts:2383` builds the invitation command from
   `relayBaseFromTownSearch()` → `src/mp/RideTogether.ts:73` → `GAME_API_ORIGIN`, so the app now renders
   `agenttown.app` while the test asserts `pages.dev`. **s2252 predicted this by reading the code and did
   NOT run it — you must.** Run that spec BEFORE editing:
   - **Red before** → derive the expected string from `GAME_API_ORIGIN` (changing no other part of the
     assertion) and confirm green after. This preserves the assertion's intent exactly: "the invitation
     shows the canonical API origin."
   - **Green before** → the code-reading was WRONG. **STOP editing this file, leave it untouched, and
     report that s2252's prediction is refuted and why.** Do not force it.

3. **Change nothing else.** No product code, no assertion values, no test titles, no new tests, no
   `red-inventory` refresh (that is deliberately a follow-up — refreshing it before this lands would
   record a fixture defect as a suite red).

## Firewall

Touch ONLY: `e2e/lb-01-county-standings.spec.ts`, `e2e/milk-county-board.spec.ts`,
`e2e/assay-auto-tape.spec.ts`, `e2e/assay-season-roll.spec.ts`, `e2e/sea-2-season-page.spec.ts`,
`e2e/assay-ledger-page.spec.ts`, `e2e/mp-07c-3-invitation.spec.ts` (item 2's conditions only).

NO changes to: `src/**` (in particular `src/app/GameApi.ts` — the cutover is owner-approved and final) ·
`functions/**` · any assertion value, expected string, or test title · any other `e2e/*.spec.ts` ·
`scripts/**` · `package.json` · `playwright.config.ts` · `tasks/**` · `specs/**` · sim semantics ·
`scripts/red-inventory*` or its snapshot.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- `grep -rn "gold-rush-3in.pages.dev" e2e/` → report the exact remaining hits and why each is legitimate
  (expected: zero, or only `mp-07c` if item 2 refuted).
- **The six named suites green on BOTH projects at `--workers=1`** (§3.1 — never default workers):
  `npx playwright test e2e/lb-01-county-standings.spec.ts e2e/milk-county-board.spec.ts e2e/assay-auto-tape.spec.ts e2e/assay-season-roll.spec.ts e2e/sea-2-season-page.spec.ts e2e/assay-ledger-page.spec.ts --workers=1`
  Report the before/after pass/fail counts per project as a table. Anything still red after the repoint is
  a SEPARATE defect — name it, do not chase it.
- `e2e/mp-07c-3-invitation.spec.ts` — report its before AND after result on both projects.
- `e2e/release-base-path.spec.ts` green both projects (the file whose pattern you copied — it must not move).
- Zero console/page errors in the boot probes those suites already carry.
- `test:node-guards` is **NOT owed** — the diff touches none of `src/sim/`, `src/systems/`, `src/entities/`
  (F-1460-1's key). Do not run it; say so in your report.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op
wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) the before/after table per project, (b) the mp-07c verdict and whether
s2252's prediction held, (c) the final grep output, (d) any red that survived the repoint, named.

---

## CORRECTION NOTE — s2252, appended after dispatch (claimed-spec-harness-guard)

⚠️ **The self-check line naming `e2e/release-base-path.spec.ts` is INCOMPLETE AS WRITTEN, and the
correction is appended rather than edited in place so the citations above do not rot (F-1397-3).**

That spec is CLAIMED BY ANOTHER CONFIG: `playwright.release-base.config.ts:9` selects it via
`testMatch: /release-base-path\.spec\.ts/`, and the default config excludes every such file
(`playwright.config.ts:47`, `testIgnore: [... ...claimedByAnotherConfig]`). **So
`npx playwright test e2e/release-base-path.spec.ts` under the DEFAULT config collects ZERO tests and
exits rc=1** — a collection break that looks exactly like a failure and is not one.

➡️ **Run it with its owning config instead:**
`npx playwright test --config playwright.release-base.config.ts --workers=1`

ⓘ This master was already dispatched when `test:ledger-guards` caught this (the s1301 ordering law
working as designed — the battery that judges a master runs after the master is written). **The
copy the runner is executing does NOT contain this note.** If you are that runner and you hit
`0 tests / rc=1` on that one command, that is THIS defect, not your slice: report it and move on.
Do not re-copy this master to the queue while a run holds it (F-1307-1).
