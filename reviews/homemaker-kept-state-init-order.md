# Review: homemaker-kept-state-init-order — the kept-state restore runs after the wave system exists (lane-a, Claude Opus 5 implementer, attended drain 2026-09-05)

**Slice/branch/tip:** `homemaker-kept-state-init-order` · `lane/a` · commit `31850fabe` over base `1e63b52ee` · merge `d571f4748` (no-ff; era-registry and BACKLOG unions).
**Verdict:** MERGED. F-ADM-1 (AD2-B1) cured: a reload of an E6 run with the Homemaker kept no longer throws `Cannot read properties of undefined (reading 'suppressBaronForRun')` and boots dead.

## What it does
`Game.ts:1084` builds the Homemaker in a field initializer, before the constructor body assigns `this.waveSystem` (`:1466`); the Homemaker's constructor called `restorePersistentKept()`, whose `suppressBossSpawn()` reaches the wave system. Now the constructor only arms `keptRestorePending`; `Game` calls the new public `restoreKeptState()` on the line after `new WaveSystem(...)` returns, with a one-line backstop at the head of `update()` and `reset()` routed through the same path (+26/−2 in `HomemakerBossSystem.ts`, +8 in `Game.ts`). No behaviour change beyond the ordering.

## Evidence
| Proof | HEAD `1e63b52ee` | this slice |
|---|---|---|
| Reload with seeded kept state (`gr.profile.v2.<id>.tilestate.e6-glow-mesa`) | boot dead, `pageerror … suppressBaronForRun` | boots, no errors, `persistentKept: true, chairPlaced: true, act: 3, poweredDown: true` at the seeded position |
| E6 null floors seeds 01/02 | `fnv1a32:0ae65b8e` / `004ae8d7` | identical (= pinned) |
| Played 40-order tape (live / recorded / `assay-replay.mjs`) | `42cc6cdb` / `fdce1d04` / `fdce1d04` | identical |
| `e6-boss-homemaker.spec.ts` | 2 failed (timeout at `:227`, the crash masked) | 2 passed (13.7 s) |
| `e6-roster` + `e6-boss-homemaker` | — | 8/8 both projects |
Attended on the merged tree `d571f4748`: era pin `a44df406` 5/5, tsc 0, and the e2e/build/battery lines in the drain commit message. Law pointer `scripts/fire.md` `Game.ts:2532–2544 → :2540–2552` re-based by reading both ends (F-HKS-3).

## Findings
- **F-HKS-1 (fire-authorable, sim side):** `src/sim/HeadlessContractSim.ts` has the same shape (Homemaker at `:1163`, `this.waves` at `:1232`, `suppressBossSpawn` at `:1181`), latent only because that host gets `NO_PROFILE_STORAGE` so `readAtBirth()` is always null; the `update()` backstop keeps it correct without editing it (hash table = proof). Align the sim's construction order in its own slice.
- **F-HKS-2 (fire-authorable, spec quality):** the wait at `e6-boss-homemaker.spec.ts:227` masks a boot crash — the page has thrown and the spec's `errors` array already holds it, but `waitForFunction` dies 90 s before `expect(errors).toEqual([])` runs. Assert the error array before long waits.
