import * as THREE from 'three';

export type ArchiveRestorationState = {
  zones: readonly { id: string; minX: number; maxX: number; minZ: number; maxZ: number }[];
  restoredWingIds: readonly string[];
};

/** Material-only re-inking: authored paint returns when the sim restores its zone. */
export function installArchiveRestoration(model: THREE.Object3D, readState: () => ArchiveRestorationState | null): void {
  const state = readState();
  if (!state || state.zones.length === 0) return;
  const zones = state.zones;
  const rectangles = { value: zones.map(zone => new THREE.Vector4(zone.minX, zone.maxX, zone.minZ, zone.maxZ)) };
  const restored = { value: new Float32Array(zones.length) };
  const materials = new Set<THREE.Material>();
  let lastFrame = -1;
  model.traverse(node => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const beforeRender = mesh.onBeforeRender.bind(mesh);
    mesh.onBeforeRender = (renderer, scene, camera, geometry, material, group) => {
      beforeRender(renderer, scene, camera, geometry, material, group);
      if (renderer.info.render.frame === lastFrame) return;
      lastFrame = renderer.info.render.frame;
      const current = readState();
      zones.forEach((zone, index) => { restored.value[index] = current?.restoredWingIds.includes(zone.id) ? 1 : 0; });
    };
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
  });
  for (const material of materials) {
    const compile = material.onBeforeCompile.bind(material);
    const cacheKey = material.customProgramCacheKey.bind(material);
    material.customProgramCacheKey = () => `${cacheKey()}:archive-restoration-v1:${zones.length}`;
    material.onBeforeCompile = (shader, renderer) => {
      compile(shader, renderer);
      shader.uniforms.archiveZones = rectangles;
      shader.uniforms.archiveRestored = restored;
      shader.vertexShader = 'varying vec2 archiveWorldXZ;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>',
        '#include <worldpos_vertex>\narchiveWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;');
      shader.fragmentShader = `varying vec2 archiveWorldXZ;
uniform vec4 archiveZones[${zones.length}];
uniform float archiveRestored[${zones.length}];\n` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
for (int i = 0; i < ${zones.length}; i++) {
  vec4 zone = archiveZones[i];
  if (archiveWorldXZ.x >= zone.x && archiveWorldXZ.x <= zone.y && archiveWorldXZ.y >= zone.z && archiveWorldXZ.y <= zone.w) {
    float luminance = dot(outgoingLight, vec3(0.2126, 0.7152, 0.0722));
    outgoingLight = mix(mix(vec3(luminance), outgoingLight, 0.12), outgoingLight, archiveRestored[i]);
    break;
  }
}
#include <opaque_fragment>`);
    };
    material.needsUpdate = true;
  }
}
