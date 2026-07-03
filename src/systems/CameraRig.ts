import * as THREE from 'three';
import { Balance } from '../game/Balance';

export class CameraRig {
  private readonly desiredPosition = new THREE.Vector3();
  private readonly lookTarget = new THREE.Vector3();
  private readonly lookAhead = new THREE.Vector3();

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    this.camera.fov = Balance.camera.fov;
    this.camera.updateProjectionMatrix();
  }

  snapTo(target: THREE.Vector3): void {
    this.desiredPosition.copy(target).add(Balance.camera.offset);
    this.camera.position.copy(this.desiredPosition);
    this.lookTarget.set(target.x, target.y + 0.45, target.z - Balance.camera.downScreenLookOffset);
    this.camera.lookAt(this.lookTarget);
  }

  update(delta: number, target: THREE.Vector3, velocity: THREE.Vector3): void {
    this.desiredPosition.copy(target).add(Balance.camera.offset);
    const factor = 1 - Math.exp(-delta / Balance.camera.lag);
    this.camera.position.lerp(this.desiredPosition, factor);

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
