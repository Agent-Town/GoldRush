# f1316-1 — float-text legibility

- **Slice:** `f1316-1-float-text-legibility` (F-1316-1, raised by s1316)
- **Branch / tip:** `lane/m3` @ `da0c32d2` (single ahead-commit)
- **Merge:** `efa3b25215220305154f92feadf6d6a3d50859e4` (`--no-ff`, merge-base `1530557b`)
- **Drained by:** s1318
- **Verdict:** ✅ **ACCEPT — merged.** The pre-declared REJECT condition was NOT triggered; two independent risks I raised against it were refuted by measurement, and one real forward-looking finding (F-1318-1) is filed non-blocking.

## What it does

Every buildable upgrade float used to be drawn onto a hard-coded 192×96 canvas at a hard-coded
`700 64px Georgia, serif`, centred, with no `measureText`, no fit and no wrap. Centring discards
overflow from *both* ends, so `Stockpile Yard II - the yard holds more gold` reached the player as
the six glyphs `the ya` — a different message, not a truncated one.

`drawTextTexture` now measures the text at base font, sizes the canvas to a whole multiple of 192 up
to a 4× cap (768 px), then shrinks the font one pixel at a time until the string fits `width − 20`,
with a 32 px floor. The sprite's scale follows the canvas aspect on every call, so the world sign
grows with the sentence instead of squeezing it. Because a pooled slot's canvas can change width,
the `CanvasTexture` is replaced and disposed on a dimension change rather than resized in place
(three.js immutable storage). Three new diagnostics — `renderedWidthPx`, `canvasWidthPx`, `fontPx` —
carry *measured raster geometry*, not the intended string.

No copy changed. `Game.ts`, `BuildSystem.ts` and existing specs were not edited.

## The bar this slice had to clear

s1316 pre-declared: **"a cure whose acceptance test still asserts `lastFloatText.text` is an
automatic REJECT"** — the whole point of F-1316-1 being that every existing assertion reads the
string the game *intended*, recorded before rasterisation, and therefore certifies a message the
player provably does not receive.

**Not triggered.** `e2e/vfx-float-legibility.spec.ts` uses `.text` **only inside a
`waitForFunction` predicate**, to identify *which* float is under test. Every certifying assertion
is on measured geometry: `renderedWidthPx <= canvasWidthPx - 20`, `fontPx >= 32`, and for the
pool-reuse case `canvasWidthPx === 192` / `fontPx === 64`. Synchronising on the intent while
asserting on the rendering is the distinction the bar was drawn around, and the slice is on the
right side of it. Verified at source that `renderedWidthPx` is a real `context.measureText(text)`
taken *after* the final font is set on the same context used to draw (`Vfx.ts`, `drawTextTexture`) —
i.e. not a second intent value wearing a measurement's name.

## Evidence (all re-measured by me on the merged tree)

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | clean |
| `npm run build` | green (chunk-size advisory only) |
| `e2e/vfx-float-legibility.spec.ts --workers=1` | **2 passed** (desktop-chrome + mobile-chrome) |
| Adjacent: `vfx-visualy` + `bt-01-tiers` + `m2-01-build-menu` + `lane-crossing-armed` | **38 passed / 4 failed** — all 4 fingerprinted pre-existing, below |
| Plain-boot: `trail-guide-plain-boot` + `profile-first-boot` | **14 passed**, zero console/page errors, desktop + 390 px |
| node-guards (complete 37-file list) | **204 / 204 pass, 0 fail** |
| Screenshots | `reviews/shots-f1316-1/{desktop,mobile}-chrome-merged-tree.png` (my own re-renders from the merged tree, not the runner's file) |

### The 4 reds are pre-existing — fingerprinted, not inherited

`bt-01-tiers.spec.ts:205` *"Enter tears down after clicking upgrade…"* and `:430` *"insufficient gold
leaves tier and gold unchanged"*, both projects. I reverted **only** the slice's two source files to
`HEAD` (`Vfx.ts`, `vite-env.d.ts`), re-ran both cases, and **both still fail on main without the
slice**. Restored afterwards and proved byte-identity by hash: `ffbf67d65180f463` (`Vfx.ts`),
`afff294991d43975` (`vite-env.d.ts`) — same before and after.

### Adjacent suites were derived by grep, not taken from the runner's list

`grep -rl lastFloatText e2e scripts src` returns **`vfx-visualy`, `lane-crossing-armed`,
`bt-01-tiers`** (plus the source files). The runner's report names `vfx-visualy`, `bt-01-tiers` and
`m2-01-build-menu` — it **missed `lane-crossing-armed.spec.ts`**, a genuine consumer of the changed
diagnostics shape. I ran it: green. No harm done, but the omission is why the law says derive.

## Risks I raised against the slice, and how each was settled

**(1) The diff DELETES `context.clearRect(...)` and relies on assigning `canvas.width` to clear.**
The lane only ever exercised width *changes* (short→long→short). The untested case is short→short,
where the computed width is **identical** — and if a same-value assignment is a no-op, a pooled slot
redrawing `+7` over `+12` ghosts both strings. Chromium has historically optimised exactly this.
**Measured, not reasoned** (`logs/session-scratch/s1318-canvas-clear-probe.mjs`): after drawing,
1831 inked pixels; after `canvas.width = 192` at its existing value, **0**. Same-value assignment
clears. Removing `clearRect` is safe. ✅ Refuted.

**(2) The runner reported node-guards `203` and called s1316's `204` a bad estimate.** On the merged
tree the complete list is **204**. I reproduced `203` exactly by accidentally omitting one file
(`whole-suite-collection.test.mjs`, a single static test) from my own first run — so `203` is the
signature of an incomplete list, and s1316's independently derived `204` was right. The guard file
set is byte-identical between the lane's merge-base and main (checked both `package.json` script
lists: 37 files, none added, none removed), so no guard was gained or lost by this slice. The
runner's *delta-0* conclusion survives; its absolute baseline did not. ✅ Settled, non-blocking.

## Player-visible result — I opened the artefact rather than believe the report

Both screenshots show the **complete sentence**: `Stockpile Yard II - the yard holds more gold`.
The `the ya` fragment is gone. On **mobile the float is genuinely legible and prominent**; on
**desktop it is complete but small** — roughly 210 px of a 1280 px viewport, at 33 px font on a
768 px canvas. That is the honest state and it bears directly on the owner's open copy steer for
F-1316-1: cure (a) *fit the lettering to the sign* is now shipped and works; whether the desktop
result is large enough is a taste call that only the owner can make, and cure (c) *shorten the
message* remains available and untouched.

## Findings

### F-1318-1 — the 32 px floor leaves exactly **two characters** of copy headroom before F-1316-1 silently returns (non-blocking)

The fit loop stops at `FLOAT_TEXT_MIN_FONT_PX = 32` **whether or not the text fits**. Below the
floor the text is still drawn centred, so overflow is again discarded from both ends — the identical
failure mode F-1316-1 was raised for. Today's longest sentence renders at **33 px, one pixel above
the floor**.

Measured (`logs/session-scratch/s1318-floor-headroom-probe.mjs`, replicating the shipped loop
exactly): the live 44-character sentence fits at 33 px (738.31 px in a 768 px canvas); at **46
characters** the loop bottoms out at 32 px and renders **753.56 px into a 748 px budget — overflow**.

Two characters. The next upgrade sentence anyone writes can silently re-open the defect, and
**no test would catch it**: the new spec asserts the geometry of *one hard-coded string*
(`LONG_FLOAT`), so it certifies today's copy rather than the renderer's contract.

*Recommended cure (engineering, inside the ratified slice's intent — no copy or design call):*
(a) make the assertion class-wide — iterate every `upgradeFloatText` string in `buildables.ts` and
assert the geometry invariant for each, so adding copy that cannot render fails the gate; and/or
(b) give the loop a fallback below the floor (ellipsis or two-line wrap) so overflow degrades
legibly instead of becoming a different message. Not blocking: every sentence in the game today
renders in full, and the slice is strictly better than main.

### F-1318-2 — the 4× cap is adequate but has no headroom, and the runner said so (non-blocking, owner-facing)

The runner's own cap assessment reports all four current sentences hitting the 4× cap and shrinking
(Palisade 45 px, Turret 42 px, Sluice 47 px, Stockpile Yard 33 px). This is the same squeeze as
F-1318-1 seen from the other end. Raising the cap trades against sign size in the world, which is a
look-and-feel call — owner territory, folded into the existing F-1316-1 desk item rather than raised
as a new ask.

## Merge classification

Merge-base `1530557b`. All six paths **LANE-TOUCHED / LANE-ONLY**; `git log 1530557b..main` over the
six paths is **empty**, so main moved none of them and there was nothing to graft. Confirmed
independently by `lane-freeze-classify` before the merge (6 paths, all `HELD LANE-ONLY`) and by
`lane-usable lane-a` after it (**ahead=0, USABLE**, i.e. genuinely merged, not falsely ahead).

| File | Class |
| --- | --- |
| `src/systems/Vfx.ts` | LANE-TOUCHED |
| `src/vite-env.d.ts` | LANE-TOUCHED |
| `e2e/vfx-float-legibility.spec.ts` | LANE-ONLY (new) |
| `artifacts/f1316-1-float-legibility/{report.md,desktop-chrome.png,mobile-chrome.png}` | LANE-ONLY (new) |

`drain-block-check --strict` → **✅ CLEAR**, leaf `f1316-1-float-text-legibility` matched,
`status="queued"` — run as the first command of the drain, before any classification.
