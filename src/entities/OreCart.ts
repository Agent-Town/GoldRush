import * as THREE from 'three';
import { RenderLayers } from '../core/RenderLayers';
import type { RailPathPoint } from '../meta/ContractFamilies';
import type { BuildingTarget } from '../systems/TargetingSystem';
import { visualY } from '../world/Terrain';

export type OreCartState = 'moving' | 'stopped' | 'destroyed' | 'arrived';

export type OreCartDiagnostics = {
  active: boolean;
  state: OreCartState;
  hp: number;
  maxHp: number;
  progress: number;
  repairProgress: number;
  x: number;
  z: number;
};

export class OreCart {
  readonly group = new THREE.Group();
  readonly target: BuildingTarget = {
    id: 'escort:ore-cart',
    family: 'megaproject', // Reuses the existing external-object CombatSystem damage seam.
    index: 0,
    position: this.group.position,
    halfX: 0.9,
    halfZ: 0.65,
    active: true,
    hp: 1,
    maxHp: 1,
    reachRadius: 0.9,
  };

  private readonly path: THREE.Vector3[];
  private readonly bodyMaterial = new THREE.MeshStandardMaterial({ color: '#8b7d3c', roughness: 0.72, metalness: 0.2 });
  private readonly fillMaterial = new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.88 });
  private segment = 1;
  private stateValue: OreCartState = 'moving';
  private hp: number;
  private repairProgress = 0;
  private travelled = 0;
  private readonly totalLength: number;

  constructor(
    points: readonly RailPathPoint[],
    private readonly speed: number,
    private readonly maxHp: number,
    private readonly stopHpRatio: number,
    private readonly repairSeconds: number,
    private readonly repairRadius: number,
  ) {
    this.path = points.map((point) => new THREE.Vector3(point.x, 0, point.z));
    this.totalLength = this.path.slice(1).reduce((sum, point, index) => sum + point.distanceTo(this.path[index]!), 0);
    this.hp = maxHp;
    this.target.hp = maxHp;
    this.target.maxHp = maxHp;
    this.group.name = 'OreCart';
    this.group.add(
      new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.65, 1.25), this.bodyMaterial),
      new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.55, 0.9), this.fillMaterial),
    );
    this.group.children[0]!.position.y = 0.48;
    this.group.children[1]!.position.y = 0.93;
    this.group.traverse((part) => { part.renderOrder = RenderLayers.gameplay; });
    const start = this.path[0];
    if (start) this.setPosition(start.x, start.z);
  }

  get diagnostics(): OreCartDiagnostics {
    return {
      active: this.target.active,
      state: this.stateValue,
      hp: this.hp,
      maxHp: this.maxHp,
      progress: this.totalLength > 0 ? Math.min(1, this.travelled / this.totalLength) : 0,
      repairProgress: this.repairProgress,
      x: this.group.position.x,
      z: this.group.position.z,
    };
  }

  update(delta: number, repairers: readonly THREE.Vector3[]): OreCartState {
    if (this.stateValue === 'destroyed' || this.stateValue === 'arrived') return this.stateValue;
    if (this.hp <= this.maxHp * this.stopHpRatio) {
      this.stateValue = 'stopped';
      const near = repairers.some((position) => position.distanceToSquared(this.group.position) <= this.repairRadius * this.repairRadius);
      this.repairProgress = near ? Math.min(1, this.repairProgress + delta / this.repairSeconds) : 0;
      if (this.repairProgress >= 1) {
        this.hp = this.maxHp;
        this.target.hp = this.hp;
        this.repairProgress = 0;
        this.stateValue = 'moving';
        this.syncDamageColor();
      }
      return this.stateValue;
    }

    let remaining = Math.max(0, delta * this.speed);
    while (remaining > 0 && this.segment < this.path.length) {
      const next = this.path[this.segment]!;
      const distance = this.group.position.distanceTo(next);
      if (distance <= remaining + 0.0001) {
        this.travelled += distance;
        remaining -= distance;
        this.setPosition(next.x, next.z);
        this.segment += 1;
      } else {
        const previous = this.group.position.clone();
        this.group.position.lerp(next, remaining / distance);
        this.travelled += remaining;
        this.face(previous, this.group.position);
        this.syncY();
        remaining = 0;
      }
    }
    if (this.segment >= this.path.length) {
      this.stateValue = 'arrived';
      this.target.active = false;
    }
    return this.stateValue;
  }

  reset(): void {
    this.segment = 1;
    this.stateValue = 'moving';
    this.hp = this.maxHp;
    this.repairProgress = 0;
    this.travelled = 0;
    this.target.active = true;
    this.target.hp = this.maxHp;
    const start = this.path[0];
    if (start) this.setPosition(start.x, start.z);
    this.syncDamageColor();
  }

  damage(amount: number): { applied: boolean; family: string; index: number; hp: number; maxHp: number; wrecked: boolean } {
    if (!this.target.active || this.stateValue === 'destroyed' || amount <= 0) return this.damageResult(false);
    this.hp = Math.max(0, this.hp - amount);
    this.target.hp = this.hp;
    if (this.hp <= 0) {
      this.stateValue = 'destroyed';
      this.target.active = false;
    } else if (this.hp <= this.maxHp * this.stopHpRatio) {
      this.stateValue = 'stopped';
    }
    this.syncDamageColor();
    return this.damageResult(true);
  }

  private damageResult(applied: boolean) {
    return { applied, family: 'escort_cart', index: 0, hp: this.hp, maxHp: this.maxHp, wrecked: this.stateValue === 'destroyed' };
  }

  private setPosition(x: number, z: number): void {
    const previous = this.group.position.clone();
    this.group.position.set(x, 0, z);
    this.face(previous, this.group.position);
    this.syncY();
  }

  private face(from: THREE.Vector3, to: THREE.Vector3): void {
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    if (Math.hypot(dx, dz) > 0.001) this.group.rotation.y = Math.atan2(dx, dz);
  }

  private syncY(): void {
    this.group.position.y = visualY(this.group.position.x, this.group.position.z, 0.08);
  }

  private syncDamageColor(): void {
    this.bodyMaterial.color.set(this.stateValue === 'destroyed' ? '#4b2a17' : this.stateValue === 'stopped' ? '#a0522d' : '#8b7d3c');
  }
}
