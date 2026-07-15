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
};

type RailSegment = {
  start: THREE.Vector3;
  end: THREE.Vector3;
};

type Tie = {
  x: number;
  y: number;
  z: number;
  yaw: number;
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
    for (const path of this.paths) {
      for (let index = 1; index < path.points.length; index += 1) {
        addPathSegment(path.points[index - 1]!, path.points[index]!, railSegments, ties, samples);
      }
    }

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
    };
  }

  diagnostics(): RailPathDiagnostics {
    return {
      ...this.diagnosticsState,
      samples: this.diagnosticsState.samples.map((sample) => ({ ...sample })),
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
        start: railPoint(a, b, t0, sideX * side, sideZ * side),
        end: railPoint(a, b, t1, sideX * side, sideZ * side),
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

function railPoint(a: RailPathPoint, b: RailPathPoint, t: number, sideX: number, sideZ: number): THREE.Vector3 {
  const x = THREE.MathUtils.lerp(a.x, b.x, t) + sideX * (RAIL_GAUGE * 0.5);
  const z = THREE.MathUtils.lerp(a.z, b.z, t) + sideZ * (RAIL_GAUGE * 0.5);
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
    scale.set(RAIL_WIDTH, RAIL_HEIGHT, length);
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
    matrix.compose(position, rotation, scale);
    mesh.setMatrixAt(index, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function rememberSample(samples: RailPathDiagnostics['samples'], x: number, z: number, kind: 'point' | 'midpoint'): void {
  if (samples.length >= 32) return;
  if (samples.some((sample) => Math.hypot(sample.x - x, sample.z - z) < 0.01)) return;
  samples.push({ x, y: visualY(x, z, RAIL_Y), z, kind });
}
