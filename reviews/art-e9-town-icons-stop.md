# art-e9-town-icons — LAWFUL STOP (attempt 1)

**Slice:** `art-e9-town-icons` (E9 Red Fields townsfolk — 4 fresh + 1 aging edit + 1 five-up sheet)
**Slot:** ART (commits into main's own tree — gate-and-bless, not a merge)
**Runner commit:** `9ae877d9 runner(art): art-e9-town-icons.md`
**Run report:** `tasks/runs/20260728-122506-art-e9-town-icons.md`
**Drained:** s1166, 2026-07-28
**§3.0 `drain-block-check`:** ✅ CLEAR — `art-e9-town-icons.md [e9-art-town-icons] status="queued"`, run as the first command, before classification.

## Verdict

**ACCEPT THE STOP — STOPPED-LAWFUL, zero project art diff.** The runner did exactly what the
master told it to do, reported every number including the discards, applied no channel
arithmetic, and refused to ship an out-of-band portrait. **This is the guard working, not a
failure of the runner.** No deliverable exists to judge on canon grounds.

⚠️ **But the STOP is NOT evidence that E9 cannot meet the band.** See F-1166-2 — the master's
five-attempt cap is set *below the measured cost of the only known success in this band*, and
that is a defect in my predecessor's master, not in the era's palette.

## What it does

Nothing, by design. The run generated five native candidate portraits for the **canal reeve**
(file 1 of 6), measured each, found none inside the admissible 124–145 ground-warmth band, and
stopped before attempting the ice quarry chief, greenkeeper, weather warden or the Moon-born
aging edit. No candidate was copied into `assets/raw/`; no contact sheet, no 120px strip, no
LEDGER row.

## Evidence

### Instrument control (run-side, re-checked by me structurally)

The run re-measured the six pinned E1 controls before generating anything and reproduced every
pinned value with **zero drift**, flagging exactly one file — `tf-mei.png` at 105.3, the known
F-1120-1 convention outlier. That is the correct control result for this statistic.

### The five canal-reeve attempts (verbatim from the run report)

| Attempt | Native TL | Native TR | Mean | Spread | Verdict |
|---|---:|---:|---:|---:|---|
| 1 | 122.6 | 114.9 | 118.8 | 7.8 | discarded — mean below 120, TR below 120 |
| 2 | 182.8 | 186.0 | 184.4 | 3.2 | discarded — above the 145 ceiling |
| 3 | 172.4 | 170.9 | 171.7 | 1.5 | discarded — above the 145 ceiling |
| 4 | 76.3 | 73.9 | 75.1 | 2.4 | discarded — below the 120 floor |
| 5 | 162.9 | 159.0 | 161.0 | 3.9 | discarded — above the 145 ceiling |

**Three overshoots, two undershoots, nothing inside the band.** Observed range **75.1 → 184.4**
(~109 units) against a **21-unit** target window.

### Firewall — verified by me at source, not accepted from the report

| Check | Method | Result |
|---|---|---|
| No E9 portrait entered the repo | `git ls-files 'assets/**' \| grep -Ei 'tf-[a-z-]*-e9'` | **0** |
| Runner commit touched no art | `git show --stat 9ae877d9` | only `logs/` ×4 + `tasks/runs/` ×1 — **zero `assets/`** |
| Moon-born edit source untouched | sha256 + byte size, recomputed | `daa76435…ddce6`, **3,503,908 B** — matches the report's pin **exactly** |
| `assets/LEDGER.md` unchanged | runner commit file list | not present ⇒ unchanged |
| No processing / no dev server / no playwright | run report + commit contents | consistent |

**tsc / build / suites: deliberately NOT run.** The diff contains zero `src/`, zero `e2e/`, zero
`assets/` — there is nothing for a battery to gate. lane-d's 2396-test `suite-red-inventory` also
owned the box for this fire's whole length (log still growing at 12:47), so a battery run would
have been both pointless and load-contaminated (F-1160-2).

## Merge classification

**Not a merge.** The ART slot commits into main's own tree; `9ae877d9` is already on main. No base
diff, no LANE-TOUCHED/MAIN-MOVED classification applies, no graft.

## Findings

### F-1166-2 — THE FIVE-ATTEMPT CAP IS SET BELOW THE MEASURED COST OF A SUCCESS. The stop is a sampling artifact, not a verdict on E9's palette. (BLOCKING for the re-author; fire-correctable.)

**Chalk — the only completed portrait generated under this exact absolute band — was selected on
attempt SIX** (`reviews/art-e7-chalk-portrait.md:62-72`):

| Chalk attempt | mean | verdict |
|---|---:|---|
| 1 | 111.4 | below floor |
| 2 | 87.7 | below floor |
| 3 | 208.9 | overshoot |
| 4 | 113.7 | below (TR by 0.7) |
| 5 | 199.8 | overshoot |
| **6** | **144.8** | **selected** |

🔑 **Chalk's first five and the reeve's five are the same distribution** — both are five misses in
both directions, and the reeve's five actually average *slightly cooler* than Chalk's six
(142.2 vs 144.4). **A five-attempt cap would have stopped Chalk one attempt before the portrait
that shipped.** So the cap cannot distinguish "hard" from "impossible", and it fired here on the
side of impossible without evidence.

### F-1166-3 — THE BACKDROP CONSTRAINT EXISTS ONLY AS PROSE, NOT AS A PROMPT CLAUSE. (Non-blocking; folded into the re-author.)

`tasks/art-e9-town-icons.md:77` states the reasoning correctly — *"a rust-red world does not
require a rust-red parchment ground, and the ground is what the statistic measures"* — but that
sentence sits in the **retake rule's rationale**. The clause that actually reaches the generator
is the style anchor at `:115`, *"warm etched bust on parchment"*, and the **E9 palette rider at
`:61` tells it "rust-red engraved earth/timber"** with no instruction confining that to costume
and props. The corners the statistic measures are exactly where a generator will put "rust-red
earth". ➡️ The era's colour must be pinned to **costume, props and interior light**, and the
backdrop pinned to **neutral aged parchment**, as a *binding clause in every prompt*.

### F-1162-1 — RECURRED AGAIN (4th observed instance). No new fork; already on the owner's desk.

`9ae877d9` — a run that produced **zero art** — nonetheless committed `logs/.goal-tree.html`,
`logs/dashboard.html`, `logs/task-stats.jsonl` **and `logs/session-scratch/s1165-handoff.txt`**,
none of which is in any art task's TOUCH-ONLY list. The runner still predates `d10167f4`; the fix
has now been inert **>7 h**. **The remedy is a runner RESTART and a fire cannot do it.**

### ART staging audit (law: any fire touching the ART slot reports both buckets)

**AT RISK 748 files / 566.47 MB** (in no object database — dies with this disk) ·
**LOCAL-ONLY 0 files / 0 KB** · SALVAGED 6 · DIVERGED 16 · SHIPPED 193.
Unchanged since s1156; disposition is **F-1120-2, owner's desk**.

## Disposition

Done-move renamed `stopped-lawful-s1166-band-unreachable-in-5-attempts-…`; goal leaf
`e9-art-town-icons` set `stopped-lawful` with **no mergeHash** (unfinished work carries none).
**Successor: `art-e9-town-icons` attempt 2**, re-authored s1166 with a changed premise per
F-1166-2 + F-1166-3. The **124–145 band itself is NOT touched** — it is the convention-bearing
constant and the whole point of F-1162-2.
