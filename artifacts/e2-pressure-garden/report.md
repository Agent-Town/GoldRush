# Pressure Garden — engine dependency stop

Status: `BLOCKED: required pressure flow is not contract-data driven`

Reverified 2026-07-15 against `main` at `4c7dcf05 (archive: pruned by the A3 rewrite)`; the prerequisite has not
landed, so this queued rerun remains blocked for the same engine reason.

Lane safety now passes and the baseline is healthy:

- lane refreshed from current `main`; `git status --short --branch`: clean
  `lane/e2-arsenal`
- `npm install`: up to date
- `npm run build`: green

The task requires `e2-pressure-garden` to run boilers, coal, and the PRESSURIZE
objective while its firewall forbids mechanics changes. The current engine has
no data seam that can satisfy that acceptance criterion:

- `Game.ts:897` enables `PressureSystem` only when the active contract id is
  `e2-hill-mine`.
- `Game.ts:3786` enables `boiler_house` only for `e2-hill-mine`.
- `Game.ts:3878` publishes the PRESSURIZE objective only for `e2-hill-mine`.
- `ContractFamilies.ts` accepts escort modes only; contract JSON cannot opt a
  second contract into pressure play.

No contract, tile masks, board row, spec, or screenshots were authored. Landing
those surfaces alone would expose an unlockable contract in which boilers cannot
be placed and the required objective never runs. Unblock by first landing the
owner-gated pressure-generalization engine slice, then rerun this task unchanged.

## Mask coordinate table

Not authored. Gameplay masks must follow the generalized pressure contract,
not precede it with an untestable partial tile.
