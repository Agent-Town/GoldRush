# e3-canyon-environment — drain review (s1471)

**Slice:** `lane-e3-canyon-environment` (Canyon Works environment objective → headless sim socket)
**Branch:** `lane/a` · **Tip:** `4e46bdeb2` (`csock: socket Canyon Works environment objective`)
**Merge:** `2256ee58` (three-way `merge --no-ff` onto clean main `0b78fdf79`)
**Goal leaf:** `e3-canyon-environment`
**Verdict:** ✅ **MERGED** — full battery green, zero new operations, all five of the master's measured notes held.

## What it does

Sockets the two **simulation-class** halves of Canyon Works into `HeadlessContractSim`, leaving the render-only and refactor-class halves alone (the split this slice's master measured in s1470).

1. **Wave-driven darkness.** `sampleDayNightSnapshot()` replaces the unconditional `dayNightCycle.sample(timeAlive)` with a wave-indexed ramp when `twist.dayNightCycle.waveSchedule` is present: `progress = clamp((wave - duskWave) / max(1, darkWave - duskWave), 0, 1)`, phase `full` → `dusk` → `dark`, permanently dark, `darkness = 0` when full else `progress * nightDepth`. Contracts without a `waveSchedule` keep the time-sampled path byte-for-byte.
2. **The CONNECT objective.** `syncCanyonConnectObjective()` runs each tick, counting `powerGraph` nodes that are `consumer`/`role: gallery` and in state `powered`. Both latches are **one-way**: completion latches at/before `byWave`, failure latches after it, and a failed run is unsecurable for the rest of its life. Exposed through `et.goldrush.get_state` as `canyonConnect {powered, required, byWave, complete, failed}`.
3. **Manifest rules.** `darkness_cycle` (sourced `Game.nightShiftLightingState`) now takes precedence over the `lightRamp` branch when a `waveSchedule` exists, and a new `connect_objective` rule (`Game.syncCanyonConnectObjective`) declares the latch semantics.

**Zero new operations invented** — the slice adds no BUILD grammar. This is the fourth era-socket in the class.

## Evidence (all on the MERGED tree, in detached worktree `gate-s1471`, §3.0b custody)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 1.22s`, asset-diet ceilings held |
| **`npm run test:node-guards`** (mandatory, F-1460-1 — touches `src/sim/` **and** `src/agent/`) | **rc=0 · 292 tests / 289 pass / 0 fail / 3 skipped / 124.8s** — **the gr-sim Baron pin HELD** |
| Own spec `er01-e3-census` | **8 passed / 1.5m** (desktop + mobile-chrome) |
| Adjacent `er01-e2/e4/e5/e6-census` | **32 passed / 1.3m** — E2 unmoved |
| `e3-canyon-works` + `_s106-prospector-boot-probe` | **6 passed / 19.4s**, zero console/page errors, desktop **and** 390px |
| `--workers=1` throughout (§3.1) | yes, every Playwright invocation |

**No cross-cutting sim number moved.** This is the check F-1460-1 exists for: the slice changes darkness sampling and securing conditions, both of which the replayed event log is sensitive to, and the Baron pin is the instrument that would have caught a drift. It did not fire.

## Merge classification

`main...lane/a` (three-dot) = **6 files / 165 insertions / 12 deletions**, matching the lane commit's own `--stat` exactly.

⚠️ **The two-dot trap fired for the FIFTH consecutive fire.** `main..lane/a` reads **1085 files / 170 insertions / 193 deletions** — the phantom bulk being main's own commits since the merge-base. Five in a row confirms what s1470 called structural rather than coincidental: **a lane is several commits behind main by drain time, always, so two-dot is simply the wrong instrument here.** Merged three-way; `tasks/BACKLOG.md` and `tasks/goals.json` auto-merged clean, no conflicts.

## Findings

### F-1471-1 — `objectiveAllowsSecure` keys on `powerGrid`, one disjunct wider than the check beside it (NON-BLOCKING, latent)

`HeadlessContractSim.ts` computes `objectiveAllowsSecure = !twist.powerGrid || canyonConnectCompletedByDeadline`, keyed on **any** `powerGrid`. Every other new site keys on the narrower `twist.powerGrid?.connect` — including `autoSecureWaveForRun` three lines away. The runner reproduced this from the browser exactly and was told to **mirror and report, not repair** (master's measured note 4), which it did correctly.

**Measured today, rather than reasoned about:** the defect is **inert**, and this is the part worth writing down. All four E3 contracts were enumerated from `assets/contracts/epoch-3-voltage/contracts.json`:

| contract | `powerGrid` | `connect` | `baron` |
|---|---|---|---|
| `e3-blackout-ridge` | yes | **no** | **no** |
| `e3-moth-season` | no | no | no |
| `e3-canyon-works` | yes | yes | yes |
| `e3-fairground` | yes | **no** | **no** |

The expression is only ever evaluated after `if (!baron || this.baronBeaten) return;`, so a contract with no baron never reaches it. The only contract that reaches it is `canyon-works`, which **has** `connect` — where both readings agree.

**The trigger to watch for:** the first contract authored with `powerGrid` + `baron` + **no** `connect`. In that contract `objectiveAllowsSecure` evaluates `false` permanently, and **beating the Baron would silently fail to secure the run** — a soft-lock with no error, which is exactly the shape that costs a playtest to find. Cheap to pre-empt; the fix is one `?.connect`. Deliberately **not** repaired here because the browser carries the same inconsistency and repairing only the sim would break the mirror this whole socket class depends on. **The browser is the side that should move first.**

### F-1471-2 — the manifest's false `dawnWave` is gone on the `waveSchedule` path (RESOLVED by this slice)

s1470's measured note 5 recorded an AP-11 honesty defect: the manifest advertised `dawnWave: 12` that no sim ever delivered. The new `darkness_cycle` rule declares `returnsToFull: false` and no `dawnWave`. The `lightRamp` branch is untouched and keeps its own semantics for contracts that use it. Recorded as resolved, not as an open finding.

## Census

`docs/bench/e3-readiness-census.md` — arithmetic **unchanged at `AGENT-READY: 2 of 4`, `DATA-GAP: 2 of 4`**; Canyon Works remains **unsupported**, now naming only the render-coupled Crawler as its remaining gap.

⭐ **The slice deliberately does not admit `e3-canyon-works` and deliberately does not move the headline.** Admitting a contract whose boss cannot run headless would be precisely the vocabulary stretch the ERA-SOCKET LAW forbids (Mistake #14). The runner honoured this; it would have been an easy and invisible number to inflate.

## What remains for the Crawler slice

Confirmed still blocking, unchanged from s1470's measurement: bare `document.querySelector` from the constructor and every `update()` (`gr-sim.test.mjs` stubs `location`/`window`/`localStorage` but **not** `document`), a non-tick-anchored async GLB fetch, a grid drain reachable only through `syncPresentation`, and `advanceToTurn`'s `(secureWave+2)` budget landing on wave 14 against `baron.wave` 14 — so a run-to-secure cannot terminate. It is a presentation/sim split, not a socket.

**And the ordering is forced, not preferred:** wave-driven darkness is a *prerequisite* for the Crawler slice, because socketing the boss onto a time-sampled cycle would produce a wrong event log. That prerequisite is now merged, so the Crawler slice is unblocked and is what takes E3 to **3 of 4**.
