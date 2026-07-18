import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { BuildDiagnostics } from '../systems/BuildSystem';
import { disposeObject3D } from '../utils/dispose';
import * as Terrain from '../world/Terrain';
import { performanceTierDiagnostics } from './PerformanceTier';

const registry = {
  assay_office: { url: new URL('../../assets/pilots/run3d/assay-bench.glb', import.meta.url).href, fallback: 'AssayOfficeTimberShell', groundPad: 1 },
  boiler_house: { url: new URL('../../assets/pilots/run3d/boiler-house.glb', import.meta.url).href, fallback: 'BoilerHousePool', groundPad: 1.1 },
  lantern_post: { url: new URL('../../assets/pilots/run3d/lantern-post.glb', import.meta.url).href, fallback: 'LanternPostPool', groundPad: 0.4 },
  palisade: { url: new URL('../../assets/pilots/run3d/palisade.glb', import.meta.url).href, fallback: 'PalisadePool', groundPad: 1.5 },
  sluice: { url: new URL('../../assets/pilots/run3d/sluice.glb', import.meta.url).href, fallback: 'SluicePool', groundPad: 0.9 },
  turret: { url: new URL('../../assets/pilots/run3d/turret.glb', import.meta.url).href, fallback: 'TurretPool', groundPad: 1.2 },
  stockpile: { url: new URL('../../assets/pilots/run3d/stockpile.glb', import.meta.url).href, fallback: 'StockpilePool', groundPad: 0.75 },
  sentry_beacon: { url: new URL('../../assets/pilots/run3d/sentry-beacon.glb', import.meta.url).href, fallback: 'SentryBeaconPool', groundPad: 0.4 },
} as const;

type Buildable3dId = keyof typeof registry;
type Host = { scene: THREE.Scene; canvas: HTMLCanvasElement; diagnostics: () => BuildDiagnostics };

export type Run3dPilot = { update: () => void; dispose: () => void };

function publish(canvas: HTMLCanvasElement, state: 'loading' | 'ready' | 'lite' | 'failed', meshes = 0, triangles = 0): void {
  canvas.dataset.run3dPilotState = state;
  canvas.dataset.run3dPilotMeshes = String(meshes);
  canvas.dataset.run3dPilotTriangles = String(triangles);
}

function fallback(host: Host, id: Buildable3dId): THREE.Object3D | undefined {
  const object = host.scene.getObjectByName(registry[id].fallback);
  return id === 'assay_office' ? object?.parent ?? undefined : object;
}

export function installRun3dPilot(host: Host): Run3dPilot {
  const params = new URLSearchParams(window.location.search);
  const selection = params.get('run3dPilot') ?? 'all';
  if (performanceTierDiagnostics().tier === 'lite') {
    publish(host.canvas, 'lite');
    return { update: () => undefined, dispose: () => publish(host.canvas, 'lite') };
  }

  const ids = (selection === 'all' ? Object.keys(registry) : [selection]).filter(
    (id): id is Buildable3dId => typeof id === 'string' && id in registry,
  );
  const group = new THREE.Group();
  const templates = new Map<Buildable3dId, THREE.Object3D>();
  const triangleCounts = new Map<Buildable3dId, number>();
  const instances = new Map<string, THREE.Object3D>();
  const matrix = new THREE.Matrix4();
  const matrixPosition = new THREE.Vector3();
  const matrixRotation = new THREE.Quaternion();
  const matrixScale = new THREE.Vector3();
  const euler = new THREE.Euler();
  const color = new THREE.Color();
  let disposed = false;
  publish(host.canvas, 'loading');
  host.scene.add(group);

  Promise.all(
    ids.map(
      (id) =>
        new Promise<void>((resolve, reject) => {
          new GLTFLoader().load(
            registry[id].url,
            ({ scene }) => {
              if (disposed) {
                disposeObject3D(scene);
                resolve();
                return;
              }
              let triangles = 0;
              scene.traverse((node) => {
                const mesh = node as THREE.Mesh;
                if (!mesh.isMesh) return;
                triangles += Math.floor((mesh.geometry.index?.count ?? mesh.geometry.attributes.position?.count ?? 0) / 3);
                mesh.castShadow = false;
                mesh.receiveShadow = true;
              });
              if (triangles > 8_000) {
                disposeObject3D(scene);
                reject(new Error('run3d triangle budget exceeded'));
                return;
              }
              triangleCounts.set(id, triangles);
              templates.set(id, scene);
              resolve();
            },
            undefined,
            reject,
          );
        }),
    ),
  ).then(
    () => {
      if (disposed) return;
      for (const id of ids) {
        const sprite = fallback(host, id);
        if (sprite) sprite.visible = false;
      }
      publish(host.canvas, 'ready');
      update();
    },
    () => {
      for (const template of templates.values()) disposeObject3D(template);
      templates.clear();
      if (!disposed) publish(host.canvas, 'failed');
    },
  );

  function update(): void {
    if (disposed || templates.size !== ids.length) return;
    for (const id of ids) {
      const sprite = fallback(host, id);
      if (sprite) sprite.visible = false;
    }
    const alive = new Set<string>();
    const diagnostics = host.diagnostics();
    for (const entry of diagnostics.hp) {
      if (!ids.includes(entry.id as Buildable3dId) || entry.wrecked || entry.hp <= 0) continue;
      const key = `${entry.id}:${entry.index}`;
      alive.add(key);
      let instance = instances.get(key);
      if (!instance) {
        instance = templates.get(entry.id as Buildable3dId)!.clone(true);
        if (entry.id === 'palisade') {
          instance.traverse((node) => {
            const mesh = node as THREE.Mesh;
            if (mesh.isMesh) mesh.material = (mesh.material as THREE.Material).clone();
          });
        }
        instances.set(key, instance);
        group.add(instance);
      }
      instance.position.set(
        entry.position.x,
        Terrain.visualY(entry.position.x, entry.position.z, 0, registry[entry.id as Buildable3dId].groundPad),
        entry.position.z,
      );
      if (entry.id === 'lantern_post') instance.rotation.y = (diagnostics.lanternPostRotations[entry.index] ?? 0) * Math.PI / 2;
      if (entry.id === 'palisade') {
        const posts = host.scene.getObjectByName('PalisadePosts') as THREE.InstancedMesh | undefined;
        if (posts) {
          posts.getMatrixAt(entry.index * 2, matrix);
          posts.getColorAt(entry.index * 2, color);
          matrix.decompose(matrixPosition, matrixRotation, matrixScale);
          instance.rotation.y = euler.setFromQuaternion(matrixRotation).y;
          instance.traverse((node) => {
            const mesh = node as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
            if (mesh.isMesh) mesh.material.color.copy(color);
          });
        }
      }
    }
    for (const [key, instance] of instances) {
      if (alive.has(key)) continue;
      group.remove(instance);
      if (key.startsWith('palisade:')) instance.traverse((node) => (node as THREE.Mesh).isMesh && ((node as THREE.Mesh).material as THREE.Material).dispose());
      instances.delete(key);
    }
    const triangles = [...instances.keys()].reduce((total, key) => total + (triangleCounts.get(key.split(':')[0] as Buildable3dId) ?? 0), 0);
    publish(host.canvas, 'ready', instances.size, triangles);
  }

  return {
    update,
    dispose: () => {
      disposed = true;
      for (const id of ids) {
        const sprite = fallback(host, id);
        if (sprite) sprite.visible = true;
      }
      host.scene.remove(group);
      for (const [key, instance] of instances) {
        if (key.startsWith('palisade:')) instance.traverse((node) => (node as THREE.Mesh).isMesh && ((node as THREE.Mesh).material as THREE.Material).dispose());
      }
      instances.clear();
      for (const template of templates.values()) disposeObject3D(template);
      templates.clear();
      publish(host.canvas, 'lite');
    },
  };
}
