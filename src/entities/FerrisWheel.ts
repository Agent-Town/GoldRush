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

/**
 * THE WHEEL, REBUILT TO THE CONCEPT PLATE — F-OMB-2 / F-OMB-3, 2026-09-18.
 *
 * `assets/raw/plate-contract-e3-fairground.png` draws the map's light source: three concentric
 * rims, ~20 PAIRED spokes strung with bulbs, ~20 tall lantern cars riding the OUTSIDE of the rim,
 * a lit brass hub and a fenced base with a teal pylon rising into it. What shipped was eight plain
 * beams, one rim and eight gondolas hung INSIDE and below it.
 *
 * RENDER-SIDE ONLY. Nothing here reads or writes sim state: `maxHp`, `spinRate`, `outputWatts`,
 * `viewRadius` and the position come from `twist.fairground.wheel` in `contracts.json` and are
 * untouched, and so are the target's `halfX`/`halfZ`/`reachRadius`. The dimensions below are the
 * three render levers the 2026-09-18 review named.
 *
 * WHY THE WHEEL IS SMALLER (F-OMB-3). The camera is pitched down, so how tall a thing may stand and
 * still be inside the frame depends on how far the PLAYER is from it, not on the viewport. Measured
 * on this tree, the tallest apex that still projects to y >= 8 px:
 *
 *   player stands           8    10    12    14    16    18    20    24  units back
 *   desktop 1280x800    11.35 10.15   9.1   8.0   7.0  6.05  5.25  3.95 m
 *   mobile   390x844    11.40 10.15   9.1   8.05  7.0  6.05  5.25  3.95 m
 *
 * The two viewports are the same number, so "mobile HUD/haze obscure the upper wheel" was never a
 * mobile defect (F-POC-2). The shipped apex stood at (6.2 + 5) x 0.74 = 8.288 m, which is framed
 * only from within 14 units — the exact edge — and is cut at every station beyond it, including the
 * 20-back station the review measured it at. The apex can only come inside by coming down, and the
 * wheel's lowest car cannot sink below its own platform, so the diameter comes down with it:
 * `RIM` 5 -> 2.63 and `HUB` 6.2 -> 3.49 put the topmost lantern roof at 7.005 local = 5.18 m world,
 * ~9 px inside the top at 20 back and inside at every closer station. `group.scale` stays 0.74.
 * The lowest car's floor sits at -0.10 m, where the plate's own fence hides it.
 *
 * DRAW CALLS. Everything repeated that does not move independently is one `InstancedMesh`: the 40
 * spoke beams, the bulb string, the car brackets, the fence posts, and the three car parts. The
 * cars are the only instances updated per frame — they counter-rotate the wheel to stay upright,
 * exactly as the gondola groups used to.
 */
const RIM = 2.63;
const MID_RING = RIM * 0.62;
const INNER_RING = RIM * 0.33;
const HUB = 3.49;
const SPOKES = 20;
/** Half the gap between the two beams of a paired spoke. */
const SPOKE_PAIR_OFFSET = 0.11;
const CARS = 20;
/** Cars ride the OUTSIDE of the rim (the plate); the bracket spans rim to car roof. */
const CAR_RADIUS = RIM + 0.5;
const RIM_BULBS = 40;
const SPOKE_BULBS = 3;
const BASE_RADIUS = 3.05;

export class FerrisWheel {
  readonly group = new THREE.Group();
  readonly target: BuildingTarget;
  private readonly wheel = new THREE.Group();
  /** The three car parts, counter-rotated every frame so the lanterns hang upright. */
  private readonly carParts: THREE.InstancedMesh[] = [];
  private readonly carOffsets: THREE.Vector3[] = [];
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
    this.levelCars();
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
    this.levelCars();
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

  /** The cars ride the rim but hang level: undo the wheel's own spin on every instance. */
  private levelCars(): void {
    const upright = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -this.wheel.rotation.z);
    const one = new THREE.Vector3(1, 1, 1);
    const matrix = new THREE.Matrix4();
    for (const part of this.carParts) {
      for (let index = 0; index < CARS; index += 1) {
        const offset = this.carOffsets[index]!;
        const local = part.userData.localOffset as THREE.Vector3;
        const shifted = local.clone().applyQuaternion(upright).add(offset);
        part.setMatrixAt(index, matrix.compose(shifted, upright, one));
      }
      part.instanceMatrix.needsUpdate = true;
    }
  }

  private buildVisuals(): void {
    const brass = new THREE.MeshStandardMaterial({ color: '#c08d3f', emissive: '#664716', emissiveIntensity: 0.5, roughness: 0.58, metalness: 0.42 });
    const teal = new THREE.MeshStandardMaterial({ color: '#5aa0a0', emissive: '#285e5e', emissiveIntensity: 0.65, roughness: 0.55, metalness: 0.28 });
    const rust = new THREE.MeshStandardMaterial({ color: '#a55332', emissive: '#602719', emissiveIntensity: 0.5, roughness: 0.78, metalness: 0.22 });
    const window = new THREE.MeshStandardMaterial({ color: '#f2d27b', emissive: '#d69b32', emissiveIntensity: 0.9, roughness: 0.48, metalness: 0.08 });
    const ground = new THREE.MeshStandardMaterial({ color: '#25170f', transparent: true, opacity: 0.32, depthWrite: false, roughness: 1 });
    // The plate's two lights: the warm bulb string that makes the wheel the map's light source, and
    // the teal pylon that carries the current up into the hub.
    const bulbPaint = new THREE.MeshStandardMaterial({ color: '#ffe9b8', emissive: '#ffbf5e', emissiveIntensity: 1.7, roughness: 0.4, metalness: 0 });
    const current = new THREE.MeshStandardMaterial({ color: '#7fd6d0', emissive: '#31b6ae', emissiveIntensity: 1.15, roughness: 0.42, metalness: 0.15 });
    this.materials.push(brass, teal, rust, window, ground, bulbPaint, current);

    const rimOuter = new THREE.TorusGeometry(RIM, 0.11, 8, 52);
    const rimMid = new THREE.TorusGeometry(MID_RING, 0.075, 6, 40);
    const rimInner = new THREE.TorusGeometry(INNER_RING, 0.065, 6, 28);
    const spokeBeam = new THREE.BoxGeometry(0.05, RIM, 0.05);
    const bulbGeometry = new THREE.SphereGeometry(0.055, 6, 4);
    const bracket = new THREE.BoxGeometry(0.07, 0.42, 0.07);
    const carBody = new THREE.BoxGeometry(0.55, 0.8, 0.44);
    const carRoof = new THREE.BoxGeometry(0.68, 0.09, 0.55);
    const carWindow = new THREE.BoxGeometry(0.34, 0.42, 0.04);
    const hubBoss = new THREE.CylinderGeometry(0.4, 0.4, 0.86, 20);
    const hubCore = new THREE.CylinderGeometry(0.19, 0.19, 0.98, 12);
    const pylon = new THREE.CylinderGeometry(0.15, 0.4, HUB - 0.2, 12);
    const baseDisc = new THREE.CylinderGeometry(BASE_RADIUS, BASE_RADIUS + 0.16, 0.26, 36);
    const fenceRail = new THREE.TorusGeometry(BASE_RADIUS - 0.1, 0.045, 5, 36);
    const fencePost = new THREE.BoxGeometry(0.09, 0.72, 0.09);
    const support = new THREE.BoxGeometry(0.22, 3.75, 0.26);
    const shadow = new THREE.CircleGeometry(BASE_RADIUS + 0.1, 32);
    const fault = new THREE.OctahedronGeometry(0.3, 0);
    this.geometries.push(rimOuter, rimMid, rimInner, spokeBeam, bulbGeometry, bracket, carBody, carRoof, carWindow,
      hubBoss, hubCore, pylon, baseDisc, fenceRail, fencePost, support, shadow, fault);

    const axis = new THREE.Vector3(0, 0, 1);
    const one = new THREE.Vector3(1, 1, 1);
    const matrix = new THREE.Matrix4();
    const place = (mesh: THREE.InstancedMesh, index: number, x: number, y: number, z: number, angle: number): void => {
      const rotation = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      mesh.setMatrixAt(index, matrix.compose(new THREE.Vector3(x, y, z), rotation, one));
    };

    // ---- the turning frame ----
    this.wheel.position.y = HUB;
    this.wheel.add(new THREE.Mesh(rimOuter, brass), new THREE.Mesh(rimMid, brass), new THREE.Mesh(rimInner, brass));

    const spokeMesh = new THREE.InstancedMesh(spokeBeam, brass, SPOKES * 2);
    const bulbMesh = new THREE.InstancedMesh(bulbGeometry, bulbPaint, RIM_BULBS + SPOKES * SPOKE_BULBS);
    const bracketMesh = new THREE.InstancedMesh(bracket, brass, CARS);
    let bulbAt = 0;
    for (let index = 0; index < SPOKES; index += 1) {
      const angle = (index * Math.PI * 2) / SPOKES;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      // The beam is authored along +y and reaches from the hub to the rim; the pair straddles the
      // spoke's centreline, which is where the bulb string runs.
      for (const side of [-1, 1] as const) {
        const lateral = side * SPOKE_PAIR_OFFSET;
        const x = cos * (RIM / 2) - sin * lateral;
        const y = sin * (RIM / 2) + cos * lateral;
        place(spokeMesh, index * 2 + (side === -1 ? 0 : 1), x, y, 0, angle - Math.PI / 2);
      }
      for (let step = 0; step < SPOKE_BULBS; step += 1) {
        const radius = INNER_RING + ((step + 0.5) / SPOKE_BULBS) * (RIM - INNER_RING);
        place(bulbMesh, bulbAt, Math.cos(angle) * radius, Math.sin(angle) * radius, 0.1, 0);
        bulbAt += 1;
      }
      place(bracketMesh, index, cos * (RIM + 0.22), sin * (RIM + 0.22), 0, angle - Math.PI / 2);
    }
    for (let index = 0; index < RIM_BULBS; index += 1) {
      const angle = (index * Math.PI * 2) / RIM_BULBS;
      place(bulbMesh, bulbAt, Math.cos(angle) * RIM, Math.sin(angle) * RIM, 0.16, 0);
      bulbAt += 1;
    }
    spokeMesh.instanceMatrix.needsUpdate = true;
    bulbMesh.instanceMatrix.needsUpdate = true;
    bracketMesh.instanceMatrix.needsUpdate = true;
    this.wheel.add(spokeMesh, bulbMesh, bracketMesh);

    // ---- the lantern cars, outside the rim, level at every angle ----
    for (let index = 0; index < CARS; index += 1) {
      const angle = (index * Math.PI * 2) / CARS;
      this.carOffsets.push(new THREE.Vector3(Math.cos(angle) * CAR_RADIUS, Math.sin(angle) * CAR_RADIUS, 0));
    }
    for (const [geometry, material, localY, localZ] of [
      [carBody, teal, -0.1, 0],
      [carRoof, brass, 0.34, 0],
      [carWindow, window, -0.06, 0.24],
    ] as const) {
      const mesh = new THREE.InstancedMesh(geometry, material, CARS);
      mesh.userData.localOffset = new THREE.Vector3(0, localY, localZ);
      this.carParts.push(mesh);
      this.wheel.add(mesh);
    }
    this.levelCars();

    // ---- the lit brass hub, the fenced base and its current pylon ----
    const boss = new THREE.Mesh(hubBoss, brass);
    boss.position.y = HUB;
    boss.rotation.x = Math.PI / 2;
    const core = new THREE.Mesh(hubCore, window);
    core.position.y = HUB;
    core.rotation.x = Math.PI / 2;
    const currentPylon = new THREE.Mesh(pylon, current);
    currentPylon.position.set(0, (HUB - 0.2) / 2 + 0.16, -0.14);

    const legs: THREE.Mesh[] = [];
    for (const side of [-1, 1] as const) {
      const leg = new THREE.Mesh(support, brass);
      leg.position.set(side * 0.85, 1.82, -0.45);
      leg.rotation.z = -side * 0.471;
      legs.push(leg);
    }

    const platform = new THREE.Mesh(baseDisc, brass);
    platform.position.y = 0.13;
    const railLow = new THREE.Mesh(fenceRail, brass);
    railLow.position.y = 0.42;
    railLow.rotation.x = Math.PI / 2;
    const railHigh = new THREE.Mesh(fenceRail, brass);
    railHigh.position.y = 0.72;
    railHigh.rotation.x = Math.PI / 2;
    const posts = new THREE.InstancedMesh(fencePost, brass, 24);
    for (let index = 0; index < 24; index += 1) {
      const angle = (index * Math.PI * 2) / 24;
      place(posts, index, Math.cos(angle) * (BASE_RADIUS - 0.1), 0.5, Math.sin(angle) * (BASE_RADIUS - 0.1), 0);
    }
    posts.instanceMatrix.needsUpdate = true;
    // The plate's base is an ellipse under its own perspective; compressing z also keeps the
    // dressing inside the target box the sim authored (halfZ 1.8) instead of overhanging it.
    const base = new THREE.Group();
    base.add(platform, railLow, railHigh, posts);
    base.scale.set(1, 1, 0.5);

    const contactShadow = new THREE.Mesh(shadow, ground);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.02;
    contactShadow.scale.set(1, 0.35, 1);
    const faultBeacon = new THREE.Mesh(fault, rust);
    faultBeacon.position.set(0, HUB + 0.7, 0.55);
    this.faultBeacon.add(faultBeacon);
    this.faultBeacon.visible = false;

    this.group.add(contactShadow, base, ...legs, currentPylon, this.wheel, boss, core, this.faultBeacon);
    this.group.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
  }
}
