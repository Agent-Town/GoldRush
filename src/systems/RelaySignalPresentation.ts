import * as THREE from 'three';
import type { InterferenceFrontDiagnostics } from './InterferenceFrontSystem';

/** Render-only, like CanalFlowPresentation: read the existing front and suppression; write
 * only material uniforms. No orders, view fields, sim clock, terrain import or extra draws.
 * The four GLBs' authored teal lamp/dial faces occupy atlas cell (0,2). The rest of each
 * frame keeps its existing daylight pigment and calibrated whole-body ink lift. */
type SignalState = Pick<InterferenceFrontDiagnostics, 'sites'>;
type Binding = {
  site: string;
  material: THREE.MeshStandardMaterial;
  pulse: THREE.IUniform<number>;
  compile: THREE.Material['onBeforeCompile'];
  cacheKey: THREE.Material['customProgramCacheKey'];
  onDispose: () => void;
};

export class RelaySignalPresentation {
  private readonly bindings: Binding[] = [];
  private readonly previousRender: THREE.Scene['onBeforeRender'];
  private readonly render: THREE.Scene['onBeforeRender'];
  private complete = false;
  private disposed = false;

  static terrainState(canvas: HTMLCanvasElement, cancelled: boolean): string | undefined {
    if (cancelled) return 'disposed';
    // The canvas can survive a run restart, so its primary state takes precedence over an
    // old landmark-state attribute until the new terrain owner has finished loading.
    return canvas.dataset.terrain3dPilotState === 'ready'
      ? canvas.dataset.terrain3dPilotLandmarkLoadState
      : canvas.dataset.terrain3dPilotState;
  }

  constructor(
    private readonly scene: THREE.Scene,
    private readonly readFront: () => SignalState,
    private readonly suppressed: () => boolean,
    private readonly readTerrainState: () => string | undefined = () => 'mounted',
  ) {
    this.previousRender = scene.onBeforeRender;
    this.render = (...args) => {
      this.previousRender.apply(scene, args);
      this.sync(performance.now() / 1000);
    };
    scene.onBeforeRender = this.render;
  }

  sync(seconds: number): void {
    if (this.disposed) return;
    const terrain = this.readTerrainState();
    if (terrain === 'off' || terrain === 'lite' || terrain === 'failed' || terrain === 'disposed') {
      this.dispose();
      return;
    }
    // No scene walks, front snapshots or uniforms while the asynchronous terrain is pending.
    if (terrain !== 'mounted') return;
    const state = this.readFront();
    // Models arrive asynchronously. Once the four slots bind, the steady frame does no tree
    // traversal. Their material disposal releases this owner with the existing terrain owner.
    if (!this.complete) {
      for (const site of state.sites) {
        if (this.bindings.some(binding => binding.site === site.id)) continue;
        const match = /^relay-site-(r[1-4])$/.exec(site.id);
        const model = match ? this.scene.getObjectByName(`rush-relay-${match[1]}-frame`) : undefined;
        model?.traverse(object => {
          const mesh = object as THREE.Mesh;
          if (!mesh.isMesh) return;
          for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
            if (material instanceof THREE.MeshStandardMaterial && material.map) this.bind(site.id, material);
          }
        });
      }
      // 'mounted' is the terrain owner's terminal receipt. A missing slot cannot arrive
      // later in this mount, so even an incomplete/empty pack must not cause an endless scan.
      this.complete = true;
      if (this.bindings.length === 0) { this.dispose(); return; }
    }
    const suppressed = this.suppressed();
    const pulse = 1.05 + 0.3 * Math.sin(seconds * Math.PI * 1.5);
    for (const binding of this.bindings) {
      const site = state.sites.find(site => site.id === binding.site);
      binding.pulse.value = site?.lit && !site.muted && !suppressed ? pulse : 0;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    if (this.scene.onBeforeRender === this.render) this.scene.onBeforeRender = this.previousRender;
    for (const binding of [...this.bindings]) this.unbind(binding);
  }

  private bind(site: string, material: THREE.MeshStandardMaterial): void {
    if (this.bindings.some(binding => binding.material === material)) return;
    const binding: Binding = {
      site, material, pulse: { value: 0 }, compile: material.onBeforeCompile,
      cacheKey: material.customProgramCacheKey,
      // Terrain can be disposed while only some GLBs have arrived. The first owned
      // material disposal ends the presentation, including that partial-load case.
      onDispose: () => this.dispose(),
    };
    material.userData.relaySignal = binding.pulse;
    const key = material.customProgramCacheKey();
    material.onBeforeCompile = (shader, renderer) => {
      binding.compile.call(material, shader, renderer);
      shader.uniforms.relaySignal = binding.pulse;
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float relaySignal;')
        .replace('#include <map_fragment>', `#include <map_fragment>
// GLTF atlas UVs: col 0, row 2. Only the authored teal beacon/dial faces signal activity.
float relayLamp = step(0.0, vMapUv.x) * (1.0 - step(0.25, vMapUv.x))
  * step(0.5, vMapUv.y) * (1.0 - step(0.75, vMapUv.y));
diffuseColor.rgb *= mix(1.0, 0.28, relayLamp * (1.0 - step(0.01, relaySignal)));`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance = mix(totalEmissiveRadiance, vec3(0.12, 0.86, 0.69) * relaySignal, relayLamp);`);
    };
    material.customProgramCacheKey = () => `${key}|relay-signal-v1`;
    material.needsUpdate = true;
    material.addEventListener('dispose', binding.onDispose);
    this.bindings.push(binding);
  }

  private unbind(binding: Binding): void {
    binding.material.removeEventListener('dispose', binding.onDispose);
    binding.material.onBeforeCompile = binding.compile;
    binding.material.customProgramCacheKey = binding.cacheKey;
    delete binding.material.userData.relaySignal;
    binding.material.needsUpdate = true;
    const index = this.bindings.indexOf(binding);
    if (index !== -1) this.bindings.splice(index, 1);
  }
}
