import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { CombatSystem, ShooterHandle } from '../systems/CombatSystem';
import type { ClaimJumperEnemy } from './Enemy';
import { TURRET_SILHOUETTE_HEIGHT } from './Turret';

export type DeepwaterWeaponId = 'harpoonBallista' | 'depthChargeRack' | 'depthChargeLobber';
export type CureArmsOutcome = 'freed' | 'turned-back' | 'powered-down' | 'damaged';

type DeckBuilding = Readonly<{ buildingId: string; x: number; z: number }>;
type PendingTreatment = Readonly<{
  targetId: number;
  variantId: string | null;
  eliteKind: 'baron' | 'railcar' | null;
}>;

export type DeepwaterArsenalDiagnostics = {
  active: boolean;
  items: Array<{
    id: DeepwaterWeaponId | 'pressureSealed';
    line: 'fire' | 'watch' | 'powder';
    munitionId: string | null;
  }>;
  fires: Record<DeepwaterWeaponId, number>;
  sharedMunition: {
    id: string;
    stock: number;
    capacity: number;
    spentBy: Record<'depthChargeRack' | 'depthChargeLobber', number>;
  };
  pressureSealed: { active: boolean; inDiveZone: boolean };
  silhouette: { harpoonBallista: number; priorTurret: number };
  treatmentEvents: Array<{
    weaponId: DeepwaterWeaponId;
    targetId: number;
    variantId: string | null;
    outcome: CureArmsOutcome;
  }>;
  visuals: { harpoonBallista: boolean; depthChargeRack: boolean; depthChargeLobber: boolean };
};

const weaponIds: readonly DeepwaterWeaponId[] = ['harpoonBallista', 'depthChargeRack', 'depthChargeLobber'];
const machineVariants = new Set(['steam_wrecker', 'dynamo_crawler', 'homemaker_9000', 'old_digger']);

export class DeepwaterArsenal {
  readonly group = new THREE.Group();

  private readonly harpoon = makeHarpoonBallista();
  private readonly rack = makeDepthChargeRack();
  private readonly lobber = makeDepthChargeLobber();
  private readonly deckPositions = {
    turret: new THREE.Vector3(),
    sentry_beacon: new THREE.Vector3(),
  };
  private readonly deckPresent = { turret: false, sentry_beacon: false };
  private readonly fires: Record<DeepwaterWeaponId, number> = { harpoonBallista: 0, depthChargeRack: 0, depthChargeLobber: 0 };
  private readonly spentBy = { depthChargeRack: 0, depthChargeLobber: 0 };
  private readonly pending: Record<DeepwaterWeaponId, PendingTreatment[]> = {
    harpoonBallista: [],
    depthChargeRack: [],
    depthChargeLobber: [],
  };
  private readonly aimedAt: Partial<Record<DeepwaterWeaponId, PendingTreatment>> = {};
  private readonly lastDamage: Record<DeepwaterWeaponId, number> = { harpoonBallista: 0, depthChargeRack: 0, depthChargeLobber: 0 };
  private readonly treatmentEvents: DeepwaterArsenalDiagnostics['treatmentEvents'] = [];
  private readonly unsubscribes: Array<() => void> = [];
  private stock: number = Balance.e5Arsenal.depthChargeMunition.capacity;

  constructor(
    private readonly combat: CombatSystem,
    private readonly heroPosition: () => THREE.Vector3,
    private readonly deckBuildings: () => readonly DeckBuilding[],
    private readonly active: () => boolean,
    private readonly canFire: () => boolean,
    private readonly lobberEquipped: () => boolean,
    private readonly inDiveZone: () => boolean,
  ) {
    this.group.name = 'DeepwaterArsenal';
    this.group.add(this.harpoon, this.rack, this.lobber);
    this.group.visible = false;

    const harpoon = Balance.e5Arsenal.harpoonBallista;
    const charge = Balance.e5Arsenal.depthChargeMunition;
    this.unsubscribes.push(
      combat.registerShooter(this.shooter('harpoonBallista', () => this.deckPositions.turret, {
        range: harpoon.range,
        cooldown: harpoon.cooldown,
        damage: harpoon.damage,
        projSpeed: harpoon.boltSpeed,
      })),
      combat.registerShooter(this.shooter('depthChargeRack', () => this.deckPositions.sentry_beacon, {
        kind: 'lob',
        range: Balance.e5Arsenal.depthChargeRack.range,
        cooldown: Balance.e5Arsenal.depthChargeRack.cooldown,
        damage: charge.damage,
        projSpeed: 0,
        aoe: { radius: charge.radius, airTime: charge.airTime },
      })),
      combat.registerShooter(this.shooter('depthChargeLobber', heroPosition, {
        kind: 'lob',
        range: Balance.e5Arsenal.depthChargeLobber.range,
        cooldown: Balance.e5Arsenal.depthChargeLobber.cooldown,
        damage: charge.damage,
        projSpeed: 0,
        aoe: { radius: charge.radius, airTime: charge.airTime },
      })),
    );
  }

  update(at: number): void {
    const active = this.active();
    this.group.visible = active;
    this.deckPresent.turret = false;
    this.deckPresent.sentry_beacon = false;
    for (const building of this.deckBuildings()) {
      if (building.buildingId !== 'turret' && building.buildingId !== 'sentry_beacon') continue;
      this.deckPositions[building.buildingId].set(building.x, 0, building.z);
      this.deckPresent[building.buildingId] = true;
    }
    this.harpoon.visible = active && this.deckPresent.turret;
    this.rack.visible = active && this.deckPresent.sentry_beacon;
    this.lobber.visible = active;
    if (this.harpoon.visible) {
      this.harpoon.position.copy(this.deckPositions.turret);
      this.harpoon.rotation.y = at * 0.35;
    }
    if (this.rack.visible) this.rack.position.copy(this.deckPositions.sentry_beacon);
    this.lobber.position.copy(this.heroPosition());
  }

  resolveTreatments(): void {
    for (const weaponId of weaponIds) {
      const damage = this.combat.damageByOwner[ownerId(weaponId)] ?? 0;
      if (damage > this.lastDamage[weaponId]) {
        const target = this.pending[weaponId].shift();
        if (target) this.recordTreatment(weaponId, target);
      }
      this.lastDamage[weaponId] = damage;
    }
  }

  get diagnostics(): DeepwaterArsenalDiagnostics {
    const active = this.active();
    const munitionId = Balance.e5Arsenal.depthChargeMunition.id;
    return {
      active,
      items: active
        ? [
            { id: 'pressureSealed', line: 'fire', munitionId: null },
            { id: 'harpoonBallista', line: 'watch', munitionId: null },
            { id: 'depthChargeRack', line: 'watch', munitionId },
            { id: 'depthChargeLobber', line: 'powder', munitionId },
          ]
        : [],
      fires: { ...this.fires },
      sharedMunition: {
        id: munitionId,
        stock: this.stock,
        capacity: Balance.e5Arsenal.depthChargeMunition.capacity,
        spentBy: { ...this.spentBy },
      },
      pressureSealed: { active, inDiveZone: this.inDiveZone() },
      silhouette: {
        harpoonBallista: Balance.e5Arsenal.harpoonBallista.silhouetteHeight,
        priorTurret: TURRET_SILHOUETTE_HEIGHT,
      },
      treatmentEvents: this.treatmentEvents.map((event) => ({ ...event })),
      visuals: {
        harpoonBallista: this.harpoon.visible,
        depthChargeRack: this.rack.visible,
        depthChargeLobber: this.lobber.visible,
      },
    };
  }

  reset(): void {
    this.stock = Balance.e5Arsenal.depthChargeMunition.capacity;
    Object.assign(this.fires, { harpoonBallista: 0, depthChargeRack: 0, depthChargeLobber: 0 });
    Object.assign(this.spentBy, { depthChargeRack: 0, depthChargeLobber: 0 });
    Object.assign(this.lastDamage, { harpoonBallista: 0, depthChargeRack: 0, depthChargeLobber: 0 });
    for (const weaponId of weaponIds) this.pending[weaponId].length = 0;
    this.treatmentEvents.length = 0;
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribes) unsubscribe();
    this.group.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) for (const material of mesh.material) material.dispose();
      else mesh.material?.dispose();
    });
  }

  private shooter(
    weaponId: DeepwaterWeaponId,
    getPos: () => THREE.Vector3,
    config: Omit<ShooterHandle, 'resumeKey' | 'id' | 'enabled' | 'getPos' | 'targetPoint' | 'onFire' | 'onVolleyFired' | 'volley'>,
  ): ShooterHandle {
    const usesCharge = weaponId !== 'harpoonBallista';
    return {
      ...config,
      resumeKey: `deepwater:${weaponId}`,
      id: ownerId(weaponId),
      suspend: false,
      getPos,
      volley: 1,
      enabled: () =>
        this.active()
        && this.canFire()
        && (!usesCharge || this.stock > 0)
        && (weaponId !== 'depthChargeLobber' || this.lobberEquipped())
        && (weaponId === 'harpoonBallista'
          ? this.deckPresent.turret
          : weaponId === 'depthChargeRack'
            ? this.deckPresent.sentry_beacon
            : true),
      targetPoint: (_origin, target) => {
        this.aimedAt[weaponId] = targetSnapshot(target);
        return target.position;
      },
      onFire: () => {
        const target = this.aimedAt[weaponId];
        if (target) this.pending[weaponId].push(target);
      },
      onVolleyFired: () => {
        this.fires[weaponId] += 1;
        if (weaponId === 'harpoonBallista') return;
        this.stock = Math.max(0, this.stock - 1);
        this.spentBy[weaponId] += 1;
      },
    };
  }

  private recordTreatment(weaponId: DeepwaterWeaponId, target: PendingTreatment): void {
    const outcome: CureArmsOutcome = target.eliteKind
      ? 'damaged'
      : machineVariants.has(target.variantId ?? '')
        ? 'powered-down'
        : target.variantId === 'corsair_skiff'
          ? 'turned-back'
          : 'freed';
    this.treatmentEvents.push({ weaponId, targetId: target.targetId, variantId: target.variantId, outcome });
    if (this.treatmentEvents.length > Balance.e5Arsenal.treatmentEventHistory) this.treatmentEvents.shift();
  }
}

function targetSnapshot(target: ClaimJumperEnemy): PendingTreatment {
  return { targetId: target.id, variantId: target.variantId, eliteKind: target.eliteKind };
}

function ownerId(weaponId: DeepwaterWeaponId): string {
  return `e5_${weaponId}`;
}

function material(color: string, emissive: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: 0.35, roughness: 0.55, metalness: 0.32 });
}

function makeHarpoonBallista(): THREE.Group {
  const height = Balance.e5Arsenal.harpoonBallista.silhouetteHeight;
  const group = new THREE.Group();
  group.name = 'HarpoonBallista';
  const brass = material('#c4883a', '#5b8a8a');
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.18, 10), brass);
  base.position.y = 0.09;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, height - 0.18, 8), brass);
  mast.position.y = 0.18 + (height - 0.18) / 2;
  const bow = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.12), brass);
  bow.position.y = height - 0.05;
  group.add(base, mast, bow);
  return group;
}

function makeDepthChargeRack(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'DepthChargeRack';
  const teal = material('#5b8a8a', '#83ded7');
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.46, 0.54), teal);
  frame.position.y = 0.23;
  group.add(frame);
  return group;
}

function makeDepthChargeLobber(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'DepthChargeLobber';
  const brass = material('#c4883a', '#83ded7');
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.56, 8), brass);
  tube.position.set(0.35, 0.55, 0);
  tube.rotation.z = -0.42;
  group.add(tube);
  return group;
}
