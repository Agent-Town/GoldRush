# F-1158-3 — `grantGold`/`grantPressure` never republished diagnostics

**Slice:** F-1158-3 corrective (fire-authored, s1159)
**Branch:** main (direct, ≤20-line corrective under CLAUDE.md §2 attended/fire allowance)
**Tip:** see the commit carrying this file
**Verdict:** ✅ **FIXED — root cause found at runtime, cured, and both directions controlled.**

## What it does

s1158 unmasked `e2-stamp-mill.spec.ts:145` failing on mobile-chrome with `Expected -90, Received 0`
and deliberately stopped short of diagnosing it. This fire diagnosed it.

`__GR_TEST__.grantGold()` (`src/game/Game.ts:1773`) applies a `gold_granted` event to the Economy
**immediately**, but `window.__THREE_GAME_DIAGNOSTICS__` is a **whole-object snapshot reassigned once
per published frame** (`publishDiagnostics()`, `Game.ts:4152`, `economy.gold` at `:4228`). `grantGold`
was the one state-mutating `__GR_TEST__` helper in its neighbourhood that **did not call
`publishDiagnostics()` after mutating** — its siblings `damageFerrisWheel` (`:1815`),
`announceForTest` (`:1822`), `placeFree` (`:1860`), `confirmBuild` (`:1867`), `placeBoatBuilding`,
`reanchorClaimBoat` and `damageEscort` all do.

So a test that granted gold and read `economy.gold` in the next round-trip could read the **pre-grant**
value — a one-frame race. `grantPressure` (`:1782`) had the identical omission.

The fix is two lines: both grant helpers now republish, exactly like their siblings.

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, built in 1.42s |
| `e2-stamp-mill.spec.ts` desktop + mobile (full, final tree) | **4 passed / 27.6s** |
| `e2-stamp-mill` mobile-chrome `--repeat-each=8` **BEFORE** fix | **5 failed / 3 passed** |
| `e2-stamp-mill` mobile-chrome `--repeat-each=8` **AFTER** fix | **8 passed / 2.5m** |
| Adjacent: m4-01, m4-05, m4-10, save-slots, run-suspend, m1-05 | 60 passed |
| Canaries: m1-01, m2-01, m2-04, 045-megaproject | 35 passed / 1 known red (below) |
| Zero console/page errors | asserted in-spec by `assertNoErrors`, both projects |
| Screenshots | `artifacts/stamp-site-read/*` regenerated on the final tree |

### The mechanism, measured — not inferred

A scratch probe (`archive/scratch/_scratch-s1159-goldlag.spec.ts.txt`) granted 90g and read the
snapshot in the same evaluate turn. **On the unmodified tree:**

| sample | frame before | `economy.gold` immediately after grant | economy log truth | caught up after |
|---|---|---|---|---|
| 1 | 16 | **0** | **90** | 19.1 ms (frame 17) |
| 2 | 41 | **90** | **180** | 4.4 ms (frame 42) |
| 3 | 88 | **180** | **270** | 8.2 ms (frame 89) |

The economy was always correct; only the published snapshot lagged, by exactly one frame.
**After the fix:** all 5 samples read the granted value in-turn, catch-up 4–19 ms → **<1 ms**.

### Both directions controlled

- **Forward:** with the fix, the probe's `immediate.gold === before.gold + 90` assertion passes 5/5.
- **Reverse:** I removed the fix and re-ran the same probe — it failed with **`Expected: 90,
  Received: 0`**, the exact shape of F-1158-3's original failure. The cure was then restored and the
  final `git diff` re-read to confirm only the two intended lines remain.

## Findings

- **F-1159-1 (non-blocking, recorded):** `e2-stamp-mill:145` was the **only** bare
  `page.evaluate` read of `economy.gold` immediately after `grantGold`. The eight sibling call sites
  (m4-01 `:81`, m4-05 `:128`, m4-10 `:70`, world-info-notes `:104`, save-slots `:105`, run-suspend
  `:54`, m1-05 `:26`) all already wrap it in `expect.poll`, i.e. **the suite had been quietly routing
  around this harness defect for a long time**. Those polls are still correct and were left alone;
  they should now simply resolve on their first attempt.
- **F-1159-2 (pre-existing, NOT mine — fingerprinted):** `world-info-notes.spec.ts` fails 3 tests per
  project at `:193`/`:286`/`:318` (via `:111`, `:301`/`:307`, `:335` — note bottom 636 vs max 586).
  **Control-proven:** I reverted my change and re-ran; the identical three failures at the identical
  lines appeared on the unmodified tree. This matches the documented red in
  `reviews/lane-055-standard-note-assertion-and-briefing.md:73` and `tasks/BACKLOG.md:1397`, which
  fingerprinted it on clean main at `452af90c`. Still open, still not this slice's.
- **F-1159-3 (pre-existing intermittent, NOT mine — fingerprinted):** `m2-04-gold-stealing.spec.ts:226`
  `Expected < 20, Received 20.3–21.3`. This is the owner-gated **F-1156-2** dominant red
  (⛔ *never widen the constant*). Present on **both** arms: **2/4 with the fix, 1/4 without**, same
  line, same magnitude. ⚠️ **n=4 per arm is underpowered to claim any rate difference in either
  direction** — I am asserting only that the red pre-exists the change, which the control shows.

## Merge classification

Direct-to-main corrective. Base = current main. Single file `src/game/Game.ts`, two added lines,
no conflicts, no MAIN-MOVED interaction. Scratch probe archived (not committed as a live spec) per
the house `archive/scratch/*.txt` pattern, so it cannot join the suite by accident.

Artifact churn from suites I merely *gated* — several minted during the reverted-tree control runs —
was **discarded rather than committed**: those PNGs were rendered by the unmodified tree, and
committing poisoned evidence is worse than churn. Only `artifacts/stamp-site-read/*`, regenerated on
the final tree by a 4/4 green run, is included.
