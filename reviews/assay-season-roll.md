# Review — the season roll (county board → assayed season 2; season one archived)
**Slice/branch/tip:** `worktree-agent-a6b1bbd373315d0c0` @ `206909333`, merged to main --no-ff (this drain). Built by a headless Opus-5 agent (owner engine directive 2026-08-20), drained attended. Implements the owner's 2026-08-15 ruling verbatim (`specs/agent-play/tape-contract.md` §SEASON ROLL).

**Verdict: MERGED — GREEN (one environment-class battery note, below).**

**What it does:** the county board gains a season dimension — season-1 rows stay at their legacy keys, READ-ONLY BY CONSTRUCTION (every write path calls `boardKey()` with the current-season default; `?season=1` serves the archive labeled `season:1, assayEra:false`; POST to an archived season → `403 season_closed` before the body is read). Current season (`s2`) starts clean and composes with the landed assay law. Client: a two-chip nav ("This season" / "First ledger") in the County Standings reader view, current-by-omission so it survives future rolls.

**Evidence:** four mutation proofs green in `scripts/test-standings.mjs::checkSeasonRoll` (empty current board beside the intact 17-row archive; labeled read-only archive with refused POST + byte-identical before/after; v2 POST → pending rank 1; v1 POST → stored, worker-rejected, unranked, row survives). Batteries: stats 87 · standings 57 (+26 new) · accounts 43 · tsc clean · build green · new `e2e/assay-season-roll.spec.ts` 4/4 (desktop+390px) · adjacent trio 32/32 both projects · zero console/page errors · screenshots in `artifacts/assay-season-roll/`. Honesty-guard finding honored: the chronicle's *name* seasons (`src/seasons/registry.ts`) are a WHEN-axis and deliberately not extended — the ledger season is an admission-law axis; both documented in code.

**Drain-side cures in this batch:** the agent caught my uncommitted `#pillars` anchor (landed `6e61749d5`); the `law-pointer-guard` drift its merge caused (goals.json citation `standings.ts:887` → `:925`, `boardKey` gained the season param) re-based + `--update`d per the guard's own remedy — 29 pointers PASS.

**Battery on the merged tree:** 468 tests — all substantive guards pass; across three runs the only reds were load-class and each **passes solo** (`agent-reels` 1/1 in 2.9s vs 56s-killed under load; `gr-sim` replay 17/17; final run's single red is literally *"contention is advisory … and absent when alone"* while the sanctioned E6 Opus build runs on this box). Fingerprint: environment, not code — the E5 drain hit the identical class.

**Findings (agent's, recorded):**
- **F-SR-3 (pre-existing, NOT this slice — proven by HEAD~1 control run producing the identical 20 failures): the standings-touching e2e suites are 50/20 red** because the landed assay lifecycle unranks tapeless fixtures (`isRankedRow` requires a tape; `board[0]` undefined). Debt belongs to the assay-cf-lifecycle drain. → successor master: fixture modernization (dispatching).
- **F-SR-4 (contract nuance, accepted):** a v1 tape holds a transient `pending` rank until the worker rejects it — closing the window would change ranking law inside a season (firewalled); the worker's cadence bounds the exposure.
- **F-SR-5 (player-visible, one-param fix):** the Founding Season page's live results matrix fetches with no season param → post-roll it reads the empty current ledger. Fix proven by the agent's own battery: `?view=byStack&season=1` merges through existing `mergeFieldBooks`. → truth-pass successor.
- **F-SR-6:** `public/skill.md` lacks `?season=` / `season_closed` docs for rig authors. → truth-pass successor.
- (Carried: **F-E5AC-1** MechanicsManifest deepwater prose — same truth-pass.)
