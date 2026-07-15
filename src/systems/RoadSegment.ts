import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';

export type RoadPoint = Readonly<{ x: number; z: number }>;
export type RoadRoute = Readonly<{ id: string; points: readonly RoadPoint[] }>;
export type FriendlyRoadState = { x: number; z: number; fuel: number; distance: number };

export type RoadNetworkDiagnostics = Readonly<{
  segments: number;
  length: number;
  friendlySpeedMultiplier: number;
  friendlyFuelMultiplier: number;
  enemyRouteCostMultiplier: number;
}>;

export class RoadSegment {
  readonly group = new THREE.Group();
  readonly length: number;
  private readonly geometry: THREE.BoxGeometry;
  private readonly material: THREE.MeshStandardMaterial;

  constructor(readonly id: string, readonly start: RoadPoint, readonly end: RoadPoint, readonly halfWidth = Balance.e4Road.halfWidth) {
    this.length = Math.hypot(end.x - start.x, end.z - start.z);
    if (!id || ![start.x, start.z, end.x, end.z, halfWidth].every(Number.isFinite) || this.length <= 0 || halfWidth <= 0) {
      throw new Error('A road segment needs an id, finite length, and width.');
    }
    this.group.name = `RoadSegment:${id}`;
    this.geometry = new THREE.BoxGeometry(halfWidth * 2, 0.06, this.length);
    this.material = new THREE.MeshStandardMaterial({ color: '#a87842', roughness: 0.96 });
    const mesh = new THREE.Mesh(this.geometry, this.material);
    mesh.position.y = 0.03;
    mesh.renderOrder = RenderLayers.groundDecals;
    this.group.position.set((start.x + end.x) / 2, 0, (start.z + end.z) / 2);
    this.group.rotation.y = Math.atan2(end.x - start.x, end.z - start.z);
    this.group.add(mesh);
  }

  contains(point: RoadPoint): boolean {
    const dx = this.end.x - this.start.x;
    const dz = this.end.z - this.start.z;
    const t = Math.min(1, Math.max(0, ((point.x - this.start.x) * dx + (point.z - this.start.z) * dz) / (this.length * this.length)));
    return Math.hypot(point.x - (this.start.x + dx * t), point.z - (this.start.z + dz * t)) <= this.halfWidth;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.group.clear();
  }
}

export class RoadNetwork {
  readonly group = new THREE.Group();
  private readonly segments: RoadSegment[] = [];

  build(id: string, start: RoadPoint, end: RoadPoint): RoadSegment {
    if (this.segments.some((segment) => segment.id === id)) throw new Error(`Road segment already exists: ${id}`);
    const segment = new RoadSegment(id, start, end);
    this.segments.push(segment);
    this.group.add(segment.group);
    return segment;
  }

  movementAt(point: RoadPoint): Readonly<{ speedMultiplier: number; fuelMultiplier: number }> {
    return this.segments.some((segment) => segment.contains(point))
      ? { speedMultiplier: Balance.e4Road.friendlySpeedMultiplier, fuelMultiplier: Balance.e4Road.friendlyFuelMultiplier }
      : { speedMultiplier: 1, fuelMultiplier: 1 };
  }

  moveFriendly(state: FriendlyRoadState, direction: RoadPoint, seconds: number): FriendlyRoadState {
    const length = Math.hypot(direction.x, direction.z);
    if (length <= 0 || seconds <= 0 || state.fuel <= 0) return { ...state };
    const effect = this.movementAt(state);
    const requestedFuel = seconds * Balance.e4Fuel.burnPerSecond * effect.fuelMultiplier;
    const suppliedRatio = Math.min(1, state.fuel / requestedFuel);
    const distance = seconds * Balance.e4Fuel.vehicleSpeed * effect.speedMultiplier * suppliedRatio;
    return {
      x: state.x + direction.x / length * distance,
      z: state.z + direction.z / length * distance,
      fuel: Math.max(0, state.fuel - requestedFuel * suppliedRatio),
      distance: state.distance + distance,
    };
  }

  chooseEnemyRoute(routes: readonly RoadRoute[]): Readonly<{ routeId: string; cost: number; roadLength: number }> {
    if (routes.length === 0) throw new Error('Enemy routing needs at least one route.');
    return routes.map((route) => this.scoreRoute(route)).sort((a, b) => a.cost - b.cost || a.routeId.localeCompare(b.routeId))[0]!;
  }

  diagnostics(): RoadNetworkDiagnostics {
    return {
      segments: this.segments.length,
      length: round3(this.segments.reduce((sum, segment) => sum + segment.length, 0)),
      friendlySpeedMultiplier: Balance.e4Road.friendlySpeedMultiplier,
      friendlyFuelMultiplier: Balance.e4Road.friendlyFuelMultiplier,
      enemyRouteCostMultiplier: Balance.e4Road.enemyRouteCostMultiplier,
    };
  }

  dispose(): void {
    for (const segment of this.segments) segment.dispose();
    this.segments.length = 0;
    this.group.clear();
  }

  private scoreRoute(route: RoadRoute): { routeId: string; cost: number; roadLength: number } {
    if (route.points.length < 2) throw new Error(`Road route needs two points: ${route.id}`);
    let cost = 0;
    let roadLength = 0;
    for (let index = 1; index < route.points.length; index += 1) {
      const from = route.points[index - 1]!;
      const to = route.points[index]!;
      const length = Math.hypot(to.x - from.x, to.z - from.z);
      if (length <= 0) throw new Error(`Road route has a zero-length segment: ${route.id}`);
      const graded = this.segments.some((segment) => segment.contains(from) && segment.contains(to));
      if (graded) roadLength += length;
      cost += length * (graded ? Balance.e4Road.enemyRouteCostMultiplier : 1);
    }
    return { routeId: route.id, cost: round3(cost), roadLength: round3(roadLength) };
  }
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
