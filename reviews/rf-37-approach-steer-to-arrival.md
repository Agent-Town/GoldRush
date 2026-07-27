# rf-37 — approach-steer-to-arrival

**Slice:** `lane-approach-steer-to-arrival` (attempt 3)
**Branch/tip:** `lane/m3` @ `2a31504c` (runner(lane-a), 2026-07-27T08:34:38+07)
**Base:** `c12e4c61` (s1111 lock commit)
**Drained by:** s1113 fire, 2026-07-27
**§3.0 drain-block-check:** ✅ CLEAR — `[rf-37-approach-steer-to-arrival] status="authored"`

## Verdict

**MERGED — non-regressive improvement, measured against a same-box clean-main control.**

s1112 deferred this drain honestly: its battery read 12/21 at `loadavg 27.55` and it refused to guess.
This fire re-ran it on a quiet box **and added the control s1112 could not run** — the same 7-spec battery
on pristine main. That control is what settles it, and it reframes the whole question.

## What it does

Nine town "walk to a thing" sites across 7 e2e specs used **blind timed keypresses**
(`keyboard.down('KeyA'); waitForTimeout(480); up('KeyA')`) to move the player toward a building or actor,
then asserted arrival. That is a race: the walk either lands or it doesn't, depending on frame timing.

rf-37 replaces each with a **closed-loop steer** — up to 48 × 160 ms steps, 0.6-unit axis tolerance,
re-reading the target from the runtime diagnostics each iteration and stopping as soon as the arrival
condition holds. Building targets resolve against **`plaza.slots`** (`approach` field, no fallback);
actor targets (`newsie`) re-read the live `actors` position each step. **No coordinate literals, no teleports.**

## Evidence

All numbers below are **mine, on this box**, unless labelled as the runner's.

### Merge classification (verified, not inherited)

| | |
|---|---|
| merge-base | `c12e4c61` |
| LANE-TOUCHED (`base..2a31504c`) | **7 files, all `e2e/`** |
| MAIN-MOVED since base | 10 files |
| **Overlap** | **NONE** — clean per-file takeover, no 3-way graft needed |
| Debris | **ZERO** (no `.wrangler/tmp`, no artifact churn in the commit) |
| Landed bytes | **byte-identical to `2a31504c`** across all 7 files |

s1112 claimed zero overlap; I re-derived it rather than inherit it, and it holds.

### Static gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.28s** |

⚠️ **tsc is a real gate here, verified — not assumed.** This change is 100% `e2e/`, so tsc would be
vacuous if the config skipped that directory. `tsconfig.json` `include` is `["src", "e2e", "playwright.config.ts"]`
— `e2e` is covered. (Memory precedent: tsconfig omits `scripts/`, `rehearsal/`, `functions/`; it does **not** omit `e2e`.)

### The battery — with the control that decides it

Desktop `desktop-chrome`, same 7 specs, 21 tests collected:

| Run | Passed | Failed | loadavg at start |
|---|---|---|---|
| **clean main (CONTROL)** | **14 / 21** | 7 | ~2.9 |
| with rf-37, run 1 | **16 / 21** | 5 | 5.81 |
| with rf-37, run 2 | **15 / 21** | 6 | ~3.3 |

Mobile `mobile-chrome`, with rf-37: **16 passed / 4 failed / 1 skipped** (21 collected).
All 4 mobile failures are already in the desktop stable-red set — **no new mobile breakage**.

**Regression analysis (matched by test NAME, because the change shifts every line number):**

- **Run 1 regressions: NONE.** Run 2 regressions: **NONE.**
  In both runs the failure set is a strict **subset** of the clean-main failure set.
- **Red → green, both runs:** `en-01-claim-ledger` "claim ledger access, discovery beat, dupe guard,
  persistence, and fact cap" — red on clean main, green with rf-37 **2/2**.
- **Red → green, run 1 only:** `wd02-barks` "a debug-driven era milestone reaches Mei once" — **flaky**,
  see F-1113-2.

That is the merge case: **it fixes at least one real race and breaks nothing, on both projects.**

### Why no separate boot probe

No `src/**` file changed — the built bundle is identical by construction, so boot console/page-error
behaviour cannot have moved. The build ran green and is the proof that nothing in the app changed.
(The runner separately reported desktop+mobile town boot probes passing on identical bytes.)

## Findings

### F-1113-1 — the low absolute numbers are MAIN's, not rf-37's. The handoff's merge criterion was unmeetable as written.

s1112 set the bar: *"Expect 18/21 → merge... Near 12/21 on a genuinely QUIET box is a real finding —
fingerprint it against clean main before blaming rf-37."* I did exactly that fingerprint, and it inverts
the framing: **clean main scores 14/21 on this box.** rf-37 therefore could not have produced 18/21 here
no matter how correct it is — five of the seven clean-main reds are stale content/copy assertions it was
never scoped to touch. The runner's 17→18 and my 14→15/16 are **the same +1..+2 delta measured against
different box baselines**; the absolute number is a property of the machine, not of the slice.

➡️ **Standing lesson: a pass-count target copied from another box's run is not a merge criterion.
The delta against a same-box control is.** Never gate a slice on an absolute number you did not measure
the baseline for yourself.

### F-1113-2 — `wd02-barks` "debug-driven era milestone" is FLAKY; do not credit or blame rf-37 for it.

Green in change-run 1, red in change-run 2, red on clean main. Its run-2 failure carried both contention
signatures s1112 named — `Tearing down "context" exceeded the test timeout of 30000ms` and
`End of central directory record signature not found` (truncated trace zip) — plus a bark-content
mismatch (expected the GAZETTE first-pressing line, got `"EXTRA! The river keeps its old course."`).
Non-blocking; recorded so the next fire does not read a green here as rf-37's doing.

### F-1113-3 — `town-t1-square` is red on CLEAN MAIN. The "own evidence" shorthand is now disproven, not just doubted.

s1109/s1111 shorthanded "`town-t1-square:65` going green is the merge's own evidence"; s1112 corrected
that to "the `:74` test" after finding `:65` is a line inside the `approach()` **helper**, not a test.
**This fire closes it with measurement:** that test (`:65` on main, `:74` with the change) is **red in all
three runs — including the clean-main control.** It is a pre-existing failure of a *content* assertion,
outside rf-37's scope, and it is **not evidence for or against this slice in either direction.**
Its failure mode is `expect(locator).toContainText(expected)` — copy, not arrival.

➡️ Retire the phrase. rf-37's own evidence is the **`en-01` red→green flip and the zero-regression subset property.**

## Merge

Path-scoped `git add` of exactly the 7 `e2e/` files. No `src/`, no debris, no artifact churn.
Test-only change ⇒ **no gazette item and no deploy**, per the filter law.
