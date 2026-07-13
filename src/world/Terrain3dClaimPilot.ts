import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import contractText from '../../assets/pilots/map-rebuild-spike/the-claim-terrain-contract.json?raw';
import { disposeObject3D } from '../utils/dispose';
import { installVisualHeightSource } from './Terrain';

const MODEL_URL = new URL('../../assets/pilots/map-rebuild-spike/the-claim-terrain.glb', import.meta.url).href;
const CONTRACT = JSON.parse(contractText) as {
  vertices: number;
  triangles: number;
  meshCount: number;
  materialCount: number;
  boundsMeters: { min: [number, number, number]; max: [number, number, number] };
};
const BOUNDS_EPSILON = 0.03;

type Host = { scene: THREE.Scene; canvas: HTMLCanvasElement; paintedGround?: THREE.Object3D };
type Metrics = { meshes: number; triangles: number; materials: number; vertices: number; bounds: THREE.Box3 };

function publish(canvas: HTMLCanvasElement, state: 'loading' | 'ready' | 'lite' | 'failed', source: 'painted' | 'glb', metrics?: Metrics): void {
  canvas.dataset.terrain3dPilotState = state;
  canvas.dataset.terrain3dPilotRenderSource = source;
  canvas.dataset.terrain3dPilotHeightSource = source === 'glb' ? 'baked-grid' : 'painted';
  canvas.dataset.terrain3dPilotMeshes = String(metrics?.meshes ?? 0);
  canvas.dataset.terrain3dPilotTriangles = String(metrics?.triangles ?? 0);
  canvas.dataset.terrain3dPilotMaterials = String(metrics?.materials ?? 0);
}

function inspect(model: THREE.Object3D): Metrics {
  let meshes = 0;
  let triangles = 0;
  let vertices = 0;
  const materials = new Set<THREE.Material>();
  model.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    meshes += 1;
    const position = mesh.geometry.getAttribute('position');
    vertices += position?.count ?? 0;
    triangles += Math.floor((mesh.geometry.index?.count ?? position?.count ?? 0) / 3);
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
    mesh.castShadow = false;
    mesh.receiveShadow = true;
  });
  return { meshes, triangles, materials: materials.size, vertices, bounds: new THREE.Box3().setFromObject(model) };
}

function valid(metrics: Metrics): boolean {
  const { min, max } = metrics.bounds;
  const [minX, minZ, minY] = CONTRACT.boundsMeters.min;
  const [maxX, maxZ, maxY] = CONTRACT.boundsMeters.max;
  return metrics.meshes === CONTRACT.meshCount && metrics.triangles === CONTRACT.triangles && metrics.materials === CONTRACT.materialCount &&
    metrics.vertices === CONTRACT.vertices && Math.abs(min.x - minX) <= BOUNDS_EPSILON && Math.abs(min.y - minY) <= BOUNDS_EPSILON &&
    Math.abs(min.z - minZ) <= BOUNDS_EPSILON && Math.abs(max.x - maxX) <= BOUNDS_EPSILON &&
    Math.abs(max.y - maxY) <= BOUNDS_EPSILON && Math.abs(max.z - maxZ) <= BOUNDS_EPSILON;
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

export function installTerrain3dClaimPilot(host: Host): () => void {
  if (new URLSearchParams(window.location.search).get('tier') === 'lite') {
    publish(host.canvas, 'lite', 'painted');
    return () => undefined;
  }
  let disposed = false;
  let model: THREE.Object3D | undefined;
  let uninstallHeightSource: (() => void) | undefined;
  publish(host.canvas, 'loading', 'painted');
  new GLTFLoader().load(MODEL_URL, ({ scene: loaded }) => {
    const metrics = inspect(loaded);
    try {
      if (!valid(metrics)) throw new Error('terrain contract mismatch');
      const heightAt = bakeHeightGrid(loaded, metrics);
      if (disposed) throw new Error('terrain pilot disposed');
      loaded.name = 'Terrain3dClaimPilot';
      model = loaded;
      uninstallHeightSource = installVisualHeightSource(heightAt);
      host.scene.add(loaded);
      if (host.paintedGround) host.paintedGround.visible = false;
      publish(host.canvas, 'ready', 'glb', metrics);
    } catch {
      disposeObject3D(loaded);
      if (!disposed) publish(host.canvas, 'failed', 'painted', metrics);
    }
  }, undefined, () => { if (!disposed) publish(host.canvas, 'failed', 'painted'); });

  return () => {
    disposed = true;
    uninstallHeightSource?.();
    uninstallHeightSource = undefined;
    if (host.paintedGround) host.paintedGround.visible = true;
    if (model) {
      host.scene.remove(model);
      disposeObject3D(model);
      model = undefined;
    }
  };
}
