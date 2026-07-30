# Task herald-class-map-engravings: give the ongoing Herald its eight class engravings (LANE SLOT)
FIRE-AUTHORED s1255 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a` (branch `lane/m3`, commit prefix `feat:`).
CODEX: model=gpt-5.6-sol effort=high

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time note (s1255 — **verify it yourself anyway**): `lane/m3` was 1 ahead at `fbde25e5` (`ret-02-retention-floor-ratchet`), drained by s1245 as `07822d90` with `reviews/` present on main — a safe dupe by content. The lane holds nothing unique.

## Why — the art landed, the map is already written, and it currently resolves to nothing

`specs/greenhorn-gazette/README.md:39` §THE ONGOING ILLUSTRATED HERALD (owner 2026-07-29→30, verbatim in that heading: *"Can you continue to illustrate the other newspaper later down the road? I think we should start working on that."*) rules:

> Every Herald item gains an engraving by HEADLINE CLASS (reusable set, not per-item): board/claims · trail/terrain · river/water · schoolhouse/science · ledger/records · boss/threat · town-growth · ceremony. Renderer maps item class → engraving (heraldReader already loads gazette-panel-*.webp — same pipeline). New classes earn new engravings in later batches; unmapped classes render text-only (placeholder-first).

The art half shipped. `tasks/art-herald-class-engravings.md` generated **eight** full-bleed plates, all verified on main this fire by blob hash with canon checked by opening them — see `reviews/art-herald-class-engravings.md` (s1255) and `assets/LEDGER.md:224`, whose row still reads **`PENDING-INTEGRATION`** and whose "current" column still reads **`text-only fallback`**. That art master's FIREWALL named this slice explicitly: *"wiring is the heraldReader class-map (separate small lane slice after this batch)."*

**The finding that defines the work (s1255, measured, not inferred):** the class map is **already written** at `src/news/heraldReader.ts:15-23`, and **every one of its entries currently resolves to `undefined`**, because it globs `assets/processed/herald-engraving-*.webp` and **no file of that name exists** — `ls assets/processed/ | grep gazette` returns only the six `gazette-panel-*.webp`. So the renderer is silently in its placeholder-first text-only fallback for every class. **The missing thing is the derivatives, not the map.**

Two facts you must not discover the hard way:

1. **The raw filenames do NOT match the class names.** The batch is `assets/raw/gazette-class-{board,trail,river,science,ledger,threat,growth,ceremony}.png`; the map wants `herald-engraving-{board,trail,river,schoolhouse,ledger,boss,town-growth}.webp`. So **science→schoolhouse, threat→boss, growth→town-growth**, and three names are identical. Getting this wrong produces a green build and a text-only Herald — exactly the failure that is live right now.
2. **`ceremony` has no `HeraldClass` member.** `src/news/herald.ts`'s `HeraldClass` has **seven** values; the spec's class list has **eight**. There is a real plate for it. See scope 4 — it has a STOP.

## Scope (numbered; each item independently checkable)

1. **Produce the seven derivatives that the existing map already names.** Follow the `gazette-panel-*` precedent set by GG-03c (`reviews/gg-03c-herald-dev-path-weight.md`) exactly — same pipeline, same location `assets/processed/`, same `.webp`. Map the raws by CLASS, per the table above. Do not rename or move anything under `assets/raw/`.
2. **Re-derive the byte ceiling honestly and report both numbers.** `scripts/asset-diet.mjs:15` sets `HERALD_DEV_ART_BUDGET_BYTES = 1_500_000` and the dev-path glob is measured at **1,099,906 B** today (`npm run build` prints it) — i.e. **~400,094 B of headroom for seven new files**. `asset-diet.mjs:124-128` already spot-cuts anything named `herald-engraving-*` to **384×384 webp q80**, and `:12` gives those a separate `HERALD_SPOT_CUT_BUDGET_BYTES = 1_500_000` currently at 317,162 B. Report the measured dev-path total and spot-cut total **before and after**. ⛔ **Do NOT raise either ceiling to make room.** If the seven do not fit, that is a finding to REPORT, not a constant to edit (this is F-1253-2's lesson: a cap widened to silence a red stops being a cap). Getting them smaller is legitimate; moving the line is not.
3. **Prove the image actually DECODES, not merely that it is referenced.** `reviews/gazette-art-wiring.md`'s F-1185-2 is binding precedent: `toBeVisible()` plus a matching `src` stays green against a 404. Your new assertions must check `naturalWidth > 0` (or equivalent decode evidence) for at least one wired class, in **both** desktop and 390px projects, on a **plain boot with no `?debug`**.
4. **`ceremony` — MEASURE FIRST, and STOP if it is a design question.** The spec names ceremony as a class; the type does not have it. If adding it is purely mechanical (one `HeraldClass` union member + one map entry + one derivative) **and** no Herald item's classifier needs new logic to ever emit it, do it. **If wiring ceremony requires deciding WHICH Herald items are ceremonies — that is a design fork: STOP, leave ceremony unwired (the spec's own "unmapped classes render text-only" covers it), and report what the decision would be.** Never invent a classification rule.
5. **Update `assets/LEDGER.md:224`** in the same commit: flip `PENDING-INTEGRATION` and the `text-only fallback` current-state column to what actually ships, listing which classes are wired and which (if any) remain text-only.

## Firewall

**TOUCH-ONLY:** `assets/processed/herald-engraving-*.webp` (new) · `src/news/heraldReader.ts` (map entries only, if a name or the ceremony entry needs it) · `src/news/herald.ts` (ONLY for scope 4's union member, ONLY if scope 4 proceeds) · `e2e/gazette-art-wiring.spec.ts` (or a new sibling spec) · `assets/LEDGER.md` row 224 · `scripts/asset-diet.mjs` ONLY if a new file must be added to an explicit list (never to change a budget constant).

**NO:** do not touch the eight `assets/raw/gazette-class-*.png` masters · do not change either byte ceiling · do not touch the first-issue `FIRST_ISSUE_PANELS` content or the `gazette-panel-*` set (that is GG-03's shipped work) · do not touch `TownWelcome`/profile/welcome code (GG-04 just landed there, `c5a00849`) · do not edit `logs/suite-red-inventory.md` · no new dependencies.

## Self-check (name the exact commands and both projects)

- `npx tsc --noEmit` clean · `npm run build` green, and **quote the `[asset-diet] Herald dev-path art …` line before and after**.
- `npx playwright test e2e/gazette-art-wiring.spec.ts e2e/gazette-first-issue.spec.ts e2e/gz-h1-newsie.spec.ts --workers=1` green **both projects** (`--workers=1` is the drain-prescribed config; a red at default workers is not evidence — F-1212-2).
- Zero console/page errors asserted **inside** the spec, plain boot, no `?debug`.
- Screenshots desktop **and 390px** of a Herald item showing a real engraving, to `artifacts/herald-class-map/`.
- State plainly which of the eight classes are wired and which render text-only, and why.

## READY-FOR-GATES + report

Report: the raw→class name mapping as shipped · the dev-path and spot-cut byte totals before/after with headroom remaining · the decode-proof assertion you added and the file:line it lives at · your scope-4 ruling on `ceremony` (wired, or STOPPED with the design question stated) · anything you had to leave for the owner.

> 🔺 **Rider for the drain, not for you (F-1255-4):** the brass agent in `gazette-class-growth.png` is drawn as a rotund, moustachioed, bow-tied brass figure. Canon-safe, but it is a character-design choice made inside a generate-only art batch, and this slice is what first puts it beside player-facing copy about the Prospector (ADR-003). The drain should flag it for an owner eyeball — same shape as F-1205-7. **Do not redraw or edit any art to address this.**
