import * as THREE from 'three';
import { trackedGltfLoader } from '../assets/AssetLoading';
import { activeEpoch } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';
import { TOWN_LEGACY_PAN_NAME, townBuildings, townEraPropsForOrder, townPlazaSlot, townPropRing } from './townLayout';

const MODEL_PATHS = {
  tavern: {
    base: '../../assets/pilots/tavern-3d/town-v3-tavern.glb',
    variant: '../../assets/pilots/tavern-3d/tavern.glb',
  },
  general_store: { base: '../../assets/pilots/general-store-3d/general-store.glb', variant: '../../assets/pilots/general-store-3d/general-store.glb' },
  claim_office: { base: '../../assets/pilots/claim-office-3d/claim-office.glb', variant: '../../assets/pilots/claim-office-3d/claim-office.glb' },
  assay_office: { base: '../../assets/pilots/assay-office-3d/assay-office.glb', variant: '../../assets/pilots/assay-office-3d/assay-office.glb' },
  chapel: { base: '../../assets/pilots/chapel-3d/chapel.glb', variant: '../../assets/pilots/chapel-3d/chapel.glb' },
  schoolhouse: { base: '../../assets/pilots/schoolhouse-3d/schoolhouse.glb', variant: '../../assets/pilots/schoolhouse-3d/schoolhouse.glb' },
  'stamp-mill': { base: '../../assets/pilots/stamp-mill-3d/stamp-mill.glb', variant: '../../assets/pilots/stamp-mill-3d/stamp-mill.glb' },
  dynamo_hall: { base: '../../assets/pilots/dynamo-hall-3d/dynamo-hall.glb', variant: '../../assets/pilots/dynamo-hall-3d/dynamo-hall.glb' },
} as const;
const BASE_MODEL_URLS: Record<string, string> = {
  [MODEL_PATHS.tavern.base]: new URL('../../assets/pilots/tavern-3d/town-v3-tavern.glb', import.meta.url).href,
  [MODEL_PATHS.general_store.base]: new URL('../../assets/pilots/general-store-3d/general-store.glb', import.meta.url).href,
  [MODEL_PATHS.claim_office.base]: new URL('../../assets/pilots/claim-office-3d/claim-office.glb', import.meta.url).href,
  [MODEL_PATHS.assay_office.base]: new URL('../../assets/pilots/assay-office-3d/assay-office.glb', import.meta.url).href,
  [MODEL_PATHS.chapel.base]: new URL('../../assets/pilots/chapel-3d/chapel.glb', import.meta.url).href,
  [MODEL_PATHS.schoolhouse.base]: new URL('../../assets/pilots/schoolhouse-3d/schoolhouse.glb', import.meta.url).href,
  [MODEL_PATHS['stamp-mill'].base]: new URL('../../assets/pilots/stamp-mill-3d/stamp-mill.glb', import.meta.url).href,
  [MODEL_PATHS.dynamo_hall.base]: new URL('../../assets/pilots/dynamo-hall-3d/dynamo-hall.glb', import.meta.url).href,
};
const BUNDLED_VARIANT_URLS = import.meta.glob('../../assets/pilots/*-3d/*.e*.glb', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>;
const TOWN_PLATE_MODEL_URL = new URL('../../assets/pilots/town-plate-3d/town-plate.glb', import.meta.url).href;
const PROP_MODEL_URLS = {
  covered_wagon: new URL('../../assets/pilots/plaza-props-3d/covered_wagon.glb', import.meta.url).href,
  water_trough: new URL('../../assets/pilots/plaza-props-3d/water_trough.glb', import.meta.url).href,
  pan_monument: new URL('../../assets/pilots/plaza-props-3d/pan_monument.glb', import.meta.url).href,
} as const;
const MAX_TRIANGLES = 15_000;
const MAX_MATERIALS = 1;
const BOUNDS_EPSILON = 0.06;
const MAX_ANCHOR_PARTICLES = 128;

type Host = { scene: THREE.Scene; canvas: HTMLCanvasElement };
type PilotState = 'loading' | 'loaded' | 'error' | 'failed';
type BuildingId = Exclude<keyof typeof MODEL_PATHS, 'dynamo_hall'>;
type ModelCandidate = { era: number; url: string };
type BuildingOrientation = { width: number; height: number; depth: number; upY: number };
type AnchorEmitterKind = 'steam' | 'arc' | 'dust';
type AnchorEmitter = {
  era: number;
  prefix: string;
  kind: AnchorEmitterKind;
  instancesPerAnchor: number;
  meshName: string;
  anchorDataset: string;
  particleDataset: string;
};

const ANCHOR_EMITTERS: readonly AnchorEmitter[] = [
  { era: 2, prefix: 'steam_anchor_', kind: 'steam', instancesPerAnchor: 2, meshName: 'TownSteamPlumePool', anchorDataset: 'town3dSteamAnchors', particleDataset: 'town3dSteamPlumes' },
  { era: 3, prefix: 'arc_anchor_', kind: 'arc', instancesPerAnchor: 2, meshName: 'TownArcFlickerPool', anchorDataset: 'town3dArcAnchors', particleDataset: 'town3dArcFlickers' },
  { era: 4, prefix: 'exhaust_anchor_', kind: 'dust', instancesPerAnchor: 2, meshName: 'TownDustPuffPool', anchorDataset: 'town3dExhaustAnchors', particleDataset: 'town3dDustPuffs' },
];
const emitterPools = new WeakMap<THREE.Scene, Map<AnchorEmitterKind, TownAnchorEmitterPool>>();

class TownAnchorEmitterPool {
  private readonly anchors = new Map<string, THREE.Object3D[]>();
  private readonly mesh: THREE.InstancedMesh;
  private readonly object = new THREE.Object3D();
  private frame = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly canvas: HTMLCanvasElement,
    private readonly emitter: AnchorEmitter,
  ) {
    this.mesh = createAnchorEmitterMesh(emitter.kind);
    this.mesh.name = emitter.meshName;
    this.mesh.frustumCulled = false;
    scene.add(this.mesh);
    this.frame = requestAnimationFrame(this.update);
  }

  add(owner: string, anchors: THREE.Object3D[]): void {
    anchors.sort((left, right) => left.name.localeCompare(right.name));
    this.anchors.set(owner, anchors);
    this.publish();
  }

  remove(owner: string): void {
    this.anchors.delete(owner);
    this.publish();
    if (this.anchors.size) return;
    cancelAnimationFrame(this.frame);
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }

  get empty(): boolean {
    return this.anchors.size === 0;
  }

  private readonly update = (at: number): void => {
    const position = new THREE.Vector3();
    let index = 0;
    for (const anchor of [...this.anchors.values()].flat()) {
      anchor.getWorldPosition(position);
      for (let particle = 0; particle < this.emitter.instancesPerAnchor && index < this.mesh.instanceMatrix.count; particle += 1) {
        syncAnchorEmitter(this.object, this.emitter.kind, position, at, particle, index);
        this.object.updateMatrix();
        this.mesh.setMatrixAt(index++, this.object.matrix);
      }
    }
    this.mesh.count = index;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.frame = requestAnimationFrame(this.update);
  };

  private publish(): void {
    const count = [...this.anchors.values()].reduce((sum, anchors) => sum + anchors.length, 0);
    this.canvas.dataset[this.emitter.anchorDataset] = String(count);
    this.canvas.dataset[this.emitter.particleDataset] = String(count * this.emitter.instancesPerAnchor);
  }
}

function createAnchorEmitterMesh(kind: AnchorEmitterKind): THREE.InstancedMesh {
  const geometry = kind === 'arc'
    ? new THREE.BoxGeometry(0.08, 0.34, 0.035)
    : kind === 'dust'
      ? new THREE.CircleGeometry(0.42, 18)
      : new THREE.SphereGeometry(0.38, 10, 8);
  const material = new THREE.MeshBasicMaterial({
    color: kind === 'arc' ? '#83ded7' : kind === 'dust' ? '#c4883a' : '#fff8e8',
    transparent: true,
    opacity: kind === 'arc' ? 0.9 : kind === 'dust' ? 0.34 : 0.5,
    depthWrite: false,
  });
  return new THREE.InstancedMesh(geometry, material, MAX_ANCHOR_PARTICLES);
}

function syncAnchorEmitter(
  object: THREE.Object3D,
  kind: AnchorEmitterKind,
  position: THREE.Vector3,
  at: number,
  particle: number,
  index: number,
): void {
  object.rotation.set(0, 0, 0);
  if (kind === 'steam') {
    const phase = ((at * 0.00018) + particle * 0.48 + index * 0.13) % 1;
    object.position.set(position.x, position.y + phase * 0.7, position.z);
    object.scale.setScalar(0.42 + phase * 0.34);
    return;
  }
  if (kind === 'arc') {
    const phase = ((at * 0.012) + particle * 0.43 + index * 0.19) % 1;
    object.position.set(position.x + (particle ? 0.06 : -0.06), position.y + 0.05 + phase * 0.18, position.z);
    object.rotation.z = phase * Math.PI;
    object.scale.setScalar(0.45 + (Math.sin(at * 0.03 + index * 2.7) + 1) * 0.28);
    return;
  }
  const phase = ((at * 0.0003) + particle * 0.48 + index * 0.17) % 1;
  const angle = index * 2.4;
  object.position.set(position.x + Math.cos(angle) * phase * 0.32, position.y + phase * 0.18, position.z + Math.sin(angle) * phase * 0.32);
  object.rotation.set(-Math.PI / 2, 0, phase * Math.PI);
  object.scale.setScalar(0.38 + phase * 0.45);
}

function eraCandidates(paths: { base: string; variant: string }): ModelCandidate[] {
  const activeOrder = activeEpoch().order;
  return [
    ...Array.from({ length: Math.max(0, activeOrder - 1) }, (_, index) => activeOrder - index)
      .flatMap((era) => {
        const url = variantModelUrl(paths.variant.replace(/\.glb$/, `.e${era}.glb`));
        return url ? [{ era, url }] : [];
      }),
    { era: 1, url: modelUrl(paths.base) },
  ];
}

function modelUrl(path: string): string {
  return BASE_MODEL_URLS[path] ?? new URL(path.replace(/^\.\.\/\.\./, ''), globalThis.location.origin).href;
}

function variantModelUrl(path: string): string | undefined {
  const injected = (globalThis as typeof globalThis & { __GR_TOWN_VARIANT_URLS__?: Record<string, string> }).__GR_TOWN_VARIANT_URLS__?.[path];
  return injected ?? BUNDLED_VARIANT_URLS[path];
}

function addAnchorEmitters(scene: THREE.Scene, canvas: HTMLCanvasElement, owner: string, model: THREE.Object3D, activeEra: number): () => void {
  for (const candidate of ANCHOR_EMITTERS) {
    canvas.dataset[candidate.anchorDataset] ??= '0';
    canvas.dataset[candidate.particleDataset] ??= '0';
  }
  const candidates = ANCHOR_EMITTERS.filter((candidate) => candidate.era === activeEra);
  let emitter: AnchorEmitter | undefined;
  const anchors: THREE.Object3D[] = [];
  model.traverse((node) => {
    const match = candidates.find((candidate) => node.name.startsWith(candidate.prefix));
    if (!match || (emitter && emitter !== match)) return;
    emitter = match;
    anchors.push(node);
  });
  if (!emitter || !anchors.length) return () => {};
  const matchedEmitter = emitter;
  const pools = emitterPools.get(scene) ?? new Map<AnchorEmitterKind, TownAnchorEmitterPool>();
  const pool = pools.get(matchedEmitter.kind) ?? new TownAnchorEmitterPool(scene, canvas, matchedEmitter);
  pools.set(matchedEmitter.kind, pool);
  emitterPools.set(scene, pools);
  pool.add(owner, anchors);
  return () => {
    pool.remove(owner);
    if (!pool.empty) return;
    pools.delete(matchedEmitter.kind);
    if (!pools.size) emitterPools.delete(scene);
  };
}

function publish(
  canvas: HTMLCanvasElement,
  state: PilotState,
  source: 'facade' | 'painted' | 'glb',
  metrics: { meshes?: number; triangles?: number; materials?: number; width?: number; height?: number; depth?: number } = {},
): void {
  canvas.dataset.town3dPilotState = state;
  canvas.dataset.town3dPilotRenderSource = source;
  canvas.dataset.town3dPilotMeshes = String(metrics.meshes ?? 0);
  canvas.dataset.town3dPilotTriangles = String(metrics.triangles ?? 0);
  canvas.dataset.town3dPilotMaterials = String(metrics.materials ?? 0);
  canvas.dataset.town3dPilotBounds = [metrics.width ?? 0, metrics.height ?? 0, metrics.depth ?? 0]
    .map((value) => value.toFixed(3))
    .join('x');
}

function publishBuildingOrientation(canvas: HTMLCanvasElement, id: keyof typeof MODEL_PATHS, model: THREE.Object3D, metrics: ReturnType<typeof inspect>): void {
  const orientations = JSON.parse(canvas.dataset.town3dPilotBuildingOrientations ?? '{}') as Record<string, BuildingOrientation>;
  orientations[id] = {
    width: metrics.width,
    height: metrics.height,
    depth: metrics.depth,
    upY: new THREE.Vector3(0, 1, 0).applyQuaternion(model.getWorldQuaternion(new THREE.Quaternion())).y,
  };
  canvas.dataset.town3dPilotBuildingOrientations = JSON.stringify(orientations);
}

function clearBuildingOrientation(canvas: HTMLCanvasElement, id: keyof typeof MODEL_PATHS): void {
  const orientations = JSON.parse(canvas.dataset.town3dPilotBuildingOrientations ?? '{}') as Record<string, BuildingOrientation>;
  delete orientations[id];
  canvas.dataset.town3dPilotBuildingOrientations = JSON.stringify(orientations);
}

function inspect(model: THREE.Object3D, runtimeEmissive = true): {
  meshes: number;
  triangles: number;
  materials: number;
  width: number;
  height: number;
  depth: number;
  grounded: boolean;
  centered: boolean;
  forbiddenNodes: number;
} {
  let meshes = 0;
  let triangles = 0;
  let forbiddenNodes = 0;
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    if ((node as THREE.Camera).isCamera || (node as THREE.Light).isLight) forbiddenNodes += 1;
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes += 1;
    const geometry = mesh.geometry;
    triangles += Math.floor((geometry.index?.count ?? geometry.attributes.position?.count ?? 0) / 3);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
      if (material instanceof THREE.MeshStandardMaterial) {
        material.roughness = Math.max(material.roughness, 0.82);
        material.metalness = 0;
        if (runtimeEmissive) {
          material.emissive.set(0x4a2a17);
          material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.2);
        }
      }
    }
  });
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  return {
    meshes,
    triangles,
    materials: materials.size,
    width: size.x,
    height: size.y,
    depth: size.z,
    grounded: Math.abs(bounds.min.y) <= BOUNDS_EPSILON,
    centered: Math.abs(center.x) <= BOUNDS_EPSILON && Math.abs(center.z) <= BOUNDS_EPSILON,
    forbiddenNodes,
  };
}

function installTownBuildingPilot(
  { scene, canvas }: Host,
  id: BuildingId,
  modelName: string,
): () => void {
  if (canvas.dataset.town3dPilotState === 'disposed') return () => {};
  let disposed = false;
  let model: THREE.Object3D | undefined;
  let removeEmitters = () => {};
  const shell = scene.getObjectByName(id === 'stamp-mill' ? 'TownStampMillSite' : `TownFacadeAssembly:${id}`);
  const building = id === 'stamp-mill' ? { footprint: { w: 6.2, d: 1.65 } } : townBuildings.find((entry) => entry.id === id)!;
  const slot = townPlazaSlot(id);
  clearBuildingOrientation(canvas, id);
  publish(canvas, 'loading', 'facade');

  const candidates = eraCandidates(MODEL_PATHS[id]);
  const load = (candidateIndex: number): void => trackedGltfLoader(canvas, 'the town').load(
    candidates[candidateIndex]!.url,
    (gltf) => {
      const loaded = gltf.scene;
      const metrics = inspect(loaded, id !== 'assay_office');
      const valid =
        metrics.triangles <= MAX_TRIANGLES &&
        metrics.materials <= MAX_MATERIALS &&
        metrics.width <= building.footprint.w + BOUNDS_EPSILON &&
        metrics.depth <= building.footprint.d + BOUNDS_EPSILON &&
        metrics.grounded &&
        metrics.centered &&
        metrics.forbiddenNodes === 0;
      if (disposed) {
        disposeObject3D(loaded);
        return;
      }
      if (!valid) {
        disposeObject3D(loaded);
        if (candidateIndex + 1 < candidates.length) load(candidateIndex + 1);
        else publish(canvas, 'error', 'facade', metrics);
        return;
      }
      const candidate = candidates[candidateIndex]!;
      loaded.name = modelName;
      loaded.position.set(slot.position.x, 0, slot.position.z);
      loaded.rotation.y = Math.atan2(slot.approach.x - slot.position.x, slot.approach.z - slot.position.z);
      loaded.updateMatrixWorld(true);
      model = loaded;
      scene.add(model);
      publishBuildingOrientation(canvas, id, loaded, metrics);
      removeEmitters = addAnchorEmitters(scene, canvas, id, loaded, activeEpoch().order);
      canvas.dataset.town3dPilotEra = String(candidate.era);
      canvas.dataset.town3dPilotModel = candidate.url;
      canvas.dataset.town3dPilotLoadedIds = [...new Set([...(canvas.dataset.town3dPilotLoadedIds ?? '').split(',').filter(Boolean), id])].join(',');
      if (shell) shell.visible = false;
      publish(canvas, 'loaded', 'glb', metrics);
    },
    undefined,
    () => {
      if (disposed) return;
      if (candidateIndex + 1 < candidates.length) load(candidateIndex + 1);
      else publish(canvas, 'error', 'facade');
    },
  );
  load(0);

  return () => {
    disposed = true;
    clearBuildingOrientation(canvas, id);
    removeEmitters();
    if (shell) shell.visible = true;
    if (!model) return;
    scene.remove(model);
    disposeObject3D(model);
    model = undefined;
    canvas.dataset.town3dPilotLoadedIds = (canvas.dataset.town3dPilotLoadedIds ?? '').split(',').filter((entry) => entry && entry !== id).join(',');
  };
}

export function installTownDynamoHallPilot(host: Host, group: THREE.Group, footprint: { x: number; z: number; w: number; d: number }): () => void {
  const { scene, canvas } = host;
  let disposed = false;
  let model: THREE.Object3D | undefined;
  let removeEmitters = () => {};
  clearBuildingOrientation(canvas, 'dynamo_hall');
  publish(canvas, 'loading', 'facade');
  const candidates = eraCandidates(MODEL_PATHS.dynamo_hall);
  const load = (candidateIndex: number): void => trackedGltfLoader(canvas, 'the town').load(candidates[candidateIndex]!.url, ({ scene: loaded }) => {
    const metrics = inspect(loaded);
    const valid = metrics.triangles <= MAX_TRIANGLES && metrics.materials <= MAX_MATERIALS &&
      metrics.width <= footprint.w + BOUNDS_EPSILON && metrics.depth <= footprint.d + BOUNDS_EPSILON &&
      metrics.grounded && metrics.centered && metrics.forbiddenNodes === 0;
    if (disposed) {
      disposeObject3D(loaded);
      return;
    }
    if (!valid) {
      disposeObject3D(loaded);
      if (candidateIndex + 1 < candidates.length) load(candidateIndex + 1);
      else publish(canvas, 'error', 'facade', metrics);
      return;
    }
    const candidate = candidates[candidateIndex]!;
    loaded.name = 'TownDynamoHallPilot';
    loaded.position.set(footprint.x, 0, footprint.z);
    loaded.updateMatrixWorld(true);
    model = loaded;
    scene.add(loaded);
    publishBuildingOrientation(canvas, 'dynamo_hall', loaded, metrics);
    removeEmitters = addAnchorEmitters(scene, canvas, 'dynamo_hall', loaded, activeEpoch().order);
    canvas.dataset.town3dPilotEra = String(candidate.era);
    canvas.dataset.town3dPilotModel = candidate.url;
    group.visible = false;
    publish(canvas, 'loaded', 'glb', metrics);
  }, undefined, () => {
    if (disposed) return;
    if (candidateIndex + 1 < candidates.length) load(candidateIndex + 1);
    else publish(canvas, 'error', 'facade');
  });
  load(0);
  return () => {
    disposed = true;
    clearBuildingOrientation(canvas, 'dynamo_hall');
    removeEmitters();
    group.visible = true;
    if (!model) return;
    scene.remove(model);
    disposeObject3D(model);
    model = undefined;
  };
}

export function installTownTavernPilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'tavern', 'TownTavernPilot');
}

export function installTownGeneralStorePilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'general_store', 'TownGeneralStorePilot');
}

export function installTownClaimOfficePilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'claim_office', 'TownClaimOfficePilot');
}

export function installTownAssayOfficePilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'assay_office', 'TownAssayOfficePilot');
}

export function installTownChapelPilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'chapel', 'TownChapelPilot');
}

export function installTownSchoolhousePilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'schoolhouse', 'TownSchoolhousePilot');
}

export function installTownStampMillPilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'stamp-mill', 'TownStampMillPilot');
}

export function installTownPlatePilot({ scene, canvas }: Host): () => void {
  let disposed = false;
  let model: THREE.Object3D | undefined;
  const ground = scene.getObjectByName('TownSquareGround');
  const setState = (state: 'loading' | 'loaded' | 'failed' | 'disposed', source: 'painted' | 'glb', metrics?: Parameters<typeof publish>[3]): void => {
    canvas.dataset.town3dPlateState = state;
    canvas.dataset.town3dPlateGround = source;
    if (state !== 'disposed') publish(canvas, state, source, metrics);
  };
  setState('loading', 'painted');

  trackedGltfLoader(canvas, 'the town').load(TOWN_PLATE_MODEL_URL, ({ scene: loaded }) => {
    const metrics = inspect(loaded, false);
    const valid = metrics.triangles <= 20_000 && metrics.materials === 1 && metrics.forbiddenNodes === 0;
    if (disposed || !valid) {
      disposeObject3D(loaded);
      if (!disposed) setState('failed', 'painted');
      return;
    }
    loaded.name = 'TownPlatePilot';
    loaded.position.set(0, -0.002, 0);
    loaded.traverse((node) => { if ((node as THREE.Mesh).isMesh) node.renderOrder = ground?.renderOrder ?? 0; });
    model = loaded;
    scene.add(loaded);
    if (ground) ground.visible = false;
    canvas.dataset.town3dPilotLoadedIds = [...new Set([...(canvas.dataset.town3dPilotLoadedIds ?? '').split(',').filter(Boolean), 'plate'])].join(',');
    setState('loaded', 'glb', metrics);
  }, undefined, () => {
    if (!disposed) setState('failed', 'painted');
  });

  return () => {
    disposed = true;
    if (ground) ground.visible = true;
    if (model) {
      scene.remove(model);
      disposeObject3D(model);
      model = undefined;
    }
    canvas.dataset.town3dPilotLoadedIds = (canvas.dataset.town3dPilotLoadedIds ?? '').split(',').filter((entry) => entry && entry !== 'plate').join(',');
    setState('disposed', 'painted');
  };
}

export function installTownPlazaPropsPilot({ scene, canvas }: Host): () => void {
  let disposed = false;
  const mounted: THREE.Object3D[] = [];
  const removeEmitters: Array<() => void> = [];
  const descriptors = townPropRing.props.filter((prop) => prop.kind === 'covered_wagon' || prop.kind === 'water_trough');
  const activeEra = activeEpoch().order;
  const eraProps = townEraPropsForOrder(activeEra);
  const accessoryPaths = [...new Set(eraProps.map((prop) => `../../assets/pilots/plaza-props-3d/${prop.glb}`))];
  const legacyPan = scene.getObjectByName(TOWN_LEGACY_PAN_NAME);
  canvas.dataset.town3dPlazaPropsState = 'loading';

  const loadValid = async (kind: string, urls: readonly string[]): Promise<{ source: THREE.Object3D; metrics: ReturnType<typeof inspect> }> => {
    for (const url of urls) {
      try {
        const source = (await trackedGltfLoader(canvas, 'the town').loadAsync(url)).scene;
        const metrics = inspect(source);
        if (metrics.triangles <= 4_000 && metrics.materials <= 1 && metrics.forbiddenNodes === 0) return { source, metrics };
        disposeObject3D(source);
      } catch {
        // Try the next older era; a missing sibling is an expected fallback.
      }
    }
    throw new Error(`Invalid plaza prop: ${kind}`);
  };

  void Promise.all([
    Promise.all(Object.entries(PROP_MODEL_URLS).map(async ([kind, baseUrl]) => ({
      kind,
      ...await loadValid(kind, kind === 'pan_monument'
        ? [baseUrl]
        : [
            ...Array.from({ length: Math.max(0, activeEra - 1) }, (_, index) => activeEra - index)
              .map((era) => BUNDLED_VARIANT_URLS[`../../assets/pilots/plaza-props-3d/${kind}.e${era}.glb`])
              .filter((url): url is string => !!url),
            baseUrl,
          ]),
    }))),
    Promise.all(accessoryPaths.map(async (path) => ({ path, ...await loadValid(path, [BUNDLED_VARIANT_URLS[path]!]) }))),
  ]).then(([baseProps, accessories]) => {
    const metrics: Array<{ metrics: ReturnType<typeof inspect>; count: number }> = [];
    for (const { kind, source, metrics: modelMetrics } of baseProps) {
      const placements = kind === 'pan_monument' ? [townPropRing.panMonument] : descriptors.filter((prop) => prop.kind === kind);
      for (const placement of placements) {
        const model = source.clone(true);
        model.name = `TownPlazaPropsPilot:${placement.id}`;
        model.position.set(placement.position.x, 0, placement.position.z);
        model.rotation.y = 'rotation' in placement ? placement.rotation : 0;
        model.scale.setScalar('scale' in placement ? (placement.scale ?? 1) : 1);
        mounted.push(model);
      }
      metrics.push({ metrics: modelMetrics, count: placements.length });
    }
    for (const { path, source, metrics: modelMetrics } of accessories) {
      const placements = eraProps.filter((prop) => path.endsWith(`/${prop.glb}`));
      for (const placement of placements) {
        const model = source.clone(true);
        model.name = `TownEraProp:${placement.id}`;
        model.position.set(placement.position.x, 0, placement.position.z);
        model.rotation.y = placement.rotation;
        model.scale.setScalar(placement.scale);
        mounted.push(model);
      }
      metrics.push({ metrics: modelMetrics, count: placements.length });
    }
    if (disposed) {
      mounted.forEach(disposeObject3D);
      return;
    }
    scene.add(...mounted);
    if (legacyPan) legacyPan.visible = false;
    for (const model of mounted) removeEmitters.push(addAnchorEmitters(scene, canvas, model.name, model, activeEra));
    canvas.dataset.town3dPilotInstances = String(mounted.length);
    canvas.dataset.town3dPanMonumentInstances = String(baseProps.some(({ kind }) => kind === 'pan_monument') ? 1 : 0);
    canvas.dataset.town3dPlazaPropsState = 'loaded';
    canvas.dataset.town3dEraPropIds = eraProps.map((prop) => prop.id).join(',');
    publish(canvas, 'loaded', 'glb', {
      meshes: mounted.length,
      triangles: metrics.reduce((sum, entry) => sum + entry.metrics.triangles * entry.count, 0),
      materials: metrics.length,
    });
  }).catch(() => {
    mounted.forEach(disposeObject3D);
    mounted.length = 0;
    if (!disposed) {
      if (legacyPan) legacyPan.visible = true;
      canvas.dataset.town3dPanMonumentInstances = '0';
      canvas.dataset.town3dPlazaPropsState = 'error';
      publish(canvas, 'error', 'facade');
    }
  });

  return () => {
    disposed = true;
    removeEmitters.forEach((remove) => remove());
    for (const model of mounted) {
      scene.remove(model);
      disposeObject3D(model);
    }
    mounted.length = 0;
    if (legacyPan) legacyPan.visible = true;
    canvas.dataset.town3dPanMonumentInstances = '0';
    canvas.dataset.town3dPlazaPropsState = 'disposed';
  };
}
