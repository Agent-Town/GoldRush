# e1-headless-twin-banks + e1-headless-baron — s1400 drain gate

**Slices:** `lane-headless-twin-banks` (lane-a, `lane/m3`, tip `e1bff1e8`) · `lane-headless-baron` (lane-c, `lane/e2-arsenal`, tip `9a9fb2bb`)
**Base (both):** pre-escort — `96fb9059` (m3) / `67d28607` (e2-arsenal)
**Gated at:** main `b79b9235`, detached scratch worktree (§3.0b), `--workers=1` (§3.1)

## VERDICT: NEITHER MERGED — both refused on control-proven evidence.

`e1-headless-twin-banks` — **HOLD (lane-side defect):** its own determinism gate fails at its own tip.
`e1-headless-baron` — **HOLD (merge-induced regression):** the merged slice puts the escort headless run into an infinite loop.

Nothing was placed in main's working tree at any point. Both lane branches are intact; no content is lost.

## §3.0 block-check — run FIRST, `--strict`, before forming an opinion
```
✅ CLEAR — lane-headless-twin-banks.md [e1-headless-twin-banks] status="building"
✅ CLEAR — lane-headless-baron.md      [e1-headless-baron]      status="building"
```
Read as the WORD, not the exit code. Both leaves exist (s1398 registered them), so neither returned UNKNOWN.

## What these slices do
Both add a real contract driver to `HeadlessContractSim` so an E1 map runs headless through production systems: twin-banks (two-bank water, two fords, gravel bars, buildZone enforcement, secure at wave 20) and the baron (first BOSS driver — cadence, spawn/volleys/defeat from the data block, medal side-effects asserted OFF headless). Together they would have taken the E1 bench to 5/5.

## Merge classification (never blind-copy; the two-dot diff lies)
Both lanes branched **before** s1399's escort merge (`372808f0`), so both are stale-based.

| File | Class | Resolution |
|---|---|---|
| `assets/contracts/bench-seeds.json` | LANE-TOUCHED | clean |
| `env/goldrush-verifiers/README.md` (m3) | LANE-TOUCHED | clean |
| `scripts/gr-sim.test.mjs` | **BOTH-MOVED** | git 3-way, clean |
| `src/sim/HeadlessContractSim.ts` | **BOTH-MOVED** | git 3-way, clean |
| `src/systems/WaveSystem.ts` (baron) | **BOTH-MOVED** | git 3-way, clean |

⚠️ `git diff main lane/e2-arsenal -- src/systems/WaveSystem.ts` appears to **delete** s1399's escort work (removes the `ContractRunBoot` import, the `boot` ctor param, and restores `globalThis.location.search` reading in `escortMode`). Those are **phantom deletions of a stale base**, not a revert. Verified on the merged tree: `boot: ContractRunBoot` survives at `:146` and `escortMode` reads `this.boot.mode` at `:186` — no URL regression. Net merged diff vs main equals each lane's own commit stat exactly (m3 98+/4−; baron 260+/10−).

## Evidence

| Gate | twin-banks merged | baron merged |
|---|---|---|
| `npx tsc --noEmit` | clean | clean |
| `npm run build` | green, 1.06s | — |
| `git merge` | clean auto-merge (ort) | clean auto-merge (ort) |
| `test:node-guards` | **rc=1 — 229/230**, the 1 fail is the slice's own new test | not reached |
| `gr-sim.test.mjs` (full file) | 6/7 | **HANGS — SIGKILL at 300s** |

## F-1400-1 — CLASS: s1399's constructor change silently breaks every in-flight lane's `.mjs` test call sites
s1399's escort merge changed `HeadlessContractSim`'s constructor from positional
`constructor(readonly contractId: string, readonly seed: string)` to an object
`constructor(readonly boot: HeadlessContractBoot)`.

**Both** waiting lanes branched before it and add new call sites in the OLD positional form:
`scripts/gr-sim.test.mjs:210,237` (twin-banks) and `:220,281` (baron, as merged).

This defect is invisible to every gate before execution:
- **git merges it cleanly** — the ctor line and the call sites are in different files/regions, so there is no conflict to resolve.
- **`tsc --noEmit` is blind** — the callers are `.mjs`, loaded at runtime via `vite.ssrLoadModule`. tsc was **clean on both merged trees.**

At runtime the string is taken as the boot object, so `boot.contractId` is `undefined`:
```
Error: Unknown contract: undefined
  at loadContract (...)
  at new HeadlessContractSim (...:129:58)
  at scripts/gr-sim.test.mjs:210:19
```
Reproduced on both merged trees (baron: fails in 766ms under `--test-name-pattern="Baron"`).

**This is graft work, not a lane failure** — adapting a caller to a signature main changed is exactly what a 3-way graft is for. It is filed as a CLASS because it will hit *every* lane still based before `372808f0`, and because no pre-execution gate can see it.

**Proven curable:** applying only the 2-line call-site rewrite in the scratch tree, the baron's headline test **passes and its pinned hashes reproduce** — `✔ the Baron driver runs the declared fight and keeps medal writes off headless (12.4s)`. So the baron's *own* measurements are sound.

## F-1400-2 — twin-banks: the pinned determinism hash does not reproduce (BLOCKER, lane-side, NOT merge-induced)
`scripts/gr-sim.test.mjs:222` pins the secure-run hash `fnv1a32:5f57f7be`. Measured `fnv1a32:bfd79d2a`.

Every other outcome field matches the runner's report exactly — `secured:true, waves:20, timeMs:600000, kills:189, calls:0` — and the **idle** transcript hash `bdd90123` passes. Only the secure event-log hash differs.

**Control proves it is the lane's, not mine, and not my shell's:**
| Tree | Where | Result |
|---|---|---|
| merged (main + m3) | scratch worktree | masked by F-1400-1 |
| **lane tip `e1bff1e8`** | scratch worktree | `bfd79d2a` ≠ pinned |
| **lane tip `e1bff1e8`** | **lane-a's OWN worktree, OWN node_modules** | `bfd79d2a` ≠ pinned |

lane-a's worktree is **clean** at `e1bff1e8` (`git status --porcelain` empty), so the runner measured this exact tree. Two different directories, two different processes, same value — this is stable, not flaky. The runner's report claims "GR-SIM 6/6" and "secure hash `5f57f7be`"; **that claim is false at its own tip.** Its report also says "Review gap fixed", i.e. a late edit after measuring — the likely origin of a stale pin.

**Not environmental.** `advanceToTurn()` is a pure fixed-step loop bounded by `maxTicks`; `performance.now()` only accumulates `advanceCpuMs` for diagnostics and never affects control flow. So the fire shell's CPU ceiling (F-1269-1) cannot move this hash. The hash inputs are contract/seed/events/economy/orders/final-positions.

⚠️ **The masking is the reusable half.** On the merged tree F-1400-1 throws at `:210` and *hides* F-1400-2 at `:237` — an early assertion disables everything after it. A fire that fixed only the call sites and re-ran would have met the stale pin next, and a fire that fixed the call sites and *didn't* re-run would have merged a false determinism gate.

**REC:** do NOT re-pin blind. The cure must re-derive the hash *and* keep the behavioural assertions (declared crossings, build zones, secure wave) that make the pin meaningful. Authored this fire as `f1400-1-twin-banks-rebase-and-repin`.

## F-1400-3 — baron: merged onto current main, the escort headless run never terminates (BLOCKER, merge-induced)
On the baron-merged tree the full `gr-sim.test.mjs` **hangs indefinitely** (`node --test` runs with `--test-timeout=0`, so there is no bound; killed manually at 12min, then again at 300s).

Process forensics named the culprit precisely:
```
88142  ppid 1     06:19   0.0%  node --test scripts/gr-sim.test.mjs
88372  ppid 88142 06:12  99.4%  node scripts/gr-sim.mjs --contract e2-hill-mine --seed e2-escort-headless --mode escort
```
99.4% CPU = a spinning loop, not slowness.

**Control, same command, same seed:**
| Tree | Result |
|---|---|
| **clean main** | `rc=0`, terminates in seconds, `{"secured":true,"waves":12,...,"eventLogHash":"fnv1a32:b3706fdc"}` |
| **baron-merged** | infinite loop, SIGKILL at 90s |

So the baron slice regresses `e2-hill-mine` escort mode — the slice s1399 landed one fire earlier. It is **not** a consequence of F-1400-1: the loop reproduces with the call sites already fixed.

**Why the runner could not have seen it:** its base `67d28607` predates `372808f0`, so escort-mode-as-data did not exist in its tree — there was no escort run to break. Its "GR-SIM 6/6" was true of its base and is false of main.

**Suspected mechanism (UNVERIFIED — stated as a hypothesis, not a finding):** the baron threads a new `escortsSpawned` count through `spawnBaronWave` → `spawnComponentBossWave`/`onBaronSpawned`, and `e2-hill-mine` declares **both** a `baron` block (`escortCount:6`) and an `escort` mode. The interaction of the two escort concepts is the obvious place to look first. The next fire should confirm by reading, not by assuming.

**REC:** the baron needs its own master — this is a behaviour bug requiring investigation, not a mechanical re-base. Do not merge it until the escort run terminates on the merged tree.

## Findings
- **F-1400-1** 🟢 CLASS — a ctor signature change on main breaks stale-based lanes' `.mjs` call sites; invisible to git and to tsc. Cure is 2-line graft; proven to work.
- **F-1400-2** 🔺 BLOCKER (twin-banks) — pinned secure hash `5f57f7be` does not reproduce (`bfd79d2a`); control-proven at the lane's own tip in its own worktree. Corrective authored.
- **F-1400-3** 🔺 BLOCKER (baron) — merged slice infinite-loops the escort headless run; control-proven against clean main. Needs its own master.
- **F-1400-4** 🟢 GATE ROBUSTNESS — `test:node-guards` runs `node --test` with `--test-timeout=0`. One non-terminating sim hangs the **entire battery** with no bound and no diagnostic, and `execFileSync`'s SIGKILL does not reap grandchildren (two orphans survived, one at 99.4% CPU, and would have skewed any later timing-sensitive gate in the same shell). A fire that hit this unattended would burn its whole window looking idle. **REC:** give the gr-sim node tests an explicit per-test timeout (twin-banks' own new test already sets `{ timeout: 45_000 }`; the baron's does not).
