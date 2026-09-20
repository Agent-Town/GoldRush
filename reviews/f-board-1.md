# f-board-1 — the board names its minds (harness + model on every entry)

- **Slice:** f-board-1 (`tasks/done/20260808-164322-lane-fboard1-named-minds.md`), attended-queued 16:34, run complete 16:54
- **Branch / tip:** `lane/b` @ `1d822dea60ca6a7c27bff19f549217621b96a2b5` (ahead=1, base `06b79291`)
- **Gated by:** s1563 fire, in detached worktree `gate-s1563` (§3.0b custody — undecided content never entered main's working tree)
- **Salvage ref:** `archive/lane-b-s1563-fboard1-0a1fa333e`

## VERDICT: **HOLD — NOT MERGED.** Blocking regression on the slice's own named spec (F-1563-1).

The slice's design is right and the owner's ruling is faithfully implemented on the API side. It is held for
one defect, in the client-side payload validator, which **silently blanks the entire county board against the
payload production is serving today**. The cure is small and named below.

## What it does

Implements the owner ruling of 2026-08-08 ("I think we have to not make it anonymous and explain which harness
and which model were used for each entry"), superseding the AP-06 species-blind DISPLAY law. Rank order stays
outcome-only. `boardRow` (functions/api/standings.ts) now publishes `declared` plus `model` / `harness` /
`harnessVersion` when the stored row declares them, per row AND per posse rider; `reader.ts` renders a compact
`model · harness` badge, `Undeclared rider` where no stack was declared. The superseded comment is preserved as
history rather than deleted (retention style, as instructed).

## Evidence (measured on the MERGED tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `drain-block-check --strict` | ✅ CLEAR — `[f-board-1-named-minds] status="planned"` (first command of the drain) |
| `npx tsc --noEmit` | ✅ rc=0, clean |
| `npm run build` | ✅ green, built in 1.08s |
| `node scripts/test-stats.mjs` | ✅ 87/87 |
| `node scripts/test-multiplayer.mjs` (F-1229-1, `functions/` touched) | ✅ 462/462 |
| `e2e/milk-county-board.spec.ts` | ✅ 14/14 desktop + 14/14 mobile |
| `e2e/field-book.spec.ts` (adjacent — also feeds `/api/standings`, run by nobody upstream) | ✅ 6/6 |
| **`e2e/lb-01-county-standings.spec.ts`** | ❌ **2 failed / 32** — `:550 Claim Ledger renders the seeded county board and its empty contract state`, **desktop AND mobile** |
| **CONTROL — same test, same shell, clean main `36303af00 (archive: pruned by the A3 rewrite)`** | ✅ **1 passed (3.5s)** — the red is the slice's, not the instrument's |
| `test:node-guards` | NOT RUN, and deliberately: the diff touches `src/encyclopedia/`, `functions/`, `e2e/` — **no `src/sim/`, `src/systems/` or `src/entities/`**, so F-1460-1 does not bind. I claim no coverage from it. |

Failure evidence: `reviews/shots-f-board-1-hold/blank-county-board-desktop-chrome.png`.

## Merge classification

Base `06b79291`. `node scripts/lane-freeze-classify.mjs lane/b` → **paths=11, DUPLICATE 0, LANE-ONLY 11,
MAIN-ONLY 0, BOTH-MOVED 0**. `git log lane/b..main -- <the 5 code/test paths>` is **empty** — main has moved
none of them since the base, so no graft is required and the merge itself is clean (`ort`, no conflicts).
Nothing about the merge mechanics blocks this; only the gate does.

## Findings

### F-1563-1 — BLOCKING. The new client validator hard-requires `declared`, and silently drops every row that lacks it — which is every row production serves today.

✓ VERIFIED by reading the code and by control run, not inferred.

`reader.ts:676` adds `isStandingStack(row)` to `isCountyStanding`, and `isStandingStack` opens with
`typeof value.declared === 'boolean'`. `isCountyStanding` is consumed at `reader.ts:661` as
`board.slice(0, 100).filter(isCountyStanding)` — a **per-row silent drop**. A payload whose rows predate this
slice therefore yields an **empty array**, and the board renders its empty state.

**Why this is a product defect and not a stale fixture.** `src/app/GameApi.ts:1` pins
`GAME_API_ORIGIN = 'https://gold-rush-3in.pages.dev'` — a **hardcoded production origin**. Every client
addresses production's `/api/standings`: dev builds, preview builds, and any client newer than the deployed
function. The failing test fabricates exactly the shape production serves right now, and the merged client
blanks the board against it. So the red is not the fixture being out of date; **the fixture is the canary, and
it fired.** The runner updated the sibling API-level assertion (lb-01 `:213`, correctly) and left the UI seed
at `:550` untouched.

**Failure mode is the worst available one: silent.** No console error, no page error — `expectNoErrors` passes.
The screenshot shows the board reading *"No standings yet – the door is open."* immediately beneath this
slice's own new copy, *"Every rider names the mind and rig they declared."* Three rows were served; the player
is told there are none. That is the Mistake #10 shape — a user-facing surface that a plain boot cannot see.

**Recommended cure (for the corrective, to be verified not assumed):** treat an ABSENT `declared` as
`declared: false` rather than as grounds for rejection — the row degrades to `Undeclared rider`, which is
already this slice's own semantic for a row with no stack (the master: *"A row with NO stack is a
human-or-undeclared entry: include `declared: false`"*). The proof that this is the right cure and not a
fixture edit: **the lb-01 test at `:550` then passes UNMODIFIED.** Do not cure this by adding `declared` to the
fixture — that would edit away the only thing standing between production and a blank board.

### F-1563-2 — NON-BLOCKING (process). The runner edited a spec file and never ran it.

Its report claims *"board e2e 14/14 across desktop/mobile, focused API test 2/2"* — that is
`milk-county-board.spec.ts` (14) plus a focused API case. It changed `lb-01-county-standings.spec.ts` by 16
lines and never executed the file, so the suite it had just edited never told it what it had broken. The
master's self-check said *"Board e2e green desktop+390px"*; with two board specs in the tree, "the board e2e"
was ambiguous enough to be satisfied by the wrong one. Corrective masters in this area should name spec files
by PATH, never by role. `e2e/field-book.spec.ts` — a third consumer of the same endpoint — was likewise run by
nobody upstream; it is green (6/6), verified here.

## Disposition

- Lane tip archived to `archive/lane-b-s1563-fboard1-0a1fa333e` before anything else, per Mistake #2.
- **`lane/b` MUST NOT BE REFILLED** while it holds this undrained commit. The corrective (`f1563-1`) builds
  ON TOP of the existing lane tip and its pre-flight forbids the reset, precisely so this work is not destroyed.
- The API-side half of this slice is sound and is NOT in dispute; the corrective preserves it whole.
