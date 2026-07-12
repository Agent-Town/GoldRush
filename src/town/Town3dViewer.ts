import * as THREE from 'three';
import { townPlazaSlot, type TownBuildingId } from './townLayout';

// Debug-gated 3D building drop-in: `?debug&town3d[=buildingId]` in the town.
// Drag a .glb/.gltf from Blender onto the tab: the model replaces that
// building's shell in-place, auto-scaled to the slot footprint and grounded,
// with a readout card (tris / dimensions / materials) as the budget meter.
// Pipeline tooling only — never loads outside ?debug.

type ViewerHost = {
  scene: THREE.Scene;
  buildingFootprint: (id: TownBuildingId | string) => { w: number; d: number } | null;
};

const READOUT_ID = 'town3d-readout';

export function installTown3dViewer(host: ViewerHost): () => void {
  const search = new URLSearchParams(window.location.search);
  const targetId = search.get('town3d') || 'tavern';
  let dropped: THREE.Object3D | null = null;

  const hint = document.createElement('div');
  hint.id = READOUT_ID;
  hint.setAttribute(
    'style',
    'position:fixed;left:12px;bottom:12px;z-index:60;background:#f6ead1;color:#2e1b0e;border:2px solid #2e1b0e;' +
      'border-radius:8px;padding:10px 14px;font:13px/1.5 Georgia,serif;max-width:340px;box-shadow:0 3px 0 #2e1b0e;',
  );
  hint.textContent = `3D drop-in armed: drag a .glb onto the town to stand it at "${targetId}".`;
  document.body.appendChild(hint);

  const report = (lines: string[]) => {
    hint.innerHTML = lines.map((line) => `<div>${line}</div>`).join('');
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !/\.(glb|gltf)$/i.test(file.name)) {
      report([`Not a .glb/.gltf: ${file?.name ?? 'nothing dropped'}`]);
      return;
    }
    void file.arrayBuffer().then(async (buffer) => {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      new GLTFLoader().parse(
        buffer,
        '',
        (gltf) => {
          const slot = townPlazaSlot(targetId as TownBuildingId);
          const footprint = host.buildingFootprint(targetId) ?? { w: 3, d: 3 };
          const model = gltf.scene;

          const rawBox = new THREE.Box3().setFromObject(model);
          const rawSize = rawBox.getSize(new THREE.Vector3());
          const scale = rawSize.x > 0 ? Math.min((footprint.w * 1.05) / rawSize.x, (footprint.d * 1.35) / Math.max(rawSize.z, 0.001)) : 1;
          model.scale.setScalar(scale);
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          model.position.set(slot.position.x - center.x, -box.min.y, slot.position.z - center.z);
          model.rotation.y = Math.atan2(slot.approach.x - slot.position.x, slot.approach.z - slot.position.z);

          let tris = 0;
          const materials = new Set<string>();
          model.traverse((node) => {
            const mesh = node as THREE.Mesh;
            if (mesh.isMesh) {
              const geo = mesh.geometry as THREE.BufferGeometry;
              tris += (geo.index ? geo.index.count : geo.attributes.position?.count ?? 0) / 3;
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              for (const mat of mats) materials.add(mat?.uuid ?? 'none');
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          const shell = host.scene.getObjectByName(`TownFacadeAssembly:${targetId}`);
          if (shell) shell.visible = false;
          if (dropped) host.scene.remove(dropped);
          dropped = model;
          host.scene.add(model);

          report([
            `<b>${file.name}</b> → "${targetId}" slot`,
            `tris: <b>${Math.round(tris)}</b> ${tris > 15000 ? '⚠ over the 15k town budget' : '✓ in budget'}`,
            `materials: <b>${materials.size}</b> ${materials.size > 2 ? '⚠ target 1 baked material' : '✓'}`,
            `raw ${rawSize.x.toFixed(1)}×${rawSize.y.toFixed(1)}×${rawSize.z.toFixed(1)} → ×${scale.toFixed(2)} → ${size.x.toFixed(1)}w ${size.y.toFixed(1)}h (slot ${footprint.w}w)`,
            `drop another export to swap it.`,
          ]);
        },
        (error) => report([`glTF parse failed: ${String((error as { message?: string })?.message ?? error)}`]),
      );
    });
  };

  window.addEventListener('dragover', onDragOver);
  window.addEventListener('drop', onDrop);
  return () => {
    window.removeEventListener('dragover', onDragOver);
    window.removeEventListener('drop', onDrop);
    hint.remove();
    if (dropped) host.scene.remove(dropped);
  };
}
