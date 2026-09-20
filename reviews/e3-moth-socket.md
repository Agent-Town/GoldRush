# e3-moth-socket — Moth Season's light trade made agent-visible

**Slice:** `tasks/lane-e3-moth-socket.md` (FIRE-AUTHORED s1468) · **branch:** `lane/a` · **tip:** `61f3a95e (archive: pruned by the A3 rewrite)` (work commit `7479f0ea`, `msock: make Moth Season light trade agent-visible`) · **drained:** s1469

**Verdict:** ✅ **MERGE.** Era-socket class #3. E3 census goes **AGENT-READY 1 of 4 → 2 of 4**; F-ER01-E3-2 cured. Zero new operations invented, and the master's honesty clause was taken rather than worked around.

## What it does

`HeadlessContractSim` now runs the production `MothSwarm` + `LightField` consumers for contracts whose twist carries `mothSeason`, in the browser's tick order, reusing the `DayNightCycle` sampling the Voltage socket (`9af152ab`) already socketed rather than duplicating it. The manifest derives the decoy-versus-radius trade from the code rather than from a paraphrase of the census: exact `coverage × radius × radiusWeight × targetWeight` targeting, highest score with an ascending source-ID tie-break, per-wave count `max(2, floor(max(1, lightSources) × mothsPerLightPerWave))`, 6 attachment damage/second with 0.3 radius loss and a 0.35 minimum multiplier, and the locked-night darkness band 0.75–1.

**Operations: zero new ones.** `BUILD lantern_post` and `BUILD decoy_shed` already existed in the grammar and now carry their moth meanings. The master explicitly permitted "zero new operations with complete rules" as a valid outcome, and the runner took that rather than inventing levers — the outcome the master was written to make safe.

**All three of the master's measured notes HELD.** In particular note 3: `matchMedia` was left untouched, because `motesPerSwarm`'s only consumer is `syncVisuals()` writing instance matrices — render-only, unable to reach the event log. Consecutive headless hashes on a pinned seed: `01 → fnv1a32:b2cab51c`, `02 → fnv1a32:70da4a10`, each stable across runs.

## Evidence — gated on the MERGED tree, in a detached worktree (§3.0b custody)

Nothing undecided ever entered main's working tree. Gate worktree `gate-s1469` (detached, `823ffedf` = main `0ec2f9f0 (archive: pruned by the A3 rewrite)` + `lane/a`), scratch dev server on port **5237** because lane-b is LIVE on the halo batch and 5188 is `strictPort`. **Every playwright command `--workers=1` (§3.1).**

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, ✓ built in 1.55s |
| **`test:node-guards`** (MANDATORY — touches `src/sim/` **and** `src/agent/`, F-1460-1) | **292 tests · 289 pass · 0 fail · 3 skipped** |
| ↳ `scripts/gr-sim.test.mjs` **Baron pin** | **HELD** — no cross-cutting sim number moved |
| ↳ `nul-audit` | CLEAN |
| ↳ ticker-stats · findings-state · blocker-panel · ruling-propagation · desk-declaration | all PASS |
| own spec `e2e/er01-e3-census.spec.ts` | **8 passed / 2.1m**, desktop + 390px |
| adjacent `er01-e2/e4/e5/e6-census` | **32 passed / 2.0m** — E2 unmoved |
| browser probe `e2e/e3-moth-season.spec.ts` | **2 passed / 9.7s**, zero console/page errors |

The 3 node-guard skips are the **documented** fire-shell cross-engine exclusions (F-1408-2), each printing its own reason inline — they are declared non-coverage, not silent passes.

## Merge classification

**Base `3c6cc288`** (the s1468 authoring commit). Merged by three-way `git merge --no-ff lane/a`, which auto-merged `tasks/BACKLOG.md` and `tasks/goals.json` cleanly.

⚠️ **THE TWO-DOT TRAP WAS PRESENT AGAIN, AND IT IS NOW A PATTERN WORTH NAMING — third fire running.** `git diff --stat main..lane/a` reads **23 files / 254 insertions / 543 deletions**; the true content is `main...lane/a` = **8 files / 253 insertions / 19 deletions**. The 15 phantom files and ~524 phantom deletions are simply main's own five commits since the merge-base — this fire's lock, the F-1464-1 authoring commit, the gate-s1455 ruling, and s1468's handoff + salvage. A blind two-dot merge would have reverted **this fire's own work plus s1468's entire fire**. s1468 hit the identical shape on `lane/b`. **The lane branches are routinely several commits behind by the time their work is drained, so two-dot is structurally the wrong instrument here, not occasionally wrong.**

Per-file, all 8 are **LANE-TOUCHED** and main moved none of them:

| File | Class |
|---|---|
| `src/sim/HeadlessContractSim.ts` | LANE-TOUCHED (+74) |
| `src/agent/MechanicsManifest.ts` | LANE-TOUCHED (+63/−…) |
| `e2e/er01-e3-census.spec.ts` | LANE-TOUCHED (+113) |
| `docs/bench/e3-readiness-census.md` | LANE-TOUCHED (18 ±) |
| `artifacts/e3-moth-season/{desktop,mobile}-chrome-decoy-tithe.png` | LANE-TOUCHED (browser proof re-renders) |
| `tasks/BACKLOG.md`, `tasks/goals.json` | BOTH-MOVED → auto-merged cleanly (ledger rows, disjoint) |

## Findings

**F-1469-1 (non-blocking, cured in this drain's ledger row).** The runner wrote its receipt into the goal leaf as `"status": "building"` with a `notes` field, which is correct runner behaviour, but it means the leaf arrives at the drain already mutated. Flipping it to `merged` with a `mergeHash` is the drain's job and was done here — recorded only so the next drain expects a `building` leaf rather than a `queued` one and does not read it as a bookkeeping defect.

**F-1469-2 (non-blocking, informational).** The runner left the two `artifacts/e3-moth-season/*.png` browser proofs **committed on the lane** while its own report describes them as "unstaged as artifact churn, outside TOUCH-ONLY". The files are in `7479f0ea` and therefore merged. This is the right outcome under the RETENTION LAW — the proofs are now in an object database rather than dying with the lane — but the report and the commit disagree about what happened, and a future reader trusting the report would conclude the evidence was lost.

## Where the PLAYER sees this

**Nowhere, and that is correct.** This is headless agent vocabulary: it changes what GR-SIM exposes to an agent, not what a browser renders. The browser probe exists to prove the production systems still behave identically after being socketed, not to show a new surface. No gazette item is owed (same ruling as the E2 pressure socket `6fd24a3b` and the E3 voltage socket `9af152ab`).

## Next

Canyon Works (E3-3) needs power, moth/light, tram, Crawler effects and `lightRamp` **composed** — it is the expensive one, and two of its five dependencies are now socketed. Fairground (E3-4) still needs its crowd-flock consumer authored on its own governed surface first (F-1467-3).
