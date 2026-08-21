# f2144-1 — Canyon Works census attempt 4

**Slice:** `f2144-1-canyon-census-run-4` · **Branch:** `lane/d` · **Tip:** `5fafc7fcb` · **Merge:** `59de9467f1e87a72d2b0f9205020f1ceb64d6002`
**Drained:** s2145, 2026-08-21 · **Base:** `5409a0c3e` (42 min old at merge)

## Verdict

**MERGE.** The census the thread has chased for eight fires now exists on main with a number in it: **`powered 1 / required 2` at the deadline — short by one gallery.** Every headline in the runner's report was re-derived by this drain from `census.json` directly, not inherited, and all four available 540-row traces are byte-identical. The diff is `artifacts/**` only.

## What it does

Runs the sanctioned campaign harness twice on one tree, on the terrain binding cured by `f2142-1` (`8656ca1f1`), and writes the three things the banked s2143 discriminator never wrote: a **determinism pair** on one base, a **report**, and the **supersession** of attempt 3 (`attempt-3-superseded/` + NOTE — moved, never deleted, per the Retention Law). Attempt 3's `wave 2` headline is retired with its artifacts retained.

The result: power rises 0 → 1 during **wave 4** and never rises again; `failed` latches on the first turn of **wave 7** (exactly `wave > byWave` for `byWave: 6`) at **1 powered / 2 required**; both runs terminate `Error: e3-canyon-works ended unsecured at wave 8.` — four waves before the contract's `twist.secureWave: 12`.

**The cause of the wave-8 terminal is `NOT ESTABLISHED`**, and the run says so rather than guessing. That is scope 4.4's honest escape taken as designed: `HeadlessContractSim.outcome()` exposes only `secured:false` and `waves:8`, and the report names the instrument that would answer it (a trace emitting the terminal `run_ended` event and its `reason` before Gate B throws). ⚠️ `failed:true` remains a **measurement, not a balance verdict** (F-2143-2); second-gallery reachability stays reserved to the owner under **F-E2S-4**, untouched.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | clean |
| `npm run build` | green, `✓ built in 1.27s` |
| `node --test scripts/canyon-connect-view.test.mjs` | 1/1 pass |
| `node --test scripts/campaign-harness-terrain.test.mjs` | 1/1 pass |
| Cross-cutting battery | **not owed** — diff touches no `src/sim/`, `src/systems/`, `src/entities/` |
| Boot probe / screenshots | **not owed** — no renderable change; player-visible surface untouched |

Gated in a detached scratch worktree `gate-s2145` (§3.0b — main's tree carries a live concurrent writer's dirt on `docs/bench/`, `logs/**`, `artifacts/056/`, `assets/contracts/null-floors.json`, `scripts/assay-replay.mjs`, none of it mine and none of it swept). Merge and commit were **one act** on main (F-1589-5); `.git/MERGE_HEAD` verified absent before both commits.

### Control — the headline re-derived, not inherited

The drain's own re-read of `artifacts/f2135-canyon-census/census.json` (the free control on a runner's headline):

| Claim | Report | Drain's own read |
|---|---|---|
| rows per run | 540 | `run-4-a:540 run-4-b:540` |
| first `failed:true` | wave 7, 1/2 | wave **7**, powered **1**, required **2** |
| first `powered > 0` | wave 4 | wave **4**, value **1** |
| max `powered` | 1 | **1** |
| final wave | 8 | **8** |
| `run-4-a` ≡ `run-4-b` | `identical: true` | rows **byte-identical** (independent compare, not the file's own claim) |

**Third and fourth witnesses, checked because they were free:** both banked s2143 discriminator traces (`artifacts/f2142-1-cure/census-s2143.json`, `census-s2143b.json`) are **540 rows and byte-identical to `run-4-a`**. Four traces taken across three different bases agree row-for-row — the determinism claim is corroborated from outside the artifact that asserts it.

## Merge classification

Base `5409a0c3e`; all six paths **LANE-TOUCHED**, main moved none of them (`git log base..main -- <path>` empty for each). No conflicts, no graft, `ort` clean in both the gate worktree and on main.

- `artifacts/f2135-canyon-census/REPORT.md` — LANE-TOUCHED (rewritten: attempt-4 result supersedes the wave-2 headline)
- `artifacts/f2135-canyon-census/census.json` — LANE-TOUCHED
- `artifacts/f2135-canyon-census/epoch3-checkpoint.json` — LANE-TOUCHED (regenerated timestamps; SHA-256 `ad451d31…` → `32daa9fb…`, expected on newer main)
- `artifacts/f2135-canyon-census/attempt-3-superseded/{NOTE.md,REPORT.md,census.json}` — LANE-TOUCHED (new; retained evidence)

## Firewall

Held. The player was **not changed** — attempt 3's lift was withdrawn by the master and the runner did not need it: `scripts/f2135-canyon-census-player.mjs` flew 540 turns to wave 8 unchanged. `assets/contracts/epoch-3-voltage/contracts.json` byte-unchanged. No `src/**`, no test, no harness, no re-pin. `GATE C` restated honestly by the run: the sanctioned harness always selects `benchSeeds[contract.id][0]`, so pinned seed `e3-canyon-works-02` remains **unmeasured** and no two-seed census is possible through it.

## Findings

**F-2145-1 (non-blocking, no cure owed).** The run's `NOT ESTABLISHED` verdict on the wave-8 terminal is correct and is the *fourth* consecutive attempt in this thread to be bounded by the same instrument gap: the sanctioned harness throws at Gate B before writing leg artifacts for an unsecured outcome, so the only surviving evidence is the player's per-turn `census.json`, and `outcome()` exposes no terminal reason. Any fire tempted to answer "what ends the run at wave 8?" from the existing trace should read the report's §"What is not established" first — *this thread has already lost three attempts to confident readings of under-determined evidence.* The instrument, if anyone builds it, is named in the report; it is a harness change and therefore **not** a census task's to make.

**F-2143-4 — still open, and this drain deliberately did not discharge it.** The `same-game report exemption reasons and citations match source` red (`stale exemption reason for 'e2-incline'`) was established as inherited by s2144's controlled second worktree. No cross-cutting battery was owed here, so it was not re-encountered; the cure remains `node scripts/same-game-audit.mjs --write-report`, owed by whoever next legitimately touches the bench. **Not a drain's to regenerate inside a slice**, and `docs/bench/same-game-audit.md` is currently dirty in main under a concurrent writer.
