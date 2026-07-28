# Review — gazette-art-wiring (THE CLAIM HERALD renders its cuts)

- **Slice:** `gazette-art-wiring` (lane-a), master `tasks/lane-gazette-art-wiring.md` (FIRE-AUTHORED s1184)
- **Branch / tip:** `lane/m3` @ `2b8af246` · base `a8537f7f` · merged to main as `0167f958`
- **Run report:** `tasks/runs/20260728-231215-lane-a-gazette-art-wiring.md`
- **Drained by:** s1185 fire, 2026-07-28
- **Block check:** `node scripts/drain-block-check.mjs 20260728-225945-lane-gazette-art-wiring.md` → ✅ CLEAR (run FIRST, before classification)

## Verdict

**ACCEPT — merge.** Every numbered scope item is satisfied, the blocking byte budget is met with 5.3× headroom, and I re-derived the two numbers that mattered (the naive contribution and the collateral risk of the widened selector) from my own build rather than from the report's table. The one adjacent red is a 17-day-old inventoried known-red at an assertion this slice cannot reach, fingerprinted at the line and at the source that causes it.

## What it does

The Herald items in `news/herald.json` now carry an optional `class` drawn from a **closed seven-value union** (`board | trail | river | schoolhouse | ledger | boss | town-growth`), and `renderItem()` renders the matching engraving from `assets/raw/herald-engraving-*.png` as decorative spot art (`alt=""`, `aria-hidden="true"`, following the `claim-herald__mark` precedent). Four live items are classified; the three unused classes stay unused by design. Because the live feed only exercises four of seven, **the unclassified path is the common path** — it renders byte-identically to the pre-change markup, asserted as an exact `innerHTML` string rather than in prose.

The blocking requirement was F-1184-1: the cuts are 1024², invisible to `asset-diet.mjs`'s exact-dimension plate selector, 2.14–2.35 MB each. The slice extends that selector to the square spot-cut tier and resizes it to 384² (3× the 120 px display size) before the existing WebP-q80 conversion. Raw assets are untouched.

## Evidence (all re-run by the drain on the merged tree)

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` (`tsc && vite build && asset-diet`) | green |
| `e2e/gazette-art-wiring.spec.ts` — dev, desktop + 390 px, no `?debug` | **4/4 passed** |
| `e2e/gazette-art-wiring.spec.ts` — **production preview build**, both projects | **4/4 passed** |
| `e2e/asset-diet.spec.ts` (adjacent — the optimizer is a touched file) | **4/4 passed**, exit 0 |
| `e2e/gz-h1-newsie.spec.ts` (adjacent, unmodified) | 2/4 — **known red, fingerprinted below** |
| console / page errors | zero, both projects, both dev and preview |
| Mutation control (i) swap `board`↔`river` in the feed | **RED on demand, exit 1** — failed at `:112`, received `…herald-engraving-river.png` for Board |
| Mutation control (ii) drop the `board` map entry | **RED on demand, exit 1** — `toBeVisible()` at `:111`, element absent |
| Both mutations restored | `git diff src/news/heraldReader.ts` empty; feed classes re-read and correct |

### The byte budget — measured by the drain, not inherited

| measurement | bytes |
|---|---:|
| Naive eager-glob contribution (7 PNGs in pre-diet `dist/`) | **16,492,796** |
| Final 384 px WebP contribution (7 files) | **281,444** |
| Master's ceiling | 1,500,000 |
| Headroom | **5.3×** |

Reproduced to the byte from an independent `npx vite build` + `node scripts/asset-diet.mjs`, run separately so the pre-diet state could be inspected.

**The collateral question the widened selector raises, answered by measurement:** I enumerated **all 1349 PNGs** in the pre-diet `dist/` and read each one's IHDR. **Exactly seven are 1024×1024, and all seven are herald cuts.** So the widened selector has **zero collateral today** — the runner's claim is true, and now it is true by artefact rather than by assertion. Post-diet: **0** herald `.png` files remain in `dist/`, the built `TownScene-*.js` chunk references the `.webp` names, and **zero dangling `.png` references** survive anywhere in `dist/`.

### Where the player sees this (Mistake #10)

Plain boot, no `?debug`, production preview build — screenshots written by **my** gate run, not the runner's:

- `artifacts/gazette-art-wiring/desktop-chrome-live-cuts.png` — all four cuts render beside their headlines; correct subject per class; warm illustrated register; no letters; no layout shift.
- `artifacts/gazette-art-wiring/mobile-chrome-live-cuts.png` — 390 px block holds; cuts scale down beside wrapping text, no overlap, no clipping.

These screenshots are also the decisive proof that the WebP bytes actually **decode** — see F-1185-2 for why the spec alone would not have proved that.

## Merge classification

- **Base:** `a8537f7f` (`git merge-base main lane/m3`).
- **LANE-TOUCHED (9):** `src/news/herald.ts`, `src/news/heraldReader.ts`, `src/news/heraldReader.css`, `news/herald.json`, `scripts/asset-diet.mjs`, `e2e/gazette-art-wiring.spec.ts` (new), 2 × `artifacts/gazette-art-wiring/*.png` (new), `tasks/runs/…` (new).
- **MAIN-MOVED since base (29):** `STATUS.md`, `tasks/{BACKLOG.md,goals.json,lane-gazette-art-wiring.md}`, `scripts/art-staging-audit.mjs`, `logs/*`, 22 × `artifacts/{066,eight-winds-*}/*`.
- **Overlap: NONE.** The two sets are fully disjoint; `git merge --no-ff` reported "Automatic merge went well" with no conflicts. Verified **before** merging, not discovered during it.
- Firewall honoured: zero `assets/raw/**`, zero `assets/LEDGER.md`, zero `src/game/**`, no edits to `readHeraldItems()` / `INTERNAL_HERALD_PATTERNS`, no existing spec modified, no feed prose/date/hash touched.

## Findings

### 🔺 F-1185-1 — the `gz-h1-newsie` known red has been masking eight assertions for 17 days, including the Herald's **only** in-world-voice guard

**Not blocking this slice** (it cannot reach the failing line) — but it is a bigger hole than "2/4 red" reads.

`e2e/gz-h1-newsie.spec.ts:114` asserts `toHaveText('Pip Quick')`. `835c8108` (**2026-07-11**, `feat: make the town living pass follow its trails`) renamed the newsie to **`Chen Mei`** in `src/town/townsfolk.ts:194` and never updated the spec. Fingerprint reproduced this fire: *Expected `"Pip Quick"` / Received `"Chen Mei"`* at `:114`. Already inventoried in `logs/suite-red-inventory-compact.json` (received `"Juniper"` there — the bark speaker varies by which actor barks; same assertion, same cause). `835c8108` is an ancestor of main and predates this lane's base by 17 days; the slice touches **zero** `src/town/**`. Pre-existing, proven at source.

**The consequence nobody had traced:** the failure at `:114` aborts the test, so **lines 118–125 have not executed since 2026-07-11** — `claim-herald` visible, the heading, `claim-herald-item` count 4, feed-line containment, `assertNoErrors`, and `expectNoInternalHeraldText(page)`. That last one is the **in-world voice guard** (no `123`-style ids, no `SHIPPED`/`repo`/`token`/`backend` leaking into player-facing news), and `:123` is its **only caller in the entire e2e tree** (grepped). The Herald's voice law has therefore been unguarded for 17 days.

**Why it is owner-gated, not a one-word fix:** `Chen Mei` appears in **neither `lore/` nor `specs/gazette-house/README.md`** (grepped both). Per §9b, uncited lore is a proposal — so "fix the spec to match the code" would *ratify* an uncited name. This is exactly the standing `F-SOL-CHAR-004` (`reviews/sol-findings-character-orientation.md`: *"owner chooses existing Pip, Juniper, or a new character"*), which is still open.

**Recommendation:** owner names the newsie in one line; the spec assertion, the `lore/characters.md` entry with its `QUOTE:`, and the `specs/gazette-house/README.md` open question then land in one commit. That single ruling closes an owner-gated canon item **and** restores a 17-day-dead voice guard.

### 🔻 F-1185-2 — the new spec proves the image is *referenced*, not that it *decoded*

`e2e/gazette-art-wiring.spec.ts:111-112` asserts `toBeVisible()` and that `node.src` contains the class name. A broken reference (404, missing derived file) still yields a visible `<img>` with a matching `src`, so the guard would stay green while the player saw a broken image. This matters precisely because the byte-budget route makes the production URL a **`.webp` that does not exist in dev** — the two environments no longer serve the same file.

Closed **empirically** this fire by three independent legs (production-preview run green with zero console errors; `dist` JS references only existing `.webp` files with zero dangling `.png`; and the preview screenshots visibly show the four cuts). But the *guard* has the gap, not the slice.

**Recommendation:** one assertion — `expect(await image.evaluate((n: HTMLImageElement) => n.naturalWidth)).toBeGreaterThan(0)`. Cheap; fire-authorable as a rider on any future Herald rung.

### 🔻 F-1185-3 — the resize is keyed on *dimensions*, so it will silently downscale a future 1024² asset that needs full resolution

`scripts/asset-diet.mjs:83` applies `resize(384, 384)` to **any** 1024×1024 PNG in `dist/`, not to the herald family specifically. Today that is exactly the seven cuts (measured above, 7/7 of 1349), so there is no live defect. But an unrelated future 1024² asset — a portrait plate, a UI sheet — would be cut to 37.5 % of its linear resolution with **no error and no log line**, and the failure would surface as "why does this look soft" weeks later.

The runner saw the shape of this and refused to unilaterally refactor the optimizer (correct — Mistake #14, and the master said so explicitly). Its own report proposes the durable alternatives.

**Recommendation (a):** gate the *resize* branch on the filename family (`/herald-engraving-/`) while leaving the *selection* dimension-keyed — a two-word change that removes the silent-collateral class entirely. **(b)** or, at the next optimizer rung, replace the dimension keys with an explicit include-list plus a "selected but unrecognised tier" warning. (a) is fire-authorable; (b) is a separate rung.

### ⓘ F-1185-4 — the runner stopped correctly, and the stop is the good outcome

Told to stop rather than edit an adjacent suite, Codex did exactly that: it measured the mismatch, named the observed speakers (`Chen Mei`, `Juniper`), read `townsfolk.ts` to locate the cause, declined to touch naming/canon files, and reported. It also chose the route in scope 5, stated *which* route and *why*, and flagged the durability limit of its own fix without acting on it. No finding — recorded because a STOP with measurements is a success, and the ledger should say so.
