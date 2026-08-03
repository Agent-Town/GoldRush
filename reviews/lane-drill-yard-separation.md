# lane-drill-yard-separation — F-BW-5: the drill yard leaves the claims

**Slice:** `lane-drill-yard-separation` · **branch:** `lane/m3` · **tip:** `b295e2ab` · **base:** `4983ce03`
**Merged:** `9240479cf1eb13759c58ad81fee668aebcdd3030` (s1432, 2026-08-03)

## VERDICT: ACCEPT — merged with one deliberate graft.

## What it does
The drill yard stops masquerading as a contract. It moves out of the chapter's claim list into its own
**THE TRAINING GROUND** board section with distinct training dress and an "Enter the yard" CTA; in-run it
carries a `DRILL YARD — training` HUD tag and a no-stakes pause line ("This is practice. Nothing is at
stake. Leave anytime."), and the save line becomes "Practice resets when you leave." Mechanics are
unchanged — this is a framing fix, which is exactly what the owner's finding asked for.

Owner origin, 2026-08-03 playtest: he launched the drill yard **by accident**, believing it was a claim.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, exit 0 |
| `npx vite build` | green, **1.37s** |
| `drill-yard` + `board-era-chapters` + `board-gating-and-profiles` + `contract-briefings` + `town-t3-board` | **38 passed / 0 failed**, both projects, **7.8m** |
| Console/page errors | zero; specs report `watchErrors suppressed 0 known ... error(s)` |
| Screenshots | 10 PNGs, `artifacts/drill-yard-separation/` (before/after board, card, bell wave, yard dummies; desktop + 390px) |

Gated in a **detached worktree `gate-s1432`** (§3.0b — main's working tree never held undecided content).
Every playwright invocation passed `--workers=1` (§3.1).

⚠️ **Load context, stated because it bears on how to read a green:** two Codex lane runners (lane-c
`water-shore-truth`, lane-d `territory-ring-to-kit`) were executing throughout this battery. That is the
same contention that produced s1431's F-1431-1 and F-1431-4 false reds. It cuts one way only — a **green
under load is strictly stronger** than a green on an idle box, so no control run was owed here. A red
would have required one.

## Merge classification

Main moved **two** of the slice's files since the lane base `4983ce03`, so this was not a blind copy.

| Bucket | Files |
|---|---|
| **LANE-TOUCHED — clean copy** (12) | `contracts.json` · `board-era-chapters.spec.ts` · `board-gating-and-profiles.spec.ts` · `contract-briefings.spec.ts` · `drill-yard.spec.ts` · `town-t3-board.spec.ts` · `heraldReader.ts` · `TownScene.ts` · `TownWelcome.ts` · `town.css` · `Hud.ts` · `theme.css` |
| **BOTH-MOVED — grafted** (1) | `src/game/Game.ts` |
| **Safe-dupe — NOT merged** (1) | `e2e/beauty-town.spec.ts` |

### 🚨 The graft, and the trap it avoided
`src/game/Game.ts` differed from main in **three** hunks. Only the third was accepted.

- Hunks 1 (`:254`) and 2 (`:4607`) **REMOVE `reportRenderDemotion`** — its import and its call site. The
  lane's base predates `e49fc4e3`, so the lane never had that code; its blob "removes" it only in the
  sense that a stale base always does. **A wholesale copy would have silently reverted s1431's F-BW-4
  telemetry graft, landed twenty minutes earlier.** Rejected.
- Hunk 3 (`:7471`) is the slice's own work — the `training:` flag and the practice-aware `save:` line.
  Accepted. The anchor `save: this.runSuspendSaveLine,` was asserted **unique** in main's Game.ts before
  writing, and `reportRenderDemotion` was re-counted **after** the graft (2 occurrences, matching main).

### `TownScene.ts` is a clean copy — measured, not assumed
Main moved this file too, via `f90d3c34` (the f1429-1 `uninspectableFixtures` cure). The obvious inference
is "both moved ⇒ graft". It is wrong here: `uninspectableFixtures` counts **4 on both sides**, because the
lane already carries that same cure through its own commit `b925d706` — the very commit s1432's
predecessor clean-copied onto main. `BOTH-MOVED` is a triage bucket, not a loss verdict (F-1081-9).

### `beauty-town.spec.ts` — deliberately not merged
Blob-identical on both sides (`273c90470b8692044829a9e74fabdc2368b01a04`). It is the residue of the
already-drained `f1429-1` commit, and leaves `lane/m3` **falsely ahead** — a safe-dupe, not lost work.

## Findings

**F-1432-3 (non-blocking) — `lane/m3` is left falsely ahead by two commits and must NOT be read as holding
work.** After this merge, `b925d706` (drained s1431 as `f90d3c34`) and `b295e2ab` (drained here) are both
absorbed. `lane-usable` will report `AHEAD-BUT-ABSORBED`; cure with `--cure` (which archives the tip before
resetting) once the lane is idle. 🚫 Do not `reset --hard` it by hand.

**F-1432-4 (non-blocking, for the owner's eye) — the training-ground copy is a judgement, and a green suite
cannot verify it.** The 38 passing tests assert structure (the section exists, the tag renders, tap targets
survive at 390px). Whether "Practice ground — no stakes, no claim. The county lends the gold; the straw men
lend their patience." actually stops the owner mistaking the yard for a claim is answered only by his eye.
Screenshots are in `artifacts/drill-yard-separation/`. The mechanism is fixed; the wording is reversible.
