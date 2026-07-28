# Task lane-c-eight-winds-wiring-hero: THE EIGHT WINDS, slice 1 — bind the hero's diagonal sheet, and build the guard that protects the other sixteen (lane-c, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s1175, 2026-07-28. The `EIGHT-WINDS-WIRING` rung became fire-authorable when its gate was released by the act-2 art drain earlier today (`tasks/BACKLOG.md:1601`, verbatim: *"EIGHT-WINDS-WIRING is now FIRE-AUTHORABLE (art + spec on main)"*), and its READ-FIRST spec landed on main in the same drain. **This task takes ONE of the seventeen sheets.** No new scope invented; the remainder stays on the ladder.

CODEX: model=gpt-5.6-sol effort=high

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (paths, not memory):
- `AGENTS.md`
- **`reviews/eight-winds-wiring-spec.md` — the whole file. It is the READ-FIRST for this slice and it saves you every re-derivation.** Read §1 (the convention), §3.1 (the contract surface), §4 (order of operations + the silent-fallback trap), §7 (what to gate on).
  ⚠️ **Two of its statements are WRONG and s1175 measured both at source. They are corrected below in WHY. Read the corrections before you act on §3.1 or §4.1.**
- `src/assets/SpriteAnimator.ts:790-855` — how orientations are built: `slot.rotations.directions` → walk-sheet sources → `walkSheet.mirrors` → **`walkSheet.aliases` (which OVERWRITES)**. The alias guard is `:843`.
- `src/assets/SpriteAnimator.ts:979-996` — `selectWalkSheet` / `walkSheetHasProcessedCells`. **This is the trap in §4: a `walk8` block silently loses to `walk4` if ANY referenced cell is missing from the processed set.**
- `src/assets/SpriteAnimator.ts:998-1016` (`expandWalkSheetSources`) and `:1018+` (`materializeWalkSheetDirection`) — an explicit `directions.<wind>.frames.files` list is honoured for any sheet, no `src/` change required.
- `assets/layer-contracts/characters.v2.json` — `slots` is an **ARRAY** of objects each with a `slot` key (not a map; do not index it by name).
- `scripts/anim-pass-reextract.mjs` — read `convention()` at `:87` before you run it. It is the right tool and it will **refuse** your sheet as-is; see WHY.
- `e2e/066-walk8-engine.spec.ts:54-90` — the existing plain-boot diagnostics idiom: `window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.hero'].frameKey` / `.sourceFrameKey`. **This is the seam for your proof; you are not adding one.**

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via `git log`/`git diff`), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make.

**The dupe is PRE-PROVEN for you by CONTENT — do not spend budget re-deriving it.** s1175 verified at 2026-07-28T17:03Z: `lane/e2-arsenal` is 1 ahead at `319e6304` (`runner(lane-c): lane-c-power-budget-retry-policy.md`), which shipped to main as `d1b6545e` (s1173). All **five** files that commit touched resolve to **byte-identical blob hashes on main** (`git rev-parse lane/e2-arsenal:<f>` == `git rev-parse main:<f>` for all five), and the lane tree holds **zero** files absent from main. `git -C worktrees/lane-c status --porcelain` was empty. Textbook false-ahead SAFE DUPE → reset and proceed. Re-run the blob comparison to confirm nothing changed since, then move on.

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why

**Owner directive (2026-07-28, verbatim, quoted in the spec header):** *"can we extend the walking animations from four directions to 8 to also cover the diagonal directions? I think that will add to the quality of the game. Can you task Opus 5 to work with GPT Image 2.0 and the existing animation sheets to extend them? It is fine to extend the number. We have tokens."*

The art arm is **done and merged**: 17 diagonal sibling sheets are on main under `assets/raw/char-*-{walk,hover}diag*.png` (s1175 counted **18** matching raws), extraction deliberately withheld because nothing bound them yet. What is missing is the code that binds them. Today every `walk8` block in the contract carries `"aliases": {"se":"e","ne":"e","sw":"w","nw":"w"}` — **a character walking north-east is drawn walking due east.** That is the defect this program exists to close.

**Why the hero, and why only the hero.** `char.hero` is the one slot a player watches for the whole run (Mistake #10: *where does the PLAYER see this in a plain boot?*), and — per the correction below — it is the **only** `walk8` slot whose alias override is already neutralised by data that ships today. So this slice binds real diagonal art with **zero `src/` change**, and spends its remaining budget building the reusable guard that the other sixteen sheets will need. Sixteen sheets in one run is the Mistake #8 shape; one sheet plus a guard is a slice.

### ⚠️ CORRECTION 1 to the spec (F-1175-1) — §3.1's `src/` recommendation is aimed at the WRONG MAP
§3.1 says the guard at `SpriteAnimator.ts:843` *"already skips an alias when an explicit direction exists but only for `charHero`"*, and offers as *"the better change"* widening that guard to *"any slot with an explicit direction of this name"*.

**Read the line.** It is:
```ts
if (slotId === assetSlots.charHero && slot?.rotations?.directions?.[targetDirection]) continue;
```
The condition tests **`slot.rotations.directions`** — a *different contract surface* from the `walk8` block's own `directions` map you are about to populate. s1175 measured the data:

| slot | `walk8.aliases` | `rotations.directions` |
|---|---|---|
| `char.hero` | `{se:e, ne:e, sw:w, nw:w}` | **all 8** — `s,se,w,ne,n,sw,e,nw` |
| `char.bandit_base` | same | **empty** |
| `char.bandit_thief` | same | **empty** |
| `char.baron` | same | **empty** |
| `char.prospector_agent` | same | **empty** |
| `char.claim_jumper` | same | `s,se,e,w,ne,n` (no `sw`/`nw`) |

Two consequences, and both are load-bearing:
1. **For `char.hero` the aliases are already inert** — the guard fires on all four diagonals. Your `walk8.directions` entries are applied by `expandWalkSheetSources` *after* the row pass and are **not** overwritten. That is why this slice needs no `src/` edit. **Leave `char.hero`'s `aliases` map exactly as it is** and *prove* the inertness in scope 4 rather than asserting it.
2. **The spec's "better change" would not work for the four slots that need it most** (including `char.bandit_base`, the fallback art for ten slots): widening the *slot* test still consults `rotations.directions`, which is **empty** for them. The spec's PRIMARY option — emptying the `aliases` map — is the one that actually works. **That is a later rung's decision. Do not make it here.** Record it in your report.

### ⚠️ CORRECTION 2 to the spec (F-1175-2) — §4.1's extraction tool will REFUSE this sheet
§4.1 sends you to `scripts/anim-pass-reextract.mjs` as the tool that *"reproduces a sheet's own convention"*. It does — **for a stem that already ships.** `convention(stem)` (`:87`) reads `assets/processed/<stem>.frames.json` and returns `{error: 'no frames.json — sheet is not extracted; nothing ships'}` when it is absent, and the caller **SKIPS** that stem. A brand-new `walkdiag` stem has no such file by definition, so an unmodified run of that tool writes **nothing** and exits 0.

§4.1 also describes the town cast's convention (512 px cells, **no** `processed-full` master). **That is not the hero's convention.** s1175 measured the hero:

| fact | measured value |
|---|---|
| `assets/raw/char-hero-sheet-walk8.png` | 2240×1360 |
| `assets/raw/char-hero-sheet-walkdiag8.png` | **2240×1360 — byte-identical geometry** (cell 280×340 at 8×4) |
| `char-hero-sheet-walk8.frames.json` | `cell: 512`, `scale: 1`, grid 8×4, 32 cells, **0 empty** |
| shipped cell `…-r0c0.png` | **256×256** in `assets/processed/` |
| master `…-r0c0.png` | **512×512** in `assets/processed-full/` (32 masters present) |

So the hero ships **512 master + 256 downscaled**, and your sibling must do the same or `scripts/optimize-assets.mjs` will re-derive the shipped cell from a missing/stale master on the next build.

## Scope

### 1. CONFIRM THE TWO PREMISES, IN THE LANE — and this step can STOP the task
Before changing anything, re-verify at source (cheap, ~10 minutes) and record the result:
- (a) the `:843` guard text and `char.hero`'s `rotations.directions` key list;
- (b) `anim-pass-reextract.mjs` refusing `char-hero-sheet-walkdiag8` (run it and paste the SKIPPED line);
- (c) the six geometry rows in CORRECTION 2, re-measured by you.

**If any of these contradicts what is written above, STOP and report the contradiction with your numbers.** Do not "work around" a false premise — the whole scope below is built on these three, and a task built on a wrong premise is worth less than a STOP. *(A STOP here with your measurements is a complete, successful task.)*

### 2. EXTRACT the one sheet, reproducing the hero's own convention
Add a `--like <base-stem>` option to `scripts/anim-pass-reextract.mjs`: when the target stem has no shipped `frames.json`, take `grid` / `declCell` / `scale` / `displayCell` / `hasMaster` from the **named base stem's** convention instead of erroring. Everything downstream of `convention()` then works unchanged — which is the point: the downscale stays the byte-faithful copy of `optimize-assets.mjs`, not a hand-roll.

```bash
node scripts/anim-pass-reextract.mjs --like char-hero-sheet-walk8 char-hero-sheet-walkdiag8
```
Expected result: 32 cells → `assets/processed-full/` at 512, 32 downscaled → `assets/processed/` at 256, plus `char-hero-sheet-walkdiag8.frames.json`.

**Controls (both mandatory, paste both outputs):**
- `node scripts/anim-pass-reextract.mjs --verify-downscale char-hero-sheet-walk8` — must **exit 0**, proving your `--like` path did not disturb the shared downscale.
  ⚠️ **The guard's output contract CHANGED on 2026-07-28 (`8159fe6b`) — read this before you judge the result.** It is now provenance-aware, so the correct green is:
  ```text
  downscale replication: 23 byte-identical, 0 unexplained, 9 master-divergent by design (of 32 masters)
  ```
  Those 9 are tracked post-extraction mends listed in `assets/master-divergent.json`; they are **expected to differ** and are not failures. **The number that must be zero is `unexplained`** — not the count of non-identical cells.
  An earlier run of this very master STOPPED here, lawfully and correctly, because the *old* guard reported those 9 as mismatches. **That blocker is cured; do not STOP on it again.** But the tooth is intact: if `unexplained` (or a stale/missing exclusion) is non-zero, that IS a real regression from your `--like` path — STOP and report it with the printed lines.
- Assert your new `frames.json` reports `cell: 512`, `scale: 1`, grid 8×4, **32 cells, 0 empty**. A non-zero `empty` count means the key or the grid is wrong — STOP rather than binding transparent cells.

⛔ **Do not pass `--refresh-full` and do not run `scripts/optimize-assets.mjs` globally.** The script's own header (`:8-19`) explains that a global run would overwrite 462 masters with today's 256 px cells. That is a loss, not a refresh.

### 3. BIND it — contract data only, zero `src/`
In `assets/layer-contracts/characters.v2.json`, on the `char.hero` entry's `walk8` block, add a `directions` map for `sw` / `se` / `nw` / `ne` following §3.1's shape exactly:
- row order is **`0=sw · 1=se · 2=nw · 3=ne`** (§1 — get this wrong and the hero walks down-left when travelling up-right, which no test below will catch for you);
- each direction lists its eight cells `char-hero-sheet-walkdiag8-r<row>c0…c7.png`;
- **each direction carries an explicit `clips.walk` with `frames: [0..7]` and `fps: 16`** — `withWalkSheetCadence` (`:1049`) returns the source *without* cadence when `clips.walk` is absent, so the diagonals would drift out of step with the cardinals.
- **leave `aliases` untouched** (CORRECTION 1) and leave `grid` / `rowDirections` untouched.

### 4. THE GUARD — this outlives the slice, so write it generically
A test (`e2e/` or a node guard under `scripts/`, your call — justify it) that, **for every slot in the contract carrying a `walk8` block**, collects every file that block references (grid-derived cell names **and** every explicit `directions[*].frames.files` entry) and asserts each one is present in `assets/processed/`. This is §7 item 1, and it catches the §4 trap directly: without it, one missing cell silently downgrades the hero to `walk4` **with a green log**.

Also assert, for `char.hero` specifically, that the four diagonal orientations resolve to `walkdiag` cells and **not** to the aliased `e`/`w` cells — that is the executable form of CORRECTION 1, and it will go red the day someone deletes `char.hero`'s `rotations.directions`.

### 5. PLAIN-BOOT PROOF (Mistake #10)
A **no-`?debug`** e2e that drives the hero on a diagonal and asserts `window.__THREE_GAME_DIAGNOSTICS__.spriteAnimations['char.hero'].sourceFrameKey ?? .frameKey` contains `walkdiag`, with the correct row for the wind travelled. Use `e2e/066-walk8-engine.spec.ts:54-90` as the idiom. Desktop **and** 390 px.

### 6. MUTATION CONTROL (mandatory — each new assertion must be able to fail)
Two mutations, run separately, each restored afterwards, both outputs pasted:
- **Aim it at the defect's own branch:** swap the `sw` and `ne` file lists in the contract. Scope 5's test must go **RED** on the wind whose row you moved. A test that passes with the rows crossed is asserting "a walkdiag cell appeared", not "the RIGHT one did".
- **Aim it at the trap:** temporarily rename one referenced processed cell out of the way and confirm scope 4's guard goes **RED** (and note, in your report, whether the game silently fell back to `walk4` — that is the failure mode this whole guard exists to make loud).

## Firewall

**TOUCH-ONLY:**
- `assets/layer-contracts/characters.v2.json` — **the `char.hero` entry's `walk8.directions` only.**
- `scripts/anim-pass-reextract.mjs` — the `--like` option only; the `resize`/`writePng` block copied from `optimize-assets.mjs` is **byte-faithful by contract, do not touch it**.
- `assets/processed/char-hero-sheet-walkdiag8-*` + its `frames.json`, and `assets/processed-full/char-hero-sheet-walkdiag8-*` — new files only.
- your new guard + plain-boot spec, and your run report under `tasks/runs/`.

**NO — do not touch, do not "fix", do not tidy:**
- **All of `src/**`.** This slice is designed to need none. If you believe it does, you have hit CORRECTION 1 from the wrong side: **STOP and report** rather than editing `SpriteAnimator.ts`.
- **The other sixteen sheets.** No extraction, no binding, not even "while I'm here". 464 unused cells is dead bundle weight and the art session withheld them deliberately.
- **Every `walk8.aliases` map, on every slot, including the hero's.** Emptying them is the next rung's decision and it is not yours (CORRECTION 1).
- `char.claim_jumper` — **owner-gated design fork** (F-1166-1, `tasks/BACKLOG.md:1576`; `tasks/025-vp-02e-jumper-8way-activation.md` is marked DO-NOT-QUEUE). Do not bind it, do not "notice" it into scope.
- The four hero ages (`char-hero-{claimday,midlife,silver,elder}-sheet-walk4-{a,b}`) — spec §2.3 says they already carry all eight winds and belong in the `walk4` age path, not here.
- The town plaza actors and `src/town/TownScene.ts` — that is spec §3.2, the **other** binding surface, and it genuinely needs `src/`. Separate slice.
- `playwright.config.ts`, `package.json`, any `--workers` default.

## Self-check before you report

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green, note the time **and the bundle delta** (you added 32 cells; say how much).
3. Your new guard + your new plain-boot spec: green, **both projects**, `--workers=1`, and **state the worker count** (F-1173-5: a red inherits its harness config, and this suite reads differently at other worker counts).
4. Adjacent suites, unmodified, `--workers=1`, both projects: `e2e/066-walk8-engine.spec.ts`, `e2e/vp-02-sprite-animation.spec.ts`, `e2e/vp-02b-rotation-resolver.spec.ts`. Report counts; any red must be fingerprint-matched to a pre-existing one **with proof from the unmodified tree**.
5. Zero console / page errors in a plain boot, desktop and 390 px.
6. Screenshot the hero mid-stride on each of the four diagonals into `artifacts/eight-winds-hero/` (both projects) and say where they are. **Look at them**: §6 of the spec is the anti-mirror law — the character's left is on the screen RIGHT for both south winds and on the screen LEFT for both north winds, and the key light is upper-left in every frame. If a frame is lit from the wrong side, say so; that is an art finding, not a wiring one, and it belongs in your report rather than in a fix.

READY-FOR-GATES + report, in this order: your scope-1 confirmation (or STOP) with numbers; the extraction output plus both controls; the contract diff as text; the two mutation-control reds and their restores; the adjacent-suite table with worker count; and one paragraph naming what the NEXT rung must decide about `walk8.aliases` for the five non-hero slots, with the evidence you saw.
