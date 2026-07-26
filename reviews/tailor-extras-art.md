# reviews/tailor-extras-art.md — art-batch-tailor-extras (ART slot) drain

**Slice:** `art-batch-tailor-extras` · **done-move:** `tasks/done/20260726-155609-art-batch-tailor-extras.md`
**Raws:** `worktrees/art/assets/raw/` (already on main via the s1079 retention salvage `0f9270b0`)
**Drained by:** s1082 fire, 2026-07-26 · **Base:** main `405eb647`

## VERDICT: **SPLIT — the heroine's Claim-Day outfit MERGES; the tailor's sign is WITHHELD with a finding.**

Two deliverables came in one batch and they do not share a fate. The Claim-Day hero sheets are proven live by a mutation control and merge. The sign extraction produces a **visibly broken** asset on screen, so it is parked rather than landed — the existing drawn plaque is strictly better than what my extraction renders.

## What it does
The tailor's wagon shipped in `925a0c3b` with two wardrobe racks but no cloth — `HERO_SKINS = ['stock','claim-day']` existed while the claim-day art did not, so `resolveWalkSheet` silently fell back to stock every time. This drain extracts the Claim-Day sheets into `assets/processed/`, which is the *only* step needed: `SpriteAnimator.heroSkinWalkSheet():909-913` resolves the skin **by filename**, rewriting `char-hero-sheet-walk4-{a,b}-f-r*c*.png` → `char-hero-claimday-sheet-walk4-{a,b}-r*c*.png`. **Zero code change.** The player equips "Claim-Day" at the wagon and the heroine is actually wearing it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (unpiped, real exit code) |
| `npm run build` | **green 1.34s** (with sign) → **green 1.08s** (final, sign withheld) |
| `e2e/tailor-wagon.spec.ts` + `e2e/cosmetic-grants.spec.ts` | **12 passed, exit 0**, desktop-chrome + mobile-chrome/390, explicit `N passed` summary line present (F-1081-6 check) |
| Plain-boot probe (no `?debug`), town, desktop + 390px | `consoleErrors: []`, `pageErrors: []` |
| Extraction | a-sheet keyed **82.3%**, b-sheet **83.1%**, **16/16 cells each** — matches the art run's own measured 82.28% / 83.10% |

### Seam law — measured, and my first reading of it was WRONG
Raw cell heights looked alarming: claim-day **354 px** vs the stock `-f` sheets it substitutes for at **177 px** — an apparent 2× size-pop. That was a **denominator error**: the stock `-f` cells are **256×256** and the claim-day cells **512×512**. Corrected by measuring the figure as a *fraction of its cell*:

| sheet | cell | figure | **frac** |
|---|---|---|---|
| `char-hero-sheet-walk4-a-f` (the sheet replaced) | 256² | 176 | **0.688** |
| `char-hero-claimday-sheet-walk4-a` | 512² | 352 | **0.688** |
| `char-hero-midlife-…` (shipped aged precedent) | 512² | 362 | 0.707 |

Identical fraction to three decimals, and the `frames.json` bboxes are byte-identical (`[139,38,294,388]` both). **No size-pop.** Cell size 512 was kept deliberately, matching the shipped `art-batch-hero-ages` precedent and preserving the native 425 px detail rather than discarding half of it.

### Mutation control (this is what earned the merge)
`e2e/tailor-wagon.spec.ts:36` asserts `data-hero-skin-sheet` `toMatch(/^(claim-day|stock)$/)` — it accepts **either** value, because the wagon shipped before its art. **The suite is structurally incapable of detecting this drain**, so its green proves nothing (F-1080-B). Wrote `scripts/probe-hero-skin-sheet.mjs` to ask the question the suite cannot:

| state | `data-hero-skin` | `data-hero-skin-sheet` |
|---|---|---|
| cells present | claim-day | **claim-day** |
| **cells moved aside (control)** | claim-day | **stock** |
| cells restored | claim-day | **claim-day** |

Zero console/page errors in all three. The equipped *choice* survives the art's absence; only the *sheet* falls back — placeholder-first working as designed. The restored tree is the tree that merges (re-probed after restore, not assumed).

## Findings

**F-1082-3 — 🔴 THE TAILOR'S SIGN IS WITHHELD: TWO DEFECTS, BOTH MINE OR THE WIRING'S, NEITHER THE ART'S.** The raw is excellent — a tall burlap banner on a walnut dowel with brass rings, an aged-steel needle, a teal thread through its eye, flat `#ff00ff`. Extracted at `--size 384` and screenshotted in a plain town boot, it renders with:
1. **A magenta halo on all four edges.** Keying caught only **49.2%** of the canvas. The art run itself warned the raw "retains a faint magenta-family falloff at the lower canvas corners"; the extractor's default `--tol 26` flood-fill does not reach it. ➡️ Re-extract with a raised `--tol` (and/or `--pocket-mean`) until the residual is ~0, exactly as the despill note in `scripts/extract-alpha.mjs` describes.
2. **The needle is crushed to illegibility.** `TownScene.createTailorWagonSign():3195-3199` sets `sign.scale.set(2.2, 0.76, 1)` — a **≈2.9:1 wide** sprite — while the art is a **tall portrait** banner. The square texture is letterboxed flat; the faint diagonal "crease" visible in `reviews/shots-tailor-extras/tailor-sign-live-desktop-crop5x.png` **is** the needle. ➡️ The fix is a `src/town/TownScene.ts` geometry change (portrait-ish scale, e.g. ~`0.9 × 1.15`), which is **out of an art drain's remit** — it needs its own task.
**Evidence:** `tailor-sign-live-desktop.png` + `-crop5x.png` (defective) vs `tailor-sign-withheld-plaque-*.png` (the plaque the player keeps meanwhile). The extraction is parked at `artifacts/s1082-withheld-tailor-sign/prop-tailor-sign.png`, **not deleted** (Retention Law) and regenerable from the in-git raw in one command. **Landing it would have been a Mistake #10 in reverse: shipping something the player sees and that looks broken.** The drawn plaque fallback is correct and unchanged.

**F-1082-4 — 🟡 THE CLAIM-DAY SKIN SILENTLY DOWNGRADES THE YOUNG HEROINE FROM 8-DIRECTION TO 4-DIRECTION ANIMATION.** `resolveWalkSheet():871` sets `skinBase = resolvedAge === 'young' && slot?.walk4 ? slot.walk4 : stock`, so equipping any hero skin moves a young heroine off her live **walk8** sheet onto **walk4**. Measured: `char-hero-sheet-walk8` cells are 256² at frac **0.633** while the claim-day walk4 cells are frac **0.688** — so the heroine also gets ~9% taller on screen when she changes clothes. Non-blocking (the wagon slice shipped this deliberately, and it matches the aged-hero precedent's own F-1 note), but it is a real visible difference and the owner should see it before it is called finished. **No corrective queued — this is a design question, not a defect.**

**F-1082-5 — 🟢 (method) A PLAIN `#town` HASH SILENTLY SHOT THE START MENU.** My first sign probe navigated to `/#town`, waited for `__GR_TOWN_DIAGNOSTICS__` inside a `.catch(() => {})`, and produced a confident screenshot **of the main menu**. The swallowed timeout is the same shape as F-1081-6's summary-less battery: *an aborted observation that reads as a clean one.* Fixed by entering through `start-menu-enter-town` as a player does and letting the wait throw. **Standing note: never wrap an evidence-gathering wait in a bare catch.**

## Merge classification
Additive only — **34 new files** in `assets/processed/` (32 cells + 2 `frames.json`), no existing asset overwritten, no `src/` file touched, no contract edited. Nothing was contested; base `405eb647` is main's tip and the ART slot has no branch. Two probe scripts added under `scripts/` as reusable evidence tooling.
