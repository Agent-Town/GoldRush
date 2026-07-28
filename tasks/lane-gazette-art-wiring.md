# Task gazette-art-wiring: THE CLAIM HERALD SHOWS ITS CUTS — class→engraving wiring (LANE SLOT)
FIRE-AUTHORED s1184 (attended review welcome)
You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-a` (branch `lane/m3`, commit prefix `feat:`).
CODEX: model=gpt-5.6-sol effort=high

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m3 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time note (s1184 — **verify it yourself anyway**): `lane/m3` was 2 ahead, and I proved both are safe dupes by content, not by message. `c49f42be` (`lane-gt-03b-goal-side-steer`) drained to main as `fd4ee249`. `65041a9c` (`test: report cp04 mixed naming fault stop`) touches exactly one file, `tasks/runs/20260728-183927-lane-a-cp04-lever-unlock-seed-realign.md`, whose blob is **`2702c0fb…` on BOTH lane and main — byte-identical**. A two-dot `git diff main..lane/m3` shows the lane's only additions are two `.wrangler/tmp/**` build-scratch files that main deliberately deleted. **The lane holds nothing unique; the reset is safe.** ⚠️ This retires the standing `⛔ lane-a must NOT be reset` carried by s1183 — it was true of an earlier state and is not true now.

## Why — the owner asked for it, the art landed, and the gate that held this back is now discharged
**Owner directive, verbatim, 2026-07-28** (`tasks/BACKLOG.md:1650`):
> "for the news paper images would be amazing - not urgent but would add a lot the atmosphere"

The same ladder line names this rung and its four parts, verbatim:
> "**NEXT RUNG (lane, unblocked once the batch drains): `gazette-art-wiring`** — add `class?: HeraldClass` to `HeraldItem`, a class→engraving map in `heraldReader.ts`, classify the live `news/herald.json` items, and an e2e asserting each rendered item shows its cut in a plain boot (Mistake #10)."

**THE GATE IS DISCHARGED.** The art batch drained this fire: LEDGER row 66, review
`reviews/gazette-art-engravings.md`, done-move `shipped-94ca2400-…`, goal leaf
`gazette-art-engravings` = `shipped`. All seven cuts are on main at
`assets/raw/herald-engraving-{board,trail,river,schoolhouse,ledger,boss,town-growth}.png`,
gated at 1024×1024 RGB, 0 magenta, 0 legible glyphs, 7/7 legible at 120 px.

READ FIRST (paths, all on main, all verified present by the authoring fire):
- `reviews/gazette-art-engravings.md` — **especially F-1184-1**, which is a hard requirement of this task (§ scope 5). Read it before you plan.
- `src/news/herald.ts:3-8` — the `HeraldItem` type. It has **exactly four fields** today: `headline`, `lines`, `date`, `hash`. No `class`.
- `src/news/heraldReader.ts:56-64` — `renderItem()`. It renders date, headline and lines. **There is no image slot.**
- `src/news/heraldReader.ts:40` — `<div class="claim-herald__mark" aria-hidden="true">!</div>`, the existing decorative-mark precedent (note the `aria-hidden`).
- `src/news/heraldReader.css:35` + `:128` — `.claim-herald__mark` desktop and the 390 px block. **The mobile block at :128 is why this task has a 390 px checkpoint.**
- `src/town/TownScene.ts:88` — the raw-asset glob precedent: `import.meta.glob<string>('../../assets/raw/plate-contract-*.png', { eager: true, query: '?url', import: 'default' })`.
- `news/herald.json` — the four live items.
- `scripts/asset-diet.mjs:56` — the optimizer's selector. **Read this line; scope 5 exists because of it.**
- `e2e/gz-h1-newsie.spec.ts` — the existing Herald suite. It is your adjacent suite and must stay green.
- `specs/gazette-house/README.md` — the Herald's spine + the 063 in-world voice law.

## The seven classes, and what the live feed actually contains
The authoring fire read `news/herald.json` rather than assuming. It holds **exactly four** items,
and their headlines map cleanly onto four of the seven classes:

| # | live headline | class |
|---|---|---|
| 1 | "Board Becomes a Catalog" | `board` |
| 2 | "River Runs Past the Claim's Edge" | `river` |
| 3 | "Schoolhouse Chart Redrawn" | `schoolhouse` |
| 4 | "Claim Ledger Opens Its Pages" | `ledger` |

➡️ **`trail`, `boss` and `town-growth` have NO live item.** That is expected and is not a defect:
the set is reusable and forward-looking. It does mean **the unclassified path is the common path**,
not an edge case — design for it first (scope 3).

## Scope (numbered, each independently checkable)
1. **Type.** Add a closed union `HeraldClass` and an **optional** `class?: HeraldClass` to
   `HeraldItem` in `src/news/herald.ts`. The union must be exactly the seven names above.
   **It must be a closed union, not `string`** — `news/herald.json` is data, and a free-string class
   that reaches a file path or an `<img src>` is an injection surface. Unknown/malformed values must
   fall through to the no-image path, never to a constructed path.
2. **Map + render.** In `src/news/heraldReader.ts`, add a class→engraving URL map built with the
   `import.meta.glob` precedent from `TownScene.ts:88`, and give `renderItem()` an image slot that
   renders the cut **only when the item has a known class**. The cut is decorative spot art:
   follow the `claim-herald__mark` precedent — `aria-hidden="true"` and empty `alt`, so it adds no
   noise to a screen reader. Keep `escapeHtml` on every text field exactly as today.
3. **The unclassified path is a hard no-regression requirement.** An item with no `class`, or with
   an unrecognised one, must render **byte-identically to today** — same markup, same testids, no
   empty image box, no layout shift. Prove it in the spec (scope 6), not in prose.
4. **Classify the live feed.** Add the `class` field to the four items in `news/herald.json` per
   the table above. **Do not edit any headline, line, date or hash** — classification only.
5. ⚠️ **THE BYTE BUDGET — this is the blocking requirement, and it is why this task is not trivial.**
   `scripts/asset-diet.mjs:56` selects PNGs for optimization by **exact dimensions**:
   ```js
   if ((width === 1671 || width === 1672) && height === 941) platePngs.push(file);
   ```
   That selector is what cuts the plate tier by **87 %** on every build. **The herald cuts are
   1024×1024 and are therefore invisible to it.** They are **2.14–2.35 MB each**; an eager
   `?url` glob of all seven ships **~15.4 MB unoptimized** to the player, in a browser game.
   - **Measure first**: record the bytes the seven cuts add to `dist/` with the naive wiring.
   - **Then bring it under budget**: the seven cuts together must add **≤ 1.5 MB** to `dist/`.
   - **Report the before and after numbers.** A green build that ships 15 MB is a FAILED gate here.
   - You may extend `asset-diet.mjs`'s selector to cover the square spot-cut tier, or introduce a
     processed/derived variant — **your call, but state which you chose and why.** If you extend the
     selector, note in your report that a dimension-keyed selector will miss the *next* new tier too;
     if you see a more durable shape (explicit include-list, size threshold), **report it, do not
     unilaterally refactor the optimizer** — that is a separate rung.
6. **Player-visible proof, plain boot (Mistake #10).** New spec `e2e/gazette-art-wiring.spec.ts`,
   both projects (desktop + 390 px), **no `?debug`**: open THE CLAIM HERALD the way a player does,
   and assert (a) each of the four live items displays its correct cut — assert the resolved image
   URL contains that item's class name, not merely that *an* image exists; (b) an item without a
   class renders with no image and with today's markup intact (scope 3); (c) zero console errors and
   zero page errors.
7. **Mutation controls** — both must go RED on demand, and both must be reported with their exit
   codes: (i) swap two classes in `news/herald.json` and show the per-item assertion fails;
   (ii) remove the class→URL map entry for `board` and show the plain-boot assertion fails.
   Restore both afterwards. *A guard that cannot fail is not a guard.*
8. Write your run file under `tasks/runs/`.

## FIREWALL
**TOUCH-ONLY:**
- `src/news/herald.ts` (the type + the union)
- `src/news/heraldReader.ts` (the map + the image slot)
- `src/news/heraldReader.css` (only if the cut needs layout; **include the 390 px block at `:128`**)
- `news/herald.json` (the `class` field on the four live items — **nothing else**)
- `scripts/asset-diet.mjs` **only if** you chose the selector route in scope 5
- `e2e/gazette-art-wiring.spec.ts` (NEW)
- your run file under `tasks/runs/`

**NO — do not touch, and do not "improve while you're in there":**
- **Zero `assets/raw/**`.** The seven cuts and `assets/raw/originals/**` are shipped, gated art.
  Do not regenerate, resize, crop, move or re-optimize them **in place**. If scope 5 needs a derived
  file, it is a NEW file at a NEW path, and the originals stay byte-identical.
- **Zero `assets/LEDGER.md`.** Row 66 is written and drained; this is not an art batch.
- Do not touch `readHeraldItems()`'s filtering or `INTERNAL_HERALD_PATTERNS` (`herald.ts:10`) — the
  in-world voice guard is not yours to widen.
- Do not add an eighth class, do not invent headlines, do not write items into `news/herald.json`.
- Do not refactor `renderItem`'s existing text rendering or its `data-testid`s — `gz-h1-newsie.spec.ts`
  depends on them, and so does scope 3.
- Zero `src/game/**`, zero unrelated specs.

## Self-check before you report
- `npx tsc --noEmit` clean; `npm run build` green.
- `e2e/gazette-art-wiring.spec.ts` — both projects green, no `?debug`.
- `e2e/gz-h1-newsie.spec.ts` (adjacent) — both projects, **unmodified-green**; if it goes red, STOP
  and report, do not edit its assertions.
- **The byte budget: state the measured before/after `dist/` contribution of the seven cuts, and
  confirm ≤ 1.5 MB.** This number is the gate, not the build's exit code.
- Both mutation controls RED on demand, with exit codes, then restored.
- Zero console/page errors, desktop AND 390 px; screenshots to `artifacts/gazette-art-wiring/`.
- An unclassified item still renders exactly as today.

## Sequencing note
The three unused classes (`trail`, `boss`, `town-growth`) stay unused by design — do not manufacture
feed items to exercise them. Your spec proves the *mechanism*; the ticker/gazette pipeline supplies
real items over time. If you believe a class is mis-assigned, **report it, do not re-headline**
(Mistake #14 — generator proposes, contract disposes).

END: **READY-FOR-GATES** + the before/after `dist/` byte numbers with the route you chose + the two
mutation control exit codes + adjacent-suite results + anything you refused and why.
