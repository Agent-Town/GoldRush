# e2-rail-tough-only-bind — drain review (s1224)

**Slice:** `tasks/lane-a-e2-rail-tough-only-bind.md` (FIRE-AUTHORED s1221)
**Branch:** `lane/m3` · **lane tip:** `785e5091` · **lane base (merge-base):** `896a79c4`
**Merged to main:** see the drain commit for this file
**Drained by:** s1224 fire, 2026-07-29

## Verdict: **MERGE — scope 1 PASSED with a real measurement, the firewall held byte-for-byte, and every red on the gate battery is pre-existing or load, proven by a control on pre-merge main.**

## What it does

Binds the four diagonal headings of **one** E2 enemy — Rail Tough, and only Rail Tough — to
real extracted art, after first *proving* that the sheet's repaired front rows are a lawful
mirror pair. Slice 3 of this ladder tried to bind all three E2 sheets and correctly **STOPPED**
because the row→heading mapping was unestablished; F-1188-2 then ruled that the premise must be
settled for all three before any of them ships. Rail Tough is the one sheet whose four rows have
since been addressed, so this task takes it alone and leaves Steam Wrecker and Coal Thief — both
still carrying a wrong row under the open F-1193-3 — byte-untouched.

The scope-1 gate could have cancelled the whole task; a STOP there would have been a success.
It passed, on a measurement the runner made rather than inherited.

## Evidence — measured by the drain on the MERGED tree, not copied from the runner

| gate | result |
|---|---|
| `npx tsc --noEmit` | **clean** (3.6 s) |
| `npm run build` | **green** (14.1 s, `✓ built in 1.61s`); asset-diet green — Herald dev-path `1099906 / 1500000` bytes |
| `npm run test:node-guards` | **78 tests, 78 pass, 0 fail** — counter read, not just rc |
| `npx playwright test --list` | **2468 tests in 345 files** (main was 2466/344 ⇒ +2 tests, +1 file = the new spec × 2 projects) |
| own spec, both projects | `Running 2 tests using 2 workers` → **2 passed** (desktop 11.9 s, mobile 13.1 s) |
| adjacent battery (8 specs) | `Running 46 tests using 8 workers` → 37 passed, **7 failed — all accounted for below** |
| plain-boot, zero console/page errors | asserted **inside** the new spec on a no-`?debug` route, desktop **and** 390 px, both green |
| screenshots | `reviews/shots-e2-rail-tough-only-bind/` — desktop + mobile plain boot, plus 4×/3× zoom crops |

### The guard-count arithmetic is the interesting number

The runner measured node-guards **76/76** against a **74** baseline. That baseline was its own
stale lane base. Main's baseline had meanwhile become **76** (s1222 added
`scripts/bench-seeds.test.mjs`), so the merged tree must read **78** — and does. Both guards
survived the `package.json` 3-way graft; neither list entry was dropped.

## Merge classification

Lane base `896a79c4` predates the s1222/s1223/s1224 merges, so the two-dot `main..lane/m3` diff
displays **~29,000 deletions** — `bench-seeds.json`, `standings.ts`, two review files, the whole
`logs/session-scratch/` tree, the s1223 sweep edits. **Every one of those is a phantom of the
stale base, not a deletion the lane made.** Classified against the merge-base instead:

- **LANE-TOUCHED: 29 files** — `artifacts/eight-winds-rail-tough/**`, `characters.v2.json`,
  16 `char-railtough-sheet-walkdiag4-a-*` cells + `.frames.json`, the new
  `e2e/e2-rail-tough-diagonal.spec.ts`, `logs/s1190-rail-tough-wrench-probe.mjs`,
  `scripts/character-direction-assets.test.mjs`, the four screenshots, `package.json`.
- **BOTH MOVED: exactly 1** — `package.json`. Hand-grafted: main added
  `bench-seeds.test.mjs`, the lane added `character-direction-assets.test.mjs`; the merged list
  carries **both**, alphabetically.
- **28 lane-only files** taken verbatim via `git checkout lane/m3 -- <paths>`.
- **`src/` files touched: ZERO.** The firewall's headline prohibition held exactly.

The contract diff is one slot: four explicit `sw`/`se`/`nw`/`ne` direction entries added to
`char.e2.rail_tough.walk4`, and its `aliases` emptied from
`{ "se": "e", "ne": "e", "sw": "w", "nw": "w" }` to `{}`. That alias map is the trap that would
have made a correct edit do nothing — the alias pass runs *after* explicit directions and
`SpriteAnimator.ts:843` exempts only `charHero`. The runner emptied this one slot rather than
widening the `src/` guard, which is the surgical and reversible move the master demanded.
`char.e2.steam_wrecker` and `char.e2.coal_thief` are untouched.

## The 7 adjacent failures — every one attributed, none caused by this merge

The runner ran only three adjacent specs and **never ran `e2e/e2-enemies.spec.ts` at all**, which
is the most obviously adjacent spec on the board. The drain ran all eight and found seven reds.
A control was then built on **pre-merge main** (detached worktree at `b9918410`, served on scratch
port **5236** — port 5188 is shared with the live lane worktrees) and **validated before use**:
the control server serves the old contract with no `walkdiag4` cells, confirmed over HTTP.

| failure | projects | control on pre-merge main | verdict |
|---|---|---|---|
| `e2-enemies.spec.ts:113` (asserts at `:125`, `maxHp` 34.02 vs 37.9323) | both | **FAILS 2/2** | **pre-existing**, and already in `logs/suite-red-inventory.md:102-103` at 63.2% |
| `e2-enemies.spec.ts:314` (asserts at `:317`, wave-hash mismatch) | both | **FAILS 2/2** | **pre-existing**, already in the inventory at `:100-101`, 75.0% |
| `wire-e2-enemy-walk4.spec.ts:15` (E1 control times out on `char.bandit_base.loaded`) | both | **FAILS 2/2** | **pre-existing** — but **NOT in the inventory** (F-1224-3) |
| `e2-pressure-garden.spec.ts:66` | desktop only | **PASSES** | **load flake** — re-run alone on the merged tree: **2/2 green** |

6 of 7 reproduce identically on a tree that does not contain this slice. The 7th is asymmetric
(desktop red / mobile green) at 46 tests × 8 workers and goes green in a quiet box. **Zero
regressions are attributable to this merge.**

Note the coordinate split, which is this fire's other subject: the inventory keys these reds on
their **assertion** lines (`:125`, `:317`) while playwright reports their **declaration** lines
(`:113`, `:314`). Same subject, two coordinates — exactly the class F-1224-1 measured.

## Findings

- **F-1224-3 (new, non-blocking) — `e2e/wire-e2-enemy-walk4.spec.ts:15` is a baseline red on main
  in BOTH projects and is absent from `logs/suite-red-inventory.md`.** Its E2 roster/motion half
  passes; the failure is its unrelated **E1** control timing out after five seconds waiting for
  `char.bandit_base.loaded`. Independently reproduced here on a pre-merge control, 2/2, matching
  the runner's own detached-main finding. It is unrecorded, so the next fire to run an E2-adjacent
  battery will re-litigate it exactly as this one did. **Corrective: add the row to the inventory
  with its measured rate; diagnosis of the E1 loader is a separate slice.**
- **F-1224-4 (new, non-blocking, process) — the runner's adjacent-suite selection missed the
  spec named for the subject.** It ran `eight-winds-hero`, `lane-c-activations-assay-office` and
  `wire-e2-enemy-walk4`, but not `e2-enemies.spec.ts` — the spec whose own title is *"wave pulses
  spawn **Rail Toughs**, Steam Wreckers, and Coal Thieves"*. Nothing shipped wrong because the
  reds were pre-existing, but the gate battery was blind where it most needed to see.
  **Corrective: adjacent-suite selection should be derived mechanically (grep the subject's
  identifiers across `e2e/`) rather than chosen by hand** — that is how this drain found the
  eight, and it cost one command.

## Non-blocking observations carried from the runner (not re-verified by the drain)

The runner's own screenshot critique reported pre-existing readability debt outside this
data-only firewall: the Rail Tough silhouette is soft and low-contrast over the dark rail bed,
grounding is weak, and the mobile HUD obscures much of the world. No art/UI/lighting/`src/` fix
was attempted, correctly. **This is owner-facing art feedback, not a defect of this slice.**
