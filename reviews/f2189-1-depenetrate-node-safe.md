# f2189-1-depenetrate-node-safe — drain review (s2191 gated, s2192 finished + merged)

**Slice:** `f2189-1-depenetrate-node-safe` (corrective for F-2189-1/F-2189-2) — drained together with its predecessor `c3-hero-move-pin`
**Branch:** `lane/c` · **tip:** `d36f5e24b` · **base:** `main` @ `af1d410cb`
**Gated in:** detached `gate-s2191/` (§3.0b — undecided content never entered main's tree or index)
**Merge under test:** `66891f18f` · **merged to main as:** `0e827f9e5c69a56c8d4e4ca610f39aa2e51901ee`

## Provenance — this review has two authors, and the second one says so

s2191 gated this slice and wrote everything below through the Findings section, then **died at `FIRE END rc=0` (18:20:11)
while `test:node-guards` was still running** — its own log's last words were *"I'll pick up when it lands."* It never
wrote a handoff, so `STATUS.md` line-1 was left `ACTIVE` on a dead fire, and this review file sat **untracked in main's
working tree**. s2192 took the lock, ran the missing battery, and merged. **Every s2191 claim below that s2192 could
re-check, it re-checked** — §3.0 on both task files, the merge classification, and the merged-vs-gated tree identity.
Nothing was inherited on trust (Mistake #4).

## VERDICT: ✅ MERGE — both blocking findings of the s2189 HOLD are cured, and the owner's hero-pin fix lands with it.

## What it does

s2189 gated `c3-hero-move-pin` (the owner's playtest-15 "got stuck in the night floor" cure) and HELD it on two
blocking findings. This corrective cures both without touching the movement cure itself:

- **F-2189-1 (collection break).** The depenetration helpers move byte-identically out of `LandmarkCollision.ts`
  — whose line 1 is a Vite-only `.json?raw` specifier — into a new node-safe `src/world/depenetrate.ts`.
  `LandmarkCollision.ts` keeps a one-line re-export so every existing import still resolves; `RunSuspend.ts`
  imports the leaf module directly. No behaviour changes; the helpers are moved, not rewritten.
- **F-2189-2 (a shipped cure was deleted).** `restoreHero` now handles `y` *conditionally* rather than by
  deletion: `RunSuspend.ts:926` constructs the position **with** the saved `snapshot.hero.position.y`, and
  `:929` recomputes `y` from terrain **only if** depenetration actually moved `x` or `z`. That preserves the
  shipped `afbee591f` y-restore cure AND the new relocation cure — the two are not in conflict once the
  condition is made explicit. This is a better resolution than either restoring or deleting the line.

## Evidence (all re-run by me on the merged tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green, built in 1.14s; asset-diet ceilings respected |
| `scripts/whole-suite-collection.test.mjs` | ✅ PASS 4.62s (1 test, 0 fail) |
| **whole-suite collection count** | ✅ **`Total: 2968 tests in 426 files`** (main: 2958 in 425; the HELD tree was **0 in 0**) |
| `e2e/c3-hero-move-pin.spec.ts` | ✅ **10/10** desktop + mobile, incl. plain-boot no-`?debug` console test |
| `e2e/restore-validation.spec.ts` | ✅ **36/36** desktop + mobile, incl. `:658` (the F-2189-2 acceptance) |
| `npm run test:node-guards` (F-1460-1) | ✅ **rc=0 — 503 tests / 498 pass / 0 fail / 0 cancelled / 5 skipped, 537.7s** (s2192) |

**The runner's headline reproduced exactly** on collection count (2968/426), c3 (10/10) and restore-validation (36/36).

## Findings

**F-2191-1 (non-blocking, method — worth copying).** `restore-validation.spec.ts:658` is the acceptance test for
F-2189-2, but **a grep for `position.y` in that file returns exactly one hit, and it is unrelated** (a malformed-input
fixture at `:72`). The assertion is *structural*: `:658` runs a recursive deep-equality `visit()` over the whole
restored snapshot and reports up to 12 leaf differences as `path: expected != actual` — which is precisely the shape
of the failure the runner hit and fixed (`0.14559222393281415 != 0.2763519114255905`). ➡️ **A textual grep is the
wrong instrument for asking whether a suite covers a field.** I nearly filed a false "the acceptance test does not
assert `y`" finding on that grep; reading the test refuted it in one file read. Deep-equality assertions cover every
leaf and name none of them, so they are invisible to exactly the search a reviewer reaches for first.

**F-2192-1 (BLOCKING at the time, CURED IN THE DRAIN — s2191's `tasks/BACKLOG.md` conflict resolution fused two rows
onto one physical line).** s2191's resolution note reads *"Both sides survive (Retention Law); no row was dropped or
rewritten"*, and on **content** that is exactly true. On **structure** it is not: the lane's `🟡 F-2189-1 + F-2189-2`
status row and main's `🔺 F-PT15-1 + F-PT15-2` owner-intake row were joined with **no newline between them**. Proven
rather than eyeballed — `fused === laneRow + ptRow` byte-for-byte (2549 = 1069 + 1480 chars), so it is a dropped `\n`
and nothing else. ⚠️ **Why a missing newline is a real defect here and not a cosmetic one: `🔺` is the OWNER'S-DESK
marker and BACKLOG rows are one-per-line.** Fused behind a `🟡` row, Robin's playtest-15 intake row no longer *starts*
a line, and `desk-state-audit`'s stated rule — *a row states the state only of the FIRST F-ID in its 90-char subject
zone* — then attributes the whole fused row to `F-2189-1`, making `F-PT15-1`/`F-PT15-2` a merely-cited pair carrying no
state. **This is the same class s2190 cured one fire earlier** (its own handoff commit: *"my own desk segment absorbed
the two ids it claimed to exclude"*), recurring through a merge conflict instead of through a handoff. **Cured here** by
re-inserting the newline under a refuse-on-content-change guard; verified after: **0 rows from main absent, 0 rows from
the lane absent, 0 rows from neither side.** 💡 *Reusable: "both sides kept" is a claim about CONTENT. Line-structured
ledgers need the per-line audit — diff the row SETS, not the byte count, because a fusion preserves every byte.*

**F-2192-2 (non-blocking, measurement — the `test:node-guards` growth sequence has PAUSED, first time in five
readings).** The F-2166-2 clause family records a strictly monotone battery: 284 → 363 → 424 → 472 → 503 tests and
55.6 → 181.3 → 280.9 → 404.7 → 529.8 s, and instructs readers to treat the cost as a FLOOR that only grows. This run
reads **503 tests / 498 pass / 0 fail / 5 skipped — identical in every count to s2166** — at **537.7 s** wall (539.3 s
including npm overhead), i.e. +1.8% time on an unchanged test set, which is load, not growth. **The FLOOR guidance is
unaffected and should be carried forward unchanged**; this is recorded only so the next fire re-measuring it does not
read an equal count as a failed measurement or as evidence the clause rotted.

## Merge classification

Base `main` @ `af1d410cb`; `main..lane/c` = 2 commits (c3 + f2189-1). Per-file, from `lane-freeze-classify`:
all `src/**` and `e2e/**` paths are **LANE-ONLY** (main never moved them). The single **BOTH-MOVED** path is
`tasks/BACKLOG.md`, which conflicted at row 1 exactly as s2190 predicted.

**Conflict resolution (hand-resolved, nothing deleted):** main's six newer finding rows were kept in their existing
order, and the lane's `🟡 F-2189-1 + F-2189-2 — lane/c READY-FOR-GATES` status row was kept directly above the
`🔺 F-PT15-1 + F-PT15-2` intake row it reports on. Both sides survive (Retention Law); no row was dropped or rewritten.
— *s2192: true on content, false on line structure; see F-2192-1 above. Cured before the bookkeeping commit.*

**How the merge was performed (s2192), and why this way.** s2191's gate merge `66891f18f` had parents `af1d410cb`
(main-at-the-time) + `d36f5e24b` (lane/c). By the time s2192 merged, main was one commit further along at `6dcc35dae`
— and that commit changes **`STATUS.md` line-1 only** (the s2192 lock), measured, not assumed. So rather than
re-resolving the BACKLOG conflict by hand and risking a *different* resolution from the one the battery ran against,
s2192 merged **the gated commit `66891f18f` itself** into main. That makes the shipped tree provably the gated tree:

| Check | Result |
|---|---|
| `git diff --stat 66891f18f HEAD` (post-merge) | ✅ **`STATUS.md` only** — the merged tree is byte-identical to the gated tree everywhere else |
| `git rev-list --count main..lane/c` | ✅ **0** — the lane is fully absorbed, no false-ahead residue |
| per-line BACKLOG row audit vs both sides | ✅ **0 / 0 / 0** after the F-2192-1 cure |

Merge and commit were **one act** (§3.0b / F-1589-5) — nothing was ever left staged on main.

## Disposition

- `f2189-1-depenetrate-node-safe` → `merged` @ `0e827f9e5c69a56c8d4e4ca610f39aa2e51901ee`
- `c3-hero-move-pin` → `merged` @ `0e827f9e5c69a56c8d4e4ca610f39aa2e51901ee` — its `blocked` / `blockClass=gate-side`
  hold is lifted by this merge, which is the stated lift condition in its own `blockedReason`. No owner word was
  required or used (F-1383-1). s2192 re-ran `drain-block-check` on both task files rather than inheriting s2191's
  reading: `f2189-1` **CLEAR**, `c3` **rc=1 gate-side** with the lift condition printed verbatim.
- Findings `F-2191-1` (method, non-blocking) and `F-2192-2` (measurement, non-blocking) need no corrective.
- Finding `F-2192-1` was cured inside this drain; no corrective task is owed.
- **Owner-facing:** `F-PT15-1` / `F-PT15-2` — the playtest-15 pin Robin reported (*"got stuck in the night floor once
  - could not move anymore"*) is now cured on main and playable. That row is restored to its own line and remains on
  the desk for his verdict, not for ours to close.
