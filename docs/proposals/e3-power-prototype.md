# E3 PG-01 power-graph prototype — implementation note

**Status:** B7 implementation on `sol/e3-power-prototype`; the queue's 2026-07-11 ruling ratifies `e3-power-integration.md` and supersedes its stale proposal-status header.

## Runtime boundary

`PowerGraphSystem` is now a simulation-only owner. It accepts one exact, bounded definition, canonicalizes node and endpoint order with code-unit sorting, and publishes a deeply frozen `PowerGridSnapshot`. It has no THREE, terrain, Economy, BuildSystem, multiplayer, suspend, objective, or E3-content dependency.

Debug commands can cut or repair one known wire, change a consumer priority, or take a node online/offline. Commands are validated when queued and applied in queue order only by the next fixed `step(simTick)`. An unchanged tick republishes the tick without solving; an allocation input change increments `allocationRevision`; a wire-state change also increments `topologyRevision`. Transition events carry the supplied simulation tick. Reset returns the original canonical definition, revisions, event history, and metrics.

Allocation is per connected component. Online consumers sort by ascending priority and then stable endpoint ID; each receives the smaller of its integer demand and remaining integer supply. The snapshot reports exact allocated watts and the unrounded quotient of allocation over demand, with powered, browned-out, and dark derived from that ratio. The per-node watt cap is derived from the 128-node limit so aggregate integer supply and demand remain safe. Producers and relays are powered only in a component with supply.

## Presentation boundary

`PowerWireView` is the only THREE consumer. It reads snapshots after the simulation phase and rebuilds the procedural intact/cut catenaries only when graph ID or topology revision changes. Allocation-only changes therefore do no geometry work. Lifecycle reset explicitly invalidates the view before revisions restart. `Game` constructs both owners only for `?debug&powergraph`; the existing `?debug&power=dev` fixture remains an alias, and local graph commands reject while multiplayer is active. Flag-off diagnostics report zero nodes, wires, solves, or view work. “Zero default-path effect” here is the existing dormant-engine contract—zero construction or runtime work—not chunk isolation; PG-01 replaces a solver already statically present in Game.

## Validation boundary

The input boundary caps definitions at 128 nodes and 256 wires, requires exact known shapes, finite coordinates, integer watts and priorities, unique stable node IDs, canonical endpoint pairs, known wire state, existing distinct endpoints, and the measured span cap. Invalid definitions reject as a whole; valid input permutations normalize byte-identically.

The pure contract cases live with the B7 browser matrix in `e2e/e3-power-prototype.spec.ts`. Wall-clock telemetry is deliberately separate in `scripts/check-power-graph-budget.mjs`: `npm run test:power-budget` owns one isolated process, so concurrent desktop/mobile browser projects cannot distort the fixed-step threshold. TypeScript, production build, the isolated budget gate, test discovery, and diff checks belong to this branch. Browser execution and screenshot judgment remain orchestrator-owned.

PG-02 and later remain outside B7: no durable building IDs, paid wire action, Economy effect, persistence/hash/resync, real powered consumer, day/night LightField, ledger UI, objective, Canyon contract, or E3 activation is introduced here.
