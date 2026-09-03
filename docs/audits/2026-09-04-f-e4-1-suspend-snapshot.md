# F-E4-1 suspend snapshot reproduction

**Verdict: HARNESS-ONLY.** A plain `the-claim` browser ride crosses the first completed-wave boundary and writes a valid wave-1 suspend snapshot. The crash reproduces only when `HeadlessContractSim` is constructed in a browser document: its reduced `RunManager` host has no `researchState`, but browser presence alone enables `RunSuspendController`.

## Reproduction

Command:

```sh
npx playwright test --config=artifacts/f-e4-1/repro.config.ts --workers=2
```

Result: **4/4 passed** (desktop Chrome 1280×800 and mobile Chrome 390×844).

| Condition | Desktop | Mobile 390px | Console/page errors |
|---|---|---|---|
| Plain `/?contract=the-claim&seed=f-e4-1-plain`, no debug and no manual sim | wave 2 at 60.167s; wave-1 snapshot persisted | wave 2 at 60.233s; wave-1 snapshot persisted | none |
| `/src/replay/harness.html?debug&contract=the-claim&seed=f-e4-1-harness`, `HeadlessContractSim` advanced one fixed tick at a time | throws at the wave-2 start | throws at the wave-2 start | none outside the deliberately caught exception |

The harness exception is identical at both sizes:

```text
SyntaxError: "undefined" is not valid JSON
  at JSON.parse
  at deepClone (src/game/RunSuspend.ts)
  at captureSnapshot (src/game/RunSuspend.ts)
  at RunSuspendController.captureBoundary (src/game/RunSuspend.ts)
  at RunManager's wave_started listener (src/game/RunManager.ts)
  at HeadlessContractSim.startWave (src/sim/HeadlessContractSim.ts)
```

Raw output and machine-readable results are in `artifacts/f-e4-1/`.

## Trigger

`RunManager.install()` enables run suspension whenever `document` exists (`src/game/RunManager.ts:94-102`). That is correct for the real browser `Game`, whose `researchState` is initialized at `src/game/Game.ts:1444`.

The browser replay page imports `HeadlessContractSim` into that same document. Its `RunManager` receives the reduced host literal at `src/sim/HeadlessContractSim.ts:1169-1229`; the host does not expose `researchState`. At the wave-2 start, `captureBoundary()` snapshots completed wave 1 (`src/game/RunSuspend.ts:273-277`), and `captureSnapshot()` calls `deepClone(game.researchState)` (`src/game/RunSuspend.ts:621-622`). `deepClone(undefined)` reaches `JSON.parse(JSON.stringify(undefined))` (`src/game/RunSuspend.ts:3101-3103`) and throws.

Manual stepping is not the discriminator. In the same browser harness, on the same seed and tick loop, supplying only the omitted research state to the reduced host makes the ride cross into wave 2 without throwing. Conversely, the plain browser ride uses a fresh profile and crosses cleanly. The single triggering difference is therefore the incomplete headless `RunManager` host being treated as a suspend-capable browser game.

## Smallest cure proposal

Do not make the headless adapter pretend to be a resumable `Game`. Add one explicit `RunManager` option that disables `RunSuspendController`, and pass it from `HeadlessContractSim`. This is smaller and safer than filling the adapter with snapshot-only fields: the headless simulation should not write a partial game snapshot into browser `localStorage` at all.

No product code was changed in this investigation.
