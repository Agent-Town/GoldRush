import * as THREE from 'three';
import { Balance } from '../game/Balance';
import * as Terrain from '../world/Terrain';

const hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

export class E7ArsenalView {
  readonly group = new THREE.Group();

  private readonly relayGeometry = new THREE.RingGeometry(
    Balance.e7Arsenal.beamRelay.ringInner,
    Balance.e7Arsenal.beamRelay.ringOuter,
    24,
  );
  private readonly relayMaterial = new THREE.MeshBasicMaterial({ color: '#83ded7', side: THREE.DoubleSide });
  private readonly relays = new THREE.InstancedMesh(this.relayGeometry, this.relayMaterial, Balance.turret.maxCount);
  private readonly jammerGeometry = new THREE.CylinderGeometry(
    Balance.e7Arsenal.signalJammer.bodyRadius,
    Balance.e7Arsenal.signalJammer.bodyRadius * 1.15,
    Balance.e7Arsenal.signalJammer.bodyHeight,
    10,
  );
  private readonly jammerMaterial = new THREE.MeshStandardMaterial({
    color: '#8b7d3c',
    emissive: '#5b8a8a',
    emissiveIntensity: 0.5,
    roughness: 0.48,
    metalness: 0.35,
  });
  private readonly jammer = new THREE.Mesh(this.jammerGeometry, this.jammerMaterial);
  private readonly object = new THREE.Object3D();

  constructor() {
    this.group.name = 'E7Arsenal';
    this.relays.name = 'BeamRelayTurretTransforms';
    this.jammer.name = 'SignalJammerDeployable';
    this.relays.frustumCulled = false;
    this.jammer.castShadow = false;
    this.group.add(this.relays, this.jammer);
    this.reset();
  }

  update(enabled: boolean, at: number, turretPositions: readonly { x: number; z: number }[], jammerPosition: THREE.Vector3 | null): void {
    for (let index = 0; index < Balance.turret.maxCount; index += 1) {
      const position = enabled ? turretPositions[index] : undefined;
      if (!position) {
        this.relays.setMatrixAt(index, hiddenMatrix);
        continue;
      }
      this.object.position.set(
        position.x,
        Terrain.visualY(position.x, position.z, 0, Balance.turret.overlapRadius) + Balance.e7Arsenal.beamRelay.silhouetteHeight,
        position.z,
      );
      this.object.rotation.set(-Math.PI / 2, 0, at * 0.8 + index);
      this.object.scale.setScalar(1);
      this.object.updateMatrix();
      this.relays.setMatrixAt(index, this.object.matrix);
    }
    this.relays.instanceMatrix.needsUpdate = true;
    this.relays.visible = enabled && turretPositions.length > 0;
    this.jammer.visible = enabled && jammerPosition !== null;
    if (jammerPosition) {
      this.jammer.position.set(
        jammerPosition.x,
        Terrain.visualY(jammerPosition.x, jammerPosition.z) + Balance.e7Arsenal.signalJammer.bodyHeight / 2,
        jammerPosition.z,
      );
      this.jammer.rotation.y = at * 0.65;
      this.jammerMaterial.emissiveIntensity = 0.42 + Math.sin(at * Math.PI * 2) * 0.12;
    }
  }

  reset(): void {
    for (let index = 0; index < Balance.turret.maxCount; index += 1) this.relays.setMatrixAt(index, hiddenMatrix);
    this.relays.instanceMatrix.needsUpdate = true;
    this.relays.visible = false;
    this.jammer.visible = false;
  }

  dispose(): void {
    this.relayGeometry.dispose();
    this.relayMaterial.dispose();
    this.jammerGeometry.dispose();
    this.jammerMaterial.dispose();
  }
}
