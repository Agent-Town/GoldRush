// s1318 — retire F-1316-1 (shipped) and file F-1318-1 / F-1318-2, in the same commit as the drain
// bookkeeping. Supersede-never-delete: the original row is retained verbatim per the Retention Law.
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'tasks/BACKLOG.md';
const text = readFileSync(path, 'utf8');
const lines = text.split('\n');

const idx = lines.findIndex((l) => l.startsWith('🔴 **F-1316-1 (s1316,'));
if (idx < 0) throw new Error('F-1316-1 row not found');
const original = lines[idx];

const closure =
  '✅ **SHIPPED s1318 at `b1dc3306`, review `reviews/f1316-1-float-text-legibility.md`. The player who buys a stockpile tier now reads the whole sentence — I confirmed it the way the finding was raised, by opening the screenshot rather than the report.** ' +
  '`drawTextTexture` now measures the text at base font, sizes the canvas to a multiple of 192 up to a 4× cap, shrinks the font to fit `width − 20` with a 32px floor, and keeps `sprite.scale.x` on the canvas aspect; a pooled slot whose width changes gets its `CanvasTexture` replaced and disposed rather than resized in place (three.js immutable storage). ' +
  '✓ **s1316’s pre-declared REJECT bar was NOT triggered, and that was the whole judgement of this drain:** `lastFloatText.text` survives in the new spec **only as a `waitForFunction` predicate** — it identifies *which* float is under test — while every certifying assertion is on measured raster geometry (`renderedWidthPx` / `canvasWidthPx` / `fontPx`), which I verified at source comes from a real `measureText` taken after the final font is set on the same context that draws. Synchronising on intent while asserting on rendering is the right side of the line the bar was drawn around. ' +
  '✓ Gates on the MERGED tree: tsc clean · build green · own spec 2/2 desktop+390 · adjacent **derived by grep, not from the runner’s list** (its list missed `lane-crossing-armed.spec.ts`, a real consumer of the changed diagnostics — I ran it, green) 38 passed / 4 failed, all 4 fingerprinted **pre-existing** by reverting only the slice’s two source files to HEAD and reproducing both `bt-01-tiers` reds on main, then restoring and proving byte-identity by hash · plain-boot 14/14 zero console errors · node-guards **204/204**. ' +
  '🔬 **Two risks I raised against the slice were refuted by measurement rather than argument, and both are worth keeping.** ⑴ The diff **deletes `context.clearRect(...)`** and relies on assigning `canvas.width` to clear; the lane only ever exercised width *changes*, never short→short where the width is identical, and Chromium has historically optimised same-value assignment into a no-op — which would ghost `+7` over `+12` in a pooled slot. Probed: 1831 inked pixels → **0** after a same-value assignment. Safe. ⑵ The runner reported node-guards **203** and called s1316’s 204 a bad estimate; the merged tree is **204**, and I reproduced 203 exactly by omitting one file (`whole-suite-collection.test.mjs`) from my own first run — **203 is the signature of an incomplete list**, the guard set is byte-identical between the lane’s merge-base and main, and s1316’s derived 204 was right. The runner’s *delta-0* conclusion survives; its absolute baseline did not. ' +
  '➡️ **SPAWNED F-1318-1 below — the cure has exactly two characters of headroom before this same defect returns.** *(original line retained per the Retention Law:)* ';

lines[idx] = closure + original;

// File the two new findings immediately after the retired row, newest-first house order.
const f1318_1 =
  '🟠 **F-1318-1 (s1318, MEASURED AT THE DRAIN BY REPLICATING THE SHIPPED FIT LOOP — THE F-1316-1 CURE LEAVES EXACTLY TWO CHARACTERS OF COPY HEADROOM BEFORE THE DEFECT SILENTLY RETURNS).** ' +
  'The fit loop in `drawTextTexture` (`src/systems/Vfx.ts`) shrinks the font one pixel at a time but **stops at `FLOAT_TEXT_MIN_FONT_PX = 32` whether or not the text fits**. Below the floor the string is still drawn centred, so overflow is again discarded from *both* ends — the identical failure mode F-1316-1 was raised for, in which the player receives a different message rather than a truncated one. ' +
  '✓ **Measured, not extrapolated** (`logs/session-scratch/s1318-floor-headroom-probe.mjs`, replicating the shipped loop exactly): today’s longest sentence, `Stockpile Yard II - the yard holds more gold`, is **44 characters and renders at 33px — one pixel above the floor** (738.31px in a 768px canvas). At **46 characters** the loop bottoms out at 32px and renders **753.56px into a 748px budget: overflow.** ' +
  '⚠️ **And no test would catch it.** The new spec asserts the geometry of a single hard-coded string (`const LONG_FLOAT = ...`), so it certifies *today’s copy* rather than the *renderer’s contract* — a narrower denominator than the defect. The next upgrade sentence anyone writes can silently re-open F-1316-1 with a green board. ' +
  '➡️ **Cure (engineering only — inside the ratified slice’s intent, needs no copy or design ruling, fire-authorable):** (a) make the assertion **class-wide** — iterate every `upgradeFloatText` string in `buildables.ts` and assert the geometry invariant for each, so copy that cannot render fails the gate; and/or (b) give the loop a fallback below the floor (ellipsis or a two-line wrap) so overflow degrades **legibly** instead of becoming a different message. ' +
  'ⓘ **Non-blocking, and it did not hold up the merge:** every sentence in the game today renders in full and the slice is strictly better than main. This is a guard against the *next* sentence.';

const f1318_2 =
  '🔵 **F-1318-2 (s1318, the runner’s own cap assessment, confirmed at the drain — the 4× cap is adequate for today’s copy and has no headroom, which is F-1318-1 seen from the other end).** ' +
  'All four current upgrade sentences hit the 4× canvas cap and therefore shrink: Palisade 45px, Turret 42px, Sluice 47px, Stockpile Yard **33px**. Raising the cap would buy headroom but trades against how large the sign looms in the world, which is a look-and-feel call rather than an engineering one. ' +
  '🔺 **Folded into the EXISTING F-1316-1 desk item rather than raised as a new ask** — the owner is already holding a one-line copy steer for this exact float, and this is the same decision seen from the renderer’s side. **Desktop is the case that motivates it:** the sentence is now complete but small (~210px of a 1280px viewport); mobile is genuinely legible and prominent. Cure (a) *fit the lettering to the sign* is shipped and works; whether the desktop result is large enough is taste, and cure (c) *shorten the message* remains available and untouched.';

lines.splice(idx + 1, 0, f1318_1, '', f1318_2, '');

writeFileSync(path, lines.join('\n'));
console.log('F-1316-1 retired with closure prefix; F-1318-1 and F-1318-2 filed at lines', idx + 2, 'and', idx + 4);
