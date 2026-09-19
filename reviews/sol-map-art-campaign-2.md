# Review — `sol-map-art-campaign-2` (E5 water pass, HELD at verification)

**Slice:** `sol-map-art-campaign-2` · **branch:** `sol/map-art-campaign-2` · **tip:** `7bd4b250b` · **base:** `821bff7e915bef5c774193e2611b4726317b45ca` · **merge:** `5c6cef321` · **drained:** s2643, 2026-09-19

## VERDICT: MERGED AS EVIDENCE — no map completed, no code landed, no owner word owed

The runner did **not** finish a map and says so in its own first paragraph. What it produced is a
bounded visual verdict on a shared E5 water experiment, the measurements behind it, and a
resumption handoff — then it **reverted the experiment** and preserved the candidate. This drain
lands that evidence and nothing else. It is the Mistake #1 shape done **correctly**: a run that
changes no product code wrote WHY into its report, at length, with figures.

## What it does

`artifacts/sol/map-art-campaign-2/report.md` is the deliverable. It records a water-rendering
candidate for the four E5 sea mounts — two incommensurate texture samples to break the single 20 m
repeat, the submerged panorama apron re-routed through the seabed atlas, and a feathered hull/water
contact strip — and grades each of the owner's E5 complaints **IMPROVED** or **HELD**, with
**zero FIXED and zero ACCEPTED claims**. Quiet-water texture RMS falls 1.8271 → 0.7040 (61.5%) in a
frozen diagnostic; drowned-office roof texture RMS rises 2.7800 → 3.4340 (23.5%). Wave shape, full
depth acceptance, boat crane identity, actor contact and framing all stay **HELD**, three of them
explicitly *held by firewall* because the files that own them sit outside the task's allowed set.

It is held at verification because the mandatory E5 baseline gates are **red on the exact base**:
the runner temporarily removed only its two render edits, verified the original engine hash, re-ran
the seven failing simulation fixtures, and **five of seven reproduce identically without the
candidate**. Two are inconclusive (the base child exits before reaching the assertion) and it
labels them inconclusive rather than pre-existing. That is the right call and the reason nothing
advanced.

## Evidence (this drain's own gates, on a detached trial merge — §3.0b)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | **rc=0**, 18.4 s |
| `npm run build` | **rc=0**, 54.8 s |
| `gate-caller-audit` | **PASS** — *"every gate-shaped subject is either reached or grandfathered"*; the 3 owner escalations are pre-existing and none is mine |
| `nul-audit` | **CLEAN** — corpus 23,260 text subjects, 22,896 read, 0 NUL |
| Collection control | `playwright test --list` = **3364 tests in 463 files on the merged tree AND on main**, byte-identical; `e5-sea-contact` appears **0** times in either listing |
| Engine identity | `computeEngineHash` = `cc3fd5d45add762fc0878a42618af1eaec836edeee83b03954c5e75a569b71f5` on main **and** on the trial merge — equal to each other and to the base the report claims |
| Working trees | gate worktree dirt after merge: `?? node_modules` (the symlink) and nothing else |

**Why this battery and not the usual one.** The prescribed drain gate is tsc + build + the slice's
spec + adjacent suites. This slice has no spec and no adjacent suites, because **it changes no code**:
the merged tree differs from main in 49 files and **0 of them sit outside
`artifacts/sol/map-art-campaign-2/`** (measured, not asserted). So the gate that actually bears on
this merge is the *collection* question — whether code-shaped files landing under `artifacts/` get
walked by something — and that is what the control above answers. It is F-2642-4 one directory over:
that finding caught two real `.test.mjs` files placed under `artifacts/` by a master's own firewall
and scored as unread verdicts. Here the equivalent hazards are a `.spec.ts`, two `.mjs` and two
`.py`, and all five are provably unreached: `playwright.config.ts` sets `testDir: './e2e'`,
`tsconfig.json` sets `include: ["src","e2e","functions","playwright.config.ts"]` — both resolved
from the repo root, so neither reaches `artifacts/**` — and `gate-caller-audit`'s subject predicate
is a **file-name vocabulary at any path**, not a directory: `gate-caller-audit.mjs:102` admits
`*.test.mjs`, `*.test.sh` **or** a `test-` prefix, deliberately widened to any path (F-2199-1,
F-2200-1). None of the five matches it — but note the shape of that escape, because it is narrow:
a file named `test-boards.mjs` under `artifacts/` **would** have been a subject. **Read by eye in
each config, then measured by running the tools.**

## Merge classification

Base `821bff7e9`; lane 2 commits ahead, 33 behind. Per-file: **LANE-ONLY 49 / 49**, MAIN-MOVED 0,
BOTH-MOVED 0 — every path is a new file under this slice's own artifact directory, so there was
nothing to three-way. `git merge --no-ff` reported *"Merge made by the 'ort' strategy"* with **zero
conflicts**, and `main..sol/map-art-campaign-2` is **empty** after the merge, which is the
absorption proof rather than the branch's own say-so. The two-dot diff looks alarming (17,416
deletions) and is the ordinary stale-base artifact — those are main's own later commits, the
account-registry landing among them, which the lane never saw; it is the reason a lane is judged on
a three-way and never on `..` (F-2642 and the standing rule).

Weight: **22.4 MB**, of which 21.9 MB is 18 review PNGs (two 4 MB boards). That is the house shape
for an art review and it is exactly what the RETENTION LAW wants tracked rather than dying on the
disk (Mistake #11). It does not touch `test:asset-diet`, which measures the **built production
bundle** via `playwright.preview.config.ts` and never scans `artifacts/`.

## Findings

**F-2643-1 — the `_raw/` preservation is real but is NOT in git, and that is the one thing this
merge does not carry.** The report's candidate patch (`_raw/e5-candidate.patch`), the byte-preserved
candidate at `_raw/final-candidate-20260919/`, the partial guard TAP and 77 unselected experimental
files all live under an **ignored** directory (`artifacts/sol/map-art-campaign-2/.gitignore` = `_raw/`,
plus a local `info/exclude` entry the runner added so it survives branch switches). The three files
that matter most were *also* copied into the tracked tree at `candidate-e5-20260919/` — `Water.ts`,
`Terrain3dClaimPilot.ts` and `e5-sea-contact.spec.ts`, which is what tip `7bd4b250b` exists to do —
so the candidate itself is durable. **The patch and the raw measurement attempts are not.** Non-blocking,
and deliberately not "cured" by force-adding them: `_raw/` is 77+ files of superseded experiments and
the RETENTION LAW's own owner amendment of 2026-08-26 already exempts a bulk local evidence class.
Recorded because a resumption run is told to *"inspect the patch against its current base"* and the
patch is on this disk only.

**F-2643-2 — two committed raw atlas inputs are missing from the lane's sparse checkout, and the
guards that need them cannot pass anywhere until they are hydrated.** `guard-summary.json` records
`assets/raw/claim-boat-material-atlas.png` and `assets/raw/flotilla-material-atlas.png` as absent;
the runner checked `git ls-files` and confirmed **both are tracked**, then correctly declined to
author or hydrate them outside its firewall. So those two guard failures are a checkout artifact,
not a tree defect. Non-blocking for this merge (the files are present on main), but it is item 1 of
the runner's own resume order and the next map-art dispatch should hydrate them in its pre-flight.

**F-2643-3 — the full node-guard battery did not complete on the lane and its partial result must
not be read as a green or a red.** It declared 4 concurrent batteries, reached 126 top-level records
and was stopped by the existing 900 s outer timeout; host load reached **156** with 127 GB of
physical memory used. That is F-2462-1 by construction — a self-contaminated battery manufactures
findings in both directions — and the runner's `power p95 54.082 ms` against a 0.500 ms cap is the
same class F-2642-6 measured a 2.9× swing on from load alone. **The honest reading is "not measured".**
It does not block this merge, because the merge carries no code for those guards to have an opinion
about; my own `test:ledger-guards` run below is the measurement that does bear on it.

**No corrective task is spawned.** All three findings are properties of the *lane's environment* or
of an evidence tree, not of anything that landed, and the slice's real continuation is already
written as a 7-step resume order in the report. The goal leaf goes back to `planned`, not `merged`
in the completion sense, and the BACKLOG row says so.

## What the owner should know

Nothing to decide. No map moved, so `reviews/sol-map-art-current-status-20260909.md` is unchanged
and correct, and the 23 pending verdict rows are untouched. The E5 water complaints from playtest
are **not fixed** — a candidate that improves four of them exists and is preserved, and it is blocked
on baseline gate failures that predate it.


## Attended addendum (2026-09-19, after the s2643 drain)
- The three candidate files Astra preserved under the untracked `_raw/` were copied into tracked evidence at `artifacts/sol/map-art-campaign-2/candidate-e5-20260919/` (`7bd4b250b`, in this merge): `src/world/Water.ts`, the render edit of `src/world/Terrain3dClaimPilot.ts`, `e2e/e5-sea-contact.spec.ts`.
- **F-MAC2-1 (inventory):** the seven E5 fixture assertions that reproduce on the exact base (Astra's own attribution table) are recorded in `logs/suite-red-inventory.md`; era-6 pin rot in `e5-flotilla-hulls`, `e5-regatta-race`, `e5-stillwater-noise`; re-point with cause owed, fire-authorable.
- **F-MAC2-2 (master defect, cured):** the first master's stop rule plus "the map's own spec(s) green" made a stale pin a wall. The second run `tasks/sol-map-art-campaign-2b.md` (queued lane-c) states the known-red law, makes the full node-guard battery the drain's, hydrates the two raw atlases the lane worktree lacked (**F-MAC2-3**), and orders the preserved candidate re-applied and committed on the bar it already met (the new spec 8/8, ordinary water 4/4, plain boots 0/0, tsc/build/full).
- **F-MAC2-4 (box):** load 156 with 127 of 128 GB used during the run, four batteries at once — the day's parallelism has a ceiling here.
