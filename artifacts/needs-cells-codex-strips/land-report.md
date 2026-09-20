# needs-cells-codex-strips — the landing report

**Task** `tasks/needs-cells-codex-strips-land.md` · **branch** `art/needs-cells-codex-strips-land` · **base** `21648cdcf` · **implementer** Claude Opus 5 in a scratch worktree, Node 26, dev server 5305 · **date** 2026-09-19

## Verdict

**SIX OF SEVEN ROWS LAND AND ARE WIRED. ONE PARKS.** The Claim Jumper's `s`, `e`, `se`, `sw`, `ne` and `nw` are re-extracted from the **native 1254×1254 Codex renders** to the band the live family actually occupies, and registered in `char.claim_jumper.walk4`; all eight of that slot's winds are now per-direction plates. The Steam Wrecker's `se` parks a **fourth** time — but on a **new** reason, the heading, with both of its historical blockers measured and gone.

Two inherited claims were checked rather than believed, and both turned out to be wrong. They are the two findings that matter here.

---

## 1. The seven row verdicts

Extraction, identical for all seven but for `--scale`:
`node scripts/extract-alpha.mjs --key ff00ff --tol 26 --feather 14 --grid 2x2 --cell <256|512> --scale <s>`, after `clean-plate.mjs` swept the plate.

| row | src | scale | heights px | mean | spread | footY range | band | in band | verdict |
|---|---|---:|---|---:|---:|---:|---|---|---|
| **Steam Wrecker `se`** | native 1254² | 0.8881 | 240 / 234 / 244 / 252 | 242.5 | 18 | 9 | 228–252 @512 | 4/4 | **PARKED** — heading (F-NCS-4) |
| Claim Jumper `s` | native 1254² | 0.3852 | 164 / 160 / 166 / 172 | 165.5 | 12 | 6 | 156–176 @256 | 4/4 | **LANDED + WIRED** |
| Claim Jumper `e` | native 1254² | 0.4368 | 166 / 164 / 166 / 166 | 165.5 | 2 | 1 | 156–176 | 4/4 | **LANDED + WIRED** |
| Claim Jumper `se` | native 1254² | 0.4249 | 164 / 158 / 162 / 176 | 165.0 | 18 | 9 | 156–176 | 4/4 | **LANDED + WIRED** |
| Claim Jumper `sw` | native 1254² | 0.4223 | 166 / 160 / 168 / 170 | 166.0 | 10 | 5 | 156–176 | 4/4 | **LANDED + WIRED** |
| Claim Jumper `ne` | native 1254² | 0.4197 | 166 / 162 / 168 / 168 | 166.0 | 6 | 3 | 156–176 | 4/4 | **LANDED + WIRED** |
| Claim Jumper `nw` | native 1254² | 0.4110 | 164 / 159 / 166 / 170 | 164.8 | 11 | 5 | 156–176 | 4/4 | **LANDED + WIRED** |

**The Steam Wrecker's four lamp reads: 162 / 168 / 147 / 153 px** of largest connected saturated-orange blob — every one above the 90-px bar, and the first time this row has held its lamp across all four cells. The lamp is no longer why it parks.

**Cross-row uniformity (the s37 anti-size-pop law).** The six landed means span **164.8–166.0 px, a 1.2-px spread**, against live per-row means of 160.0–171.0. No row pops against any neighbour.

**No mirrors.** Minimum flip-compare MAE per row, foreground union: `s` 42.96, `e` 44.46, `se` 47.02, `sw` 48.18, `ne` 45.36, `nw` 47.28, wrecker `se` 50.20 — all at or above the live family's own range (jumper 30.76–44.06, wrecker 38.92–58.54).

**Halo.** 1,343,175 px across the 24 landed cells carry alpha < 250 and **0** of them carry magenta-dominant RGB (`r ≥ 180 && b ≥ 180 && g ≤ 90`); worst single cell 0 px.

**Field purity, before and after.** Measured on the plates that produced the cells:

| row | literal `#ff00ff` on the plate | near-magenta | keyed by the extractor |
|---|---:|---:|---|
| wrecker `se` | 22 px (0.001 %) | 1,425,624 px (90.66 %) | ~81 % of the sheet, then despill + alpha bleed |
| jumper `s`…`nw` | 20–48 px (0.001–0.003 %) | 1,325,274–1,354,049 px (84.28–86.11 %) | same |

This is F-2627-4's lesson with a number on it: the generator parked all seven sheets partly on *literal* `#ff00ff` purity, a bar its own renders miss by **four orders of magnitude** — and one the keyer was never asked to care about. The `clean-plate` sweep removed **0–1 px** of detached speck per plate, so nothing about these plates needed repair; the field was always the extractor's job.

**No letters, no firearms, no gore**: eyes-on at 250–380 px per cell on `after/jumper-compass.png`, `after/jumper-heading-zoom.png`, `after/wrecker-heading-zoom.png`, `after/{jumper,wrecker}-family-after.png`.

---

## 2. F-NCS-1 — the five rows that had already landed were scaled to a band that no longer existed

The s2627 drain landed five of these rows on 2026-09-18 and measured their band from **`char-jumper-sheet-walk4-b` rows 0 and 2**, calling them "the two rows this batch was told to match" at 146–156 px.

Those two rows had **already been replaced**. The 2026-09-18 Higgsfield batch wired `n` to `char-jumper-north4-v1` and `w` to `char-jumper-west4-v1` in the same contract, and said so in its own note. Measured on the rows `char.claim_jumper.walk4` actually names today:

| live row | source | heights px @256 | % of cell |
|---|---|---|---|
| `s` | sheet-walk4-a r0 | 170 / 170 / 166 / 166 | 64.84–66.41 |
| `se` | sheet-walk4-a r1 | 164 / 164 / 162 / 162 | 63.28–64.06 |
| `e` | sheet-walk4-a r2 | 164 / 162 / 158 / 156 | 60.94–64.06 |
| `ne` | sheet-walk4-a r3 | 176 / 172 / 172 / 168 | 65.63–68.75 |
| `n` | **north4-v1** | 170 / 164 / 165 / 160 | 62.50–66.41 |
| `w` | **west4-v1** | 172 / 168 / 164 / 158 | 61.72–67.19 |
| `nw` | sheet-walk4-b r1 | 150 / 148 / 139 / 144 | 54.30–58.59 |
| `sw` | sheet-walk4-b r3 | 146 / 144 / 146 / 144 | 56.25–57.03 |

The live in-family band is **156–176 px**, not 146–156 — and the two rows below it are exactly the sheet-b `nw`/`sw` the previous batch recorded as out of band and left out of scope. The 20 cells s2627 landed measured **146–158 px**: 10–15 px short of every cardinal, a size-pop against the s37 law, sized to match two rows that had been superseded the day before.

The master's stated band of 156–174 was right and the drain's measured band was wrong. **All 20 cells are re-extracted here**; the six rows now sit at 158–176.

*Reusable:* "measure the band from the landed references, not from the task" is a good rule that failed on a subtlety — the *references* a generation prompt used are not necessarily the rows the *contract* names by the time the cells are processed. Read the contract, not the prompt's reference list.

---

## 3. F-NCS-2 — the halo guard has been red on clean main since 2026-09-18

`assert.equal(current.scanned, …)` pins the number of PNGs under `assets/processed`. Measured with `git ls-tree -r <sha> --name-only assets/processed | grep -c '\.png$'`:

| tree | PNGs | pin at that commit |
|---|---:|---:|
| needs-cells-art-batch merge `1b9dbc234` | 2103 | 2103 ✓ |
| `4550c3ae9^` (just before the codex-strips commit) | 2103 | 2103 ✓ |
| `4550c3ae9` (the s2627 landing) | **2123** | **2103 ✗** |
| my base `21648cdcf` | **2123** | **2103 ✗** |
| this tree | 2127 | 2127 ✓ |

The s2627 drain landed twenty cells without moving the denominator with them, so `node scripts/halo-reextraction-check.mjs` — and therefore `npm run test:node-guards` — has carried this red on clean main for a day. Re-pinned here to 2127, of which **only 4 are mine** (the `se` row). Named in the pin comment rather than silently absorbed, on F-SRR-3's rule: *a re-pin that quietly absorbs someone else's red is how a guard stops being a guard.*

Guard after: **PASS — 379 cured / 0 held / 696 regenerated-and-cured / 2127 scanned**; the three partition pins do not move (the six stems are new, so none appears in the BASE sweep).

---

## 4. F-NCS-3 — the Steam Wrecker's south-east: the scale blocker never existed

F-2627-1 parked this row on scale and concluded:

> "A 1024 sheet on a 2×2 grid gives 512 px of source per cell and **the native 1254 take was normalised away, so there is no resolution left to spend.** Cure: regenerate at a larger native cell (the rotation2 pattern), not another 1024 2×2 sheet."

**The native takes were not normalised away.** All 21 generations of 2026-09-18 are still on disk at `/Users/robin/.codex/generated_images/01a0b4cb-d356-7383-89ea-0652f226528d/`, at **1254×1254**, under exactly the `exec-*` identifiers the run-note tabulates. The sheets in `artifacts/` are lossy lanczos3 downscales of them; the originals outlive the downscale.

Extracting the selected take (`exec-77e2ae3a`) from the native render:

| | s2627, from the 1024 sheet | here, from the native 1254 |
|---|---|---|
| scale | 1.0 — the cap, an **upscale** of ×1.079 was needed | **0.8881 — a downscale** |
| heights | 216 / 220 / 224 / 230 px | **240 / 234 / 244 / 252 px** |
| band 228–252 | 0 of 4 in band | **4 of 4 in band** |
| lamp | 137 / 141 / 115 / 129 px | 162 / 168 / 147 / 153 px |

No upscale, no change to `extract-alpha`, no law change, and no "larger native cell" regeneration. **The never-upscale house law was never in tension with this row** — the pipeline was simply pointed at the wrong copy of the art.

This also answers the three options the coordinator put to me. (a) "accept the row 6–8 % under the band" is moot: it is not under the band. (b) "park with a changed-premise regeneration note" is still the outcome, but for a different reason and with a much cheaper cure. (c) "a bounded-upscale law change" is **not needed and should not be raised with the owner** — nothing here asks for it.

*Reusable:* before concluding that a source has no resolution left, look for the generator's own cache. A normalisation step that writes a smaller file does not destroy the larger one.

---

## 5. F-NCS-4 — why the Steam Wrecker's `se` parks anyway: both takes turn the machine the wrong way

With the lamp passing and the scale dissolved, the row was measured on the family's own facing signal — **LEDGER row 65's amber porthole**, extended from "is it lit" to "where is it". The porthole is on the machine's front face, so its centroid moves with the heading. Reported as (lamp centroid x − silhouette centre x) ÷ silhouette width, in per cent; negative = screen-left.

**Calibration on the live rows** (this is what makes it an instrument and not an opinion):

| live row | lamp offset, 4 cells | mean |
|---|---|---:|
| `w` (travels left) | −9.8 / −9.8 / −9.4 / −11.7 | **−10.2 %** |
| `sw` (left, toward viewer) | −2.3 / −4.1 / −4.3 / −9.3 | **−5.0 %** |
| `s` (head-on) | 0 / −1.5 / +0.7 / −1.4 | **−0.6 %** |
| `e` (travels right) | +18.4 / +19.1 / +18.3 / +18.6 | **+18.6 %** |

The lamp tracks the heading monotonically, and a 45° turn gives about half a 90° turn's offset. **A true south-east must therefore read about +9 %.**

| candidate | lamp offset, 4 cells | mean | reads as |
|---|---|---:|---|
| selected take `exec-77e2ae3a` | −6.3 / −7.5 / −4.5 / −8.4 | **−6.7 %** | a **south-west**, indistinguishable from the landed `sw` row |
| rejected scale-retake `exec-e4c2acae` | −9.4 / −10.4 / −9.6 / −7.6 | **−9.3 %** | a **west** |

Eyes-on agrees: in `after/wrecker-heading-zoom.png` the candidate and the landed `sw` carry the lamp on the same side of the boiler, the teal panel on the same side, and the near wrench reaching the same way.

**So the alias is kept.** Today `se` aliases to `e` — a 90° heading standing in for 45°, on the correct side of the compass. The candidate is 90° wrong on the *wrong* side and would put two visually identical westward turns in opposite compass slots. Reject-don't-stretch (CLAUDE.md §5 Mistake #14).

**Cure, now cheap and specific:** one regeneration of the `wrecker-se` prompt with the heading corrected — the `WRECKER_SE` component says "toward the RIGHT edge" and the model rendered left both times, so it needs the proof-of-turn clause the `HALFWAY` mode carries ("the silhouette is visibly ASYMMETRIC … one side clearly nearer the camera"), stated with an explicit *right*. Extract from the **native** render, not a 1024 normalisation. Both candidate plates are kept at `artifacts/needs-cells-codex-strips/native/` so the next take can be flip-compared against them.

This is also F-EW-5's class returning a third time: a facing that reads plausible to the eye and fails on the family's own measured signal. The scale bar hid it — s2627 stopped at scale and never measured which way the machine was pointing.

---

## 6. Item 4 — the dormant slot: which body should resolve `char.claim_jumper`, and why it stopped

**Runtime confirmation first.** A plain boot of `?debug&nowaves&nolevel` reports `window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations` = `char.hero`, `char.bandit_base`, `char.bandit_thief`, `char.e2.rail_tough`, `char.e2.steam_wrecker`, `char.e2.coal_thief`, `char.prospector_agent`. **`char.claim_jumper` is not among them.** Nothing animates the slot.

**Which body should resolve it: the base enemy body in `EnemyPool`.** Every fossil in the code says so and only the slot id disagrees:

| site | what it says |
|---|---|
| `src/entities/pools.ts:413` | `new GeneratedSpriteBatch(assetSlots.charBanditBase, …, { name: '**GeneratedClaimJumperSprites**' })` |
| `src/entities/pools.ts:420` | the same, `name: 'GeneratedClaimJumperSpriteFades'` |
| `src/entities/pools.ts:1138` | `const slotId = variant?.slotId ?? (baron ? charBaron : enemy.isThief ? charBanditThief : **charBanditBase**)` — the fallback branch |
| `src/entities/pools.ts:544` | `void loadRuntimeSlot(assetSlots.charBanditBase)` |
| the entity type | `ClaimJumperEnemy`; the disposer is `disposeClaimJumperAssets` |
| `src/assets/SpriteAnimator.ts:797` | still gives `char.claim_jumper` the **enemy** walk speed |
| `src/assets/generated.ts:232` | still lists `char.claim_jumper` as a **critical startup asset slot** |

The base enemy family is the Claim Jumper by name, by type and by lore; only its texture source was moved.

**Why it stopped: `0f5fb77e8` — "runner(lane-d): wire-e1-bandit-variants.md", 2026-07-12.** An **E1 roster change**, the master's second hypothesis. That one commit swapped six construction sites in `pools.ts` from `assetSlots.charClaimJumper` to `charBanditBase` / `charBanditThief`, added both bandit slots to `slots.ts` and `generated.ts`, and moved the encyclopedia entry. The E1 outlaw trio (base / thief / baron) took over the body art; the Claim Jumper kept its name on the batches, its entity type, its speed rule and its startup-critical status, and lost its pictures. Not a rename, not the sim, not `bandit_*` "taking its place" by drift — one wiring commit, dated and named.

**PARKED, with the diff proposed — it is not a one-line render-side mapping.** Waking it means repointing the base enemy batch, which changes **which body the player fights in every E1 map**, plus the replay reel at `src/world/LanternWorldStage.ts:25` (`claim_jumper: assetSlots.charBanditBase`). That is an E1 roster and art-direction decision, and CLAUDE.md §7.3 puts it on the owner's desk. The exact diff, four sites in two files:

```diff
--- a/src/entities/pools.ts
@@ -413 +413 @@
-  private readonly generatedSprites = new GeneratedSpriteBatch(assetSlots.charBanditBase, Balance.enemy.poolSize, {
+  private readonly generatedSprites = new GeneratedSpriteBatch(assetSlots.charClaimJumper, Balance.enemy.poolSize, {
@@ -420 +420 @@
-  private readonly generatedSpriteFades = new GeneratedSpriteBatch(assetSlots.charBanditBase, Balance.enemy.poolSize, {
+  private readonly generatedSpriteFades = new GeneratedSpriteBatch(assetSlots.charClaimJumper, Balance.enemy.poolSize, {
@@ -544 +544 @@
-    void loadRuntimeSlot(assetSlots.charBanditBase);
+    void loadRuntimeSlot(assetSlots.charClaimJumper);
@@ -1138 +1138 @@
-  const slotId = variant?.slotId ?? (baron ? assetSlots.charBaron : enemy.isThief ? assetSlots.charBanditThief : assetSlots.charBanditBase);
+  const slotId = variant?.slotId ?? (baron ? assetSlots.charBaron : enemy.isThief ? assetSlots.charBanditThief : assetSlots.charClaimJumper);
--- a/src/world/LanternWorldStage.ts
@@ -25 +25 @@
-  claim_jumper: assetSlots.charBanditBase, thief: …
+  claim_jumper: assetSlots.charClaimJumper, thief: …
```

Prove it with the batch's `direction-probe.mjs` reading `animator.currentFrame.key` for all eight headings; the slot is now ready for that probe, which it was not before — **all eight winds resolve to real per-direction plates in one band** for the first time.

**F-NCS-6 — a second gate, found by reading the resolver rather than assuming: `walk8` shadows `walk4` for this slot.** `SpriteAnimator.pickWalkSheet` (`src/assets/SpriteAnimator.ts:1242-1245`) is:

```ts
const walk8 = slot?.walk8;
if (walkSheetEnabled(walk8) && walkSheetHasProcessedCells(walk8)) return walk8;
const walk4 = slot?.walk4;
return walk4 && walk4.status !== 'RUNTIME-DORMANT' && walk4.enabled !== false ? walk4 : null;
```

`char.claim_jumper.walk8` is `status: ACTIVE`, `enabled: true`, and all **32** of its `char-jumper-sheet-walk8` cells are present, so `walk8` wins. **Repointing the body alone would therefore draw the walk8 production sheet — whose own note says its diagonals alias to the side rows because it is a 4-direction sheet — and not these six plates.** Waking the slot properly is two decisions, not one: *which body resolves it* (the diff above) and *which block that body reads* (disable `walk8`, or give it real 8-frame diagonals). This is not a regression introduced here — the `n` and `w` rows the 2026-09-18 batch wired sit behind the same gate — but it means these cells are placeholder-first art **twice over**, which is why landing them costs nothing and risks nothing.

Two things are now true that were not on 2026-09-18, and both were blockers the old notes named:
* the `walk4` block no longer has an out-of-band row (sheet-b's `nw`/`sw` at 139–150 px are gone), and
* the `rotations` note's **SCALE DEBT** ("figures 296–331 px vs side-sheet walk 409–439 … upscaling is refused") is answered for `walk4` the way that note says it must be — by new art at the right size, not by a runtime fudge.

So the owner's question is narrow and cosmetic: *should the E1 base enemy look like the Claim Jumper again, or stay a bandit?* Reversible with one word either way.

---

## 7. Gates

| gate | result |
|---|---|
| `npx tsc --noEmit` | rc=0, no output |
| `npm run build` | rc=0 |
| `GR_RELEASE=e1 npm run build` | rc=0 |
| `node scripts/first-town-payload.mjs` | **34,644,278 B** of 52,000,000 (+2,988 B — a net swap of six sheet rows for six plates) |
| `node scripts/halo-reextraction-check.mjs` | **PASS 379 / 0 / 696 / 2127** at the new pin |
| `scripts/character-direction-assets.test.mjs` | 2/2 |
| `scripts/hero-clip-groups.test.mjs` | rc=0 |
| `scripts/review-sprite-idle.mjs` | rc=0 |
| `scripts/review-enemy-sprites.mjs` | **rc=1, PRE-EXISTING** — see below |
| engine hash | `cc3fd5d45add762f…` → **`674fdceadb56aa01…`** (`assets/layer-contracts` is in `ENGINE_SOURCE_INPUTS`; the pin is the drain's) |

**`review-enemy-sprites.mjs` red, attributed.** It times out at its own line 14, `waitForFunction(… spriteAnimations['char.hero'].loaded)`. A direct probe shows the hero sitting at `{clip:'idle', frameKey:'pending', frameCount:0, loaded:false}` after 20 s with **0 console and 0 page errors** — and the identical probe **reproduces on a control tree restored to the base `21648cdcf`** (`assets/processed`, `assets/raw` and `assets/layer-contracts/characters.v2.json` all reverted). Not mine; the hero's sheet does not finish loading under `?debug&nowaves&nolevel` on this tree either way.

E2E, plain boots and the node-guards battery: see §8.

---

## 8. E2E, plain boots, and the attribution of every red

**E2E, four specs, both projects, `--workers=1`, against my own server on 5305:**

| tree | result |
|---|---|
| **branch** `c55e987e3` | **17 failed / 32 passed / 3 skipped (8.6 m)** |
| **control, base `21648cdcf`** (`assets/processed`, `assets/raw` and `characters.v2.json` reverted in place, same server, same command) | **16 failed / 33 passed / 3 skipped (8.3 m)** |

**The two failure sets are identical but for one row.** Sorted and diffed by `project › spec:line › title`, every one of the control's 16 appears on the branch, and the branch carries exactly one more:

`[mobile-chrome] › e2e/e1-baron.spec.ts:489:1 › wave 20 spawns the Baron with elite stats, banner, escorts, and stable seed data`

**That one re-runs GREEN on the branch tree** — `npx playwright test e2e/e1-baron.spec.ts:489 --project=mobile-chrome`, rc=0, **1 passed (15.6 s)** — against the 30 s timeout it blew in the battery. `node scripts/red-inventory-lookup.mjs e2e/e1-baron.spec.ts` also carries this exact title at `:489` as a KNOWN-RED timeout row in BOTH projects (52.2 s / 54.2 s at inventory time). Membership is not exoneration (F-1444-2) — the green re-run is, and the inventory row is corroboration on top of it. A load flake: the battery ran on a machine also serving a dev server.

**So: zero new reds.** The 16 reproduced reds are the F-OMA-5 Hill Mine rows (`:75`, `:184`, `:250`, both projects), the `e2-hill-mine:131` render-descriptor row, the two `e2-enemies` rows (`:113`, `:314`), `e1-baron:411`, and `eight-winds-enemies:39` — all in the inventory and all reproduced on the base tree in this session, not merely looked up. The inventory's own snapshot is **39 days stale (threshold 7)**, which is precisely why the control run was done rather than trusted away.

Nothing in the 17 touches `char.claim_jumper`: `eight-winds-enemies` exercises the bandit, thief and Baron walkdiag rows, and the spec contains no reference to the jumper at all.

**Plain boots, 0 errors everywhere** (`boot-probe.mjs`, 9 s settle, screenshots in `artifacts/needs-cells-codex-strips/boot/`):

| scene | desktop 1280×800 | mobile 390×844 |
|---|---|---|
| town | 0 console / 0 page / 0 failed requests | 0 / 0 / 0 |
| `e1-baron` | 0 / 0 / 0 | 0 / 0 / 0 |
| `e2-hill-mine` | 0 / 0 / 0 | 0 / 0 / 0 |

**E2E screenshot churn** (18 tracked `.png` under `artifacts/{baron-presence,e2-enemies,e2-hill-mine,eight-winds-enemies,hill-mine-relief}/`) restored by name with `git diff --name-only -- artifacts | grep '\.png$' | xargs git checkout --`, never a blanket checkout of `artifacts/**` — F-NCB-8's narrowing, which matters here because this branch's own boards and native plates live under `artifacts/` too.

---

## 9. The node-guards battery — three reds, one root cause, and it is the drain's pin

`GR_GUARD_NO_ARTIFACT=1 node scripts/run-guards.mjs --changed-since 21648cdcf` resolves to the **base gate only** (129 files changed, no path rule matched): `test:node-guards`, `test:power-budget`, `test:task-guards`, `test:citations`, `test:gate-callers`.

**`guards: 3/5 passed — RED: test:node-guards, test:power-budget`** (`test:node-guards` rc=1 in 502 s).

`run-guards` prints only the last 20 lines of a failing suite, which showed a contention assertion and hid everything above it — the exact trap this repo has hit before. Re-running with the full transcript captured (`node-guards-full.log`, 2,642 lines) surfaces **three** `✖` rows, and running each guard alone shows they are **one root cause**:

| guard | failure | cause |
|---|---|---|
| `scripts/bench-seeds.test.mjs:47` | `rotation registry stays outside the engine identity corpus` | `assert.equal(await computeEngineHash(root), engine-era.json.engineHash)` — got `674fdcea…`, expected `cc3fd5d4…` |
| `scripts/engine-era-guard.test.mjs:65` | `the landed registry names the live engine and stays outside its hash corpus` | *"engine hash `674fdcea…` is absent from era 6; append a same-era pin with its cause"* |
| `scripts/fixture-teardown.test.mjs:32` | `all 151 scripts/*.test.mjs fixture owners remove their temp directories` | **a nested child failure**: `scripts/bench-seeds.test.mjs child failed` with the same assertion. Not an independent red. |

**All three are the expected, task-scoped consequence of a lawful edit.** `assets/layer-contracts` is in `ENGINE_SOURCE_INPUTS`, so registering six directions and two notes moves the engine hash; `assets/engine-era.json` declares `engineHash: cc3fd5d4…`, which is exactly this branch's **base** hash, so the guards are **green at base and red here for no other reason**. The cure is the one the guard prints itself — append a same-era pin — and it is **the drain's act, not mine**: `assets/engine-era.json` is in this task's NO list and the master says "the pin is the drain's". Era 6 currently holds **11 pins**; the drain appends **#12** at `674fdceadb56aa01…`. The 2026-09-18 batch did precisely this (pin #10, "the character layer contract is in the corpus").

**`test:power-budget` red is environmental — green on three consecutive re-runs alone.** In the contended battery: `p95=0.672ms cap=0.500ms verdict=FAIL`. Alone: **0.356 / 0.381 / 0.369 ms, PASS, PASS, PASS**, rc=0 each time.

**The contention assertion is self-declaring.** `scripts/node-guards-contention.test.mjs:124` failed with *"node-guards board did not stay quiet for 300ms"*, and the transcript prints **`CONTENDED — 4 concurrent batteries`** twice. This machine is shared with other agents and a Codex lane; the guard was measuring them.

The later full-transcript run of `npm run test:node-guards` was stopped after its log went 21 minutes idle inside `fixture-teardown`'s 151-child sweep — a slow sweep under load, not a new failure; its three `✖` rows are the table above, and each was reproduced by running the guard alone on a quiet machine.

**Green in the same gate:** `test:task-guards` rc=0 · `test:citations` rc=0 (3 s) · `test:gate-callers` rc=0.
