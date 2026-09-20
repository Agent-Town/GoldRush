# picnic-claim-standdown — the three sandwiches fall in sequence, not together (A21, option (a))

READY-FOR-GATES. Branch `feat/town-cast-rulings-and-picnic`, scratch worktree cut from main `09c997489`, Node 26.4.0,
own dev server on 127.0.0.1:5420, Playwright one worker, `--trace=off`, both projects (desktop-chrome 1280x800 and
mobile-chrome 390x844). Second of two commits on this branch; the first is `tasks/town-cast-rulings-a13-a17.md`.

**Owner, 2026-09-17, verbatim: "Lets do them all." and "All on the Anthropic subscription"** — asked to choose among
six uses of the week's tokens with the Picnic listed under recommendation (a), and taken as (a): the 20-second
stand-down in `src/systems/PicnicHoldSystem.ts`, not the spawn gates. The map, the stake positions, the run card and
the loss rule are exactly as they were.

## 1. The change

The report's diff applied as written (`artifacts/playability-first-wave-e2-e6/report.md`, "The exact `src/` hunk"),
four hunks, nothing else in the file touched:

| Hunk | What |
|---|---|
| `PICNIC_CLAIM_STANDDOWN_SECONDS = 20` | new exported constant, with the comment naming **F-PLAY-E6-1 and A21** and the 14.5 / 25.8 / 37.0 s census numbers |
| `private lastClaimAt = Number.NEGATIVE_INFINITY` | new field beside `lost` |
| `pressureTarget` | the stand-down gate goes FIRST, the press-weight modulus second (two statements, as the diff has them) |
| `update` | `stake.claimed = true` now also stamps `this.lastClaimAt = at` |
| `reset` | clears `lastClaimAt` back to `-Infinity` |

Nothing else was changed anywhere: `git status` at commit time showed exactly `src/systems/PicnicHoldSystem.ts`,
`assets/contracts/null-floors.json` and the new `artifacts/picnic-claim-standdown/`.

## 2. The smoke — three runs, both projects, all green

`GR_PLAYABILITY_SMOKE=1 … npx playwright test e2e/playability-smoke.spec.ts -g "e6-picnic" --workers=1
--reporter=line --trace=off`, against the dev server on 5420. Rows preserved verbatim in `smoke-rows.jsonl` here.

| Run | Wall clock | Project | Verdict | Reached wave 2 | Console / page |
|---|---|---|---|---|---|
| 1 | 16:44 | desktop-chrome | **pass** | **12.1 s wall, sim 60.7 s** | 0 / 0 |
| 1 | 16:44 | mobile-chrome (390 px) | **pass** | **12.1 s wall, sim 61.7 s** | 0 / 0 |
| 2 | 16:46 | desktop-chrome | **pass** | **12.1 s wall, sim 60.5 s** | 0 / 0 |
| 2 | 16:46 | mobile-chrome | **pass** | **12.1 s wall, sim 60.3 s** | 0 / 0 |
| 3 | 16:56 | desktop-chrome | **pass** | **12.1 s wall, sim 61.2 s** | 0 / 0 |
| 3 | 16:56 | mobile-chrome | **pass** | **12.1 s wall, sim 61.3 s** | 0 / 0 |

Per-run totals: **2 passed 36.4 s · 2 passed 36.1 s · 2 passed 36.0 s.** Six of six, zero flake, and the spread
across six independent boots is **1.4 sim-seconds** (60.3 to 61.7) — this is not a knife edge.

What the same rows said before, on this same instrument (`artifacts/playability-smoke/rows.jsonl`, dev env,
2026-09-05): desktop *"reached wave 0 after 3.1 s wall / 29.7 s sim ... runState=dead"*, mobile *"reached wave 1 after
5.6 s wall / 37.9 s sim ... runState=dead"*. The map went from **dead at 29.7 / 37.9 s** to **alive at wave 2 at
60.3-61.7 s**.

The run card is unchanged and still true: every row logs `briefing: 2 goals, 5 rules`, and `e6-picnic-opening.spec.ts`
green (below) re-measures *"first machines reach the meadow inside ten seconds"* against the live meadow.

Screenshots: `smoke-desktop-chrome.png`, `smoke-mobile-chrome.png` (this directory; copies of the smoke's own plates,
taken on this tree). `unbuilt-desktop-chrome.png` / `unbuilt-mobile-chrome.png` are the opening spec's unbuilt-run
plates from this tree — the run that still loses.

## 3. The null floors — re-recorded, and ONLY the Picnic moved

`node scripts/null-floor-anchors.mjs` (268.5 s, 83 floors across 36 contracts), then
`node scripts/null-floor-anchors.mjs --check` (265.6 s): **"eraStamp: pinned and tree agree at \"09c997489\". 83 of 83
null floors match assets/contracts/null-floors.json."** Deterministic on re-run.

| Seed | | secured | waves | timeMs (the second the unbuilt run ends) | gold | kills | eventLogHash |
|---|---|---|---|---|---|---|---|
| `e6-picnic-01` | before | false | 2 | **73 033 (73.0 s)** | 0 | 25 | `fnv1a32:c26f77d5` |
| `e6-picnic-01` | **after** | **false** | **3** | **97 967 (98.0 s)** | 0 | 35 | `fnv1a32:6dc50c46` |
| `e6-picnic-02` | before | false | 1 | **47 333 (47.3 s)** | 0 | 15 | `fnv1a32:a649be29` |
| `e6-picnic-02` | **after** | **false** | **3** | **98 533 (98.5 s)** | 0 | 32 | `fnv1a32:774ca441` |

**THE UNBUILT RUN STILL LOSES.** `secured` is `false` on both seeds, exactly as before; the map did not become
winnable by standing still, it became long enough to read. The floors end at **98.0 s and 98.5 s** (from 73.0 s and
47.3 s), both seeds now reaching wave 3, and the two seeds converge — seed 02 was the harsh one (47 s, wave 1) and is
now the twin of seed 01.

**A whole-artifact diff was taken rather than trusted:** of the 83 rows in the file, **exactly 2 changed**, both of
them `e6-picnic`. The other 81 floors across 35 contracts are byte-identical, which is the strongest available
evidence that a `src/` change to a picnic-only system leaked into nothing else.

The predicted figure in the first-wave report was 82 s on ITS tree; this tree measures 98.0 / 98.5 s. The direction and
the verdict are the ones the report promised (reaches wave 2, still loses); the exact second differs because the base
differs — the report's probe ran before era 6's map campaign and the roster/boss work that landed since.

`eraStamp` moved `b9f452b67` -> `09c997489` as a mechanical consequence of re-recording on a branch:
`null-floor-anchors.mjs` stamps `git merge-base HEAD main`, which is this worktree's cut point. See F-PCS-1.

## 4. Gates

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** (rc 0), measured twice — after the hunks and again at the end |
| `npm run build` | **green** twice: `built in 1.56s` after the hunks, `built in 2.15s` at the end (rc 0, asset-diet table printed both times) |
| `e2e/playability-smoke.spec.ts -g "e6-picnic"`, both projects, x3 | **2 passed x3 (36.4 / 36.1 / 36.0 s)** |
| `e2e/e6-picnic-opening.spec.ts`, both projects, **unmodified** | **green** — the card test, the unbuilt-run test and the one-palisade test, 3 x 2 |
| `e2e/e6-roster.spec.ts`, both projects | **green**, 3 x 2 — with the opening spec, **12 passed (6.0 m)** in one run |
| `node --test scripts/picnic-hold-contract-scope.test.mjs` | **1/1 green**, 0.43 s |
| `node scripts/null-floor-anchors.mjs` then `--check` | **83/83 match**, eraStamp agrees |
| Plain boot, zero console/page errors, desktop + 390 px | **0 console, 0 page** on all six smoke rows (the smoke boots with no `?debug` and asserts this itself) |
| `computeEngineHash()` | **`6403d6ebf369d9070c6646fb5ce8ec7dc82829a7315cf03f67beed37502c2353`** at the branch tip |

`git diff HEAD -- e2e/e6-picnic-opening.spec.ts e2e/e6-roster.spec.ts` is empty: both specs are untouched, and their
green is a real adjacent-suite result rather than a re-pointed one.

## 5. Findings

### F-PCS-1 — the null-floor `eraStamp` is branch-relative, so a re-record on a scratch branch REWINDS it
`scripts/null-floor-anchors.mjs` derives `eraStamp` from `git merge-base HEAD main`. On main that is main's own tip; on
a branch it is the branch's cut point. Re-recording here therefore moved the stamp **backwards** relative to today's
main (`b9f452b67` -> `09c997489`), even though the floors themselves are fresher. `--check` passes on THIS tree because
it compares pinned-vs-tree on the same tree. **What the drainer should expect:** after merging to a main that has moved
on, `--check` will report an eraStamp disagreement until the floors are re-recorded on the merged tree (~4.5 min), and
the 81 unchanged rows make that re-record cheap to verify — only the two `e6-picnic` rows should differ from this file.
Not a defect in this task; a property of recording anywhere but main, worth one line in the drain review.

### F-PCS-2 — the engine hash moved twice on this branch; pin ONCE, off the tip
Both commits touch `src/`, and `assets/contracts` (which the null floors live in) is also in `ENGINE_SOURCE_INPUTS`.
Measured: `20816391cfdced49632b3e06050482f48a70f26e60e95a9a7ea48be72c559e84` after the town commit, and
**`6403d6ebf369d9070c6646fb5ce8ec7dc82829a7315cf03f67beed37502c2353`** at the tip. `assets/engine-era.json` still pins
`df1784d4...`. The firewall forbids pinning it here; the drain pins the tip value once, after the merge.

### F-PCS-3 — what the stand-down does NOT do, stated so nobody re-litigates it
It does not touch `PICNIC_STAKE_PRESS_WEIGHT`, the stake positions, the `heroStart` flags, `PICNIC_HOLD_SECONDS`, the
loss rule, the card, or `e2e/e6-picnic-opening.spec.ts:366`. A machine already standing on a disc keeps its timer
running through a stand-down — the gate is on `pressureTarget`, i.e. on which stake the NEXT machines are sent to, not
on the clock of the stake in hand. That is why the falls become serial instead of merely delayed (the two dials the
first-wave report measured and rejected, `PICNIC_STAKE_PRESS_WEIGHT` 0.125 and a 25 s first-claim grace, both only slid
the block: 36.8 s and 37.9 s against 36.9 s).
