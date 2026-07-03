import * as THREE from 'three';
import { Balance } from '../game/Balance';

export class CameraRig {
  private readonly desiredPosition = new THREE.Vector3();
  private readonly lookTarget = new THREE.Vector3();
  private readonly lookAhead = new THREE.Vector3();
  private readonly impulseOffset = new THREE.Vector3();
  private impulseRemaining = 0;

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    this.camera.fov = Balance.camera.fov;
    this.camera.updateProjectionMatrix();
  }

  snapTo(target: THREE.Vector3): void {
    this.desiredPosition.copy(target).add(Balance.camera.offset);
    this.camera.position.copy(this.desiredPosition);
    this.impulseOffset.set(0, 0, 0);
    this.impulseRemaining = 0;
    this.lookTarget.set(target.x, target.y + 0.45, target.z - Balance.camera.downScreenLookOffset);
    this.camera.lookAt(this.lookTarget);
  }

  impulse(target: THREE.Vector3, amount = Balance.charm.camImpulse): void {
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
    this.desiredPosition.copy(target).add(Balance.camera.offset);
    const factor = 1 - Math.exp(-delta / Balance.camera.lag);
    this.camera.position.lerp(this.desiredPosition, factor);
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
}
