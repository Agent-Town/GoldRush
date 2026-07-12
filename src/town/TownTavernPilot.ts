import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { disposeObject3D } from '../utils/dispose';
import { townBuildings, townPlazaSlot } from './townLayout';

const MODEL_URL = new URL('../../assets/pilots/tavern-3d/town-v3-tavern.glb', import.meta.url).href;
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

export function installTownTavernPilot({ scene, canvas }: Host): () => void {
  if (canvas.dataset.town3dPilotState === 'disposed') return () => {};
  let disposed = false;
  let model: THREE.Object3D | undefined;
  const shell = scene.getObjectByName('TownFacadeAssembly:tavern');
  const building = townBuildings.find((entry) => entry.id === 'tavern')!;
  const slot = townPlazaSlot('tavern');
  publish(canvas, 'loading', 'facade');

  new GLTFLoader().load(
    MODEL_URL,
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
      loaded.name = 'TownTavernPilot';
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
