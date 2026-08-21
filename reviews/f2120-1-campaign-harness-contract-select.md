# Review — f2120-1: campaign harness contract selection

**Slice:** `f2120-1-campaign-harness-contract-select`
**Branch:** `lane/a`
**Tip:** `59e714bb648f8da475253bba40e3836b86248273`
**Base:** `7fd7d44fc4ed3d88f0ec050e8ae9ae0181bda716` (2026-08-20T21:36:00+07:00, `runner(lane-a): b7-showroom-capture-quota.md`)
**Drained by:** s2122 fire, 2026-08-21
**Gate worktree:** `gate-s2122` (detached — §3.0b custody: undecided content never entered main's working tree)

## Verdict

**MERGE.** The slice does exactly what F-2086-1's `RECORDED-NOT-BUILT` clause specified, the backward-compatibility control passes unmodified, and all three required refusal arms were reproduced by my own command-line control rather than taken from the runner's headline.

⚠️ **One documented gate gap, stated plainly and not buried:** the full `test:node-guards` battery did **not** run on the merged tree this fire. A concurrent attended battery and a five-way playwright fleet held the machine at load **241–362** for the whole drain window, and F-1537-1/F-2076-1 make a battery taken under that arrangement an untrustworthy instrument in both directions. What ran instead is the **measured dependency surface** of the diff (below), which is small and was enumerated rather than assumed. See F-2122-2.

## What it does

`scripts/gr-sim-campaign.mjs` gains a `--contract <id>` argument. When supplied, the board becomes exactly that one contract and the campaign walk runs it once; when absent, the board construction, the `the-claim`/`e1-*` filter and the secured-contract walk are structurally untouched, so every existing baseline stays reproducible. The substance of the slice is that an unresolvable `--contract` **refuses loudly before any setup work** — the refusal block sits above `await mkdir(outputDir)`, so no output directory, no sim and no leg artifact is created on the refusal path. Four arms refuse, each with a distinct greppable message and a non-zero exit: unknown id, unscored-practice contract, unseeded contract, and locked contract (whose message carries the `contractUnlockStatus()` `condition` string verbatim). This closes F-2086-1's stated danger — *"the harness **succeeds** and returns numbers about the wrong contracts"* — and opens its standing `GATE: an E3+ census slice is not authorable until the harness can select its contract.`

## Evidence (measured on the MERGED tree in `gate-s2122`, not inherited)

| Arm | Result | Time |
|---|---|---|
| `node scripts/drain-block-check.mjs <done-move>` | ✅ CLEAR (re-asserted on the merged tree) | <1s |
| `npx tsc --noEmit` | rc=0 | 17.8s |
| `npm run build` | rc=0 — 2,197 modules, asset-diet 1,158,214 / 1,500,000 bytes | 43.8s |
| **own spec** `node --test scripts/gr-sim-campaign.test.mjs` | rc=0 — **6 tests, 6 pass, 0 fail, 0 skipped** | 37.6s |
| adjacent `fixture-teardown.test.mjs` | rc=0 — **34 subjects**, all temp dirs removed | 113.9s |
| adjacent `function-cors-allowlist.test.mjs` | rc=0 — 2/2 | 0.1s |
| adjacent `gate-caller-audit.test.mjs` | rc=0 — 26/26, incl. positive control on the real repo | 3.7s |

Transcript: `artifacts/f2120-1-gate.txt` (append-only, ISO-stamped, via `scripts/gate-battery.mjs --cwd gate-s2122`).

**Backward-compatibility control (master scope item 3), unmodified and passing:**
`scripts/gr-sim-campaign.test.mjs:62` *"campaign walks E1 legally, persists each leg, and hashes deterministically"* — still pins `fnv1a32:4f363fd5` and the five-leg order `the-claim,e1-dry-gulch,e1-night-shift,e1-twin-banks,e1-baron`. The test diff is **purely additive** (no `-` lines in that file), so the three pre-existing assertions are provably untouched.

**Refusal arms — my own control run, not the runner's paste** (the drain's re-run is a free control on the runner's headline):

```
exit 1: Error: Contract "not-a-contract" is not on the board.
exit 1: Error: Contract "e5-stillwater" has no pinned bench seed.
exit 1: Error: Contract "e3-canyon-works" is locked: The Voltage Age awaits — raise the Dynamo Hall.
```

All three reproduced **verbatim**, exit 1 each. The locked arm carries the live unlock condition, as the master required.

**Why the adjacent set is what it is — the dependency surface was MEASURED, not guessed.** `grep -rln gr-sim-campaign scripts/ package.json e2e/ src/` returns exactly five hits: the harness itself, its own test (run, green), `scripts/function-cors-allowlist.test.mjs` (run, green), `package.json` (the `test:node-guards` rooting), and `src/sim/HeadlessContractSim.ts:715` — which is a **comment**, not a code dependency, and is the subject of F-2122-1. `fixture-teardown` was added to the set because the diff introduces a **new `mkdtemp` prefix** (`gr-campaign-contract-`) and that guard's whole subject is `scripts/*.test.mjs` temp-dir ownership; it is the one guard this diff could most plausibly have broken, and it is green with the new prefix in scope.

## Merge classification

Base `7fd7d44fc`. `git log <base>..main -- <the three lane paths>` is **EMPTY** — main never moved any of them in the ~12.5h since base. No conflicts; `git merge --no-ff` resolved by the 'ort' strategy with zero conflict hunks.

| File | Class | Note |
|---|---|---|
| `scripts/gr-sim-campaign.mjs` | LANE-TOUCHED only | +27/−5; main untouched since base |
| `scripts/gr-sim-campaign.test.mjs` | LANE-TOUCHED only | +51/−0, purely additive |
| `artifacts/f2120-campaign-harness/REPORT.md` | NEW | free |
| `src/sim/HeadlessContractSim.ts` | **DRAIN-ADDED** | comment-only, F-2122-1 — see below |

Base is ~12.5h stale but touches no hot file (`Game.ts`/`CombatSystem`/`main.ts`) and no path main moved, so Mistake #15's RE-LAND trigger does not apply.

## Findings

**F-2122-1 — this merge rots a line citation in `src/sim/`, and nothing watches that class. FIXED IN THIS DRAIN COMMIT.**
`src/sim/HeadlessContractSim.ts:715` cited `gr-sim-campaign.mjs:88` for the profile-storage write site. On main `:88` is `const sim = new HeadlessContractSim({ contractId, seed }, { storage });` — an accurate citation. The slice inserts 15 lines above it (`@@ -60,18 +60,33 @@`), moving that site to `:103` and leaving `:88` pointing at `if (!contract) break;` — an unrelated line. Re-based in this commit per the house lifecycle that `CLAUDE.md` §4.10b documents (*"the rotting commit predicted and re-based in its own landing commit"*), and re-phrased to name the **code** at the site rather than the number alone, so the next insertion degrades it to merely imprecise instead of actively wrong. ⚠️ **The class is worth naming beyond this instance:** `law-pointer-guard` watches law surfaces (`scripts/fire.md`, `CLAUDE.md`, `.claude/skills/**`), so a `src/**` comment citing a `scripts/**` line number rots **silently and forever**. This is non-blocking and no guard is proposed — a guard over every backticked `file:line` in `src/` comments would fire constantly and earn a permanent excuse (the `cross-engine` fate, F-1460-1). The durable lesson is the one the law already states and this is simply a fresh instance of: **cite the code, not the coordinate.**

**F-2122-2 — the full `test:node-guards` battery did NOT run on the merged tree, and the reason is machine arrangement, not judgement. NON-BLOCKING, but recorded so it is not mistaken for a clean full sweep.**
Measured, not assumed: at drain time an attended session (pid 40448) was running a six-file `node --test` subset (`same-game-audit`, `same-game-report-guard`, `door-admission-ratchet`, `bench-seeds`, `skillmd-guard`, `gr-sim`), and a five-way playwright chromium fleet started mid-drain, taking 1-min load from **18 → 78 → 362** and holding it in the **241–362** band. Two effects, both disqualifying: (a) `node-guards-contention` reds by design when it detects a second battery — this is exactly the predeclared red the runner hit in the lane, and it would have been a false red **about my own drain**; (b) F-2076-1 measured per-test budget margins moving 2.0–2.4× with load, so reds taken there are the arrangement's, not the slice's. I ran the measured dependency surface instead (table above) and am naming the gap rather than letting a targeted green read as a full sweep. **Recommended for the next fire on a quiet machine:** `node scripts/run-guards.mjs --changed-since 7fd7d44fc4ed3d88f0ec050e8ae9ae0181bda716` — one command, and the merge hash below is its subject.

**F-2122-3 — the runner reported an adjacent discrepancy it correctly did not fix. NON-BLOCKING, carried forward.**
The master's LANE CURRENCY note asserted `lane/a`'s `assets/contracts/bench-seeds.json` carried two lane-only E7 seeds (`e7-echo-canyon`, `e7-relay-rush`); the runner reports the checkout has **neither**. The slice's firewall forbade `assets/contracts/**` and the runner respected it, reporting instead of fixing — the correct behaviour. This changes nothing about this merge (the slice never reads those seeds) but means the master's dispatch-time currency note was already stale or wrong. Worth one grep by whoever next authors against `bench-seeds.json`; not worth a corrective on its own.

**Scope item 5 (resolve-and-report, no code) — answered YES, and the answer is load-bearing for the E3 census that motivated the whole slice.** The runner establishes from source that `--resume` can supply an E3-active profile with no unlock bypass: `--resume` passes the checkpoint envelope to `unpackProfile()` (`scripts/gr-sim-campaign.mjs:55-60`); the active-epoch key is an allowed profile datum (`src/game/ProfileStorage.ts:57-66`) that transfers pack and restore (`src/game/ProfileTransfer.ts:64-76`, `:136-150`); and `epochIsActive()` reads that restored pointer (`src/meta/ContractFamilies.ts:1091-1108`). So a genuine checkpoint exported from an epoch-3 profile makes `e3-canyon-works` pass its epoch gate, while a fresh checkpoint stays correctly locked. **No `activateEpoch()` call, fixture mutation or unlock bypass was added** — the firewall held.

**Scope creep check — the fourth refusal arm is required, not creep.** The master named three arms; the runner shipped four, adding `practice?.scores === false`. Without it, a scored-practice-disabled contract passed to `--contract` would filter to an empty board and exit 0 having measured nothing — precisely the silent-wrong-answer failure mode the master's own ⚠️ clause forbids (*"Under no circumstance may an unresolvable `--contract` fall back to the default board or exit 0 having measured nothing"*). The runner also found and fixed, via its own independent `codex review`, that `--contract=` (empty) fell through to the default board; that is pinned by the sixth test. Both are inside the master's stated intent.

## What this un-gates

F-2086-1's standing `GATE: an E3+ census slice is not authorable until the harness can select its contract.` is now **OPEN**. E3+ census slices become fire-authorable, subject to supplying an epoch-active checkpoint via `--resume` per scope item 5.
