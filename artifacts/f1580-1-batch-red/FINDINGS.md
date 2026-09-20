# F-1580-1 characterised — and its own hypothesis refuted

**Fire:** s1581 (2026-08-09 ~02:00–02:25 local) · **Tree:** `dfe5a2cbd` (main, f1579-1 merged at
`4e39003eb`) · **Instrument:** detached worktree `gate-s1581`, `--workers=1` throughout, gate port 5188.

F-1580-1 asked a successor to re-run the four-spec batch, capture the failure, and decide between
**(a)** a genuine load ceiling and **(b)** a real ordering/state dependency between `m4-06`/`task-025`
and `m1-01`. **Both are refuted.** The subject is a third thing, and it is not a flake.

---

## 1. What was run

The identical batch, three times: `m4-06-embodiment` + `task-025-bandits-dont-swim` +
`m1-01-claim-jumpers-death` + `m2-01-build-menu`, both projects, `--workers=1`, 52 tests.
`test-results/` was copied to this directory **before** any re-run — the capture failure that
F-1580-1 flagged cannot recur here.

| Run | Result | Elapsed | Casualty |
|---|---|---|---|
| s1580 (inherited) | 51 passed / 1 failed | 3.7m | `m1-01-claim-jumpers-death.spec.ts:29` **desktop** |
| s1581 run1 | 51 passed / 1 failed | 4.3m | `m2-01-build-menu.spec.ts:178` **mobile** |
| s1581 run2 | **52 passed** | 3.9m | — |
| s1581 run3 | **52 passed** | 4.2m | — |

**The casualty moved file, line and project, and twice there was none.** An ordering/state dependency
is deterministic and would have reproduced at the same position. **(b) is refuted.**

## 2. Why "load ceiling" is refuted too — the run that red-ded was not a slow run

The load reading is what makes this conclusive. In run1 — the failing run — **every other test ran at
its run2/run3 speed**:

| Test | run1 | run2 | run3 |
|---|---|---|---|
| `m1-01:29` [mobile] | 9.6s | 9.6s | 13.1s |
| `m4-06:205` [mobile] | 10.3s | 10.3s | 10.8s |
| `m2-01:277` [mobile] | 9.3s | 9.3s | 10.0s |
| **`m2-01:178` [mobile]** | **18.4s (FAILED)** | **2.9s** | **3.4s** |

A machine-wide resource ceiling slows the whole batch. This batch did not slow down; **one test
blew up 6.3× while its neighbours were unchanged to the tenth of a second.**

Nor is anything near the 30s test timeout: across 52 tests the **smallest margin is 11.6s**, and the
captured error is not a test timeout at all — it is a **5s `expect.poll` timeout** on a game-state
predicate (`build.ghostValid`), config `expect.timeout: 5_000`.

`m1-01-claim-jumpers-death.spec.ts:29` — the test F-1580-1 names — **passed 3/3 in the identical
batch at the identical position**, desktop 11.6/12.7/9.7s against a 30s limit. Its headline does not
reproduce.

## 3. It fails in ISOLATION, with no batch and no load — and the distribution is bimodal

`m2-01-build-menu.spec.ts:178`, alone, `--repeat-each=10`:

- **mobile-chrome: 2 failed / 8 passed.** Durations: `2.7 2.8 FAIL:18.9 2.7 2.7 2.8 2.8 FAIL:18.7 2.8 2.7`
- **desktop-chrome: 10 passed / 0 failed.** Durations: `2.9 2.7 2.9 2.9 2.8 2.9 2.8 2.9 2.9 2.7`

Passing runs cluster at 2.7–2.8s (σ ≈ 0.05s); failing runs at 18.7–18.9s. **Never anything between.**
A resource ceiling produces a continuum, not two tight clusters 6.8× apart. The failure cost is fixed
and fully accounted for: 5s expired poll + failure-artifact capture (`trace: retain-on-failure`,
`screenshot: only-on-failure`).

➡️ **The batch is irrelevant. This is a ~20% mobile-only intermittent, reproducible in 90 seconds.**

## 4. The mechanism — a late-landing rejected build input (well-supported, root cause NOT yet read)

All **three** independent failures (2 isolated + 1 in-batch) show the same page state: **Gold = 30**.

The test grants 50 and each palisade costs 10, so 30 means **two palisades were purchased**. But the
failure occurs at `placeSelected`'s `ghostValid` poll (`m2-01-build-menu.spec.ts:84`) reached from
line **191** — *before* that call's own `Enter`. And line 188 asserted `count === 1` and line 189
asserted `gold === 40` moments earlier, both of which passed.

So a second palisade was bought **without the test pressing Enter for it**. The only candidate input
is the deliberately-rejected `Enter` at **line 187**, pressed while the hero stood at `(0,12)` with
the ghost knowingly INVALID (overlapping the palisade at `(0,9)`). Sequence that fits every
observation:

1. L187 `Enter` on an invalid ghost — correctly builds nothing *at that moment*.
2. L191 `placeBuildableAt(0,12)` teleports the hero to `(0,14)`, where the ghost at `(0,12)` becomes **valid**.
3. The retained L187 press is applied against the now-valid ghost → palisade built at `(0,12)`, gold 40→30.
4. `placeSelected` then polls `ghostValid` at `(0,12)` — now **overlapping the palisade just built** → false for 5s → red.

### ✓ VERIFIED by reading the code — the mechanism, in six steps

The inference above was then checked against `src/`, and every step is present:

1. `InputController.onKeyDown` (`src/core/InputController.ts:102`) adds the code to **both** `keys` and `tapped`.
2. `onKeyUp` (`:107`) removes it from **`keys` only** — `tapped` retains it.
3. `tapped` is cleared **only at the end of `readIntents()`** (`:246`), which `Game.update()` calls
   **once per frame** (`src/game/Game.ts:2394`).
4. ➡️ So a keypress whose down **and** up both land inside one frame gap is retained and delivered on
   the **next** frame. (This retention is deliberate and correct — it is what stops fast taps being lost.)
5. `BuildSystem.confirm(at, position?)` (`src/systems/BuildSystem.ts:993`) called **without** an explicit
   position calls `updateGhostPosition()` and then re-computes `this.valid = this.computeValid()` — i.e.
   **the intent carries no position and is re-resolved against wherever the ghost is when it executes.**
6. In the keyboard path the ghost is pinned 2 m north of the hero (`:1585-1590`), so **moving the hero
   moves the ghost**.

**The defect in one sentence: a confirm rejected at position A is not discarded but re-evaluated at
position B one frame later, and succeeds there.** In this test: press at hero `(0,12)`/ghost `(0,10)`
— invalid, overlapping the palisade at `(0,9)` — then L191 teleports the hero to `(0,14)` before the
next frame, putting the ghost at `(0,12)` where it **is** valid; the retained press builds there,
spends 10 gold (40→30), and the following `ghostValid` poll at `(0,12)` is false forever because it
now overlaps the structure the press just built.

⚖️ **Player-facing impact — stated narrowly, because the honest reading is narrower than it first looks.**
An earlier draft of this finding claimed a player "presses build somewhere illegal, walks to a legal
spot, and gets a structure placed". **That is wrong and is corrected here: the deferral window is a
single frame (~16 ms), and no player walks far enough in 16 ms to flip validity.** The defect needs a
**discontinuous** hero move inside that one frame — teleport, knockback, respawn, or a scripted snap.
`__GR_TEST__.teleport` is exactly such a discontinuity, which is why the test finds it and ordinary
play may not. It is still a real correctness defect in input handling, and it is still worth fixing;
it is **not** demonstrated to be a live gold-loss bug in normal play, and must not be reported as one.

⓵ **Why mobile-only (~20%) remains a HYPOTHESIS, not a measurement:** the mechanism requires the press
and the teleport to fall in the same frame gap, so it should scale with frame-gap length; mobile-chrome
at 390×844 plausibly has longer gaps than desktop. **Not measured** — no frame-timing probe was run,
and desktop's 0/10 is consistent with a shorter gap but does not prove the cause.

## 5. Disposition

- **F-1580-1 is CHARACTERISED and its stated hypotheses are refuted.** Not a load ceiling, not an
  ordering dependency, not attributable to any recent slice — `m2-01-build-menu.spec.ts` mobile is
  already `KNOWN-RED` in `logs/suite-red-inventory.md` (snapshot 2026-07-28) for a *different* test
  in the same file and project (`:136`, 60.2s, 30s test timeout), so the file has a documented
  mobile problem that this extends.
- **No re-pin, no quarantine, no inventory-and-forget.** F-1441-3 binds and there is no named cause
  yet — and the cause now looks like a real defect rather than instrument noise.
- **Blast radius:** any drain whose adjacent-suite battery includes `m2-01-build-menu` on mobile
  carries a ~20% chance of an unrelated red. At 4 minutes a batch that is a recurring tax on gates,
  and the standing hazard is that fires learn to wave it away (the `cross-engine` excused-label
  failure, F-1460-1).

**Successor deliverable:** fix the defect — not the test. The root cause is named above; what is NOT
settled is the right cure, and it is a genuine design choice: **`tapped` retention must stay** (it is
what prevents fast taps being dropped), so the fix belongs on the *position* side — either the confirm
intent carries the ghost position/validity it was issued against, or a confirm whose ghost was invalid
at issue time is discarded rather than re-resolved. Acceptance: `m2-01-build-menu.spec.ts:178
--project=mobile-chrome --repeat-each=20` green 20/20, desktop still 10/10, with a regression assertion
that a press rejected at one position does not execute at another.

**Reproduction (90s, no batch needed):**
`npx playwright test e2e/m2-01-build-menu.spec.ts:178 --project=mobile-chrome --workers=1 --repeat-each=10`

## 6. Side observation for successors — a single failing mobile test writes a 629 MB trace

`playwright.config.ts` sets `trace: 'retain-on-failure'`, and each of the three failures here produced
a **629 MB `trace.zip`** (1.89 GB for three). That is ~100× a normal trace, and it matters precisely
because F-1580-1's own deliverable told a successor to **copy `test-results/` before re-running** —
follow that instruction on a multi-red battery and a fire can write several GB into `artifacts/`
without noticing. The three traces are **parked, not deleted** (Retention Law 10b) at
`/Users/robin/Claude/Projects/gr-scratch-s1581-traces/`, outside the repo tree so no broad `git add`
can sweep them in (the F-1295-1 hazard). They are regenerable in 90 seconds by the command above;
the screenshots and `error-context.md` page snapshots — the evidence the conclusions above actually
rest on — are committed here at 4.9 MB total.

## Files here

`run1.log` `run2.log` `run3.log` — full batch output incl. start/end load averages ·
`iso-m2-01-178.log` (mobile x10, 2 failed) · `iso-m2-01-178-desktop.log` (desktop x10, clean) ·
`test-results-*/` — captured failure artifacts: screenshots, `error-context.md` page snapshots, traces.
