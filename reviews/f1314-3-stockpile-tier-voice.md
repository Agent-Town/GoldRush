# f1314-3-stockpile-tier-voice — drain review (s1316)

- **Slice:** F-1314-3 / F-1314-4 — Stockpile Yard tier voice
- **Branch / tip:** `lane/m3` @ `1530557b` (`fix: give Stockpile Yard its tier voice`)
- **Merge:** `8c8d6139` (`8c8d6139fb346594b5f65e66c640c31bcf4b63d8`), merge-base `e714d05f`
- **Verdict:** ✅ **MERGED** — code correct, gates green, two known reds unchanged. **One HIGH finding filed (F-1316-1), pre-existing and out of this slice's firewall.**

## What it does

Two buildables were silently sharing the turret's upgrade copy. The slice gives `stockpile` its own
voice in both places a player can hear it:

- `BuildSystem.upgradeFloatText` (`src/systems/BuildSystem.ts:2000`) now emits
  `Stockpile Yard II - the yard holds more gold` instead of falling through to the turret line, and the
  former silent fallback is now a compile-time `return id satisfies never` (`:2002`) so the next new
  buildable cannot inherit someone else's sentence by accident.
- `buildableTierEffectLine` (`src/game/buildables.ts:192-195`) adds the stockpile branch, reading
  `Balance.stockpile.capBonus × Balance.tiers.stockpile[tier-1].capMult` and rounding like the live cap
  path, so the build-menu blurb reads `T2: +240 gold capacity` from Balance rather than a literal.

One new e2e case in `e2e/bt-01-tiers.spec.ts` covers both, through a **plain resumed boot** (asserts
`searchParams.has('debug') === false` before any acceptance assertion — Mistake #10 answered).

## Scope 1 (the trace the master demanded) — ✓ RE-VERIFIED, not inherited

The master asked whether `tierGain` reaches a player before changing it. The runner traced it to
`UpgradeCandidate.gain` (`src/systems/BuildSystem.ts:1931`) → `Game.updateBuildingContextCandidates`
(`src/game/Game.ts:5898-5900`) → `BuildingContextPrompt.update` (`src/ui/BuildingContextPrompt.ts:57-104`),
which renders tier/cost/availability/reason/max-tier and never `gain`.

**I re-ran the search myself rather than accepting it:** `grep -rn "candidate.gain\|\.gain\b" src/ e2e/`
returns **five hits, all `AudioParam.gain` in `src/audio/SoundSystem.ts`** (`:151`, `:233`, `:292`, `:491`,
`:492`). Zero reads of `UpgradeCandidate.gain` anywhere in `src/` or `e2e/`. The runner correctly left
`tierGain` alone. ✓ VERIFIED.

## Evidence (all re-run on the MERGED tree, this fire, `--workers=1` per §3.1)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | **clean** (no output) |
| `npm run build` | **green**, 1.96 s; existing chunk-size advisory only |
| `e2e/bt-01-tiers.spec.ts` (own spec, both projects) | **20 passed / 4 failed (3.5m)** — the 4 are the 2 known reds × 2 projects, see below; the new case is green in both |
| Adjacent suites — **derived by grep**, not from the runner's list | **18 passed (1.6m)**, zero failures |
| `test:node-guards` (37 files) | **203 passed / 0 failed** (37.4 s) |
| Zero console/page errors | asserted inside the new case in both projects, plain boot |
| Screenshots | `artifacts/f1314-3-stockpile-tier-voice/{desktop,mobile}-chrome-{float,menu}.png` |

**Adjacent-suite derivation (F-«derive-adjacent-by-grep»):** `grep -rln "hud-build-blurb\|buildableTierEffectLine\|lastFloatText" e2e/`
→ `m2-01-build-menu.spec.ts`, `vfx-visualy.spec.ts`, `lane-crossing-armed.spec.ts` (+ the slice's own spec).
The runner ran two of these and substituted `en-02-e1-coverage`; **`lane-crossing-armed.spec.ts` was on my
list and not on its.** It passes. No divergence in outcome, but the derivation is the durable one.

**The two reds, fingerprinted as PRE-EXISTING (not inherited from the report):**
`Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button` and
`insufficient gold leaves tier and gold unchanged`. Both are recorded in
`reviews/bt-02-production-semantics.md` and appear in lane-d `suite-red-inventory` run logs dated
**2026-07-28/29**, days before this branch existed. Count and identity match the master's stated
expectation exactly: **exactly two, named in advance.**

## Merge classification

`git diff --name-only e714d05f..main -- src/ e2e/` → **empty**. Main moved **zero** source or spec files
since the merge-base, so all eight paths are **LANE-TOUCHED**, none MAIN-MOVED, no graft needed.
`--no-ff` merge, clean, no conflicts.

## Findings

### 🔴 F-1316-1 (HIGH, **pre-existing, out of this slice's firewall — filed, not fixed**) — every buildable upgrade float renders as a fragment, and `lastFloatText` hides it from every test

The runner flagged this inside its own firewall report as "long upgrade labels are visibly clipped."
**Reading the screenshot, it is materially worse than clipping.** In
`artifacts/f1314-3-stockpile-tier-voice/desktop-chrome-float.png`, the 43-character sentence
`Stockpile Yard II - the yard holds more gold` renders on screen as the two words **`the ya`**.

Cause, ✓ VERIFIED at source: `createTextTexture` (`src/systems/Vfx.ts:141-142`) allocates a **fixed
192 × 96** canvas, and `drawTextTexture` (`:157`) sets **`700 64px Georgia, serif`** with
`textAlign = 'center'`, then calls `strokeText`/`fillText` at `canvas.width / 2` with **no `measureText`,
no auto-fit, and no wrap**. At 64 px Georgia bold, ~192 px buys roughly **five to six glyphs**. Centering
means the overflow is discarded symmetrically from *both* ends — hence a middle fragment rather than a
truncation, which is why it reads as a different message rather than an incomplete one.

**This is a class defect, not a stockpile one.** Every string that goes through `upgradeFloatText` is a
sentence: `Turret II - brass cadence quickens`, `Sluice II - the works run richer`,
`Palisade II - timber holds longer`. All exceed the box by an order of magnitude, and have since the
feature shipped. Short floats (damage numbers, gold pickups) are unaffected — they fit.

**Why no test has ever caught it, and why that matters here specifically:** the assertion path is
`window.__THREE_GAME_DIAGNOSTICS__.vfx.lastFloatText.text` — the string the game *intended*, recorded
before rasterisation. The canvas is never measured. So a green test certifies a message the player
demonstrably does not receive. **This is s1315's F-1315-1 trap one layer down**: there, an error message
named a set it no longer described while `:40` stayed green; here, a float names a benefit the player
sees six letters of, while the spec stays green. In both cases the instrument reads the *intent* and the
defect lives in the *rendering of it*.

**Not blocking this merge**, on two counts: (a) it predates the branch and reproduces identically on
`main` without it; (b) `src/systems/Vfx.ts` is on this task's **NO** list, so fixing it here would have
been a firewall violation — the runner was right to report and stop (CLAUDE.md §4.5: "Codex reporting
adjacent problems = good; fixing out of scope = violation"). The build-menu half of this slice — the
`T2: +240 gold capacity` line — is HTML and renders correctly; see `…-menu.png`.

**Corrective owed:** a Vfx slice that fits the text to the box (measure-and-scale, or wrap to a taller
canvas, or shorten the copy to a name-plus-tier and move the flavour to the context prompt — the third
is a copy decision and the cheapest). Whichever is chosen, the acceptance test must assert **rendered
extent**, not `lastFloatText`, or the same green will certify the same lie. Filed on the desk for a
one-line owner steer on copy-vs-renderer; the renderer fix needs no ruling.

### ⚪ F-1316-2 (INFO) — the `never` guard is real, and it is the durable half of this slice

`return id satisfies never` at `src/systems/BuildSystem.ts:2002` converts the original defect class —
"a new buildable silently inherits the turret's sentence" — from a runtime near-miss into a compile
error. `tsc --noEmit` is clean, which proves the union is exhaustively covered today. This is worth more
than the two strings it accompanies.
