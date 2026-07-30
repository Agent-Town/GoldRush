# GG-03e — Herald class-map engravings (the eighth class)

- **Slice:** `lane-a-herald-class-map-engravings.md` (FIRE-AUTHORED s1255)
- **Branch / tip:** `lane/m3` @ `dd08bc1a` (base `dfed3765`)
- **Merged to main:** `5e129079` (s1257 fire, 2026-07-30)
- **Verdict:** ✅ **MERGE — gates green, budgets honoured, firewall respected.** The slice is real but **much narrower than its own master claims, and player-invisible**; the LEDGER row it writes is accurate but reads bigger than it is. Two non-blocking findings, one owner eyeball carried forward.

## What it does

The master was authored on a measured-sounding premise that s1256 later refuted (F-1256-2): that `src/news/heraldReader.ts`'s class map "resolves to nothing" because no `assets/processed/herald-engraving-*.webp` existed, leaving the Herald "silently text-only for every class". In fact all seven were tracked on main since `b5be7ab3`, a day before the claim; the published proof command was `ls assets/processed/ | grep gazette` — a grep for `gazette` used to answer a question about `herald-engraving`.

So this slice is **not** the wiring of the Herald's engravings. That shipped with GG-03c/GG-03d. What actually lands here:

1. `ceremony` added to the `HeraldClass` union (`src/news/herald.ts:3`) and to the map (`src/news/heraldReader.ts:23`) — **the genuinely missing eighth class**, which the master was right about.
2. `assets/processed/herald-engraving-ceremony.webp` (44,514 B, 384×384) — a new plate.
3. A **decode** assertion: `e2e/gazette-art-wiring.spec.ts:111` calls `image.decode()` alongside the existing `naturalWidth/Height > 0` checks (scope 3, F-1185-2's binding precedent).
4. The build-time roster invariant `13 → 14` in `scripts/asset-diet.mjs:60-61`, plus its comment (`7 → 8` spot cuts).
5. A **re-encode of the seven plates that already worked** — the downstream cost of the false premise (see F-1257-1).
6. `assets/LEDGER.md:224` flipped `PENDING-INTEGRATION` → `INTEGRATED 2026-07-30`.
7. `ARTIFACT_DIR` moved to `artifacts/herald-class-map/` (instructed by the master's own self-check).

**Scope 4 (`ceremony`) was decided correctly.** The master ordered a STOP if wiring ceremony required inventing a rule for *which* Herald items are ceremonies. It did not: Herald items author their `class` directly in `news/herald.json`, so a union member plus a map entry is purely mechanical. No classifier was invented. ✓

## Evidence (all measured on the merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc=0 |
| `npm run build` | green |
| `[asset-diet] Herald dev-path art` | **1,158,214 B** / 1,500,000 ceiling → **341,786 B headroom** |
| `[asset-diet] herald spot cuts` | **375,470 B** / 1,500,000 → 1,124,530 B remaining |
| Budget constants | **UNCHANGED** (`HERALD_SPOT_CUT_BUDGET_BYTES` / `HERALD_DEV_ART_BUDGET_BYTES` both still `1_500_000`) |
| `gazette-art-wiring` + `gazette-first-issue`, `--workers=1` | **8/8** desktop + 390px, 33.8 s |
| Console/page errors | **zero**, asserted *inside* the spec, plain boot, no `?debug` |
| Adjacent (`gz-02-news-page`, `wd02-barks`, `gz-h1-newsie`) | **14 passed, 2 failed** — see below |
| All 8 map entries resolve | **8** `herald-engraving-*.webp` in `dist/assets/` |
| Re-encode dimensions | **384×384 unchanged** on all seven (webp headers parsed, main vs lane) |
| Screenshots | `artifacts/herald-class-map/{desktop,mobile}-chrome-live-cuts.png` — reviewed, engravings correct per class, canon-safe |

The dev-path and spot-cut numbers **reproduce the run's reported figures exactly**, independently derived (`git show` of each blob, summed: 317,162 → 375,470 = +58,308 B, matching the dev-path delta).

### The two reds are pre-existing — proven by control, not by inventory lookup

The run reported them as "the untouched known red at `gz-h1-newsie.spec.ts:114`". That claim was audited rather than inherited, because **this slice edits the exact import closure `gz-h1-newsie` reads** (`src/news/herald.ts`, `src/news/heraldReader.ts`), which makes an inventory match circular on its own.

- **By title:** `logs/suite-red-inventory.md` row 40 — *"newsie barks latest headline and opens the Claim Herald"*, `8/19 = 42.1%`, **BOTH** projects. Cited by title, not line number.
- **By control (decisive):** the graft was parked (`git stash push`, path-scoped), the subject's absence **verified at the index** (`ceremony:` map entry gone), and the spec re-run on unmodified main. It failed **identically** — same test, same `:106`, same `toHaveText`, same received `"Chen Mei"` ×12 / `"Juniper"` ×2. **Red without the slice.** The graft was then restored and re-verified byte-identical to `lane/m3` on all 15 paths.

Driver: `logs/session-scratch/s1257/control-newsie.mjs`.

## Merge classification

Base `dfed3765`; `git log dfed3765..main` over all 15 paths is **empty → zero MAIN-MOVED files**, so no 3-way was needed and a path-scoped checkout was exact. All 15 applied **byte-identical** to the branch tree (sha256, `logs/session-scratch/s1257/graft.mjs`, which also aborts unless the runner commit's path set matches the graft list exactly).

The two-dot `main..lane/m3` diff shows ~60 further files (deletions of `logs/session-scratch/s1256/*`, `tasks/queue/lane-b/*`, `STATUS.md`, `tasks/BACKLOG.md`, artifact PNGs). **All phantom** — stale-base artefacts of a branch forked at `dfed3765` while main advanced through s1256. `git show --name-only dd08bc1a` is the real set: exactly 15 files, exactly the firewall.

**Firewall: respected.** `scripts/asset-diet.mjs` was the file to check first (F-1256-2 flagged it as forbidden "in one direction"). It was touched in 6 lines and **none of them moves a budget**: the roster-count invariant `13 → 14` and its comment. Reading `filesReachedByHeraldGlobs` shows this edit was **required**, not cosmetic — the function derives expected names by parsing `heraldReader.ts` and throws on any missing *or* unexpected file, so adding an eighth plate without the count bump would have failed the build. The `NO` list held: raws untouched, `FIRST_ISSUE_PANELS` untouched, no `TownWelcome`/profile edits, `logs/suite-red-inventory.md` untouched, no new dependencies.

## Findings

**F-1257-1 (non-blocking, records a cost) — the seven working plates were re-encoded for nothing, and that is the price tag of F-1256-2's false premise.** Believing no derivatives existed, the run regenerated all seven from the raws. Sizes moved in **both** directions (`board` 36,904→42,198 · `schoolhouse` 48,116→31,566 · `trail` 49,824→60,588), dimensions are **384×384 before and after**, and the net cost is **+13,794 B on the seven** (plus 44,514 B for the legitimate eighth). No measurable gain: same dimensions, same pipeline, no decode or quality defect found. Harmless — 341,786 B of headroom remains and they were re-derived from the RGB masters, so there is no compounding generation loss — but it is the concrete downstream cost of a master authored on an unverified negative search, and belongs next to F-1256-2 rather than in a separate ledger thread.

**F-1257-2 (non-blocking, honesty of the LEDGER row) — `ceremony` is mapped but unreachable in play, and 4 of the 8 classes are invisible today.** `news/herald.json` currently emits **4** classes (`board`, `river`, `schoolhouse`, `ledger`, one item each); `trail`, `boss`, `town-growth` and `ceremony` are mapped and resolve through the build but **no Herald item emits them**, so no player sees those four plates in a plain boot. The LEDGER row now reads `INTEGRATED 2026-07-30; board, trail, river, schoolhouse, ledger, boss, town-growth, and ceremony wired`. That is *true* of the map and defensible under the spec's placeholder-first rule ("unmapped classes render text-only"), but it reads as eight engravings on camera when the answer to Mistake #10's question — *where does the player see this in a plain boot?* — is **four of eight, and the eighth is content-gated, not code-gated**. The ceremony plate becomes visible the first time a Herald item is authored with `class: "ceremony"`. No corrective task: nothing is broken, and the class exists precisely so future content can use it.

**GZ-01: no item appended, by the filter law rather than by omission.** The law wants a player-visible change on a real-change merge. Since the seven plates were already wired and already on camera before this merge (`gazette-art-wiring`'s live-cuts test was green on main, and the spec diff is additive-only), the player-visible delta of this merge is **nil**: the one new plate has no emitting content, and the re-encodes are byte-level. There is no honest headline here. The Herald's engravings were already newsworthy — and GG-03's items already said so.

## Carried to the owner

🔺 **F-1255-4 (re-raised, unchanged, and now live):** the brass agent in `gazette-class-growth.png` is drawn as a rotund, moustachioed, bow-tied brass figure. Canon-safe, but a character-design choice made inside a generate-only art batch, and this merge is what first places it beside player-facing Prospector copy (ADR-003). **Eyeball only — no art was altered.** Same shape as F-1205-7: the agent's depiction drifts whenever a plate is generated without a character reference in the prompt. Note that the `town-growth` plate carrying it is one of the four **not** currently emitted by the feed, so this is not yet on camera.
