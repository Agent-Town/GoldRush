# lane-a — F-1316-1: every upgrade float renders as a mid-word fragment, and the test that guards it reads the wrong thing

**FIRE-AUTHORED (attended review welcome) — s1316, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-a` (branch `lane/m3`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `reviews/f1314-3-stockpile-tier-voice.md` — the drain that spawned this, finding **F-1316-1**, and the
   screenshot that is the whole argument. **Look at the image before you read any code:**
   `artifacts/f1314-3-stockpile-tier-voice/desktop-chrome-float.png`. The float over the yard reads
   **`the ya`**. The intended string is `Stockpile Yard II - the yard holds more gold`.
2. `src/systems/Vfx.ts` — read these four things together, **by name, not by coordinate** (coordinates were
   measured s1316 and drift whenever anything above them moves; if a coordinate misses, trust the name):
   - `createTextTexture` (~`:137-154`) — allocates the canvas. **`canvas.width = 192`, `canvas.height = 96`,
     both hard-coded, identical for every pool slot.**
   - `drawTextTexture` (~`:156-176`) — `context.font = '700 64px Georgia, serif'`, `textAlign = 'center'`,
     then `strokeText`/`fillText` at `canvas.width / 2`. **No `measureText`. No fit. No wrap.**
   - the pool constructor (~`:29-56`) — every sprite gets `sprite.scale.set(1.6, 0.8, 1)`. Note that
     `1.6 / 0.8 = 2` and `192 / 96 = 2`: **the world sprite's aspect already mirrors the canvas's.** That
     coupling is what makes the cure below safe, and breaking it is what would make the glyphs stretch.
   - `floatText(...)` (~`:59-75`) — the per-call entry point; it writes `this.lastFloat` (~`:72`).
3. `src/vite-env.d.ts:578` — the declared shape of `lastFloatText`:
   `{ text: string; x: number; z: number; y: number; terrainY: number } | null`.
4. `src/game/Game.ts:4438` — `lastFloatText: this.vfx.lastFloatText`. **It passes the object through
   wholesale**, so adding fields in `Vfx` reaches the diagnostics with **no edit to `Game.ts`**. Confirm this
   for yourself; it is why `Game.ts` is on the NO list.
5. `src/systems/BuildSystem.ts` — `upgradeFloatText` (find it by name). Read the strings it returns. **You are
   not changing any of them.** They are here so you know the length range you must render.

PRE-FLIGHT (LANE-SAFETY invariant): `node scripts/lane-usable.mjs lane-a` must print **USABLE**. If it prints
AHEAD-BUT-ABSORBED, HOLDS, DIRTY or BUSY: **STOP** and report the word verbatim. Dirty tracked blobs must be
reachable in git, else STOP.

## WHY (measured s1316 at the f1314-3 drain, verified at source and on screen)

`createTextTexture` allocates a fixed **192 × 96** canvas and `drawTextTexture` draws at a fixed **64 px**
Georgia bold, centred, with no measurement. At 64 px Georgia, ~192 px buys **five or six glyphs**. Because
the draw is centred, the overflow is discarded from **both** ends — which is why a 43-character sentence
renders as a fragment from the middle rather than a truncation from the right. The player does not see a
cut-off message; they see **a different message**.

⚠️ **This is a CLASS defect and it is much older than the slice that exposed it.** Every string
`upgradeFloatText` produces is a sentence — `Turret II - brass cadence quickens`,
`Sluice II - the works run richer`, `Palisade II - timber holds longer` — and all have been unreadable since
the feature shipped. **Short floats (damage numbers, gold pickups) fit and are correct**, which is precisely
why this survived: the common case works.

🪤 **AND HERE IS THE TRAP THIS TASK EXISTS TO CLOSE, WHICH MATTERS MORE THAN THE PIXELS.** The only assertion
path anyone has ever used is `window.__THREE_GAME_DIAGNOSTICS__.vfx.lastFloatText.text` — **the string the
game intended, recorded before rasterisation.** The canvas is never measured. So `e2e/bt-01-tiers.spec.ts`
asserts the full 43-character sentence, passes, and certifies a message the player provably does not receive.
**A green test is currently evidence about the game's intent and evidence about nothing the player sees.**
This is the same shape s1315 found one layer up (an error message naming a set it no longer described, with
`scripts/gr-sim.test.mjs:40` green). ➡️ **Therefore: a cure whose acceptance test still asserts
`lastFloatText.text` HAS NOT BEEN TESTED, however good the screenshot looks.** The gate below is written to
make that impossible.

⛔ **WHAT YOU MAY NOT DO, AND WHY.** Do **not** shorten, reword, or otherwise change any float string. Copy is
an owner decision and one is pending on the desk (F-1316-1 offers shortening as a candidate cure — that
choice is *not yours and not this slice's*). **Your job is to render the sentence the game already writes.**
Shrink-to-fit alone is also wrong as a whole cure: fitting 43 characters into 192 px yields roughly a 9 px
glyph on a sprite scaled to 1.6 world units — legible in a unit test, invisible in play. Read scope 2 before
reaching for the one-line version.

## SCOPE (numbered; each item is testable)

1. **MEASURE FIRST, AND REPORT THE NUMBERS BEFORE YOU CURE ANYTHING.** In your report, record
   `context.measureText(t).width` at `700 64px Georgia, serif` for each of these five strings:
   `+12` · `Palisade II - timber holds longer` · `Turret II - brass cadence quickens` ·
   `Sluice II - the works run richer` · `Stockpile Yard II - the yard holds more gold`.
   State each one's ratio to the current 192 px box. **If any sentence measures at or under 192 px, STOP and
   report** — the premise of this task would be wrong and I would rather know that than have you build around
   it.
2. **Fit the sign to the sentence, not the sentence to the sign.** In `createTextTexture` / `drawTextTexture`,
   choose the canvas width from the measured text at the base font instead of hard-coding 192:
   - measure at `700 64px Georgia, serif`, add room for the 10 px stroke on both sides;
   - round the required width **up to a whole multiple of 192** so the texture stays power-of-two-friendly and
     the aspect stays a clean ratio;
   - **cap that multiple at 4** (768 px). A string that still overflows at the cap — and only then —
     shrink-to-fit by reducing the font size until it fits, with a floor of **32 px**;
   - keep `canvas.height` at 96 and the font at 64 px in every case that does not hit the cap.
   Then, in `floatText`, set the sprite's world width to match the canvas it is about to display:
   `sprite.scale.set(baseHeight * (canvas.width / canvas.height), baseHeight, 1)` with `baseHeight = 0.8`, so
   the existing `1.6 × 0.8` remains exactly what a 192 × 96 canvas produces. ⚠️ **The pool is shared and
   round-robin (`this.cursor`), so a slot reused for a short string must go back to a narrow canvas and a
   narrow sprite — set BOTH on every call, never once at construction.** A slot that keeps a stale wide canvas
   is the most likely bug in this slice; test for it explicitly (scope 4).
3. **Make the rendering measurable from a test.** Extend `lastFloat` (and `src/vite-env.d.ts:578`) with three
   fields describing what was actually drawn — suggested names, use your judgement:
   `renderedWidthPx` (the `measureText` width at the font actually used), `canvasWidthPx`, `fontPx`.
   **Do not remove or rename `text`** — existing specs assert it and they stay valid; they are just no longer
   sufficient. Verify that `src/game/Game.ts` needs no edit for these to appear in diagnostics.
4. **New spec `e2e/vfx-float-legibility.spec.ts`, and its assertions must be about RENDERING.** At minimum,
   both projects (desktop + 390 px mobile):
   - the long stockpile upgrade sentence: assert `renderedWidthPx <= canvasWidthPx - 20` **and**
     `fontPx >= 32`. Asserting `text` alone is an automatic REJECT for this slice.
   - a short float (a damage number or gold pickup): assert `canvasWidthPx === 192` and `fontPx === 64` —
     the common case must not regress into a wider sign.
   - **the pool-reuse case:** emit a long float, then a short one, and assert the short one came back to
     `canvasWidthPx === 192`. This is scope 2's named hazard; prove it rather than reasoning about it.
   - zero console errors, zero page errors, in both projects.
   - a screenshot per project into `artifacts/f1316-1-float-legibility/`, showing the long sentence legible
     over a building. **Look at your own screenshots and say in the report whether you can read the sentence.**
5. **Report, do not act:** if the 4× cap forces shrink-to-fit on any string the game currently produces, say
   which string and at what font size, and say whether you think the cap is the right number. That is a tuning
   question and the answer belongs in the review, not in a second edit.

## FIREWALL

**TOUCH-ONLY:**
- `src/systems/Vfx.ts`
- `src/vite-env.d.ts` (the `lastFloatText` shape only)
- `e2e/vfx-float-legibility.spec.ts` (new)
- `artifacts/f1316-1-float-legibility/**` (your screenshots + report)
- `src/game/Balance.ts` — **additive only**, and only if you need a tunable for the 4× cap or the 32 px floor.
  Changing any existing Balance value is a REJECT.

**NO — do not open, do not edit:**
- `src/game/Game.ts` — verified s1316 to pass `lastFloatText` through wholesale; if you believe it needs an
  edit, **STOP and report why** rather than editing it.
- `src/systems/BuildSystem.ts`, `src/game/buildables.ts` — **no copy changes**, owner-gated (see WHY).
- `e2e/bt-01-tiers.spec.ts` and every other existing spec. Your change must leave them green **as they are**.
  Two of that file's cases are documented pre-existing reds (`Enter tears down after clicking upgrade…` and
  `insufficient gold leaves tier and gold unchanged`, `reviews/bt-02-production-semantics.md`) — expect them,
  do not repair them, do not count them as yours.
- `reviews/**`, `tasks/goals.json`, `tasks/BACKLOG.md` — the drain's job, not yours.
- Anything under `src/town/`, `src/agent/`, `src/mp/`.

## SELF-CHECK (name the exact commands and paste the real numbers)

- `npx tsc --noEmit` — clean.
- `npm run build` — green.
- `npx playwright test e2e/vfx-float-legibility.spec.ts --workers=1` — both projects green.
- `npx playwright test e2e/vfx-visualy.spec.ts e2e/bt-01-tiers.spec.ts e2e/m2-01-build-menu.spec.ts --workers=1`
  — **adjacent suites, derived by grep on `lastFloatText` / `floatText` consumers.** Report the pass/fail
  counts and confirm the only reds are the two named above.
- Full `npm run test:node-guards` — report the count and **derive it**: state the baseline you measured before
  your change and the delta your change adds. s1316 measured **204** on this tree.
- Zero console/page errors in both projects; screenshot paths listed.
- `--workers=1` on every playwright command (fire-shell serialisation law, `scripts/fire.md` §3.1).

READY-FOR-GATES + report: the five scope-1 measurements with their ratios · the canvas width and font each of
the five strings ends up with · the three rendering assertions' actual values · whether you could read your own
screenshots · your answer to scope 5.
