# e2-escort-mode-as-data — escort mode becomes sim boot data, not URL state

**Slice:** `lane-escort-mode-as-data` (F-CEN-8, promoted out of the post-launch census ladder as the **E2 bench prerequisite**)
**Branch / tip:** `lane/perf` @ `8ae24c85` · **base** `96fb9059` · **merge** `372808f0ae2cf6dd025623b2b7872dadd4454f3d`
**Drained:** s1399 fire, 2026-08-02 · gates in a detached worktree (§3.0b), `--workers=1` throughout (§3.1)

## VERDICT: MERGED

§3.0 block-check ran FIRST, `--strict`, before any opinion was formed: **✅ CLEAR** — leaf `e2-escort-mode-as-data`, status `building` (registered by s1398, which discharged the attended session's goal-leaf debt). Read as the WORD, not the exit code.

## What it does

Escort mode used to be **live URL state**: `WaveSystem.escortMode` re-read `globalThis.location.search` on every access and returned the mode only when `mode=escort` and `mp!=='dev'`. That made escort **unreachable headless** (no `location` in the sim) and **undeclarable in a mechanics manifest** — which is exactly what blocks the E2 bench.

The slice moves the read to the **boot edge** and threads it as data:

- `src/main.ts` — new `runBootFromSearch(search)` parses the URL **once** at start-up, carrying the *identical* gate (`mode==='escort' && mp!=='dev'`), and hands a `ContractRunBoot` to `new Game(...)`.
- `src/systems/WaveSystem.ts` — `escortMode` now reads `this.boot.mode`; the `URLSearchParams` read is gone.
- `src/town/TownScene.ts` — the board launch passes `{ mode }` explicitly instead of mutating the URL via `history.replaceState`; `launchContract` still writes `mode` into the URL so a reload preserves the run.
- `src/sim/HeadlessContractSim.ts` — constructor takes a `HeadlessContractBoot`, so `gr-sim --mode escort` runs escort with **no URL at all**. This is the deliverable.
- `src/agent/MechanicsManifest.ts` — derives a `modes[]` field, so escort is now **declarable** in the agent-facing manifest.

**Player-facing behaviour is unchanged** — same launch, same URL, same gating. This is an architectural slice that unblocks headless escort simulation. Gameplay rules, rewards and escort mechanics are untouched.

## Merge classification

`git diff main..lane/perf` reported **29 files / 408 deletions**. Every extra one is a **phantom of a stale base** (`96fb9059`). `git show 8ae24c85 --stat` is the fact: **12 files, +141/−62**, and the merge landed exactly that.

All **12 LANE-TOUCHED, zero MAIN-MOVED** — re-verified against the *moving* tip (main advanced from `abcd8874` → `ad63c5a8` → `b5f2d37a` mid-drain under a live attended session; `git diff 96fb9059..<tip> --name-only` intersected the 12 paths at **∅** each time). Main's movement was docs/ledger only. Clean `ort` merge, no conflicts, no graft needed.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.89s** |
| `node --test scripts/gr-sim.test.mjs` (own) | **6/6** |
| `e2-escort-mode` + `e2-incline` + `e2-trestle` + `agent-view` | **16 passed / 18**, 2 reds below |
| `release-build.spec.ts` **under `playwright.release.config.ts`** | **28/28** (14 desktop + 14 mobile) |
| `cw-02-escort.spec.ts` | 2 red — control-proven pre-existing |
| `npm run test:node-guards` | rc=1 → **cured**, see F-1399-2 |

**Adjacency was derived by grep, not inherited from the runner's list.** The runner named "focused E2 escort"; the sharp question is *who drives the changed activation path*, so `grep -rln "mode=escort" e2e/ src/ scripts/` → exactly four specs (`e2-escort-mode`, `e2-incline`, `e2-trestle`, `release-build`), plus `grep -rln ContractRunBoot` for the type's consumers and `grep -rln contractMode` for the **town launch** path (`cw-02-escort`) — the player-facing entry the runner did not name.

⚠️ **`release-build.spec.ts` was run under its OWNING config, not the default.** `playwright.config.ts:39-43` `testIgnore`s it, so the default harness collects **nothing** and prints `No tests found`. This is F-1398-1, filed one fire ago — and this drain is the first to touch that spec since, so the lesson was applied rather than re-learned.

## Reds — both control-proven pre-existing, neither caused by this merge

1. **`agent-view.spec.ts:264` (both projects)** — asserts a hardcoded **five**-name E1 roster; the data ships six. **Control run** on clean main (`ad63c5a8`, detached worktree, same harness, `--workers=1`): identical failure at `:263`/`:268`, same assertion, same `+ "e1-drill-yard"`. Line numbers shifted by exactly **1**, matching the lane's single `"modes": []` insertion at `:51`. This is the known owner-blocked drill-yard roster debt (F-1396-4).
2. **`cw-02-escort.spec.ts:61` (both projects)** — control run on clean main fails identically in both projects. Documented in `logs/suite-red-inventory.md:83-84,420` at a **55.4%** failure rate (67/121) — a known flake, not a regression. Notable because this is the *town-launch* escort path the slice touches, so it was controlled rather than waved off.

## Findings

**F-1399-1 (🔺 OWNER-RELEVANT — the desk's cheapest item buys less than it advertises).** The F-1396-4 ask is *"carve the four uncontested files out of the blocked `7c4f132f`; cures **6 of the 8** remaining red project-results."* **Measured this fire: it cures 4 of 8, not 6.** F-1396-4 itself names the single contested file as `e2e/fixtures/e1-mechanics-manifests.json` (+36 lines) — and that fixture is precisely what `agent-view` compares against. Proof, not inference: in a detached control worktree at clean main I applied **only** the uncontested `agent-view.spec.ts` hunk from `7c4f132f` and re-ran the test. It renames to *"all six E1 mechanics manifests…"*, gets past the roster assertion, and then **fails on the fixture comparison with `+113` received lines** — the entire missing `e1-drill-yard` entry. The fixture holds **5** entries (`the-claim, e1-dry-gulch, e1-night-shift, e1-twin-banks, e1-baron`), the derived roster yields **6**.
*Why nobody saw it:* the roster assertion at `:268` fails **first**, and an early assertion disables everything after it — so the fixture defect has been invisible behind the one everybody was reading.
**REC:** when the owner rules on F-1396-4, carve the fixture too, or expect `agent-view` to stay red. The owner's word is still worth spending — it just buys 4 project-results, and the honest number should be on the desk before they spend it.

**F-1399-2 (🟢 class note — a code-shifting merge rots law pointers into code).** `test:node-guards` went **rc=1** on the merged tree: `law-pointer-guard` reported POINTER DRIFT for `tasks/goals.json[e1-hold-the-claim-defeat-fork] → src/game/Game.ts:6640`. **Control: clean main PASSES**, so my merge caused it — the lane's `Game.ts` hunk shifted the region by +5. Re-based after **reading** the code, not by arithmetic: `private endRun(): void {` 6640→**6645**, `finishPendingDeath()` 6661→**6666**, `endRunForTest` 1804→**1810**. Substance re-verified and unchanged: `endRun()` still has exactly two callers, `:1812` (debug hook) and `:6668` (hero death). This is the s1301 class with a wider mouth — that law names ledger rows, law surfaces and gate topology as the things a fire mutates late; this adds **the code that law surfaces point INTO**, which any merge can move without touching a single law file. The mechanism worked: the guard is inside `test:node-guards`, which the drain battery runs on the merged tree, so it was caught **before** the merge landed, not after.

**F-1398-1 (inherited — MEASURED this fire, cure deliberately not built).** s1398 recommended a guard that reds when a task master names a claimed spec without naming its owning config, and left it fire-authorable. I measured the class before anyone builds it: the mapping is **fully machine-derivable** (the default config's `claimedByAnotherConfig` array names the specs; each owning config declares `testMatch: /release-build\.spec\.ts/` etc.), so no hardcoded table is needed. **Denominator: 1,062 tracked task masters; 18 name a claimed spec; exactly 2 prescribe a config-less run** — `f1397-1-e1-release-door-drill-yard.md:38,61` (the F-1398-1 incident) and `lane-b-approach-convergence-class.md:36,60`. **Both are already SHIPPED** (`2daeb689`, `0b8db8f9`), so the guard would red on history from its first run; the citation-safe cure is to **append** a correction note to each file rather than edit the cited lines (F-1397-3 rot). `lane-b-lb-03-bench-seed-sets.md:47` is the positive exemplar — it names the config inline and warns the default config cannot run it. ⓘ *At my own expense:* my first classifier reported **3** offenders; the third was **its own bug** — a 110-char truncation hid that the exemplary line also contained `playwright test --list`. The honest count is 2. Not built this fire because a drain arrived and drains outrank authoring.
