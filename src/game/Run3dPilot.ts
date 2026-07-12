import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { BuildDiagnostics } from '../systems/BuildSystem';
import { disposeObject3D } from '../utils/dispose';
import * as Terrain from '../world/Terrain';

const registry = {
  sluice: { url: new URL('../../assets/pilots/run3d/sluice.glb', import.meta.url).href, fallback: 'SluicePool', groundPad: 0.9 },
  turret: { url: new URL('../../assets/pilots/run3d/turret.glb', import.meta.url).href, fallback: 'TurretPool', groundPad: 1.2 },
} as const;

type Buildable3dId = keyof typeof registry;
type Host = { scene: THREE.Scene; canvas: HTMLCanvasElement; diagnostics: () => BuildDiagnostics };

export type Run3dPilot = { update: () => void; dispose: () => void };

function publish(canvas: HTMLCanvasElement, state: 'loading' | 'ready' | 'lite' | 'failed', meshes = 0, triangles = 0): void {
  canvas.dataset.run3dPilotState = state;
  canvas.dataset.run3dPilotMeshes = String(meshes);
  canvas.dataset.run3dPilotTriangles = String(triangles);
}

export function installRun3dPilot(host: Host): Run3dPilot {
  const params = new URLSearchParams(window.location.search);
  const selection = params.get('run3dPilot');
  if (params.get('tier') === 'lite') {
    publish(host.canvas, 'lite');
    return { update: () => undefined, dispose: () => publish(host.canvas, 'lite') };
  }

  const ids = (selection === 'all' ? Object.keys(registry) : [selection]).filter(
    (id): id is Buildable3dId => typeof id === 'string' && id in registry,
  );
  const group = new THREE.Group();
  const templates = new Map<Buildable3dId, THREE.Object3D>();
  const instances = new Map<string, THREE.Object3D>();
  let disposed = false;
  let trianglesPerInstance = 0;
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
              trianglesPerInstance += triangles;
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
        const fallback = host.scene.getObjectByName(registry[id].fallback);
        if (fallback) fallback.visible = false;
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
      const fallback = host.scene.getObjectByName(registry[id].fallback);
      if (fallback) fallback.visible = false;
    }
    const alive = new Set<string>();
    for (const entry of host.diagnostics().hp) {
      if (!ids.includes(entry.id as Buildable3dId) || entry.wrecked || entry.hp <= 0) continue;
      const key = `${entry.id}:${entry.index}`;
      alive.add(key);
      let instance = instances.get(key);
      if (!instance) {
        instance = templates.get(entry.id as Buildable3dId)!.clone(true);
        instances.set(key, instance);
        group.add(instance);
      }
      instance.position.set(
        entry.position.x,
        Terrain.visualY(entry.position.x, entry.position.z, 0, registry[entry.id as Buildable3dId].groundPad),
        entry.position.z,
      );
    }
    for (const [key, instance] of instances) {
      if (alive.has(key)) continue;
      group.remove(instance);
      instances.delete(key);
    }
    publish(host.canvas, 'ready', instances.size, instances.size * trianglesPerInstance);
  }

  return {
    update,
    dispose: () => {
      disposed = true;
      for (const id of ids) {
        const fallback = host.scene.getObjectByName(registry[id].fallback);
        if (fallback) fallback.visible = true;
      }
      host.scene.remove(group);
      instances.clear();
      for (const template of templates.values()) disposeObject3D(template);
      templates.clear();
      publish(host.canvas, 'lite');
    },
  };
}
