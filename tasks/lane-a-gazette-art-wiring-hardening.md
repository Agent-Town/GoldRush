# Task gazette-art-wiring-hardening: make the Herald's guard and its byte budget survive the NEXT change (LANE SLOT)
FIRE-AUTHORED s1185 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a` (branch `lane/m3`, commit prefix `fix:`).
CODEX: model=gpt-5.6-sol effort=high

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time note (s1185 — **verify it yourself anyway**): `lane/m3`'s tip `2b8af246` was merged to main as `0167f958` this fire, so it is a safe dupe by content. The lane holds nothing unique.

## Why — three findings from this slice's own drain, all measured, none inherited

This task exists because `reviews/gazette-art-wiring.md` (s1185, drain of `0167f958`) recorded three defects **in the guards**, not in the shipped behaviour. The feature is correct and shipped; what is fragile is our ability to notice when it stops being correct.

**F-1185-2 — the spec proves the image is *referenced*, not that it *decoded*.**
`e2e/gazette-art-wiring.spec.ts:111-112` asserts `toBeVisible()` and that `node.src` contains the class name. A 404 or a missing derived file still yields a **visible** `<img>` with a **matching** `src`, so the guard stays green while the player sees a broken image. This is not theoretical here: the byte-budget route means **the production URL is a `.webp` that does not exist in dev**, so the two environments no longer serve the same file, and only one of them is covered by the assertion's real meaning.

**F-1185-3 — the resize is keyed on dimensions, so it will silently downscale a future 1024² asset.**
`scripts/asset-diet.mjs:85` reads:
```js
await (width === 1024 && height === 1024 ? image.resize(384, 384) : image).webp({ quality: 80, effort: 6 }).toFile(temporary);
```
That applies `resize(384, 384)` to **any** 1024×1024 PNG in `dist/`, not to the herald family. The drain measured **all 1349 `dist/` PNGs**: exactly 7 are 1024², all 7 are herald cuts — so there is **no live defect today**. But an unrelated future 1024² asset (a portrait plate, a UI sheet) would be cut to 37.5 % of its linear resolution with **no error and no log line**, surfacing weeks later as "why does this look soft".

**The budget itself has no guard.** F-1184-1's `≤1.5 MB` ceiling was proved **once**, by a drain, by hand (naive **16,492,796 B → 281,444 B**). Nothing preserves it. One added cut, one changed quality setting, or one removed resize silently reopens the 16 MB hole that this ladder existed to close.

READ FIRST (paths, all on main, all verified present by the authoring fire):
- `reviews/gazette-art-wiring.md` — **the three findings above with their measurements**. Read it before you plan.
- `scripts/asset-diet.mjs:53-58` — the selector (`platePngs`), now `(1671|1672)×941` **or** `1024×1024`.
- `scripts/asset-diet.mjs:79-89` — the replacement loop that converts and (for 1024²) resizes.
- `scripts/asset-diet.mjs` final `console.info` — the `[asset-diet] … GLBs … ; … plate-class PNGs …` summary line, the one place this script reports numbers.
- `e2e/gazette-art-wiring.spec.ts:103-119` — the live-cut test whose assertions you are extending.
- `src/news/heraldReader.ts` — the `HERALD_ENGRAVINGS` map (do **not** change its shape).

## Scope (numbered, each independently checkable)

1. **Assert the cut actually decoded.** In `e2e/gazette-art-wiring.spec.ts`, inside the existing per-item loop of the live-cut test, add an assertion that the image has **decoded bytes** — `naturalWidth > 0` (and `naturalHeight > 0`). **Extend the existing test; do not clone it into a new file.** Keep every current assertion exactly as it is: this must be strictly additive coverage.

2. **Narrow the *resize*, keep the *selection* broad, and make the unknown tier LOUD.** In `scripts/asset-diet.mjs`:
   - Selection stays as it is — every 1024² PNG should still get the WebP conversion, which is a pure win and must not be lost.
   - The **`resize(384, 384)` branch must apply only to the herald spot-cut family**, matched on the file's basename (the built name always contains `herald-engraving-`; verify that on a real build before relying on it).
   - Any PNG selected at 1024² whose basename is **not** in that family must be converted **without** resizing **and** must emit a clearly-worded warning naming the file, e.g. `[asset-diet] WARNING: unrecognised 1024-square tier, converted but NOT resized: <basename>`. **A new tier must be visible, not silent** — that is the whole finding.

3. **Give the byte budget a permanent gate.** `asset-diet.mjs` must measure the total `dist/` bytes of the herald spot-cut family after conversion, **print it on the summary line**, and **exit non-zero** if it exceeds **1,500,000 B**. Name the ceiling as a single named constant with a one-line comment citing `F-1184-1` and this task. Today's value is **281,444 B**, i.e. 5.3× under — so a correct build must stay green and the gate must be provably able to fail (scope 4).
   - ⚠️ The script currently runs as the last step of `npm run build`. A non-zero exit therefore **fails the build**, which is the intent — but say so plainly in your report, and confirm `npm run build` is still green on unmodified content.

4. **Mutation controls — all three must go RED on demand, each reported with its exit code, then restored.** Mutate the **SUBJECT**, never the guard's own script:
   1. **F-1185-2's control must prove the NEW assertion adds coverage the old one lacked.** Point one `HERALD_ENGRAVINGS` entry at a path that resolves to a URL but not to real bytes (e.g. a nonexistent file under the same directory, so the `src` still *contains* the class name). Show that the **old** `src`-contains assertion would still pass while the **new** `naturalWidth` assertion **fails**. If you cannot construct a case where the old assertion passes and the new one fails, **the new assertion is not buying coverage — STOP and report that**, do not paper over it.
   2. Place a synthetic **non-herald** 1024×1024 PNG into `dist/` before the diet runs, and show it is (a) converted to WebP, (b) **NOT** resized — measure its output dimensions — and (c) named in the warning from scope 2.
   3. Temporarily lower the budget constant below today's measured value and show `asset-diet.mjs` exits **non-zero** with a message naming the measured bytes and the ceiling.
5. Write your run file under `tasks/runs/`.

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## FIREWALL
**TOUCH-ONLY:**
- `scripts/asset-diet.mjs` (scope 2 + 3)
- `e2e/gazette-art-wiring.spec.ts` (scope 1 — **additive only**)
- your run file under `tasks/runs/`

**NO — do not touch, and do not "improve while you're in there":**
- **Zero `assets/raw/**` and zero `assets/processed*`.** The seven cuts are shipped, gated art (LEDGER row 66).
- **Zero `src/**`.** `HERALD_ENGRAVINGS`, `HeraldClass`, `renderItem` and the CSS all shipped green this fire and are not yours to adjust. If scope 4.1 needs a temporary map edit, it is a **mutation control** — restore it and prove the restore.
- **Zero `news/herald.json`.** No classifying, no new items, no headline edits.
- Do **not** touch `e2e/gz-h1-newsie.spec.ts`. Its 2/4 red is the standing owner-gated **F-1185-1 / F-SOL-CHAR-004** newsie-naming question (`Pip Quick` vs the shipped `Chen Mei`). **Fixing that assertion would ratify uncited canon** — `Chen Mei` appears in neither `lore/` nor `specs/gazette-house/README.md`. Leave it red; report it unchanged.
- Do **not** refactor the optimizer's selector into an include-list or a size policy. That durable-shape question is a **separate rung** (the previous master already refused it, correctly). Narrow the resize, warn on the unknown tier, and stop there.
- Zero other e2e specs, zero `src/game/**`.

## Self-check before you report
- `npx tsc --noEmit` clean; `npm run build` green **including the new budget gate**.
- `e2e/gazette-art-wiring.spec.ts` — both projects green, no `?debug`, **dev AND production-preview** (`playwright.preview.config.ts`). The preview run is the one that exercises the `.webp`; a dev-only green does not discharge scope 1.
- `e2e/asset-diet.spec.ts` (adjacent — you are editing its subject) — **unmodified-green**, both projects, via `npm run test:asset-diet`. If it goes red, STOP and report; do not edit its assertions.
- `e2e/gz-h1-newsie.spec.ts` — expected **2/4**, unchanged, known red; report it as such and do not touch it.
- **State the measured herald `dist/` byte total printed by the new summary line**, and confirm it is under the constant.
- All three mutation controls RED on demand with exit codes, then restored (prove the restore: `git diff` on the mutated files empty).
- Zero console/page errors, desktop AND 390 px; screenshots to `artifacts/gazette-art-wiring-hardening/`.

## Sequencing note
Nothing here changes what the player sees. If any scope item forces a visible change, you have gone outside the task — **STOP and report** (Mistake #14: generator proposes, contract disposes).

END: **READY-FOR-GATES** + the measured herald byte total + all three mutation-control exit codes + whether scope 4.1 genuinely separated the old and new assertions + adjacent-suite results + anything you refused and why.
