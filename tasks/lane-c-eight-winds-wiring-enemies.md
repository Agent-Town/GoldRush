# Task lane-c-eight-winds-wiring-enemies: THE EIGHT WINDS, slice 2 — bind the three outlaw slots, and settle the `aliases` question slice 1 deferred (lane-c, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s1183, 2026-07-28.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST (open them, do not skim):
- `AGENTS.md`
- `reviews/eight-winds-wiring-spec.md` — **this slice's authorizing spec.** §1 (row order), §2.2 (the slot table), §3.1 (the binding surface + the alias defect), §4 (order of operations + the three traps), §7 (the gate).
- `tasks/lane-c-eight-winds-wiring-hero.md` — **slice 1, shipped twice** (`shipped-29bac3d9`, `shipped-8159fe6b`). Its scope 2 built the `--like` extraction path you will reuse; its firewall named the `aliases` map as *"the next rung's decision"*. **You are the next rung.**
- `reviews/eight-winds-master-convention.md` — the provenance-aware `--verify-downscale` contract (§ below).

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

> ℹ️ Authoring-time note (s1183, verify it yourself anyway): `lane/e2-arsenal` was 2 ahead, and both commits — `84905654` (`lane-wardrobe-preview`) and `70db5602` (`lane-c-066-walk8-hero-expectation-realign`) — correspond to slices s1181 drained to main as `bcaddba7` and `639df50b`. Expected to be a clean SAFE DUPE.

## Why (spec + owner directive, dated; every premise below re-verified at source on 2026-07-28)

**Owner directive, verbatim (2026-07-28, `reviews/eight-winds-wiring-spec.md:3`):**
> *"can we extend the walking animations from four directions to 8 to also cover the diagonal directions? I think that will add to the quality of the game. Can you task Opus 5 to work with GPT Image 2.0 and the existing animation sheets to extend them? It is fine to extend the number. We have tokens."*

**The gate on this rung is OPEN, and I checked rather than inherited it.** `tasks/BACKLOG.md:1643` (duplicated at `:1644`) reads verbatim: **"EIGHT-WINDS-WIRING is now FIRE-AUTHORABLE (art + spec on main)."** ⚠️ `tasks/BACKLOG.md:1633` still carries the **superseded** `⛔ NOT AUTHORABLE YET — … reviews/eight-winds-wiring-spec.md exists in NEITHER the repo NOR gr-task-anim-pass/reviews/`. **That file now exists on main and I read it** — the stale line is retired in the same commit that creates this master.

**The art is on main, the cells are not.** `git ls-files` confirms `assets/raw/char-bandit-base-sheet-walkdiag8.png`, `assets/raw/char-bandit-thief-sheet-walkdiag8.png`, `assets/raw/char-baron-sheet-walkdiag8.png` are all tracked. Only the **hero** has processed diagonal cells (`assets/processed/char-hero-sheet-walkdiag8-*` + `frames.json`); these three stems have **zero** — deliberately, per `BACKLOG:1643` (*"NO assets/processed extraction yet … one-command reversal per sheet when wiring lands"*). Wiring is landing. This is the reversal.

**Geometry, from the spec's own slot table (`reviews/eight-winds-wiring-spec.md:60-62`):**

| slot | base stem | diagonal stem | sheet px | grid | cell | frames |
|---|---|---|---|---|---|---|
| `char.bandit_base` | `char-bandit-base-sheet-walk8` | `char-bandit-base-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `char.bandit_thief` | `char-bandit-thief-sheet-walk8` | `char-bandit-thief-sheet-walkdiag8` | 2240×1360 | 8×4 | 280×340 | 8 |
| `char.baron` | `char-baron-sheet-walk8` | `char-baron-sheet-walkdiag8` | 3400×1700 | 8×4 | 425×425 | 8 |

### ⚠️ THE LOAD-BEARING PREMISE, AND WHY IT IS NOT WHAT THE SPEC SAYS

Spec §3.1 offers two ways to stop the alias map from eating your new directions, and recommends the second:
> *"the `aliases` map must be emptied, not merely shadowed. (Alternative … widen that `slotId === assetSlots.charHero` guard to 'any slot with an explicit direction of this name'. One line, and it is the only `src/` line this surface needs.)"*

**I traced the code and the recommended one-liner is under-specified. Do not apply it blind.** Read `src/assets/SpriteAnimator.ts:813-851` yourself; here is what I measured:

- `:815` `expandWalkSheetSources(walkSheet)` yields grid-derived directions **plus** anything overlaid in `walkSheet.directions` — so the `directions` map you are about to add **does** populate `orientations` at `:822`.
- `:839-850` the alias loop then runs **after** it and calls `orientations.set(targetDirection, …)`, **overwriting** your explicit diagonal.
- `:843` the escape hatch is `if (slotId === assetSlots.charHero && slot?.rotations?.directions?.[targetDirection]) continue;`

**The trap:** that guard consults `slot.rotations.directions` — a **different map** from `walkSheet.directions`. Deleting `slotId === assetSlots.charHero &&` therefore protects a slot only if that slot *also* carries `rotations.directions` entries for `sw/se/nw/ne`. A "one-line fix" that silently fails to fire is the §4 trap wearing a different hat: the sprite does not break, it quietly stays aliased, and the log is green.

**✅ THIS IS ALREADY MEASURED, AND IT SETTLES THE CHOICE — F-1175-1**, recorded in `tasks/goals.json` on the `eight-winds-wiring-hero` leaf (`authoredBy: s1175 fire`), verbatim:

> *"spec §3.1's recommended `src/` one-liner is aimed at the WRONG MAP — the `:843` guard tests `slot.rotations.directions`, not the walk8 block's own `directions`, and **`rotations.directions` is EMPTY for `char.bandit_base` / `char.bandit_thief` / `char.baron` / `char.prospector_agent`**, so widening the slot test would not free the four slots that need it most; **emptying the `aliases` map (the spec's primary option) is the one that works**, and that decision is deliberately left to a later rung."*

Those are precisely your three slots, and you are the later rung. **So: empty the three `aliases` maps (data-only, zero `src/`). The guard-widening alternative is CLOSED — do not spend time on it.** Emptying is safe precisely because you add all four explicit diagonals in the same edit, so no direction loses coverage. Scope 1 re-verifies the premise anyway (it is two greps, and s1175's measurement is four days stale in a repo where that matters) — but the expected answer is *empty*, and a contradiction is a STOP-and-report, not a licence to improvise.

## Scope

### 1. CONFIRM THE PREMISES, IN THE LANE — this step has STOP authority
Before changing anything, re-verify at source and **record each result with the printed lines**:
- (a) `src/assets/SpriteAnimator.ts:843` still reads the hero-only guard quoted above;
- (b) for each of the three slots, whether `slot.rotations.directions` carries `sw`/`se`/`nw`/`ne` keys today. **F-1175-1 measured these as EMPTY on 2026-07-28** — confirm that still holds. If it does, the guard-widening alternative is dead and emptying `aliases` is the only remedy (proceed). **If any is now non-empty, STOP and report** — the remedy question has reopened and it is not yours to re-decide;
- (c) each slot's current `walk8.aliases` map, printed verbatim;
- (d) each diagonal raw's real pixel dimensions (`file assets/raw/char-*-sheet-walkdiag8.png`) against the table above.

**If any of these contradicts what is written above, STOP and report the contradiction with your numbers.** Do not work around a false premise. *(A STOP here, with measurements, is a complete and successful task — slice 1 did exactly that once and it was the right call.)*

### 2. EXTRACT the three sheets, each reproducing its OWN base's convention
Use the `--like` path slice 1 shipped:
```bash
node scripts/anim-pass-reextract.mjs --like char-bandit-base-sheet-walk8  char-bandit-base-sheet-walkdiag8
node scripts/anim-pass-reextract.mjs --like char-bandit-thief-sheet-walk8 char-bandit-thief-sheet-walkdiag8
node scripts/anim-pass-reextract.mjs --like char-baron-sheet-walk8        char-baron-sheet-walkdiag8
```
- `--scale` must come from the base's pinned `scale` (the `--like` path does this for you — that is its purpose). **Never let extract-alpha auto-fit**: spec §4.1 records +10.5% / +14.1% / +16.0% figure resizes from exactly that mistake.
- For each sheet assert its new `frames.json` reports **grid 8×4, 32 cells, 0 empty**. A non-zero `empty` means the key or grid is wrong — **STOP** rather than bind transparent cells.

**Control (mandatory, paste the output):** `node scripts/anim-pass-reextract.mjs --verify-downscale char-baron-sheet-walk8` must **exit 0**.
⚠️ The guard is **provenance-aware** (`8159fe6b`): the number that must be zero is **`unexplained`**, *not* the count of non-identical cells — `master-divergent` entries listed in `assets/master-divergent.json` are expected to differ. An earlier slice-1 run STOPPED on the *old* guard's wording; that blocker is cured, do not STOP on it again. A non-zero `unexplained` IS a real regression from your extraction — STOP and report it.

⛔ **Do not pass `--refresh-full` and do not run `scripts/optimize-assets.mjs` globally** — its own header (`:8-19`) explains a global run overwrites 462 masters with today's 256 px cells. That is a loss, not a refresh.

### 3. BIND the three slots — data only, and settle `aliases`
In `assets/layer-contracts/characters.v2.json`, for **each** of `char.bandit_base`, `char.bandit_thief`, `char.baron`, on that slot's `walk8` block:
- add a `directions` map for `sw` / `se` / `nw` / `ne`, row order **`0=sw · 1=se · 2=nw · 3=ne`** (spec §1 — get this wrong and an outlaw closing from the north-east is drawn running south-west, and no test below catches it for you);
- each direction lists its eight cells `char-<stem>-sheet-walkdiag8-r<row>c0…c7.png`;
- each direction carries an **explicit `clips.walk` with `frames: [0..7]` and the same `fps` as that slot's `walk8` block** — `withWalkSheetCadence` returns the source *without* cadence when `clips.walk` is absent, so the diagonals would drift out of step with the cardinals;
- **empty that slot's `aliases` map** (`"aliases": {}`), per spec §3.1's primary instruction and the Why above.
- leave `grid` / `rowDirections` untouched.

**Do not touch `SpriteAnimator.ts:843`.** F-1175-1 already measured the guard-widening alternative as inert for these three slots (see Why). This slice is data-only.

### 4. EXTEND THE EXISTING GUARD — do not write a second one
Slice 1 shipped a generic guard that, for every slot carrying a `walk8` block, collects every file the block references (grid-derived **and** every explicit `directions[*].frames.files`) and asserts each is present in `assets/processed/`. **Find it, confirm it already covers your three new slots by construction, and paste the run showing it green.** If it is not generic, make it generic rather than cloning it — spec §7 item 1 exists to catch the §4 trap for *all* slots, not per-slot.

Add, for each of the three slots, the executable form of this slice's decision: assert the four diagonal orientations resolve to `walkdiag` cells and **not** to the aliased `e`/`w` cells.

### 5. PLAIN-BOOT PROOF (Mistake #10 — where does the PLAYER see this?)
A **no-`?debug`** e2e that gets each of the three outlaws moving on a diagonal in the run scene and asserts its resolved sprite key contains `walkdiag`, with the correct row for the wind travelled. Use `e2e/066-walk8-engine.spec.ts:54-90` as the idiom and `e2e/eight-winds-hero.spec.ts` as the nearest working mirror. **Desktop AND 390 px.**
> If driving all three in one boot is unreliable, prove one enemy end-to-end in plain boot and cover the other two through the diagnostics surface — **but say plainly in your report which is which.** A weaker proof honestly labelled beats a strong-sounding one that did not run.

### 6. MUTATION CONTROL (mandatory — each new assertion must be able to fail)
Run separately, restore after each, paste both outputs:
- **Aim it at the defect's own branch:** swap the `sw` and `ne` file lists on **one** slot. Scope 5 must go **RED** for the wind whose row you moved. A test that still passes with the rows crossed is asserting "a walkdiag cell appeared", not "the RIGHT one did".
- **Aim it at the trap:** restore that slot's `aliases` map to its original value (from scope 1(c)) with `directions` still present. Scope 4's alias assertion must go **RED**. This is the one control that proves emptying the maps was load-bearing rather than decorative — **if it stays green, the aliases were never the blocker and you should report that as a finding.**

### 7. No-op guard
If you find yourself about to exit without changes, **write WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Firewall

**TOUCH-ONLY:**
- `assets/layer-contracts/characters.v2.json` — **only** the `char.bandit_base`, `char.bandit_thief`, `char.baron` entries' `walk8.directions` and `walk8.aliases`.
- `assets/processed/char-{bandit-base,bandit-thief,baron}-sheet-walkdiag8-*` + their `frames.json`, and the matching `assets/processed-full/` cells — **new files only**.
- the existing generic walk8-cell guard (extend/generalize only) and your new plain-boot spec.
- your run report under `tasks/runs/`.

**NO — do not touch, do not "fix", do not tidy:**
- **ALL of `src/**`, including `src/assets/SpriteAnimator.ts:843`.** This slice needs none: F-1175-1 measured the guard-widening alternative as inert for these three slots. If you believe `src/` is required, **STOP and report** rather than editing it.
- **`char.hero`** — slice 1 owns it and it is shipped. Do not re-bind, re-extract, or "tidy" its block, and **do not empty the hero's `aliases`**: its `:843` guard already shadows them and changing both surfaces at once makes a regression unattributable.
- **`char.claim_jumper`** — **owner-gated design fork** (F-1166-1; `tasks/025-vp-02e-jumper-8way-activation.md` is marked DO-NOT-QUEUE; `drain-block-check` lists leaf `025-vp-02e-jumper-8way-activation` as BLOCKED). Do not bind it, do not "notice" it into scope.
- **The other diagonal sheets** — `char-elder`, `char-newsie-mei`, `char-storekeeper`, `char-tavernkeeper`, `char-youngster-f`, `char-youngster-m`, `char-jumper`. No extraction, no binding, not even "while I'm here". Dead cells are bundle weight and the art session withheld them deliberately.
- **The four hero ages** (`char-hero-{claimday,midlife,silver,elder}-*`) — spec §2.3: they already carry all eight winds and belong in the `walk4` age path.
- **The town plaza actors and `src/town/TownScene.ts`** — spec §3.2 is the **other** binding surface and genuinely needs `src/`. Separate slice.
- `playwright.config.ts`, `package.json`, any `--workers` default.
- `assets/master-divergent.json`, `scripts/optimize-assets.mjs`, and the `resize`/`writePng` block inside `anim-pass-reextract.mjs` (byte-faithful by contract).

## Self-check before you report (evidence, not vibes)

1. `npx tsc --noEmit` — clean.
2. `npm run build` — green.
3. Your new plain-boot spec — green **desktop AND mobile (390 px)**.
4. The generic walk8-cell guard — green, and its output shows it covering the three new slots.
5. Adjacent suites unmodified-green **both projects**, named: `e2e/eight-winds-hero.spec.ts`, `e2e/066-walk8-engine.spec.ts`, and the run-scene enemy suite that exercises these three slots (find it and name it in your report). Any pre-existing red must be **fingerprint-matched to a known red with proof it is not yours** — `066` in particular carries a known red at `:234` (owner-gated F-1166-1 jumper fork). Do not "fix" it.
6. Zero console/page errors in the boot probes.
7. Screenshots to `artifacts/eight-winds-enemies/` — one per slot per project, on a diagonal leg.
8. Perf: frame p95 before/after (32 new cells × 3 sheets enter the lazy glob). A >15% regression fails the gate.
9. Both scope-6 mutation outputs pasted, each restored.

End your report with **READY-FOR-GATES** plus, explicitly:
- scope 1(a)–(d) results, including **whether `rotations.directions` is still empty** for these slots (confirming or refuting F-1175-1 — the next rung needs this either way);
- whether the scope-6 alias-restore control went RED (and if it stayed GREEN, say so loudly — that would mean the aliases were never the blocker);
- measured cell counts + `empty` counts per sheet, and the `--verify-downscale` `unexplained` count;
- anything you had to adapt, and anything you refused to touch.
