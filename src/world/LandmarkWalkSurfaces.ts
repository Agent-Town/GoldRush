import * as THREE from 'three';

export type LandmarkWalkSurface = {
  minX: number; maxX: number; minZ: number; maxZ: number; height: number;
};

// Static mounted floors extend Terrain's visual owner; planar collision remains authoritative.
export function createLandmarkWalkSurfaces(
  groundHeightAt: (x: number, z: number) => number,
  entries: Array<{ model: THREE.Object3D; mount: { walkSurfaces?: LandmarkWalkSurface[] } }>,
) {
  const source = entries.flatMap(({ model, mount }) =>
    (mount.walkSurfaces ?? []).map(surface => ({ model, surface })));
  if (!source.length) return null;
  for (const { model, surface: s } of source) {
    model.updateWorldMatrix(true, false);
    const matrix = model.matrixWorld;
    if (![s.minX, s.maxX, s.minZ, s.maxZ, s.height].every(Number.isFinite)
      || s.minX >= s.maxX || s.minZ >= s.maxZ
      || !matrix.elements.every(Number.isFinite) || Math.abs(matrix.determinant()) < 1e-9
      || Math.abs(matrix.elements[1]!) + Math.abs(matrix.elements[9]!) > 1e-6) {
      throw new Error('invalid horizontal landmark walk surface');
    }
  }
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const point = new THREE.Vector3();
  const surfaces = source.map(({ model, surface: s }) => {
    const geometry = new THREE.PlaneGeometry(s.maxX - s.minX, s.maxZ - s.minZ)
      .rotateX(-Math.PI / 2)
      .translate((s.minX + s.maxX) / 2, s.height, (s.minZ + s.maxZ) / 2);
    // Raycast only: these meshes never enter the rendered scene.
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'LandmarkWalkPointer';
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(model.matrixWorld);
    mesh.updateMatrixWorld(true);
    return {
      surface: s, inverse: model.matrixWorld.clone().invert(),
      height: point.set(0, s.height, 0).applyMatrix4(model.matrixWorld).y, mesh,
    };
  });
  let disposed = false;
  return {
    pointers: surfaces.map(s => s.mesh),
    heightAt(x: number, z: number) {
      let height = groundHeightAt(x, z);
      if (disposed) return height;
      for (const entry of surfaces) {
        point.set(x, entry.height, z).applyMatrix4(entry.inverse);
        const s = entry.surface;
        if (point.x >= s.minX && point.x <= s.maxX && point.z >= s.minZ && point.z <= s.maxZ) {
          height = Math.max(height, entry.height);
        }
      }
      return height;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const entry of surfaces) entry.mesh.geometry.dispose();
      material.dispose();
    },
  };
}
