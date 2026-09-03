/**
 * THE MOTOR FRONTIER'S LEAF CONSTANTS (`tasks/e4-roads-and-convoys.md`).
 *
 * WHY THIS FILE EXISTS, measured rather than guessed. `MechanicsManifest` publishes the E4 rules and
 * needs these four numbers and two verb names. Importing them from `./MotorSocket` drags its whole
 * graph — `entities/Vehicle` and `systems/FuelSystem` both import `world/Terrain`, and `Terrain`
 * opens with `import ... from '.../m1-core.layer-contract.v1.json?raw'`, a Vite-only specifier. Two
 * e2e specs import `MechanicsManifest` at MODULE level (`e2e/agent-view.spec.ts`,
 * `e2e/drill-yard-manifest.spec.ts`), so `npx playwright test --list` then loads that `?raw` in plain
 * Node and dies with "needs an import attribute of type: json" — collecting 0 tests in 0 files, which
 * `scripts/whole-suite-collection.test.mjs` catches and `collection-guards-cwd-invariance` catches
 * twice more. It is the exact hazard `src/systems/CanalChoiceSystem.ts:55` and
 * `src/systems/SeedCaravanSystem.ts:140` already warn about in their own comments.
 *
 * So the shared vocabulary lives HERE, in a file that imports nothing, and both the socket and the
 * manifest read it. Anything with a runtime dependency belongs in `MotorSocket.ts`, never here.
 */

export type MotorObjectiveKind = 'haul' | 'convoy' | 'deliveries' | 'tow';

export const MOTOR_GRADE_VERB = 'GRADE' as const;
export const MOTOR_HAUL_VERB = 'HAUL' as const;
/** `DustFlatsTile.gradeRoadAt`'s default reach: the Prospector must stand this close to an ungraded corridor's start. */
export const MOTOR_GRADE_REACH = 2.5;
/** The stop's reach: the Hauler must come to rest this close to whatever the errand names next. Same figure as the grade reach. */
export const MOTOR_STOP_REACH = 2.5;
/** How many motor events THE VIEW carries in its tail; the count of all of them rides beside it. */
export const MOTOR_EVENT_TAIL = 12;
