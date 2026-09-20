# sprites-split-land — stage 1 of owner ruling A19, implementer report

**Master**: `tasks/sprites-split-land.md` · **Branch**: `feat/sprites-split-land`, cut from main `9382083d3` · **Source**: `sol/code-review-20260908` (`92f6cc115`), taken by `git checkout … -- <path>` only, never merged, nothing under `artifacts/` taken (F-SPRDR-9: 24.58 GB, nine blobs over GitHub's 100 MB limit).
**Ruling**: owner 2026-09-13, verbatim **"A19 - that is ok"** → option (b) of `reviews/drain-review-sprites-roster.md` §5 F-SPRDR-2.
**Implementer**: Claude Opus 5, native, 2026-09-14, Node 26.4.0 (`/opt/homebrew/bin`). Every number below was measured on this tree by a command named beside it; nothing is inherited from the review.

## Headline

The branch MODIFIES 175 families under `assets/processed` / `assets/processed-full` (1,752 files; it also ADDS 763 PNGs across ~20 new families, which item 4(a) refuses outright). **30 were admitted and landed, 145 held** — and the held table below accounts for all 145. The landed set costs **+20,926,413 B** on disk (**+17,263,104 B** of it shipped, under `assets/processed`; the rest are `assets/processed-full` masters, which nothing in `src/` or `vite.config.ts` reads). What it buys, measured over those families: **90,691 visible violet-key pixels (alpha ≥ 16) → 0**, and **4,489,119 key-coloured pixels under fully transparent pixels → 0** — the second number matters because GPU bilinear filtering pulls transparent-field RGB into the visible rim, which is why `bleedEdges` and `scripts/halo-reextraction-check.mjs` exist at all.

**The first town did not move: GATED TOTAL 33,856,374 B, +89 B against the 33,856,285 B the master quotes — 0.0003 % of the 8,000 B allowance.** No payload family leaked.

## 1. The rule I applied, and where it differs from the master's prediction

Item 4 gives a rule and then a prediction. I applied the rule, plus two additions, and both additions are stated here because they are judgement, not measurement:

* **(a)** main's `src/`, `assets/layer-contracts/` or `assets/first-town-payload.json` references the family stem — run verbatim as `grep -rl "<stem>" src assets/layer-contracts assets/first-town-payload.json`, and **(b)** the stem does not appear in `assets/first-town-payload.json`. All 30 landed stems return ≥ 1 referencing file and 0 payload hits.
* **(c) — MY ADDITION.** A family lands only if its change is a *real, edge-confined cure*: not pixel-identical to main, and every changed fully-opaque pixel within 3 px of a non-opaque one. The instrument is `artifacts/sprites-split-land/edge-confinement-census.mjs`, which measures the Chebyshev distance from each changed opaque pixel to the nearest non-opaque pixel in **main's own alpha**. This is the discriminator between a despill and a repaint, and item 5 asks for exactly it ("any opaque-RGB change beyond the edge"). It is what held `char-prospector-{complainant,gilded}-sheet-hover8` and the `boss-railcar-*` plates.
* **(d)** the master's explicit hold list wins over (a) and (b) where they disagree — see §3.

**Where the rule and the master's prediction disagree** (reported, not silently resolved):

| family group | master says | measured | what I did |
| --- | --- | --- | --- |
| `char-hero-sheet-walk4-{a,b}` and their `-f` variants | "Expected to FAIL (b) … `char-hero-*`" | they PASS (b): the four stems appear nowhere in `assets/first-town-payload.json` | **HELD**, per the master's explicit list. The measurement agrees it would be a bad trade: 0 visible violet px on main, so +71,927 B and a halo re-pin would buy nothing visible. |
| 86 `townsfolk-*-e{2..10}` era portraits | "Expected to FAIL (b) … every `townsfolk-*`" | they PASS both: referenced by `src/story/speakers.ts`, absent from the payload | **HELD**, per the master's explicit list — and independently justified: 92 of 102 compared files are **PIXEL-IDENTICAL on all four channels** (`reencode-identity-census.log`), i.e. +2,985,286 B of pure re-encode. This is the review's "free bytes on the table" class. |
| `char-jumper-*` (7 stems), `char-prospector-sheet-hover4-{a,b}` | named in neither the pass list nor the hold list | pass (a), (b) and (c); they cure 16,982 and 11,312 visible violet px respectively | **LANDED.** They are the rule's own answer and the master's pass list is prefixed "Expected to", not "only". Flagged in §7 as an open question. |

## 2. Per-family table — LANDED (30 stems, 664 files)

Cell counts are `assets/processed` + `assets/processed-full`. "alpha Δpx" is the count of pixels whose alpha byte differs from main — **0 means the cutout mask is byte-identical and the figure cannot have moved**. "opaque RGB Δ" is the changed-fully-opaque-pixel count and how many of them sit more than 3 px from the edge. "violet px" counts visible (alpha ≥ 16) pixels with R−G ≥ 40 and B−G ≥ 40. "key under transparent" counts exact `ff00ff`/`8a8a8a` under alpha = 0, the subject of `artifacts/f1450-4/halo-class-sweep.mjs`. "height" is the tallest figure's pixel height (alpha ≥ 128) across the family.

| family | cells (p + pf) | bytes main → landed | Δ | kind | alpha Δpx | opaque RGB Δ | violet px | key under transparent | height |
| --- | ---: | --- | ---: | --- | ---: | --- | --- | --- | --- |
| `char-bandit-base-sheet-walk8` | 32 + 0 | 2,686,184 → 4,616,795 | +1,930,611 | despill | 0 | 13,997, 0 beyond 3 px | 0 → 0 | 0 → 0 | 292 → 292 |
| `char-bandit-base-sheet-walkdiag8` | 32 + 0 | 2,501,860 → 4,128,620 | +1,626,760 | despill | 0 | 41,914, 0 beyond 3 px | 0 → 0 | 0 → 0 | 302 → 302 |
| `char-bandit-thief-sheet-walk8` | 32 + 0 | 1,697,532 → 3,779,345 | +2,081,813 | despill | 0 | 5,669, 0 beyond 3 px | 29,583 → 0 | 2,399,602 → 0 | 280 → 280 |
| `char-bandit-thief-sheet-walkdiag8` | 32 + 0 | 2,044,561 → 3,705,160 | +1,660,599 | despill | 0 | 24,960, 0 beyond 3 px | 0 → 0 | 0 → 0 | 290 → 290 |
| `char-baron-sheet-walk4-a` | 16 + 16 | 5,263,612 → 5,277,058 | +13,446 | despill | 0 | 7,178, 0 beyond 3 px | 0 → 0 | 0 → 0 | 204 → 204 |
| `char-baron-sheet-walk4-b` | 16 + 16 | 4,517,144 → 4,536,112 | +18,968 | despill | 0 | 12,370, 0 beyond 3 px | 0 → 0 | 0 → 0 | 210 → 210 |
| `char-baron-sheet-walk8` | 33 + 32 | 5,641,896 → 9,220,706 | +3,578,810 | **re-cut** | 80,090 | 463,133, 373,196 beyond 3 px (max >6) | 16,822 → 0 | 942,836 → 0 | 208 → 208 |
| `char-baron-sheet-walkdiag8` | 32 + 32 | 9,239,917 → 9,262,564 | +22,647 | despill | 0 | 16,362, 0 beyond 3 px | 0 → 0 | 0 → 0 | 200 → 200 |
| `char-coalthief-sheet-walk4-a` | 16 + 0 | 1,528,115 → 2,295,766 | +767,651 | despill | 0 | 28,289, 0 beyond 3 px | 0 → 0 | 0 → 0 | 275 → 275 |
| `char-e6-feral_toaster-sheet-walk8` | 8 + 0 | 513,585 → 1,182,732 | +669,147 | despill | 0 | 6,856, 0 beyond 3 px | 0 → 0 | 0 → 0 | 196 → 196 |
| `char-e6-glowjack-sheet-walk8` | 8 + 0 | 1,178,312 → 2,160,800 | +982,488 | despill | 0 | 11,635, 0 beyond 3 px | 1 → 0 | 0 → 0 | 384 → 384 |
| `char-e6-lawn_shepherd-sheet-walk8` | 8 + 0 | 1,392,308 → 2,206,101 | +813,793 | despill | 0 | 14,717, 0 beyond 3 px | 0 → 0 | 0 → 0 | 262 → 262 |
| `char-e7-data_rustler-sheet-walk8` | 8 + 0 | 836,469 → 1,161,326 | +324,857 | despill | 0 | 11,334, 0 beyond 3 px | 0 → 0 | 0 → 0 | 296 → 296 |
| `char-e7-rogue_automaton-sheet-walk8` | 8 + 0 | 941,943 → 1,297,266 | +355,323 | despill | 0 | 15,144, 0 beyond 3 px | 0 → 0 | 0 → 0 | 282 → 282 |
| `char-e8-scrap_corsair-sheet-walk8` | 8 + 0 | 1,019,856 → 1,360,344 | +340,488 | despill | 0 | 20,347, 0 beyond 3 px | 0 → 0 | 0 → 0 | 320 → 320 |
| `char-e8-sun_glare_shambler-sheet-walk8` | 8 + 0 | 745,174 → 1,189,472 | +444,298 | despill | 0 | 6,214, 0 beyond 3 px | 0 → 0 | 0 → 0 | 232 → 232 |
| `char-e9-claim_jump_prospect_drone-sheet-walk8` | 8 + 0 | 173,952 → 263,716 | +89,764 | despill | 0 | 2,231, 0 beyond 3 px | 0 → 0 | 0 → 0 | 108 → 108 |
| `char-e9-feral_terraformer-sheet-walk8` | 8 + 0 | 1,287,617 → 2,270,926 | +983,309 | despill | 0 | 22,552, 0 beyond 3 px | 15,991 → 0 | 1,146,681 → 0 | 340 → 340 |
| `char-jumper-sheet-back` | 6 + 6 | 2,191,074 → 2,335,503 | +144,429 | despill | 0 | 777, 0 beyond 3 px | 3,875 → 0 | 0 → 0 | 220 → 220 |
| `char-jumper-sheet-front` | 6 + 6 | 2,056,002 → 2,157,317 | +101,315 | despill | 0 | 424, 0 beyond 3 px | 4,019 → 0 | 0 → 0 | 220 → 220 |
| `char-jumper-sheet-rotation` | 12 + 12 | 2,760,030 → 2,973,975 | +213,945 | despill | 0 | 1,928, 0 beyond 3 px | 6,107 → 0 | 0 → 0 | 166 → 166 |
| `char-jumper-sheet-side` | 4 + 4 | 1,747,717 → 1,872,177 | +124,460 | despill | 0 | 251, 0 beyond 3 px | 2,981 → 0 | 0 → 0 | 220 → 220 |
| `char-jumper-sheet-walk4-a` | 16 + 16 | 4,549,726 → 4,556,780 | +7,054 | despill | 0 | 2,808, 0 beyond 3 px | 0 → 0 | 0 → 0 | 175 → 175 |
| `char-jumper-sheet-walk4-b` | 16 + 16 | 4,439,758 → 4,445,241 | +5,483 | despill | 0 | 4,021, 0 beyond 3 px | 0 → 0 | 0 → 0 | 156 → 156 |
| `char-jumper-sheet-walk8` | 5 + 17 | 2,908,436 → 2,908,385 | −51 | despill | 0 | 12, 0 beyond 3 px | 0 → 0 | 0 → 0 | 148 → 148 |
| `char-prospector-sheet-hover4-a` | 16 + 16 | 2,652,667 → 3,136,019 | +483,352 | despill | 0 | 1,677, 0 beyond 3 px | 6,044 → 0 | 0 → 0 | 110 → 110 |
| `char-prospector-sheet-hover4-b` | 16 + 16 | 2,580,817 → 2,939,764 | +358,947 | despill | 0 | 828, 0 beyond 3 px | 5,268 → 0 | 0 → 0 | 107 → 107 |
| `char-railtough-sheet-walk4-a` | 16 + 0 | 1,315,681 → 2,245,307 | +929,626 | despill | 0 | 17,520, 0 beyond 3 px | 0 → 0 | 0 → 0 | 294 → 294 |
| `char-railtough-sheet-walkdiag4-a` | 17 + 0 | 1,320,471 → 2,417,748 | +1,097,277 | **re-cut** | 21,309 | 15,170, 743 beyond 3 px (max >6) | 0 → 0 | 0 → 0 | 290 → 288 |
| `char-steamwrecker-sheet-walk4-a` | 16 + 0 | 1,790,088 → 2,545,892 | +755,804 | despill | 0 | 34,176, 0 beyond 3 px | 0 → 0 | 0 → 0 | 248 → 248 |
**Totals**: 664 files, 73,522,504 → 94,448,917 B (**+20,926,413**). Split by tree: `assets/processed` 459 files, 34,397,993 → 51,661,097 (**+17,263,104**, shipped); `assets/processed-full` 205 files, 39,124,511 → 42,787,820 (**+3,663,309**, masters, not shipped). Two `.frames.json` sidecars travel with their families (`char-baron-sheet-walk8`, `char-railtough-sheet-walkdiag4-a`) because both are re-cuts and their bboxes moved with the cutout.

**28 of 30 are despill only**: alpha byte-identical, every changed opaque pixel within 3 px of the edge, figure height unchanged to the pixel. The two exceptions are both named by the master and both were looked at, not just measured:

* **`char-baron-sheet-walk8`** — a re-cut AND a re-downscale (256×256 cells where the rest are 512×512): 80,090 alpha-differing px, 463,133 changed opaque px of which 373,196 lie beyond 3 px of the edge, mean channel delta 30 (p50 13, p90 88, p99 192, max 214). Its mean opaque RGB moves 81.8/51.0/36.7 → 71.9/40.9/29.1 — **not a recolour: the hue holds and the figure gets less pale**, which is the pale halo that had washed *into* the figure coming back out. `contact-char-baron-sheet-walk8.png` shows a cream rim around main's Baron and none after, same coat, same hat, same pose. The review saw the same thing independently (§"What it earns", `contact-hero-and-baron.png`). 16,822 visible violet px → 0 and 942,836 key px under transparent → 0.
* **`char-railtough-sheet-walkdiag4-a`** — a re-cut: 21,309 alpha-differing px (max 255), 743 changed opaque px beyond 3 px, mean channel delta 15 (p99 58, max 110), figure height **290 → 288 px**, inside item 5's ±2 px band. `contact-char-railtough-sheet-walkdiag4-a.png`: the diff row renders the figure as solid black, i.e. the visible art is unchanged; only the field around it moves.

Contact sheets for all 30 landed families are in `artifacts/sprites-split-land/contact-<stem>.png` (row 1 main · row 2 landed · row 3 the abs-diff at 8× amplification, over a mid-grey ground so alpha reads).

## 3. Per-family table — HELD (163 stems)

| group | stems | files | Δ bytes if landed | why held |
| --- | ---: | ---: | ---: | --- |
| **payload-declared** — `char-{assay-clerk,elder,newsie-mei,preacher,prospector,schoolteacher,storekeeper,tavernkeeper,youngster-f,youngster-m}-sheet-*`, every `char-hero-sheet-*` in the hero group, `char-hero-sheet-{attack8,work8}`, `char-prospector-portrait`, `hero-homesteader{,-f}`, the seven base `townsfolk-*` plates | 37 | 668 | +19,782,767 | **item 4(b)**: the stem appears in `assets/first-town-payload.json`. These carry F-SPRDR-2's 15,726,438 B budget blowout and are stage 2's whole subject. |
| **`char-hero-*` not in the payload** — `char-hero-sheet-walk4-{a,b}{,-f}`, `char-hero-{claimday,midlife,silver,elder}-sheet-walk4-*` | 12 | 259 | +13,147,804 | the master's hold list holds `char-hero-*` whole. `char-hero-elder-sheet-walk4-{a,b}` and `char-hero-silver-sheet-walk4-a` are **NEVER** (F-SPRDR-10: marigold recolour, figure 411 → 353 px). The `claimday`/`midlife`/`silver-b` stems also fail (a): zero references anywhere. |
| **`townsfolk-*` era portraits** | 86 | 86 | +2,985,286 | the master's hold list, and measured: **pixel-identical re-encodes**. 92 of 102 files compared byte-for-byte across all four channels are identical (`reencode-identity-census.log`); 6 of the 10 that differ are payload-declared and held on that ground anyway. |
| **`char-prospector-{complainant,gilded}-sheet-hover8`** | 2 | 66 | +4,248,604 | **F-SSL-3, a hold this master did not predict.** These are REGENERATIONS, not despills: 244,213 and 243,189 alpha-differing px at max 255, 365,716 / 362,612 changed opaque px, and the **figure grows 220 → 226 px and 220 → 224 px** with the top and bottom edges both moving — outside item 5's ±2 px band. That is F-SPRDR-10's class (a geometry change to a shipped character with no ruling behind it), applied to the owner's own agent. Held for an owner word. |
| **`boss-railcar-*` (7) and `enemy-claim-jumper`** | 8 | 9 | +104,019 | **F-SSL-5**, failing my (c): four `boss-railcar-*` are PIXEL-IDENTICAL to main on all four channels, the three `-damaged` plates differ in 0–6 px by at most 2, and `enemy-claim-jumper` changes 8,276 transparent-field px while its key-coloured transparent px go **5 → 6, i.e. very slightly worse**. Bytes for nothing. `boss-railcar-intact` also fails (a) outright — zero references. |
| **ADDED families** (not in the table above; the branch adds 763 PNGs across ~20 new families) | ~20 | 763 | — | **F-SPRDR-4b**: zero references in `src/`, `assets/layer-contracts/` or the payload, so item 4(a) refuses them. `char-{coalthief,railtough,steamwrecker}-north4-v2`, `char-baron-{ne,w}-clean-v2`, `char-baron-walk4-diagonal-v2`, `char-hero-sheet-work8-*-clean-*`, `char-thief-se-*`, the new town idles. They travel with their wiring slice. |

## 4. Tooling taken (item 1) — 36 of the 43 script paths

`git diff --name-status 27227acdc..92f6cc115 -- scripts` lists 43. Excluded by the master: `scripts/fire.md`, `scripts/law-pointer-baseline.json` (F-SPRDR-5), `scripts/dispose-skeleton.test.mjs`, `scripts/sprite-clip-fallback.test.mjs` (F-SPRDR-4). `scripts/halo-reextraction-check.mjs` is item 4's, handled below. `scripts/asset-diet.manifest.json` resolved to a **no-op**: main already carries the branch's `land-yacht.glb` line (the checkout left the file unchanged), so 37 paths moved, not 38.

`node --check` passes on all 33 `.mjs` among them. One further exclusion I made and the master did not name:

> **F-SSL-2 — `scripts/master-repair-check.test.mjs` was HELD BACK on the branch, a sixth member of F-SPRDR-4's class.** Measured: `node --test` rc=1 in 0.03 s, `AssertionError: repair provenance must be present` at `:9`. Its fixture is the first cell of `assets/master-divergent.json` carrying a `repair` block, and **main's manifest holds 26 cells with 0 `repair` blocks while the branch's holds 420 with 420** (`git show 92f6cc115:assets/master-divergent.json`). `assets/master-divergent.json` is outside this master's firewall, so the data half cannot land here and the guard would be permanently, meaninglessly red. It belongs with whatever lands that manifest.

## 5. Guards rooted (item 2)

**Rooted in `package.json` `test:node-guards`, appended to the FIRST `node scripts/run-node-guards.mjs …` stage** (105 → 115 entries) — deliberately not the list after `npm run test:desk-declaration`, which F-DRB-11 measured as swallowed arguments that never run:

`anim-pass-gen` · `anim-pass-graft` · `anim-pass-grid` · `anim-pass-montage` · `deshadow-key` · `despill-cutout` · `grid-centres` · `grid-origin` · `rgba-resample` · `town-patrol-monument` (all `scripts/*.test.mjs`).

Nine of the ten are GREEN through the runner itself: `GR_GUARD_NO_ARTIFACT=1 node scripts/run-node-guards.mjs <the nine> scripts/deploy-budget.test.mjs` → **rc=0, 36 pass / 0 fail** (`deploy-budget.test.mjs` is the one modified guard I took, and it is already rooted).

> ### ⚠ F-SSL-1 — `town-patrol-monument` is rooted RED, and a drainer must expect it
> The master orders it: *"root it and record it in `logs/suite-red-inventory.md` as a documented red with the finding, do NOT fix the town data here."* Done — the row is the first NODE-GUARD row in that file, at the head of the additive "Corrections since the snapshot" table. Measured twice on main `9382083d3`: `node --test` rc=1 / 0.36 s and through the battery runner rc=1 / 0.68 s, identical assertion `newsie segment 5 enters the monument (0)` at `:20`. The branch's own control tree failed identically (review §3), so three trees agree the guard is right and the **town data** is wrong.
> **CONSEQUENCE: `npm run test:node-guards` now exits non-zero on a clean main.** `scripts/run-node-guards.mjs` has no known-red allowlist — `:87` is `process.exit(child.status ?? 1)` — so there is no way to root this guard and keep the board green. Hiding it in the caller baseline instead would have made it the unread verdict F-1252-2 built the audit to stop. **Corrective owed, outside this firewall (`src/**`): re-route the newsie patrol's segment 5 in `src/town/townsfolk.ts` clear of `townPropRing`'s pan-monument footprint in `src/town/townLayout.ts`.**

**Recorded in `scripts/gate-caller-baseline.json` instead of rooted** — the six `review-*.test.mjs` probes, each with its own measured reason, F-SSL-4. The master expected them to need a *server*; they own one (they all import `createServer` from `vite`). The real reason is worse and is written into each entry: **all six are RED against this tree because they assert `src/` behaviour that is not here** — F-SPRDR-4's class again, now at eight members.

| probe | measured on main `9382083d3` |
| --- | --- |
| `review-account-creation.test.mjs` | rc=1, **302.3 s**, 1 test CANCELLED at its own 90,000 ms bound; stands up a real wrangler Durable Object |
| `review-mixed-hashes.test.mjs` | rc=1, < 1 s, **11 pass / 8 fail** (seat/quorum arms) |
| `review-party-retention.test.mjs` | rc=1, < 1 s, 0/1 — `party 2 keeps its champion` |
| `review-save-names.test.mjs` | rc=1, ~1 s, 1 pass / 2 fail |
| `review-terminal-views.test.mjs` | rc=1, < 1 s, 0/1 — `death: host stays connected before the deadline` |
| `review-wrecked-turrets.test.mjs` | rc=1, 2.3 s, 0/1 — `atomic:sunline-mount:0: wreck disables even before the next arsenal update` |

**Ratchet tightened in the same edit**: `scripts/anim-pass-dupecheck.mjs` was grandfathered as an orphan and now HAS a caller — `scripts/anim-pass-grid.test.mjs`, landed and rooted here. Its reason moved to `superseded` **byte-identical**, as `scripts/gate-caller-audit.test.mjs:769-782` requires.

**Result**: `node scripts/gate-caller-audit.mjs` → **PASS — every gate-shaped subject is either reached or grandfathered with a reason**, 0 gates without caller or reason (was `FAIL — 6`). `node --test scripts/gate-caller-audit.test.mjs` → **45 pass / 0 fail**.

## 6. The halo guard (item 4)

`scripts/halo-reextraction-check.mjs`, main's invariant text **unchanged** — Astra's relaxed "opaque-RGB change within 3 px of alpha if it matches a saturated-key despill formula" clause was NOT taken, and the byte-comparison loop at the foot of the file is main's, running strictly over every remaining cured cell.

| | before | after | cause |
| --- | ---: | ---: | --- |
| `cured` | 811 | **459** | −352: the cells of the 21 declared stems that were never `HELD_SHEETS` members |
| `expectedResidual` | 232 | **160** | −72: the 3 `HELD_SHEETS` members landed here (32 `char-bandit-thief-sheet-walk8` + 32 `char-baron-sheet-walk8` + 8 `char-e9-feral_terraformer-sheet-walk8`) |
| `regenerated` | 32 | **456** | +424: all 24 stems declared by this master |
| `current.scanned` | 1400 | **1400** | RE-MEASURED and unchanged — this stage takes only files the branch MODIFIES, never one it ADDS, so no PNG enters `assets/processed`. The branch's own 1400 → 2082 re-pin is its 682 added PNGs and is **not** taken. |

`expectedResidual` + `regenerated` + `cured` = 1075 = `baseline.suspects.length`, and that closure is now itself an assertion, so a future re-pin cannot drop a cell out of all three sets.

**What is left in `expectedResidual` is exactly stage 2's subject**: `char-hero-sheet-walk8`, `char-newsie-mei-sheet-walk8`, `char-storekeeper-sheet-walk8`, `char-youngster-f-sheet-walk8`, `char-youngster-m-sheet-walk8`.

One mechanism change was needed and is commented in place: `cured` now excludes `REGENERATED_SHEETS` as well as `HELD_SHEETS`. Until now the single declared stem (the Elder) was *also* a held stem, so keying the exclusion off `HELD_SHEETS` alone was indistinguishable from keying it off both; 21 of the 24 stems added here were never held, so it is distinguishable now — without the clause a declared re-extraction would still be measured against BASE's bytes and the declaration would mean nothing.

`node scripts/halo-reextraction-check.mjs` → **PASS: 459 cured, 160 held, 456 regenerated-and-cured, 1400 scanned; alpha and opaque RGB unchanged.**

## 7. Prose (item 3)

* Taken verbatim: `reviews/sol-findings-{code-review,code-review-fixes,sprite-roster-fixes,sprites-factory}-20260908.md` (4 files, 1,242 lines) and `tasks/PROPOSED-sprite-source-assertions-20260908.md`.
* `assets/LEDGER.md`: **+387 lines, 0 deletions.** The branch's 326 prose lines were unioned under main's current LEDGER (which had itself moved past the branch's base), and **all 153 non-blank prose lines are present byte-for-byte**. The branch's rewrite of numbered row 75 was NOT taken — F-SPRDR-11 says main's row is the accurate one — which is why the master's count is 326 and the branch's diff shows 327.
* Each of the 51 batch sections gained **one closing `**STAGE 1 …:**` line** naming what stage 1 landed of it, with bytes and the measurement, and what stage 2 holds with the reason.

## 8. Budget proof (item 6)

```
GR_RELEASE=e1 npm run build                 rc=0
node scripts/first-town-payload.mjs         rc=0
first-town payload demand-paged: 0 bytes
first-town payload declared: 33856374 bytes
```

**33,856,374 B vs the master's 33,856,285 B → +89 B**, against an 8,000 B allowance. The smallest payload family moves by ~50 kB, so +89 B is proof that item 4(b) leaked nothing; the residue is main advancing two commits past the master's 2026-09-12 measurement. Full output: `artifacts/sprites-split-land/first-town-payload.log`.

A plain `npm run build` is **not** the right instrument here and cost one wasted run: `scripts/first-town-payload.mjs` exits 1 with *"declares `_gold-rush-release-e1-ceremony-scripts.js`, which the build in dist/ does not emit"* because that chunk only exists in a release build. `scripts/deploy.sh:103` builds with `GR_RELEASE="${GR_RELEASE:-e1}"`, and that is what was used.

## 9. Every gate run, with its exact result

| gate | command | result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | **rc=0**, 0 lines |
| release build | `GR_RELEASE=e1 npm run build` | **rc=0** |
| first-town payload | `node scripts/first-town-payload.mjs` | **rc=0**, 33,856,374 B |
| halo invariant | `node scripts/halo-reextraction-check.mjs` | **PASS** — 459 cured, 160 held, 456 regenerated-and-cured, 1400 scanned |
| gate caller audit | `node scripts/gate-caller-audit.mjs` | **PASS**, 0 uncalled (was FAIL — 6) |
| gate caller audit tests | `node --test scripts/gate-caller-audit.test.mjs` | **45 pass / 0 fail** |
| the 9 new server-less guards + `deploy-budget` | `GR_GUARD_NO_ARTIFACT=1 node scripts/run-node-guards.mjs …` | **rc=0, 36 pass / 0 fail** |
| `town-patrol-monument` | `node --test` and via the runner | **rc=1 both** — the documented red, F-SSL-1 |
| guards over files I edited | `node --test scripts/{suite-red-inventory,law-pointer-guard,citation-title-guard}.test.mjs` | **15/0, 22/0, 18/0** |
| the six `review-*` probes | `node --test scripts/review-*.test.mjs` | **rc=1 each** — see §5, recorded in the caller baseline |
| e2e, both projects, 1 worker | `GR_CAPTURE_EXTERNAL_SERVER=1 GR_CAPTURE_BASE_URL=http://127.0.0.1:5340 npx playwright test e2e/task-025-bandits-dont-swim.spec.ts e2e/m1-01-claim-jumpers-death.spec.ts e2e/m2-01-build-menu.spec.ts e2e/e{6,7,8,9}-roster.spec.ts --workers=1 --reporter=line --trace=off` | **58 passed / 0 failed, 3.6 min, rc=0** |
| plain boot, no `?debug` | `node artifacts/sprites-split-land/plain-boot-probe.mjs` | **0 console errors, 0 page errors, 0 failed requests** on desktop 1280×800 and mobile 390×844; `plain-boot-{desktop,mobile390}.png` |

Two findings fall out of that e2e run:

* **F-SPRDR-4's §4 UNATTRIBUTED reds are load flakes, not regressions.** `m1-01-claim-jumpers-death.spec.ts:83` ("double restart recycles enemies without geometry growth") and `m2-01-build-menu.spec.ts:178` ("palisade footprint rejects overlap…") both pass here, both projects, single worker, on a tree that carries the branch's art.
* **`tasks/PROPOSED-sprite-source-assertions-20260908.md`'s premise does not hold on main.** It says the E7/E8/E9 roster specs fail at a source-text assertion; all of `e2e/e{6,7,8,9}-roster.spec.ts` pass here on both projects. The proposal is about a tree that carries the F-SPR-05 src change, which main does not. Landed as a proposal, unqueued, per the master.

Nine tracked screenshots under `artifacts/056/` and `artifacts/lane-roster-wiring-e{7,8,9}-01/` were rewritten by the e2e run and **restored with `git checkout --` before committing**; nothing outside the firewall is staged.

## 10. Open questions for the drainer and the owner

1. **F-SSL-1 reds the node battery.** `npm run test:node-guards` exits 1 on a clean main from this merge forward, for a pre-existing town-data defect. That is the master's instruction and the red is documented — but the drainer must fingerprint it rather than attribute it to this land, and someone owes the `src/town/townsfolk.ts` re-route.
2. **F-SSL-3 — the agent's hover8 variants.** `char-prospector-{complainant,gilded}-sheet-hover8` are held because the figure grows 4–6 px. If the owner wants them, it is a ruling about the Prospector's silhouette, not a drain decision.
3. **`char-prospector-sheet-hover4-{a,b}` landed while `char-prospector-sheet-hover8` is held** (payload). Until stage 2 the agent's 4-direction hover is cured and its 8-direction hover is not. Measured, not fatal — hover8 keeps exactly the fringe it has today — but it is a knowingly mixed state and stage 2 closes it.
4. **F-SSL-2 and F-SSL-4 leave eight guards on the branch or unrooted.** `dispose-skeleton`, `sprite-clip-fallback`, `master-repair-check` and the six `review-*` probes are all waiting on halves that are not here (`src/`, `assets/master-divergent.json`). They should be rooted by whatever lands those halves, or retired.
5. **F-SPRDR-9 is untouched and still true.** `artifacts/sol/**` (24.58 GB, nine blobs over 100 MB) stays on `sol/code-review-20260908`. Nothing under `artifacts/` was taken by this master. The branch must not be merged, ever — only checked out from, path by path.
6. **F-SPRDR-8's overwritten evidence is not addressed here.** The branch's rewrites of 58 tracked evidence files from past drains stay on the branch; this land took none of them.
7. **The engine hash did not move**, as the firewall required: nothing landed here is in `ENGINE_SOURCE_INPUTS`, `assets/engine-era.json` is untouched, and no era pin was minted. Fix 4 of the review (`e0fcfefb…`) belongs to whoever lands a tree that actually moves the hash — not this one.
