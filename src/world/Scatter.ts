import * as THREE from 'three';
import { createRng, normalizeSeed, type Rng } from '../core/Rng';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { activeContract, type ContractDetailClass } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';
import * as Terrain from './Terrain';

export type DetailClassId = ContractDetailClass;
export type DetailDensityTier = 'desktop' | 'mobile-reduced' | 'off';

export type DetailScatterClearPoint = {
  x: number;
  z: number;
  radius: number;
};

export type DetailScatterDiagnostics = {
  instanceClasses: number;
  totalInstances: number;
  seededInstances: number;
  densityTier: DetailDensityTier;
  seed: number;
  classes: Array<{ id: DetailClassId; instances: number; visibleInstances: number; drawCalls: 1 }>;
  exclusions: {
    buildPadRadius: number;
    routingLaneRadius: number;
    harvestAnchorRadius: number;
    buildingClearRadius: number;
  };
  probes: Record<'buildPad' | 'ford' | 'routingLane' | 'building', DetailScatterProbe>;
  signature: string;
};

type DetailScatterProbe = {
  x: number;
  z: number;
  clearRadius: number;
  nearest: number | null;
  clear: boolean;
};

type DetailProfile = {
  id: DetailClassId;
  baseCount: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  minScale: number;
  maxScale: number;
  baseY: number;
  groundRotationX?: number;
};

type DetailInstance = {
  x: number;
  z: number;
  y: number;
  rotation: number;
  scale: number;
  hidden: boolean;
  mesh: THREE.InstancedMesh;
  index: number;
};

type DetailClass = {
  profile: DetailProfile;
  mesh: THREE.InstancedMesh;
  instances: DetailInstance[];
};

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
const scratchObject = new THREE.Object3D();
const BUILD_PAD_PROBE = { x: 0, z: 9 };
const FORD_PROBE = { x: 0, z: 0 };
const ROUTING_PROBE = { x: 0, z: -14 };
const SCATTER_DESCRIPTOR = activeContract().tileParams.scatter;

export class DetailScatter {
  readonly group = new THREE.Group();

  private readonly classes: DetailClass[];
  private readonly seededInstances: DetailInstance[] = [];
  private readonly seed = scatterSeed();
  private readonly densityTier: DetailDensityTier;
  private buildingClearings: readonly DetailScatterClearPoint[] = [];
  private clearingsSignature = '';

  constructor() {
    this.group.name = 'DetailScatter';
    this.densityTier = densityTier();
    const density = detailDensity(this.densityTier);
    this.classes = createProfiles().map((profile) => this.createClass(profile, density));
    this.syncBuildingClearings([]);
  }

  syncBuildingClearings(clearings: readonly DetailScatterClearPoint[]): void {
    const signature = clearings
      .map((point) => `${point.x.toFixed(1)},${point.z.toFixed(1)},${point.radius.toFixed(1)}`)
      .join('|');
    if (signature === this.clearingsSignature) return;
    this.clearingsSignature = signature;
    this.buildingClearings = clearings;

    for (const detail of this.seededInstances) {
      const hidden = isNearAny(detail, clearings);
      if (hidden === detail.hidden) continue;
      detail.hidden = hidden;
      writeInstance(detail.mesh, detail.index, detail, hidden);
    }
    for (const entry of this.classes) entry.mesh.instanceMatrix.needsUpdate = true;
  }

  diagnostics(): DetailScatterDiagnostics {
    const classes = this.classes.map((entry) => ({
      id: entry.profile.id,
      instances: entry.instances.length,
      visibleInstances: entry.instances.filter((detail) => !detail.hidden).length,
      drawCalls: 1 as const,
    }));
    const totalInstances = classes.reduce((total, entry) => total + entry.visibleInstances, 0);
    return {
      instanceClasses: classes.filter((entry) => entry.instances > 0).length,
      totalInstances,
      seededInstances: this.seededInstances.length,
      densityTier: this.densityTier,
      seed: this.seed,
      classes,
      exclusions: {
        buildPadRadius: Balance.world.detailBuildPadClearRadius,
        routingLaneRadius: Balance.world.detailRoutingLaneClearRadius,
        harvestAnchorRadius: Balance.world.detailHarvestAnchorClearRadius,
        buildingClearRadius: Balance.world.detailBuildingClearRadius,
      },
      probes: {
        buildPad: probeClear(this.seededInstances, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z, Balance.world.detailBuildPadClearRadius),
        ford: probeClear(this.seededInstances, FORD_PROBE.x, FORD_PROBE.z, Terrain.RIVER_MAX_Z + Terrain.SHALLOWS_WIDTH),
        routingLane: probeClear(this.seededInstances, ROUTING_PROBE.x, ROUTING_PROBE.z, Balance.world.detailRoutingLaneClearRadius),
        building: this.buildingClearings[0]
          ? probeClear(
              this.seededInstances,
              this.buildingClearings[0].x,
              this.buildingClearings[0].z,
              this.buildingClearings[0].radius,
            )
          : probeClear(this.seededInstances, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z, Balance.world.detailBuildingClearRadius),
      },
      signature: this.seededInstances
        .slice(0, 12)
        .map((detail) => `${detail.x.toFixed(2)},${detail.z.toFixed(2)}`)
        .join('|'),
    };
  }

  dispose(): void {
    disposeObject3D(this.group);
  }

  private createClass(profile: DetailProfile, density: number): DetailClass {
    const count = Math.max(0, Math.floor(profile.baseCount * density));
    const mesh = new THREE.InstancedMesh(profile.geometry, profile.material, Math.max(1, count));
    mesh.name = `DetailScatter.${profile.id}`;
    mesh.userData.detailProfile = profile;
    mesh.count = count;
    mesh.frustumCulled = false;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    if (profile.groundRotationX !== undefined) mesh.renderOrder = RenderLayers.groundDecals;
    if (count === 0) mesh.visible = false;
    this.group.add(mesh);

    const rng = createRng((this.seed ^ normalizeSeed(profile.id)) >>> 0);
    const instances: DetailInstance[] = [];
    for (let index = 0; index < count; index += 1) {
      const placed = placeDetail(profile, rng, instances);
      if (!placed) {
        mesh.setMatrixAt(index, hiddenMatrix);
        continue;
      }
      const detail: DetailInstance = {
        ...placed,
        hidden: false,
        mesh,
        index,
      };
      writeInstance(mesh, index, detail, false);
      instances.push(detail);
      this.seededInstances.push(detail);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return { profile, mesh, instances };
  }
}

function createProfiles(): DetailProfile[] {
  return [
    {
      id: 'rocks',
      baseCount: profileCount('rocks', 44),
      geometry: rockGeometry(),
      material: standardMaterial('#8c7f6d', 0.9),
      minScale: 0.55,
      maxScale: 1.25,
      baseY: 0,
    },
    {
      id: 'stumps',
      baseCount: profileCount('stumps', 18),
      geometry: stumpGeometry(),
      material: standardMaterial('#4f331f', 0.86),
      minScale: 0.72,
      maxScale: 1.15,
      baseY: 0,
    },
    {
      id: 'dry_grass',
      baseCount: profileCount('dry_grass', 92),
      geometry: grassGeometry(),
      material: new THREE.MeshStandardMaterial({
        color: '#7b8050',
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      minScale: 0.58,
      maxScale: 1.35,
      baseY: 0.01,
    },
    {
      id: 'wagon_ruts',
      baseCount: profileCount('wagon_ruts', 24),
      geometry: new THREE.PlaneGeometry(1.9, 0.46),
      material: rutMaterial(),
      minScale: 0.72,
      maxScale: 1.4,
      baseY: 0.018,
      groundRotationX: -Math.PI / 2,
    },
    {
      id: 'claim_posts',
      baseCount: profileCount('claim_posts', 12),
      geometry: claimPostGeometry(),
      material: standardMaterial('#6f5732', 0.78),
      minScale: 0.82,
      maxScale: 1.1,
      baseY: 0,
    },
    {
      id: 'cactus',
      baseCount: profileCount('cactus', 0),
      geometry: cactusGeometry(),
      material: standardMaterial('#4f6f4a', 0.92),
      minScale: 0.74,
      maxScale: 1.25,
      baseY: 0,
    },
    {
      id: 'reeds',
      baseCount: profileCount('reeds', 0),
      geometry: reedGeometry(),
      material: new THREE.MeshStandardMaterial({
        color: '#566c42',
        roughness: 1,
        metalness: 0,
        side: THREE.DoubleSide,
      }),
      minScale: 0.72,
      maxScale: 1.42,
      baseY: 0.01,
    },
  ];
}

function profileCount(id: DetailClassId, fallback: number): number {
  return Math.max(0, Math.floor(SCATTER_DESCRIPTOR?.classCounts?.[id] ?? fallback));
}

function placeDetail(
  profile: DetailProfile,
  rng: Rng,
  placedInClass: readonly DetailInstance[],
): Omit<DetailInstance, 'hidden' | 'mesh' | 'index'> | null {
  const attempts = Math.max(40, profile.baseCount * 80);
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const x = rng.range(Terrain.bounds.minX + 1, Terrain.bounds.maxX - 1);
    const z = rng.range(Terrain.bounds.minZ + 1, Terrain.bounds.maxZ - 1);
    if (Terrain.sample(x, z).zone !== 'bank') continue;
    if (staticExcluded(x, z)) continue;
    if (rng.next() > detailAcceptance(profile, x, z)) continue;
    if (tooCloseToClass(x, z, placedInClass)) continue;

    const scale = rng.range(profile.minScale, profile.maxScale);
    return {
      x,
      z,
      y: Terrain.visualY(x, z, profile.baseY, 0.35),
      rotation: rng.range(0, Math.PI * 2),
      scale,
    };
  }
  return null;
}

function staticExcluded(x: number, z: number): boolean {
  if (Terrain.routingLaneDistance(x, z) < Balance.world.detailRoutingLaneClearRadius) return true;
  if (distanceSq(x, z, BUILD_PAD_PROBE.x, BUILD_PAD_PROBE.z) < Balance.world.detailBuildPadClearRadius ** 2) return true;
  for (const anchor of Terrain.nodeAnchors) {
    if (distanceSq(x, z, anchor.x, anchor.z) < Balance.world.detailHarvestAnchorClearRadius ** 2) return true;
  }
  return false;
}

function routingLaneDistance(x: number, z: number): number {
  return Terrain.routingLaneDistance(x, z);
}

function detailAcceptance(profile: DetailProfile, x: number, z: number): number {
  const feature = Terrain.terrainFeatureSample(x, z);
  const edge = Math.max(Math.abs(x) / Terrain.CLAIM_HALF, Math.abs(z) / Terrain.CLAIM_HALF);
  const lane = Math.min(1, routingLaneDistance(x, z) / 10);
  const base = 0.16 + edge * 0.74 + lane * 0.12;
  if (profile.id === 'cactus') {
    const dryEdge = smoothstep(7, 20, Math.abs(z)) * (1 - nearWaterMask(x, z));
    return THREE.MathUtils.clamp(base * dryEdge * (0.7 + feature.shelf * 1.2 + feature.bluff * 0.4), 0.04, 0.88);
  }
  if (profile.id === 'reeds') {
    const water = nearWaterMask(x, z);
    const bias = SCATTER_DESCRIPTOR?.nearWaterBias ?? 1;
    return THREE.MathUtils.clamp((0.14 + water * 1.6 * bias) * (0.7 + lane * 0.35), 0.02, 0.96);
  }
  const bias =
    profile.id === 'rocks'
      ? 0.42 + feature.shelf * 1.45 + feature.bluff * 0.55
      : profile.id === 'dry_grass'
        ? 0.58 + feature.pocket * 1.15 - feature.gully * 0.18
        : 0.76 + feature.pocket * 0.18;
  return THREE.MathUtils.clamp(base * bias, 0.08, 0.98);
}

function nearWaterMask(x: number, z: number): number {
  let mask = Terrain.hasRiverWater() ? 1 - smoothstep(0.8, 6.5, Math.max(0, Math.abs(z) - Terrain.RIVER_MAX_Z)) : 0;
  for (const source of Terrain.waterSources()) {
    mask = Math.max(mask, 1 - smoothstep(source.radius + 0.35, source.radius + 5.5, Math.hypot(x - source.x, z - source.z)));
  }
  return THREE.MathUtils.clamp(mask, 0, 1);
}

function tooCloseToClass(x: number, z: number, placed: readonly DetailInstance[]): boolean {
  for (const detail of placed) {
    if (distanceSq(x, z, detail.x, detail.z) < 0.7 * 0.7) return true;
  }
  return false;
}

function writeInstance(mesh: THREE.InstancedMesh, index: number, detail: DetailInstance | Omit<DetailInstance, 'mesh' | 'index'>, hidden: boolean): void {
  if (hidden) {
    mesh.setMatrixAt(index, hiddenMatrix);
    return;
  }
  const profile = profileForMesh(mesh);
  scratchObject.position.set(detail.x, detail.y, detail.z);
  if (profile?.groundRotationX !== undefined) {
    scratchObject.rotation.set(profile.groundRotationX, 0, detail.rotation);
  } else {
    scratchObject.rotation.set(0, detail.rotation, 0);
  }
  scratchObject.scale.setScalar(detail.scale);
  scratchObject.updateMatrix();
  mesh.setMatrixAt(index, scratchObject.matrix);
}

function profileForMesh(mesh: THREE.InstancedMesh): DetailProfile | undefined {
  return mesh.userData.detailProfile as DetailProfile | undefined;
}

function isNearAny(detail: DetailInstance, clearings: readonly DetailScatterClearPoint[]): boolean {
  for (const clearing of clearings) {
    if (distanceSq(detail.x, detail.z, clearing.x, clearing.z) < clearing.radius * clearing.radius) return true;
  }
  return false;
}

function probeClear(
  details: readonly DetailInstance[],
  x: number,
  z: number,
  clearRadius: number,
): DetailScatterProbe {
  let nearestSq = Number.POSITIVE_INFINITY;
  for (const detail of details) {
    if (detail.hidden) continue;
    nearestSq = Math.min(nearestSq, distanceSq(x, z, detail.x, detail.z));
  }
  const nearest = Number.isFinite(nearestSq) ? Math.sqrt(nearestSq) : null;
  return {
    x,
    z,
    clearRadius,
    nearest,
    clear: nearest === null || nearest >= clearRadius,
  };
}

function detailDensity(tier: DetailDensityTier): number {
  if (tier === 'off') return 0;
  const raw = tier === 'mobile-reduced' ? Balance.world.detailMobileDensity : Balance.world.detailDensity;
  return THREE.MathUtils.clamp(raw * (SCATTER_DESCRIPTOR?.density ?? 1), 0, 1.5);
}

function densityTier(): DetailDensityTier {
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 430;
  const density = mobile ? Balance.world.detailMobileDensity : Balance.world.detailDensity;
  if (density <= 0) return 'off';
  return mobile ? 'mobile-reduced' : 'desktop';
}

function scatterSeed(): number {
  const raw = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('seed');
  return (normalizeSeed(raw) ^ 0x51f15eed) >>> 0;
}

function distanceSq(ax: number, az: number, bx: number, bz: number): number {
  const dx = ax - bx;
  const dz = az - bz;
  return dx * dx + dz * dz;
}

function standardMaterial(color: string, roughness: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.02,
  });
}

function rockGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.DodecahedronGeometry(0.34, 0);
  geometry.scale(1.25, 0.55, 0.9);
  geometry.translate(0, 0.2, 0);
  return geometry;
}

function stumpGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(0.2, 0.28, 0.44, 7);
  geometry.translate(0, 0.22, 0);
  return geometry;
}

function claimPostGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.BoxGeometry(0.16, 1.08, 0.16);
  geometry.translate(0, 0.54, 0);
  return geometry;
}

function cactusGeometry(): THREE.BufferGeometry {
  const geometry = new THREE.CylinderGeometry(0.13, 0.18, 0.88, 7);
  geometry.translate(0, 0.44, 0);
  return geometry;
}

function reedGeometry(): THREE.BufferGeometry {
  const geometry = grassGeometry();
  geometry.scale(0.58, 1.24, 0.58);
  return geometry;
}

function grassGeometry(): THREE.BufferGeometry {
  const width = 0.32;
  const height = 0.58;
  const positions = [
    -width, 0, 0, width, 0, 0, -width, height, 0, width, height * 0.82, 0,
    0, 0, -width, 0, 0, width, 0, height * 0.88, -width, 0, height, width,
  ];
  const indices = [0, 1, 2, 2, 1, 3, 4, 5, 6, 6, 5, 7];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function rutMaterial(): THREE.MeshBasicMaterial {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'rgba(82, 54, 31, 0.34)';
    context.lineWidth = 8;
    for (const y of [22, 42]) {
      context.beginPath();
      for (let x = 0; x <= canvas.width; x += 16) {
        const wobble = Math.sin(x * 0.055 + y) * 2;
        if (x === 0) context.moveTo(x, y + wobble);
        else context.lineTo(x, y + wobble);
      }
      context.stroke();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 2;
  return new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    side: THREE.DoubleSide,
  });
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
