import type * as THREE from 'three';
import { Vehicle, type VehicleDiagnostics } from '../entities/Vehicle';
import { Balance } from '../game/Balance';
import type { ContractManifest, ContractMotorFrontier } from '../meta/ContractFamilies';
import {
  MOTOR_EVENT_TAIL, MOTOR_GRADE_REACH, MOTOR_STOP_REACH, type MotorObjectiveKind,
} from './MotorContract';
import { ConvoyBehavior, type ConvoyDiagnostics, type ConvoyPathEntity } from '../systems/ConvoyBehavior';
import { FuelSystem, type FuelDiagnostics } from '../systems/FuelSystem';
import { RoadNetwork, type RoadNetworkDiagnostics, type RoadSegment } from '../systems/RoadSegment';
import { WeatherSystem, type WeatherPhase, type WeatherSnapshot } from '../systems/WeatherSystem';

/**
 * THE MOTOR FRONTIER SOCKET — the shared E4 consumer (`tasks/e4-roads-and-convoys.md`, 2026-09-03).
 *
 * WHAT IT COMPOSES, AND FROM WHERE. Nothing here is a new mechanic: every number and every rule
 * is one of the four classes the era already shipped, reused rather than re-derived —
 *   roads    `RoadNetwork` (`src/systems/RoadSegment.ts`): graded corridors are 2.5x faster and burn
 *            0.4x fuel (`Balance.e4Road`), the same figures `e2e/e4-orbit-road.spec.ts` pins;
 *   fuel     `FuelSystem` (`src/systems/FuelSystem.ts`): the browser's own tar nodes, harvest dwell,
 *            refine clock and 24-unit tank (`Balance.e4Fuel`);
 *   vehicle  `Vehicle` (`src/entities/Vehicle.ts`): the browser's own Hauler, speed 9, burn 3/s,
 *            dry-halt when the tank empties, exactly as `e2e/e4-vehicles-fuel.spec.ts` measures;
 *   weather  `WeatherSystem` (`src/systems/WeatherSystem.ts`) from the contract's own `twist.weather`;
 *   convoy   `ConvoyBehavior` (`src/systems/ConvoyBehavior.ts`) along `tileParams.convoyRoute`.
 *
 * WHICH COMPOSITION IT MIRRORS. The only browser composition of these systems that ever shipped is
 * `392d20d35` (`runner(lane-b): e4-05-dust-flats.md`, 2026-07-15), where `Game.ts` mounted
 * `DustFlatsTile` and drove the Hauler with `roadMovementAt(...)` (road x storm) and the enemies with
 * `enemyMovementMultiplier(...)` (storm). Today's `Game.ts` carries none of it: `DustFlatsTile` has
 * no importer, and `Vehicle`/`FuelSystem` mount only under `?debug&vehicles`
 * (`src/game/Game.ts:4585-4588`, `:10178-10181`). This socket therefore mirrors the composition that
 * existed, and the honesty of that gap is recorded in `artifacts/e4-roads-and-convoys/report.md`.
 *
 * WHAT A RIDER CAN DO WITH IT. Two targetless verbs, the world naming the target from the
 * Prospector's ground the way `fund`/`recover`/`plant` already do: `GRADE` grades the ungraded
 * corridor whose stake is within `MOTOR_GRADE_REACH`, and `HAUL` drives the Hauler to where the
 * Prospector stands. Fuel needs no verb: standing within `Balance.e4Fuel.harvestRange` of a tar node
 * for `harvestSeconds` harvests it, exactly as the browser's `visibleActorPositions()` seam does.
 *
 * WHAT IT GATES. `objectiveAllowsSecure` is the era's errand, one per Motor map, each the audit's
 * own "smallest slice" (`docs/audits/2026-09-02-era-mechanic-audit.md` §Smallest slices):
 *   `haul`        the Dust Flats: the Hauler at rest within `MOTOR_STOP_REACH` of the declared
 *                 corridor's far end;
 *   `convoy`      the Long Road: the town's convoy at the far end of `tileParams.convoyRoute`. The
 *                 convoy gains exactly the ground the lead Hauler gains toward that stop and never
 *                 the ground it gives back, so it is fuel-, road- and storm-leashed rather than a
 *                 free clock, and a Hauler driven in circles moves the town nowhere;
 *   `deliveries`  Gusher County: one delivery per lease road, and while a storm blows one of those
 *                 roads is washed out by the weather clock alone — no road bonus on it and no
 *                 delivery through it, so the rider rides the open leases first and comes back;
 *   `tow`         the Boneyard: the Hauler at rest by the named hulk hitches it, and rests again at
 *                 the gate end of the declared road to deliver it. Nothing weighs the hulk beyond
 *                 the round trip itself: `Vehicle` prices fuel per SECOND, so the same distance
 *                 costs more fuel under a storm, which is the whole tow decision.
 * It reads `false` on every contract that declares no `motorFrontier` by never being constructed
 * (`create` returns null), so no admitted contract's terminal moves.
 */

// The leaf vocabulary lives in `./MotorContract` so `MechanicsManifest` can read it without dragging
// this file's `Vehicle`/`FuelSystem` -> `world/Terrain` -> `?raw` graph into Node-only collection.
// Re-exported here so a reader of the socket still finds them where they expect.
export {
  MOTOR_EVENT_TAIL, MOTOR_GRADE_REACH, MOTOR_GRADE_VERB, MOTOR_HAUL_VERB, MOTOR_STOP_REACH,
} from './MotorContract';
export type { MotorObjectiveKind } from './MotorContract';

type Point = Readonly<{ x: number; z: number }>;
type Corridor = NonNullable<ContractManifest['tileParams']['roadCorridors']>[number];
type Hulk = NonNullable<ContractManifest['tileParams']['salvageHulks']>[number];

export type MotorEvent =
  | { type: 'motor_road_graded'; at: number; corridorId: string; length: number }
  | { type: 'motor_tar_harvested'; at: number; node: Point; tar: number; stored: number }
  | { type: 'motor_haul_dispatched'; at: number; target: Point; stored: number; tar: number }
  | { type: 'motor_hauler_dry'; at: number; x: number; z: number; distanceTravelled: number }
  | { type: 'motor_haul_arrived'; at: number; x: number; z: number; atStop: boolean; roadDistance: number; distanceTravelled: number; fuelDrawn: number }
  | { type: 'motor_weather'; at: number; phase: WeatherPhase; cycle: number }
  | { type: 'motor_convoy_arrived'; at: number; routeId: string; distance: number }
  // Declared-objective events. Each fires only on the map whose twist declares that objective, so
  // no other Motor contract's event stream (or terminal hash) moves by their existence.
  | { type: 'motor_road_closed'; at: number; corridorId: string; cycle: number }
  | { type: 'motor_road_reopened'; at: number; corridorId: string; cycle: number }
  | { type: 'motor_lease_delivered'; at: number; corridorId: string; x: number; z: number; delivered: number; remaining: number; fuelDrawn: number }
  | { type: 'motor_tow_hitched'; at: number; hulkId: string; x: number; z: number; fuelDrawn: number }
  | { type: 'motor_tow_delivered'; at: number; hulkId: string; x: number; z: number; distanceTravelled: number; fuelDrawn: number };

export type MotorVerbResult = { ok: true; corridorId?: string } | { ok: false; reason: string };

export type MotorObjectiveView = Readonly<{
  kind: MotorObjectiveKind;
  corridorId: string;
  label: string;
  stop: Point;
  stopReach: number;
  arrived: boolean;
  arrivedAt: number | null;
  roadDistanceAtArrival: number | null;
  securableAtWave: number | null;
  /** `deliveries` only: the lease roads still owed, in order, and how many have landed. */
  remaining?: readonly string[];
  delivered?: readonly string[];
  /** `tow` only: the hulk and whether it is on the hook yet. */
  hulk?: Readonly<{ id: string; kind: Hulk['kind']; x: number; z: number }>;
  hitched?: boolean;
  hitchedAt?: number | null;
}>;

export type MotorDiagnostics = Readonly<{
  contractId: string;
  objective: MotorObjectiveView;
  weather: Readonly<WeatherSnapshot & { nextPhaseInSeconds: number }>;
  roads: Readonly<RoadNetworkDiagnostics & {
    gradeReach: number;
    graded: readonly string[];
    corridors: readonly Readonly<{ id: string; start: Point; end: Point; graded: boolean; closed?: boolean }>[];
    /** `deliveries` with closures only: the lease road the current storm has washed out, and the next. */
    closed?: readonly string[];
    closesNext?: string | null;
  }>;
  fuel: FuelDiagnostics;
  vehicle: Readonly<VehicleDiagnostics & { onRoad: boolean; roadDistance: number; dispatch: Point | null }>;
  convoy: Readonly<ConvoyDiagnostics & { label: string; total: number; arrived: boolean; arrivedAt: number | null }> | null;
  events: readonly MotorEvent[];
  eventCount: number;
}>;

export type MotorSimulationSnapshot = Readonly<{
  graded: readonly string[];
  vehicle: Readonly<{ state: VehicleDiagnostics['state']; x: number; z: number; target: Point | null; distanceTravelled: number; roadDistance: number }>;
  fuel: Readonly<{ tar: number; stored: number; harvestedNodes: number; refinedTar: number; drawn: number }>;
  haul: Readonly<{ arrived: boolean; arrivedAt: number | null }>;
  convoy: Readonly<{ routeId: string; leaderDistance: number; arrived: boolean }> | null;
  events: number;
  /** Declared-objective state. Absent on `haul`, so the Dust Flats' terminal hash does not move. */
  delivered?: readonly string[];
  tow?: Readonly<{ hulkId: string; hitched: boolean; delivered: boolean }>;
}>;

export type MotorOutcomeSummary = Readonly<{
  graded: readonly string[];
  hauled: boolean;
  arrivedAt: number | null;
  roadDistance: number;
  distanceTravelled: number;
  fuelDrawn: number;
  tarHarvested: number;
  convoyArrived: boolean | null;
  /** Declared-objective state, absent on `haul` for the same reason as the snapshot's. */
  kind?: MotorObjectiveKind;
  delivered?: readonly string[];
  towed?: boolean;
}>;

type Convoy = {
  behavior: ConvoyBehavior;
  members: ConvoyPathEntity[];
  routeId: string;
  label: string;
  total: number;
  stop: Point;
  arrived: boolean;
  arrivedAt: number | null;
  /** The closest the lead Hauler has yet come to the far stop; the town never gives ground back. */
  bestRemaining: number;
};

export class MotorSocket {
  static create(manifest: ContractManifest): MotorSocket | null {
    return manifest.twist.motorFrontier ? new MotorSocket(manifest, manifest.twist.motorFrontier) : null;
  }

  readonly contractId: string;
  readonly kind: MotorObjectiveKind;
  private readonly weather: WeatherSystem;
  private readonly roads = new RoadNetwork();
  private readonly graded = new Set<string>();
  private readonly segments = new Map<string, RoadSegment>();
  private readonly corridors: readonly Corridor[];
  /** The road the objective is about: the haul's corridor, the convoy's road, the tow's gate road. */
  private readonly objectiveCorridor: Corridor;
  /** `deliveries` only: the lease roads, in authored order, and the ones already delivered. */
  private readonly leases: readonly Corridor[];
  private readonly delivered = new Set<string>();
  private readonly closures: boolean;
  private closedNow: readonly string[] = [];
  /** `tow` only. */
  private readonly hulk: Hulk | null;
  private hitched = false;
  private hitchedAt: number | null = null;
  private readonly fuel: FuelSystem;
  private readonly vehicle: Vehicle;
  private readonly convoy: Convoy | null;
  private readonly events: MotorEvent[] = [];
  private eventCount = 0;
  private dispatch: Point | null = null;
  private arrived = false;
  private arrivedAt: number | null = null;
  private roadDistanceAtArrival: number | null = null;
  private roadDistance = 0;
  private tarHarvested = 0;
  private lastPhase: WeatherPhase | null = null;
  private lastVehicleState: VehicleDiagnostics['state'];

  private constructor(manifest: ContractManifest, private readonly twist: ContractMotorFrontier) {
    const weather = manifest.twist.weather;
    if (!weather) throw new Error(`${manifest.id} declares twist.motorFrontier without twist.weather.`);
    this.contractId = manifest.id;
    this.weather = new WeatherSystem({ era: 4, contractId: manifest.id, ...weather });
    this.corridors = manifest.tileParams.roadCorridors ?? [];
    const corridor = (id: string, what: string): Corridor => {
      const found = this.corridors.find((entry) => entry.id === id);
      if (!found) throw new Error(`${manifest.id} ${what} an unknown road corridor ${id}.`);
      return found;
    };
    // Exactly one objective key, as `validateMotorFrontier` enforces at authoring time; the throw is
    // the belt beside those braces, so a hand-built manifest cannot compose a socket with no errand.
    if (twist.haul) {
      this.kind = 'haul';
      this.objectiveCorridor = corridor(twist.haul.corridorId, 'hauls to');
      this.leases = [];
      this.hulk = null;
      this.closures = false;
    } else if (twist.convoy) {
      this.kind = 'convoy';
      this.objectiveCorridor = corridor(twist.convoy.corridorId, 'runs its convoy along');
      this.leases = [];
      this.hulk = null;
      this.closures = false;
    } else if (twist.deliveries) {
      this.kind = 'deliveries';
      this.leases = twist.deliveries.corridorIds.map((id) => corridor(id, 'delivers to'));
      this.objectiveCorridor = this.leases[0]!;
      this.hulk = null;
      this.closures = twist.deliveries.closures;
    } else if (twist.tow) {
      this.kind = 'tow';
      this.objectiveCorridor = corridor(twist.tow.corridorId, 'tows down');
      this.leases = [];
      const hulk = (manifest.tileParams.salvageHulks ?? []).find((entry) => entry.id === twist.tow!.hulkId);
      if (!hulk) throw new Error(`${manifest.id} tows an unknown salvage hulk ${twist.tow.hulkId}.`);
      this.hulk = hulk;
      this.closures = false;
    } else {
      throw new Error(`${manifest.id} declares twist.motorFrontier with no objective.`);
    }
    // Always enabled: the twist IS the enable. The browser's `isDevVehiclesEnabled` predicate is the
    // debug harness's switch, not a game rule, so nothing of it is transcribed here.
    this.fuel = new FuelSystem(() => true);
    this.vehicle = new Vehicle(this.fuel, { start: twist.vehicle.start });
    this.lastVehicleState = this.vehicle.diagnostics.state;
    const route = manifest.tileParams.convoyRoute;
    this.convoy = twist.convoy && route && route.length >= 2
      ? createConvoy(manifest.id, twist.convoy, route, twist.vehicle.start)
      : null;
  }

  /** The era's errand, one per map, latched one-way. See the file header for the four. */
  get objectiveAllowsSecure(): boolean {
    return this.arrived;
  }

  /** `DustFlatsTile.enemyMovementMultiplier`: the storm's movement multiplier, applied to every outlaw. */
  enemyMovementMultiplier(at: number): number {
    return this.weather.sample(at).movementMultiplier;
  }

  /**
   * One fixed step, in the browser's own order (`Game.ts:2909-2910`): fuel harvests from the actor
   * positions, then the Hauler moves under road x storm. Events are handed to the caller's replay
   * log so the terminal hash certifies them.
   */
  update(step: number, at: number, actors: readonly THREE.Vector3[], emit: (event: MotorEvent) => void): void {
    const time = round3(at);
    const fuelBefore = this.fuel.diagnostics;
    this.fuel.update(step, actors);
    const fuelAfter = this.fuel.diagnostics;
    if (fuelAfter.harvestedNodes > fuelBefore.harvestedNodes) {
      fuelAfter.nodes.forEach((node, index) => {
        if (!node.harvested || fuelBefore.nodes[index]?.harvested) return;
        this.tarHarvested += Balance.e4Fuel.tarPerNode;
        this.record(emit, { type: 'motor_tar_harvested', at: time, node: { x: node.x, z: node.z }, tar: Balance.e4Fuel.tarPerNode, stored: round3(fuelAfter.stored) });
      });
    }

    const before = this.vehicle.diagnostics;
    const weather = this.weather.sample(at);
    // The closure schedule, from the weather clock alone: while a storm blows on a `deliveries` map,
    // one lease road is washed out. Nothing random, nothing per-tick — the cycle number picks it, so
    // a rider can read `closesNext` off the view and plan the next thirty seconds against it.
    this.syncClosures(weather, time, emit);
    const road = this.movementAt({ x: before.x, z: before.z });
    this.vehicle.update(step, {
      speedMultiplier: road.speedMultiplier * weather.movementMultiplier,
      fuelMultiplier: road.fuelMultiplier,
    });
    const after = this.vehicle.diagnostics;
    const moved = after.distanceTravelled - before.distanceTravelled;
    if (moved > 0 && road.speedMultiplier > 1) this.roadDistance += moved;
    if (after.state !== this.lastVehicleState) {
      if (after.state === 'dry') {
        this.record(emit, { type: 'motor_hauler_dry', at: time, x: round3(after.x), z: round3(after.z), distanceTravelled: round3(after.distanceTravelled) });
      }
      if (after.state === 'arrived') {
        // The haul latch lands INSIDE the state transition, before the arrival event, exactly as the
        // Dust Flats' pinned hashes recorded it. The other three objectives settle per-tick below,
        // because a Hauler already at rest on a washed-out lease must be able to deliver the moment
        // the storm lifts, without a second dispatch it has no distance left to travel.
        const atStop = this.kind === 'haul' && this.nearStop(after);
        if (atStop && !this.arrived) {
          this.arrived = true;
          this.arrivedAt = time;
          this.roadDistanceAtArrival = round3(this.roadDistance);
        }
        this.record(emit, {
          type: 'motor_haul_arrived',
          at: time,
          x: round3(after.x),
          z: round3(after.z),
          atStop,
          roadDistance: round3(this.roadDistance),
          distanceTravelled: round3(after.distanceTravelled),
          fuelDrawn: round3(this.fuel.diagnostics.drawn),
        });
      }
      this.lastVehicleState = after.state;
    }

    if (weather.phase !== this.lastPhase) {
      this.record(emit, { type: 'motor_weather', at: time, phase: weather.phase, cycle: weather.cycle });
      this.lastPhase = weather.phase;
    }

    const convoy = this.convoy;
    if (convoy) {
      // The town follows the lead Hauler: it gains exactly the ground that Hauler gains toward the
      // far stop, and never the ground it gives back. `ConvoyBehavior.update` advances its leader by
      // `delta * maxSpeed`, so a delta of `gained / vehicleSpeed` advances it by `gained` — the road,
      // the storm and the tank are already priced into `gained`, because they shaped the drive.
      const remaining = Math.hypot(after.x - convoy.stop.x, after.z - convoy.stop.z);
      const gained = Math.max(0, convoy.bestRemaining - remaining);
      convoy.bestRemaining = Math.min(convoy.bestRemaining, remaining);
      if (gained > 0) convoy.behavior.update(gained / Balance.e4Fuel.vehicleSpeed);
      const leader = convoy.behavior.diagnostics().leaderDistance;
      // The railhead itself is solid terrain; settle at its reachable edge like the other errands.
      if (!convoy.arrived && after.state === 'arrived' && this.nearStop(after)) {
        convoy.arrived = true;
        convoy.arrivedAt = time;
        this.record(emit, { type: 'motor_convoy_arrived', at: time, routeId: convoy.routeId, distance: round3(leader) });
        if (this.kind === 'convoy' && !this.arrived) {
          this.arrived = true;
          this.arrivedAt = time;
          this.roadDistanceAtArrival = round3(this.roadDistance);
        }
      }
    }

    if (this.kind === 'deliveries') this.settleDeliveries(after, time, emit);
    if (this.kind === 'tow') this.settleTow(after, time, emit);
  }

  /**
   * `deliveries`: a lease lands when the Hauler is at rest within reach of that lease road's far end
   * AND that road is open. A washed-out lease refuses the delivery and says so on the view, which is
   * the whole choice the audit asked for: ride the open leases, come back for the closed one.
   */
  private settleDeliveries(vehicle: VehicleDiagnostics, time: number, emit: (event: MotorEvent) => void): void {
    if (this.arrived || vehicle.state !== 'arrived') return;
    for (const lease of this.leases) {
      if (this.delivered.has(lease.id) || this.closedNow.includes(lease.id)) continue;
      if (Math.hypot(vehicle.x - lease.end.x, vehicle.z - lease.end.z) > MOTOR_STOP_REACH) continue;
      this.delivered.add(lease.id);
      this.record(emit, {
        type: 'motor_lease_delivered',
        at: time,
        corridorId: lease.id,
        x: round3(vehicle.x),
        z: round3(vehicle.z),
        delivered: this.delivered.size,
        remaining: this.leases.length - this.delivered.size,
        fuelDrawn: round3(this.fuel.diagnostics.drawn),
      });
      if (this.delivered.size === this.leases.length) {
        this.arrived = true;
        this.arrivedAt = time;
        this.roadDistanceAtArrival = round3(this.roadDistance);
      }
      return;
    }
  }

  /**
   * `tow`: at rest by the hulk puts it on the hook; at rest at the gate end of the declared road,
   * with the hulk on the hook, delivers it. Two legs, one tank, one storm clock.
   */
  private settleTow(vehicle: VehicleDiagnostics, time: number, emit: (event: MotorEvent) => void): void {
    const hulk = this.hulk;
    if (!hulk || this.arrived || vehicle.state !== 'arrived') return;
    if (!this.hitched) {
      if (Math.hypot(vehicle.x - hulk.x, vehicle.z - hulk.z) > MOTOR_STOP_REACH) return;
      this.hitched = true;
      this.hitchedAt = time;
      this.record(emit, { type: 'motor_tow_hitched', at: time, hulkId: hulk.id, x: round3(vehicle.x), z: round3(vehicle.z), fuelDrawn: round3(this.fuel.diagnostics.drawn) });
      return;
    }
    const stop = this.objectiveCorridor.start;
    if (Math.hypot(vehicle.x - stop.x, vehicle.z - stop.z) > MOTOR_STOP_REACH) return;
    this.arrived = true;
    this.arrivedAt = time;
    this.roadDistanceAtArrival = round3(this.roadDistance);
    this.record(emit, {
      type: 'motor_tow_delivered',
      at: time,
      hulkId: hulk.id,
      x: round3(vehicle.x),
      z: round3(vehicle.z),
      distanceTravelled: round3(vehicle.distanceTravelled),
      fuelDrawn: round3(this.fuel.diagnostics.drawn),
    });
  }

  /** The storm's washout, recomputed each tick and announced only when it changes. */
  private syncClosures(weather: WeatherSnapshot, time: number, emit: (event: MotorEvent) => void): void {
    if (!this.closures || this.leases.length === 0) return;
    const closed = weather.phase === 'storm' ? [this.leases[weather.cycle % this.leases.length]!.id] : [];
    for (const id of this.closedNow) {
      if (!closed.includes(id)) this.record(emit, { type: 'motor_road_reopened', at: time, corridorId: id, cycle: weather.cycle });
    }
    for (const id of closed) {
      if (!this.closedNow.includes(id)) this.record(emit, { type: 'motor_road_closed', at: time, corridorId: id, cycle: weather.cycle });
    }
    this.closedNow = closed;
  }

  /**
   * `RoadNetwork.movementAt`, minus any graded corridor the storm has washed out. A closed road is
   * not a wall: it carries no bonus, so the Hauler crawls it at off-road speed and off-road cost.
   */
  private movementAt(point: Point): Readonly<{ speedMultiplier: number; fuelMultiplier: number }> {
    const road = this.roads.movementAt(point);
    if (road.speedMultiplier <= 1 || this.closedNow.length === 0) return road;
    const onOpen = [...this.segments].some(([id, segment]) => !this.closedNow.includes(id) && segment.contains(point));
    return onOpen ? road : { speedMultiplier: 1, fuelMultiplier: 1 };
  }

  /** `GRADE`: the ungraded corridor whose stake is within reach of the given ground, nearest first. */
  gradeAt(point: Point, at: number, emit: (event: MotorEvent) => void): MotorVerbResult {
    const ranked = this.corridors
      .map((corridor) => ({ corridor, distance: Math.hypot(point.x - corridor.start.x, point.z - corridor.start.z) }))
      .sort((a, b) => a.distance - b.distance || a.corridor.id.localeCompare(b.corridor.id));
    const candidate = ranked.find(({ corridor, distance }) => !this.graded.has(corridor.id) && distance <= MOTOR_GRADE_REACH);
    if (!candidate) {
      const nearest = ranked.find(({ corridor }) => !this.graded.has(corridor.id));
      const hint = nearest
        ? ` The nearest ungraded stake is ${nearest.corridor.id} at (${nearest.corridor.start.x}, ${nearest.corridor.start.z}), ${round3(nearest.distance)}wu away.`
        : ' Every corridor is already graded.';
      return { ok: false, reason: `OUT_OF_REACH: GRADE needs an ungraded corridor stake within ${MOTOR_GRADE_REACH}wu of the Prospector.${hint}` };
    }
    const segment = this.roads.build(candidate.corridor.id, candidate.corridor.start, candidate.corridor.end);
    this.graded.add(candidate.corridor.id);
    this.segments.set(candidate.corridor.id, segment);
    this.record(emit, { type: 'motor_road_graded', at: round3(at), corridorId: candidate.corridor.id, length: round3(segment.length) });
    return { ok: true, corridorId: candidate.corridor.id };
  }

  /** `HAUL`: the Hauler drives to the given ground. Refused only when nothing could move it. */
  haulTo(point: Point, at: number, emit: (event: MotorEvent) => void): MotorVerbResult {
    const fuel = this.fuel.diagnostics;
    if (fuel.stored <= 0 && fuel.tar <= 0) {
      return { ok: false, reason: 'NO_FUEL: the Hauler has no fuel and no tar to refine; stand within reach of a tar node first.' };
    }
    this.vehicle.driveTo(point.x, point.z);
    this.dispatch = { x: round3(point.x), z: round3(point.z) };
    this.lastVehicleState = this.vehicle.diagnostics.state;
    this.record(emit, { type: 'motor_haul_dispatched', at: round3(at), target: this.dispatch, stored: round3(fuel.stored), tar: fuel.tar });
    return { ok: true };
  }

  diagnostics(at: number, secureWave: number): MotorDiagnostics {
    const weather = this.weather.sample(at);
    const vehicle = this.vehicle.diagnostics;
    const road = this.movementAt({ x: vehicle.x, z: vehicle.z });
    const fuel = this.fuel.diagnostics;
    const convoy = this.convoy;
    return {
      contractId: this.contractId,
      objective: this.objectiveView(secureWave),
      weather: {
        ...weather,
        phaseProgress: round3(weather.phaseProgress),
        simTime: round3(weather.simTime),
        hazeStrength: round3(weather.hazeStrength),
        nextPhaseInSeconds: round3(this.secondsToNextPhase(weather)),
      },
      roads: {
        ...this.roads.diagnostics(),
        gradeReach: MOTOR_GRADE_REACH,
        graded: [...this.graded].sort(),
        corridors: this.corridors.map((corridor) => ({
          id: corridor.id,
          start: { x: corridor.start.x, z: corridor.start.z },
          end: { x: corridor.end.x, z: corridor.end.z },
          graded: this.graded.has(corridor.id),
          ...(this.closures ? { closed: this.closedNow.includes(corridor.id) } : {}),
        })),
        ...(this.closures
          ? { closed: [...this.closedNow], closesNext: this.leases[(weather.cycle + (weather.phase === 'storm' ? 1 : 0)) % this.leases.length]?.id ?? null }
          : {}),
      },
      fuel: {
        ...fuel,
        stored: round3(fuel.stored),
        drawn: round3(fuel.drawn),
        nodes: fuel.nodes.map((node) => ({ ...node, progress: round3(node.progress) })),
      },
      vehicle: {
        ...vehicle,
        x: round3(vehicle.x),
        z: round3(vehicle.z),
        target: vehicle.target ? { x: round3(vehicle.target.x), z: round3(vehicle.target.z) } : null,
        distanceTravelled: round3(vehicle.distanceTravelled),
        onRoad: road.speedMultiplier > 1,
        roadDistance: round3(this.roadDistance),
        dispatch: this.dispatch,
      },
      convoy: convoy
        ? { ...convoy.behavior.diagnostics(), label: convoy.label, total: round3(convoy.total), arrived: convoy.arrived, arrivedAt: convoy.arrivedAt }
        : null,
      events: this.events.slice(-MOTOR_EVENT_TAIL),
      eventCount: this.eventCount,
    };
  }

  /**
   * The rider's read of the errand. The `haul` shape is EXACTLY what the Dust Flats published before
   * the other three objectives existed — same keys, same order — so its pinned views do not move;
   * the per-kind extras ride behind spreads that are empty on `haul`.
   */
  private objectiveView(secureWave: number): MotorObjectiveView {
    const base = {
      kind: this.kind,
      corridorId: this.nextCorridor().id,
      label: this.label(),
      stop: this.stop(),
      stopReach: MOTOR_STOP_REACH,
      arrived: this.arrived,
      arrivedAt: this.arrivedAt,
      roadDistanceAtArrival: this.roadDistanceAtArrival,
      securableAtWave: this.arrived ? secureWave : null,
    };
    if (this.kind === 'deliveries') {
      return {
        ...base,
        remaining: this.leases.filter((lease) => !this.delivered.has(lease.id)).map(({ id }) => id),
        delivered: this.leases.filter((lease) => this.delivered.has(lease.id)).map(({ id }) => id),
      };
    }
    if (this.kind === 'tow' && this.hulk) {
      return {
        ...base,
        hulk: { id: this.hulk.id, kind: this.hulk.kind, x: this.hulk.x, z: this.hulk.z },
        hitched: this.hitched,
        hitchedAt: this.hitchedAt,
      };
    }
    return base;
  }

  /** Where the Hauler must go NEXT for the errand to advance. */
  private stop(): Point {
    if (this.kind === 'convoy' && this.convoy) return { x: this.convoy.stop.x, z: this.convoy.stop.z };
    if (this.kind === 'tow') {
      if (this.hulk && !this.hitched) return { x: this.hulk.x, z: this.hulk.z };
      return { x: this.objectiveCorridor.start.x, z: this.objectiveCorridor.start.z };
    }
    const corridor = this.nextCorridor();
    return { x: corridor.end.x, z: corridor.end.z };
  }

  /** The road the next leg rides: the objective's own, or the first lease still owed. */
  private nextCorridor(): Corridor {
    if (this.kind !== 'deliveries') return this.objectiveCorridor;
    return this.leases.find((lease) => !this.delivered.has(lease.id) && !this.closedNow.includes(lease.id))
      ?? this.leases.find((lease) => !this.delivered.has(lease.id))
      ?? this.leases[this.leases.length - 1]!;
  }

  private label(): string {
    return this.twist.haul?.label ?? this.twist.convoy?.label ?? this.twist.deliveries?.label ?? this.twist.tow?.label ?? this.contractId;
  }

  /** The deterministic half, for the terminal hash: what moved, where it rests, what it burned. */
  get simulationSnapshot(): MotorSimulationSnapshot {
    const vehicle = this.vehicle.diagnostics;
    const fuel = this.fuel.diagnostics;
    const convoy = this.convoy;
    return {
      graded: [...this.graded].sort(),
      vehicle: {
        state: vehicle.state,
        x: round3(vehicle.x),
        z: round3(vehicle.z),
        target: vehicle.target ? { x: round3(vehicle.target.x), z: round3(vehicle.target.z) } : null,
        distanceTravelled: round3(vehicle.distanceTravelled),
        roadDistance: round3(this.roadDistance),
      },
      fuel: {
        tar: fuel.tar,
        stored: round3(fuel.stored),
        harvestedNodes: fuel.harvestedNodes,
        refinedTar: fuel.refinedTar,
        drawn: round3(fuel.drawn),
      },
      haul: { arrived: this.arrived, arrivedAt: this.arrivedAt },
      convoy: convoy ? { routeId: convoy.routeId, leaderDistance: convoy.behavior.diagnostics().leaderDistance, arrived: convoy.arrived } : null,
      events: this.eventCount,
      ...(this.kind === 'deliveries' ? { delivered: this.leases.filter((lease) => this.delivered.has(lease.id)).map(({ id }) => id) } : {}),
      ...(this.kind === 'tow' && this.hulk ? { tow: { hulkId: this.hulk.id, hitched: this.hitched, delivered: this.arrived } } : {}),
    };
  }

  get outcomeSummary(): MotorOutcomeSummary {
    const vehicle = this.vehicle.diagnostics;
    return {
      graded: [...this.graded].sort(),
      hauled: this.arrived,
      arrivedAt: this.arrivedAt,
      roadDistance: round3(this.roadDistance),
      distanceTravelled: round3(vehicle.distanceTravelled),
      fuelDrawn: round3(this.fuel.diagnostics.drawn),
      tarHarvested: this.tarHarvested,
      convoyArrived: this.convoy ? this.convoy.arrived : null,
      ...(this.kind === 'haul' ? {} : { kind: this.kind }),
      ...(this.kind === 'deliveries' ? { delivered: this.leases.filter((lease) => this.delivered.has(lease.id)).map(({ id }) => id) } : {}),
      ...(this.kind === 'tow' ? { towed: this.arrived } : {}),
    };
  }

  private nearStop(vehicle: VehicleDiagnostics): boolean {
    const stop = this.stop();
    return Math.hypot(vehicle.x - stop.x, vehicle.z - stop.z) <= MOTOR_STOP_REACH;
  }

  private secondsToNextPhase(weather: WeatherSnapshot): number {
    const config = this.weather.config;
    const within = weather.simTime - weather.cycle * config.cycleSeconds;
    const telegraphAt = config.clearSeconds;
    const stormAt = telegraphAt + config.telegraphSeconds;
    const clearAt = stormAt + config.stormSeconds;
    if (within < telegraphAt) return telegraphAt - within;
    if (within < stormAt) return stormAt - within;
    if (within < clearAt) return clearAt - within;
    // The trailing clear runs into the next cycle's clear; the next CHANGE is that cycle's telegraph.
    return config.cycleSeconds - within + config.clearSeconds;
  }

  private record(emit: (event: MotorEvent) => void, event: MotorEvent): void {
    this.eventCount += 1;
    this.events.push(event);
    if (this.events.length > MOTOR_EVENT_TAIL) this.events.splice(0, this.events.length - MOTOR_EVENT_TAIL);
    emit(event);
  }
}

function createConvoy(
  contractId: string,
  twist: NonNullable<ContractMotorFrontier['convoy']>,
  route: readonly Point[],
  leadStart: Point,
): Convoy {
  const points = route.map((point) => ({ x: point.x, z: point.z }));
  const total = points.slice(1).reduce((sum, point, index) => sum + Math.hypot(point.x - points[index]!.x, point.z - points[index]!.z), 0);
  // The leader rides at the Hauler's own speed; followers close gaps at the convoy catch-up rate,
  // the same two figures `E4ConvoyWeatherHarness` builds its formation from.
  const members: ConvoyPathEntity[] = Array.from({ length: twist.members }, (_, index) => ({
    id: `${contractId}:hauler-${index + 1}`,
    position: { x: points[0]!.x, z: points[0]!.z },
    maxSpeed: index === 0 ? Balance.e4Fuel.vehicleSpeed : Balance.e4Fuel.vehicleSpeed * Balance.convoy.catchupMultiplier,
  }));
  const routeId = `${contractId}:convoy`;
  const stop = points[points.length - 1]!;
  return {
    behavior: new ConvoyBehavior(members, { id: routeId, points }, Balance.convoy.spacing),
    members,
    routeId,
    label: twist.label,
    total,
    stop,
    arrived: false,
    arrivedAt: null,
    bestRemaining: Math.hypot(leadStart.x - stop.x, leadStart.z - stop.z),
  };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
