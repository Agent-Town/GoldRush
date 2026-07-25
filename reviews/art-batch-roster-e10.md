# Review — art-batch-roster-e10 (Deep Sky / The Static enemy sheets)

**Slice:** `art-batch-roster-e10` (ART slot) · **Generated:** 2026-07-25 by runner commit `9545a301` · **Drained:** s1061, 2026-07-26
**Branch/tip:** ART slot output — `worktrees/art/` is NOT a git worktree, so there is no lane branch; raws were copied from `worktrees/art/assets/raw/` onto main.
**Done-move:** `tasks/done/20260725-005935-art-batch-roster-e10.md` (un-prefixed for 28h — this drain is what retires it)

## VERDICT: **ACCEPTED — reference-tier. Raws landed + QA'd + LEDGERed. Deliberately NOT extracted, NOT wired.**

## What it does

Five assets for the tenth and final era's non-boss roster: three 4×2 walk8 sprite sheets
(`static_mote`, `unraveled_machine`, `static_squall`) and two full-bleed 1672×941 stills
(`plate-e10-enemy-unraveled_machine.png`, `plate-e10-enemy-static_squall.png`). The
`the_quiet` boss row was excluded because its boss system is shipped and bosses have models;
the third still already existed as `plate-e10-enemy-static-motes.png`, so no duplicate was made.

E10 was the **only era with no roster art on main** — E6/E7/E8/E9 all have extracted cells in
`assets/processed/` (30/21/21/21 files). This drain closes the *art* half of that gap. It does
not close the *wiring* half, and deliberately so — see F-1061-2.

## Evidence

| Check | Method | Result |
|---|---|---|
| Bytes landed == bytes QA'd | SHA-256 of all 5 files vs the run note's table | **5/5 MATCH** |
| Dimensions | PNG IHDR read directly | 280×170 · 1120×680 · 2240×1360 · 1672×941 ×2 — all match run note |
| Grid regularity | re-derived independently, not trusted | 280/4=70, 170/2=85 · 1120/4=280, 680/2=340 · 2240/4=560, 1360/2=680 — **exact, no remainder** |
| Height bands | run note measured vs 292px bandit reference | 0.25× / 1.00× / 2.00× cell bands as specced |
| Key purity | run note, measured | 72.897% / 77.714% / 73.015% exact `#ff00ff`, **zero** near-magenta non-key pixels |
| Frames distinct, no mirrors | run note, measured | 8/8 unique hashes each; min mirrored RMSE 0.189 / 0.214 / 0.233 |
| Canon (§9 / ADR-001) | **direct full-size visual inspection of all 5, this drain** | zero letters/numbers/watermarks · NO firearms · warm never gory · no peoples-as-enemies · blank portrait + resonator faces |
| Retention | `node scripts/art-staging-audit.mjs` | **AT RISK 0 files / 0 KB · LOCAL-ONLY 0 files / 0 KB** |
| Backup | `git ls-remote origin refs/heads/main` SHA-compare via node | origin `715dc427` == local `715dc427` |
| tsc / build | **not run — and named rather than padded** | this commit adds only `assets/raw/` PNGs + a run note + docs; zero TypeScript, zero `src/`, zero glob inputs, so neither would exercise the change |

Visual QA notes: **Unraveled Memory** — brass jointed automaton walking right, amber memory-lamp,
teal lens, half-un-inked pale trailing limbs that keep the E7 source silhouette readable.
**Static Mote** — tiny faceless parchment wisp with a thin rim; its 25 KB file size is the
*intended* 280×170 canvas at the 0.25× band, not a failed generation (checked before landing).
**Static Squall** — torn-paper front with deep-ink stipple and an ochre/teal re-ink wake; a
weather band, not a body, exactly as `specs/enemy-rosters-e6-e10.md:101` requires.

## Merge classification

Pure additive. Six new files under `assets/raw/` (5 assets + the codex run note), one new
`assets/LEDGER.md` entry (58), one new review file, one BACKLOG event line, one done-move rename.
**No file was modified in place; no conflict was possible; nothing in `src/` or `e2e/` was touched.**

## Why NOT extracted (the finding that shaped the drain)

The E7/E8/E9 precedent (LEDGER 54/55/56, drains s765/s769/s770) extracts **only the sheets that a
roster scaffold already renders as placeholders**, then flips `placeholder`→`false`. E10 has no
such scaffold:

- `src/entities/pools.ts:119` — the cell globs are **era-specific** (`char-e9-*-sheet-walk8-r*c*.png`). There is no `processedE10SpriteCells`.
- No `e10EnemySpriteBinding()`. No `e2e/e10-roster.spec.ts` (E10 has finale-staging, research-tree, river-boot-guard, static-boss — no roster).
- `src/assets/generated.ts` stops at E9 (`:21-22`).
- `static_mote`, `unraveled_machine`, `static_squall` appear **nowhere in `src/` or `e2e/`** — only in `specs/enemy-rosters-e6-e10.md:99-101,145-147,192-194`.

So extraction would write ~24 processed cells + 3 `.frames.json` that **no glob consumes** — dead
weight in the bundle immediately after THE ASSET DIET (`0dfa1d3f`) cut dist 1.0 GB → 411 MB. Held
as raws under the standing `static_hare` / `debris_rain` / `dust_devil` RAW-PENDING precedent.

## Findings

**F-1061-1 (non-blocking; for whoever wires the hazard).** In every Squall frame the un-inked
mass sits on the LEFT and the re-inked colour wake on the RIGHT; the still plate reads the same
way. The run note asserts "all motion directed right", which holds if the un-inked zone is read as
*already passed* — but `specs/enemy-rosters-e6-e10.md:101` says colour returns **behind** it, which
implies the opposite travel. Harmless while unwired; the hazard slice must pin the direction before
scheduling the front, or it will tile backwards.

**F-1061-2 (owner/attended decision — explicitly NOT fire-authorable).** Wiring E10's roster is not
a copy of the E6-E9 scaffold pattern. `static_squall` is a hazard the spec says *"never enters
`enemyRoster`"*, and `unraveled_machine` is a mask that reuses **whichever prior-era enemy sheet it
wraps, at that sheet's original height** — a presentation mechanic no prior era has. Both are design
forks, so §2E's hard limit forbids a fire authoring them. On the owner's desk, not taken.
**Reject-don't-stretch.**

**F-1061-3 (retention, non-blocking, carried).** These five files spent 28h in the untracked
`worktrees/art/` staging dir plus a local salvage branch — the standing F-1045-1 hole. They are on
main now, and the audit reads clean, but the hole itself is unchanged: `worktrees/art/` is still not
a git worktree. Four more SALVAGED files from *other* batches (`char-bandit-wrecker-sheet-walk8`,
`char-hero-sheet-idle8`, `plate-e3-boss-crawler`, `codex-art-run-art-batch-hero-ages.md`) plus 14
DIVERGED regenerated building/contract plates remain parked in staging, in git but not on main,
awaiting their own batches' drains.
