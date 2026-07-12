import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { disposeObject3D } from '../utils/dispose';
import { townBuildings, townPlazaSlot, townPropRing } from './townLayout';

const TAVERN_MODEL_URL = new URL('../../assets/pilots/tavern-3d/town-v3-tavern.glb', import.meta.url).href;
const GENERAL_STORE_MODEL_URL = new URL('../../assets/pilots/general-store-3d/general-store.glb', import.meta.url).href;
const CLAIM_OFFICE_MODEL_URL = new URL('../../assets/pilots/claim-office-3d/claim-office.glb', import.meta.url).href;
const CHAPEL_MODEL_URL = new URL('../../assets/pilots/chapel-3d/chapel.glb', import.meta.url).href;
const SCHOOLHOUSE_MODEL_URL = new URL('../../assets/pilots/schoolhouse-3d/schoolhouse.glb', import.meta.url).href;
const STAMP_MILL_MODEL_URL = new URL('../../assets/pilots/stamp-mill-3d/stamp-mill.glb', import.meta.url).href;
const DYNAMO_HALL_MODEL_URL = new URL('../../assets/pilots/dynamo-hall-3d/dynamo-hall.glb', import.meta.url).href;
const PROP_MODEL_URLS = {
  covered_wagon: new URL('../../assets/pilots/plaza-props-3d/covered_wagon.glb', import.meta.url).href,
  water_trough: new URL('../../assets/pilots/plaza-props-3d/water_trough.glb', import.meta.url).href,
  pan_monument: new URL('../../assets/pilots/plaza-props-3d/pan_monument.glb', import.meta.url).href,
} as const;
const MAX_TRIANGLES = 15_000;
const MAX_MATERIALS = 1;
const BOUNDS_EPSILON = 0.06;

type Host = { scene: THREE.Scene; canvas: HTMLCanvasElement };
type PilotState = 'loading' | 'loaded' | 'error';

function publish(
  canvas: HTMLCanvasElement,
  state: PilotState,
  source: 'facade' | 'glb',
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

function inspect(model: THREE.Object3D): {
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
        material.emissive.set(0x4a2a17);
        material.emissiveIntensity = Math.max(material.emissiveIntensity, 0.2);
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
  id: 'tavern' | 'general_store' | 'claim_office' | 'chapel' | 'schoolhouse' | 'stamp-mill',
  modelUrl: string,
  modelName: string,
): () => void {
  if (canvas.dataset.town3dPilotState === 'disposed') return () => {};
  let disposed = false;
  let model: THREE.Object3D | undefined;
  const shell = scene.getObjectByName(id === 'stamp-mill' ? 'TownStampMillSite' : `TownFacadeAssembly:${id}`);
  const building = id === 'stamp-mill' ? { footprint: { w: 6.2, d: 1.65 } } : townBuildings.find((entry) => entry.id === id)!;
  const slot = townPlazaSlot(id);
  publish(canvas, 'loading', 'facade');

  new GLTFLoader().load(
    modelUrl,
    (gltf) => {
      const loaded = gltf.scene;
      const metrics = inspect(loaded);
      const valid =
        metrics.triangles <= MAX_TRIANGLES &&
        metrics.materials <= MAX_MATERIALS &&
        metrics.width <= building.footprint.w + BOUNDS_EPSILON &&
        metrics.depth <= building.footprint.d + BOUNDS_EPSILON &&
        metrics.grounded &&
        metrics.centered &&
        metrics.forbiddenNodes === 0;
      if (disposed || !valid) {
        disposeObject3D(loaded);
        if (!disposed) publish(canvas, 'error', 'facade', metrics);
        return;
      }
      loaded.name = modelName;
      loaded.position.set(slot.position.x, 0, slot.position.z);
      loaded.rotation.y = Math.atan2(slot.approach.x - slot.position.x, slot.approach.z - slot.position.z);
      model = loaded;
      scene.add(model);
      if (shell) shell.visible = false;
      publish(canvas, 'loaded', 'glb', metrics);
    },
    undefined,
    () => {
      if (!disposed) publish(canvas, 'error', 'facade');
    },
  );

  return () => {
    disposed = true;
    if (shell) shell.visible = true;
    if (!model) return;
    scene.remove(model);
    disposeObject3D(model);
    model = undefined;
  };
}

export function installTownDynamoHallPilot(host: Host, group: THREE.Group, footprint: { x: number; z: number; w: number; d: number }): () => void {
  const { scene, canvas } = host;
  let disposed = false;
  let model: THREE.Object3D | undefined;
  publish(canvas, 'loading', 'facade');
  new GLTFLoader().load(DYNAMO_HALL_MODEL_URL, ({ scene: loaded }) => {
    const metrics = inspect(loaded);
    const valid = metrics.triangles <= MAX_TRIANGLES && metrics.materials <= MAX_MATERIALS &&
      metrics.width <= footprint.w + BOUNDS_EPSILON && metrics.depth <= footprint.d + BOUNDS_EPSILON &&
      metrics.grounded && metrics.centered && metrics.forbiddenNodes === 0;
    if (disposed || !valid) {
      disposeObject3D(loaded);
      if (!disposed) publish(canvas, 'error', 'facade', metrics);
      return;
    }
    loaded.name = 'TownDynamoHallPilot';
    loaded.position.set(footprint.x, 0, footprint.z);
    model = loaded;
    scene.add(loaded);
    group.visible = false;
    publish(canvas, 'loaded', 'glb', metrics);
  }, undefined, () => { if (!disposed) publish(canvas, 'error', 'facade'); });
  return () => {
    disposed = true;
    group.visible = true;
    if (!model) return;
    scene.remove(model);
    disposeObject3D(model);
    model = undefined;
  };
}

export function installTownTavernPilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'tavern', TAVERN_MODEL_URL, 'TownTavernPilot');
}

export function installTownGeneralStorePilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'general_store', GENERAL_STORE_MODEL_URL, 'TownGeneralStorePilot');
}

export function installTownClaimOfficePilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'claim_office', CLAIM_OFFICE_MODEL_URL, 'TownClaimOfficePilot');
}

export function installTownChapelPilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'chapel', CHAPEL_MODEL_URL, 'TownChapelPilot');
}

export function installTownSchoolhousePilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'schoolhouse', SCHOOLHOUSE_MODEL_URL, 'TownSchoolhousePilot');
}

export function installTownStampMillPilot(host: Host): () => void {
  return installTownBuildingPilot(host, 'stamp-mill', STAMP_MILL_MODEL_URL, 'TownStampMillPilot');
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
