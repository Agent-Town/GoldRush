# drain-review-sprites-roster — Astra's sprite roster branch, gated on a merged tree

**Slice**: `sol/code-review-20260908` (one commit `92f6cc115`, Astra's sprite roster + factory review, committed for retention 2026-09-12 by the attended session from an uncommitted worktree, never gated).
**Branch under review**: `drain/sprites-roster` in the scratch worktree `wt-sprites`; merge commit **`53ce2260c`** (`git merge --no-ff`, rc=0, 35 s, **zero conflicts**), first parent `27227acdc` (main at cut), merge base `d41ab98ce` (2026-09-08 06:33).
**Control**: detached worktree `wt-sprites-control` at **`27227acdc`** — main exactly as this branch saw it, so the only difference between the two trees is Astra's content.
**Reviewer**: Claude Opus 5, native, 2026-09-12. Every number below comes from a command run on one of those two trees; transcripts in `artifacts/drain-review-sprites-roster/transcripts/`.
**Finalised attended** (Fable 5.1, 2026-09-12) after the owner asked for a lean review and the reviewer was stopped: §4 was filled from its transcripts; every other number is the reviewer's; the verdict is unchanged.

## VERDICT: **SPLIT** — land the tooling and the fringe cure, hold the cells

The branch contains one genuinely valuable, measurable result and three blockers that no fix under twenty lines can reach.

**What it earns.** The violet-key fringe census is a real win, measured over all 2,415 changed shipped cells (`assets/processed` + `assets/processed-full`): **163,848 violet-key pixels on main across 35 families → 1 pixel on the merged tree** (`char-tavernkeeper-idle-r0c0.png` at (309,250), rgba 170/85/170, **alpha 3** — invisible). The Baron's pale halo and the pink ground smear under the hero's boots are gone, and you can see it in `artifacts/drain-review-sprites-roster/contact-hero-and-baron.png`. Nineteen new guards, a real pre-existing town bug found (the newsie walks through the pan monument), seven new town idles, and a new E1 Mei portrait are all worth keeping.

**Why it cannot land as one piece.**

1. **The first town no longer fits its budget, by 45 %.** `scripts/first-town-payload.mjs` on the merged release build reads **50,726,438 B against the 35,000,000 B `BUDGET_LIMIT`** (`scripts/deploy.sh:33`) — main reads 33,851,294 B with 1,148,706 B of headroom. `scripts/deploy.sh` would refuse the deploy. The cast group alone is 34,015,034 B.
2. **297 shipped cutouts were replaced outside the branch's own declaration**, and `scripts/halo-reextraction-check.mjs` — Astra's own re-pinned guard — says so on the merged tree while it is green on main.
3. **The branch is the art half of a campaign whose src half was left behind.** Four independent instruments say so (below). Three of Astra's own nineteen new guards are red against the tree they ship with because they test code that is not here.

Splitting is cheap because the pieces are already separable: the tooling, the scripts, the new guards and the *non-payload* families (bandits, the E6-E9 enemy roster, the Baron) are independent of the five town-cast walk8 sheets that carry the budget blowout.

---

## 1. Merge classification

`git merge --no-ff sol/code-review-20260908` — rc=0, 35 s, **no conflicts**, 46,483 paths.

| class | paths | detail |
| --- | ---: | --- |
| **MAIN-MOVED ∩ LANE-TOUCHED** | **1** | `assets/LEDGER.md` only. Main edited line 403; Astra appended 326 lines after line 408. Auto-merged as a clean union: `git diff 27227acdc HEAD -- assets/LEDGER.md` is **+326 / -0**, so main's edit survives intact. |
| LANE-TOUCHED, evidence | 43,732 | `artifacts/sol/**` (24.58 GB, 43,778 files) |
| LANE-TOUCHED, shipped art | 2,515 | `assets/processed` 2,055 (1,292 M + 763 A; 1,273 modified PNGs + 682 added PNGs), `assets/processed-full` 460 modified PNGs |
| LANE-TOUCHED, sources | 100 | `assets/raw` (83 A + 17 M) |
| LANE-TOUCHED, pilots | 17 | dredge-queen / old-digger / salvage-claw rebuilds (`.blend`, `.glb`, build/verify `.py`) |
| LANE-TOUCHED, data | 6 | `assets/LEDGER.md`, `assets/engine-era.json`, `assets/first-town-payload.json`, `assets/layer-contracts/{characters.v2,ui.v1}.json`, `assets/master-divergent.json` |
| LANE-TOUCHED, scripts | 43 | 24 modified + 19 new `*.test.mjs` + 8 new `review-*.mjs`, **plus `scripts/fire.md` and `scripts/law-pointer-baseline.json`** (out of scope; see F-SPRDR-5) |
| LANE-TOUCHED, tracked evidence overwritten | 58 | `artifacts/{058,e3-crawler-boss,e4-landyacht-boss,eight-winds-hero,fevered-tell,hero-poses,lane-roster-wiring-e7-01,run-gait-stride,run-scene-animation-refresh,wire-crawler-3d}`, `reviews/shots-{town-cast,elder-walk8-regeneration}` — screenshots and perf tables from PAST drains, overwritten by Astra's runs (F-SPRDR-8) |
| LANE-TOUCHED, prose | 5 | four `reviews/sol-findings-*.md`, one `tasks/PROPOSED-*.md` |
| **`src/`, `e2e/`, `functions/`, `package.json`** | **0** | verified: `git diff --name-only 27227acdc HEAD -- src/ e2e/ functions/ package.json` is empty |

## 2. Gate table (merged tree + the three review fixes of §5)

| gate | result | measured | attribution |
| --- | --- | --- | --- |
| `tsc` | **GREEN** | rc=0, 5.4 s | — |
| `GR_RELEASE=e1 npm run build` | **GREEN** | rc=0; 57 manifest GLBs 126,951,396 → 17,294,888 B (86 % cut); bosses 15,429,488 B vs control 15,162,464 B (**+267,024 B**, the pilot rebuilds) | — |
| `npm run build:release` (`assert-release-build.mjs`) | **RED** | `later era assets emitted: townsfolk-appliance-wrangler-e6…` | **PRE-EXISTING** — control fails identically, same eight names |
| **first-town payload, as committed** | **RED** | rc=1: *"declares `townsfolk-newsie-e1.png`, which the build in dist/ does not emit"* | **REGRESSION** (F-SPRDR-1) |
| **first-town payload, after fix 1** | **rc=0 but OVER BUDGET** | **50,726,438 B vs 35,000,000 B → over by 15,726,438 B (+44.9 %)**; main 33,851,294 B | **REGRESSION** (F-SPRDR-2) |
| `npm run test:node-guards` (full) | **733 pass / 7 fail / 2 skip, 482.95 s** | see §3 | 3 regressions, 2 pre-existing, 1 knock-on, 1 environment |
| `scripts/halo-reextraction-check.mjs` | **RED** | denominator 1400 → **2082** (re-pinned, fix 3); then **297 cells across 15 families** fail the alpha/opaque-RGB invariant | **REGRESSION** — control GREEN (`811 cured, 232 held, 32 regenerated-and-cured, 1400 scanned`) (F-SPRDR-3) |
| `scripts/anim-pass-table.mjs` | **RED** | `TypeError: Cannot read properties of undefined (reading 'filter')` at `:119` | **PRE-EXISTING** — control fails identically |
| `deploy-budget` + `first-town-request-families` + `character-direction-assets` + `hero-clip-groups` | **GREEN** | 40 pass / 0 fail — **and 40/0 with Astra's unfixed declaration too** (F-SPRDR-7, guard gap) | — |
| `scripts/anim-pass-gen.test.mjs` + Astra's 12 other new guards | **10 pass / 3 fail** | `town-patrol-monument` (*newsie segment 5 enters the monument (0)*), `dispose-skeleton` (*Skeleton bone texture leaked, 0 !== 1*), `sprite-clip-fallback` (*2 !== 3*) | monument = **PRE-EXISTING main defect** (control fails identically); other two = **guards for src that is not in this branch** (F-SPRDR-4) |
| `scripts/law-pointer-guard.test.mjs` | **RED → GREEN after fix 2** | 2 POINTER DRIFTs from `scripts/fire.md`; 22 pass / 0 fail after reverting the two law files to main | **REGRESSION** (F-SPRDR-5) |
| **merged-tree engine hash** | **re-measured** | `computeEngineHash()` = **`e0fcfefbe14535dd6637966f0d940607024b7919783cce4abac3c09fc38abd1d`** — **absent from the era-5 pins**. Astra's declared top-level `e5c79549…` is its own tree's. Control: `09838c35…`, matching its declaration. | pin OWED at land (§5, fix 4) |
| e2e, port 5321, both projects, `--workers=1 --trace=off` | see §4 | | |

### First-town payload, group by group

| group | main (B) | merged (B) | delta |
| --- | ---: | ---: | ---: |
| hero | 4,590,285 | 5,285,305 | +695,020 |
| **cast** | **18,199,068** | **34,015,034** | **+15,815,966 (+86.9 %)** |
| plates | 4,815,078 | 5,032,000 | +216,922 |
| models | 3,918,764 | 3,918,764 | 0 |
| audio | 8,821 | 8,821 | 0 |
| code | 2,318,191 | 2,465,427 | +147,236 |
| document | 1,087 | 1,087 | 0 |
| **GATED TOTAL** | **33,851,294** | **50,726,438** | **+16,875,144** |

Largest movers (dist bytes per declared family):

| family | main | merged | delta |
| --- | ---: | ---: | ---: |
| char-youngster-m-sheet-walk8.png | 1,674,779 | 4,418,482 | +2,743,703 |
| char-youngster-f-sheet-walk8.png | 1,697,838 | 4,381,720 | +2,683,882 |
| char-storekeeper-sheet-walk8.png | 1,799,846 | 4,374,551 | +2,574,705 |
| char-tavernkeeper-sheet-walk8.png | 2,346,127 | 4,778,815 | +2,432,688 |
| char-newsie-mei-sheet-walk8.png | 1,518,573 | 3,765,969 | +2,247,396 |
| char-assay-clerk-sheet-walk8-a.png | 1,273,681 | 2,027,962 | +754,281 |
| char-schoolteacher-sheet-walk8-a.png | 1,265,989 | 1,994,668 | +728,679 |
| char-preacher-sheet-walk8-a.png | 1,089,959 | 1,807,904 | +717,945 |
| char-hero-sheet-walk8.png | 547,067 | 1,259,338 | +712,271 |
| char-elder-sheet-walk8.png | 4,083,354 | 4,391,203 | +307,849 |
| four NEW town idles | 0 | 586,888 | +586,888 |
| SpriteAnimator.js (chunk) | 135,360 | 277,272 | +141,912 |

**Why the bytes grew.** Same dimensions, same bit depth, same colour type (512×512 / bd8 / ct6, one IDAT) on both sides — the growth is content entropy, and the census names it: **partial-alpha pixel counts roughly double** on the rewritten walk sheets (youngster-f 20,793 → 38,022; tavernkeeper 18,817 → 35,010; youngster-m 21,962 → 36,874; hero walk8 18,365 → 21,115). Feathered cutout edges do not compress. A max-effort lossless re-compression pass (sharp, level 9, effort 10) measured on eight representative cells recovers **23.1 %** of the new bytes and still lands **29 % over main** — so re-compression alone does not bring the payload back inside the budget.

**Free bytes on the table: 3,277,125 B for zero visual change.** 93 families (93 cells: every full-bleed `townsfolk-*` era portrait, the four `boss-railcar-*` plates, `char-prospector-portrait.png`) are **pixel-identical to main** and merely re-encoded larger — `townsfolk-youngster-b.png` +113,203 B, the `townsfolk-clerk-e*` set +~49,000 B apiece. Eyes-on confirms they are the same images: `artifacts/drain-review-sprites-roster/contact-portraits-reencoded.png`.

## 3. The seven battery failures, read from the transcript

`GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` → **733 pass / 7 fail / 2 skip, 482.95 s**.

| # | test | cause | class |
| --- | --- | --- | --- |
| 1 | `bench-seeds.test.mjs:47 rotation registry stays outside the engine identity corpus` | measured `e0fcfefb…` vs pinned `e5c79549…` | **REGRESSION-BY-DESIGN**: the merged tree gets its own hash; one pin owed |
| 2 | `engine-era-guard.test.mjs:65 the landed registry names the live engine` | `engine hash e0fcfefb… is absent from era 5` | same cause as #1 |
| 3 | `fixture-teardown.test.mjs:24 all 139 fixture owners remove their temp directories` | its **child** `bench-seeds.test.mjs` failed for reason #1 | **KNOCK-ON of #1**, not a separate defect |
| 4 | `gate-caller-audit.test.mjs:937 POSITIVE CONTROL` | **`FAIL — 24 gate(s) with no caller and no recorded reason`**: all 19 new `scripts/*.test.mjs` plus 5 copies of test files buried in `artifacts/sol/**` | **REGRESSION** (F-SPRDR-6) |
| 5 | `goal-tracker.test.mjs:61 goal tree schema is valid` | `'b89f70c70'` does not match `/^[0-9a-f]{40}$/` in `tasks/goals.json` | **PRE-EXISTING** — control fails identically (main's own goal leaf carries a 9-char sha) |
| 6 | `law-pointer-guard.test.mjs:135 THE REAL TREE` | 2 POINTER DRIFTs from `scripts/fire.md` | **REGRESSION**, cured by fix 2 (F-SPRDR-5) |
| 7 | `node-guards-contention.test.mjs:124 contention is advisory…` | `node-guards board did not stay quiet for 300ms`; the run's own banner reads **`CONTENDED — 2 concurrent batteries`** | **ENVIRONMENT** — a sibling drain review was running its battery on this host at the same time |

## 4. e2e — classified
Two merged-tree batches and three control batches, port 5321, both projects, one worker (`artifacts/drain-review-sprites-roster/transcripts/e2e-batch{1,2}.log`, `e2e-control{1,2,3}.log`). Filled in attended from those transcripts after the reviewer was stopped.

| batch | result | reds | class |
| --- | --- | --- | --- |
| merged batch 1 | 74 passed / 4 failed (7.2 min) | `elder-walk8-woman.spec.ts:37` ("every Elder cell differs from the bearded sheet it replaces"), both projects — *measured minimum figure height* expected 296, received 297 | pin drift on the branch's own re-cut Elder sheet: the shortest cell is 1 px taller; the cells still differ from the bearded sheet (F-SPRDR-12) |
|  |  | `m1-01-claim-jumpers-death.spec.ts:83` (desktop, geometry growth on double restart); `m2-01-build-menu.spec.ts:178` (desktop, palisade footprint) | UNATTRIBUTED — no control row, not re-run single-worker; the branch has zero `src/` changes, so a sim cause is implausible and a load flake is likely; re-run at the split's own drain |
| merged batch 2 | 85 passed / 4 failed / 1 skipped (9.4 min) | `057-baron-rocket-cart.spec.ts:251`, both projects | PRE-EXISTING on main: fails on this drain's control (`e2e-control2.log`, desktop) and on the boss drain's control single-worker on both projects (the `blast-charge-arm` sound never starts) |
|  |  | `lane-baron-props-detail.spec.ts:7` (desktop) | load flake: green single-worker on a quiet box in the boss drain's re-run |
|  |  | `054-baron-epic.spec.ts:262` (mobile) | UNATTRIBUTED (no control row) |
| control 1 / 2 / 3 | 28 passed · 5 passed + 1 failed (057 desktop) · 12 passed | | |

### F-SPRDR-12 — the Elder walk8 height pin moves by one pixel on the re-cut sheet (non-blocking, 1 line at the split's drain)
`e2e/elder-walk8-woman.spec.ts:37` pins the sheet's minimum figure height at exactly 296; the branch's re-cut reads 297 on both projects. If the Elder cells land, re-measure and re-pin with the cause; if they are held, nothing to do.

## 5. Findings

### F-SPRDR-1 — the payload declaration names a family the build cannot emit (BLOCKING, fixed here, 1 line)
`assets/first-town-payload.json:59` declares `"townsfolk-newsie-e1.png"` in the plates group. Astra added the asset (`assets/processed/townsfolk-newsie-e1.png`, 355,216 B) and declared it "integrated" in `assets/layer-contracts/ui.v1.json` as slot `town-newsie-portrait`, but the branch has **zero src changes**, and the E1 newsie's portrait in `src/story/speakers.ts:122` is still `char-newsie-mei-sheet-walk8-r2c0.png`. Nothing imports the new file, so vite never emits it, so `scripts/first-town-payload.mjs` exits 1 and `scripts/deploy.sh` cannot measure the budget at all. **FIX APPLIED (1 line): removed the declaration row.** The asset and the raw stay on disk under the retention law, awaiting the wiring slice that belongs with them. The alternative fix (wire `newsiePortraitUrl` to it) is a `src/` change and outside this drain's firewall.

### F-SPRDR-2 — the first town is 15,726,438 B over its budget (BLOCKING, not fixable in a drain)
Numbers in §2. `scripts/deploy.sh:33` sets `BUDGET_LIMIT=35000000`; the merged tree declares 50,726,438 B. Three routes exist and all three are owner-level, not reviewer-level:
- **(a)** land the cells but not in the first town's gated groups — i.e. flip the cast group's `demandPaged`, which `scripts/first-town-payload.mjs`'s own header calls **"an OWNER FORK"**;
- **(b)** re-cut the five heavy walk8 sheets with a harder alpha (the feathering is what costs the bytes), which is a new art task;
- **(c)** raise the budget, which is an owner ruling about what a first-time player downloads.
A lossless re-compression pass is worth doing regardless (measured 23.1 % recovery) but does not on its own close a 15.7 MB gap.

### F-SPRDR-3 — 297 shipped cutouts were replaced outside the branch's own allowlist (BLOCKING)
`scripts/halo-reextraction-check.mjs` is green on main (`811 cured, 232 held, 32 regenerated-and-cured, 1400 scanned`). On the merged tree it fails twice over:
- the **denominator** moved 1400 → **2082** (+682, exactly the 682 PNGs Astra added to `assets/processed`) and Astra did not re-pin it, so the guard was red on the branch as committed. **FIX APPLIED (fix 3): re-pinned with the cause written in.**
- with the denominator right, **297 cells fail the alpha/opaque-RGB invariant**: `char-youngster-m-sheet-walk8` 32, `char-youngster-f-sheet-walk8` 32, `char-tavernkeeper-sheet-walk8` 32, `char-storekeeper-sheet-walk8` 32, `char-baron-sheet-walk8` 32, `char-hero-sheet-walk8` 24 (rows 0-2), `char-railtough-sheet-walkdiag4-a` 16, `char-preacher-sheet-walk8-a` 16, `char-newsie-mei-sheet-walk8` 16, `char-hero-sheet-walkdiag8` 16, `char-hero-elder-sheet-walk4-b` 16, `char-hero-elder-sheet-walk4-a` 16, `char-assay-clerk-sheet-walk8-a` 12, `char-schoolteacher-sheet-walk8-a` 4, `char-hero-silver-sheet-walk4-a` 1. Alpha deltas reach the full 255, i.e. these are **new cutouts, not despill**.

Astra's answer to this guard was to **narrow it**: `HELD_SHEETS` went from nine sheets to one, `expectedResidual` 232 → 0, and a new `isRegenerated()` predicate declares 92 cells (32 Elder + 8 teacher r2/r3 + 48 prospector r1/r2 + 4 clerk r2) as intentional replacements — while the diff also relaxed the invariant itself, permitting an opaque-RGB change within 3 px of alpha if it matches an exact saturated-key despill formula. The 297 above are cells the branch replaced that **its own narrowed allowlist does not name**. Re-pinning them to green would ratify the replacement of 297 shipped cutouts unseen; that is an owner call, and I did not make it. (`law-pointer --update ratifies rot`, the same lesson.)

### F-SPRDR-4 — the branch is the art half of a campaign whose src half is missing (BLOCKING for the tooling)
Four independent instruments, all measured:
1. `scripts/dispose-skeleton.test.mjs` asserts `disposeObject3D` releases a shared skeleton's bone texture — **`0 !== 1`**; `src/utils/dispose.ts` on this tree does not.
2. `scripts/sprite-clip-fallback.test.mjs` asserts three named functions exist in `src/assets/SpriteAnimator.ts` — **`2 !== 3`**; `grep -c "function validGroundContact"` is **0** on both the merged tree and the control.
3. `scripts/fire.md` + `scripts/law-pointer-baseline.json` re-point two citations from `Game.ts:2641-2642` → `2645-2647` and `_accounts.ts:87-90` → `96-99`. On this tree `Game.ts:2645` reads `collectGold: () => this.collectProspectorGold(),` and `_accounts.ts:96` reads `const emailHash = await sha256Hex(email);`. The old coordinates are the correct ones here — the new ones only exist in a tree with extra src lines.
4. `tasks/PROPOSED-sprite-source-assertions-20260908.md` says the E7/E8/E9 roster specs fail at a source-text assertion "because F-SPR-05 replaced the shared mutable animator with per-body ownership" — a src change that is not in this branch (measured in §4).

### F-SPRDR-4b — 20 new families are staged but wired to nothing, and half of them ship anyway (non-blocking, 8.1 MB)
Twelve new replacement families (`char-hero-sheet-work8-{south-clean-v7,west-recovered-v1,north-clean-v1,east-clean-v1}`, `char-hero-sheet-attack8-r2-east-clean-v1`, `char-baron-{ne,w}-clean-v2`, `char-baron-walk4-diagonal-v2`, `char-{coalthief,railtough,steamwrecker}-north4-v2`, `char-thief-se-finish-v2`) plus the eight `char-thief-se-f*` frames have **zero references in `src/`** — 95 source cells, 16,079,100 B on disk. Because `vite.config.ts` globs `assets/processed/char-*.png` with era filters rather than importing each sheet, **40 of those cells (8,143,588 B) are nonetheless emitted into the release `dist/`**. They are outside the first town's gated groups so they do not move the budget, but they are bundle weight for art nothing renders — the same missing-src-half symptom, and the reason this material should travel with its wiring slice rather than ahead of it.

### F-SPRDR-5 — the branch edits the fires' law file, and the edit is wrong here (fixed here, 2 files)
`scripts/fire.md` is out of a sprite roster's scope by any reading, and its two re-pointed citations are provably stale against this tree (F-SPRDR-4.3), so `scripts/law-pointer-guard.test.mjs` goes red — a law that manufactures a false accusation. **FIX APPLIED (fix 2): `git checkout 27227acdc -- scripts/fire.md scripts/law-pointer-baseline.json`.** The guard then passes 22/0. Reverse with one word if the src half ever lands and the coordinates become true.

### F-SPRDR-6 — nineteen new guards, and nothing calls any of them (BLOCKING for the tooling)
`gate-caller-audit.test.mjs`: **`FAIL — 24 gate(s) with no caller and no recorded reason`**. Nineteen are the new `scripts/*.test.mjs` files (`anim-pass-gen`, `anim-pass-graft`, `anim-pass-grid`, `anim-pass-montage`, `deshadow-key`, `despill-cutout`, `dispose-skeleton`, `grid-centres`, `grid-origin`, `master-repair-check`, `review-account-creation`, `review-mixed-hashes`, `review-party-retention`, `review-save-names`, `review-terminal-views`, `review-wrecked-turrets`, `rgba-resample`, `sprite-clip-fallback`, `town-patrol-monument`). Five more are **copies of test files inside `artifacts/sol/**` evidence trees**, which the audit reads as real gates. The repo's own message on this is the right one: *"A gate nothing calls is an unread verdict"*. Cure: root them in `test:node-guards` (or `run-guards.mjs`), and keep test-shaped files out of evidence directories.

### F-SPRDR-7 — the node battery cannot see a broken payload declaration (guard gap, corrective owed)
With Astra's declaration exactly as committed, `deploy-budget.test.mjs`, `first-town-request-families.test.mjs`, `character-direction-assets.test.mjs` and `hero-clip-groups.test.mjs` pass **40 / 0** — while `scripts/first-town-payload.mjs`, the thing `scripts/deploy.sh` actually runs, exits 1. The declaration's cross-checks compare it against the town's *sources*, never against the *build*. A corrective should root a build-backed payload assertion so this class reds before the deploy door, not at it.

### F-SPRDR-8 — the branch overwrites 58 tracked evidence files from past drains (non-blocking, owner's eye)
Astra's runs rewrote screenshots and perf tables belonging to earlier merges: `artifacts/058/webkit-perf-table.json`, `artifacts/fevered-tell/*-report.json`, `artifacts/run-gait-stride/*-metrics.json`, and 50-odd PNGs under `artifacts/{e3-crawler-boss,e4-landyacht-boss,eight-winds-hero,hero-poses,lane-roster-wiring-e7-01,run-scene-animation-refresh,wire-crawler-3d}` plus `reviews/shots-town-cast` and `reviews/shots-elder-walk8-regeneration`. Under the retention law that is not deletion, and git keeps every version, but those files are the *evidence a past gate was green*; overwriting them silently is how a later reader loses the record. Worth a ruling on whether re-runs may overwrite retained evidence or must write beside it (the repo already has `GR_REFRESH_EVIDENCE=1` for exactly this, landed s2553).

### F-SPRDR-9 — `artifacts/sol/**` makes main unpushable (BLOCKING for any land that includes it)
`origin` is `git@github.com:Agent-Town/GoldRush.git` and `origin/main` is live. The branch adds **24.58 GB in 43,778 files**, including **38 `trace.zip` blobs totalling 2.77 GB**, of which **16 exceed 50 MB** and **9 exceed GitHub's 100 MB hard per-file limit** (largest 413.6 MB, `artifacts/sol/sprite-roster-fixes-20260908/town-newsie-route/baseline-test-results/…/trace.zip`). Merging this into main as-is would make main unpushable and break the backup law. The BACKLOG already records the intent to keep this tree local; the land must make that explicit — strip the trace.zips at minimum, and decide deliberately whether `artifacts/sol/**` enters main at all or stays on its retention branch.

### F-SPRDR-10 — the hero's ELDER age variant is recoloured gold (BLOCKING art defect)
`char-hero-elder-sheet-walk4-a` and `-b`, all 32 cells: main's elder prospector wears a pale weathered tan coat; the merged cells are a **saturated marigold yellow** across coat, trousers, hat band and boots, with a quilted texture. Eyes-on: `artifacts/drain-review-sprites-roster/contact-hero-elder-yellow.png`. The figure also shrinks: tallest figure **411 → 353 px (−14 %)** and the ground line rises **460 → 432**. `char-hero-silver-sheet-walk4-a` moves too (412 → 378 px, bottom 461 → 444) though its colour holds. Nothing in `roster-ledger.md` or the findings file claims a recolour of the aged hero, and no owner ruling authorises one; the aging ladder now reads tan (young) → tan (midlife) → tan (silver) → **gold** (elder). These two sheets should not land.

### F-SPRDR-11 — the LEDGER entry is prose, not a row, and it understates the batch (non-blocking)
Astra appended 326 lines of `###` prose sections below the numbered table, which stops at row 79. The prose states "334 shipped cells and 166 masters changed"; the committed tree changes **1,273 modified + 682 added** processed PNGs and **460** processed-full PNGs. `assets/master-divergent.json` tells the same story: the findings file says "all 198 are byte-pinned", the committed file holds **420** cell entries (26 → 420, and all 26 pre-existing entries rewritten). The narrative was written mid-campaign and the campaign kept going; CLAUDE.md §6 wants the row and the event in one commit.

## 6. Fixes applied in this review (all named, all under 20 lines)

| # | file | change | guard that names it |
| --- | --- | --- | --- |
| 1 | `assets/first-town-payload.json:59` | removed `"townsfolk-newsie-e1.png"` (1 line) | `scripts/first-town-payload.mjs` (rc 1 → 0) |
| 2 | `scripts/fire.md`, `scripts/law-pointer-baseline.json` | reverted to `27227acdc` (2 citations, 16 baseline leaves) | `scripts/law-pointer-guard.test.mjs` (RED → 22/0) |
| 3 | `scripts/halo-reextraction-check.mjs:95` | denominator 1400 → 2082 with the measured cause written in (10 lines of comment + 1 of code) | `scripts/halo-reextraction-check.mjs` itself |

**Fix 4 is OWED, not applied**: the merged tree's engine hash `e0fcfefbe14535dd6637966f0d940607024b7919783cce4abac3c09fc38abd1d` needs one appended era-5 pin with its cause. The firewall allows a measured pin "only if LAND"; this verdict is SPLIT, so the pin belongs to whoever lands whichever half. Note also that the merge brings **108 pins Astra minted for its own trees** (85 → 193) and grows `assets/engine-era.json` from 46,852 B to 83,085 B — and that file is bundled into the release JS, so those causes ship.

## 7. Recommended split

**Land now (independent of the budget):**
- the scripts and the extractor work, **once F-SPRDR-6 is answered** (root the 19 guards, drop the 5 evidence copies) and the three src-dependent guards are held back with the src half (`dispose-skeleton`, `sprite-clip-fallback`, and the `fire.md`/baseline re-point already reverted);
- `scripts/town-patrol-monument.test.mjs` as a **documented red** with a corrective task for the newsie loop — it found a real pre-existing bug in main's town data;
- the LEDGER prose, the four `reviews/sol-findings-*.md`, `tasks/PROPOSED-sprite-source-assertions-20260908.md`;
- the E6-E9 enemy families, the bandits and the Baron sheets — none are in the first town's payload, all are visually identical or better, and the Baron's pale halo cure is visible.

**Hold for an owner ruling:**
- the five heavy town-cast walk8 sheets (F-SPRDR-2), with the demandPaged fork stated as the owner's choice;
- the 297 replaced cutouts (F-SPRDR-3);
- `char-hero-elder-sheet-walk4-{a,b}` and `char-hero-silver-sheet-walk4-a` (F-SPRDR-10) — do not land;
- `artifacts/sol/**` (F-SPRDR-9) — decide local-only vs stripped-and-landed.

**Owed regardless:** a lossless re-compression pass over the 93 pixel-identical re-encoded files (3,277,125 B back for nothing), and the payload-vs-build guard of F-SPRDR-7.
