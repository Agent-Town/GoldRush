import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { RailPathDescriptor, RailPathPoint } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';
import { visualY } from './Terrain';

export type RailPathDiagnostics = {
  active: boolean;
  paths: number;
  points: number;
  style: string | null;
  renderLayer: number;
  renderSlot: 'groundDecals';
  railInstances: number;
  tieInstances: number;
  drawCalls: number;
  asset: 'procedural-placeholder';
  samples: Array<{ x: number; y: number; z: number; kind: 'point' | 'midpoint' }>;
  ties: Array<{ x: number; y: number; z: number; yaw: number }>;
};

type RailSegment = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  width?: number;
  height?: number;
  pathIndex?: number;
};

type Tie = {
  x: number;
  y: number;
  z: number;
  yaw: number;
  width?: number;
};

const RAIL_GAUGE = 0.78;
const RAIL_WIDTH = 0.08;
const RAIL_HEIGHT = 0.09;
const RAIL_Y = 0.08;
const TIE_WIDTH = 1.32;
const TIE_HEIGHT = 0.07;
const TIE_DEPTH = 0.22;
const TIE_Y = 0.035;
const SEGMENT_MAX = 0.9;
const TIE_SPACING = 0.9;
const UNIT_Z = new THREE.Vector3(0, 0, 1);

export class RailPathView {
  readonly group = new THREE.Group();
  private readonly paths: readonly RailPathDescriptor[];
  private diagnosticsState = emptyRailPathDiagnostics();

  constructor(paths: readonly RailPathDescriptor[] = []) {
    this.paths = paths;
    this.group.name = 'RailPath';
    this.resampleTerrain();
  }

  resampleTerrain(): void {
    disposeRailPath(this.group);
    this.group.clear();
    const railSegments: RailSegment[] = [];
    const ties: Tie[] = [];
    const samples: RailPathDiagnostics['samples'] = [];
    const dressed = this.paths.some(path => path.style === 'steamworks' || path.style === 'mine-spur');
    const seen = new Set<string>();
    for (const [pathIndex, path] of this.paths.entries()) {
      for (let index = 1; index < path.points.length; index += 1) {
        const a = path.points[index - 1]!, b = path.points[index]!;
        const key = [pointKey(a), pointKey(b)].sort().join('|');
        if (dressed && seen.has(key)) continue;
        seen.add(key);
        const firstRail = railSegments.length;
        addPathSegment(a, b, railSegments, ties, samples,
          dressed ? pathOffset(path.points, index - 1) : undefined,
          dressed ? pathOffset(path.points, index) : undefined);
        for (let i = firstRail; i < railSegments.length; i++) railSegments[i]!.pathIndex = pathIndex;
      }
    }
    // Feeder canals and mass drivers share the old renderer but are not railway stops.
    this.group.userData.railFinishing = dressed
      ? finishRailway(this.paths, railSegments, ties)
      : { joins: 0, buffers: 0, frogs: 0 };

    if (railSegments.length > 0) this.group.add(createRailMesh(railSegments));
    if (ties.length > 0) this.group.add(createTieMesh(ties));

    this.diagnosticsState = {
      active: railSegments.length > 0,
      paths: this.paths.length,
      points: this.paths.reduce((total, path) => total + path.points.length, 0),
      style: this.paths.find((path) => path.style)?.style ?? null,
      renderLayer: RenderLayers.groundDecals,
      renderSlot: 'groundDecals',
      railInstances: railSegments.length,
      tieInstances: ties.length,
      drawCalls: (railSegments.length > 0 ? 1 : 0) + (ties.length > 0 ? 1 : 0),
      asset: 'procedural-placeholder',
      samples,
      ties,
    };
  }

  diagnostics(): RailPathDiagnostics {
    return {
      ...this.diagnosticsState,
      samples: this.diagnosticsState.samples.map((sample) => ({ ...sample })),
      ties: this.diagnosticsState.ties.map((tie) => ({ ...tie })),
    };
  }

  dispose(): void {
    disposeRailPath(this.group);
  }
}

export function emptyRailPathDiagnostics(): RailPathDiagnostics {
  return {
    active: false,
    paths: 0,
    points: 0,
    style: null,
    renderLayer: RenderLayers.groundDecals,
    renderSlot: 'groundDecals',
    railInstances: 0,
    tieInstances: 0,
    drawCalls: 0,
    asset: 'procedural-placeholder',
    samples: [],
    ties: [],
  };
}

function disposeRailPath(group: THREE.Group): void {
  group.traverse((object) => {
    if ((object as THREE.InstancedMesh).isInstancedMesh) (object as THREE.InstancedMesh).dispose();
  });
  disposeObject3D(group);
}

function addPathSegment(
  a: RailPathPoint,
  b: RailPathPoint,
  rails: RailSegment[],
  ties: Tie[],
  samples: RailPathDiagnostics['samples'],
  startOffset?: RailPathPoint,
  endOffset?: RailPathPoint,
): void {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dz);
  if (length <= 0.001) return;

  const dirX = dx / length;
  const dirZ = dz / length;
  const sideX = -dirZ;
  const sideZ = dirX;
  const railSteps = Math.max(1, Math.ceil(length / SEGMENT_MAX));
  const tieCount = Math.max(1, Math.ceil(length / TIE_SPACING));
  const yaw = Math.atan2(dirX, dirZ);

  rememberSample(samples, a.x, a.z, 'point');
  rememberSample(samples, (a.x + b.x) * 0.5, (a.z + b.z) * 0.5, 'midpoint');
  rememberSample(samples, b.x, b.z, 'point');

  for (let index = 0; index < railSteps; index += 1) {
    const t0 = index / railSteps;
    const t1 = (index + 1) / railSteps;
    for (const side of [-1, 1] as const) {
      rails.push({
        start: railPoint(a, b, t0, sideX * side, sideZ * side, startOffset, endOffset, side),
        end: railPoint(a, b, t1, sideX * side, sideZ * side, startOffset, endOffset, side),
      });
    }
  }

  for (let index = 0; index < tieCount; index += 1) {
    const t = (index + 0.5) / tieCount;
    const x = THREE.MathUtils.lerp(a.x, b.x, t);
    const z = THREE.MathUtils.lerp(a.z, b.z, t);
    ties.push({ x, y: visualY(x, z, TIE_Y), z, yaw });
  }
}

function railPoint(a: RailPathPoint, b: RailPathPoint, t: number, sideX: number, sideZ: number,
  startOffset?: RailPathPoint, endOffset?: RailPathPoint, side = 1): THREE.Vector3 {
  const x = THREE.MathUtils.lerp(a.x, b.x, t) + (startOffset && endOffset
    ? THREE.MathUtils.lerp(startOffset.x, endOffset.x, t) * side : sideX * RAIL_GAUGE * 0.5);
  const z = THREE.MathUtils.lerp(a.z, b.z, t) + (startOffset && endOffset
    ? THREE.MathUtils.lerp(startOffset.z, endOffset.z, t) * side : sideZ * RAIL_GAUGE * 0.5);
  return new THREE.Vector3(x, visualY(x, z, RAIL_Y), z);
}

function createRailMesh(segments: readonly RailSegment[]): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: '#2d2921', roughness: 0.62, metalness: 0.28 }),
    segments.length,
  );
  mesh.name = 'RailPath.Rails';
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;

  const matrix = new THREE.Matrix4();
  const midpoint = new THREE.Vector3();
  const direction = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index]!;
    midpoint.copy(segment.start).add(segment.end).multiplyScalar(0.5);
    direction.copy(segment.end).sub(segment.start);
    const length = Math.max(0.001, direction.length());
    rotation.setFromUnitVectors(UNIT_Z, direction.normalize());
    scale.set(segment.width ?? RAIL_WIDTH, segment.height ?? RAIL_HEIGHT, length);
    matrix.compose(midpoint, rotation, scale);
    mesh.setMatrixAt(index, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function createTieMesh(ties: readonly Tie[]): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: '#6f4b2d', roughness: 0.9, metalness: 0.02 }),
    ties.length,
  );
  mesh.name = 'RailPath.Sleepers';
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.frustumCulled = false;
  mesh.receiveShadow = true;

  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const scale = new THREE.Vector3(TIE_WIDTH, TIE_HEIGHT, TIE_DEPTH);
  for (let index = 0; index < ties.length; index += 1) {
    const tie = ties[index]!;
    position.set(tie.x, tie.y, tie.z);
    rotation.setFromEuler(new THREE.Euler(0, tie.yaw, 0));
    scale.x = tie.width ?? TIE_WIDTH;
    matrix.compose(position, rotation, scale);
    mesh.setMatrixAt(index, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function pointKey(point: RailPathPoint): string { return `${point.x},${point.z}`; }

/** Offset the two rails to a common mitre at a bend, rather than overlapping square ends. */
function pathOffset(points: readonly RailPathPoint[], index: number): RailPathPoint {
  const point = points[index]!, before = points[index - 1] ?? point, after = points[index + 1] ?? point;
  const incoming = new THREE.Vector2(point.x - before.x, point.z - before.z).normalize();
  const outgoing = new THREE.Vector2(after.x - point.x, after.z - point.z).normalize();
  if (incoming.lengthSq() === 0) incoming.copy(outgoing);
  if (outgoing.lengthSq() === 0) outgoing.copy(incoming);
  const normal = new THREE.Vector2(-outgoing.y, outgoing.x);
  const mitre = new THREE.Vector2(-incoming.y, incoming.x).add(normal);
  const divisor = mitre.dot(normal);
  // A route may retrace its last edge (Canyon Works). That is a rail terminus, not a
  // crossing: keep the incoming sides at the turnaround instead of swapping left/right.
  if (divisor < 0.2) return { x: -incoming.y * RAIL_GAUGE / 2, z: incoming.x * RAIL_GAUGE / 2 };
  mitre.multiplyScalar(RAIL_GAUGE / 2 / divisor);
  return { x: mitre.x, z: mitre.y };
}

function intersection(a: RailPathPoint, b: RailPathPoint, c: RailPathPoint, d: RailPathPoint): [number, number] | null {
  const dx = b.x - a.x, dz = b.z - a.z, ex = d.x - c.x, ez = d.z - c.z;
  const cross = dx * ez - dz * ex;
  if (Math.abs(cross) < 1e-6) return null;
  const t = ((c.x - a.x) * ez - (c.z - a.z) * ex) / cross;
  const u = ((c.x - a.x) * dz - (c.z - a.z) * dx) / cross;
  return t >= -1e-6 && t <= 1 + 1e-6 && u >= -1e-6 && u <= 1 + 1e-6 ? [t, u] : null;
}

/** Railway dressing only. The caller's route/stations are never mutated. All hardware shares
 * the existing two instanced boxes/materials: sleepers, check rails, frogs and buffer beams. */
function finishRailway(paths: readonly RailPathDescriptor[], rails: RailSegment[], ties: Tie[]) {
  const edges: Array<{ a: RailPathPoint; b: RailPathPoint; path: number }> = [];
  paths.forEach((path, pi) => path.points.slice(1).forEach((b, i) => {
    const a = path.points[i]!;
    if (Math.hypot(b.x - a.x, b.z - a.z) > 0.001) edges.push({ a, b, path: pi });
  }));
  const joins: Array<{ x: number; z: number; directions: THREE.Vector2[] }> = [];
  for (let i = 0; i < edges.length; i++) for (let j = i + 1; j < edges.length; j++) {
    const a = edges[i]!, b = edges[j]!;
    if (a.path === b.path) continue;
    const hit = intersection(a.a, a.b, b.a, b.b);
    if (!hit) continue;
    const x = THREE.MathUtils.lerp(a.a.x, a.b.x, hit[0]), z = THREE.MathUtils.lerp(a.a.z, a.b.z, hit[0]);
    let join = joins.find(p => Math.hypot(p.x - x, p.z - z) < 0.01);
    if (!join) { join = { x, z, directions: [] }; joins.push(join); }
    for (const edge of [a, b]) {
      const direction = new THREE.Vector2(edge.b.x - edge.a.x, edge.b.z - edge.a.z).normalize();
      if (!join.directions.some(d => Math.abs(d.dot(direction)) > 0.99)) join.directions.push(direction);
    }
  }
  // Cut flangeways at actual rail/rail crossings. A small gap on BOTH crossing rails forms
  // a frog; adjacent samples on one straight rail are collinear and never cut themselves.
  const cuts = rails.map(() => [] as number[]);
  let frogs = 0;
  for (let i = 0; i < rails.length; i++) for (let j = i + 1; j < rails.length; j++) {
    const a = rails[i]!, b = rails[j]!, hit = intersection(a.start, a.end, b.start, b.end);
    if (a.pathIndex === b.pathIndex) continue;
    if (!hit) continue;
    const p = a.start.clone().lerp(a.end, hit[0]);
    if (!joins.some(join => Math.hypot(join.x - p.x, join.z - p.z) < 1.5)) continue;
    cuts[i]!.push(hit[0]); cuts[j]!.push(hit[1]); frogs++;
  }
  const cutRails: RailSegment[] = [];
  rails.forEach((rail, i) => {
    const gap = 0.085 / rail.start.distanceTo(rail.end);
    let from = 0;
    for (const cut of cuts[i]!.sort((a, b) => a - b)) {
      const to = Math.max(0, cut - gap);
      if (to > from) cutRails.push({ start: rail.start.clone().lerp(rail.end, from), end: rail.start.clone().lerp(rail.end, to) });
      from = Math.max(from, Math.min(1, cut + gap));
    }
    if (from < 1) cutRails.push({ start: rail.start.clone().lerp(rail.end, from), end: rail.end });
  });
  rails.splice(0, rails.length, ...cutRails);
  for (const join of joins) {
    // A single wide sleeper run replaces the two overlapping runs under a junction.
    for (let i = ties.length - 1; i >= 0; i--) if (Math.hypot(ties[i]!.x - join.x, ties[i]!.z - join.z) < 1.55) ties.splice(i, 1);
    const main = join.directions[0]!;
    for (const along of [-1.3, -0.65, 0, 0.65, 1.3]) {
      const x = join.x + main.x * along, z = join.z + main.y * along;
      ties.push({ x, y: visualY(x, z, TIE_Y), z, yaw: Math.atan2(main.x, main.y), width: 2.8 });
    }
    for (const dir of join.directions) for (const side of [-1, 1]) {
      // Paired check rails flank the frog on each approach; leave its centre open.
      for (const sign of [-1, 1]) {
        const point = (along: number) => {
          const x = join.x + dir.x * along - dir.y * 0.22 * side;
          const z = join.z + dir.y * along + dir.x * 0.22 * side;
          return new THREE.Vector3(x, visualY(x, z, RAIL_Y), z);
        };
        rails.push({ start: point(sign * 0.7), end: point(sign * 1.35), width: 0.055 });
      }
    }
  }
  let buffers = 0;
  const endpoints = new Set<string>();
  for (const p of edges.flatMap(edge => [edge.a, edge.b])) {
    if (endpoints.has(pointKey(p))) continue;
    endpoints.add(pointKey(p));
    const neighbors = new Set(edges.flatMap(edge => pointKey(edge.a) === pointKey(p) ? [pointKey(edge.b)] : pointKey(edge.b) === pointKey(p) ? [pointKey(edge.a)] : []));
    if (neighbors.size !== 1 || joins.some(join => Math.hypot(join.x - p.x, join.z - p.z) < 0.01)) continue;
    const inside = edges.flatMap(edge => [edge.a, edge.b]).find(point => pointKey(point) === [...neighbors][0])!;
    const dir = new THREE.Vector2(inside.x - p.x, inside.z - p.z).normalize();
    if (!dir.lengthSq()) continue;
    const point = (across: number, along: number, up: number) => {
      const x = p.x - dir.y * across + dir.x * along, z = p.z + dir.x * across + dir.y * along;
      return new THREE.Vector3(x, visualY(x, z, up), z);
    };
    // Reused rail braces carry a broad steel crossbar, inside the endpoint.
    for (const side of [-1, 1]) rails.push({ start: point(side * 0.39, 0.85, RAIL_Y), end: point(side * 0.39, 0.12, 0.82), width: 0.12, height: 0.12 });
    rails.push({ start: point(-0.82, 0.12, 0.82), end: point(0.82, 0.12, 0.82), width: 0.22, height: 0.25 });
    buffers++;
  }
  return { joins: joins.length, buffers, frogs };
}

function rememberSample(samples: RailPathDiagnostics['samples'], x: number, z: number, kind: 'point' | 'midpoint'): void {
  if (samples.length >= 32) return;
  if (samples.some((sample) => Math.hypot(sample.x - x, sample.z - z) < 0.01)) return;
  samples.push({ x, y: visualY(x, z, RAIL_Y), z, kind });
}
