import type * as THREE from 'three';
import { Vehicle, type VehicleDiagnostics } from '../entities/Vehicle';
import { Balance } from '../game/Balance';
import type { ContractManifest, ContractMotorFrontier } from '../meta/ContractFamilies';
import { ConvoyBehavior, type ConvoyDiagnostics, type ConvoyPathEntity } from '../systems/ConvoyBehavior';
import { FuelSystem, type FuelDiagnostics } from '../systems/FuelSystem';
import { RoadNetwork, type RoadNetworkDiagnostics } from '../systems/RoadSegment';
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
 * `731373d4d` (`runner(lane-b): e4-05-dust-flats.md`, 2026-07-15), where `Game.ts` mounted
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
 * WHAT IT GATES. `objectiveAllowsSecure` is the haul latch: the Hauler has come to rest within
 * `MOTOR_STOP_REACH` of the declared corridor's far end. It reads `false` on every contract that
 * declares no `motorFrontier` by never being constructed (`create` returns null), so no admitted
 * contract's terminal moves.
 */

export const MOTOR_GRADE_VERB = 'GRADE' as const;
export const MOTOR_HAUL_VERB = 'HAUL' as const;
/** `DustFlatsTile.gradeRoadAt`'s default reach: the Prospector must stand this close to an ungraded corridor's start. */
export const MOTOR_GRADE_REACH = 2.5;
/** The haul stop's reach: the Hauler must come to rest this close to the declared far end. Same figure as the grade reach. */
export const MOTOR_STOP_REACH = 2.5;
/** How many motor events THE VIEW carries in its tail; the count of all of them rides beside it. */
export const MOTOR_EVENT_TAIL = 12;

type Point = Readonly<{ x: number; z: number }>;
type Corridor = NonNullable<ContractManifest['tileParams']['roadCorridors']>[number];

export type MotorEvent =
  | { type: 'motor_road_graded'; at: number; corridorId: string; length: number }
  | { type: 'motor_tar_harvested'; at: number; node: Point; tar: number; stored: number }
  | { type: 'motor_haul_dispatched'; at: number; target: Point; stored: number; tar: number }
  | { type: 'motor_hauler_dry'; at: number; x: number; z: number; distanceTravelled: number }
  | { type: 'motor_haul_arrived'; at: number; x: number; z: number; atStop: boolean; roadDistance: number; distanceTravelled: number; fuelDrawn: number }
  | { type: 'motor_weather'; at: number; phase: WeatherPhase; cycle: number }
  | { type: 'motor_convoy_arrived'; at: number; routeId: string; distance: number };

export type MotorVerbResult = { ok: true; corridorId?: string } | { ok: false; reason: string };

export type MotorDiagnostics = Readonly<{
  contractId: string;
  objective: Readonly<{
    kind: 'haul';
    corridorId: string;
    label: string;
    stop: Point;
    stopReach: number;
    arrived: boolean;
    arrivedAt: number | null;
    roadDistanceAtArrival: number | null;
    securableAtWave: number | null;
  }>;
  weather: Readonly<WeatherSnapshot & { nextPhaseInSeconds: number }>;
  roads: Readonly<RoadNetworkDiagnostics & {
    gradeReach: number;
    graded: readonly string[];
    corridors: readonly Readonly<{ id: string; start: Point; end: Point; graded: boolean }>[];
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
}>;

type Convoy = {
  behavior: ConvoyBehavior;
  members: ConvoyPathEntity[];
  routeId: string;
  label: string;
  total: number;
  arrived: boolean;
  arrivedAt: number | null;
};

export class MotorSocket {
  static create(manifest: ContractManifest): MotorSocket | null {
    return manifest.twist.motorFrontier ? new MotorSocket(manifest, manifest.twist.motorFrontier) : null;
  }

  readonly contractId: string;
  private readonly weather: WeatherSystem;
  private readonly roads = new RoadNetwork();
  private readonly graded = new Set<string>();
  private readonly corridors: readonly Corridor[];
  private readonly haulCorridor: Corridor;
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
    const haul = this.corridors.find((corridor) => corridor.id === twist.haul.corridorId);
    if (!haul) throw new Error(`${manifest.id} hauls to an unknown road corridor ${twist.haul.corridorId}.`);
    this.haulCorridor = haul;
    // Always enabled: the twist IS the enable. The browser's `isDevVehiclesEnabled` predicate is the
    // debug harness's switch, not a game rule, so nothing of it is transcribed here.
    this.fuel = new FuelSystem(() => true);
    this.vehicle = new Vehicle(this.fuel, { start: twist.vehicle.start });
    this.lastVehicleState = this.vehicle.diagnostics.state;
    const route = manifest.tileParams.convoyRoute;
    this.convoy = twist.convoy && route && route.length >= 2 ? createConvoy(manifest.id, twist.convoy, route) : null;
  }

  /** The haul latch: true once the Hauler has come to rest at the declared far end. One-way. */
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
    const road = this.roads.movementAt({ x: before.x, z: before.z });
    const weather = this.weather.sample(at);
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
        const atStop = this.nearStop(after);
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
      convoy.behavior.update(step * weather.movementMultiplier);
      const leader = convoy.behavior.diagnostics().leaderDistance;
      if (!convoy.arrived && leader >= convoy.total - 1e-6) {
        convoy.arrived = true;
        convoy.arrivedAt = time;
        this.record(emit, { type: 'motor_convoy_arrived', at: time, routeId: convoy.routeId, distance: round3(leader) });
      }
    }
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
    const road = this.roads.movementAt({ x: vehicle.x, z: vehicle.z });
    const fuel = this.fuel.diagnostics;
    const convoy = this.convoy;
    return {
      contractId: this.contractId,
      objective: {
        kind: 'haul',
        corridorId: this.haulCorridor.id,
        label: this.twist.haul.label,
        stop: { x: this.haulCorridor.end.x, z: this.haulCorridor.end.z },
        stopReach: MOTOR_STOP_REACH,
        arrived: this.arrived,
        arrivedAt: this.arrivedAt,
        roadDistanceAtArrival: this.roadDistanceAtArrival,
        securableAtWave: this.arrived ? secureWave : null,
      },
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
        })),
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
    };
  }

  private nearStop(vehicle: VehicleDiagnostics): boolean {
    return Math.hypot(vehicle.x - this.haulCorridor.end.x, vehicle.z - this.haulCorridor.end.z) <= MOTOR_STOP_REACH;
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

function createConvoy(contractId: string, twist: NonNullable<ContractMotorFrontier['convoy']>, route: readonly Point[]): Convoy {
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
  return {
    behavior: new ConvoyBehavior(members, { id: routeId, points }, Balance.convoy.spacing),
    members,
    routeId,
    label: twist.label,
    total,
    arrived: false,
    arrivedAt: null,
  };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
