# F-1492-2 — REFRAMED BY MEASUREMENT: the Hill Mine row is a defective ASSERTION, not a content ruling

**Fire:** s1493 · **Date:** 2026-08-06T18:15Z–18:50Z
**Subject:** the two `e2e/er01-e2-census.spec.ts` reds that HOLD `f-seed-1-front-door-parity` (`lane/a` tip `1e19a7d58`)
**Gate tree:** detached worktree `gate-s1493` at merge commit `714de7ebb` (§3.0b — nothing entered main's working tree)
**Status:** the owner question F-1492-2 asked is **unanswerable as posed**; a replacement finding **F-1493-1** is filed and a corrective master authored.

## The question s1492 put on the desk

> does Hill Mine's declared `contract.twist.secureWave` follow the corrected sim **12 → 14**, or did the parity cure over-shoot?

s1492 classified this as a content ruling — "changing it edits what the county DECLARES about that map" — and declined to make it inside a drain. **That instinct was right about the file and wrong about the number.** `secureWave` is not the thing that moved, and editing it would not repair the row; it would silence it.

## What `secureWave` actually is (✓ VERIFIED — read the code, both engines)

It is an **input threshold**, not a measured outcome.

- `src/game/RunManager.ts:289-293` — `maybeSecureRun(wave)`: `if (wave < secureWave) return;` then secures, clamping `securedAtWave` to `min(wave, secureWave)`.
- `src/game/Game.ts:4844` (browser) and `src/sim/HeadlessContractSim.ts:325-328` (headless) — **`autoSecureWaveForRun()` returns `Number.MAX_SAFE_INTEGER` while `twist.baron && !baronBeaten`.**

So on a contract that declares a baron, the run **does not secure at `secureWave` at all**. It secures when the baron dies. The declared number is bypassed by design — the map's win condition is "kill the Baron", and `baron.wave` (the arrival) is a *separate* field that also happens to be 12.

The value the census compares against it — `outcome().waves` — is `this.waves.diagnostics.wave` at termination (`HeadlessContractSim.ts:376`), i.e. **the wave the run happened to be in when it ended**.

## Therefore the assertion is only structurally sound on one of the four contracts

`e2e/er01-e2-census.spec.ts:109`:

```ts
expect(first).toMatchObject({ secured: true, waves: contract.twist.secureWave, calls: 0 });
```

| contract | `baron` | `pressureEnabled` | `secureWave` | is `waves === secureWave` guaranteed? | census on `714de7ebb` |
|---|---|---|---|---|---|
| `e2-pressure-garden` | ✗ | ✓ | 12 | **YES** — no baron, so auto-secure fires the instant `wave >= 12` | ✓ green |
| `e2-trestle` | ✓ | ✗ | 12 | no — combat speed | ✓ green |
| `e2-incline` | ✓ | ✗ | 12 | no — combat speed | ✓ green |
| `e2-hill-mine` | ✓ | ✓ | 12 | no — combat speed | ✘ **RED** |

Twist flags read from `assets/contracts/epoch-2-steamworks/contracts.json` (✓ VERIFIED). Census results measured by me on the merged tree, **not inherited** — full spec, `--workers=1`, `6 passed / 2 failed (67.9s)`, transcript `artifacts/s1493-census-full.txt`. The two failures are exactly `e2-hill-mine` desktop + mobile.

**On the three baron maps the equality was a combat-speed coincidence that happened to hold.** "Three of four comply" is not the guard working; it is three maps whose Baron died inside wave 12 and one that no longer does.

## What actually broke, in full

`artifacts/s1493-f1492-2.txt` — the received object, whole:

```
  Object {
    "calls": 0,
    "secured": true,
-   "waves": 12,
+   "waves": 14,
  }
```

**`secured: true`. `calls: 0`.** Hill Mine is still won, still won with zero agent calls, still deterministic (the `second.eventLogHash === first.eventLogHash` check on line 111 passes untouched). The *only* thing that changed is that the invincible census hero now takes until wave 14 to kill the Railcar instead of wave 12 — which is a **combat-speed** fact about a buffed test rig, and the parity cure moved combat speed everywhere by design.

## Why raising `secureWave` to 14 would be the wrong repair

1. **It would change no behaviour it appears to describe.** Hill Mine has a baron, so the auto-secure threshold is already bypassed; the run would still end at wave 14, for the same reason. The assertion would go green **by comparing 14 to 14 by coincidence again**, one tuning change away from breaking.
2. **It has a real side-effect nobody is asking for.** `HeadlessContractSim.ts:360` sizes the per-turn tick budget as `(secureWave + 2) * waveInterval`; `RunManager.ts:299` clamps `securedAtWave` to it, and `src/ui/DeathOverlay.ts:341` prints it to the player as "secured wave N". Editing it to satisfy a test edits the player-facing ledger line.
3. **It is the F-1441-3 re-pin reflex performed on CONTENT** — the one place a re-pin cannot be reviewed as a re-pin, because it wears a data file's clothes.

## ⚠️ One inference I made and then killed, recorded so the next reader does not repeat it

I first read `HeadlessContractSim.ts:360` (`maxTicks = ceil(((secureWave + 2) * waveInterval) / STEP)`) as a **per-run ceiling**, noted that `12 + 2 = 14` is exactly the observed wave, and nearly filed "the run secures on the last possible wave — one wave of drift from a hard throw" as a fragility finding. **It is false.** `maxTicks` is declared *inside* `advanceToTurn()` and the loop restarts from `tick = 0` on every call, returning as soon as the wave counter changes — so it is a generous **per-turn** budget, not a run budget, and `14` matching `secureWave + 2` is a coincidence of arithmetic. The lane's own census doc phrase "cross GR-SIM's wave-14 ceiling" invites exactly this misreading.

## Determinism control (because a pin to a noisy number is not a pin)

`scripts/gr-sim.test.mjs` run **twice on the same commit** `714de7ebb`, fire shell, interleaved with nothing:
all **6** failing `actual:` objects **byte-identical across both runs** (`artifacts/s1493-grsim.txt` vs `artifacts/s1493-grsim-2.txt`). The six moved numbers are deterministic and therefore legitimately pinnable.

The six, with their named cause (headless hero now carries the browser's progression, so it survives longer and kills more):

| test | expected → actual |
|---|---|
| replays byte-for-byte | hash `68b99428` → `f63d981b` (all scalars identical) |
| deterministically runs the Claim objective | `wave 2 → 3`, `kills 13 → 7` |
| Claim driver … secure at wave 10 | `kills 137 → 297`, hash `b1eeb320` → `fa8a49e7` |
| (hash-only case) | `80c5cae4` → `bd7fa297` |
| Twin Banks … securing at wave 20 | `waves 4 → 5`, `kills 65 → 95`, `timeMs 126167 → 155300` |
| the Baron driver runs the declared fight | `kills 861 → 862`, `timeMs 528433 → 528400` |

## Findings

- **F-1493-1 (REPLACES F-1492-2 — retire that desk item; it cannot be answered as posed).** `er01-e2-census.spec.ts:109` asserts `waves === contract.twist.secureWave`, an equality the engine guarantees **only on baron-less contracts**. The repair is in the assertion, not in `contracts.json`: keep the strict equality where it is structurally guaranteed, and on baron contracts assert what the engine actually promises — `secured: true` and `waves >= secureWave`. **Fire-authorable, no owner word needed.** Corrective master: `tasks/lane-f1493-1-parity-repin.md`.
- **F-1493-2 (non-blocking, declare-don't-fix).** The corrected row no longer catches "a baron map got materially harder to clear", because on baron maps it never did except by accident. That coverage was imaginary on 3 of 4 contracts and is now **honestly absent on 3 of 4** rather than dishonestly present. If the owner wants a real tuning ratchet on baron clear-time it needs its own row with its own declared budget — that is a new deliverable, not a repair to this one.
- **F-1493-3 (for the owner, NON-BLOCKING and demoted from F-1492-2's desk slot).** The genuine content question left over is much smaller than the one that was parked: *is the Railcar taking until wave 14 to die, under an invincible test rig, acceptable tuning for Hill Mine?* Nothing is blocked on this — the slice lands either way. **REC: accept.** The parity cure aligned the headless hero to the browser's progression; that the fight now runs two waves longer under a rig with 100,000 HP says more about the rig than the map, and no human playtest of Hill Mine has ever complained.

## Custody

Measured entirely in the detached worktree `gate-s1493` (merge `714de7ebb`, `lane/a` merged with `tasks/BACKLOG.md` taken from main — that tree measures the SIM only and its ledger state is deliberately not the graft s1492 recorded). **Nothing from `lane/a` entered main's working tree at any point.** `lane/a` was not reset, not refilled, and still reads `HOLDS`.
