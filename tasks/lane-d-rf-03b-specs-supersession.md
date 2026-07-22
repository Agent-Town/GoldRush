# Task rf-03b-specs-supersession: realign the two stale bench-in-normal-play specs to RF-03b's desk reality (lane-d, commit prefix "test:")

**FIRE-AUTHORED (attended review welcome) — s930, 2026-07-23.** Test-only corrective. No src changes.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d` (branch `lane/perf`).
READ FIRST: AGENTS.md; `reviews/bug-office-desk.md` (the RF-03b drain that reversed the door); the canonical GREEN spec `e2e/bug-office-desk.spec.ts` (this is the reference for the new desk reality — mirror its testids exactly); the two specs you will edit (`e2e/task-037-assay-bench-ungate.spec.ts`, `e2e/town-assay-office-blender.spec.ts`).

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/perf main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. (Note for this fire: `lane/perf` was `git rev-list --count main..lane/perf`=0 at authoring time — a clean reset is expected safe.)

## Why (F-902-1 intended-supersession, `tasks/BACKLOG.md:742`, owner-blessed disposition; premise re-verified on main s930)
RF-03b ("THE COMPLAINTS DESK", drained s902) deliberately made the Assay Office door open the in-game bug-reporting desk in NORMAL play, and retreated the crafting bench behind `?debug`. The single gate is the shared install factory:
- `src/crafting/AssayBench.ts:281-285` — `install()` returns `AssayBenchPanel` (the bench) **only when the URL has `?debug`**, else `ComplaintDeskPanel` (the desk). Both the town door and the overworld assay office go through this factory, so BOTH open the desk in normal play.
- `src/town/TownScene.ts:1190-1193` — the town approach prompt reads `<building name> … the clerk takes complaints` with a `Complaints Desk` button in normal play; `debug crafting door` / `Crafting` button under `?debug`.

Two specs still assert the OLD bench-in-normal-play and are therefore FALSE on main (false-red landmines on every town/assay drain, and a hygiene blocker for the E1 Frontier release launch gate which lists the desk as a gated component):
1. `e2e/task-037-assay-bench-ungate.spec.ts:142` — test `normal play shows the Assay Office prompt and opens the bench without debug`: builds the overworld Assay Office via the real UI, presses Enter, asserts `assay-bench` visible (:157) and posts an assay order. Under RF-03b, normal play opens the desk; the bench + order-posting now require `?debug`.
2. `e2e/town-assay-office-blender.spec.ts:186` and `:218` (tests at :140 and :207) — after loading the 3D pilot they walk to the town Assay Office, click `town-open-assay`, and assert `assay-bench` visible. Under RF-03b that door opens `complaint-desk` in normal play. (These tests exist to prove the 3D pilot's INTERACTION survives facade/GLB load — the interaction is now "the desk opens", not "the bench opens".)

Owner-blessed disposition (BACKLOG:742, verbatim): "rewrite task-037:142 to assert the desk, or retire it — the desk's own spec already covers normal-play visibility."

## Scope
1. **`e2e/task-037-assay-bench-ungate.spec.ts` test at :142 only.** The overworld Assay Office build + bench + order-post flow is UNIQUE coverage (the desk spec only covers the town). Preserve it by moving the test onto the `?debug` bench path (where crafting now lives), NOT by gutting it:
   - Add `debug` to the test's `openGame(...)` query string (currently `?timescale=4&nowaves&nolevel&nokill&seed=task037-normal`) so `install()` returns the bench.
   - Rename the test so it no longer claims "without debug" (e.g. `debug play builds the Assay Office and posts an order at the bench`).
   - The body should still: assert bench+prompt hidden pre-build (:145-146), build via `buildAssayOfficeWithUi`, walk to the office, see the `assay-office-prompt` `Enter - Assay Office`, press Enter, assert `assay-bench` visible, fill+post an order, assert the pending status, clean up, zero console/page errors. All of this is valid under `?debug`.
   - If, on running, the `assay-office-prompt`/`Enter` copy differs under `?debug`, adjust the assertions to the OBSERVED live text (cite what you saw in your report) — do not invent copy.
   - **Do NOT touch the tests at :171 and :192** — they already run under `?debug` and are OUT OF SCOPE (see Firewall).
2. **`e2e/town-assay-office-blender.spec.ts` tests at :140 and :207 — only the bench assertions.** These open the town door in normal play (no `?debug`), so the door opens the desk:
   - Line ~186 (test :140): after `page.getByTestId('town-open-assay').click()`, replace `await expect(page.getByTestId('assay-bench')).toBeVisible();` with an assertion that the desk opened — mirror `bug-office-desk.spec.ts` exactly: `await expect(page.getByTestId('complaint-desk')).toBeVisible();`. The subsequent close on line ~187 uses `assay-close`; the desk's close testid is `complaint-close` (see `bug-office-desk.spec.ts:120`) — update it so the close still works.
   - Line ~218 (test :207): replace `await expect(page.getByTestId('assay-bench')).toBeVisible();` with `await expect(page.getByTestId('complaint-desk')).toBeVisible();` (this test asserts-then-ends; no close to update).
   - The `town-approach-prompt` `toContainText('Assay Office')` assertions (:184, :216) should STILL pass — the prompt keeps the building name (`TownScene.ts:1192`). Leave them; if either fails on the live text, cite the observed text and adjust minimally.
   - Leave the 3D-pilot mesh/triangle/bounds/frame-time assertions and the `data-town3d-*` checks UNTOUCHED — this task is only the door-interaction lines.
3. Confirm the change is consistent with the canonical desk spec by running `e2e/bug-office-desk.spec.ts` and showing it stays GREEN both projects (regression guard — you must not have altered desk behavior).

## Firewall
Touch ONLY: `e2e/task-037-assay-bench-ungate.spec.ts` (the test at :142 and its title/URL/assertions only) and `e2e/town-assay-office-blender.spec.ts` (the bench-visible + close lines in the tests at :140 and :207 only).
NO changes to: ANY file under `src/` (this is a spec-realignment; the runtime is already correct — if a spec cannot be made green without a src change, STOP and report, do NOT edit src) · `functions/` · `e2e/bug-office-desk.spec.ts` (it is the reference; run it, do not edit it) · **the tests at `task-037:171` and `task-037:192`** — their `debugPlaceAssayOffice` building-placement failure is a PRE-EXISTING runtime red (F-902-2) reserved for attended investigation ("investigate, don't blind-fix"); leave them byte-for-byte and note in your report whether they are still red and that the failure is at `debugPlaceAssayOffice` (placement), NOT the desk/bench branch · any other spec · sim semantics · goals.json.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean + `npm run build` green.
- `npx playwright test e2e/task-037-assay-bench-ungate.spec.ts` — the rewritten test at :142 PASSES on desktop (it is desktop-gated). Report the pass. The tests at :171/:192 are OUT OF SCOPE: report their status verbatim and confirm any failure is the pre-existing `debugPlaceAssayOffice` placement red (do NOT fix).
- `npx playwright test e2e/town-assay-office-blender.spec.ts` — GREEN both projects (desktop-chrome + mobile-chrome), zero console/page errors (the tests already assert `assertNoErrors`).
- `npx playwright test e2e/bug-office-desk.spec.ts` — GREEN both projects (regression guard; unchanged).
- No `src/` diff: `git diff --name-only` shows ONLY the two e2e specs.

## No-op guard
If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate. (This task DOES have work: three live assertions contradict the shipped desk. If they somehow already pass, that means the specs were fixed since s930 — report that with the passing evidence.)

End: READY-FOR-GATES + report: the exact before→after of each edited assertion/URL/title, the pass lines for task-037:142 + the full blender spec + the desk regression spec, and the verbatim status of task-037:171/192 (pre-existing placement red, untouched).
