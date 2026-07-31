# f1297-2 — plain-boot tape button

- **Slice:** `f1297-2-plain-boot-tape-button` (F-1297-2, master authored by s1317)
- **Branch / tip:** `lane/m4` @ `6f992291` (single ahead-commit)
- **Merge:** `ae2a60f3ba1439d9515b73a5fb81b72805030355` (`--no-ff`)
- **Drained by:** s1318
- **Verdict:** ✅ **ACCEPT — merged.** The pre-declared REJECT conditions were both cleared, and I reproduced the decisive one myself rather than inheriting it.

## What it does

`e2e/f1297-2-plain-boot-tape-button.spec.ts` boots the game with **no `?debug`** and asserts that the
`keep-run-tape` button reaches the player after a real death. That is the whole slice: 22 lines of
test and two screenshots, no source change.

The button was already **correct** before this merge — three `deathOverlay.show` sites spread
`keepTapeOptions()` unconditionally, it always returns `onKeepTape`, and `DeathOverlay` renders the
button iff that is defined. What was missing was the **alarm**: every existing assertion on
`keep-run-tape` lived in `e2e/tape-01-run-tape.spec.ts` downstream of a single
`const query = '?debug&nolevel&nowaves&seed=tape-01-proof'`, so nothing in the tree would have
noticed the button disappearing from a plain boot. CLAUDE.md Mistake #10.

## The two bars, and how each was cleared

**Bar 1 — "a report without the manufactured RED is a pre-declared REJECT."** Because the behaviour
already works, this test is green the moment it is written *including if it is written wrong*, so the
deliverable was a guard proven to fail on the defect it exists to catch.

✅ Cleared, and **I did not take the runner's word for it.** I manufactured the defect myself on the
merged tree — `keepTapeOptions()` in `src/game/Game.ts` early-returns `{ tapeKept: false }` (no
`onKeepTape`) when `!isDebugEnabled()`, which is exactly the regression the guard is for:

| Step | Result |
| --- | --- |
| Mutation applied (`onKeepTape` gated behind debug) | **2 failed** — `expect(locator).toBeVisible() failed … element(s) not found`, both projects |
| Reverted with `git checkout HEAD -- src/game/Game.ts` | `git diff -- src/` **empty**; `Game.ts` sha256 `bcfb3d10024842dc` **identical** to pre-mutation |
| Re-run after revert | **2 passed** |

The runner's own mutation proof (in its run log) matches mine independently.

**Bar 2 — "any assertion on `__THREE_GAME_DIAGNOSTICS__` instead of the rendered button is a
REJECT."** ✅ Cleared: the spec asserts `page.getByTestId('keep-run-tape')` is **visible**. It asserts
what the player receives, not what the game intended — the F-1316-1 lesson applied.

## Scope 1 was measure-first and did not cancel

The master allowed the task to **STOP** if no plain boot reaches a death overlay at all — that would
have been a larger finding than the one it was sent for. The runner measured instead of assuming:

- `/` — no death after 150 s; stays in the start/profile flow.
- `/?seed=f1297-2-measure` — pauses at level-up when unattended.
- `/?seed=f1297-2-plain-only` — **death after 99.77 s** after two normal upgrade choices.
- `/?nolevel&timescale=8&seed=f1297-2-plain` (the test's query) — death after 13.69 s.

So a plain boot genuinely reaches the overlay; the harness params only make it fast enough to gate.

### I verified the load-bearing claim at source

The whole slice rests on those query params **not** being debug-gated — if any of them required
`?debug`, the "plain boot" would be a lie wearing a plain-boot name. ✓ VERIFIED in
`src/core/DebugParams.ts`: `debug` is its own field (`:40`), `timescale` is read at `:42` and returned
by `getTimescale()` with **no** `isDebugEnabled()` check, `seed` at `:41`, and `isLevelUpDisabled()`
(`:79`) reads `?nolevel` straight off the URL. None of them is gated on `debug`.

## Evidence (re-measured on the merged tree)

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green (chunk-size advisory only) |
| Own spec `--workers=1` | **2 passed** (desktop + 390 mobile) |
| Adjacent, **derived by grep** (`grep -rln keep-run-tape e2e src` → `tape-01-run-tape.spec.ts`, `DeathOverlay.ts`) | **10 passed** combined, both projects |
| Manufactured-defect proof | **2 failed → byte-exact revert → 2 passed** (above) |
| node-guards | 204/204 (see the fire's closing run) |
| Console/page errors | zero — the spec fails on any, and asserts `consoleErrors` is empty |

## Findings

### F-1318-3 — the slice shipped no `report.md`; its report exists only in the run log (process, non-blocking)

`artifacts/f1297-2-plain-boot-tape-button/` contains the two screenshots and **no report**, unlike
every recent slice (`artifacts/f1316-1-float-legibility/report.md` etc.). The full report — plain
measurements, mutation proof, gates, derived adjacent set — is present and complete, but it lives in
`tasks/runs/20260801-055645-lane-b-lane-b-f1297-2-plain-boot-tape-button.md.log`.

That is recoverable (run logs are mirrored into git under the Retention Law) but it is a trap for the
next drainer: **a fire checking `artifacts/**/report.md` for the mandated manufactured-RED proof would
find nothing and could reject a slice that fully satisfied its bar.** I nearly did. Worth a line in
the task template that the report lands as a file, not only as the runner's closing message.

### Note — the test's speed depends on a non-release build

`readDebugParams` returns `DEFAULT_PARAMS` outright when `RELEASE_E1` is set (`DebugParams.ts:34`), so
`timescale=8` is inert in a release build and the 45 s visibility timeout would not survive the ~100 s
plain death. Not a defect in the guard — the e2e projects build with the flag off — but the guard is
coupled to that, and a future release-mode e2e project would need the slower query.
