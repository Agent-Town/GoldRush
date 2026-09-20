# true-reel-sprites — the placeholder show gets the game's real visuals

**Slice:** `true-reel-sprites` · **branch:** `lane/c` · **tip:** `b792ca9ba (archive: pruned by the A3 rewrite)` (over `0530ce1f3`) · **base:** `c54c03ac5` · **merge:** `6aa547894` · **drained:** s2444, 2026-09-02

## VERDICT: MERGED.

## What it does

The lantern show's "true reel" — the replay a watcher gets when they click WATCH on a county
standings row — was drawing the world as **abstract SVG primitives**: enemies as brown circles,
works as teal rounded rects, on a flat `#6f5835` field with a grid pattern. It read as a debug
overlay, not as the game.

This slice replaces that with `src/ui/TrueReelRenderer.ts` (new, +139), which draws the snapshot in
the game's own visual language, and extends the replay snapshot itself so there is more of the world
to draw: `AgentTapeReplaySnapshot` gains **`seams`** (active harvest nodes with their remaining ore)
and **`pickups`** (loose gold on the ground with its amount). `LanternShow.ts` loses 27 lines of
inline SVG-string construction and delegates.

The extraction is defensive where it should be: `goldPickups` is read through
`(internal.goldPickups?.snapshot() ?? [])`, so a tape from a build without that system yields an empty
array rather than throwing — and `seams` filters on `node.active` rather than assuming the harvest
snapshot is already filtered.

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, 4.9 s |
| `npm run build` (merged tree) | **rc=0**, 18.5 s, asset-diet green |
| Own spec `e2e/agent-reels.spec.ts`, desktop + mobile, `--workers=1` | **rc=0 — 16/16 passed**, 78.1 s |
| Frame budget, desktop-chrome | live p95 **33.00 ms** · reel p95 **16.90 ms** · **ratio 0.5121x** |
| Frame budget, mobile-chrome | live p95 **10.30 ms** · reel p95 **10.20 ms** · **ratio 0.9903x** |
| Adjacent suites (5 specs, both projects, `--workers=1`) | 50 passed / **6 failed — ALL fingerprint-matched to a pre-merge control** |
| Merge classification | 25 paths; **1 overlap** (`tasks/BACKLOG.md`), auto-merged as a union and **verified by content, both sides** |

The perf result is the notable one and it is better than the bar: the true reel is **cheaper to draw
than the live game** on desktop (0.51x) and level with it on mobile (0.99x). The slice's own spec
asserts this as "inside the live-map frame budget", so richer visuals did not buy a frame cost.

Screenshots: `reviews/shots-true-reel-sprites/{desktop,mobile}-chrome-{true-world,crown-mid-ride,outcome}.png`
plus the per-project `*-perf.json`, all merged from the lane. My gate re-run regenerated these and the
`shots-{era-five,reel-era,tape-02}` sets; that churn was **discarded**, not committed — the lane's own
evidence is the record and re-committing byte-different PNGs of a passing run adds noise, not information.

## Merge classification

Base `c54c03ac5` (`probe-rows-unranked`). Main had moved since; the lane touched 25 paths and exactly
**one** — `tasks/BACKLOG.md` — was also MAIN-MOVED. Git auto-merged it, and the union was then verified
**by content rather than by structure** (F-"both sides kept is a claim about content, not sets"): all
three s2444 rows added to main this fire are present, and the lane's one added row is present. The other
24 paths were LANE-TOUCHED only and needed no resolution. Merged `--no-ff`.

## Findings

### F-2444-3 — `assay-season-roll` AND `mp-07c-4-reckoning` ARE RED ON CLEAN MAIN, AND THE RED INVENTORY CANNOT TELL YOU SO. **NON-BLOCKING for this slice; a live red on main.**

The adjacent battery returned 6 failures. **None is this slice's**, established by control rather than
by argument:

| Test | merged tree | pre-merge control (`2c4965e29`, detached worktree) |
|---|---|---|
| `assay-season-roll.spec.ts:103` the county board opens on the season now riding | ✘ both projects | ✘ both projects |
| `assay-season-roll.spec.ts:147` the archive door serves season one read-only | ✘ both projects | ✘ both projects |
| `mp-07c-4-reckoning.spec.ts:53` a mixed ride records its declared agent stack | ✘ both projects | ✘ both projects |

Identical set, identical count (6), identical per-project split. The control was a **detached worktree at
the pre-merge commit** per §3.0b — never a checkout into main's tree — with `node_modules` symlinked and
the tree asserted clean before the run.

⚠️ **The inventory could not have answered this, and said so honestly:** `red-inventory-lookup` returns
`NOT-IN-INVENTORY` for both specs against a snapshot **21 days old** (threshold 7; 181 commits have
touched `e2e/` or `src/` since), and prints *"absence here is not evidence either way."* That refusal is
the tool working correctly — but it means **the prescribed cheap path to fingerprint-matching a red is
currently unavailable, and every drain touching these specs must pay for its own control run** (~60 s
here). The inventory is the thing that is stale, not the finding.

I am deliberately **not** diagnosing the two specs: they are outside this slice's firewall, and reporting
an out-of-scope defect rather than fixing it is the correct move. They are filed for a corrective.

## Ledger

- `tasks/goals.json` leaf `true-reel-sprites` → `status: "merged"`, `mergeHash` (following commit, F-1384-1).
- `tasks/BACKLOG.md` — completion row + F-2444-3.
- Done-move renamed `drained-s2444-…`.
- GZ-01: filed with the heat-10 roundup — a watcher seeing the real game in a reel is player-visible.
