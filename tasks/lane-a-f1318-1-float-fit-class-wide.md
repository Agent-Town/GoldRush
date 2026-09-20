# lane-a — F-1318-1: the float fit must be guarded for EVERY reachable sentence, not one hard-coded string

**FIRE-AUTHORED (attended review welcome)** — s1318, 2026-08-01.
**Role:** Codex runner, lane-a. **Workdir:** `worktrees/lane-a` (branch `lane/m3`).

---

## READ FIRST (paths, in this order)

1. `reviews/f1316-1-float-text-legibility.md` — the drain that shipped the fit loop and filed this finding.
2. `src/systems/Vfx.ts` — `drawTextTexture`, the fit loop, and the five `FLOAT_TEXT_*` constants.
3. `e2e/vfx-float-legibility.spec.ts` — the existing guard. **It is the thing this task widens.**
4. `src/systems/BuildSystem.ts:1996-2003` — `upgradeFloatText`, the producer of every sentence at issue.
5. `tasks/BACKLOG.md` — the F-1318-1 row **including its CORRECTED paragraph** (the first measurement used too narrow a denominator; the corrected one is the brief).

---

## WHY (evidence, quoted and dated)

s1318 shipped the F-1316-1 cure at `efa3b252`: `drawTextTexture` measures the text, sizes the canvas
to a multiple of 192 up to a 4× cap (768), then shrinks the font one pixel at a time until it fits
`canvas.width - 20`, **stopping at a 32 px floor whether or not it fits**. Below that floor the text
is still drawn centred, so overflow is discarded from *both* ends — the player receives a *different
message*, which is precisely the F-1316-1 defect returning.

**Measured by the drain (s1318, `logs/session-scratch/s1318-real-copy-probe.mjs`), all 8 reachable
sentences — 4 buildables × tiers 2–3, tier 3 being live since bt-02b:**

| sentence | chars | fontPx | rendered | budget |
| --- | ---: | ---: | ---: | ---: |
| `Stockpile Yard III - the yard holds more gold` | 45 | **32 — the floor itself** | 730.20 | 748 |
| `Stockpile Yard II - the yard holds more gold` | 44 | 33 | 738.31 | 748 |
| `Sluice III - the works run richer` | 33 | 46 | **747.12** | 748 |
| `Palisade III - timber holds longer` | 34 | 43 | 731.06 | 748 |
| `Turret III - brass cadence quickens` | 35 | 41 | 734.46 | 748 |
| (tier-II sluice / palisade / turret) | 32–34 | 47 / 45 / 42 | 742.41 / 745.00 / 733.65 | 748 |

All 8 fit **today** — nothing is broken on screen, and this task must not pretend otherwise. But the
worst case has **exhausted the mechanism**: it is at the floor with no shrink steps left, clearing its
budget by 17.8 px (~1 character), and the runner-up clears by **0.88 px**.

**And nothing would tell us if that changed.** `e2e/vfx-float-legibility.spec.ts` asserts the geometry
of one hard-coded constant (`const LONG_FLOAT = 'Stockpile Yard II - ...'`) — it certifies *today's
copy*, not *the renderer's contract*. Add a word to any sentence, or a tier suffix longer than `III`,
and the defect returns silently on a green board.

---

## SCOPE (numbered; each item testable)

### 1. MEASURE FIRST — and this scope can CANCEL the task

Before editing anything, enumerate every string `upgradeFloatText` can produce for every
`UpgradeableBuildableId` × every reachable tier, and measure each through the **shipped** fit loop.
Report the table (sentence, chars, fontPx, renderedWidthPx, budget, fits?).

- If **any** sentence already overflows: **STOP and report.** That is a live player-facing defect and
  a bigger finding than the one you were sent for — it needs a drain decision, not a test.
- If all fit (expected, per the table above): continue, and state whether your numbers reproduce the
  drain's. **A disagreement is itself the finding** — say so rather than smoothing it over.

### 2. Make the guard class-wide

Replace the single-string assertion in `e2e/vfx-float-legibility.spec.ts` with one that iterates
**every reachable upgrade sentence** and asserts the geometry invariant for each:
`renderedWidthPx <= canvasWidthPx - FLOAT_TEXT_PADDING_PX` **and** `fontPx >= FLOAT_TEXT_MIN_FONT_PX`.

The list must be **derived from the source of truth, not re-typed into the spec** — a hand-copied
duplicate of the sentences is exactly the failure mode this guard exists to prevent (it would keep
passing while the real copy drifts away from it). Prefer driving the real producer through the game
(place → upgrade → read the diagnostics) or exporting the producer for the test; if neither is
practical, say why in the report and pick the smallest coupling that still fails when the real copy
changes.

Keep the existing pool-reuse case (short slot returns to `canvasWidthPx = 192`, `fontPx = 64`) — it
guards the likeliest bug in the renderer and must not be lost in the rewrite.

### 3. Give the floor a fallback so overflow degrades legibly

Today the loop bottoms out and draws a centred sentence wider than its canvas — the player gets the
middle fragment of a sentence, with no signal anything was lost. Add a fallback for the case
`fontPx === FLOAT_TEXT_MIN_FONT_PX && measured > budget`: **ellipsis is the preferred cure** (truncate
to fit and append `…`), because a visibly-shortened line reads as shortened, whereas a centred
overflow reads as a *different message*. A two-line wrap is acceptable if you can do it without
changing the sprite's aspect coupling — but do **not** attempt it if it forces a canvas-height change
(that would move `FLOAT_TEXT_HEIGHT`, the sprite scale and the pool together — out of scope here).

### 4. Prove the guard REDs — this is the deliverable, not the green

Every sentence fits today, so **a class-wide test written wrongly is green at birth**, exactly as the
f1297-2 guard was. Therefore:

- Manufacture the defect: temporarily lengthen one upgrade sentence past the floor (e.g. add words to
  the stockpile line in `upgradeFloatText`) **or** temporarily raise `FLOAT_TEXT_MIN_FONT_PX`.
- Observe **RED**, and paste the failure text.
- Revert **byte-exact** and show `git diff -- src/` is empty.
- Observe **GREEN**, and paste it.
- Then do the same for scope 3: with the fallback in place, the over-long sentence must render an
  **ellipsis** rather than a mid-sentence fragment — paste the observed `renderedWidthPx`/`fontPx` and
  a screenshot of that state.

**A report without both manufactured REDs is a pre-declared REJECT.**

### 5. Report the cap question you are NOT being asked to answer

State, with your numbers, how much copy headroom the 4× cap leaves after your fallback lands. Do not
change the cap: enlarging the sign is a look-and-feel call that belongs to the owner (F-1318-2, on the
desk). Report only.

---

## FIREWALL

**TOUCH-ONLY:** `e2e/vfx-float-legibility.spec.ts` · `src/systems/Vfx.ts` (the fit loop and its
constants only) · `artifacts/f1318-1-float-fit-class-wide/**` (your report + screenshots).

**NO:**
- ⛔ **Do not change any copy.** Shortening the sentences is one of three cures the owner is holding
  (F-1316-1 / F-1318-2) and is not the runner's call. Temporary lengthening for scope 4 must be
  reverted byte-exact.
- ⛔ `src/systems/BuildSystem.ts` — read `upgradeFloatText`, do not edit it (except the temporary,
  reverted scope-4 mutation, which must leave `git diff -- src/` empty).
- ⛔ `FLOAT_TEXT_HEIGHT`, the sprite pool's `1.6 × 0.8` aspect coupling, and `FLOAT_TEXT_MAX_WIDTH`
  (the 4× cap) — report on the cap, do not move it.
- ⛔ `e2e/tape-01-run-tape.spec.ts` and `e2e/tl-01-run-telemetry.spec.ts` — the latter's *"plain
  no-debug secure return"* case is a **deterministic known red on both projects**; do not repair it,
  do not bury new assertions in it.
- ⛔ Do not assert on `__THREE_GAME_DIAGNOSTICS__.vfx.lastFloatText.**text**` as a *certifying*
  assertion. Using it to synchronise (`waitForFunction`) is fine and is what the current spec does;
  asserting the string is what made this defect invisible for months.

---

## SELF-CHECK (name the exact commands and paste real numbers)

- `npx tsc --noEmit` → clean.
- `npm run build` → green.
- `npx playwright test e2e/vfx-float-legibility.spec.ts --workers=1` → both projects.
- Adjacent, **derived by grep, not inherited**: run `grep -rln "lastFloatText" e2e src` yourself and
  run every spec it names. At the time of writing that is `vfx-visualy.spec.ts`,
  `lane-crossing-armed.spec.ts`, `bt-01-tiers.spec.ts`. **Expect exactly 4 known reds** —
  `bt-01-tiers.spec.ts:205` and `:430`, in both projects — fingerprinted pre-existing by the s1318
  drain (`reviews/f1316-1-float-text-legibility.md`). Do not fix them; confirm they are the same two.
- `npm run test:node-guards` → derive the count yourself at **both** ends. The s1318 drain measured
  **204** on the merged tree with the complete 37-file list. **If you measure 203, check you ran the
  whole list before reporting a delta** — 203 is the known signature of one omitted file.
- Zero console/page errors, desktop **and** 390 px mobile.
- Screenshots → `artifacts/f1318-1-float-fit-class-wide/{desktop,mobile}-chrome.png`, plus one of the
  ellipsis fallback state from scope 4.
- **Write `artifacts/f1318-1-float-fit-class-wide/report.md` as a FILE** — not only as your closing
  message. (F-1318-3: the previous slice's proof existed only in its run log and a drainer nearly
  rejected work that had fully satisfied its bar.)

**READY-FOR-GATES** — report: the scope-1 table for all 8 sentences; whether your numbers reproduce
the drain's; both manufactured REDs with their failure text and byte-exact reverts; the fallback's
rendered numbers and screenshot; the derived adjacent list and its results; node-guards at both ends
with the list you actually ran; and your scope-5 cap headroom number.
