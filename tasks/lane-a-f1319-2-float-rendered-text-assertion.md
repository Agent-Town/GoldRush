# Task f1319-2: give the float-fit guard a non-tautological assertion by surfacing `renderedText` (LANE-A, commit prefix "f1319-2:")

**FIRE-AUTHORED (attended review welcome)** — s1322, from F-1319-2's stated cure direction.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `/Users/robin/Claude/Projects/Gold Rush/worktrees/lane-a`.

READ FIRST: `AGENTS.md`; `tasks/BACKLOG.md` (the **F-1319-2** row — it names this cure verbatim and explains why the existing assertion cannot fail); `src/systems/Vfx.ts` lines 183–220 (`drawTextTexture`); `e2e/vfx-float-legibility.spec.ts`.

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

ⓘ At authoring time (s1322) `lane/m3` was refreshed to main: `ahead=0 behind=0 tracked-dirt=0`. If you find it far behind main, say so in your report — that is F-1320-2 and it is worth a line.

## Why (F-1319-2, s1319, measured by mutation on the merged tree — re-verified against current main by s1322)

F-1318-1's cure shipped a guard whose **primary assertion can no longer fail for any reachable input**, and the RED that certified it was taken against the **pre-cure** tree. Verified on current main, file and line:

- `src/systems/Vfx.ts:199` — the shrink loop runs while `context.measureText(text).width > canvas.width - FLOAT_TEXT_PADDING_PX`.
- `src/systems/Vfx.ts:203` — the floor fallback truncates against `budget = canvas.width - FLOAT_TEXT_PADDING_PX`.
- **Those are the same quantity.** So `renderedWidthPx <= budget` is a theorem: exit above the floor and the loop's own exit condition guarantees the fit; exit *at* the floor over budget and the fallback truncates until it fits.
- `e2e/vfx-float-legibility.spec.ts:44` (in `"every upgrade and a reused short float report legible rendered bounds"`) asserts `renderedWidthPx <= canvasWidthPx - 20`, and `FLOAT_TEXT_PADDING_PX = 20` (`src/systems/Vfx.ts:25`) — **the identical quantity.**

s1319 proved this rather than arguing it: on the merged tree it lengthened the stockpile sentence by 30 characters, far past the floor, and the suite was **GREEN 2/2**. Surviving teeth are `toHaveLength(8)` and `fontPx >= 32` — both real, neither the property the slice is named for. **And the ellipsis ships unguarded:** nothing asserts a truncated line ends in `…`, so a hard clip that silently drops the tail would pass today.

F-1319-2's stated cure, quoted: *"surface `renderedText` from `drawTextTexture` (it currently returns only three numbers) and assert that an over-budget floor-bound line ends in `…` while a fitting line is returned unmodified."*

⚠️ **You cannot reach the truncation path with real content.** F-1318-1 measured all 8 upgrade sentences as FITTING, with `Stockpile Yard III` sitting *at* the floor (`fontPx 32`, 730.20 px of a 748 px budget) but **not** truncating. So the new arm must drive a synthetic over-budget string through the real code path — hence scope 2. Do **not** lengthen a real upgrade sentence to make the test fire; that changes player-facing copy to serve a test.

## Scope

1. **Surface `renderedText`.** `drawTextTexture` (`src/systems/Vfx.ts:183`) already computes `renderedText` as a local (`:204`, reassigned by the floor fallback at `:209`) and returns only `{ renderedWidthPx, canvasWidthPx, fontPx }` (`:188`, `:220`). Add `renderedText` to that return type and value. It flows automatically into `lastFloat` through the existing spread at `:95` (`{ text, x, z, y, terrainY, ...rendering }`), so `lastFloatText.text` remains the **input** string and `lastFloatText.renderedText` becomes the **drawn** string — keep both, the pair is the assertion. Widen the `lastFloat` field type at `src/systems/Vfx.ts:33-42` and the diagnostics contract at `src/vite-env.d.ts:575-586`. **No rendering behaviour changes in this item** — it is pure surfacing.

2. **Add one debug-gated test hook to emit an arbitrary float string.** In the `__GR_TEST__` block in `src/game/Game.ts` (alongside `warmVfx` at `:1795`), add e.g. `emitFloatText: (text: string) => { ...; return this.vfx.lastFloatText; }` that routes through the **real** `this.vfx.floatText(...)` path at the local actor's position — do not reimplement `drawTextTexture` or call it directly. Declare it in the `__GR_TEST__` type (`src/vite-env.d.ts`, near `warmVfx` at `:1116`). This is a test surface on an already-`?debug`-gated object; it must add **nothing** to a plain boot.

3. **Assert the property, in `e2e/vfx-float-legibility.spec.ts`.** Keep the existing test unchanged. Add arms that, via the scope-2 hook:
   - a deliberately over-budget string (long enough to bottom out the shrink loop) → `fontPx === 32`, `renderedText !== text`, `renderedText.endsWith('…')`, and `renderedWidthPx <= canvasWidthPx - 20`;
   - a short string that fits → `renderedText === text` **byte-identical**, and `renderedText` does **not** contain `…`.
   The second arm is the control: without it the first proves only that something was truncated, not that fitting lines are left alone.

4. **PROVE THE NEW ARM REDS AT ITS OWN BIRTH COMMIT — this is the finding's own lesson and the item it exists for.** On your finished tree, mutate the floor fallback (`src/systems/Vfx.ts:206-210`) into a hard clip that drops the tail **without** appending `…`, re-run the spec, and record the exact failure output. Then restore the file and confirm it is byte-identical (`git diff -- src/systems/Vfx.ts` empty; report the sha256 both sides). **A guard whose red you have not seen is not a guard.** If the mutation stays GREEN, STOP and report — the assertion is still tautological and this task has failed its purpose.

5. **No-op guard.** If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

## Firewall

Touch ONLY: `src/systems/Vfx.ts`, `src/vite-env.d.ts`, `src/game/Game.ts` (the `__GR_TEST__` block ONLY), `e2e/vfx-float-legibility.spec.ts`.

NO changes to: `FLOAT_TEXT_MIN_FONT_PX` or `FLOAT_TEXT_PADDING_PX` (`src/systems/Vfx.ts:24-25`) — the floor and padding are F-1316-1/F-1318-1 rulings, not knobs · the shrink loop's condition at `:199` · any upgrade or float **copy** string anywhere (`src/game/Balance*`, `BuildSystem`) — changing player-facing wording to make a test fire is forbidden · the existing assertions inside `e2e/vfx-float-legibility.spec.ts:13` (`"every upgrade and a reused short float report legible rendered bounds"`) — the `toHaveLength(8)`, the `renderedWidthPx`/`canvasWidthPx` bound, the `fontPx >= 32` floor and the `fontPx === 64` short-float check (ADD arms; do not weaken or delete) · sim semantics · any other file under `src/`.

⛔ Explicitly forbidden as a "fix": deleting or loosening the `renderedWidthPx <= canvasWidthPx - 20` assertion. It is tautological, not wrong — it stays as a cheap invariant, and the new arms carry the teeth.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green (report the build time).
- `npx playwright test e2e/vfx-float-legibility.spec.ts --project=desktop-chrome --workers=1` and `--project=mobile-chrome --workers=1` — both green, report counts and durations. **Always pass `--workers=1`.**
- Adjacent, unmodified-green both projects, by name: `e2e/f1316-1-float-text-legibility.spec.ts` if present, `e2e/bt-02b-stockpile-tiers.spec.ts`, `e2e/f1314-3-stockpile-tier-voice.spec.ts`. Report any red as a finding with its reason — do not repair out of scope.
- `node --test scripts/gr-sim.test.mjs` green (determinism unaffected — this task changes no sim path).
- Zero console/page errors in both projects.
- Scope 4's mutation output pasted verbatim: the failing assertion text and the restored-file sha256 both sides.
- Screenshots not required (nothing player-visible changes); if you capture any, write them to `artifacts/f1319-2-float-rendered-text/`.

End: **READY-FOR-GATES** + report (a) the exact mutation red from scope 4, (b) whether any real upgrade sentence now truncates (expected: none — say so explicitly), (c) the lane's `behind` count at pre-flight.
