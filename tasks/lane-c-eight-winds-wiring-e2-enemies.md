# Task lane-c-eight-winds-wiring-e2-enemies: EIGHT WINDS slice 3 — give the three E2 enemies real diagonals (LANE-C, commit prefix "feat:")

**FIRE-AUTHORED s1187 (attended review welcome).**

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-c`.

READ FIRST:
- `AGENTS.md`
- `reviews/eight-winds-wiring-spec.md` — **§2.2 the sibling table (your three rows are the last three), §2.3, and the "three traps" section.** This is the authorizing spec.
- `reviews/eight-winds-wiring-enemies.md` — slice 2's review. **Your slice is the same transformation on three more slots; read what it did and what it broke.**
- `tasks/lane-c-eight-winds-wiring-enemies.md` — slice 2's master. Its shape is your template.

CODEX: gpt-5.6-sol effort=high

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/e2-arsenal main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

*(Measured by the authoring fire at 2026-07-29T00:2xZ: `git log --oneline main..lane/e2-arsenal` was EMPTY — the lane was exactly at main. Re-derive it anyway; the board moves.)*

## Why (spec `reviews/eight-winds-wiring-spec.md` §2.2; ladder release `tasks/BACKLOG.md:1643` "EIGHT-WINDS-WIRING is now FIRE-AUTHORABLE"; slice 2 shipped `c3d8470e`)

`OrientationResolver.ts:1` already computes all eight winds and **collapses the diagonals to 4 rows at `:52`**. Eight-winds-wiring means: stop collapsing where a diagonal sheet exists. Slice 1 did the hero (`29bac3d9`), slice 2 did the three outlaws (`c3d8470e`). **These three E2 enemies are the last unbound rung whose art is already on disk and whose slots are not owner-gated.**

Every premise below was re-verified at source by the authoring fire — **re-derive them anyway, and STOP if any is false:**

1. **The art is tracked, unprocessed, and unwired.** Of 18 diagonal raw sheets in `assets/raw/`, only 4 have processed cells (hero + the three outlaws — i.e. exactly what slices 1–2 shipped). Your three — `char-railtough-sheet-walkdiag4-a.png`, `char-steamwrecker-sheet-walkdiag4-a.png`, `char-coalthief-sheet-walkdiag4-a.png` — have **no** `assets/processed/` cells and appear **nowhere** in `assets/layer-contracts/characters.v2.json`. So extraction IS in scope, per `BACKLOG:1643` ("one-command reversal per sheet when wiring lands").
2. **The dimensions are deliberate.** IHDR read directly: all three siblings are **1252×1252** while their `walk4-a` bases are **1254×1254**. Spec §2.2 rules this correct and explicitly forbids "fixing" it: `extract-alpha` slices at `floor(w/cols)`, so a 1254 px base at 4 columns yields cell **313** with 2 px of never-sampled remainder; the sibling is built at exactly `4 × 313`. **Do not resize, pad, or normalise these sheets.** Grid is **4×4**, cell **313**, **4 frames** per direction.
3. **The slots are already bound for cardinals, and their aliases are the whole problem.** `characters.v2.json` — `char.e2.rail_tough` (`:197`), `char.e2.steam_wrecker` (`:212`), `char.e2.coal_thief` (`:227`) — each carries an ACTIVE `walk4` block with `directions {s,w,e,n}` and **`aliases {"se":"e","ne":"e","sw":"w","nw":"w"}`**. Those aliases are what currently fakes the diagonals.
4. **The alias loop will silently defeat you if you only add directions.** `src/assets/SpriteAnimator.ts:822` populates `orientations` from `walkSheet.directions`, then the alias loop at **`:839-850` overwrites them**. Its escape hatch at `:843` tests `slot.rotations.directions` — **a different map, and it is EMPTY for all three of your slots** (measured; same finding as F-1175-1 for the outlaws). ⇒ **Emptying `aliases` is REQUIRED, not stylistic.** Adding `directions` while leaving `aliases` populated ships a no-op that still renders the cardinal art on diagonals.

## ⚠️ THE RIDER THAT MATTERS MORE THAN THE FEATURE (F-1185-6)

**Slice 2 performed this exact transformation — explicit diagonal `directions` + emptied `aliases` — and it broke the ENTIRE e2e suite for ~50 minutes.** `e2e/lane-c-activations-assay-office.spec.ts` resolved rows as `aliases[dir] ?? dir` → `rowDirections.findIndex(...)`; with `aliases` emptied, `findIndex("se")` returned `-1` and threw **at collection time**, taking **all 337 spec files** to `Total: 0 tests in 0 files`. **s1184 gated slice 2 on scoped specs only, so this was structurally invisible to it — a scoped run never collects the suite.**

That spec was repaired in s1185 (prefer the contract's declared `directions[dir].frames.files`, keep the row path for cardinals). **Whether that repair generalises to YOUR three slots is a hypothesis, not a fact** — and your blast radius is wider than slice 2's: **12+ e2e specs name these three slots** (`e2-enemies`, `e2-clarity-and-wreckers`, `e2-pressure-garden`, `e5-arsenal`, `e7-arsenal`, `e8-arsenal`, `enemy-gap-flow`, `freed-walkers`, `freed-legibility`, `fevered-tell`, `ledger-era-chapters`, `072-era-activation`, …). Slice 2 touched slots named by three.

**Therefore scope 4 is not optional and not a formality.** A green scoped run means nothing here; only a collection check does.

## Scope

1. **MEASURE-FIRST BASELINE (do this before you change anything, and record the numbers in your report).**
   - `npx playwright test --list` → record **exit code** and the exact `Total: N tests in M files` line.
   - `npm run test:node-guards` → record the pass count and exit code.
   - If either is ALREADY red on untouched main: **STOP and report it.** You have found a pre-existing factory break and that outranks this slice.

2. **Extract the three sheets.** Use the house command per sheet, `4×4`:
   `node scripts/extract-alpha.mjs --key ff00ff --grid 4x4 <sheet>` (match slice 2's invocation exactly — read its run report for the flags actually used, including any `processed-full`/master-size behaviour; **do not invent flags**).
   Report per sheet: cells written, cell size, empty-cell count. **Expect cell 313 and 0 empty cells.** Any deviation → report it before proceeding, do not "fix" the sheet.

3. **Bind the diagonals in `assets/layer-contracts/characters.v2.json`** for the three E2 slots only:
   - Add explicit `se / ne / sw / nw` entries to each `walk4.directions`, each with its four `frames.files` **and an explicit `clips.walk { frames:[0,1,2,3], fps:8 }`** — matching the cardinals' existing fps of **8** (slice 1 learned that without an explicit clip, `withWalkSheetCadence` returns the source *uncadenced* and diagonals drift out of step with the cardinals).
   - **Empty each slot's `aliases` to `{}`** (required — see Why §4).
   - **Determine the row→direction mapping empirically from the extracted cells, and state your evidence.** Do NOT assume slice 1's hero order (`0=sw 1=se 2=nw 3=ne`) transfers. Spec §2.2's anti-mirror law applies: SW/SE are front-three-quarter, NW/NE back-three-quarter. If you cannot tell two rows apart with confidence, **STOP and report** rather than guess — a wrong mapping renders backwards and no test will catch it.

4. **PROVE YOU DID NOT REPEAT F-1185-6 (mandatory, both halves).**
   4a. `npx playwright test --list` → **exit 0**, and `Total:` must match your scope-1 baseline (**tests and files**). A drop to `0 tests in 0 files`, or any decrease, is a **collection break**: report the throwing file and its line, and **STOP** — do not paper over it with a broad edit.
   4b. `npm run test:node-guards` → same pass count as scope 1, exit 0.

5. **Adjacent suites, named not implied** — both projects, `--workers=1`: `e2e/e2-enemies.spec.ts`, `e2e/e2-clarity-and-wreckers.spec.ts`, `e2e/lane-c-activations-assay-office.spec.ts`, `e2e/eight-winds-hero.spec.ts`, `e2e/vp-02b-rotation-resolver.spec.ts`. Any NEW red → report with the failing assertion quoted; do not edit the assertion.

6. **Evidence a human can check without running anything.** Screenshots of each of the three enemies on all four diagonals → `artifacts/eight-winds-e2/{desktop,mobile}-chrome-<slot>-<wind>.png`. In the report, print the full derivation per slot: direction → row → frame keys, so the mapping can be checked against the contract by reading.

## Firewall

**Touch ONLY:** `assets/layer-contracts/characters.v2.json` (the three `char.e2.*` slots), new cells under `assets/processed/`, new screenshots under `artifacts/eight-winds-e2/`, and your run report.

**NO changes to:**
- ❌ **`src/**` — ZERO.** This is data-only. `git status --porcelain -- src` must be EMPTY at the end. (The spec's suggested `SpriteAnimator` one-liner is **inert here** — the `:843` escape hatch reads `rotations.directions`, measured empty for all three slots — so it is closed, not offered.)
- ❌ **Any existing e2e assertion.** If a spec goes red, that is a finding to REPORT. Greening a test by editing it is the REJECT condition.
- ❌ `char.hero`, `char.claim_jumper` (owner-gated **F-1166-1**; `tasks/025-*` is DO-NOT-QUEUE — read it, never edit it), `char.prospector_agent`, the four hero ages (spec §2.3), and the other diagonal sheets (Mistake #8 — one rung at a time).
- ❌ The three slots' **cardinal** `s/w/e/n` entries, their `fallback`, and the 1252/1254 sheet dimensions.
- ❌ `TownScene.ts` and the plaza actors — spec §3.2, a different surface that genuinely needs `src/`.

## No-op guard

If you find yourself about to exit without changes, **WRITE WHY into your report first.** A silent no-op wastes a queue slot and a gate. Likewise: a **STOP at scope 1, 3, or 4a is a SUCCESS**, not a failure — this master pre-declares it. Report the evidence and stop; do not improvise past a gate.

## Self-check (evidence, not vibes)

- [ ] `npx tsc --noEmit` clean · `npm run build` green (report the bundle delta — 48 new cells will move it).
- [ ] **`npx playwright test --list` exit 0 with the baseline `Total:` restored** (scope 4a) — quote both the before and after lines.
- [ ] **`npm run test:node-guards` exit 0**, same count as baseline (scope 4b).
- [ ] The five named adjacent specs, **both projects** (desktop + 390 px mobile), `--workers=1`, unmodified-green — or each new red reported with its assertion.
- [ ] Zero console/page errors in a **plain boot** (no `?debug`), desktop and 390 px.
- [ ] `git status --porcelain -- src` EMPTY.
- [ ] Screenshots at the exact paths in scope 6; per-slot derivation table in the report.

End: **READY-FOR-GATES** + report (a) the scope-1 and scope-4 collection numbers side by side, (b) the row→direction mapping per slot **with the evidence you used to decide it**, (c) extraction stats per sheet, (d) any adjacent red with its assertion quoted, (e) anything you were forbidden to fix but noticed.
