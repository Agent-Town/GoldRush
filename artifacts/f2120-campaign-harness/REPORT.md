# F-2120 campaign harness contract selection

## Result

`scripts/gr-sim-campaign.mjs` now accepts `--contract <id>`, runs exactly that scored board contract once, and refuses before output setup or simulation when the id is missing, unknown, unseeded, or locked. Without `--contract`, the original E1 board filter and secured-contract walk remain intact (`scripts/gr-sim-campaign.mjs:63-89`).

The three observed refusal lines were:

```text
exit 1: Error: Contract "not-a-contract" is not on the board.
exit 1: Error: Contract "e5-stillwater" has no pinned bench seed.
exit 1: Error: Contract "e3-canyon-works" is locked: The Voltage Age awaits — raise the Dynamo Hall.
```

The locked message includes the live `contractUnlockStatus()` condition verbatim. A known contract with `practice.scores === false` also refuses rather than producing a silent empty campaign; this preserves the existing scored-practice filter.

## Default-arm proof

The pre-existing deterministic control at `scripts/gr-sim-campaign.test.mjs:62-80` was not edited and passes. It still pins the campaign hash to `fnv1a32:4f363fd5` and the five-leg order to:

```text
the-claim,e1-dry-gulch,e1-night-shift,e1-twin-banks,e1-baron
```

A direct no-`--contract` invocation also exited 0 and wrote exactly those five legs. New coverage at `scripts/gr-sim-campaign.test.mjs:128-163` proves a selected contract produces exactly one leg, all three required refusal arms exit non-zero with distinct messages, and an empty selector cannot fall back to the default board.

## Can `--resume` unlock E3?

**Yes.** The mechanism already exists; no bypass is needed:

1. `--resume` reads the checkpoint and passes the whole profile envelope to `unpackProfile()` (`scripts/gr-sim-campaign.mjs:55-60`).
2. The active epoch key is an allowed profile datum (`src/game/ProfileStorage.ts:57-66`), and profile transfers pack allowed data (`src/game/ProfileTransfer.ts:64-76`) and restore it into the selected profile (`src/game/ProfileTransfer.ts:136-150`).
3. `activeEpochId()` reads that restored `gr.activeEpoch.v1` value, and `epochIsActive()` compares its epoch order with the requested epoch (`src/meta/ContractFamilies.ts:1091-1108`).

Therefore a genuine checkpoint exported from a profile whose active epoch is `epoch-3-voltage` can be supplied with `--resume <checkpoint>`; the restored active-epoch pointer makes `e3-canyon-works` pass its epoch gate. A fresh/default checkpoint remains correctly locked. No `activateEpoch()` call, fixture mutation, or unlock bypass was added.

## Verification

- `npx tsc --noEmit`: pass.
- `npm run build`: pass; Vite built 2,197 modules and asset-diet reported 1,158,214 / 1,500,000 bytes.
- `node --test scripts/gr-sim-campaign.test.mjs`: 6 tests, 6 pass, 0 fail, 0 skipped.
- Direct default invocation: exit 0, 5 legs in the pinned order above.
- Direct refusal invocations: all exit 1 with the exact lines above.
- `npm run test:node-guards` under pinned Node 26.4.0 with `NODE_OPTIONS=--no-experimental-webstorage`: 471 tests, 468 pass, 1 fail, 2 skipped, 0 cancelled. The sole red is the task's predeclared `node-guards-contention` / F-2080-1 known-red; it reported a false second battery. All five campaign tests present at that run passed inside the battery; the post-review focused run then passed all six.

The unflagged Node 26 run exposes its experimental global `localStorage` getter and makes unrelated child sims exit 1; the repository's default Node 23.11.1 fails `node-guards-timeout` with the guard's explicit `.nvmrc` diagnostic. The command above is the closest valid pinned-runtime run and isolates only the predeclared known-red.

## Adjacent, not fixed

- Independent `codex review --uncommitted` found that an empty selector could fall through to the default board. This was confirmed with `--contract=` (exit 0, five default legs), fixed at the parser boundary, and pinned by the sixth focused test.
- The task's lane-currency note says `e7-echo-canyon` and `e7-relay-rush` have lane-only seeds, but the current checkout's `bench-seeds.json` has neither. This slice did not touch `assets/contracts/**`.
- The repository still has unresolved Node-baseline/web-storage gate behavior outside this firewall; no runner or guard code was changed.
