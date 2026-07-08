import * as THREE from 'three';

export type ContinuousGroundMeshStats = {
  enabled: boolean;
  mode: 'continuous-mesh';
  drawCalls: 1;
  segments: number;
  vertexStep: number;
  vertices: number;
  triangles: number;
  heightSource: 'visual';
  textureSource: 'bank-atlas';
  textureSeams: 'texture seams remain until TR-02';
};

type ContinuousGroundMeshOptions = {
  size: number;
  segments: number;
  material: THREE.Material;
  heightAt: (x: number, z: number) => number;
  normalHeightAt: (x: number, z: number) => number;
};

export function createContinuousGroundMesh(options: ContinuousGroundMeshOptions): THREE.Mesh {
  const segments = Math.max(1, Math.floor(options.segments));
  const half = options.size / 2;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let zi = 0; zi <= segments; zi += 1) {
    const z = THREE.MathUtils.lerp(-half, half, zi / segments);
    for (let xi = 0; xi <= segments; xi += 1) {
      const x = THREE.MathUtils.lerp(-half, half, xi / segments);
      positions.push(x, -z, options.heightAt(x, z));
      uvs.push((x + half) / options.size, (-z + half) / options.size);
    }
  }

  const width = segments + 1;
  for (let zi = 0; zi < segments; zi += 1) {
    for (let xi = 0; xi < segments; xi += 1) {
      const a = zi * width + xi;
      const b = a + 1;
      const c = a + width;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  applyNormals(geometry, options.normalHeightAt);
  geometry.computeBoundingSphere();

  const mesh = new THREE.Mesh(geometry, options.material);
  mesh.name = 'TerrainContinuousGroundMesh';
  mesh.userData.terrainRelief = true;
  mesh.userData.terrainMesh = true;
  mesh.userData.groundStats = {
    enabled: true,
    mode: 'continuous-mesh',
    drawCalls: 1,
    segments,
    vertexStep: options.size / segments,
    vertices: positions.length / 3,
    triangles: indices.length / 3,
    heightSource: 'visual',
    textureSource: 'bank-atlas',
    textureSeams: 'texture seams remain until TR-02',
  } satisfies ContinuousGroundMeshStats;
  mesh.rotation.x = -Math.PI / 2;
  mesh.receiveShadow = true;
  return mesh;
}

function applyNormals(geometry: THREE.BufferGeometry, heightAt: (x: number, z: number) => number): void {
  const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
  const normals: number[] = [];
  for (let index = 0; index < positions.count; index += 1) {
    const x = positions.getX(index);
    const z = -positions.getY(index);
    const normal = terrainNormal(x, z, heightAt);
    normals.push(normal.x, normal.y, normal.z);
  }
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
}

function terrainNormal(x: number, z: number, heightAt: (x: number, z: number) => number): THREE.Vector3 {
  const step = 0.5;
  const dx = (heightAt(x + step, z) - heightAt(x - step, z)) / (step * 2);
  const dz = (heightAt(x, z + step) - heightAt(x, z - step)) / (step * 2);
  return new THREE.Vector3(-dx, dz, 1).normalize();
}
