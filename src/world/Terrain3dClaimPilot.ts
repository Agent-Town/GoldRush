import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import baronContractText from '../../assets/pilots/map-rebuild-spike/baron-terrain-contract.json?raw';
import baronPanoramaContractText from '../../assets/pilots/map-rebuild-spike/baron-panorama-contract.json?raw';
import dryGulchContractText from '../../assets/pilots/map-rebuild-spike/dry-gulch-terrain-contract.json?raw';
import dryGulchPanoramaContractText from '../../assets/pilots/map-rebuild-spike/dry-gulch-panorama-contract.json?raw';
import hillMineContractText from '../../assets/pilots/map-rebuild-spike/hill-mine-terrain-contract.json?raw';
import hillMinePanoramaContractText from '../../assets/pilots/map-rebuild-spike/hill-mine-panorama-contract.json?raw';
import nightShiftContractText from '../../assets/pilots/map-rebuild-spike/night-shift-terrain-contract.json?raw';
import nightShiftPanoramaContractText from '../../assets/pilots/map-rebuild-spike/night-shift-panorama-contract.json?raw';
import claimContractText from '../../assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json?raw';
import claimPanoramaContractText from '../../assets/pilots/map-rebuild-spike/the-claim-panorama-contract.json?raw';
import twinBanksContractText from '../../assets/pilots/map-rebuild-spike/twin-banks-terrain-contract.json?raw';
import twinBanksPanoramaContractText from '../../assets/pilots/map-rebuild-spike/twin-banks-panorama-contract.json?raw';
import trestleContractText from '../../assets/pilots/map-rebuild-spike/trestle-terrain-contract.json?raw';
import trestlePanoramaContractText from '../../assets/pilots/map-rebuild-spike/trestle-panorama-contract.json?raw';
import blackoutRidgeContractText from '../../assets/pilots/map-rebuild-spike/blackout-ridge-terrain-contract.json?raw';
import blackoutRidgePanoramaContractText from '../../assets/pilots/map-rebuild-spike/blackout-ridge-panorama-contract.json?raw';
import fairgroundContractText from '../../assets/pilots/map-rebuild-spike/fairground-terrain-contract.json?raw';
import fairgroundPanoramaContractText from '../../assets/pilots/map-rebuild-spike/fairground-panorama-contract.json?raw';
import dustFlatsContractText from '../../assets/pilots/map-rebuild-spike/dust-flats-terrain-contract.json?raw';
import dustFlatsPanoramaContractText from '../../assets/pilots/map-rebuild-spike/dust-flats-panorama-contract.json?raw';
import deepwaterClaimContractText from '../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain-contract.json?raw';
import deepwaterClaimPanoramaContractText from '../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama-contract.json?raw';
import glowMesaContractText from '../../assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json?raw';
import glowMesaPanoramaContractText from '../../assets/pilots/map-rebuild-spike/glow-mesa-panorama-contract.json?raw';
import relayValleyContractText from '../../assets/pilots/map-rebuild-spike/relay-valley-terrain-contract.json?raw';
import relayValleyPanoramaContractText from '../../assets/pilots/map-rebuild-spike/relay-valley-panorama-contract.json?raw';
import mareClaimContractText from '../../assets/pilots/map-rebuild-spike/mare-claim-terrain-contract.json?raw';
import mareClaimPanoramaContractText from '../../assets/pilots/map-rebuild-spike/mare-claim-panorama-contract.json?raw';
import domeBasinContractText from '../../assets/pilots/map-rebuild-spike/dome-basin-terrain-contract.json?raw';
import domeBasinPanoramaContractText from '../../assets/pilots/map-rebuild-spike/dome-basin-panorama-contract.json?raw';
import emberShoreContractText from '../../assets/pilots/map-rebuild-spike/ember-shore-terrain-contract.json?raw';
import emberShorePanoramaContractText from '../../assets/pilots/map-rebuild-spike/ember-shore-panorama-contract.json?raw';
import archiveWorldContractText from '../../assets/pilots/map-rebuild-spike/archive-world-terrain-contract.json?raw';
import archiveWorldPanoramaContractText from '../../assets/pilots/map-rebuild-spike/archive-world-panorama-contract.json?raw';
import boneyardContractText from '../../assets/pilots/map-rebuild-spike/boneyard-terrain-contract.json?raw';
import boneyardPanoramaContractText from '../../assets/pilots/map-rebuild-spike/boneyard-panorama-contract.json?raw';
import canyonWorksContractText from '../../assets/pilots/map-rebuild-spike/canyon-works-terrain-contract.json?raw';
import canyonWorksPanoramaContractText from '../../assets/pilots/map-rebuild-spike/canyon-works-panorama-contract.json?raw';
import devilsAlleyContractText from '../../assets/pilots/map-rebuild-spike/devils-alley-terrain-contract.json?raw';
import devilsAlleyPanoramaContractText from '../../assets/pilots/map-rebuild-spike/devils-alley-panorama-contract.json?raw';
import echoCanyonContractText from '../../assets/pilots/map-rebuild-spike/echo-canyon-terrain-contract.json?raw';
import echoCanyonPanoramaContractText from '../../assets/pilots/map-rebuild-spike/echo-canyon-panorama-contract.json?raw';
import gusherCountyContractText from '../../assets/pilots/map-rebuild-spike/gusher-county-terrain-contract.json?raw';
import gusherCountyPanoramaContractText from '../../assets/pilots/map-rebuild-spike/gusher-county-panorama-contract.json?raw';
import halfLifeHollowContractText from '../../assets/pilots/map-rebuild-spike/half-life-hollow-terrain-contract.json?raw';
import halfLifeHollowPanoramaContractText from '../../assets/pilots/map-rebuild-spike/half-life-hollow-panorama-contract.json?raw';
import inclineContractText from '../../assets/pilots/map-rebuild-spike/incline-terrain-contract.json?raw';
import inclinePanoramaContractText from '../../assets/pilots/map-rebuild-spike/incline-panorama-contract.json?raw';
import longRoadContractText from '../../assets/pilots/map-rebuild-spike/long-road-terrain-contract.json?raw';
import longRoadPanoramaContractText from '../../assets/pilots/map-rebuild-spike/long-road-panorama-contract.json?raw';
import lowOrbitContractText from '../../assets/pilots/map-rebuild-spike/low-orbit-terrain-contract.json?raw';
import lowOrbitPanoramaContractText from '../../assets/pilots/map-rebuild-spike/low-orbit-panorama-contract.json?raw';
import mothSeasonContractText from '../../assets/pilots/map-rebuild-spike/moth-season-terrain-contract.json?raw';
import mothSeasonPanoramaContractText from '../../assets/pilots/map-rebuild-spike/moth-season-panorama-contract.json?raw';
import oldCanalContractText from '../../assets/pilots/map-rebuild-spike/old-canal-terrain-contract.json?raw';
import oldCanalPanoramaContractText from '../../assets/pilots/map-rebuild-spike/old-canal-panorama-contract.json?raw';
import pressureGardenContractText from '../../assets/pilots/map-rebuild-spike/pressure-garden-terrain-contract.json?raw';
import pressureGardenPanoramaContractText from '../../assets/pilots/map-rebuild-spike/pressure-garden-panorama-contract.json?raw';
import regattaContractText from '../../assets/pilots/map-rebuild-spike/regatta-terrain-contract.json?raw';
import regattaPanoramaContractText from '../../assets/pilots/map-rebuild-spike/regatta-panorama-contract.json?raw';
import seedRunContractText from '../../assets/pilots/map-rebuild-spike/seed-run-terrain-contract.json?raw';
import seedRunPanoramaContractText from '../../assets/pilots/map-rebuild-spike/seed-run-panorama-contract.json?raw';
import showroomContractText from '../../assets/pilots/map-rebuild-spike/showroom-terrain-contract.json?raw';
import showroomPanoramaContractText from '../../assets/pilots/map-rebuild-spike/showroom-panorama-contract.json?raw';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { Balance } from '../game/Balance';
import type { LightFieldSnapshot, LightSource } from '../systems/LightField';
import { disposeObject3D } from '../utils/dispose';
import { installVisualHeightSource } from './Terrain';

type Contract = {
  tileId: string;
  vertices: number;
  triangles: number;
  meshCount: number;
  materialCount: number;
  boundsMeters: { min: [number, number, number]; max: [number, number, number] };
  panoramaMount: Mount;
  landmarkMounts?: LandmarkMount[];
};
type PanoramaContract = Pick<Contract, 'vertices' | 'triangles' | 'meshCount' | 'materialCount'> & { renderOnly: boolean };
type Mount = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  renderOnly: boolean;
};
type LandmarkMount = Omit<Mount, 'renderOnly'> & { asset?: string };
type Entry = { terrainUrl: string; panoramaUrl: string; contract: Contract; panoramaContract: PanoramaContract };
type Host = {
  scene: THREE.Scene;
  canvas: HTMLCanvasElement;
  contractId: string;
  tileId: string;
  paintedGround?: THREE.Object3D;
  nightMode?: boolean;
  nightLighting?: () => LightFieldSnapshot;
  onVisualHeightSourceInstalled?: () => void;
};
type Metrics = { meshes: number; triangles: number; materials: number; vertices: number; bounds: THREE.Box3 };
type HiddenRelief = { object: THREE.Object3D; visible: boolean };

const entry = (terrainUrl: string, panoramaUrl: string, contractText: string, panoramaContractText: string): Entry => ({
  terrainUrl,
  panoramaUrl,
  contract: JSON.parse(contractText) as Contract,
  panoramaContract: JSON.parse(panoramaContractText) as PanoramaContract,
});
const REGISTRY: Record<string, Entry> = {
  'the-claim': entry(new URL('../../assets/pilots/map-rebuild-spike/the-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/the-claim-panorama.glb', import.meta.url).href, claimContractText, claimPanoramaContractText),
  'e1-dry-gulch': entry(new URL('../../assets/pilots/map-rebuild-spike/dry-gulch-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/dry-gulch-panorama.glb', import.meta.url).href, dryGulchContractText, dryGulchPanoramaContractText),
  'e1-twin-banks': entry(new URL('../../assets/pilots/map-rebuild-spike/twin-banks-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/twin-banks-panorama.glb', import.meta.url).href, twinBanksContractText, twinBanksPanoramaContractText),
  'e1-night-shift': entry(new URL('../../assets/pilots/map-rebuild-spike/night-shift-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/night-shift-panorama.glb', import.meta.url).href, nightShiftContractText, nightShiftPanoramaContractText),
  'e1-baron': entry(new URL('../../assets/pilots/map-rebuild-spike/baron-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/baron-panorama.glb', import.meta.url).href, baronContractText, baronPanoramaContractText),
  'e2-hill-mine': entry(new URL('../../assets/pilots/map-rebuild-spike/hill-mine-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/hill-mine-panorama.glb', import.meta.url).href, hillMineContractText, hillMinePanoramaContractText),
  'e2-trestle': entry(new URL('../../assets/pilots/map-rebuild-spike/trestle-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/trestle-panorama.glb', import.meta.url).href, trestleContractText, trestlePanoramaContractText),
  'e3-blackout-ridge': entry(new URL('../../assets/pilots/map-rebuild-spike/blackout-ridge-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/blackout-ridge-panorama.glb', import.meta.url).href, blackoutRidgeContractText, blackoutRidgePanoramaContractText),
  'e3-fairground': entry(new URL('../../assets/pilots/map-rebuild-spike/fairground-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/fairground-panorama.glb', import.meta.url).href, fairgroundContractText, fairgroundPanoramaContractText),
  'e4-dust-flats': entry(new URL('../../assets/pilots/map-rebuild-spike/dust-flats-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/dust-flats-panorama.glb', import.meta.url).href, dustFlatsContractText, dustFlatsPanoramaContractText),
  'e5-deepwater-claim': entry(new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb', import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
  'e6-glow-mesa': entry(new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb', import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText),
  'e7-relay-valley': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
  'e8-mare-claim': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
  'e9-dome-basin': entry(new URL('../../assets/pilots/map-rebuild-spike/dome-basin-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/dome-basin-panorama.glb', import.meta.url).href, domeBasinContractText, domeBasinPanoramaContractText),
  'e10-ember-shore': entry(new URL('../../assets/pilots/map-rebuild-spike/ember-shore-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/ember-shore-panorama.glb', import.meta.url).href, emberShoreContractText, emberShorePanoramaContractText),
  'e2-pressure-garden': entry(new URL('../../assets/pilots/map-rebuild-spike/pressure-garden-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/pressure-garden-panorama.glb', import.meta.url).href, pressureGardenContractText, pressureGardenPanoramaContractText),
  'e2-incline': entry(new URL('../../assets/pilots/map-rebuild-spike/incline-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/incline-panorama.glb', import.meta.url).href, inclineContractText, inclinePanoramaContractText),
  'e3-canyon-works': entry(new URL('../../assets/pilots/map-rebuild-spike/canyon-works-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/canyon-works-panorama.glb', import.meta.url).href, canyonWorksContractText, canyonWorksPanoramaContractText),
  'e3-moth-season': entry(new URL('../../assets/pilots/map-rebuild-spike/moth-season-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/moth-season-panorama.glb', import.meta.url).href, mothSeasonContractText, mothSeasonPanoramaContractText),
  'e4-long-road': entry(new URL('../../assets/pilots/map-rebuild-spike/long-road-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/long-road-panorama.glb', import.meta.url).href, longRoadContractText, longRoadPanoramaContractText),
  'e4-gusher-county': entry(new URL('../../assets/pilots/map-rebuild-spike/gusher-county-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/gusher-county-panorama.glb', import.meta.url).href, gusherCountyContractText, gusherCountyPanoramaContractText),
  'e4-boneyard': entry(new URL('../../assets/pilots/map-rebuild-spike/boneyard-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/boneyard-panorama.glb', import.meta.url).href, boneyardContractText, boneyardPanoramaContractText),
  'e5-regatta': entry(new URL('../../assets/pilots/map-rebuild-spike/regatta-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/regatta-panorama.glb', import.meta.url).href, regattaContractText, regattaPanoramaContractText),
  // Deepwater Claim aliases: these campaign variants intentionally reuse its terrain and panorama.
  'e5-stillwater': entry(new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb', import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
  'e5-flotilla': entry(new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/deepwater-claim-panorama.glb', import.meta.url).href, deepwaterClaimContractText, deepwaterClaimPanoramaContractText),
  'e6-showroom': entry(new URL('../../assets/pilots/map-rebuild-spike/showroom-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/showroom-panorama.glb', import.meta.url).href, showroomContractText, showroomPanoramaContractText),
  'e6-half-life-hollow': entry(new URL('../../assets/pilots/map-rebuild-spike/half-life-hollow-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/half-life-hollow-panorama.glb', import.meta.url).href, halfLifeHollowContractText, halfLifeHollowPanoramaContractText),
  // Glow Mesa alias: The Picnic keeps the caprock sculpt and changes campaign rules only.
  'e6-picnic': entry(new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/glow-mesa-panorama.glb', import.meta.url).href, glowMesaContractText, glowMesaPanoramaContractText),
  'e7-echo-canyon': entry(new URL('../../assets/pilots/map-rebuild-spike/echo-canyon-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/echo-canyon-panorama.glb', import.meta.url).href, echoCanyonContractText, echoCanyonPanoramaContractText),
  // Relay Valley aliases: both signal variants reuse its terrain and panorama.
  'e7-dead-band': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
  'e7-relay-rush': entry(new URL('../../assets/pilots/map-rebuild-spike/relay-valley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/relay-valley-panorama.glb', import.meta.url).href, relayValleyContractText, relayValleyPanoramaContractText),
  // Mare Claim aliases: Far Side and Eclipse change campaign rules without changing the sculpt.
  'e8-far-side': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
  'e8-low-orbit': entry(new URL('../../assets/pilots/map-rebuild-spike/low-orbit-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/low-orbit-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(lowOrbitContractText), boundsMeters: { min: [-64, -64, -5.869689], max: [64, 64, 1.08] } }), lowOrbitPanoramaContractText),
  'e8-eclipse': entry(new URL('../../assets/pilots/map-rebuild-spike/mare-claim-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/mare-claim-panorama.glb', import.meta.url).href, mareClaimContractText, mareClaimPanoramaContractText),
  'e9-seed-run': entry(new URL('../../assets/pilots/map-rebuild-spike/seed-run-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/seed-run-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(seedRunContractText), boundsMeters: { min: [-64, -64, -0.14], max: [64, 64, 3.715142] } }), seedRunPanoramaContractText),
  'e9-devils-alley': entry(new URL('../../assets/pilots/map-rebuild-spike/devils-alley-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/devils-alley-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(devilsAlleyContractText), boundsMeters: { min: [-64, -64, -0.14], max: [64, 64, 4.567115] } }), devilsAlleyPanoramaContractText),
  'e9-old-canal': entry(new URL('../../assets/pilots/map-rebuild-spike/old-canal-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/old-canal-panorama.glb', import.meta.url).href, JSON.stringify({ ...JSON.parse(oldCanalContractText), boundsMeters: { min: [-64, -64, -1.42], max: [64, 64, 2.906317] } }), oldCanalPanoramaContractText),
  'e10-archive-world': entry(new URL('../../assets/pilots/map-rebuild-spike/archive-world-terrain.glb', import.meta.url).href, new URL('../../assets/pilots/map-rebuild-spike/archive-world-panorama.glb', import.meta.url).href, archiveWorldContractText, archiveWorldPanoramaContractText),
};
const LANDMARK_ASSETS = import.meta.glob('../../assets/pilots/map-rebuild-spike/landmarks/**/*.glb', { query: '?url', import: 'default' }) as Record<string, () => Promise<string>>;
const BOUNDS_EPSILON = 0.03;
const CONTINUATION_SAMPLE_DEPTH = 8;
const LEGACY_GROUND_SLOTS = new Set(['terrain.bank', 'terrain.river', 'terrain.ford']);
const SKIRT_INSET = 2.5;
const NIGHT_POOL_SHADER_CAP = 32;

function publish(canvas: HTMLCanvasElement, state: 'loading' | 'ready' | 'lite' | 'failed', source: 'painted' | 'glb', metrics?: Metrics, panorama?: THREE.Object3D, panoramaMetrics?: Metrics): void {
  canvas.dataset.terrain3dPilotState = state;
  canvas.dataset.terrain3dPilotRenderSource = source;
  canvas.dataset.terrain3dPilotHeightSource = source === 'glb' ? 'baked-grid' : 'painted';
  canvas.dataset.terrain3dPilotMeshes = String(metrics?.meshes ?? 0);
  canvas.dataset.terrain3dPilotTriangles = String(metrics?.triangles ?? 0);
  canvas.dataset.terrain3dPilotMaterials = String(metrics?.materials ?? 0);
  canvas.dataset.terrain3dPilotVertices = String(metrics?.vertices ?? 0);
  canvas.dataset.terrain3dPilotPanorama = panorama?.name ?? 'off';
  canvas.dataset.terrain3dPilotPanoramaMeshes = String(panoramaMetrics?.meshes ?? 0);
  canvas.dataset.terrain3dPilotPanoramaTriangles = String(panoramaMetrics?.triangles ?? 0);
  canvas.dataset.terrain3dPilotPanoramaMaterials = String(panoramaMetrics?.materials ?? 0);
  canvas.dataset.terrain3dPilotPanoramaVertices = String(panoramaMetrics?.vertices ?? 0);
}

function inspect(model: THREE.Object3D, receiveShadow: boolean): Metrics {
  let meshes = 0;
  let triangles = 0;
  let vertices = 0;
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes += 1;
    const position = mesh.geometry.getAttribute('position');
    const uniqueVertices = new Set<string>();
    for (let index = 0; index < (position?.count ?? 0); index += 1) {
      uniqueVertices.add(`${position!.getX(index)},${position!.getY(index)},${position!.getZ(index)}`);
    }
    vertices += uniqueVertices.size;
    triangles += Math.floor((mesh.geometry.index?.count ?? position?.count ?? 0) / 3);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
    mesh.castShadow = false;
    mesh.receiveShadow = receiveShadow;
  });
  return { meshes, triangles, materials: materials.size, vertices, bounds: new THREE.Box3().setFromObject(model) };
}

function validTerrain(metrics: Metrics, contract: Contract): boolean {
  const { min, max } = metrics.bounds;
  const [minX, minZ, minY] = contract.boundsMeters.min;
  const [maxX, maxZ, maxY] = contract.boundsMeters.max;
  return metrics.meshes === contract.meshCount && metrics.triangles === contract.triangles && metrics.materials === contract.materialCount &&
    metrics.vertices === contract.vertices && Math.abs(min.x - minX) <= BOUNDS_EPSILON && Math.abs(min.y - minY) <= BOUNDS_EPSILON &&
    Math.abs(min.z - minZ) <= BOUNDS_EPSILON && Math.abs(max.x - maxX) <= BOUNDS_EPSILON &&
    Math.abs(max.y - maxY) <= BOUNDS_EPSILON && Math.abs(max.z - maxZ) <= BOUNDS_EPSILON;
}

function validPanorama(metrics: Metrics, contract: PanoramaContract, mount: Mount): boolean {
  return contract.renderOnly && mount.renderOnly && metrics.meshes === contract.meshCount && metrics.triangles === contract.triangles &&
    metrics.materials === contract.materialCount && metrics.vertices === contract.vertices;
}

function bakeHeightGrid(model: THREE.Object3D, metrics: Metrics): (x: number, z: number) => number {
  const mesh = model.getObjectByProperty('isMesh', true) as THREE.Mesh;
  const position = mesh.geometry.getAttribute('position');
  const segments = Math.round(Math.sqrt(position.count)) - 1;
  const width = segments + 1;
  const stepX = (metrics.bounds.max.x - metrics.bounds.min.x) / segments;
  const stepZ = (metrics.bounds.max.z - metrics.bounds.min.z) / segments;
  const heights = new Float32Array(width * width);
  const seen = new Uint8Array(heights.length);
  const point = new THREE.Vector3();
  model.updateMatrixWorld(true);
  for (let index = 0; index < position.count; index += 1) {
    point.fromBufferAttribute(position as THREE.BufferAttribute, index);
    mesh.localToWorld(point);
    const column = Math.round((point.x - metrics.bounds.min.x) / stepX);
    const row = Math.round((point.z - metrics.bounds.min.z) / stepZ);
    const cell = row * width + column;
    if (column < 0 || column > segments || row < 0 || row > segments || seen[cell]) throw new Error('invalid terrain grid');
    heights[cell] = point.y;
    seen[cell] = 1;
  }
  if (seen.some((value) => value !== 1)) throw new Error('incomplete terrain grid');
  return (x, z) => {
    const gx = THREE.MathUtils.clamp((x - metrics.bounds.min.x) / stepX, 0, segments);
    const gz = THREE.MathUtils.clamp((z - metrics.bounds.min.z) / stepZ, 0, segments);
    const x0 = Math.floor(gx);
    const z0 = Math.floor(gz);
    const x1 = Math.min(x0 + 1, segments);
    const z1 = Math.min(z0 + 1, segments);
    const north = THREE.MathUtils.lerp(heights[z0 * width + x0]!, heights[z0 * width + x1]!, gx - x0);
    const south = THREE.MathUtils.lerp(heights[z1 * width + x0]!, heights[z1 * width + x1]!, gx - x0);
    return THREE.MathUtils.lerp(north, south, gz - z0);
  };
}

function preparePanorama(model: THREE.Object3D): void {
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.frustumCulled = false;
    mesh.renderOrder = -100;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  for (const material of materials) {
    const fogMaterial = material as THREE.Material & { fog?: boolean };
    const compile = material.onBeforeCompile.bind(material);
    fogMaterial.fog = false;
    material.transparent = false;
    material.depthWrite = false;
    material.depthTest = true;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.vertexShader = shader.vertexShader.replace(
        '#include <project_vertex>',
        '#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.999999;',
      );
    };
    material.needsUpdate = true;
  }
}

function keepLandmarkPaintReadable(model: THREE.Object3D): void {
  model.traverse((node) => {
    const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
    if (!mesh.isMesh || Array.isArray(mesh.material) || !mesh.material.isMeshStandardMaterial || !mesh.material.map) return;
    mesh.material.emissive.set('#ffffff');
    mesh.material.emissiveMap = mesh.material.map;
    mesh.material.emissiveIntensity = 3;
  });
}

function hidePaintedGround(host: Host): HiddenRelief[] { return hidePaintedRelief(host); }
function featherTerrainEdge(model: THREE.Object3D, bounds: THREE.Box3, host: Host): void {
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.renderOrder = 0.1;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  const halfX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const halfZ = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
  const poolSources = Array.from({ length: NIGHT_POOL_SHADER_CAP }, () => new THREE.Vector4());
  const poolCount = { value: 0 };
  const poolDarkness = { value: 0 };
  const poolIntensity = { value: Balance.contracts.nightShift.terrainPoolIntensity };
  const poolFalloff = { value: Balance.contracts.nightShift.lightFalloff };
  let lastUpdatedFrame = -1;
  const updateNightPools = (renderer: THREE.WebGLRenderer) => {
    if (renderer.info.render.frame === lastUpdatedFrame) return;
    lastUpdatedFrame = renderer.info.render.frame;
    const snapshot = host.nightLighting?.();
    poolDarkness.value = snapshot?.darkness ?? 0;
    const sources = snapshot?.sources
      .filter((source) => source.kind !== 'watch')
      .sort((a, b) => nightPoolPriority(a) - nightPoolPriority(b) || a.id.localeCompare(b.id))
      .slice(0, NIGHT_POOL_SHADER_CAP) ?? [];
    poolCount.value = sources.length;
    for (let index = 0; index < NIGHT_POOL_SHADER_CAP; index += 1) {
      const source = sources[index];
      poolSources[index]!.set(source?.x ?? 0, source?.z ?? 0, source?.radius ?? 0, isWarmPool(source) ? 1 : 0);
    }
    host.canvas.dataset.terrain3dPilotNightPoolSources = String(sources.length);
  };
  for (const material of materials) {
    if (!(material as THREE.MeshStandardMaterial).isMeshStandardMaterial) continue;
    const compile = material.onBeforeCompile.bind(material);
    material.transparent = true;
    material.depthWrite = false;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.uTerrain3dNightPoolCount = poolCount;
      shader.uniforms.uTerrain3dNightPoolDarkness = poolDarkness;
      shader.uniforms.uTerrain3dNightPoolIntensity = poolIntensity;
      shader.uniforms.uTerrain3dNightPoolFalloff = poolFalloff;
      shader.uniforms.uTerrain3dNightPools = { value: poolSources };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTerrain3dWorld;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTerrain3dWorld = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          `#include <common>\nvarying vec2 vTerrain3dWorld;\nuniform float uTerrain3dNightPoolCount;\nuniform float uTerrain3dNightPoolDarkness;\nuniform float uTerrain3dNightPoolIntensity;\nuniform float uTerrain3dNightPoolFalloff;\nuniform vec4 uTerrain3dNightPools[${NIGHT_POOL_SHADER_CAP}];`,
        )
        .replace(
          '#include <emissivemap_fragment>',
          `#include <emissivemap_fragment>\nvec3 terrain3dPoolLight = vec3(0.0);\nfor (int terrain3dPoolIndex = 0; terrain3dPoolIndex < ${NIGHT_POOL_SHADER_CAP}; terrain3dPoolIndex++) {\n  if (float(terrain3dPoolIndex) >= uTerrain3dNightPoolCount) break;\n  vec4 terrain3dPool = uTerrain3dNightPools[terrain3dPoolIndex];\n  float terrain3dPoolFalloffT = clamp((distance(vTerrain3dWorld, terrain3dPool.xy) - terrain3dPool.z) / uTerrain3dNightPoolFalloff, 0.0, 1.0);\n  float terrain3dPoolFalloff = pow(1.0 - terrain3dPoolFalloffT, 3.0);\n  vec3 terrain3dPoolTint = mix(vec3(0.10, 0.54, 0.60), vec3(1.00, 0.48, 0.16), step(0.5, terrain3dPool.w));\n  terrain3dPoolLight = max(terrain3dPoolLight, terrain3dPoolTint * terrain3dPoolFalloff);\n}\ntotalEmissiveRadiance += terrain3dPoolLight * uTerrain3dNightPoolDarkness * uTerrain3dNightPoolIntensity;`,
        )
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>\nfloat terrain3dEdge = max(abs(vTerrain3dWorld.x) / ${halfX.toFixed(3)}, abs(vTerrain3dWorld.y) / ${halfZ.toFixed(3)});\ndiffuseColor.a *= 1.0 - smoothstep(${((halfX - SKIRT_INSET) / halfX).toFixed(4)}, 1.0, terrain3dEdge);`,
        );
    };
    material.needsUpdate = true;
  }
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.isMesh) mesh.onBeforeRender = updateNightPools;
  });
  host.canvas.dataset.terrain3dPilotNightPools = 'world-shader';
  host.canvas.dataset.terrain3dPilotNightPoolSources = '0';
}

function nightPoolPriority(source: LightSource): number {
  if (source.kind === 'hero') return 0;
  if (source.kind === 'prospector') return 1;
  if (source.kind === 'lantern' || source.kind === 'powered-lamp') return 2;
  return 3;
}

function isWarmPool(source: LightSource | undefined): boolean {
  return source?.kind !== 'hero' && source?.kind !== 'prospector';
}

function hidePaintedRelief(host: Host): HiddenRelief[] {
  const objects = new Set<THREE.Object3D>();
  host.scene.traverse((object) => {
    if (
      object.userData.terrainRelief === true ||
      object.userData.terrainVista === true ||
      LEGACY_GROUND_SLOTS.has(String(object.userData.assetSlot)) ||
      object.name === 'SpringPonds' ||
      object.name === 'FordSteppingStones' ||
      object.name.startsWith('RiverGravelBar.')
    ) objects.add(object);
  });
  if (host.paintedGround) objects.add(host.paintedGround);
  const hidden = [...objects].map((object) => ({ object, visible: object.visible }));
  for (const { object } of hidden) object.visible = false;
  return hidden;
}

function createContinuation(
  terrain: THREE.Object3D,
  panorama: THREE.Object3D,
  heightAt: (x: number, z: number) => number,
  bounds: THREE.Box3,
): THREE.Mesh | undefined {
  const source = terrain.getObjectByProperty('isMesh', true) as THREE.Mesh | undefined;
  if (!source || Array.isArray(source.material)) return undefined;
  panorama.updateMatrixWorld(true);
  const point = new THREE.Vector3();
  let outerRadius = Number.POSITIVE_INFINITY;
  let outerHeight = 0;
  let innerChebyshev = Number.POSITIVE_INFINITY;
  panorama.traverse((object) => {
    const mesh = object as THREE.Mesh;
    const position = mesh.isMesh ? mesh.geometry.getAttribute('position') : undefined;
    if (!position) return;
    for (let index = 0; index < position.count; index += 1) {
      point.fromBufferAttribute(position as THREE.BufferAttribute, index);
      mesh.localToWorld(point);
      innerChebyshev = Math.min(innerChebyshev, Math.max(Math.abs(point.x), Math.abs(point.z)));
      const radius = Math.hypot(point.x, point.z);
      if (radius < outerRadius) {
        outerRadius = radius;
        outerHeight = point.y;
      }
    }
  });
  const halfX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const halfZ = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
  if (!Number.isFinite(outerRadius) || innerChebyshev <= Math.max(halfX, halfZ) + 0.5) return undefined;

  const edgeSegments = 32;
  const edge: Array<[number, number]> = [];
  for (let index = 0; index < edgeSegments; index += 1) edge.push([THREE.MathUtils.lerp(-halfX, halfX, index / edgeSegments), -halfZ]);
  for (let index = 0; index < edgeSegments; index += 1) edge.push([halfX, THREE.MathUtils.lerp(-halfZ, halfZ, index / edgeSegments)]);
  for (let index = 0; index < edgeSegments; index += 1) edge.push([THREE.MathUtils.lerp(halfX, -halfX, index / edgeSegments), halfZ]);
  for (let index = 0; index < edgeSegments; index += 1) edge.push([-halfX, THREE.MathUtils.lerp(halfZ, -halfZ, index / edgeSegments)]);
  const rings = Math.max(2, Math.min(32, Math.ceil((outerRadius - Math.max(halfX, halfZ)) / 5)));
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let ring = 0; ring <= rings; ring += 1) {
    const mix = ring / rings;
    const eased = mix * mix * (3 - 2 * mix);
    for (const [innerX, innerZ] of edge) {
      const innerRadius = Math.hypot(innerX, innerZ);
      const outerX = innerX / innerRadius * outerRadius;
      const outerZ = innerZ / innerRadius * outerRadius;
      const x = THREE.MathUtils.lerp(innerX, outerX, mix);
      const z = THREE.MathUtils.lerp(innerZ, outerZ, mix);
      const distance = Math.hypot(x - innerX, z - innerZ);
      const repeated = distance % (CONTINUATION_SAMPLE_DEPTH * 2);
      const sampleDepth = repeated <= CONTINUATION_SAMPLE_DEPTH ? repeated : CONTINUATION_SAMPLE_DEPTH * 2 - repeated;
      const sampleX = innerX - innerX / innerRadius * sampleDepth;
      const sampleZ = innerZ - innerZ / innerRadius * sampleDepth;
      positions.push(x, THREE.MathUtils.lerp(heightAt(innerX, innerZ), outerHeight, eased), z);
      uvs.push((sampleX - bounds.min.x) / (bounds.max.x - bounds.min.x), (bounds.max.z - sampleZ) / (bounds.max.z - bounds.min.z));
    }
  }
  for (let ring = 0; ring < rings; ring += 1) {
    for (let index = 0; index < edge.length; index += 1) {
      const next = (index + 1) % edge.length;
      const a = ring * edge.length + index;
      const b = ring * edge.length + next;
      const c = (ring + 1) * edge.length + index;
      const d = (ring + 1) * edge.length + next;
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setAttribute('uv1', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  const material = source.material.clone();
  material.side = THREE.DoubleSide;
  (material as THREE.Material & { fog?: boolean }).fog = false;
  material.depthWrite = false;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace(
      '#include <project_vertex>',
      '#include <project_vertex>\ngl_Position.z = gl_Position.w * 0.99999;',
    );
  };
  const continuation = new THREE.Mesh(geometry, material);
  continuation.frustumCulled = false;
  continuation.renderOrder = -50;
  continuation.name = 'Terrain3dSculptContinuation';
  continuation.userData.terrain3dSkirtBlend = true;
  return continuation;
}

export function installTerrain3dClaimPilot(host: Host): () => void {
  const selected = REGISTRY[host.contractId];
  host.canvas.dataset.terrain3dPilotContract = host.contractId;
  if (performanceTierDiagnostics().tier === 'lite') {
    host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'lite';
    publish(host.canvas, 'lite', 'painted');
    return () => undefined;
  }
  if (!selected || selected.contract.tileId !== host.tileId) {
    host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'off';
    publish(host.canvas, 'failed', 'painted');
    return () => undefined;
  }
  let disposed = false;
  let terrain: THREE.Object3D | undefined;
  let panorama: THREE.Object3D | undefined;
  let landmarks: THREE.Group | undefined;
  let skirt: THREE.Object3D | undefined;
  let hiddenRelief: HiddenRelief[] = [];
  let loadedTerrain: THREE.Object3D | undefined;
  let loadedPanorama: THREE.Object3D | undefined;
  let loadFailed = false;
  let uninstallHeightSource: (() => void) | undefined;
  host.canvas.dataset.terrain3dPilotTerrainLoadState = 'pending';
  host.canvas.dataset.terrain3dPilotPanoramaLoadState = 'pending';
  host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'pending';
  publish(host.canvas, 'loading', 'painted');
  const loader = new GLTFLoader();
  const disposeLoaded = () => {
    if (loadedTerrain) {
      disposeObject3D(loadedTerrain);
      host.canvas.dataset.terrain3dPilotTerrainLoadState = 'disposed';
    }
    if (loadedPanorama) {
      disposeObject3D(loadedPanorama);
      host.canvas.dataset.terrain3dPilotPanoramaLoadState = 'disposed';
    }
    loadedTerrain = undefined;
    loadedPanorama = undefined;
  };
  const failLoad = () => {
    loadFailed = true;
    disposeLoaded();
    if (!disposed) publish(host.canvas, 'failed', 'painted');
  };
  const installLoaded = () => {
    if (!loadedTerrain || !loadedPanorama || loadFailed) return;
    const nextTerrain = loadedTerrain;
    const nextPanorama = loadedPanorama;
    const terrainMetrics = inspect(nextTerrain, true);
    const panoramaMetrics = inspect(nextPanorama, false);
    try {
      const terrainValid = validTerrain(terrainMetrics, selected.contract);
      const panoramaValid = validPanorama(panoramaMetrics, selected.panoramaContract, selected.contract.panoramaMount);
      if (!terrainValid || !panoramaValid) {
        host.canvas.dataset.terrain3dPilotFailure = `terrain:${terrainValid};panorama:${panoramaValid}`;
        throw new Error('terrain contract mismatch');
      }
      const heightAt = bakeHeightGrid(nextTerrain, terrainMetrics);
      if (disposed) throw new Error('terrain pilot disposed');
      nextTerrain.name = 'Terrain3dClaimPilot';
      if (host.nightMode) featherTerrainEdge(nextTerrain, terrainMetrics.bounds, host);
      else {
        host.canvas.dataset.terrain3dPilotNightPools = 'off';
        host.canvas.dataset.terrain3dPilotNightPoolSources = '0';
      }
      const mount = selected.contract.panoramaMount;
      nextPanorama.name = mount.id;
      nextPanorama.position.fromArray(mount.position);
      nextPanorama.rotation.set(...mount.rotation);
      nextPanorama.scale.fromArray(mount.scale);
      preparePanorama(nextPanorama);
      const nextSkirt = createContinuation(nextTerrain, nextPanorama, heightAt, terrainMetrics.bounds);
      terrain = nextTerrain;
      panorama = nextPanorama;
      skirt = nextSkirt;
      loadedTerrain = undefined;
      loadedPanorama = undefined;
      uninstallHeightSource = installVisualHeightSource(heightAt);
      host.onVisualHeightSourceInstalled?.();
      host.scene.add(nextTerrain, nextPanorama);
      if (nextSkirt) host.scene.add(nextSkirt);
      hiddenRelief = hidePaintedGround(host);
      host.canvas.dataset.terrain3dPilotTerrainLoadState = 'mounted';
      host.canvas.dataset.terrain3dPilotPanoramaLoadState = 'mounted';
      host.canvas.dataset.terrain3dPilotHiddenRelief = String(hiddenRelief.length);
      host.canvas.dataset.terrain3dPilotHiddenGroundLayers = hiddenRelief
        .map(({ object }) => object.name || String(object.userData.assetSlot))
        .filter(Boolean)
        .join('|');
      host.canvas.dataset.terrain3dPilotContinuation = nextSkirt ? 'sculpt-edge-continuation' : 'panorama-owned-continuation';
      host.canvas.dataset.terrain3dPilotPanoramaFraming = 'world-projected-horizon';
      // Keep the original probe values until the registry contract is migrated.
      host.canvas.dataset.terrain3dPilotSkirtBlend = 'painted-underlay-alpha-rim';
      host.canvas.dataset.terrain3dPilotPanoramaFog = 'excluded';
      host.canvas.dataset.terrain3dPilotPanoramaDepth = 'screen-horizon-backdrop';
      const mounts = (selected.contract.landmarkMounts ?? []).filter((mount) => mount.asset);
      host.canvas.dataset.terrain3dPilotLandmarkExpected = String(mounts.length);
      const assets = new Map<string, Promise<THREE.Object3D | undefined>>();
      const diagnostics: string[] = [];
      const nextLandmarks = new THREE.Group();
      nextLandmarks.name = 'Terrain3dLandmarks';
      nextLandmarks.userData.renderOnly = true;
      const loadMount = async (mount: LandmarkMount): Promise<THREE.Object3D | undefined> => {
        try {
          const key = `../../assets/pilots/map-rebuild-spike/${mount.asset}`;
          const resolveUrl = LANDMARK_ASSETS[key];
          if (!resolveUrl) {
            diagnostics.push(`${mount.id}: asset unavailable`);
            return undefined;
          }
          let asset = assets.get(key);
          if (!asset) {
            asset = resolveUrl().then((url) => loader.loadAsync(url).then((gltf) => gltf.scene, () => undefined), () => undefined);
            assets.set(key, asset);
          }
          const source = await asset;
          if (!source) {
            diagnostics.push(`${mount.id}: asset invalid`);
            return undefined;
          }
          const model = source;
          model.name = mount.id;
          model.userData.landmarkAsset = key;
          model.userData.renderOnly = true;
          model.position.set(mount.position[0], heightAt(mount.position[0], mount.position[2]) + mount.position[1], mount.position[2]);
          model.rotation.set(...mount.rotation);
          model.scale.fromArray(mount.scale);
          inspect(model, false);
          if (host.contractId !== 'e1-night-shift') keepLandmarkPaintReadable(model);
          return model;
        } catch {
          diagnostics.push(`${mount.id}: asset invalid`);
          return undefined;
        }
      };
      void Promise.all(mounts.map(loadMount)).then((models) => {
        for (const model of models) if (model) nextLandmarks.add(model);
        if (disposed) {
          disposeObject3D(nextLandmarks);
          host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'disposed';
          return;
        }
        landmarks = nextLandmarks;
        host.scene.add(nextLandmarks);
        host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'mounted';
        host.canvas.dataset.terrain3dPilotLandmarks = String(nextLandmarks.children.length);
        host.canvas.dataset.terrain3dPilotLandmarkSkipped = String(diagnostics.length);
        host.canvas.dataset.terrain3dPilotLandmarkDiagnostics = diagnostics.join('; ');
        host.canvas.dataset.terrain3dPilotLandmarkMounts = JSON.stringify(nextLandmarks.children.map((model) => ({
          id: model.name,
          x: model.position.x,
          y: model.position.y,
          z: model.position.z,
        })));
        host.canvas.dataset.terrain3dPilotLandmarkMaterials = JSON.stringify(nextLandmarks.children.map((model) => {
          const materials = new Set<THREE.Material>();
          model.traverse((node) => {
            const mesh = node as THREE.Mesh;
            if (mesh.isMesh) for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
          });
          return {
            id: model.name,
            total: materials.size,
            transparent: [...materials].filter((material) => material.transparent).length,
            depthWriteDisabled: [...materials].filter((material) => !material.depthWrite).length,
          };
        }));
        publish(host.canvas, 'ready', 'glb', terrainMetrics, nextPanorama, panoramaMetrics);
      });
    } catch {
      disposeObject3D(nextTerrain);
      disposeObject3D(nextPanorama);
      loadedTerrain = undefined;
      loadedPanorama = undefined;
      if (!disposed) publish(host.canvas, 'failed', 'painted', terrainMetrics, undefined, panoramaMetrics);
    }
  };
  const receive = (kind: 'terrain' | 'panorama', model: THREE.Object3D) => {
    if (disposed || loadFailed) {
      disposeObject3D(model);
      host.canvas.dataset[kind === 'terrain' ? 'terrain3dPilotTerrainLoadState' : 'terrain3dPilotPanoramaLoadState'] = 'disposed';
      return;
    }
    if (kind === 'terrain') loadedTerrain = model;
    else loadedPanorama = model;
    host.canvas.dataset[kind === 'terrain' ? 'terrain3dPilotTerrainLoadState' : 'terrain3dPilotPanoramaLoadState'] = 'loaded';
    installLoaded();
  };
  void loader.loadAsync(selected.terrainUrl).then((gltf) => receive('terrain', gltf.scene), failLoad);
  void loader.loadAsync(selected.panoramaUrl).then((gltf) => receive('panorama', gltf.scene), failLoad);

  return () => {
    disposed = true;
    disposeLoaded();
    uninstallHeightSource?.();
    uninstallHeightSource = undefined;
    for (const { object, visible } of hiddenRelief) object.visible = visible;
    hiddenRelief = [];
    if (skirt) {
      host.scene.remove(skirt);
      disposeObject3D(skirt);
      skirt = undefined;
    }
    for (const model of [terrain, panorama, landmarks]) {
      if (!model) continue;
      host.scene.remove(model);
      disposeObject3D(model);
    }
    terrain = undefined;
    panorama = undefined;
    landmarks = undefined;
    host.canvas.dataset.terrain3dPilotLandmarkLoadState = 'disposed';
  };
}
