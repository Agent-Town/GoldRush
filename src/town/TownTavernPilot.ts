import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { activeEpoch } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';
import { townBuildings, townPlazaSlot, townPropRing } from './townLayout';

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

type Host = { scene: THREE.Scene; canvas: HTMLCanvasElement };
type PilotState = 'loading' | 'loaded' | 'error' | 'failed';
type BuildingId = Exclude<keyof typeof MODEL_PATHS, 'dynamo_hall'>;
type ModelCandidate = { era: number; url: string };
type BuildingOrientation = { width: number; height: number; depth: number; upY: number };

const steamPools = new WeakMap<THREE.Scene, TownSteamPool>();

class TownSteamPool {
  private readonly anchors = new Map<string, THREE.Object3D[]>();
  private readonly mesh = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.38, 10, 8),
    new THREE.MeshBasicMaterial({ color: '#fff8e8', transparent: true, opacity: 0.5, depthWrite: false }),
    64,
  );
  private readonly object = new THREE.Object3D();
  private frame = 0;

  constructor(private readonly scene: THREE.Scene, private readonly canvas: HTMLCanvasElement) {
    this.mesh.name = 'TownSteamPlumePool';
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
    steamPools.delete(this.scene);
  }

  private readonly update = (at: number): void => {
    const position = new THREE.Vector3();
    let index = 0;
    for (const anchor of [...this.anchors.values()].flat()) {
      anchor.getWorldPosition(position);
      for (let puff = 0; puff < 2 && index < this.mesh.instanceMatrix.count; puff += 1) {
        const phase = ((at * 0.00018) + puff * 0.48 + index * 0.13) % 1;
        this.object.position.set(position.x, position.y + phase * 0.7, position.z);
        this.object.scale.setScalar(0.42 + phase * 0.34);
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
    this.canvas.dataset.town3dSteamAnchors = String(count);
    this.canvas.dataset.town3dSteamPlumes = String(count * 2);
  }
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

function addSteamAnchors(scene: THREE.Scene, canvas: HTMLCanvasElement, owner: string, model: THREE.Object3D, era: number): () => void {
  if (era < 2) return () => {};
  const anchors: THREE.Object3D[] = [];
  model.traverse((node) => { if (/^steam_anchor_\d+$/.test(node.name)) anchors.push(node); });
  if (!anchors.length) return () => {};
  const pool = steamPools.get(scene) ?? new TownSteamPool(scene, canvas);
  steamPools.set(scene, pool);
  pool.add(owner, anchors);
  return () => pool.remove(owner);
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
  let removeSteam = () => {};
  const shell = scene.getObjectByName(id === 'stamp-mill' ? 'TownStampMillSite' : `TownFacadeAssembly:${id}`);
  const building = id === 'stamp-mill' ? { footprint: { w: 6.2, d: 1.65 } } : townBuildings.find((entry) => entry.id === id)!;
  const slot = townPlazaSlot(id);
  clearBuildingOrientation(canvas, id);
  publish(canvas, 'loading', 'facade');

  const candidates = eraCandidates(MODEL_PATHS[id]);
  const load = (candidateIndex: number): void => new GLTFLoader().load(
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
      removeSteam = addSteamAnchors(scene, canvas, id, loaded, candidate.era);
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
    removeSteam();
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
  let removeSteam = () => {};
  clearBuildingOrientation(canvas, 'dynamo_hall');
  publish(canvas, 'loading', 'facade');
  const candidates = eraCandidates(MODEL_PATHS.dynamo_hall);
  const load = (candidateIndex: number): void => new GLTFLoader().load(candidates[candidateIndex]!.url, ({ scene: loaded }) => {
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
    removeSteam = addSteamAnchors(scene, canvas, 'dynamo_hall', loaded, candidate.era);
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
    removeSteam();
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

  new GLTFLoader().load(TOWN_PLATE_MODEL_URL, ({ scene: loaded }) => {
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
  const descriptors = townPropRing.props.filter((prop) => prop.kind === 'covered_wagon' || prop.kind === 'water_trough');

  void Promise.all(Object.entries(PROP_MODEL_URLS).map(async ([kind, url]) => {
    const source = (await new GLTFLoader().loadAsync(url)).scene;
    const metrics = inspect(source);
    if (metrics.triangles > 4_000 || metrics.materials > 1 || metrics.forbiddenNodes > 0) throw new Error(`Invalid plaza prop: ${kind}`);
    return { kind, source, metrics };
  })).then((loaded) => {
    const metrics = loaded.map((entry) => entry.metrics);
    for (const { kind, source } of loaded) {
    const placements = kind === 'pan_monument' ? [townPropRing.panMonument] : descriptors.filter((prop) => prop.kind === kind);
    for (const placement of placements) {
      const model = source.clone(true);
      model.name = `TownPlazaPropsPilot:${placement.id}`;
      model.position.set(placement.position.x, 0, placement.position.z);
      model.rotation.y = 'rotation' in placement ? placement.rotation : 0;
      model.scale.setScalar('scale' in placement ? (placement.scale ?? 1) : 1);
      mounted.push(model);
    }
    }
    if (disposed) {
      mounted.forEach(disposeObject3D);
      return;
    }
    scene.add(...mounted);
    canvas.dataset.town3dPilotInstances = String(mounted.length);
    publish(canvas, 'loaded', 'glb', {
      meshes: mounted.length,
      triangles: metrics.reduce((sum, metric, index) => sum + metric.triangles * (index === 0 ? 3 : 1), 0),
      materials: 3,
    });
  }).catch(() => {
    mounted.forEach(disposeObject3D);
    mounted.length = 0;
    if (!disposed) publish(canvas, 'error', 'facade');
  });

  return () => {
    disposed = true;
    for (const model of mounted) {
      scene.remove(model);
      disposeObject3D(model);
    }
    mounted.length = 0;
  };
}
