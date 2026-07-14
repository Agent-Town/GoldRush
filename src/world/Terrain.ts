import * as THREE from 'three';
import terrainContractText from '../../assets/layer-contracts/m1-core.layer-contract.v1.json?raw';
import { loadGeneratedTexture } from '../assets/generated';
import { palette } from '../assets/palette';
import { assetSlots, tagPlaceholder, type PlaceholderFactory } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import {
  activeTileDescriptor,
  activeWaterDescriptor,
  activeContract,
  type ContractGravelBar,
  type ContractWaterZone,
  type ContractStakeMarker,
  type ContractWaterSource,
} from '../meta/ContractFamilies';
import { hasElevationTile, isTraversable as isSimTraversable, simHeight } from '../sim/TileHeight';
import { normalizeSeed } from '../core/Rng';
import { createContinuousGroundMesh, type ContinuousGroundMeshStats } from './ContinuousGroundMesh';
import { createClaimProps } from './props';
import {
  createFordStones,
  createLivingWaterMaterial,
  dryWaterDiagnostics,
  updateWaterMaterial,
  waterDiagnostics,
  type WaterDiagnostics,
} from './Water';

export type TerrainZone = 'bank' | 'shallows' | 'river' | 'ford' | 'out';

export type Vec2 = {
  x: number;
  z: number;
};

export type TerrainSample = {
  walkable: boolean;
  speedMul: number;
  zone: TerrainZone;
  waterSource?: 'river' | 'spring_pond';
  waterDepth?: number;
  waterClass?: 'wade' | 'deep';
};

export type TerrainFeatureSample = {
  gully: number;
  shelf: number;
  bluff: number;
  pocket: number;
  routeMask: number;
  calmMask: number;
  heightOffset: number;
};

export type TerrainBounds = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type FordRange = {
  id: string;
  minX: number;
  maxX: number;
  centerX: number;
  halfWidth: number;
};

const ACTIVE_CONTRACT = activeContract();
const ACTIVE_TILE = activeTileDescriptor();
export const DEFAULT_CLAIM_SIZE = 64;
export const CLAIM_SIZE = ACTIVE_CONTRACT.tileParams.size ?? DEFAULT_CLAIM_SIZE;
export const CLAIM_HALF = CLAIM_SIZE / 2;
export const RIVER_MIN_Z = -5;
export const RIVER_MAX_Z = 5;
export const FORD_MIN_X = -3;
export const FORD_MAX_X = 3;
export const SHALLOWS_WIDTH = 1.25;
export const WATER_Y = 0.025;
export const VISTA_RADIUS = 90;

const ELEVATION_TILE = hasElevationTile();
const TILE_HEIGHTFIELD = ACTIVE_CONTRACT.tileParams.heightfield;
const AUTHORED_TERRAIN = ACTIVE_CONTRACT.tileParams.authoredTerrain;
let runtimeVisualHeightSource: ((x: number, z: number) => number) | null = null;
const TILE_PALETTE = ACTIVE_CONTRACT.tileParams.palette;
const TILE_WATER = activeWaterDescriptor();
const SPRING_PONDS = ACTIVE_CONTRACT.tileParams.waterSources.filter((source) => source.kind === 'spring_pond');
const FORD_RANGES = resolveFordRanges();
const DEFAULT_WATER_DEPTH: Record<ContractWaterZone, number> = {
  river: 1.25,
  ford: 0.35,
  shallows: 0.2,
  springPond: 0.2,
};
const DEFAULT_WATER_SPEED: Record<ContractWaterZone, number> = {
  river: 0.55,
  ford: 0.85,
  shallows: 0.8,
  springPond: 0.8,
};

export const bounds: TerrainBounds = {
  minX: -CLAIM_HALF,
  maxX: CLAIM_HALF,
  minZ: -CLAIM_HALF,
  maxZ: CLAIM_HALF,
};

function defaultFordRange(): FordRange {
  return {
    id: 'center-ford',
    minX: FORD_MIN_X,
    maxX: FORD_MAX_X,
    centerX: (FORD_MIN_X + FORD_MAX_X) / 2,
    halfWidth: (FORD_MAX_X - FORD_MIN_X) / 2,
  };
}

function resolveFordRanges(): FordRange[] {
  if (!ACTIVE_CONTRACT.tileParams.ford) return [];
  const ranges = ACTIVE_CONTRACT.tileParams.fords ?? [];
  if (ranges.length === 0) return [defaultFordRange()];
  return ranges.map((range) => ({
    id: range.id,
    minX: range.x - range.halfWidth,
    maxX: range.x + range.halfWidth,
    centerX: range.x,
    halfWidth: range.halfWidth,
  }));
}

function fordAt(x: number, z: number): FordRange | null {
  if (z < RIVER_MIN_Z || z > RIVER_MAX_Z) return null;
  return FORD_RANGES.find((range) => x >= range.minX && x <= range.maxX) ?? null;
}

const DEFAULT_NODE_ANCHORS: Vec2[] = [
  { x: -22, z: -6.8 },
  { x: -9, z: 6.7 },
  { x: -1.5, z: -6.4 },
  { x: 7.5, z: 6.5 },
  { x: 18, z: -7 },
  { x: 25, z: 6.9 },
];
export const nodeAnchors: Vec2[] = ACTIVE_CONTRACT.tileParams.harvestAnchors ?? DEFAULT_NODE_ANCHORS;

export function sample(x: number, z: number): TerrainSample {
  if (x < bounds.minX || x > bounds.maxX || z < bounds.minZ || z > bounds.maxZ) {
    return { walkable: false, speedMul: 0, zone: 'out' };
  }
  if (ELEVATION_TILE && !isSimTraversable(x, z)) return { walkable: false, speedMul: 0, zone: 'out' };

  const spring = springPondAt(x, z);
  if (spring) return waterSample('shallows', 'springPond', 'spring_pond');

  if (!ACTIVE_CONTRACT.tileParams.river) return { walkable: true, speedMul: 1, zone: 'bank' };

  const inFord = fordAt(x, z) !== null;
  if (ACTIVE_CONTRACT.tileParams.ford && inFord) return waterSample('ford', 'ford', 'river');

  const inRiver = z >= RIVER_MIN_Z && z <= RIVER_MAX_Z;
  if (inRiver) return waterSample('river', 'river', 'river');

  const inShallows =
    (z > RIVER_MAX_Z && z <= RIVER_MAX_Z + SHALLOWS_WIDTH) ||
    (z < RIVER_MIN_Z && z >= RIVER_MIN_Z - SHALLOWS_WIDTH);
  if (inShallows) return waterSample('shallows', 'shallows', 'river');

  return { walkable: true, speedMul: 1, zone: 'bank' };
}

export function waterDepth(zone: ContractWaterZone): number {
  return TILE_WATER?.depths?.[zone] ?? DEFAULT_WATER_DEPTH[zone];
}

function waterSpeedMul(zone: ContractWaterZone): number {
  return TILE_WATER?.speedMul?.[zone] ?? DEFAULT_WATER_SPEED[zone];
}

function waterSample(zone: Exclude<TerrainZone, 'bank' | 'out'>, depthZone: ContractWaterZone, waterSource: 'river' | 'spring_pond'): TerrainSample {
  const depth = waterDepth(depthZone);
  const deep = depth >= Balance.terrainSim.deepDepth;
  const walkable = depth <= Balance.terrainSim.wadeDepth || (deep && TILE_WATER?.heroCanWadeDeep === true && ACTIVE_TILE.id === 'frontier-river-claim');
  return {
    walkable,
    speedMul: walkable ? waterSpeedMul(depthZone) : 0,
    zone,
    waterSource,
    waterDepth: depth,
    waterClass: deep ? 'deep' : 'wade',
  };
}

export function spawnEdges(): Vec2[] {
  return [
    { x: 0, z: bounds.minZ },
    { x: 0, z: bounds.maxZ },
    { x: bounds.maxX, z: 0 },
    { x: bounds.minX, z: 0 },
  ];
}

export function isBuildable(x: number, z: number): boolean {
  if (sample(x, z).zone !== 'bank') return false;
  const zones = ACTIVE_CONTRACT.tileParams.buildZones ?? [];
  return zones.length === 0 || zones.some((zone) => x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ);
}

export function riverGeometry(): { minX: number; maxX: number; minZ: number; maxZ: number } {
  return {
    minX: bounds.minX,
    maxX: bounds.maxX,
    minZ: RIVER_MIN_Z,
    maxZ: RIVER_MAX_Z,
  };
}

export function waterSources(): readonly ContractWaterSource[] {
  return SPRING_PONDS;
}

export function fordRanges(): readonly FordRange[] {
  return FORD_RANGES;
}

export function nearestFordRange(x: number): FordRange {
  let best = FORD_RANGES[0] ?? defaultFordRange();
  let bestDistance = Math.abs(x - best.centerX);
  for (const range of FORD_RANGES.slice(1)) {
    const distance = Math.abs(x - range.centerX);
    if (distance < bestDistance) {
      best = range;
      bestDistance = distance;
    }
  }
  return best;
}

export function stakeMarkers(): readonly ContractStakeMarker[] {
  return ACTIVE_CONTRACT.tileParams.stakeMarkers ?? [];
}

export function lossStakeMarker(): ContractStakeMarker | null {
  return stakeMarkers().find((marker) => marker.lossCondition) ?? null;
}

export function hasRiverWater(): boolean {
  return ACTIVE_CONTRACT.tileParams.river;
}

export function isWaterSourceAdjacent(x: number, z: number, pad: number): boolean {
  const terrain = sample(x, z);
  if (terrain.zone !== 'bank' && terrain.zone !== 'shallows') return false;
  if (ACTIVE_CONTRACT.tileParams.river) {
    const river = riverGeometry();
    if (x >= river.minX && x <= river.maxX) {
      const distance = z < river.minZ ? river.minZ - z : z > river.maxZ ? z - river.maxZ : 0;
      if (distance <= pad) return true;
    }
  }
  return SPRING_PONDS.some((source) => distanceToSpringEdge(x, z, source) <= pad);
}

export function sampleHeight(x: number, z: number): number {
  if (runtimeVisualHeightSource) {
    return runtimeVisualHeightSource(THREE.MathUtils.clamp(x, bounds.minX, bounds.maxX), THREE.MathUtils.clamp(z, bounds.minZ, bounds.maxZ));
  }
  const base = ELEVATION_TILE
    ? simHeight(x, z)
    : sampleHeightFamily(THREE.MathUtils.clamp(x, bounds.minX, bounds.maxX), THREE.MathUtils.clamp(z, bounds.minZ, bounds.maxZ), false);
  return AUTHORED_TERRAIN ? base + authoredTerrainDelta(x, z) : base;
}

export function sampleUnclampedHeight(x: number, z: number): number {
  if (runtimeVisualHeightSource && x >= bounds.minX && x <= bounds.maxX && z >= bounds.minZ && z <= bounds.maxZ) {
    return runtimeVisualHeightSource(x, z);
  }
  const base = ELEVATION_TILE ? simHeight(x, z) : sampleHeightFamily(x, z, true);
  return AUTHORED_TERRAIN ? base + authoredTerrainDelta(x, z) : base;
}

export function installVisualHeightSource(source: (x: number, z: number) => number): () => void {
  runtimeVisualHeightSource = source;
  return () => {
    if (runtimeVisualHeightSource === source) runtimeVisualHeightSource = null;
  };
}

function authoredTerrainDelta(x: number, z: number): number {
  if (!AUTHORED_TERRAIN) return 0;
  const gridX = (x - AUTHORED_TERRAIN.originX) / AUTHORED_TERRAIN.cellSize;
  const gridZ = (z - AUTHORED_TERRAIN.originZ) / AUTHORED_TERRAIN.cellSize;
  if (gridX < 0 || gridZ < 0 || gridX > AUTHORED_TERRAIN.columns - 1 || gridZ > AUTHORED_TERRAIN.rows - 1) return 0;

  const x0 = Math.floor(gridX);
  const z0 = Math.floor(gridZ);
  const x1 = Math.min(x0 + 1, AUTHORED_TERRAIN.columns - 1);
  const z1 = Math.min(z0 + 1, AUTHORED_TERRAIN.rows - 1);
  const at = (column: number, row: number) => AUTHORED_TERRAIN.heightDeltas[row * AUTHORED_TERRAIN.columns + column]!;
  const north = THREE.MathUtils.lerp(at(x0, z0), at(x1, z0), gridX - x0);
  const south = THREE.MathUtils.lerp(at(x0, z1), at(x1, z1), gridX - x0);
  return THREE.MathUtils.lerp(north, south, gridZ - z0);
}

export function routingLaneDistance(x: number, z: number): number {
  const fordApproach = Math.abs(x - nearestFordRange(x).centerX);
  const claimLane = Math.abs(x) < 18 ? Math.abs(z - 12) : Number.POSITIVE_INFINITY;
  return Math.min(fordApproach, claimLane);
}

export function terrainFeatureSample(x: number, z: number): TerrainFeatureSample {
  return terrainFeatures(x, z);
}

function sampleHeightFamily(x: number, z: number, vistaRise: boolean): number {
  const absZ = Math.abs(z);
  const bankDistance = Math.max(0, absZ - RIVER_MAX_Z);
  const bankT = smoothstep(0, 15, bankDistance);
  const valley = THREE.MathUtils.lerp(-0.16, 0.36, bankT);
  const southRise = z < RIVER_MIN_Z ? smoothstep(0, CLAIM_HALF - Math.abs(RIVER_MIN_Z), Math.abs(z) - Math.abs(RIVER_MIN_Z)) * 0.14 : 0;
  const vistaBankRise = vistaRise ? smoothstep(CLAIM_HALF, VISTA_RADIUS, absZ) * 0.42 : 0;
  const claimCalm =
    z > RIVER_MAX_Z + SHALLOWS_WIDTH && z < 23 && Math.abs(x) < 24
      ? THREE.MathUtils.lerp(0.42, 1, smoothstep(0, 24, Math.abs(x)))
      : 1;
  const riverNoiseMask = THREE.MathUtils.lerp(0.28, 1, smoothstep(RIVER_MAX_Z - 0.5, RIVER_MAX_Z + 4, absZ));
  const noise =
    (valueNoise(x * 0.065, z * 0.065) - 0.5) * 0.32 +
    (valueNoise(x * 0.17 + 41.7, z * 0.17 - 13.2) - 0.5) * 0.16 +
    (valueNoise(x * 0.34 - 9.1, z * 0.34 + 27.4) - 0.5) * 0.06;
  const features = terrainFeatures(x, z);
  const legacyMaxHeight = vistaRise && absZ > CLAIM_HALF ? 1.05 : 0.62;
  const baseHeight = THREE.MathUtils.clamp(
    (valley + southRise + vistaBankRise + noise * claimCalm * riverNoiseMask) * Balance.world.terrainRelief,
    -0.18,
    legacyMaxHeight,
  );
  const maxHeight = vistaRise && absZ > CLAIM_HALF ? 1.46 : 1.18;
  const minHeight = TILE_HEIGHTFIELD ? -0.52 : -0.38;
  return THREE.MathUtils.clamp(baseHeight + features.heightOffset + contractHeightfieldOffset(x, z), minHeight, maxHeight);
}

export function samplePaddedHeight(x: number, z: number, radius = 0): number {
  if (radius <= 0.01) return sampleHeight(x, z);
  const r = Math.max(0.25, radius * 0.65);
  return (
    sampleHeight(x, z) * 2 +
    sampleHeight(x - r, z) +
    sampleHeight(x + r, z) +
    sampleHeight(x, z - r) +
    sampleHeight(x, z + r)
  ) / 6;
}

export function visualY(x: number, z: number, base = 0, padRadius = 0): number {
  return samplePaddedHeight(x, z, padRadius) + base;
}

export function heightDiagnostics(): {
  min: number;
  max: number;
  segments: number;
  waterY: number;
  probes: Record<string, number>;
  natural: {
    range: number;
    fordApproachDelta: number;
    routingLaneDelta: number;
    routingFeatureMax: number;
    probes: Record<'gully' | 'shelf' | 'bluff' | 'pocket', number>;
    features: Record<'gully' | 'shelf' | 'bluff' | 'pocket', TerrainFeatureSample>;
  };
} {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let z = bounds.minZ; z <= bounds.maxZ; z += 4) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 4) {
      const height = sampleHeight(x, z);
      min = Math.min(min, height);
      max = Math.max(max, height);
    }
  }
  const naturalProbes = {
    gully: sampleHeight(14, -14),
    shelf: sampleHeight(23, -20),
    bluff: sampleHeight(29, 29),
    pocket: sampleHeight(-22, 20),
  };
  const fordBand = [-2, 0, 2].flatMap((x) => [sampleHeight(x, RIVER_MAX_Z + SHALLOWS_WIDTH), sampleHeight(x, RIVER_MIN_Z - SHALLOWS_WIDTH)]);
  const fordApproachDelta = Math.max(...fordBand) - Math.min(...fordBand);
  const laneSamples = [-28, -18, -8, 8, 18, 28].map((z) => sampleHeight(0, z));
  const routingLaneDelta = Math.max(...laneSamples) - Math.min(...laneSamples);
  const routingFeatureMax = Math.max(...[-28, -18, -8, 8, 18, 28].map((z) => Math.abs(terrainFeatureSample(0, z).heightOffset)));
  return {
    min,
    max,
    segments: terrainSegments(),
    waterY: WATER_Y,
    probes: {
      heroStart: sampleHeight(0, 12),
      river: sampleHeight(-12, 0),
      ford: sampleHeight(0, 0),
      nearBank: sampleHeight(12, RIVER_MAX_Z + SHALLOWS_WIDTH),
      farBank: sampleHeight(12, -18),
    },
    natural: {
      range: max - min,
      fordApproachDelta,
      routingLaneDelta,
      routingFeatureMax,
      probes: naturalProbes,
      features: {
        gully: terrainFeatureSample(14, -14),
        shelf: terrainFeatureSample(23, -20),
        bluff: terrainFeatureSample(29, 29),
        pocket: terrainFeatureSample(-22, 20),
      },
    },
  };
}

export type VistaDiagnostics = {
  present: boolean;
  segments: number;
  radius: number;
  vertices: number;
  seamMaxDelta: number;
  seam: Array<{ x: number; z: number; clamped: number; unclamped: number; delta: number }>;
  river: {
    present: boolean;
    drawCalls: 0 | 1;
    radius: number;
    vertices: number;
    visualHalfWidth: number;
    fadeStart: number;
    westEdgeCenterZ: number;
    eastEdgeCenterZ: number;
    westFarCenterZ: number;
    eastFarCenterZ: number;
    meanderAmplitude: number;
  };
};

export function vistaDiagnostics(): VistaDiagnostics {
  const seam = vistaSeamProbePoints().map((point) => {
    const clamped = sampleHeight(point.x, point.z);
    const unclamped = sampleUnclampedHeight(point.x, point.z);
    const delta = Math.abs(clamped - unclamped);
    return { ...point, clamped, unclamped, delta };
  });
  return {
    present: true,
    segments: vistaSegments(),
    radius: VISTA_RADIUS,
    vertices: vistaVertexCount(),
    seamMaxDelta: Math.max(...seam.map((entry) => entry.delta)),
    seam,
    river: vistaRiverDiagnostics(),
  };
}

export type TerrainView = {
  group: THREE.Group;
  update: (delta: number) => void;
  diagnostics: () => WaterDiagnostics;
  groundDiagnostics: () => TerrainGroundDiagnostics;
};

export type TerrainGroundDiagnostics =
  | ContinuousGroundMeshStats
  | {
      enabled: false;
      mode: 'fallback';
      drawCalls: 1;
      segments: number;
      vertexStep: number;
      vertices: number;
      triangles: number;
      heightSource: 'visual';
      textureSource: 'bank-atlas';
      textureSeams: 'texture seams remain until TR-02';
    };

type LayerContract = {
  slots?: Array<{
    file?: string;
    slot?: string;
    variants?: string[];
  }>;
};

type TerrainShaderUniforms = {
  repeat: THREE.IUniform<number>;
  variantCount: THREE.IUniform<number>;
  atlasRows: THREE.IUniform<number>;
  featureMix: THREE.IUniform<number>;
  seed: THREE.IUniform<number>;
  splat: THREE.IUniform<number>;
  slopeShade: THREE.IUniform<number>;
  rockAmount: THREE.IUniform<number>;
  dampBand: THREE.IUniform<number>;
  scrubAmount: THREE.IUniform<number>;
  macroWarmth: THREE.IUniform<number>;
  antiTile: THREE.IUniform<number>;
  paletteTint: THREE.IUniform<THREE.Vector3>;
  dampTint: THREE.IUniform<THREE.Vector3>;
  dampAmount: THREE.IUniform<number>;
};

type TerrainSplatParams = {
  rockAmount: number;
  dampBand: number;
  scrubAmount: number;
  macroWarmth: number;
  antiTile: number;
};

const BANK_TILE_REPEATS = 4;
const BANK_VARIANT_FILES = terrainBankVariantFiles();
// Lazy glob (NOT eager): eager would compile to static imports of every
// processed png, making each one a boot-time module dependency in dev — a
// single failed/blocked asset request would then kill the whole app instead
// of falling back to placeholders (gate finding, s11: visual-polish-assets
// fallback test). Lazy keeps asset fetches out of the module graph.
const processedTextureUrls = import.meta.glob<string>(
  ['../../assets/processed/terrain-*.png', '../../assets/processed/ter-*.png', '../../assets/processed/prop-spring-pond.png'],
  {
    query: '?url',
    import: 'default',
  },
);
const processedTextureUrlsByFile = new Map(
  Object.entries(processedTextureUrls).map(([path, urlLoader]) => [path.split('/').pop() ?? path, urlLoader]),
);
const textureLoader = new THREE.TextureLoader();

const bankMaterial = new THREE.MeshStandardMaterial({
  color: palette.sand,
  roughness: 0.86,
  metalness: 0.01,
});

export const createBankPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(createBankGeometry(), createBankMaterial());
    mesh.name = 'TerrainReliefMesh';
    mesh.userData.terrainRelief = true;
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return tagPlaceholder(mesh, assetSlots.terrainBank);
  },
  { slotId: assetSlots.terrainBank },
);

export const createRiverPlaceholder: PlaceholderFactory<THREE.Mesh> = Object.assign(
  () => {
    const mesh = new THREE.Mesh(createExtendedRiverGeometry(), createLivingWaterMaterial(waterMaterialConfig(false)));
    mesh.userData.visualHalfWidth = visualWaterWidth() / 2;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = WATER_Y;
    mesh.renderOrder = RenderLayers.terrain;
    mesh.receiveShadow = true;
    return tagPlaceholder(mesh, assetSlots.terrainRiver);
  },
  { slotId: assetSlots.terrainRiver },
);

export function createFordPlaceholder(range: FordRange = defaultFordRange()): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(range.maxX - range.minX, visualWaterWidth(), 1, 1),
    createLivingWaterMaterial(waterMaterialConfig(true, range)),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(range.centerX, WATER_Y + 0.015, 0);
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.receiveShadow = true;
  return tagPlaceholder(mesh, assetSlots.terrainFord);
}

export function createTerrainView(): TerrainView {
  const group = new THREE.Group();
  const bank = createGroundMesh();
  const vistaBank = createVistaBankMesh(bank.material as THREE.MeshStandardMaterial);
  const props = createClaimProps();
  const springPonds = createSpringPonds();
  for (const prop of props.children) prop.position.y = visualY(prop.position.x, prop.position.z, 0, 0.7);
  group.add(vistaBank, bank);

  let river: THREE.Mesh | null = null;
  const fords: THREE.Mesh[] = [];
  const fordStones: THREE.InstancedMesh[] = [];
  const gravelBars: THREE.Mesh[] = [];
  if (ACTIVE_CONTRACT.tileParams.river) {
    river = createRiverPlaceholder();
    for (const range of FORD_RANGES) {
      const ford = createFordPlaceholder(range);
      const stones = createFordStones(WATER_Y, range.centerX);
      fords.push(ford);
      fordStones.push(stones);
    }
    gravelBars.push(...createGravelBars());
    group.add(river, ...fords, ...fordStones, ...gravelBars);
  }

  group.add(springPonds, props);

  return {
    group,
    update: (delta: number) => {
      syncBankMaterial(bank);
      if (river) updateWaterMaterial(river, delta);
      for (const ford of fords) updateWaterMaterial(ford, delta);
    },
    diagnostics: () => (river ? waterDiagnostics(river, fords, fordStones, gravelBars) : dryWaterDiagnostics(SPRING_PONDS.length)),
    groundDiagnostics: () => groundDiagnostics(bank),
  };
}

function createGroundMesh(): THREE.Mesh {
  const splat = terrainSplatEnabled();
  const meshEnabled = terrainMeshEnabled() || splat;
  if (!meshEnabled) return createBankPlaceholder();
  const mesh = createContinuousGroundMesh({
    size: CLAIM_SIZE,
    segments: terrainMeshSegments(),
    material: createBankMaterial(splat),
    heightAt: sampleHeight,
    normalHeightAt: sampleUnclampedHeight,
  });
  if (splat) {
    const stats = mesh.userData.groundStats as ContinuousGroundMeshStats | undefined;
    if (stats) {
      stats.textureSource = 'bank-atlas-splat';
      stats.textureSeams = 'per-pixel splat gradients';
    }
  }
  return tagPlaceholder(mesh, assetSlots.terrainBank);
}

function createGravelBars(): THREE.Mesh[] {
  return (TILE_WATER?.gravelBars ?? []).map(createGravelBar);
}

function createGravelBar(bar: ContractGravelBar): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(0.5, 36),
    new THREE.MeshStandardMaterial({
      color: '#a99573',
      roughness: 0.94,
      metalness: 0.01,
    }),
  );
  mesh.name = `RiverGravelBar.${bar.id}`;
  mesh.rotation.set(-Math.PI / 2, 0, bar.rotation);
  mesh.position.set(bar.x, WATER_Y + 0.03, bar.z);
  mesh.scale.set(bar.length, bar.width, 1);
  mesh.renderOrder = RenderLayers.groundDecals;
  mesh.receiveShadow = true;
  return mesh;
}

function createSpringPonds(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SpringPonds';
  for (const source of SPRING_PONDS) group.add(createSpringPond(source));
  return group;
}

function createSpringPond(source: ContractWaterSource): THREE.Group {
  const group = new THREE.Group();
  group.name = 'SpringPond';
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: '#416f6e',
    transparent: true,
    opacity: 0.86,
    roughness: 0.42,
    metalness: 0.01,
  });
  const water = new THREE.Mesh(new THREE.CircleGeometry(source.radius, 48), waterMaterial);
  water.name = 'SpringPondPlaceholder';
  water.rotation.x = -Math.PI / 2;
  water.position.set(source.x, visualY(source.x, source.z, WATER_Y + 0.02, source.radius), source.z);
  water.renderOrder = RenderLayers.groundDecals;
  group.add(water);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(source.radius * 0.96, source.radius * 1.35, 48),
    new THREE.MeshBasicMaterial({ color: '#3f4a36', transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
  );
  ring.name = 'SpringPondDampRing';
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(water.position);
  ring.position.y -= 0.004;
  ring.renderOrder = RenderLayers.groundDecals;
  group.add(ring);

  const reeds = createPondReeds(source);
  group.add(reeds);

  const urlLoader = processedTextureUrlsByFile.get('prop-spring-pond.png');
  if (urlLoader) {
    void urlLoader().then((url) => {
      textureLoader.load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        waterMaterial.map = texture;
        waterMaterial.needsUpdate = true;
      });
    });
  }
  return group;
}

function createPondReeds(source: ContractWaterSource): THREE.InstancedMesh {
  const count = 14;
  const mesh = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.025, 0.035, 0.42, 5),
    new THREE.MeshStandardMaterial({ color: '#5c6742', roughness: 0.9 }),
    count,
  );
  mesh.name = 'SpringPondReeds';
  mesh.renderOrder = RenderLayers.gameplay;
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  for (let index = 0; index < count; index += 1) {
    const angle = index * 2.399963 + 0.3;
    const radius = source.radius * (1.05 + ((index * 37) % 5) * 0.035);
    const x = source.x + Math.cos(angle) * radius;
    const z = source.z + Math.sin(angle) * radius;
    position.set(x, visualY(x, z, 0.24), z);
    rotation.setFromEuler(new THREE.Euler(0.12 * Math.sin(angle), angle, 0.18 * Math.cos(angle)));
    scale.setScalar(0.78 + ((index * 19) % 7) * 0.05);
    matrix.compose(position, rotation, scale);
    mesh.setMatrixAt(index, matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  return mesh;
}

function springPondAt(x: number, z: number): ContractWaterSource | null {
  return SPRING_PONDS.find((source) => distanceToSpringCenter(x, z, source) <= source.radius) ?? null;
}

function distanceToSpringEdge(x: number, z: number, source: ContractWaterSource): number {
  return Math.max(0, distanceToSpringCenter(x, z, source) - source.radius);
}

function distanceToSpringCenter(x: number, z: number, source: ContractWaterSource): number {
  return Math.hypot(x - source.x, z - source.z);
}

function createBankMaterial(splat = false): THREE.MeshStandardMaterial {
  const material = bankMaterial.clone();
  const splatParams = terrainSplatParams();
  const liteAntiTile = performanceTierDiagnostics().tier === 'lite';
  const antiTileDisabled = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('terrainSeamless') === '0';
  const uniforms: TerrainShaderUniforms = {
    repeat: { value: BANK_TILE_REPEATS },
    variantCount: { value: 1 },
    atlasRows: { value: 1 },
    featureMix: { value: Balance.terrain.featureMix },
    seed: { value: terrainSeed() },
    splat: { value: splat ? 1 : 0 },
    slopeShade: { value: terrainSlopeShade() },
    rockAmount: { value: splatParams.rockAmount },
    dampBand: { value: splatParams.dampBand },
    scrubAmount: { value: splatParams.scrubAmount },
    macroWarmth: { value: splatParams.macroWarmth },
    antiTile: { value: antiTileDisabled ? 0 : splatParams.antiTile },
    paletteTint: { value: paletteVector(TILE_PALETTE?.tint, [1, 1, 1]) },
    dampTint: { value: paletteVector(TILE_PALETTE?.dampTint, [0.4, 0.37, 0.29]) },
    dampAmount: { value: TILE_PALETTE?.dampAmount ?? 0.28 },
  };
  material.map = createBankTexture();
  configureBankAtlas(material.map);
  material.userData.terrainUniforms = uniforms;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.terrainRepeat = uniforms.repeat;
    shader.uniforms.terrainVariantCount = uniforms.variantCount;
    shader.uniforms.terrainAtlasRows = uniforms.atlasRows;
    shader.uniforms.terrainFeatureMix = uniforms.featureMix;
    shader.uniforms.terrainSeed = uniforms.seed;
    shader.uniforms.terrainSplat = uniforms.splat;
    shader.uniforms.terrainSlopeShade = uniforms.slopeShade;
    shader.uniforms.terrainRockAmount = uniforms.rockAmount;
    shader.uniforms.terrainDampBand = uniforms.dampBand;
    shader.uniforms.terrainScrubAmount = uniforms.scrubAmount;
    shader.uniforms.terrainMacroWarmth = uniforms.macroWarmth;
    shader.uniforms.terrainAntiTile = uniforms.antiTile;
    shader.uniforms.terrainPaletteTint = uniforms.paletteTint;
    shader.uniforms.terrainDampTint = uniforms.dampTint;
    shader.uniforms.terrainDampAmount = uniforms.dampAmount;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vTerrainUv;\nvarying vec2 vTerrainWorld;\nvarying float vTerrainSlope;')
      .replace(
        '#include <uv_vertex>',
        '#include <uv_vertex>\nvTerrainUv = uv;\nvTerrainWorld = (modelMatrix * vec4(position, 1.0)).xz;\nvTerrainSlope = clamp((1.0 - abs(normal.z)) * 8.0, 0.0, 1.0);',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
uniform float terrainRepeat;
uniform float terrainVariantCount;
uniform float terrainAtlasRows;
uniform float terrainFeatureMix;
uniform float terrainSeed;
uniform float terrainSplat;
uniform float terrainSlopeShade;
uniform float terrainRockAmount;
uniform float terrainDampBand;
uniform float terrainScrubAmount;
uniform float terrainMacroWarmth;
uniform float terrainAntiTile;
uniform vec3 terrainPaletteTint;
uniform vec3 terrainDampTint;
uniform float terrainDampAmount;
varying vec2 vTerrainUv;
varying vec2 vTerrainWorld;
varying float vTerrainSlope;

float terrainHash(vec2 p) {
  p += terrainSeed * vec2(37.2, 19.7);
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float terrainValueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = terrainHash(i);
  float b = terrainHash(i + vec2(1.0, 0.0));
  float c = terrainHash(i + vec2(0.0, 1.0));
  float d = terrainHash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float terrainVistaRiverCenterZ(float worldX) {
  float side = worldX < 0.0 ? -1.0 : 1.0;
  float outside = max(0.0, abs(worldX) - ${CLAIM_HALF.toFixed(3)});
  float dx = worldX - side * ${CLAIM_HALF.toFixed(3)};
  float ramp = smoothstep(0.0, 18.0, outside);
  return ramp * (sin(dx * 0.065) * 2.6 + sin(dx * 0.137) * 0.8);
}

float terrainShoreDistance(vec2 worldPos) {
  return max(0.0, abs(worldPos.y - terrainVistaRiverCenterZ(worldPos.x)) - ${RIVER_MAX_Z.toFixed(3)});
}

vec2 terrainOrientUv(vec2 tileUv, vec2 cell) {
  if (terrainHash(cell + vec2(11.0, 3.0)) < 0.5) tileUv.x = 1.0 - tileUv.x;
  float rotation = floor(terrainHash(cell + vec2(5.0, 17.0)) * 4.0);
  if (rotation < 0.5) return tileUv;
  if (rotation < 1.5) return vec2(tileUv.y, 1.0 - tileUv.x);
  if (rotation < 2.5) return vec2(1.0 - tileUv.x, 1.0 - tileUv.y);
  return vec2(1.0 - tileUv.y, tileUv.x);
}

float terrainVariant(vec2 cell, vec2 salt) {
  float variantCount = max(1.0, terrainVariantCount);
  return min(floor(terrainHash(cell + salt) * variantCount), variantCount - 1.0);
}

float terrainGullyMask(vec2 worldPos) {
  float bankDistance = terrainShoreDistance(worldPos);
  float bankMask = smoothstep(2.0, 8.0, bankDistance) * (1.0 - smoothstep(18.0, 30.0, bankDistance));
  float warpedX = worldPos.x + sin(worldPos.y * 0.19) * 3.0 + sin(worldPos.y * 0.061) * 6.0;
  float cell = floor((warpedX + 6.5) / 13.0);
  float center = cell * 13.0 - 6.5 + sin(bankDistance * 0.8 + cell) * 2.0;
  float channel = 1.0 - smoothstep(0.6, 2.3, abs(warpedX - center));
  float lane = smoothstep(4.6, 9.6, min(abs(worldPos.x), abs(worldPos.y - 12.0)));
  float ford = smoothstep(4.0, 9.0, length(worldPos));
  return channel * bankMask * lane * ford;
}`)
      .replace('#include <map_pars_fragment>', `#include <map_pars_fragment>
vec4 terrainAtlasSample(vec2 tileUv, float variant) {
  float atlasRow = max(1.0, terrainAtlasRows) - 1.0 - variant;
  vec2 atlasUv = vec2(tileUv.x, (clamp(tileUv.y, 0.001, 0.999) + atlasRow) / max(1.0, terrainAtlasRows));
  return texture2D(map, atlasUv);
}

vec4 terrainLayerSample(vec2 repeatedUv, float scale, vec2 salt) {
  vec2 layerKey = floor(vec2(terrainSeed * 31.0, terrainSeed * 47.0) + salt);
  vec2 offset = vec2(terrainHash(layerKey + 17.0), terrainHash(layerKey + 53.0));
  vec2 tileUv = terrainOrientUv(fract(repeatedUv * scale + offset), layerKey);
  return terrainAtlasSample(tileUv, terrainVariant(layerKey, salt));
}`)
      .replace('#include <map_fragment>', `
#ifdef USE_MAP
  vec2 repeatedUv = vTerrainUv * terrainRepeat;
  vec4 packedSand = terrainLayerSample(repeatedUv, 1.0, vec2(23.0, 29.0));
  vec4 dryDirt = terrainLayerSample(repeatedUv, 0.73, vec2(43.0, 61.0));
  vec4 scrub = terrainLayerSample(repeatedUv, 1.21, vec2(89.0, 31.0));
  vec4 wideSand = terrainLayerSample(repeatedUv, 0.47, vec2(7.0, 101.0));
  ${liteAntiTile ? '' : `
  vec4 wideDirt = terrainLayerSample(repeatedUv, 0.36, vec2(109.0, 5.0));`}
  float antiTileMix = clamp(terrainAntiTile, 0.0, 1.0);
  ${liteAntiTile ? `
  float antiTileNoise = smoothstep(0.18, 0.86, terrainValueNoise(vTerrainWorld * 0.105 + terrainSeed * 67.0));
  packedSand = mix(packedSand, wideSand, antiTileMix * antiTileNoise);
  dryDirt = mix(dryDirt, wideSand, antiTileMix * (1.0 - antiTileNoise) * 0.55);` : `
  packedSand = mix(packedSand, wideSand, antiTileMix * smoothstep(0.18, 0.86, terrainValueNoise(vTerrainWorld * 0.11 + terrainSeed * 67.0)));
  dryDirt = mix(dryDirt, wideDirt, antiTileMix * smoothstep(0.24, 0.82, terrainValueNoise(vTerrainWorld * 0.095 - terrainSeed * 43.0)));`}
  float dirtBlend = smoothstep(0.22, 0.78, terrainValueNoise(vTerrainWorld * 0.075 + terrainSeed * 17.0));
  float shoreDistance = terrainShoreDistance(vTerrainWorld);
  float shoreBand = 1.0 - smoothstep(1.1, 8.0, shoreDistance);
  float scrubBlend = shoreBand * smoothstep(0.42, 0.88, terrainValueNoise(vTerrainWorld * 0.22 + terrainSeed * 31.0));
  vec4 sampledDiffuseColor = mix(packedSand, dryDirt, dirtBlend * 0.48);
  sampledDiffuseColor = mix(sampledDiffuseColor, scrub, scrubBlend * 0.24);
  float rockBlend = smoothstep(0.10, 0.72, vTerrainSlope) * (0.55 + terrainValueNoise(vTerrainWorld * 0.18 + terrainSeed * 47.0) * 0.45);
  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, mix(dryDirt.rgb, vec3(0.47, 0.44, 0.37), 0.46), rockBlend * terrainSlopeShade);
  float dampGully = terrainGullyMask(vTerrainWorld) * (1.0 - smoothstep(4.0, 22.0, shoreDistance));
  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, terrainDampTint, dampGully * terrainDampAmount);
  float dampWeight = max(
    (1.0 - smoothstep(max(0.35, terrainDampBand * 0.38), max(0.7, terrainDampBand), shoreDistance)) * terrainDampAmount,
    dampGully * terrainDampAmount
  );
  float reliefNoise = smoothstep(0.32, 0.92, terrainValueNoise(vTerrainWorld * 0.16 + terrainSeed * 53.0));
  float rockWeight = clamp((rockBlend + dampGully * 0.55 + reliefNoise * 0.16) * terrainRockAmount, 0.0, 0.88);
  float scrubWeight = clamp((scrubBlend + shoreBand * 0.18) * terrainScrubAmount, 0.0, 0.72);
  float dirtWeight = clamp(0.22 + dirtBlend * 0.34 + rockWeight * 0.18, 0.0, 0.72);
  float sandWeight = max(0.18, 1.0 - dampWeight * 0.58 - rockWeight * 0.48 - scrubWeight * 0.28 - dirtWeight * 0.18);
  float fineGrain = terrainValueNoise(vTerrainWorld * 0.82 + terrainSeed * 131.0) * 2.0 - 1.0;
  float pebbleGrain = terrainValueNoise(vTerrainWorld * 1.75 - terrainSeed * 91.0) * 2.0 - 1.0;
  vec3 sandLayer = mix(packedSand.rgb, vec3(0.68, 0.49, 0.255), 0.42) * (1.0 + fineGrain * 0.045 + pebbleGrain * 0.022);
  vec3 dirtLayer = mix(dryDirt.rgb, vec3(0.55, 0.37, 0.185), 0.42) * (1.0 + fineGrain * 0.052 - pebbleGrain * 0.018);
  vec3 dampLayer = mix(dirtLayer, terrainDampTint, 0.72);
  vec3 rockLayer = mix(dirtLayer, vec3(0.46, 0.415, 0.34), 0.66);
  vec3 scrubLayer = mix(scrub.rgb, vec3(0.255, 0.305, 0.17), 0.32) * (1.0 + pebbleGrain * 0.026);
  vec3 atlasGrain = mix(packedSand.rgb, dryDirt.rgb, 0.48);
  atlasGrain = mix(atlasGrain, scrub.rgb, scrubWeight * 0.28);
  float atlasLuma = dot(atlasGrain, vec3(0.299, 0.587, 0.114));
  float atlasDetail = mix(1.0, clamp(atlasLuma * 1.25, 0.86, 1.14), 0.16 * clamp(terrainAntiTile, 0.0, 1.0));
  float weightTotal = max(0.001, sandWeight + dirtWeight + dampWeight + rockWeight + scrubWeight);
  vec3 splatColor = (
    sandLayer * sandWeight +
    dirtLayer * dirtWeight +
    dampLayer * dampWeight +
    rockLayer * rockWeight +
		scrubLayer * scrubWeight
	  ) / weightTotal * atlasDetail;
	  vec3 splatMood = clamp(vec3(
	    1.0 + (terrainMacroWarmth - 0.75) * 0.16 - terrainScrubAmount * 0.04,
	    1.0 - (terrainMacroWarmth - 0.75) * 0.06 + terrainScrubAmount * 0.10,
	    1.0 - (terrainMacroWarmth - 0.75) * 0.18 + (terrainDampBand - 3.0) * 0.012
	  ), vec3(0.82), vec3(1.2));
	  splatColor *= splatMood;
	  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, splatColor, terrainSplat);
  sampledDiffuseColor.rgb = mix(vec3(1.0), sampledDiffuseColor.rgb, clamp(terrainFeatureMix, 0.0, 1.0));
  float macro = terrainValueNoise(vTerrainUv * 2.15 + terrainSeed * 11.0) * 2.0 - 1.0;
  float activeMacroWarmth = mix(1.0, terrainMacroWarmth, terrainSplat);
  vec3 macroTint = vec3(
    1.0 + macro * (0.052 + terrainSplat * 0.018 * activeMacroWarmth) + max(macro, 0.0) * 0.008 * max(1.0, activeMacroWarmth),
    1.0 + macro * (0.038 + terrainSplat * 0.010 * activeMacroWarmth),
    1.0 + macro * (0.026 - terrainSplat * 0.006 * activeMacroWarmth) - max(macro, 0.0) * 0.010 * max(1.0, activeMacroWarmth)
  );
	  sampledDiffuseColor.rgb *= terrainPaletteTint * macroTint * mix(vec3(1.0), vec3(0.92, 1.0, 0.86), scrubBlend * 0.18);
	  diffuseColor *= sampledDiffuseColor;
	#endif`);
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_begin>',
      `#include <normal_fragment_begin>
  vec3 terrainUpNormal = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
  normal = normalize(mix(normal, terrainUpNormal, terrainSplat * 0.24));
  nonPerturbedNormal = normal;`,
    );
	  };
  void loadBankVariantAtlas().then((atlas) => {
    if (!atlas) return;
    // Do NOT resize the live map's backing canvas: three.js allocates immutable
    // texture storage at first upload, so a grown canvas dies in texSubImage2D
    // (GL_INVALID_VALUE, s12 probe) and the GPU silently keeps the old content.
    // Swap in a fresh CanvasTexture sized to the atlas instead.
    const atlasTexture = new THREE.CanvasTexture(atlas.canvas);
    configureBankAtlas(atlasTexture);
    const previous = material.map;
    material.map = atlasTexture;
    material.needsUpdate = true;
    if (previous && previous !== atlasTexture) previous.dispose();
    uniforms.variantCount.value = atlas.variantCount;
    uniforms.atlasRows.value = atlas.rows;
  });
  return material;
}

function createBankGeometry(): THREE.PlaneGeometry {
  const geometry = new THREE.PlaneGeometry(CLAIM_SIZE, CLAIM_SIZE, terrainSegments(), terrainSegments());
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = -positions.getY(index);
    positions.setZ(index, sampleHeight(x, z));
  }
  positions.needsUpdate = true;
  applyTerrainNormals(geometry, sampleUnclampedHeight);
  return geometry;
}

function createVistaBankMesh(material: THREE.MeshStandardMaterial): THREE.Mesh {
  const mesh = new THREE.Mesh(createVistaRingGeometry(), material);
  mesh.name = 'TerrainVistaRing';
  mesh.userData.terrainVista = true;
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  mesh.renderOrder = RenderLayers.terrainBackdrop;
  return mesh;
}

function createVistaRingGeometry(): THREE.BufferGeometry {
  const { fullAxis, innerAxis, leftAxis, rightAxis } = vistaAxes();
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  addVistaGrid(positions, uvs, indices, fullAxis, rightAxis, sampleUnclampedHeight);
  addVistaGrid(positions, uvs, indices, fullAxis, leftAxis, sampleUnclampedHeight);
  addVistaGrid(positions, uvs, indices, rightAxis, innerAxis, sampleUnclampedHeight);
  addVistaGrid(positions, uvs, indices, leftAxis, innerAxis, sampleUnclampedHeight);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  applyTerrainNormals(geometry, sampleUnclampedHeight);
  return geometry;
}

function createExtendedRiverGeometry(): THREE.BufferGeometry {
  const halfWidth = visualWaterWidth() / 2;
  const axis = vistaAxes().fullAxis;
  const acrossSegments = 4;
  const geometry = new THREE.BufferGeometry();
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let row = 0; row <= acrossSegments; row += 1) {
    const t = row / acrossSegments;
    const across = THREE.MathUtils.lerp(-halfWidth, halfWidth, t);
    for (const x of axis) {
      const z = vistaRiverCenterZ(x) + across;
      positions.push(x, -z, 0);
      uvs.push((x + CLAIM_HALF) / CLAIM_SIZE, t);
    }
  }
  const width = axis.length;
  for (let row = 0; row < acrossSegments; row += 1) {
    for (let xi = 0; xi < width - 1; xi += 1) {
      const a = row * width + xi;
      const b = a + 1;
      const c = a + width;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addVistaGrid(
  positions: number[],
  uvs: number[],
  indices: number[],
  xAxis: number[],
  zAxis: number[],
  heightAt: (x: number, z: number) => number,
): void {
  const base = positions.length / 3;
  for (const z of zAxis) {
    for (const x of xAxis) {
      positions.push(x, -z, heightAt(x, z));
      uvs.push((x + CLAIM_HALF) / CLAIM_SIZE, (-z + CLAIM_HALF) / CLAIM_SIZE);
    }
  }
  const width = xAxis.length;
  for (let zi = 0; zi < zAxis.length - 1; zi += 1) {
    for (let xi = 0; xi < xAxis.length - 1; xi += 1) {
      const a = base + zi * width + xi;
      const b = a + 1;
      const c = a + width;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
}

function terrainSegments(): number {
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 430;
  const value = mobile ? Balance.world.terrainMobileSegments : Balance.world.terrainSegments;
  return Math.max(24, Math.min(96, Math.floor(value)));
}

function terrainMeshEnabled(): boolean {
  const mode = ACTIVE_TILE.render?.terrainMesh;
  if (mode === 'required') return true;
  if (mode === 'off') return false;
  if (typeof window !== 'undefined') {
    const value = new URLSearchParams(window.location.search).get('terrainMesh');
    if (value !== null) return value !== '0' && value !== 'false';
  }
  if (import.meta.env.VITE_GR_TERRAIN_MESH === '1' || import.meta.env.VITE_GR_TERRAIN_MESH === 'true') return true;
  return Balance.world.terrainMesh;
}

function terrainSplatEnabled(): boolean {
  if (ACTIVE_TILE.render?.terrainMesh === 'off') return false;
  if (typeof window !== 'undefined') {
    const value = new URLSearchParams(window.location.search).get('terrainSplat');
    if (value !== null) return value !== '0' && value !== 'false';
  }
  if (import.meta.env.VITE_GR_TERRAIN_SPLAT === '1' || import.meta.env.VITE_GR_TERRAIN_SPLAT === 'true') return true;
  return Balance.world.terrainSplat;
}

function terrainSlopeShade(): number {
  return ACTIVE_TILE.render?.terrainMesh === 'required' ? 0.62 : 0.42;
}

function terrainMeshSegments(): number {
  const step = Math.max(0.5, Math.min(4, Balance.world.terrainMeshVertexStep));
  return Math.max(8, Math.min(128, Math.round(CLAIM_SIZE / step)));
}

function groundDiagnostics(mesh: THREE.Mesh): TerrainGroundDiagnostics {
  const stats = mesh.userData.groundStats as ContinuousGroundMeshStats | undefined;
  if (stats) return stats;
  const vertices = (mesh.geometry.getAttribute('position') as THREE.BufferAttribute | undefined)?.count ?? 0;
  const segments = Math.max(1, Math.round(Math.sqrt(vertices)) - 1);
  const triangles = mesh.geometry.index ? mesh.geometry.index.count / 3 : Math.floor(vertices / 3);
  return {
    enabled: false,
    mode: 'fallback',
    drawCalls: 1,
    segments,
    vertexStep: CLAIM_SIZE / segments,
    vertices,
    triangles,
    heightSource: 'visual',
    textureSource: 'bank-atlas',
    textureSeams: 'texture seams remain until TR-02',
  };
}

function vistaSegments(): number {
  const mobile = typeof window !== 'undefined' && window.innerWidth <= 430;
  const value = mobile ? Balance.world.vistaMobileSegments : Balance.world.vistaSegments;
  return Math.max(4, Math.min(24, Math.floor(value)));
}

function vistaAxes(): { fullAxis: number[]; innerAxis: number[]; leftAxis: number[]; rightAxis: number[] } {
  const edgeSegments = terrainSegments();
  const outerSegments = vistaSegments();
  const innerAxis = makeAxis(-CLAIM_HALF, CLAIM_HALF, edgeSegments);
  const leftAxis = makeVistaOuterAxis(-CLAIM_HALF, -VISTA_RADIUS, outerSegments).reverse();
  const rightAxis = makeVistaOuterAxis(CLAIM_HALF, VISTA_RADIUS, outerSegments);
  return {
    fullAxis: [...leftAxis.slice(0, -1), ...innerAxis, ...rightAxis.slice(1)],
    innerAxis,
    leftAxis,
    rightAxis,
  };
}

function makeAxis(start: number, end: number, segments: number): number[] {
  const count = Math.max(1, Math.floor(segments));
  const values: number[] = [];
  for (let index = 0; index <= count; index += 1) values.push(THREE.MathUtils.lerp(start, end, index / count));
  return values;
}

function makeVistaOuterAxis(edge: number, outer: number, segments: number): number[] {
  const nearSegments = Math.max(2, Math.min(8, Math.floor(segments * 0.75)));
  const farSegments = Math.max(1, Math.floor(segments) - nearSegments);
  const direction = Math.sign(outer - edge) || 1;
  const transitionEnd = edge + direction * Math.min(8, Math.abs(outer - edge));
  return [...makeAxis(edge, transitionEnd, nearSegments), ...makeAxis(transitionEnd, outer, farSegments).slice(1)];
}

function applyTerrainNormals(geometry: THREE.BufferGeometry, heightAt: (x: number, z: number) => number): void {
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
  const normals: number[] = [];
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = -positions.getY(index);
    const normal = terrainNormal(x, z, heightAt);
    normals.push(normal.x, normal.y, normal.z);
  }
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
}

function terrainNormal(x: number, z: number, heightAt: (x: number, z: number) => number): THREE.Vector3 {
  const step = 0.5;
  const dx = (heightAt(x + step, z) - heightAt(x - step, z)) / (step * 2);
  const dz = (heightAt(x, z + step) - heightAt(x, z - step)) / (step * 2);
  return new THREE.Vector3(-dx, dz, 1).normalize();
}

function terrainFeatures(x: number, z: number): TerrainFeatureSample {
  const absZ = Math.abs(z);
  const bankDistance = Math.max(0, absZ - RIVER_MAX_Z);
  const routeMask = smoothstep(
    Balance.world.terrainRoutingLaneCalmRadius,
    Balance.world.terrainRoutingLaneCalmRadius + 5,
    routingLaneDistance(x, z),
  );
  const fordMask = smoothstep(4, 9, Math.hypot(x, z));
  const calmMask = claimFeatureCalmMask(x, z) * stableProbeMask(x, z) * routeMask * fordMask;
  const bankMask = smoothstep(2, 8, bankDistance) * (1 - smoothstep(18, 30, bankDistance)) * calmMask;
  const gully = channelMask(x, z) * bankMask * (0.72 + valueNoise(x * 0.09 + 18.5, z * 0.09 - 4.5) * 0.42);
  const shelf =
    Math.max(ovalMask(x, z, 23, -20, 8, 6), ovalMask(x, z, -23, -19, 9, 6), ovalMask(x, z, -8, -28, 12, 4) * 0.72) *
    calmMask *
    (0.82 + valueNoise(x * 0.12 - 8.4, z * 0.12 + 19.1) * 0.34);
  const edge = Math.max(Math.abs(x), Math.abs(z));
  const bluff = smoothstep(CLAIM_HALF - 8, CLAIM_HALF, edge) * calmMask * (0.76 + valueNoise(x * 0.05 + 2.2, z * 0.05 - 9.7) * 0.38);
  const pocket =
    Math.max(
      ovalMask(x, z, -22, 20, 7, 5),
      ovalMask(x, z, 24, 21, 5, 6),
      ovalMask(x, z, -26, -23, 6, 5),
      ovalMask(x, z, 26, -27, 5, 4),
    ) *
    calmMask *
    (0.82 + valueNoise(x * 0.16 + 7.1, z * 0.16 + 2.4) * 0.28);
  const scale = Balance.world.terrainFeatureRelief * mobileTerrainFeatureScale();
  const heightOffset = (shelf * 0.42 + bluff * 0.48 - gully * 0.30 - pocket * 0.22) * scale;
  return { gully, shelf, bluff, pocket, routeMask, calmMask, heightOffset };
}

function contractHeightfieldOffset(x: number, z: number): number {
  if (!TILE_HEIGHTFIELD || TILE_HEIGHTFIELD.mode !== 'visual') return 0;

  let offset = 0;
  const basin = TILE_HEIGHTFIELD.springBasin;
  if (basin) offset -= ovalMask(x, z, basin.x, basin.z, basin.radius, basin.radius * 0.78) * basin.depth;

  for (const wash of TILE_HEIGHTFIELD.washChannels ?? []) {
    offset -= washChannelMask(x, z, wash.x, wash.z, wash.length, wash.width, wash.angle) * wash.depth;
  }

  const bankRelief = TILE_HEIGHTFIELD.bankRelief;
  if (bankRelief) {
    const bankDistance = Math.max(0, Math.abs(z) - RIVER_MAX_Z);
    const nearBank = smoothstep(0.25, 2.4, bankDistance) * (1 - smoothstep(3.2, bankRelief.width, bankDistance));
    const ripple = 0.74 + valueNoise(x * 0.13 + 2.6, z * 0.13 - 11.4) * 0.36;
    offset += nearBank * bankRelief.amount * ripple;
  }

  return offset;
}

function washChannelMask(x: number, z: number, cx: number, cz: number, length: number, width: number, angle: number): number {
  const dx = x - cx;
  const dz = z - cz;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const along = dx * cos + dz * sin;
  const across = -dx * sin + dz * cos;
  const lengthMask = 1 - smoothstep(length * 0.42, length * 0.5, Math.abs(along));
  const widthMask = 1 - smoothstep(width * 0.32, width * 0.5, Math.abs(across + Math.sin(along * 0.18) * width * 0.18));
  const grain = 0.84 + valueNoise(x * 0.16 + 31.2, z * 0.16 - 8.1) * 0.24;
  return THREE.MathUtils.clamp(lengthMask * widthMask * grain, 0, 1);
}

function channelMask(x: number, z: number): number {
  const bankDistance = Math.max(0, Math.abs(z) - RIVER_MAX_Z);
  const warpedX = x + Math.sin(z * 0.19) * 3 + Math.sin(z * 0.061) * 6;
  const cell = Math.floor((warpedX + 6.5) / 13);
  const center = cell * 13 - 6.5 + Math.sin(bankDistance * 0.8 + cell) * 2;
  const main = 1 - smoothstep(0.6, 2.3, Math.abs(warpedX - center));
  const branchCenter = center + Math.sign(z || 1) * (3.2 + Math.sin(bankDistance * 0.6 + cell * 1.9) * 2.2);
  const branch = (1 - smoothstep(0.45, 1.7, Math.abs(warpedX - branchCenter))) * smoothstep(7, 14, bankDistance);
  return Math.max(main, branch * 0.7);
}

function ovalMask(x: number, z: number, cx: number, cz: number, rx: number, rz: number): number {
  const nx = (x - cx) / rx;
  const nz = (z - cz) / rz;
  return 1 - smoothstep(0.54, 1, nx * nx + nz * nz);
}

function claimFeatureCalmMask(x: number, z: number): number {
  if (z <= RIVER_MAX_Z + SHALLOWS_WIDTH || z >= 23 || Math.abs(x) >= 24) return 1;
  return smoothstep(7, 22, Math.abs(x));
}

function stableProbeMask(x: number, z: number): number {
  const probes = [
    [0, 12],
    [-12, 0],
    [0, 0],
    [12, RIVER_MAX_Z + SHALLOWS_WIDTH],
    [12, -18],
  ] as const;
  let mask = 1;
  for (const [px, pz] of probes) mask *= smoothstep(1.8, 4.2, Math.hypot(x - px, z - pz));
  return mask;
}

function mobileTerrainFeatureScale(): number {
  if (typeof window === 'undefined') return 1;
  return window.innerWidth <= 430 ? Balance.world.terrainFeatureMobileScale : 1;
}

function vistaVertexCount(): number {
  const { fullAxis, innerAxis, leftAxis, rightAxis } = vistaAxes();
  const outer = vistaSegments() + 1;
  return fullAxis.length * outer * 2 + rightAxis.length * innerAxis.length + leftAxis.length * innerAxis.length;
}

function vistaRiverDiagnostics(): VistaDiagnostics['river'] {
  const axis = vistaAxes().fullAxis;
  const centers = axis.map((x) => vistaRiverCenterZ(x));
  const meanderAmplitude = centers.reduce((max, center) => Math.max(max, Math.abs(center)), 0);
  return {
    present: ACTIVE_CONTRACT.tileParams.river,
    drawCalls: ACTIVE_CONTRACT.tileParams.river ? 1 : 0,
    radius: VISTA_RADIUS,
    vertices: riverVistaVertexCount(),
    visualHalfWidth: round3(visualWaterWidth() / 2),
    fadeStart: riverFadeStart(),
    westEdgeCenterZ: round3(vistaRiverCenterZ(bounds.minX)),
    eastEdgeCenterZ: round3(vistaRiverCenterZ(bounds.maxX)),
    westFarCenterZ: round3(vistaRiverCenterZ(-VISTA_RADIUS)),
    eastFarCenterZ: round3(vistaRiverCenterZ(VISTA_RADIUS)),
    meanderAmplitude: round3(meanderAmplitude),
  };
}

function riverVistaVertexCount(): number {
  return vistaAxes().fullAxis.length * 5;
}

function vistaRiverCenterZ(x: number): number {
  const side = x < 0 ? -1 : 1;
  const outside = Math.max(0, Math.abs(x) - CLAIM_HALF);
  const dx = x - side * CLAIM_HALF;
  const ramp = smoothstep(0, 18, outside);
  return ramp * (Math.sin(dx * 0.065) * 2.6 + Math.sin(dx * 0.137) * 0.8);
}

function riverFadeStart(): number {
  return VISTA_RADIUS - 12;
}

function vistaSeamProbePoints(): Array<{ x: number; z: number }> {
  return [
    { x: -CLAIM_HALF, z: -24 },
    { x: CLAIM_HALF, z: -12 },
    { x: -18, z: -CLAIM_HALF },
    { x: 0, z: CLAIM_HALF },
    { x: 18, z: CLAIM_HALF },
    { x: CLAIM_HALF, z: 4 },
  ];
}

function waterMaterialConfig(ford: boolean, range: FordRange = defaultFordRange()): Parameters<typeof createLivingWaterMaterial>[0] {
  const riverHalfWidth = (RIVER_MAX_Z - RIVER_MIN_Z) / 2;
  return {
    ford,
    riverHalfWidth,
    visualHalfWidth: visualWaterWidth() / 2,
    lengthHalf: VISTA_RADIUS,
    fadeStart: riverFadeStart(),
    fordHalfWidth: range.halfWidth,
    riverDepth: waterDepth('river'),
    fordDepth: waterDepth('ford'),
    wadeDepth: Balance.terrainSim.wadeDepth,
    deepDepth: Balance.terrainSim.deepDepth,
    anchors: nodeAnchors.map((anchor) => ({
      x: anchor.x,
      z: anchor.z < 0 ? RIVER_MIN_Z + 0.55 : RIVER_MAX_Z - 0.55,
    })),
  };
}

function visualWaterWidth(): number {
  return (TILE_WATER?.visualHalfWidth ?? (RIVER_MAX_Z - RIVER_MIN_Z) / 2 + SHALLOWS_WIDTH) * 2;
}

function syncBankMaterial(mesh: THREE.Mesh): void {
  const uniforms = (mesh.material as THREE.MeshStandardMaterial).userData.terrainUniforms as TerrainShaderUniforms | undefined;
  if (uniforms) uniforms.featureMix.value = Balance.terrain.featureMix;
}

function terrainSplatParams(): TerrainSplatParams {
  const declared = TILE_PALETTE?.splat ?? {};
  const riverDampBand = (TILE_WATER?.visualHalfWidth ?? (RIVER_MAX_Z - RIVER_MIN_Z) / 2 + SHALLOWS_WIDTH) + 0.9;
  const defaultRock = TILE_HEIGHTFIELD?.washChannels ? 0.62 : TILE_HEIGHTFIELD?.bankRelief ? 0.28 : 0.22;
  const defaultScrub = ACTIVE_CONTRACT.tileParams.scatter?.nearWaterBias ? 0.42 : ACTIVE_CONTRACT.tileParams.river ? 0.2 : 0.14;
  return {
    rockAmount: clamp01(declared.rockAmount ?? defaultRock),
    dampBand: Math.max(0.5, declared.dampBand ?? (ACTIVE_CONTRACT.tileParams.river ? riverDampBand : SPRING_PONDS.length ? 2.8 : 1.4)),
    scrubAmount: clamp01(declared.scrubAmount ?? defaultScrub),
    macroWarmth: Math.max(0, Math.min(1.5, declared.macroWarmth ?? 1)),
    antiTile: clamp01(declared.antiTile ?? 0.58),
  };
}

function paletteVector(value: [number, number, number] | undefined, fallback: [number, number, number]): THREE.Vector3 {
  const [r, g, b] = value ?? fallback;
  return new THREE.Vector3(r, g, b);
}

async function loadBankVariantAtlas(): Promise<{ canvas: HTMLCanvasElement; variantCount: number; rows: number } | null> {
  const textures: THREE.Texture[] = [];
  for (const file of BANK_VARIANT_FILES) {
    const texture = await loadBankVariantTexture(file);
    if (texture) textures.push(texture);
  }
  if (textures.length === 0) return null;
  return createBankAtlas(textures);
}

function loadBankVariantTexture(file: string): Promise<THREE.Texture | null> {
  if (file === 'terrain-bank-tile.png') return loadGeneratedTexture(assetSlots.terrainBank);
  const urlLoader = processedTextureUrlsByFile.get(file);
  if (!urlLoader) return Promise.resolve(null);
  return urlLoader().then(
    (url) =>
      new Promise<THREE.Texture | null>((resolve) => {
        textureLoader.load(
          url,
          (texture) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.anisotropy = 4;
            resolve(texture);
          },
          undefined,
          () => resolve(null),
        );
      }),
    () => null,
  );
}

function createBankAtlas(textures: THREE.Texture[]): { canvas: HTMLCanvasElement; variantCount: number; rows: number } {
  const firstImage = textures[0]?.image as CanvasImageSource | undefined;
  const tileSize = Math.max(1, imageWidth(firstImage), imageHeight(firstImage));
  const rows = nextPowerOfTwo(textures.length);
  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize * rows;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create bank atlas context.');

  for (let row = 0; row < rows; row += 1) {
    const image = (textures[Math.min(row, textures.length - 1)]?.image ?? firstImage) as CanvasImageSource | undefined;
    if (image) context.drawImage(image, 0, row * tileSize, tileSize, tileSize);
  }

  return { canvas, variantCount: textures.length, rows };
}

function configureBankAtlas(texture: THREE.Texture): void {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
}

function terrainBankVariantFiles(): string[] {
  try {
    const contract = JSON.parse(terrainContractText) as LayerContract;
    const slot = contract.slots?.find((entry) => entry.slot === assetSlots.terrainBank);
    const files = slot?.variants ?? (slot?.file ? [slot.file] : []);
    return [...new Set(files.filter((file): file is string => typeof file === 'string' && file.length > 0))];
  } catch {
    return ['terrain-bank-tile.png'];
  }
}

function terrainSeed(): number {
  if (typeof window === 'undefined') return 0;
  return normalizeSeed(new URLSearchParams(window.location.search).get('seed')) / 4294967296;
}

function valueNoise(x: number, z: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = smooth01(x - ix);
  const fz = smooth01(z - iz);
  const a = terrainHash(ix, iz);
  const b = terrainHash(ix + 1, iz);
  const c = terrainHash(ix, iz + 1);
  const d = terrainHash(ix + 1, iz + 1);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, fx), THREE.MathUtils.lerp(c, d, fx), fz);
}

function terrainHash(x: number, z: number): number {
  const seed = terrainSeed() * 997.31;
  return fract(Math.sin(x * 127.1 + z * 311.7 + seed) * 43758.5453123);
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge0 === edge1) return value < edge0 ? 0 : 1;
  return smooth01(THREE.MathUtils.clamp((value - edge0) / (edge1 - edge0), 0, 1));
}

function smooth01(value: number): number {
  return value * value * (3 - 2 * value);
}

function clamp01(value: number): number {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function imageWidth(image: CanvasImageSource | undefined): number {
  if (!image) return 512;
  if ('videoWidth' in image) return image.videoWidth;
  if ('displayWidth' in image) return image.displayWidth;
  if ('width' in image) return typeof image.width === 'number' ? image.width : image.width.baseVal.value;
  return 512;
}

function imageHeight(image: CanvasImageSource | undefined): number {
  if (!image) return 512;
  if ('videoHeight' in image) return image.videoHeight;
  if ('displayHeight' in image) return image.displayHeight;
  if ('height' in image) return typeof image.height === 'number' ? image.height : image.height.baseVal.value;
  return 512;
}

function nextPowerOfTwo(value: number): number {
  let power = 1;
  while (power < value) power *= 2;
  return power;
}

function createBankTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not create bank texture context.');

  context.fillStyle = palette.sand;
  context.fillRect(0, 0, size, size);
  context.fillStyle = 'rgba(196, 136, 58, 0.12)';
  for (let i = 0; i < 900; i += 1) {
    const x = (i * 71) % size;
    const y = (i * 149) % size;
    context.fillRect(x, y, 1, 1);
  }
  context.strokeStyle = 'rgba(46, 27, 14, 0.13)';
  context.lineWidth = 1;
  for (let y = -size; y < size * 2; y += 18) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(size, y + size * 0.35);
    context.stroke();
  }
  context.fillStyle = 'rgba(91, 122, 83, 0.16)';
  for (let i = 0; i < 32; i += 1) {
    const x = (i * 113) % size;
    const y = (i * 197) % size;
    context.beginPath();
    context.ellipse(x, y, 5, 1.6, (i % 6) * 0.45, 0, Math.PI * 2);
    context.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
