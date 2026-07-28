# THE EIGHT WINDS — wiring spec
### status: DRAFT for a code slice · written 2026-07-28 by the attended Opus 5 art session on `anim/opus5-pass` · this file is the code slice's READ-FIRST

**Owner directive (2026-07-28, verbatim):** *"can we extend the walking animations from four directions to 8 to also cover the diagonal directions? I think that will add to the quality of the game. Can you task Opus 5 to work with GPT Image 2.0 and the existing animation sheets to extend them? It is fine to extend the number. We have tokens."*

The art exists. This file is everything a code slice needs to bind it **without re-deriving anything** — sheet names, row order, frame counts, cell geometry, the two binding surfaces, the exact order of operations, and the three traps that will silently eat the work if the order is wrong.

**Territory note:** the art session touched no `src/` file and made no layer-contract edit, by its own firewall. Every code and contract change below is *proposed and researched*, not applied.

---

## 1. The convention, in one paragraph

Per character there is a **new sibling sheet** beside the base sheet, never a modification of it:

```
char-<name>-sheet-walkdiag<F>[-<suffix>].png     (walkers)
char-<name>-sheet-hoverdiag<F>[-<suffix>].png    (the Prospector — it hovers, it does not walk)
```

- **4 rows, in exactly this order: `0 = sw · 1 = se · 2 = nw · 3 = ne`.** (down-left, down-right, up-left, up-right.)
- `<F>` = frames per row, matching the base sheet's frame count, and it is in the filename.
- `<suffix>` mirrors the base sheet's own `-a`/`-b` suffix and is omitted when the base has none.
- `#ff00ff` key, and **cell geometry byte-identical to the base sheet** — same `floor(w/cols) × floor(h/rows)`, so the two sheets slice identically and no existing number moves.
- **No mirrored rows.** `sw` is not a flipped `se`: see §6.

`scripts/anim-pass-inspect.mjs` already parses these stems (`-sheet-(walk|hover)diag(\d+)(-[ab])?`) and returns `<F>x4`. A stem it cannot parse is measured against an imaginary grid and reports four-figure bleed — that is how M3 inherited three false REGENERATE verdicts, so keep new stems inside that pattern.

---

## 2. The sheets

Rows are always `sw / se / nw / ne`. "Cell" is identical to the base sheet's cell in every row of this table.

### 2.1 Town plaza (bound through `src/town/town-actor-sheets.json`)

| actor id | base sheet (unchanged) | **new sibling** | dims | grid | cell | frames |
|---|---|---|---|---|---|---|
| `tavernkeeper` | `char-tavernkeeper-sheet-walk8` | `char-tavernkeeper-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `storekeeper` | `char-storekeeper-sheet-walk8` | `char-storekeeper-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `elder` | `char-elder-sheet-walk8` | `char-elder-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `youngster_a` | `char-youngster-m-sheet-walk8` | `char-youngster-m-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `youngster_b` | `char-youngster-f-sheet-walk8` | `char-youngster-f-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `newsie` | `char-newsie-mei-sheet-walk8` | `char-newsie-mei-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `preacher` | `char-preacher-sheet-walk8-a` | `char-preacher-sheet-walkdiag4-a` | 1120×1360 | 4×4 | 280×340 | **4** |
| `schoolteacher` | `char-schoolteacher-sheet-walk8-a` | `char-schoolteacher-sheet-walkdiag4-a` | 1120×1360 | 4×4 | 280×340 | **4** |
| `assay_clerk` | `char-assay-clerk-sheet-walk8-a` | `char-assay-clerk-sheet-walkdiag4-a` | 1120×1360 | 4×4 | 280×340 | **4** |
| `prospector` | `char-prospector-sheet-hover8` | `char-prospector-sheet-hoverdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |

The last three are **4-frame on purpose**. Their `sw` and `nw` rows are lifted byte-for-byte from the base sheet's own rows 1 and 3 (see §5), which are 4-frame; a sheet mixing 4-frame lifted rows with 8-frame generated rows would animate at two cadences depending on which way the actor walked.

The `prospector` is the odd one in this table: it is a town actor by definition but it renders through `SpriteAnimator`, not through `TownActorRuntime.applyFullBodyFrame` (`TownScene.ts:2455` returns early for it). So it wires like a contract slot (§2.2), not like a plaza actor.

### 2.2 Contract slots (bound through `assets/layer-contracts/characters.v2.json`)

| slot | base sheet (unchanged) | **new sibling** | dims | grid | cell | frames |
|---|---|---|---|---|---|---|
| `char.hero` | `char-hero-sheet-walk8` | `char-hero-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `char.prospector_agent` | `char-prospector-sheet-hover8` | `char-prospector-sheet-hoverdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `char.bandit_base` † | `char-bandit-base-sheet-walk8` | `char-bandit-base-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `char.bandit_thief` | `char-bandit-thief-sheet-walk8` | `char-bandit-thief-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `char.baron` | `char-baron-sheet-walk8` | `char-baron-sheet-walkdiag8` | 3400×1700 | 8×4 | 425×425 | 8 |
| `char.claim_jumper` | `char-jumper-sheet-walk8` | `char-jumper-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `char.e2.rail_tough` | `char-railtough-sheet-walk4-a` | `char-railtough-sheet-walkdiag4-a` | **1252×1252** | 4×4 | 313×313 | 4 |
| `char.e2.steam_wrecker` | `char-steamwrecker-sheet-walk4-a` | `char-steamwrecker-sheet-walkdiag4-a` | **1252×1252** | 4×4 | 313×313 | 4 |
| `char.e2.coal_thief` | `char-coalthief-sheet-walk4-a` | `char-coalthief-sheet-walkdiag4-a` | **1252×1252** | 4×4 | 313×313 | 4 |

The three E2 siblings are **1252×1252 where their bases are 1254×1254, and that is correct.** `extract-alpha` slices at `floor(w/cols)`, so a 1254 px base at 4 columns has cell 313 and **2 px of remainder that is never sampled**. The sibling is built at exactly `4 × 313`, which drops the dead remainder and keeps every cell boundary identical. Do not "fix" the dimension to match the base — that would move the cuts.

† `char-bandit-base-sheet-walk8` is the **fallback art for ten slots** (`char.bandit_base`, all four E6/E7 slots, both E8, both E9 — see `characters.v2.json` `fallback.file`). Its diagonal sibling therefore has more reach than any other sheet in this list.

### 2.3 Already eight-directional — bind these, do not generate for them

| slot / sheets | what already exists |
|---|---|
| `char.hero` `walk4` block | `char-hero-sheet-walk4-a-f` = `s / se / e / ne`, `-b-f` = `n / nw / w / sw`. All eight explicit, 4 frames, **already `status: ACTIVE`** in the contract. |
| `char.claim_jumper` `walk4` block | same hemisphere pair (`char-jumper-sheet-walk4-a/-b`), all eight explicit, ACTIVE. |
| `char.prospector_agent` `walk4` block | `char-prospector-sheet-hover4-a/-b`, all eight explicit, ACTIVE. |
| `char.baron` `walk4` block | eight directions, though `sw` and `nw` both point at `-b` row 1 and `ne`/`se` both at `-b` row 2 — i.e. the diagonals are two shared banner poses, not four. `char-baron-sheet-walkdiag8` gives it four real ones. |
| **the hero four ages** — `char-hero-{claimday,midlife,silver,elder}-sheet-walk4-{a,b}` | **all four ages already carry all eight winds** and are unwired. Verified by the pure-profile test (`reviews/eight-winds/crops/ew-age-profiles.png`): every `-a` sheet's row 2 faces screen-right (east), every `-b` sheet's row 2 faces screen-left (west), matching the main hero's live convention exactly. `-a` = `s/se/e/ne`, `-b` = `n/nw/w/sw`, 4 frames, cell 425×425 on a 1700×1700 sheet. |

**No sibling sheet was built for the four ages, deliberately.** Duplicating art that already exists creates a second source of truth for the same pixels and a maintenance trap where a fix to one is forgotten on the other. `agedHeroWalkSheet(slot?.walk4, age)` (`SpriteAnimator.ts:~868`) is already the path that swaps age art into the `walk4` block; these eight sheets belong there, as a `walk4` age variant, not in a new `walkdiag` file.

### 2.4 Judged and NOT given diagonals, with the reason

The E6–E10 rosters (`char-e6-*`, `char-e7-*`, `char-e8-*`, `char-e9-*`, `char-e10-*`) are **flat 8-frame clips, not directional sheets**: in `characters.v2.json` they carry a bare `frames.files` list of 8 cells and one `walk` clip, with no direction rows at all (e.g. `char.e6.feral_toaster`, contract lines 224–228). They have no cardinal facing to extend. Giving them four diagonal rows would invent a facing system they do not have and that nothing reads.

**Recommendation, and it is an owner/architect call, not an art one:** if the later-era rosters should face at all, the change is to promote them from flat clips to a `walk4`/`walk8` block first — a contract + art project of its own — and diagonals follow for free from this same convention. Until then, generating diagonal art for them would be art nothing consumes (LEDGER row 35's lesson, verbatim: *"regenerating it would produce art nothing consumes"*).

---

## 3. The two binding surfaces

There are exactly two, and they behave differently. Do not assume one patch covers both.

### 3.1 `SpriteAnimator` / the layer contract — **no `src/` change needed**

`materializeWalkSheetDirection` (`src/assets/SpriteAnimator.ts:1018`) resolves a direction one of two ways:

```ts
if (source.frames) return withWalkSheetCadence(source, sheet);   // ← explicit file list, ANY sheet
const grid = sheet.grid;                                          // ← else: row N of grid.file
...
const files = Array.from({ length: frameCount }, (_, col) => `${base}-r${row}c${col}.png`);
```

and `expandWalkSheetSources` (`:998`) walks `grid.rowDirections` first and then **overlays anything in `sheet.directions`**. So a `walk8` block can name a *second* sheet's cells per direction, today, with no code change. The contract edit is:

```jsonc
"walk8": {
  "version": 1, "status": "ACTIVE", "enabled": true,
  "frameCount": 8, "fps": 16, "cadenceReferenceFrames": 4,
  "grid": { "file": "char-hero-sheet-walk8.png", "cols": 8, "rows": 4,
            "rowDirections": ["s", "w", "e", "n"] },
  "directions": {
    "sw": { "frames": { "files": ["char-hero-sheet-walkdiag8-r0c0.png", … r0c7] },
            "clips": { "walk": { "frames": [0,1,2,3,4,5,6,7], "fps": 16 } } },
    "se": { … r1c0 … r1c7 … },
    "nw": { … r2c0 … r2c7 … },
    "ne": { … r3c0 … r3c7 … }
  },
  "aliases": {}          // ← retired: this is the line the owner is asking us to delete
}
```

`aliases` is the exact expression of the defect. Every `walk8` block in the contract currently carries `"aliases": { "se": "e", "ne": "e", "sw": "w", "nw": "w" }` — a character walking north-east is drawn walking due east. Note `SpriteAnimator.ts:843` already skips an alias when an explicit direction exists **but only for `charHero`**; for every other slot the alias would overwrite the explicit orientation, because the alias loop runs after the explicit one. **So the `aliases` map must be emptied, not merely shadowed.** (Alternative, if you would rather not touch the data: widen that `slotId === assetSlots.charHero` guard to "any slot with an explicit direction of this name". One line, and it makes `aliases` a fallback everywhere instead of an override. That is the better change and it is the only `src/` line this surface needs.)

`clips.walk.frames` must be given explicitly on each direction: `withWalkSheetCadence` returns early unless `source.clips.walk` exists, and the `frameCount`-derived default only applies on the grid path.

### 3.2 `TownScene` plaza actors — **this one needs `src/`**

Plaza actors do not go through `SpriteAnimator` (except the prospector). `TownActorRuntime.applyFullBodyFrame` (`src/town/TownScene.ts:2453`) builds the key by hand:

```ts
const row = directionRow(this.currentDirection);
const sourceFrame = fullBody.frameMap?.[frame] ?? frame;
const key = `${fullBody.sheet}-r${row}c${fullBody.animated ? sourceFrame : 0}.png`;
```

and `directionRow` (`:2511`) collapses eight directions onto four rows:

```ts
function directionRow(direction: RotationDirection): number {
  if (direction === 'w' || direction === 'sw' || direction === 'nw') return 1;
  if (direction === 'e' || direction === 'se' || direction === 'ne') return 2;
  return direction === 'n' ? 3 : 0;
}
```

The minimal shape of the change — **sheet AND row together**, because the diagonal rows live in a different file:

```ts
// TownActorDefinition.fullBody gains one optional field:
//   diagSheet?: string   — the walkdiag sibling; when absent, behaviour is exactly as today
function directionSheetRow(fullBody, direction): { sheet: string; row: number } {
  const diag = fullBody.diagSheet;
  if (diag) switch (direction) {
    case 'sw': return { sheet: diag, row: 0 };
    case 'se': return { sheet: diag, row: 1 };
    case 'nw': return { sheet: diag, row: 2 };
    case 'ne': return { sheet: diag, row: 3 };
  }
  return { sheet: fullBody.sheet, row: directionRow(direction) };
}
```

`src/town/town-actor-sheets.json` is the natural place for the second name (it is already the actor→sheet map), e.g. a parallel `"tavernkeeper": "char-tavernkeeper-sheet-walkdiag8"` block keyed under `diag`.

**Do not forget the frame count.** `update()` cycles `this.frame = (this.frame + 1) % (this.definition.fullBody.frameMap?.length ?? 8)` (`:2432`), a *sheet-independent* 8. The three 4-frame actors (preacher, schoolteacher, assay clerk) need `frameMap: [0, 1, 2, 3]` on their `fullBody` — which is the same one-line fix the previous review already asks for as §4 item 1 ("the highest value-per-byte item left in the whole pass"), and it is now **required**, not optional, because their diagonal sheet is genuinely 4 columns wide and column 4 does not exist.

`OrientationResolver.resolve(dx, dz)` already produces the eight `RotationDirection` values from plaza motion, so no work is needed on the motion side.

---

## 4. Order of operations — and the three traps

**Extract before you wire.** In that order, for a reason:

> `selectWalkSheet` (`SpriteAnimator.ts:979`) returns the `walk8` block only if `walkSheetHasProcessedCells(walk8)` — which collects **every** file the block references and requires all of them to be present in `processedTextureUrlsByFile`. Add four diagonal directions to a `walk8` block before extracting the cells and the block fails that test **as a whole** and silently falls back to `walk4`. The sprite does not break; it quietly gets worse, and the log is green. This is the F-A5-class failure — a regression nobody can see.

### 4.1 Extraction

Not done in the art pass on purpose: nothing binds these cells yet, and 464 unused cells is dead bundle weight (`assets/processed/char-*.png` is a lazy `import.meta.glob`, so every file is emitted). The sheets were extracted to a scratch directory, measured, and the cells thrown away.

Per sheet, in that sheet's own convention:

```bash
node scripts/extract-alpha.mjs --key ff00ff --grid <F>x4 --scale <the BASE sheet's pinned scale> \
     assets/raw/<the walkdiag stem>.png
```

- `--grid` is `8x4` or `4x4` per §2.
- `--scale` **must be pinned to the base sheet's own `scale`** from `assets/processed/<base>.frames.json` — every base in §2 is `scale: 1`, verified. Letting extract-alpha auto-fit re-derives one shared scale from the largest bbox on the *new* sheet and every figure resizes (M3.1 measured +10.5% / +14.1% / +16.0% doing exactly this).
- The town walk8 cast ships **512 px cells with no `processed-full` master** (verified: `char-tavernkeeper-sheet-walk8-r0c0.png` is 512×512 and has no master). Reproduce that convention, or `scripts/optimize-assets.mjs` will silently downscale the new cells on the next build. `scripts/anim-pass-reextract.mjs` exists precisely to reproduce a sheet's own convention and its `--verify-downscale` proves the replication byte-for-byte.

### 4.2 Wiring
1. Extract (§4.1) and confirm the cells are in `assets/processed/`.
2. Contract slots: add `directions` for `sw/se/nw/ne`, **empty the `aliases` map** (or widen the hero guard at `SpriteAnimator.ts:843`).
3. Plaza actors: `diagSheet` + `directionSheetRow` + `frameMap: [0,1,2,3]` for the three 4-frame actors.
4. Gate (§7).

---

## 5. Provenance per row — what is generated and what is lifted

A lifted row is a **byte copy** of cells the game already ships: no rescale, no reseat, no resample. It cannot drift from the shipped identity.

| sheet | sw | se | nw | ne |
|---|---|---|---|---|
| `char-preacher-sheet-walkdiag4-a` | **lifted** from base row 1 | generated | **lifted** from base row 3 | generated |
| `char-schoolteacher-sheet-walkdiag4-a` | **lifted** from base row 1 | generated | **lifted** from base row 3 | generated |
| `char-assay-clerk-sheet-walkdiag4-a` | **lifted** from base row 1 | generated | **lifted** from base row 3 | generated |
| every other sheet in §2 | generated | generated | generated | generated |

### 5.1 F-EW-3 — a correction to the inherited record, and it is load-bearing for this spec

`reviews/anim-pass-2026-07-25.md` §M3.5 (F-M3-3) records the three `-a` town sheets as `s / sw / w / nw` and concludes *"their union … contains no east frame, so there is nothing to graft from"*; §1 (F-A1) lists *"STILL OWED: an east row (row 2 faces west)"* for all three.

**Row 2 of all three `-a` sheets is an EAST-facing profile.** Read at 820–900 px per cell (`reviews/eight-winds/crops/ew-preacher-r2.png`, `ew-abc-r2-decide.png`) — and visible in the previous session's **own** evidence file, `reviews/anim-pass-2026-07-25/crops/m3-a-partners-rows.png`, whose column 2 shows all three facing screen-right. The written conclusion and the image on disk disagree; the image is right.

Corrected picture for `char-{preacher,schoolteacher,assay-clerk}-sheet-walk8-a`:

| row | `directionRow()` asks for | art draws | verdict |
|---|---|---|---|
| 0 | s | s | ✅ |
| 1 | w | **sw** | 45° off |
| 2 | e | **e** | ✅ **correct — not missing, not 180° wrong** |
| 3 | n | **nw** | 45° off |

(`-b` stays `n / nw / w / sw` as F-M3-3 says — `char-preacher-sheet-walk8-b` row 2 is a west profile, same crop.)

Two consequences for whoever picks this up:
- **"Generate an east row for the three town actors" is not owed work. It exists.** It is on the record as owed in two places in the previous review; both are wrong.
- Once the diagonal siblings are bound, rows 1 and 3 being 45° off stops mattering, because a resolver that can address `sw` and `nw` directly no longer needs row 1 to be west. **Binding the siblings fixes the 45° error as a side effect** — that is the cheapest way to close F-A1's remaining tail, and it needs no further art.

---

## 6. The anti-mirror law, and how to check it in review

A left-down walker is not a flipped right-down walker: lighting and asymmetric props must track the **body**, not the camera. With the camera south of the plaza looking north (screen down = south, screen right = east), a figure's left-shoulder offset is `(f.y, -f.x)` for facing vector `f`, which gives:

| wind | travels | view | character's LEFT side appears | character's RIGHT side appears |
|---|---|---|---|---|
| `sw` | down-left | ¾ FRONT | screen **RIGHT**, nearer | screen LEFT, farther |
| `se` | down-right | ¾ FRONT | screen **RIGHT**, farther | screen LEFT, nearer |
| `nw` | up-left | ¾ BACK | screen **LEFT**, nearer | screen RIGHT, farther |
| `ne` | up-right | ¾ BACK | screen **LEFT**, farther | screen RIGHT, nearer |

**The character's left is on the screen right for both south winds and on the screen left for both north winds.** That single sentence is the whole test. Two corollaries worth keeping:

- **A silhouette metric cannot catch a mirror here.** `sw` and `se` genuinely *are* near-mirror silhouettes; only the interior — a towel, a lantern, a satchel, a hatband card — separates a correct pair from a flipped one. Facing and prop verdicts in this pass were all read by eye at 400–900 px per cell, per F-A3.
- **The key light is the universal check.** Light is from the upper left in every frame, so a flipped frame is lit from the wrong side even on a character with no sided prop.

Per-character prop sides are data, in `reviews/eight-winds/cast.json` (`props[].side` = `L`/`R`); `scripts/anim-pass-prompt.mjs` converts them to the screen side per wind. Two claims were **withdrawn** there after opening the base sheets — the storekeeper's apron pocket sits on the apron front and the elder's poncho fringe runs all round, so neither can be assigned to a body side. Those two are judged on facing and identity only.

---

## 7. Gate the wiring slice on this

Beyond the standard drain gate (tsc · build · adjacent suites · zero console errors · desktop + 390 px):

1. **No silent downgrade.** Assert `selectWalkSheet` still returns the `walk8` block after the contract edit — i.e. that every referenced diagonal cell exists in `assets/processed/`. A test that counts the files a block references and checks them against the processed set catches §4's trap directly.
2. **A plain boot shows it** (Mistake #10). The plaza actors walk closed loops through `loopPoint`, so a no-`?debug` e2e can drive one actor around its loop and assert the sprite key changes to a `walkdiag` cell on the diagonal legs. `TownActorRuntime.frameKey` already exposes the current key for exactly this kind of probe.
3. **No size pop on the turn.** The art side is measured — every sibling lands inside its base's own height band (drift −1.0% to +1.6%, table in the run files) — but assert it at gameplay zoom too, because that is where the s21 rotation note says a pulse shows up.
4. **Frame count.** For the three 4-frame plaza actors, assert the cycle is `% 4` and never asks for `c4`–`c7`; `loadProcessedCharacterTexture` resolves `null` for a missing cell (`src/assets/generated.ts:180`) and the sprite silently **holds its previous frame**, which looks like a stutter and reads as a bug in the art.

---

## 8. Where the evidence is

```
assets/raw/char-*-sheet-{walk,hover}diag*.png       the sheets themselves
reviews/eight-winds/cast.json                       identity + prop sides, the prompt source of truth
reviews/eight-winds/prompts/                        every prompt as issued
reviews/eight-winds/gen/                            every accepted generation + the rejected takes
reviews/eight-winds/crops/                          the boards every facing/prop verdict was read from
reviews/eight-winds/runs/                           per-batch run files with the measured tables
reviews/anim-pass-2026-07-25/data/*walkdiag*.json   per-sheet grid/key/cell measurements
scripts/anim-pass-prompt.mjs                        prompt builder — the wind→screen-side table lives here
scripts/anim-pass-diag.mjs                          composition: base cell geometry, foot-line seating
scripts/anim-pass-winds.mjs                         build + measure a whole character in one command
scripts/anim-pass-windtable.mjs                     the review tables, generated not hand-typed
scripts/anim-pass-gen.mjs / -batch / -reclaim       the generation arm, its fan-out and its repair tool
```
