# Task f2253-1-mp07c-inspect-mock: mock the ride-inspect route in mp-07c so its console guard stops reporting a live 404 (lane-b, prefix "fix:")

**FIRE-AUTHORED s2253 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST:
- `AGENTS.md`
- `reviews/f2252-1-route-mock-origin-repoint.md` — **the F-2253-1 section is your whole evidence chain.** It was measured on the merged tree this same night. Do not re-derive it.
- `tasks/BACKLOG.md` — the **F-2253-1** row
- `e2e/mp-ride-lobby.spec.ts` — **this is the pattern to copy.** In its seeding helper it mocks
  `**/api/multiplayer/create` and, immediately below, `**/api/multiplayer/inspect**`, both as
  origin-agnostic globs. The correct shape already exists in this repo; you are propagating it.
- `e2e/mp-07c-3-invitation.spec.ts` — the subject
- `src/mp/RideTogether.ts` — `:163` and `:175` are the two live `fetch` calls to `/api/multiplayer/inspect`
- `functions/api/_multiplayer.ts` — `:262` is the `room_not_found` → 404 answer

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

## Why (F-2253-1, measured s2253 on the merged tree of `0cec17a37be1e483090757f932d48cdea03aebf8`)

Draining `f2252-1` repointed this spec's origin assertion, which had been failing at `:47`. That
assertion now passes — and execution advances 13 lines into code **that had never run before**, where
it fails on both projects at

- `e2e/mp-07c-3-invitation.spec.ts:59` ("the tavern invites an agent in one paste without closing the human door")

with `Failed to load resource: the server responded with a status of 404 ()`.

**This is not a regression and it is not origin-related.** Traced by reading the source, not inferred:

1. the spec mocks `**/api/multiplayer/create` and is handed the synthetic code `0123456789ABCDEF01234567`;
2. it does **not** mock `inspect`, so `src/mp/RideTogether.ts:163` fetches
   `${relayBase}/api/multiplayer/inspect?code=…` against the **live** relay;
3. no such room exists there, so `functions/api/_multiplayer.ts:262` answers `room_not_found` with
   **status 404 — the server behaving correctly**;
4. the browser logs every failed resource load as a console error, and the spec's blanket
   `expect(errors.console).toEqual([])` rejects it.

The same call would have 404'd identically against the old `pages.dev` origin. On main before the
repoint the test died at `:47`, so `:59` was unexecuted code and nobody could see this.

⛔ **DO NOT weaken the console guard.** Deleting or narrowing `expect(errors.console).toEqual([])` to
green this is forbidden (F-1441-3) — that assertion is the Debug-Gate Leftover defence (Mistake #10)
and it is doing its job right now. The fix is to stop making a live call, not to stop noticing it.

⛔ **DO NOT touch `src/**` or `functions/**`.** The product is correct: a real player opens a real
room, and inspect answers 200. Only the test invents a room that was never created.

## Scope

1. **Mock the inspect route in `e2e/mp-07c-3-invitation.spec.ts`.** Beside the existing
   `page.route('**/api/multiplayer/create', …)` at `:14`, add an origin-agnostic
   `page.route('**/api/multiplayer/inspect**', …)` fulfilling **200** with a room-info body for the
   room the create mock just minted. Copy the shape from `e2e/mp-ride-lobby.spec.ts`'s seeding helper
   (the `ok: true, started: false, players, roster` payload) and keep the glob origin-agnostic — that
   is what makes it survive the next origin change, which is the whole lesson of F-2252-1.

2. **Then measure, and let the measurement decide the payload.** Run the spec on both projects. If a
   200 room-info body changes what the ride card renders and moves any of the assertions at `:42`–`:55`,
   **adjust the mock PAYLOAD until those assertions pass unchanged.** Never adjust an assertion. If no
   payload can satisfy them, that is a real product/test disagreement: **STOP and report it** with the
   payload you tried and the assertion that resisted.

3. **Report whether the console guard is now genuinely empty, or merely emptier.** If a *different*
   console error appears once the 404 is gone, name it and its source and **do not chase it** — it is
   the next layer of the same mask and belongs in the ledger as its own finding, not in this diff.

4. **Change nothing else.** No product code, no other spec, no assertion values, no test titles, no
   new tests.

## Firewall

Touch ONLY: `e2e/mp-07c-3-invitation.spec.ts`.

NO changes to: `src/**` (in particular `src/mp/RideTogether.ts` and `src/town/TownScene.ts`) ·
`functions/**` · any other `e2e/*.spec.ts` (including `e2e/mp-ride-lobby.spec.ts`, which you are
reading as a model and must leave exactly as it is) · any assertion value, expected string or test
title · `scripts/**` · `package.json` · `playwright.config.ts` · `tasks/**` · `specs/**` · sim
semantics · `scripts/red-inventory*` or its snapshot.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean; `npm run build` green.
- **`e2e/mp-07c-3-invitation.spec.ts` green on BOTH projects at `--workers=1`** (§3.1 — never default
  workers): `npx playwright test e2e/mp-07c-3-invitation.spec.ts --workers=1`.
  Report the before AND after pass/fail per project. The before is expected to be **2 failed** at
  `:59`; if it is anything else, say so — the premise has moved and that is a finding.
- **`e2e/mp-ride-lobby.spec.ts` unmodified-green on both projects** — it is the file whose pattern you
  copied and it must not move.
- Zero console AND page errors in the spec's own guard at `:59`–`:60` (that IS the acceptance test).
- Screenshot lands at `reviews/shots-mp-07c-3/<project>-invitation.png` as the spec already writes it.
- `test:node-guards` is **NOT owed** — the diff touches one `e2e/*.spec.ts` and none of `src/sim/`,
  `src/systems/`, `src/entities/` (F-1460-1's key). Do not run it; say so in your report.

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent
no-op wastes a queue slot and a gate.

End: **READY-FOR-GATES** + report (a) the before/after per project, (b) the exact mock payload you
landed and whether item 2's measurement forced you to change it, (c) whether any new console error
surfaced behind the 404, named but not chased.
