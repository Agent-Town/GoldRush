# f2252-1 — repoint the orphaned e2e route mocks at GAME_API_ORIGIN

**Slice:** `f2252-1-route-mock-origin-repoint` (lane-b, FIRE-AUTHORED s2252)
**Branch/tip:** `lane/b` @ `8eaec89f4` — runner commit `runner(lane-b): f2252-1-route-mock-origin-repoint.md`
**Base:** `8017cbb9d3dd47a79c0c4912715ad344419f30c8`
**Merge:** `0cec17a37be1e483090757f932d48cdea03aebf8` (s2253)
**Gated by:** s2253, detached worktree `gate-s2253` at main `d1507d514` + `merge --no-ff lane/b`, `--workers=1` throughout (§3.1)

## VERDICT: MERGED — the cure is complete over its declared class, and one masked red was revealed and filed (F-2253-1, non-blocking)

## What it does

The L3 cutover `4c5685b1dcf690824f572656039f304e84efa3e9` (owner-approved) moved `GAME_API_ORIGIN`
in `src/app/GameApi.ts:5` from `https://gold-rush-3in.pages.dev` to `https://agenttown.app`. Every
`page.route()` mock still registered against the old literal stopped intercepting that instant, so
live sqlite standings (`Assay E2E Probe … goldrush-attended-assay-e2e`) reached the browser in place
of the seeded fixtures. This slice repoints **11 route-mock sites across 6 spec files** plus **one
assertion in a 7th** at `GAME_API_ORIGIN`, propagating the shape `e2e/release-base-path.spec.ts`
already used (`:2` imports the constant, `:20` mocks against it).

It changes **no assertion value, no test title, no product code**. The only expected-string edit is
`mp-07c-3-invitation.spec.ts:48`, which the master authorised *conditionally* on a measurement —
see the mp-07c row below.

## Evidence (merged tree, detached worktree, `--workers=1`)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, `✓ built in 1.45s`; asset-diet 84% GLB / 87% PNG cut |
| Six repointed suites, **both projects** (`lb-01-county-standings`, `milk-county-board`, `assay-auto-tape`, `assay-season-roll`, `sea-2-season-page`, `assay-ledger-page`) | **64 passed / 0 failed (1.6m), rc=0** |
| `e2e/release-base-path.spec.ts` (own config `playwright.release-base.config.ts`) | **2 passed / 0 failed (12.6s)** — the pattern source did not move |
| `e2e/mp-07c-3-invitation.spec.ts`, both projects | **2 failed, rc=1** — at `:59`, NOT at the repointed `:47`. See F-2253-1 |
| `grep -rn "gold-rush-3in.pages.dev" e2e/` | **zero hits** |
| Zero console/page errors | asserted inside the merged suites' own plain-boot tests (`milk-county-board:375/:401/:443`, `sea-2:55/:134/:163`), all green both projects |
| `npm run test:node-guards` | **NOT owed and not run** — the diff touches no `src/sim/`, `src/systems/`, `src/entities/` (F-1460-1's key). Diff is 7 files, all `e2e/*.spec.ts` |

Screenshots: `reviews/shots-f2252-1/` (county standings desktop+mobile, assay ledger records, season
roll, mp-07c invitation) — the county board images now render the **seeded** rows, which is the
visible form of the cure.

**Expected pass count derived from the cure, not from the runner's headline:** 11 mock sites + 1
assertion = the 12 replaced literals in the diff; the 6 files carry 64 tests across two projects and
all 64 pass. s2251 measured 12 red across 2 of these files (two-arm control) and s2252 measured 6 red
across 4 more on desktop alone. Both before-states are recorded with controls; I did not re-take them,
and say so rather than implying a control I did not run.

## Merge classification

Base `ca882843`. Main moved **4 files** since that base — `STATUS.md`, `tasks/BACKLOG.md`,
`marketing/outbox/gazette-queue.md`, `tasks/f2252-1-route-mock-origin-repoint.md` — i.e. bookkeeping
only, with **zero intersection** with the lane's 7 paths.

| File | Class |
|---|---|
| `e2e/assay-auto-tape.spec.ts` | LANE-TOUCHED (main untouched) |
| `e2e/assay-ledger-page.spec.ts` | LANE-TOUCHED |
| `e2e/assay-season-roll.spec.ts` | LANE-TOUCHED |
| `e2e/lb-01-county-standings.spec.ts` | LANE-TOUCHED |
| `e2e/milk-county-board.spec.ts` | LANE-TOUCHED |
| `e2e/mp-07c-3-invitation.spec.ts` | LANE-TOUCHED |
| `e2e/sea-2-season-page.spec.ts` | LANE-TOUCHED |

Three-way `merge --no-ff`: **zero conflicts**, `19 insertions / 12 deletions`, identical stat in the
gate worktree and on main. No MAIN-MOVED file, so no graft was needed.

## Findings

### F-2253-1 — mp-07c is still red, at an assertion that was UNEXECUTED before this slice (NON-BLOCKING)

s2252 predicted `mp-07c-3-invitation.spec.ts` red and ordered its runner to **measure before editing**.
The runner measured it: red on both projects at `:46`, `toHaveValue` expecting `pages.dev` against a
received `agenttown.app`. **The prediction HELD** — it was not refuted — so the conditional repair was
authorised and applied.

After the repair the origin assertion passes and execution advances 13 lines, to `:59`
`expect(errors.console).toEqual([])`, which fails on both projects with:

```
Failed to load resource: the server responded with a status of 404 ()
```

**This is not a regression and not caused by this diff.** Traced by reading, not inherited:

- the spec mocks `**/api/multiplayer/create` (`:14`, origin-agnostic, still intercepts) and returns a
  synthetic code `0123456789ABCDEF01234567`;
- it does **not** mock `inspect`, so `src/mp/RideTogether.ts:163` fetches
  `${relayBase}/api/multiplayer/inspect?code=…` **live**;
- the live relay has no such room, and `functions/api/_multiplayer.ts:262` answers
  `room_not_found` with **status 404** — the server behaving correctly;
- so the 404 is **origin-independent**: it would have fired identically against `pages.dev`.

On main the test dies at `:46`, so `:59` never runs. Curing the masking assertion revealed a red that
was always there — more failures after a cure is the expected direction, not a defect in the cure.

**Cure (unclaimed, cheap, and the corpus already holds the pattern):** mock
`**/api/multiplayer/inspect**` exactly as `e2e/mp-ride-lobby.spec.ts:95` does. Same family as the
slice just merged: an unmocked route reaching a live service.

**Why it does not block:** the file was red before and is red after, on both projects; the diff moves
it strictly forward. Holding 11 correct repoints hostage to a 12th, unrelated fixture gap would leave
the whole class orphaned to protect a test that is red either way.

### F-2253-2 — the stale literal survives OUTSIDE this slice's class (RECORDED, not a defect)

`grep -rn "gold-rush-3in"` over the merged tree is zero under `e2e/` but non-zero elsewhere. Every
remaining occurrence was read, and none is orphaned:

- `functions/api/{standings,stats,telemetry,redeem,_bugs,_accounts,_multiplayer}.ts` —
  `ALLOWED_ORIGINS` sets containing **both** `gold-rush-3in.pages.dev` and `agenttown.app`. These are
  CORS allowlists; keeping the old origin is correct while the Pages deployment still serves.
- `scripts/{seed-ladder,mint-prize-codes,fetch-bugs,second-rider}.mjs`, `scripts/deploy.sh` —
  operator defaults, most behind an env/argv override.

Recorded so the next fire greps the whole tree and does **not** mistake these for a missed sweep.
`scripts/seed-ladder.mjs:32` is the one with no override (`const API = 'https://gold-rush-3in.pages.dev'`);
whether that should follow the cutover is an operator question, not a fixture one, and is left open.

## Where does the player see this?

Nowhere — this slice is test-fixture only. Its player-facing significance is indirect and real: the
county board, claim ledger, season pages and assay ledger now have honest regression cover again.
Twelve of those tests were reporting a fixture defect as a product red, and `lb-01:731` ("Claim
Ledger renders the seeded county board and its empty contract state") is a player-facing surface that
had no working guard for 12 days.

## Runner conduct

Clean. It measured mp-07c before editing as ordered, stayed inside the firewall (7 files, all
authorised), touched no `src/**`, weakened no assertion, discarded regenerated screenshot churn
without committing it, and named the surviving red as a separate defect instead of chasing it.
Its `test:node-guards` non-run was correct and correctly declared.

⚠️ **One known master defect, recorded by s2252 and confirmed harmless here:** the copy the runner
executed predates s2252's correction note about `e2e/release-base-path.spec.ts` needing its own
config. The runner reported that spec `2/2 passed` regardless, and I re-ran it with
`--config playwright.release-base.config.ts` (2/2, 12.6s), so the collection-break hazard did not
materialise in this run.
