# f1401-1 — F-1400-3 diagnosed: the baron does not regress escort, it exposes a divergence and removes the accident that hid it

**Slice/branch/tip:** diagnosis only — no merge. Subject: `lane/e2-arsenal` tip `9a9fb2bb` (held by s1400), against main `a1ec923b`.
**Verdict:** **F-1400-3 MECHANISM PROVEN. s1400's stated hypothesis REFUTED.** No code merged; corrective master authored (`f1401-1-bound-the-headless-driver-and-rule-the-escort-bench`).
**Custody:** all work done in a detached scratch worktree (`.wt-s1401`, removed at the end). Main's working tree was never touched; `lane/e2-arsenal` is untouched and intact.

## What it does
s1400 refused the baron on evidence that the merged tree makes the `e2-hill-mine` escort headless run spin forever at 99.4% CPU, and filed a hypothesis for the next fire to confirm *by reading, not by assuming*: that the new `escortsSpawned` count threaded through `spawnBaronWave` → `spawnComponentBossWave`/`onBaronSpawned` was to blame. This fire read it, refuted it, and found the actual mechanism by control.

## The hypothesis is refuted
`git diff main...lane/e2-arsenal -- src/systems/WaveSystem.ts` is a pure count pass-through: `escortsSpawned` is accumulated from the existing `spawnAt` return values and handed to two callbacks. It adds no loop, no condition on control flow, and cannot spin. Reading it was enough; no run was needed.

## The mechanism, by three-arm control
Same command, same seed, same shell, one detached worktree per arm:
`node scripts/gr-sim.mjs --contract e2-hill-mine --seed e2-escort-headless --mode escort --policy=idle`

| Arm | Result |
|---|---|
| clean main (`a1ec923b`) | `rc=0` in **4.5s** — `{"secured":true,"waves":12,"timeMs":360000,"kills":100,"calls":0,"eventLogHash":"fnv1a32:b3706fdc"}` |
| + `lane/e2-arsenal` merged | **never terminates** — alive past 150s under a 90s `spawnSync` timeout, reaped by hand |
| + merged, `Number.MAX_SAFE_INTEGER` branch neutralised (one-line edit) | `rc=0` in **4.57s** — `{"secured":true,"waves":12,...,"eventLogHash":"fnv1a32:be31e9d2"}` |

Arm 1 reproduces s1400's control hash `b3706fdc` exactly, which is what licenses comparing the other two against it.

The cause is the slice's new `autoSecureWaveForRun` (`src/sim/HeadlessContractSim.ts:225` merged):
```ts
autoSecureWaveForRun: () => this.manifest.twist.baron && !this.baronBeaten
  ? Number.MAX_SAFE_INTEGER
  : this.manifest.twist.secureWave ?? Balance.run.secureWave,
```
`RunManager.ts:540` consumes it (`secureWave: () => host.autoSecureWaveForRun?.() ?? host.secureWaveForRun?.()`). `e2-hill-mine` declares **both** `twist.baron` (escortCount 6, componentised) and `twist.secureWave: 12` and `modes: ["escort"]`, so the run never auto-secures. `scripts/gr-sim.mjs:40`'s `while (true)` then has no bound — and `advanceToTurn()`'s own `maxTicks` guard (`HeadlessContractSim.ts:244`) never trips, because it returns early on every wave change. Waves increment forever; the driver loops forever.

## The part that changes the verdict: the slice is probably RIGHT
Production gates auto-secure on a dedicated predicate, not on bare truthiness — `Game.ts:4675` → `waitsForBaronDefeat()` (`Game.ts:4709`):
```ts
const baron = this.activeContract.twist.baron;
if (!baron || this.baronBeatenThisRun) return false;
if (baron.variantId === 'dredge_queen') ...
if (baron.variantId === 'homemaker_9000') ...
return baron.variantId !== 'dynamo_crawler' || this.waveSystem.diagnostics.wave >= baron.wave;
```
`e2-hill-mine`'s baron carries **no `variantId`** — the string `variantId` appears nowhere in `assets/contracts/epoch-2-steamworks/contracts.json` — so the predicate falls through to `undefined !== 'dynamo_crawler'` → **true**. Production therefore withholds auto-secure for `e2-hill-mine` while its baron lives, which is what the slice makes the headless sim do.

⚠️ **Read-verified, not run-verified.** I did not drive the browser game to observe it. The authored master makes confirming this scope item 3, and requires evidence either way.

If it holds, the honest framing is: the baron slice did not regress escort — **main's escort bench has been asserting `secured:true, waves:12`, an outcome production would not produce**, and the slice removed the accident that was producing it. That reframes the fix from "revert the baron" to "bound the driver, then rule which side of the divergence the bench asserts."

## F-1401-2 — a caller-side `spawnSync` timeout is not a bound
The escort test at `scripts/gr-sim.test.mjs:103` already passes `timeout: 30_000`, and s1400 still watched the entire battery hang. Independently, s1401 ran the same child under `spawnSync` with `timeout: 90_000` and found it **alive past 150s**, requiring a manual reap by command string. With `--policy=idle` the driver loop contains no `await`, so it is fully synchronous CPU-bound JS that never yields to the event loop. Two fires, two callers, two nominal timeouts, no reaping.
**Consequence:** the bound must live inside the loop that spins. This is the same class as F-1400-4 (`--test-timeout=0`) seen from the other end: F-1400-4 says the battery has no bound, F-1401-2 says the per-call bound you would reach for instead does not fire either.

## Findings
- **F-1401-1** 🔺 BLOCKER (baron, diagnosis complete) — the escort non-termination is caused by `autoSecureWaveForRun` returning `Number.MAX_SAFE_INTEGER` for any contract declaring `twist.baron`, combined with an unbounded driver loop. Proven by three-arm control. s1400's `escortsSpawned` hypothesis is refuted by reading. The slice likely matches production; the divergence is main's. Corrective authored.
- **F-1401-2** 🟢 GATE ROBUSTNESS — `spawnSync`'s `timeout` did not reap a synchronous CPU-bound child in two independent measurements (30s nominal, 90s nominal). Caller-side timeouts cannot be relied on to bound a headless sim; bound the driver itself.
- **F-1400-3** — superseded by F-1401-1 as to mechanism. Its refusal of the merge stands and was correct.
