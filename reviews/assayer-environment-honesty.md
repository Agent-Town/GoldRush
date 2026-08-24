# Review — assayer-environment-honesty (lane-a)

- **Slice:** `assayer-environment-honesty` — the hill-mine cross-environment divergence + the commit-pin fragility
- **Branch / tip:** `lane/a` @ `932a2053e90fe2998f853f3400cebba11a81f9ed`
- **Base (merge-base with main):** `a94acfc1ead2fb92d3dff36d3ed4b62bb27474d9`
- **Gated on:** detached worktree `gate-s2281/` (§3.0b — undecided content never entered main's working tree)
- **Drained by:** s2281
- **Merged to main:** `0a117cf9ad9c2e4c85e2c251023769b7a35a980e`
- **Verdict:** ✅ **MERGED** — mechanism named and cured at the proven site, identity made content-derived, and the one battery red proven inherited by my own control.

## What it does

Two coupled honesty gaps, both cured.

**① The divergence is diagnosed to a named mechanism, not a suspicion.** The Hill Mine tape verified byte-exact on the Mac and died on the droplet before order tick 12561 — same tape, same tree. The runner bisected it to a **platform `libm` one-ULP difference**: at raw step 10581, Darwin and Linux Node 26.4.0 returned adjacent doubles for `Math.sin(0.5789029878078356)` (`…9083` vs `…9082`) inside `resolveTerrainMove`'s cliff-slide candidate. The one-ULP position/velocity delta accumulated until the rounded tick hash split at step 10638.

The fix is a **canonicalization, not a tolerance** — which is what the master's honesty guard demanded (*"hash equality IS the product"*). `src/sim/TileHeight.ts:211` rounds only the trig-derived slide candidate to 1e-15 before it can enter authoritative movement state. Nothing is compared with slack; the two platforms are made to produce the *same* double.

**② Engine identity replaces commit identity.** `computeEngineHash()` is a SHA-256 over a declared source set (`ENGINE_SOURCE_INPUTS`: package/lock, tsconfig, vite config, the replay instrument, `assets/contracts`, layer/crafted-upgrade JSON, and `src/**`). Headless tapes carry `meta.engineHash`; the worker prefers it to the legacy `ASSAY_BUILD_ID` commit pin, which survives as the fallback for browser and pre-`engineHash` tapes. A docs-only worker deploy therefore no longer churns the pin. The worker additionally **hard-refuses any Node but 26.4.0** at module load, naming both required and actual versions.

**Hill Mine's honest disposition:** the cured engine replays that tape identically on Darwin and the live Linux host (`fnv1a32:53d07e8d`, wave 16, 27g, unsecured, 508.967 s, 15,269 steps) — which by construction cannot reproduce its historical `fnv1a32:017e4c97` winning claim. The row stands **unassayable**, documented rather than papered over. That is the master's §5 alternative, taken honestly.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **green, 1.23 s** |
| `assay-worker.test.mjs` + `assay-replay.test.mjs` | **13 pass / 0 fail** (48.9 s) |
| `scripts/test-standings.mjs` | **green BOTH arms — kv 136, sqlite 136** |
| `scripts/test-stats.mjs` | **87 checks pass** |
| `scripts/test-ledger-worker.mjs` | **15 checks pass** |
| `test:node-guards` (F-1460-1 mandatory — slice touches `src/sim/`) | **rc=1, 566.5 s, 82 files — ONE root red, proven INHERITED (below)** |

Batteries were run **leg-by-leg, not as one `&&` chain** — an `&&`-chained battery reports a floor, not a count. `test:node-guards` was run **ALONE** (F-1537-1) in the fire shell at file-concurrency 1.

### The one red, attributed rather than waved at

The battery reported **two** failures that are **one** defect:

1. `blocker-panel-closed-guard.test.mjs` — 6 tests, **5 pass / 1 fail**. The failure is its *defect arm* (*"reds on the pre-strike ledger that manufactured the owner directive, greens on the struck one"*), asserting `0 !== 1` with `panel rows: 7 · closed-on-panel: 0`. Note the same output line reads **`blocker-panel-closed-guard: PASS`** — the guard itself is green on the live board.
2. `fixture-teardown.test.mjs` — fails at `:40` with `1 !== 0` **solely because that child failed**. It spawns all 79 `scripts/*.test.mjs` files, so it is a **cascade**, not a second defect.

**Control (Mistake #4 — I did not inherit s2280's proof, I re-took it):** the same test run on **clean main**, a tree this slice never touched, fails **byte-identically** — `panel rows: 7`, `actual: 0, expected: 1`. Inherited, not caused. This is **F-2280-4**, already diagnosed and filed one fire ago: the guard's fixture deliberately pairs a BACKLOG frozen at `2e02098f` with the *live* `dashboard-gen.sh`, and the live panel's row rule has since drifted, so only 7 rows are drawn from that ledger and `F-1030-2` is no longer among them. The ledger is fine and the guard is fine; the **coupling** rotted.

**Nothing in this slice's diff can reach that guard** — it touches no ledger, no BACKLOG panel row, and no dashboard script.

## Merge classification

Base `a94acfc1e`; main had moved **21 commits** ahead, including s2280's `door-tick-ceiling-v2` merge `d8cae3c3` — which touches **two of this slice's ten files**. Merged with a real three-way (`--no-ff` of the gated commit itself), **no conflicts**.

| File | Class |
|---|---|
| `src/sim/TileHeight.ts` | LANE-TOUCHED |
| `scripts/assay-replay-agent.mjs`, `scripts/assay-worker.mjs`, `scripts/gr-sim.mjs` | LANE-TOUCHED |
| `scripts/assay-worker.test.mjs`, `scripts/assay-replay.test.mjs` | LANE-TOUCHED |
| `docs/ops/agenttown-server.md` | LANE-TOUCHED |
| `functions/api/standings.ts` | **BOTH-MOVED** — resolved, verified by content |
| `scripts/test-standings.mjs` | **BOTH-MOVED** — resolved, verified by content |
| `tasks/BACKLOG.md` | LANE-TOUCHED (one appended row) |

**The two BOTH-MOVED files were verified by reading the merged tree, not by trusting the auto-merge** — `BOTH-MOVED` is a triage bucket, not a verdict, and a clean auto-merge is not evidence that both sides survived:

- `functions/api/standings.ts` — main's F-2276-1 cure is **intact**: the `maxRunTapeTicksForContract` import (`:15`) and its use as the duration ceiling (`:1063`) both survive, as does main's `reel_too_large` wording (`:1190`, `:1192`). The lane's own additions are present: `validTapeMeta` (`:1018`) and the `publicReel` engineHash strip (`:410`).
- `scripts/test-standings.mjs` — main's `checkDurationCeilings` (`:203`, called `:40`, imports `:30`) and its Twin Banks / Night Shift POST checks (`:186`, `:190`) survive **alongside** the lane's new `checkEngineHashReel` (`:105`, called `:42`). Confirmed arithmetically too: **132 checks at s2280 + 4 new = 136 measured**.

This mattered: the lane branched *before* `door-tick-ceiling-v2` landed, so a careless resolution would have silently reverted the launch-week ceiling cure **and taken its only regression pin with it**, leaving a green suite attesting to the loss.

**Firewall: HELD exactly.** All ten files are inside the master's TOUCH-ONLY list; `src/sim/**` was permitted conditionally *"ONLY if the diagnosis proves a sim determinism defect"*, and the diagnosis does.

## Findings

### F-2281-1 — the canonicalization has an undeclared magnitude domain, and it is narrower than it looks (non-blocking, measured)

`roundMotion(v) = Math.round(v * 1e15) / 1e15` collapses adjacent doubles **only while `|v|` stays small**. Measured this drain, probing a 1-ULP perturbation:

| `\|v\|` | 0.05 | 0.3 | 1.0 | **4.0** | 9.0 | 16.0 |
|---|---|---|---|---|---|---|
| 1-ULP delta absorbed? | ✅ | ✅ | ✅ | **❌** | ❌ | ❌ |

Above ~4 the 1e-15 quantum is comparable to `ulp(v)`, so the rounding stops canonicalizing and the platform difference passes straight through — **silently**, since nothing declares the bound.

**It holds today**, and the code says why without meaning to: `distance` is a per-step movement delta, and `TileHeight.ts:215` (`probe = max(0.25, min(0.5, distance * 2))`) implies `distance` is order 0.1–0.25. `projectedDistance ≤ distance`, so the canonicalized values sit two orders of magnitude inside the safe domain. **Not a defect — an unstated precondition** that a future speed or timestep change could cross with no test to catch it.

### F-2281-2 — the cure closes the proven path and leaves sibling transcendental sites raw (non-blocking, by design)

Only the `SLIDE_ROTATION_DEGREES` candidate is canonicalized. In the same function, `Math.hypot` (`:148`, `:192`) and the `fallbackLength` slide candidates (`:197`, `:199`) feed authoritative state **unrounded**, and `Math.atan2` (`:203`) is absorbed only incidentally because its consumer's product happens to be rounded.

This is **correct discipline, not an omission** — the master forbade speculative fixes and the runner cured exactly the mechanism it proved. But it bounds the claim: this slice fixes *the Hill Mine divergence*, not *the class*. A future tape diverging at `hypot` would present identically and need its own bisection.

### F-2281-3 — the engine hash is a conservative superset, so it only partly discharges the churn goal (non-blocking, transparent)

The master asked for the set to be defined *"honestly: `src/sim/**`, the contracts data, Balance; read what the replay actually loads."* The runner chose **`src/**` entire** — conservative, so it can never *falsely accept* a skewed tape, and it is declared in the source rather than hidden.

The cost is that the stated goal is only half met: a **docs-only** deploy no longer churns the pin (the problem that motivated the task), but a **render-only** edit — three.js material tweaks the headless replay never loads — still changes the hash and will skew-reject freshly-recorded honest tapes. Worth narrowing when someone can prove the replay's true load set; not worth guessing at now.

## Where does the player see this?

`resolveTerrainMove` is called by `src/entities/Hero.ts` and `src/entities/Enemy.ts`, both loaded by `src/game/Game.ts` — so this is on the **browser** path, not headless-only. Every hero and enemy cliff-slide now quantizes at 1e-15. The change is imperceptible in play by construction (it moves positions by <1e-15 world units) but it **is** gameplay code, so this merge carries the GZ-01 duty and the deploy law.
