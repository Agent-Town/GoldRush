import * as THREE from 'three';
import { Balance } from '../game/Balance';
import glowMesa from '../../assets/pilots/map-rebuild-spike/glow-mesa-terrain-contract.json' with { type: 'json' };
import deadBand from '../../assets/pilots/map-rebuild-spike/dead-band-terrain-contract.json' with { type: 'json' };
import farSide from '../../assets/pilots/map-rebuild-spike/far-side-terrain-contract.json' with { type: 'json' };
import halfLifeHollow from '../../assets/pilots/map-rebuild-spike/half-life-hollow-terrain-contract.json' with { type: 'json' };
import relayRush from '../../assets/pilots/map-rebuild-spike/relay-rush-terrain-contract.json' with { type: 'json' };

// Variant pack contractIds name authoring verdicts, not the playable contracts.
const entryPacks: Readonly<Record<string, { contractId: string; entryLandmark?: { mountId: string; reason: string } }>> = {
  'e6-glow-mesa': glowMesa,
  'e7-dead-band': deadBand,
  'e8-far-side': farSide,
  'e6-half-life-hollow': halfLifeHollow,
  'e7-relay-rush': relayRush,
};

export class CameraRig {
  private readonly desiredPosition = new THREE.Vector3();
  private readonly lookTarget = new THREE.Vector3();
  private readonly lookAhead = new THREE.Vector3();
  private readonly impulseOffset = new THREE.Vector3();
  private readonly trackedTarget = new THREE.Vector3();
  private distanceScale = 1;
  private impulseRemaining = 0;
  private glanceTarget: { position: THREE.Vector3; velocity: THREE.Vector3 } | null = null;
  private entryChecked = false;
  private entryGlance: { position: THREE.Vector3; elapsed: number; seconds: number } | null = null;
  private readonly entryFocus = new THREE.Vector3();
  private readonly entryVelocity = new THREE.Vector3();

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly sceneScale = 1,
  ) {
    this.camera.fov = Balance.camera.fov;
    this.camera.updateProjectionMatrix();
  }

  get focus(): THREE.Vector3 { return this.trackedTarget; }

  setDistanceScale(scale: number): void {
    this.distanceScale = scale;
  }

  /** Fit the selected contract with the normal game pose, including narrow portrait viewports. */
  frameBounds(bounds: { minX: number; maxX: number; minZ: number; maxZ: number }, target: THREE.Vector3): void {
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxZ - bounds.minZ;
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov / 2);
    const distance = Math.max(width / Math.max(.1, this.camera.aspect), depth) / (2 * Math.tan(halfFov));
    this.setDistanceScale((distance + depth * .28) * this.sceneScale / Balance.camera.offset.length());
    this.snapTo(target);
  }

  diagnostics(): { baseDistance: number; actualDistance: number; glanceActive: boolean } {
    return {
      baseDistance: Balance.camera.offset.length() / this.sceneScale,
      actualDistance: this.camera.position.distanceTo(this.trackedTarget),
      glanceActive: this.glanceTarget !== null || this.entryGlance !== null,
    };
  }

  setGlanceTarget(position: THREE.Vector3 | null, velocity?: THREE.Vector3): void {
    this.entryGlance = null;
    this.glanceTarget = position && velocity ? { position, velocity } : null;
  }

  /** Called only for a live ordinary boot, after the briefing and landmark loads. */
  tryEntryGlance(contractId: string, scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
    if (this.entryChecked) return;
    this.entryChecked = true;
    const entry = entryPacks[contractId]?.entryLandmark;
    if (!entry || this.glanceTarget) return;
    const model = scene.getObjectByName(entry.mountId);
    if (!model || !model.userData.landmarkAsset || this.bodyPixels(model, scene, renderer) > 0) return;
    this.entryGlance = { position: model.getWorldPosition(new THREE.Vector3()), elapsed: 0, seconds: 2.5 };
  }

  /** One boot-time depth-tested body census; HUD coverage is intentionally separate. */
  private bodyPixels(model: THREE.Object3D, scene: THREE.Scene, renderer: THREE.WebGLRenderer): number {
    scene.updateMatrixWorld(true);
    this.camera.updateMatrixWorld(true);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse),
    );
    if (!frustum.intersectsBox(new THREE.Box3().setFromObject(model))) return 0;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const target = new THREE.WebGLRenderTarget(size.x, size.y);
    const before = new Uint8Array(size.x * size.y * 4);
    const after = new Uint8Array(before.length);
    const savedTarget = renderer.getRenderTarget();
    const savedAutoClear = renderer.autoClear;
    const savedShadows = renderer.shadowMap.autoUpdate;
    const saved: { mesh: THREE.Mesh; material: THREE.Material | THREE.Material[]; masks: THREE.MeshBasicMaterial[] }[] = [];
    model.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const material = mesh.material;
      const masks = (Array.isArray(material) ? material : [material]).map((original) => new THREE.MeshBasicMaterial({
        color: 0, side: original.side, depthTest: original.depthTest, depthWrite: original.depthWrite,
        toneMapped: false, fog: false,
      }));
      saved.push({ mesh, material, masks });
      mesh.material = Array.isArray(material) ? masks : masks[0];
    });
    try {
      renderer.autoClear = true;
      renderer.shadowMap.autoUpdate = false;
      renderer.setRenderTarget(target);
      renderer.render(scene, this.camera);
      renderer.readRenderTargetPixels(target, 0, 0, size.x, size.y, before);
      for (const { masks } of saved) for (const mask of masks) mask.color.setHex(0xffffff);
      renderer.render(scene, this.camera);
      renderer.readRenderTargetPixels(target, 0, 0, size.x, size.y, after);
      let pixels = 0;
      for (let i = 0; i < before.length; i += 4) {
        if (before[i] !== after[i] || before[i + 1] !== after[i + 1] || before[i + 2] !== after[i + 2]) pixels++;
      }
      return pixels;
    } finally {
      for (const { mesh, material, masks } of saved) {
        mesh.material = material;
        for (const mask of masks) mask.dispose();
      }
      renderer.setRenderTarget(savedTarget);
      renderer.autoClear = savedAutoClear;
      renderer.shadowMap.autoUpdate = savedShadows;
      target.dispose();
    }
  }

  snapTo(target: THREE.Vector3): void {
    this.entryGlance = null;
    this.trackedTarget.copy(target);
    this.setDesiredPosition(target);
    this.camera.position.copy(this.desiredPosition);
    this.impulseOffset.set(0, 0, 0);
    this.impulseRemaining = 0;
    this.lookTarget.set(target.x, target.y + 0.45, target.z - Balance.camera.downScreenLookOffset);
    this.camera.lookAt(this.lookTarget);
  }

  impulse(target: THREE.Vector3, amount: number = Balance.charm.camImpulse): void {
    const clamped = Math.max(0, Math.min(0.15, amount));
    if (clamped <= 0) return;
    this.impulseOffset.set(this.camera.position.x - target.x, 0, this.camera.position.z - target.z);
    if (this.impulseOffset.lengthSq() <= 0.0001) this.impulseOffset.set(0, 0, 1);
    this.impulseOffset.normalize().multiplyScalar(clamped);
    this.impulseRemaining = 0.2;
  }

  get impulseActive(): boolean {
    return this.impulseRemaining > 0;
  }

  update(delta: number, target: THREE.Vector3, velocity: THREE.Vector3): void {
    target = this.glanceTarget?.position ?? target;
    velocity = this.glanceTarget?.velocity ?? velocity;
    const glance = this.entryGlance;
    if (glance) {
      glance.elapsed = Math.min(glance.seconds, glance.elapsed + delta);
      const easeIn = THREE.MathUtils.smoothstep(glance.elapsed, 0, 0.7);
      const easeOut = 1 - THREE.MathUtils.smoothstep(glance.elapsed, glance.seconds - 0.7, glance.seconds);
      const blend = easeIn * easeOut;
      target = this.entryFocus.copy(target).lerp(glance.position, blend);
      velocity = this.entryVelocity.copy(velocity).multiplyScalar(1 - blend);
      if (glance.elapsed >= glance.seconds) this.entryGlance = null;
    }
    this.trackedTarget.copy(target);
    this.setDesiredPosition(target);
    const factor = 1 - Math.exp(-delta / Balance.camera.lag);
    // The entry focus is already eased. Lagging behind it again can put a distant
    // landmark behind the camera's look direction and flip the view mid-flight.
    if (glance) this.camera.position.copy(this.desiredPosition);
    else this.camera.position.lerp(this.desiredPosition, factor);
    if (this.impulseRemaining > 0) {
      this.impulseRemaining = Math.max(0, this.impulseRemaining - delta);
      const t = this.impulseRemaining / 0.2;
      this.camera.position.addScaledVector(this.impulseOffset, t);
    }

    this.lookAhead.set(velocity.x, 0, velocity.z);
    if (this.lookAhead.lengthSq() > 0.0001) {
      this.lookAhead.normalize().multiplyScalar(Balance.camera.lookAhead);
    }
    this.lookTarget
      .set(target.x, target.y + 0.45, target.z - Balance.camera.downScreenLookOffset)
      .add(this.lookAhead);
    this.camera.lookAt(this.lookTarget);
  }

  private setDesiredPosition(target: THREE.Vector3): void {
    this.desiredPosition
      .copy(Balance.camera.offset)
      .multiplyScalar(this.distanceScale / this.sceneScale)
      .add(target);
  }
}
