import * as THREE from 'three';
import { resetAssetLoading, sharedAtlasCacheSize, trackedGltfLoader } from '../../src/assets/AssetLoading';
import { disposeObject3D } from '../../src/utils/dispose';

export { sharedAtlasCacheSize };

export function warmSceneTextures(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
  scene.traverse(node => {
    const mesh = node as THREE.Mesh;
    for (const material of Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) {
      for (const value of Object.values(material)) if (value?.isTexture && value.image) renderer.initTexture(value);
    }
  });
}

export function imageResidency(root: THREE.Object3D | undefined) {
  const images = new Set<{ width: number; height: number }>();
  root?.traverse((node) => {
    const mesh = node as THREE.Mesh;
    for (const material of Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) {
      for (const value of Object.values(material)) if (value?.isTexture && value.image?.width) images.add(value.image);
    }
  });
  return { images: images.size, estimatedBytes: [...images].reduce((sum, image) => sum + image.width * image.height * 4 * 4 / 3, 0) };
}

export async function lifecycle(renderer: THREE.WebGLRenderer, urls: string[]) {
  const canvas = document.createElement('canvas');
  resetAssetLoading(canvas, 'atlas lifecycle');
  const baseline = renderer.info.memory.textures;
  const cycles = [];
  for (let cycle = 0; cycle < 2; cycle++) {
    const loader = trackedGltfLoader(canvas, 'atlas lifecycle');
    const models = await Promise.all(urls.map(async url => (await loader.loadAsync(url)).scene));
    const group = new THREE.Group();
    group.add(...models);
    group.traverse(node => {
      const mesh = node as THREE.Mesh;
      for (const material of Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []) {
        for (const value of Object.values(material)) if (value?.isTexture) renderer.initTexture(value);
      }
    });
    const loaded = renderer.info.memory.textures;
    const residency = imageResidency(group);
    disposeObject3D(group);
    cycles.push({ loaded, disposed: renderer.info.memory.textures, cachedAfterDisposal: sharedAtlasCacheSize(canvas), ...residency });
    resetAssetLoading(canvas, 'atlas lifecycle');
  }
  return { baseline, cycles };
}
