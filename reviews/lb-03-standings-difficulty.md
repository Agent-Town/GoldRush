# Review — LB-03 standings learn difficulty (drain, s1286)

**Slice/branch/tip:** `lane-standings-difficulty` on `lane/m4` (lane-b), tip `88db2677` → merged to main this commit.
**Base:** merge-base `adfa280a`. Six paths LANE-ONLY (`main == base`, main never moved them); one path BOTH-MOVED (`src/game/Game.ts`) grafted line-by-line, never copied.
**Verdict:** ✅ MERGED.

## 🚨 The reason this drain exists — LB-03 was announced as drained and was not

s1285's handoff recorded LB-03 as drained at `e4336ba8`, and its F-1285-1 described that commit as
carrying "LB-03's three files". **It carries none of LB-03's implementation.** `git show --stat e4336ba8`
holds ap-06b's eleven swept paths plus `tasks/lane-standings-difficulty.md`, its queue copy, and one
BACKLOG line — i.e. **the task MASTER, not its output**. The headline *"LB-03: standings learn
difficulty…"* describes what the task would do, not what the commit contained.

`node scripts/lane-freeze-classify.mjs lane/m4` is what caught it: **HOLDS 7 paths**, with
`main == base` on all six LANE-ONLY files. A direct probe then measured **218 insertions across 4
files absent from main**. This is Mistake #16 exactly — *only a merge commit + review file is a
completion* — and it was one refill away from being destroyed, because §2E's LANE-SAFETY reset would
have wiped an undrained lane. **The instrument prevented the loss; the inherited claim would have caused it.**

## What it does (player-visible)

Standings rows now carry the difficulty preset they were played on. Owner question 2026-07-31
("Are the agents playing on Greenhorn difficulty?") exposed the blind row: a greenhorn win ranked
beside a vein-hunter win invisibly.

- `functions/api/standings.ts` — submission + stored row gain a required `difficulty: DifficultyPresetId`
  validated against the three presets; missing on old clients defaults to `'trail'` with a `defaulted: true`
  flag; `?difficulty=` filter on GET with a `bad_difficulty` 400 for anything off-vocabulary.
- `src/encyclopedia/reader.ts` / `reader.css` — a preset chip per row plus the filter control.
- `src/game/Game.ts` — **one line**, the client submit hook: `difficulty: this.difficultyPreset,`.

Ranking formula unchanged — the master is explicit that segregation is a future owner call and
visibility is not.

## Merge classification

| Path | Class | How resolved |
|---|---|---|
| `e2e/lb-01-county-standings.spec.ts` | LANE-ONLY | path-scoped checkout |
| `functions/api/standings.ts` | LANE-ONLY | path-scoped checkout |
| `src/encyclopedia/reader.ts` · `reader.css` | LANE-ONLY | path-scoped checkout |
| `artifacts/county-standings/{desktop,mobile}-chrome.png` | LANE-ONLY | path-scoped checkout |
| `src/game/Game.ts` | **BOTH-MOVED** | **hand graft, +1/−0** |

⚠️ **The BOTH-MOVED file is the whole risk of this drain.** The lane's base predates ap-06b, so
`git diff main lane/m4 -- src/game/Game.ts` shows the lane *removing* ap-06b's 46 lines
(`placeBuilding:` / `panAt:`). Copying the file would have silently reverted yesterday's merge —
F-1283-1's exact warning. `node scripts/lane-absorbed-lines.mjs lane/m4 src/game/Game.ts` reduced it
to the true question: **1/1 added line absent from main**. That one line was grafted by hand and both
ap-06b clusters verified still present afterwards (`grep -c "placeBuilding:\|panAt:"` → 2).

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (rc=0) |
| `npm run build` | ✓ built in 1.21s |
| Own spec `e2e/lb-01-county-standings.spec.ts` | **16/16** desktop + mobile, `--workers=1` (37.0s) |
| Adjacent (grep-derived) `en-01` · `en-02` · `en-03` · `assay-ledger-page` | 21/22, one flake — see F-1286-2 |
| Graft integrity | ap-06b `placeBuilding:`/`panAt:` present post-graft |

Adjacent suites were derived by `grep -rln "encyclopedia" e2e/` and `grep -rln "standings" e2e/`,
not from the runner's list (the s1285 lesson). `standings` matches only its own spec; the
`reader.ts`/`reader.css` changes are what make the encyclopedia specs the real neighbours.

## Findings

### F-1286-2 — `en-02-e1-coverage` "town board and bark" is an undocumented batch-load flake (NON-BLOCKING, merge exonerated)

*"EN-02 town board and bark discover contracts and townsfolk"* failed once per batch run, **on a
different project each time** — mobile-chrome on run 1, desktop-chrome on run 2, same command, same
shell, same hour. In isolation at `--workers=1` it is **3/3 green** on the merged tree.

Failure reason read, not just the count: `expect(getByTestId('town-bark-card')).toHaveAttribute("tavernkeeper")`
received `newsie` (10×) then `youngster_b` (3×). **It is a timing race against a rotating bark
carousel**, not a discovery failure.

Exonerating the merge on mechanism as well as behaviour: the diff is purely additive and confined to
the standings view (`currentView`, the difficulty chip, the filter). The single non-standings line is
`root.addEventListener('change', onLedgerChange)`, and the ledger has no form control outside
standings. Nothing on the town-board/bark path was modified.

⚠️ **It is not in the ledger.** `logs/suite-red-inventory-compact.json` records this title as
`passed`/`expected: passed` on **both** projects — but that capture is 2026-07-28 at default workers,
which §3.1 says is not evidence either way. **GATE: re-measure a rate on an idle machine before
either documenting it as a known red or repairing the assertion; a project-nondeterministic red is a
rate, not a line.**

### F-1286-3 — LB-03 was authored with no goal leaf (bookkeeping)

`node scripts/drain-block-check.mjs 20260731-111855-lane-standings-difficulty.md --strict` → **rc=2,
UNKNOWN**, no leaf matching the master. Per §3.0 that is a Goal Registration Law finding, not a
clearance. The leaf is registered in this drain commit.

## Firewall

Touched paths are exactly the master's TOUCH-ONLY list (standings endpoint · client submit hook ·
standings UI + css · its spec). Score storage shape, Balance, and LB-02 field semantics untouched.
