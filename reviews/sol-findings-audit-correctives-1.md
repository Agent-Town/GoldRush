# Sol findings — audit correctives 1 implementation

- **Branch:** `sol/audit-correctives-1`
- **Fresh implementation base:** `origin/main@64f78d146723cc9e80f176ccc48adb1142af70c1`
- **State:** **READY-FOR-GATES — static gates green; listener-backed gates are orchestrator-side**

The queue-referenced `reviews/mega-audit-data-2026-07-11.json` is absent from the
inspected refs. The accepted queue ruling and the original findings in
`reviews/sol-findings-simulation-lifecycle.md` supplied the authority and evidence
for the surgical changes below.

## F-SOL-SIM-004 — lethal damage is a mutation boundary

Combat now records a pending death instead of finalizing it from inside a damage
callback. `EnemyPool.update` stops contact traversal after a lethal hit. Baron
rockets carry the same stop signal from `CombatSystem.damageHero` through the
detonation callback: the current detonation resolves atomically, its charge is
deactivated, the remaining volley is left queued, and `CombatSystem.update` exits
before XP motes can be collected (`src/entities/pools.ts:499-573`;
`src/systems/CombatSystem.ts:354-368,411-426,608-669`;
`src/entities/BlastCharge.ts:6-7,125-145`). `Game.update` then uses one shared
pending-death boundary after contact and after combat: contact death exits before
discovery, harvest, and combat, while rocket death exits before Prospector actions,
gold pickups, or progression can mutate the dead run
(`src/game/Game.ts:317-329,1536-1574,4160-4185`). Reset and finalization both clear
the pending flag.

The contact regression places collectible XP and gold on a hero and proves both
remain uncollected after lethal contact (`e2e/sim-fixed-step.spec.ts:157-193`). The
focused Baron regression arms three in-flight rockets one half-step before impact;
one fixed tick must resolve exactly one lethal rocket, leave two charges queued,
and leave colocated XP and gold untouched (`e2e/057-baron-rocket-cart.spec.ts:264-320`).

## F-SOL-SIM-005 — Claim Ledger restores its pause owner

The Ledger captures both `GameState.isPaused` and `playerPauseActive`, pauses only
an unpaused single-player run, and restores exactly the captured pair on close
(`src/game/Game.ts:1306-1331`). The EN-01 regression covers both live-open/resume
and player-paused-open/still-paused behavior (`e2e/en-01-claim-ledger.spec.ts:138-162`).

## B5-MP-01 — render height is outside the canonical lockstep hash

The hash projection recursively removes vector `y` fields while the full suspend
snapshot retains them for restore and rendering (`src/game/Game.ts:1893-1906,5294-5303`).
The existing two-client identity proof now asserts that neither peer's canonical
hash state contains a render-height path; its actor test oracle reconstructs display
height from live diagnostics rather than requiring it in the hash
(`e2e/mp-02-lockstep.spec.ts:134-151,830-865,935-945`).

## B5-MP-02 — scripted rail arrival is planar

Scripted waypoint distance and arrival snap now use only x/z, leaving visual height
to the render-height owner (`src/entities/Enemy.ts:1028-1040`). The regression
restores a waypoint with an intentional one-unit visual-y mismatch and proves the
enemy still arrives exactly at its planar target (`e2e/sim-fixed-step.spec.ts:195-229`).

## Static evidence

| Command | Result |
|---|---|
| `npm exec -- tsc --noEmit` | PASS, no diagnostics |
| `npm run build -- --logLevel error` | PASS |
| `git diff --check` | PASS |
| `npm exec -- playwright test e2e/sim-fixed-step.spec.ts e2e/en-01-claim-ledger.spec.ts e2e/mp-02-lockstep.spec.ts e2e/m1-01-claim-jumpers-death.spec.ts e2e/057-baron-rocket-cart.spec.ts --list` | PASS, 54 tests in 5 files discovered |

Independent `codex review --uncommitted` was attempted with the invalid workspace
`ultra` setting overridden to `xhigh`; the managed sandbox still denied Codex's
state database (`attempt to write a readonly database`, then `Operation not permitted`).

## Orchestrator browser gates

Run from an isolated worktree with the reserved listeners available:

```sh
npm exec -- playwright test e2e/sim-fixed-step.spec.ts --project=desktop-chrome --workers=1
npm exec -- playwright test e2e/057-baron-rocket-cart.spec.ts --project=desktop-chrome --workers=1
npm exec -- playwright test e2e/en-01-claim-ledger.spec.ts --workers=1
npm exec -- playwright test e2e/mp-02-lockstep.spec.ts --project=desktop-chrome --workers=1
npm exec -- playwright test e2e/m1-01-claim-jumpers-death.spec.ts --workers=1
npm exec -- playwright test --workers=1
```

The full regression remains required because F-SOL-SIM-004 changes simulation
lifecycle semantics. Static discovery is not represented as browser success.
