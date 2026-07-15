import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { ContractFairground } from '../meta/ContractFamilies';
import type { BuildingTarget } from '../systems/TargetingSystem';
import type { LightSource } from '../systems/LightField';
import { visualY } from '../world/Terrain';

type WheelConfig = ContractFairground['wheel'];

export type FerrisWheelDiagnostics = Readonly<{
  active: boolean;
  spinning: boolean;
  hp: number;
  maxHp: number;
  outputWatts: number;
  configuredWatts: number;
  viewRadius: number;
  x: number;
  z: number;
}>;

export class FerrisWheel {
  readonly group = new THREE.Group();
  readonly target: BuildingTarget;
  private readonly wheel = new THREE.Group();
  private readonly cabins: THREE.Group[] = [];
  private readonly faultBeacon = new THREE.Group();
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.MeshStandardMaterial[] = [];
  private hp: number;
  private spinning = true;

  constructor(readonly config: WheelConfig) {
    this.hp = config.maxHp;
    this.group.name = 'FerrisWheel';
    this.group.position.set(config.x, visualY(config.x, config.z, 0.08), config.z);
    this.group.scale.setScalar(0.74);
    this.target = {
      id: 'fairground:ferris-wheel',
      family: 'megaproject',
      index: 1,
      position: this.group.position,
      halfX: 4.1,
      halfZ: 1.8,
      active: true,
      hp: this.hp,
      maxHp: config.maxHp,
      reachRadius: 4.1,
    };
    this.buildVisuals();
  }

  get diagnostics(): FerrisWheelDiagnostics {
    return {
      active: this.target.active,
      spinning: this.spinning,
      hp: this.hp,
      maxHp: this.config.maxHp,
      outputWatts: this.spinning ? this.config.outputWatts : 0,
      configuredWatts: this.config.outputWatts,
      viewRadius: this.config.viewRadius,
      x: this.config.x,
      z: this.config.z,
    };
  }

  get coverageSource(): LightSource | null {
    return this.spinning
      ? { id: 'fairground:ferris-wheel', kind: 'powered-lamp', x: this.config.x, z: this.config.z, radius: this.config.viewRadius }
      : null;
  }

  update(delta: number): void {
    if (this.spinning) this.wheel.rotation.z += Math.max(0, delta) * this.config.spinRate;
    for (const cabin of this.cabins) cabin.rotation.z = -this.wheel.rotation.z;
  }

  damage(amount: number) {
    if (!this.target.active || amount <= 0) return this.damageResult(false);
    this.hp = Math.max(0, this.hp - amount);
    this.target.hp = this.hp;
    this.spinning = false;
    this.target.active = this.hp > 0;
    this.faultBeacon.visible = true;
    this.group.traverse((part) => {
      if (part instanceof THREE.Mesh && part.material === this.materials[0]) part.material = this.materials[2]!;
    });
    return this.damageResult(true);
  }

  reset(): void {
    this.hp = this.config.maxHp;
    this.spinning = true;
    this.target.active = true;
    this.target.hp = this.hp;
    this.wheel.rotation.z = 0;
    this.faultBeacon.visible = false;
    for (const cabin of this.cabins) cabin.rotation.z = 0;
    this.group.traverse((part) => {
      if (part instanceof THREE.Mesh && part.material === this.materials[2]) part.material = this.materials[0]!;
    });
  }

  dispose(): void {
    this.group.clear();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
  }

  private damageResult(applied: boolean) {
    return { applied, family: 'ferris_wheel', index: 0, hp: this.hp, maxHp: this.config.maxHp, wrecked: this.hp <= 0 };
  }

  private buildVisuals(): void {
    const brass = new THREE.MeshStandardMaterial({ color: '#c08d3f', emissive: '#664716', emissiveIntensity: 0.5, roughness: 0.58, metalness: 0.42 });
    const teal = new THREE.MeshStandardMaterial({ color: '#5aa0a0', emissive: '#285e5e', emissiveIntensity: 0.65, roughness: 0.55, metalness: 0.28 });
    const rust = new THREE.MeshStandardMaterial({ color: '#a55332', emissive: '#602719', emissiveIntensity: 0.5, roughness: 0.78, metalness: 0.22 });
    const window = new THREE.MeshStandardMaterial({ color: '#f2d27b', emissive: '#d69b32', emissiveIntensity: 0.9, roughness: 0.48, metalness: 0.08 });
    const ground = new THREE.MeshStandardMaterial({ color: '#25170f', transparent: true, opacity: 0.32, depthWrite: false, roughness: 1 });
    this.materials.push(brass, teal, rust, window, ground);

    const ring = new THREE.TorusGeometry(5, 0.16, 8, 40);
    const beam = new THREE.BoxGeometry(0.16, 10, 0.16);
    const support = new THREE.BoxGeometry(0.28, 7.2, 0.32);
    const base = new THREE.BoxGeometry(7, 0.28, 1.2);
    const foot = new THREE.BoxGeometry(1.4, 0.36, 1.5);
    const axle = new THREE.CylinderGeometry(0.52, 0.52, 1.5, 16);
    const hanger = new THREE.BoxGeometry(0.1, 0.7, 0.1);
    const cabin = new THREE.BoxGeometry(1, 0.65, 0.75);
    const cabinRoof = new THREE.BoxGeometry(1.14, 0.12, 0.86);
    const cabinWindow = new THREE.BoxGeometry(0.62, 0.28, 0.05);
    const shadow = new THREE.CircleGeometry(4.2, 28);
    const fault = new THREE.OctahedronGeometry(0.34, 0);
    this.geometries.push(ring, beam, support, base, foot, axle, hanger, cabin, cabinRoof, cabinWindow, shadow, fault);

    this.wheel.position.y = 6.2;
    this.wheel.add(new THREE.Mesh(ring, brass));
    for (let index = 0; index < 8; index += 1) {
      const angle = index * Math.PI / 4;
      const spoke = new THREE.Mesh(beam, brass);
      spoke.rotation.z = angle;
      const gondola = new THREE.Group();
      gondola.position.set(Math.cos(angle) * 5, Math.sin(angle) * 5, 0);
      const hangerMesh = new THREE.Mesh(hanger, brass);
      hangerMesh.position.y = -0.35;
      const car = new THREE.Mesh(cabin, teal);
      car.position.y = -0.9;
      const roof = new THREE.Mesh(cabinRoof, brass);
      roof.position.y = -0.53;
      const litWindow = new THREE.Mesh(cabinWindow, window);
      litWindow.position.set(0, -0.88, 0.4);
      gondola.add(hangerMesh, car, roof, litWindow);
      this.cabins.push(gondola);
      this.wheel.add(spoke, gondola);
    }
    const left = new THREE.Mesh(support, brass);
    left.position.set(-2, 3.3, 0);
    left.position.z = -0.8;
    left.rotation.z = -0.32;
    const right = new THREE.Mesh(support, brass);
    right.position.set(2, 3.3, 0);
    right.position.z = -0.8;
    right.rotation.z = 0.32;
    const hub = new THREE.Mesh(axle, teal);
    hub.position.y = 6.2;
    hub.rotation.x = Math.PI / 2;
    const platform = new THREE.Mesh(base, brass);
    platform.position.y = 0.14;
    const leftFoot = new THREE.Mesh(foot, brass);
    leftFoot.position.set(-2.8, 0.18, 0);
    const rightFoot = new THREE.Mesh(foot, brass);
    rightFoot.position.set(2.8, 0.18, 0);
    const contactShadow = new THREE.Mesh(shadow, ground);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.02;
    contactShadow.scale.set(1, 0.35, 1);
    const faultBeacon = new THREE.Mesh(fault, rust);
    faultBeacon.position.set(0, 6.2, 0.9);
    this.faultBeacon.add(faultBeacon);
    this.faultBeacon.visible = false;
    this.group.add(contactShadow, platform, leftFoot, rightFoot, left, right, this.wheel, hub, this.faultBeacon);
    this.group.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
  }
}
