import * as THREE from 'three';
import { afterStartupFrame, loadGeneratedTexture } from '../assets/generated';
import { tagPlaceholder, type AssetSlotId } from '../assets/slots';
import { RenderLayers } from '../core/RenderLayers';

export function createBuildingSign(slotId: AssetSlotId, capacity: number, name: string): THREE.InstancedMesh {
  const mesh = createSignMesh(capacity, name);
  const material = mesh.material as THREE.MeshStandardMaterial;
  void loadGeneratedTexture(slotId).then((texture) => applyTexture(material, texture));
  return tagPlaceholder(mesh, slotId);
}

export function createBuildingSignFromUrl(url: string, capacity: number, name: string): THREE.InstancedMesh {
  const mesh = createSignMesh(capacity, name);
  const material = mesh.material as THREE.MeshStandardMaterial;
  new THREE.TextureLoader().load(url, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    applyTexture(material, texture);
  });
  return mesh;
}

export function createBuildingSignFromUrlLoader(
  urlLoader: () => Promise<string>,
  capacity: number,
  name: string,
): THREE.InstancedMesh {
  const mesh = createSignMesh(capacity, name);
  const material = mesh.material as THREE.MeshStandardMaterial;
  void afterStartupFrame()
    .then(urlLoader)
    .then((url) => {
      new THREE.TextureLoader().load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        applyTexture(material, texture);
      });
    });
  return mesh;
}

function createSignMesh(capacity: number, name: string): THREE.InstancedMesh {
  const material = new THREE.MeshStandardMaterial({
    color: '#fff8e8',
    emissive: '#fff8e8',
    emissiveIntensity: 0.28,
    roughness: 0.74,
    metalness: 0.02,
    transparent: true,
    alphaTest: 0.04,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), material, capacity);
  mesh.name = name;
  mesh.frustumCulled = false;
  mesh.castShadow = false;
  mesh.receiveShadow = true;
  mesh.renderOrder = RenderLayers.gameplay + 0.01;
  return mesh;
}

function applyTexture(material: THREE.MeshStandardMaterial, texture: THREE.Texture | null): void {
  if (!texture) return;
  material.map = texture;
  material.emissiveMap = texture;
  material.color.set('#ffffff');
  material.emissive.set('#ffffff');
  material.emissiveIntensity = 0.42;
  material.needsUpdate = true;
}

export function disposeBuildingSign(mesh: THREE.InstancedMesh): void {
  mesh.geometry.dispose();
  if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
  else mesh.material.dispose();
}
