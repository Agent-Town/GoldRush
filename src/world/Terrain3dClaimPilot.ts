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
};
const LANDMARK_ASSETS = import.meta.glob('../../assets/pilots/map-rebuild-spike/landmarks/**/*.glb', { query: '?url', import: 'default' }) as Record<string, () => Promise<string>>;
const BOUNDS_EPSILON = 0.03;
const SKIRT_INSET = 2.5;

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
    mesh.renderOrder = 0.5;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  for (const material of materials) {
    const fogMaterial = material as THREE.Material & { fog?: boolean };
    const compile = material.onBeforeCompile.bind(material);
    fogMaterial.fog = false;
    material.transparent = true;
    material.depthWrite = false;
    material.depthTest = false;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying float vPanoramaNdcY;')
        .replace(
          '#include <project_vertex>',
          '#include <project_vertex>\nvPanoramaNdcY = mix(0.94, 0.58, uv.y);\ngl_Position = vec4(uv.x * 2.0 - 1.0, vPanoramaNdcY, 0.999999, 1.0);',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying float vPanoramaNdcY;')
        .replace(
          '#include <color_fragment>',
          '#include <color_fragment>\ndiffuseColor.a *= smoothstep(0.58, 0.64, vPanoramaNdcY) * (1.0 - smoothstep(0.90, 0.94, vPanoramaNdcY));',
        );
    };
    material.needsUpdate = true;
  }
}

function featherTerrainEdge(model: THREE.Object3D, bounds: THREE.Box3): void {
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.renderOrder = 0.1;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  const halfX = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x));
  const halfZ = Math.max(Math.abs(bounds.min.z), Math.abs(bounds.max.z));
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    material.transparent = true;
    material.depthWrite = false;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTerrain3dWorld;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTerrain3dWorld = (modelMatrix * vec4(position, 1.0)).xz;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vTerrain3dWorld;')
        .replace(
          '#include <color_fragment>',
          `#include <color_fragment>\nfloat terrain3dEdge = max(abs(vTerrain3dWorld.x) / ${halfX.toFixed(3)}, abs(vTerrain3dWorld.y) / ${halfZ.toFixed(3)});\ndiffuseColor.a *= 1.0 - smoothstep(${((halfX - SKIRT_INSET) / halfX).toFixed(4)}, 1.0, terrain3dEdge);`,
        );
    };
    material.needsUpdate = true;
  }
}

function hidePaintedRelief(host: Host): HiddenRelief[] {
  const objects = new Set<THREE.Object3D>();
  host.scene.traverse((object) => {
    if (object.userData.terrainRelief === true) objects.add(object);
  });
  if (host.paintedGround) objects.add(host.paintedGround);
  const hidden = [...objects].map((object) => ({ object, visible: object.visible }));
  for (const { object } of hidden) object.visible = false;
  return hidden;
}

function createSkirt(host: Host, heightAt: (x: number, z: number) => number, bounds: THREE.Box3): THREE.Object3D | undefined {
  if (!host.paintedGround) return undefined;
  const group = new THREE.Group();
  const underlay = host.paintedGround.clone();
  underlay.visible = true;
  underlay.userData.terrainRelief = false;
  group.add(underlay);
  let apron: THREE.Mesh | undefined;
  host.scene.traverse((object) => {
    if (!apron && object.userData.terrainVista === true) apron = object as THREE.Mesh;
  });
  const source = host.paintedGround as THREE.Mesh;
  const material = Array.isArray(source.material) ? undefined : source.material as THREE.Material & { color?: THREE.Color; map?: THREE.Texture | null };
  if (apron?.isMesh && material?.map) {
    apron.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const inner = Math.max(Math.abs(bounds.min.x), Math.abs(bounds.max.x)) - 0.5;
    const outer = inner + 4;
    const segments = 24;
    const edgePoint = (side: number, t: number, half: number): [number, number] => side === 0
      ? [THREE.MathUtils.lerp(-half, half, t), -half]
      : side === 1 ? [half, THREE.MathUtils.lerp(-half, half, t)]
        : side === 2 ? [THREE.MathUtils.lerp(half, -half, t), half]
          : [-half, THREE.MathUtils.lerp(half, -half, t)];
    for (let side = 0; side < 4; side += 1) {
      const base = positions.length / 3;
      for (let index = 0; index <= segments; index += 1) {
        const t = index / segments;
        const [ix, iz] = edgePoint(side, t, inner);
        const [ox, oz] = edgePoint(side, t, outer);
        raycaster.set(new THREE.Vector3(ox, 100, oz), new THREE.Vector3(0, -1, 0));
        const outerY = raycaster.intersectObject(apron, false)[0]?.point.y ?? heightAt(ox, oz);
        positions.push(ix, -iz, heightAt(ix, iz) + 0.02, ox, -oz, outerY + 0.02);
        uvs.push((ix - bounds.min.x) / (bounds.max.x - bounds.min.x), (iz - bounds.min.z) / (bounds.max.z - bounds.min.z));
        uvs.push((ox - bounds.min.x) / (bounds.max.x - bounds.min.x), (oz - bounds.min.z) / (bounds.max.z - bounds.min.z));
        if (index < segments) {
          const a = base + index * 2;
          indices.push(a, a + 3, a + 1, a, a + 2, a + 3);
        }
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(positions.length / 3).fill([0, 0, 1]).flat(), 3));
    const bridgeMaterial = material.clone();
    bridgeMaterial.onBeforeCompile = material.onBeforeCompile;
    bridgeMaterial.side = THREE.DoubleSide;
    const bridge = new THREE.Mesh(geometry, bridgeMaterial);
    bridge.name = 'Terrain3dApronBlendBridge';
    bridge.rotation.x = -Math.PI / 2;
    group.add(bridge);
  }
  group.name = 'Terrain3dApronBlendSkirt';
  group.userData.terrain3dSkirtBlend = true;
  return group;
}

export function installTerrain3dClaimPilot(host: Host): () => void {
  const selected = REGISTRY[host.contractId];
  host.canvas.dataset.terrain3dPilotContract = host.contractId;
  if (new URLSearchParams(window.location.search).get('tier') === 'lite') {
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
      featherTerrainEdge(nextTerrain, terrainMetrics.bounds);
      const mount = selected.contract.panoramaMount;
      nextPanorama.name = mount.id;
      nextPanorama.position.fromArray(mount.position);
      nextPanorama.rotation.set(...mount.rotation);
      nextPanorama.scale.fromArray(mount.scale);
      preparePanorama(nextPanorama);
      const nextSkirt = createSkirt(host, heightAt, terrainMetrics.bounds);
      terrain = nextTerrain;
      panorama = nextPanorama;
      skirt = nextSkirt;
      loadedTerrain = undefined;
      loadedPanorama = undefined;
      uninstallHeightSource = installVisualHeightSource(heightAt);
      host.onVisualHeightSourceInstalled?.();
      host.scene.add(nextTerrain, nextPanorama);
      if (nextSkirt) host.scene.add(nextSkirt);
      hiddenRelief = hidePaintedRelief(host);
      host.canvas.dataset.terrain3dPilotTerrainLoadState = 'mounted';
      host.canvas.dataset.terrain3dPilotPanoramaLoadState = 'mounted';
      host.canvas.dataset.terrain3dPilotHiddenRelief = String(hiddenRelief.length);
      host.canvas.dataset.terrain3dPilotSkirtBlend = nextSkirt ? 'painted-underlay-alpha-rim' : 'off';
      host.canvas.dataset.terrain3dPilotPanoramaFog = 'excluded';
      host.canvas.dataset.terrain3dPilotPanoramaDepth = 'screen-horizon-backdrop';
      const mounts = (selected.contract.landmarkMounts ?? []).filter((mount) => mount.asset);
      host.canvas.dataset.terrain3dPilotLandmarkExpected = String(mounts.length);
      const assets = new Map<string, Promise<THREE.Object3D | undefined>>();
      const diagnostics: string[] = [];
      const nextLandmarks = new THREE.Group();
      nextLandmarks.name = 'Terrain3dLandmarks';
      nextLandmarks.userData.renderOnly = true;
      const loadMount = async (mount: LandmarkMount) => {
        try {
          const key = `../../assets/pilots/map-rebuild-spike/${mount.asset}`;
          const resolveUrl = LANDMARK_ASSETS[key];
          if (!resolveUrl) {
            diagnostics.push(`${mount.id}: asset unavailable`);
            return;
          }
          let asset = assets.get(key);
          if (!asset) {
            asset = resolveUrl().then((url) => loader.loadAsync(url).then((gltf) => gltf.scene, () => undefined), () => undefined);
            assets.set(key, asset);
          }
          const source = await asset;
          if (!source) {
            diagnostics.push(`${mount.id}: asset invalid`);
            return;
          }
          const model = [...nextLandmarks.children].some((child) => child.userData.landmarkAsset === key) ? source.clone() : source;
          model.name = mount.id;
          model.userData.landmarkAsset = key;
          model.userData.renderOnly = true;
          model.position.set(mount.position[0], heightAt(mount.position[0], mount.position[2]) + mount.position[1], mount.position[2]);
          model.rotation.set(...mount.rotation);
          model.scale.fromArray(mount.scale);
          inspect(model, false);
          nextLandmarks.add(model);
        } catch {
          diagnostics.push(`${mount.id}: asset invalid`);
        }
      };
      void Promise.all(mounts.map(loadMount)).then(() => {
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
      const bridge = skirt.getObjectByName('Terrain3dApronBlendBridge') as THREE.Mesh | undefined;
      bridge?.geometry.dispose();
      if (bridge) (bridge.material as THREE.Material).dispose();
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
