import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { ContractManifest } from '../meta/ContractFamilies';
import type { ShooterHandle } from './CombatSystem';

type MovementProfile = 'normal' | 'floaty' | 'free-fall';
type PhysicsContract = ContractManifest & {
  tileParams: ContractManifest['tileParams'] & {
    gravity?: {
      feelG?: number;
      lobArcDistanceMultiplier?: number;
      movement?: MovementProfile;
      projectileBehavior?: string;
    };
    atmosphere?: { outsideDomes?: string };
  };
  twist: ContractManifest['twist'] & {
    zeroGravity?: { projectiles?: string };
  };
};

export type E8PhysicsDiagnostics = {
  active: boolean;
  contractId: string;
  source: 'default' | 'gravity' | 'zero-gravity';
  movement: MovementProfile;
  feelG: number;
  lobArcDistanceMultiplier: number;
  lobAirTimeMultiplier: number;
  knockbackScale: number;
  orbitalReturn: boolean;
  vacuum: boolean;
  fixedTimestepOnly: true;
  filteredMovement: { x: number; y: number };
  adaptedLobs: Array<{ resumeKey: string; range: number; airTime: number }>;
};

export class E8PhysicsSystem {
  private readonly filteredMovement = new Map<number, THREE.Vector2>();
  private readonly adaptedLobs = new Map<string, { range: number; airTime: number }>();
  private readonly profile: Omit<E8PhysicsDiagnostics, 'filteredMovement' | 'adaptedLobs'>;

  constructor(contract: ContractManifest) {
    this.profile = profileFromContract(contract as PhysicsContract);
  }

  get diagnostics(): E8PhysicsDiagnostics {
    const movement = this.filteredMovement.get(0);
    return {
      ...this.profile,
      filteredMovement: {
        x: round3(movement?.x ?? 0),
        y: round3(movement?.y ?? 0),
      },
      adaptedLobs: [...this.adaptedLobs].map(([resumeKey, values]) => ({ resumeKey, ...values })),
    };
  }

  get lobArcDistanceMultiplier(): number {
    return this.profile.lobArcDistanceMultiplier;
  }

  filterMovement(slot: number, input: THREE.Vector2, fixedDelta: number, velocity?: THREE.Vector3): THREE.Vector2 {
    if (!this.profile.active || this.profile.movement === 'normal') return input;
    let filtered = this.filteredMovement.get(slot);
    if (!filtered) {
      filtered = new THREE.Vector2();
      this.filteredMovement.set(slot, filtered);
    }
    // Actor velocity is already part of run/reconnect snapshots, so live drift
    // has no hidden state that can diverge after a restore.
    if (velocity) filtered.set(velocity.x / Balance.hero.speed, velocity.z / Balance.hero.speed).clampLength(0, 1);
    const moving = input.lengthSq() > 0.0001;
    const freeFall = this.profile.movement === 'free-fall';
    const response = moving
      ? freeFall ? Balance.e8Physics.freeFallThrustResponsePerSecond : Balance.e8Physics.floatyThrustResponsePerSecond
      : freeFall ? Balance.e8Physics.freeFallDriftResponsePerSecond : Balance.e8Physics.floatyDriftResponsePerSecond;
    filtered.lerp(input, THREE.MathUtils.clamp(response * fixedDelta, 0, 1));
    if (filtered.lengthSq() > 1) filtered.normalize();
    return filtered;
  }

  scaleLobAirTime(seconds: number): number {
    return seconds * this.profile.lobAirTimeMultiplier;
  }

  scaleKnockback(distance: number): number {
    return distance * this.profile.knockbackScale;
  }

  adaptShooter(handle: ShooterHandle): ShooterHandle {
    if (handle.kind === 'lob' && handle.aoe) {
      handle.range *= this.profile.lobArcDistanceMultiplier;
      handle.aoe.airTime = this.scaleLobAirTime(handle.aoe.airTime);
      this.adaptedLobs.set(handle.resumeKey, { range: handle.range, airTime: handle.aoe.airTime });
    }
    if (handle.damage === 0 && handle.onFire) {
      const onFire = handle.onFire;
      handle.onFire = (at) => {
        const grapple = Balance.e8Arsenal.magnetGrapple as { pullDistance: number };
        const base = grapple.pullDistance;
        grapple.pullDistance = this.scaleKnockback(base);
        try {
          onFire(at);
        } finally {
          grapple.pullDistance = base;
        }
      };
    }
    return handle;
  }

  reset(slot?: number): void {
    if (slot === undefined) this.filteredMovement.clear();
    else this.filteredMovement.delete(slot);
  }
}

function profileFromContract(contract: PhysicsContract): Omit<E8PhysicsDiagnostics, 'filteredMovement' | 'adaptedLobs'> {
  const gravity = contract.tileParams.gravity;
  const zeroGravity = gravity?.feelG === 0 || contract.twist.zeroGravity !== undefined;
  const active = gravity !== undefined || zeroGravity;
  const feelG = active ? THREE.MathUtils.clamp(finiteOr(gravity?.feelG, 1), 0, 1) : 1;
  const movement: MovementProfile = zeroGravity
    ? 'free-fall'
    : gravity?.movement === 'floaty'
      ? 'floaty'
      : 'normal';
  const contractLob = finiteOr(gravity?.lobArcDistanceMultiplier, 1);
  const lobArcDistanceMultiplier = zeroGravity
    ? Balance.e8Physics.zeroGravityLobArcDistanceMultiplier
    : Math.max(1, contractLob);
  const orbitalReturn = gravity?.projectileBehavior === 'orbital-return' || contract.twist.zeroGravity?.projectiles === 'orbital-return';

  return {
    active,
    contractId: contract.id,
    source: zeroGravity ? 'zero-gravity' : gravity ? 'gravity' : 'default',
    movement,
    feelG,
    lobArcDistanceMultiplier,
    lobAirTimeMultiplier: lobArcDistanceMultiplier,
    knockbackScale: 1 + (1 - feelG) * Balance.e8Physics.knockbackScalePerLostG,
    orbitalReturn,
    vacuum: contract.tileParams.atmosphere?.outsideDomes !== undefined,
    fixedTimestepOnly: true,
  };
}

function finiteOr(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isFinite(value) ? value : fallback;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
