import * as THREE from 'three';
import type { GoldPickupPool } from '../entities/GoldPickup';
import type { ClaimJumperEnemy, EnemySpawnParams } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';
import { isBuildableId } from '../game/buildables';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import {
  HOMEMAKER_KEPT_ENTRY_ID,
  parseHomemakerKeptPayload,
  TILE_STATE_SCHEMA_VERSION,
  type HomemakerKeptPayload,
  type TileStateStore,
} from '../game/TileStateStore';
import { disposeObject3D } from '../utils/dispose';
import type { BuildSystem } from './BuildSystem';
import type { CombatSystem } from './CombatSystem';
import type { BuildingTarget, GoldHolding, TargetingSystem } from './TargetingSystem';
import * as Terrain from '../world/Terrain';

const VARIANT = 'homemaker_9000';
const ACT1_IDS = ['vac', 'rack'] as const;
const COMPONENT_IDS = [...ACT1_IDS, 'core'] as const;
type ComponentId = typeof COMPONENT_IDS[number];
const HOMEMAKER_3D_URL = new URL('../../assets/pilots/homemaker-9000-3d/homemaker-9000.glb', import.meta.url).href;
const HOMEMAKER_3D_TRIANGLES = 7_644;
const HOMEMAKER_DAMAGE_THRESHOLD = 0.5;
const RACK_SOURCE_ID = -9;
const HOMEMAKER_3D_COMPONENTS = {
  vac: { morph: 'Damage_DroppedVac', damageColor: '#62d7cd' },
  rack: { morph: 'Damage_SpentRack', damageColor: '#d95f32' },
  core: { morph: 'Damage_ChairPose', damageColor: '#83ded7' },
} as const;
type Homemaker3dState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';

export type HomemakerPersistence = Readonly<{
  readAtBirth: () => HomemakerKeptPayload | null;
  writeAtCeremony: (payload: HomemakerKeptPayload) => boolean;
}>;

type UnbuildResult = { removed: boolean; pickup?: GoldHolding };

export type HomemakerBossSuspendSnapshot = {
  act: 0 | 1 | 2 | 3;
  seenBoss: boolean;
  tidiedMarkers: number;
  anchor: { x: number; z: number };
  destroyed: ComponentId[];
  nextUnbuildIn: number | null;
  unbuilds: number;
  unbuildOrder: string[];
  rackTarget: { x: number; z: number } | null;
  rackStrikeIn: number | null;
  nextRackIn: number | null;
  rackArcs: number;
  structureDamageEvents: number;
  chairPlaced: boolean;
  poweredDown: boolean;
  curated: string[];
  partsPickupIds: string[];
};

export type HomemakerBossDiagnostics = {
  active: boolean;
  act: 0 | 1 | 2 | 3;
  position: { x: number; z: number };
  tidiedMarkers: number;
  liveComponents: string[];
  unbuilds: number;
  unbuildOrder: string[];
  partsStackPickups: number;
  rackArcs: number;
  rackTelegraphed: boolean;
  structureDamageEvents: number;
  playerDamageEvents: number;
  pickupsCurated: number;
  loosePickups: number;
  pileCenters: Array<{ x: number; z: number }>;
  pictogram: 'none' | 'sparkle' | 'broom' | 'DONE';
  chairPlaced: boolean;
  poweredDown: boolean;
  nonHostile: boolean;
  kept: boolean;
  persistentKept: boolean;
};

type HomemakerBossHost = {
  enemies: EnemyPool;
  buildSystem: () => BuildSystem;
  targeting: TargetingSystem;
  combat: CombatSystem;
  goldPickups: GoldPickupPool;
  announce: (text: string, title: string) => void;
  syncStockpileHoldings: () => void;
  tileStateStore: TileStateStore;
  contractId: string;
  enabled: boolean;
  now: () => number;
  suppressBossSpawn: () => void;
};

export function createHomemakerBossSystem(host: HomemakerBossHost): HomemakerBossSystem {
  host.goldPickups.setDemolishCollector((position, amount) =>
    host.buildSystem().collectDemolishRefund(position, amount, host.now()));
  return new HomemakerBossSystem(
    () => host.enemies.all,
    (position, params) => host.enemies.spawn(position, params),
    (enemy) => host.enemies.recycle(enemy),
    () => host.targeting.buildingsInRadius(new THREE.Vector3(), 1_000).filter((target) => isBuildableId(target.family)),
    (target, at) => {
      if (!isBuildableId(target.family)) return { removed: false };
      let pickupIndex = -1;
      const removed = host.buildSystem().demolish(
        target.family,
        target.index,
        at,
        target.position,
        Number.POSITIVE_INFINITY,
        (position, amount) => (pickupIndex = host.goldPickups.spawn(position, amount, 'demolish')) >= 0,
      );
      if (removed) host.syncStockpileHoldings();
      return {
        removed,
        pickup: pickupIndex >= 0 ? host.goldPickups.goldHoldings.find((holding) => holding.pickupIndex === pickupIndex) : undefined,
      };
    },
    (position, radius, damage, sourceId) => {
      let hits = 0;
      for (const target of host.targeting.buildingsInRadius(position, radius)) {
        const hp = target.hp;
        host.combat.damageBuilding(target, damage, sourceId);
        if (target.hp < hp) hits += 1;
      }
      return hits;
    },
    () => host.goldPickups.goldHoldings,
    host.announce,
    host.enabled,
    host.suppressBossSpawn,
    {
      readAtBirth: () => {
        const entry = host.tileStateStore.readSnapshot(host.contractId).entries
          .find((candidate) => candidate.kind === 'render' && candidate.id === HOMEMAKER_KEPT_ENTRY_ID);
        return entry ? parseHomemakerKeptPayload(entry.payload) : null;
      },
      writeAtCeremony: (payload) => {
        host.tileStateStore.stageWrite(host.contractId, {
          kind: 'render', id: HOMEMAKER_KEPT_ENTRY_ID, payload, schemaVersion: TILE_STATE_SCHEMA_VERSION,
        });
        return host.tileStateStore.commitAtRunEnd();
      },
    },
  );
}

/** E6's helpful boss: it attacks structures and loose objects, never people. */
export class HomemakerBossSystem {
  readonly group = new THREE.Group();
  private readonly machine = new THREE.Group();
  private readonly machinePrimitive = new THREE.Group();
  private readonly chairPrimitive = chair();
  private readonly rackRing = new THREE.Mesh(
    new THREE.RingGeometry(Balance.homemaker.rackRadius - 0.18, Balance.homemaker.rackRadius, 32),
    new THREE.MeshBasicMaterial({ color: '#d95f32', transparent: true, opacity: 0.58, side: THREE.DoubleSide, depthWrite: false }),
  );
  private readonly pictogram = pictogramSprite();
  private readonly tidied = [tidyMarker(-2.2), tidyMarker(2.2)];
  private readonly partsStacks = Array.from({ length: Balance.homemaker.partsStackCap }, () => partsStack());
  private readonly anchor = new THREE.Vector3(0, 0, -8);
  private readonly destroyed = new Set<ComponentId>();
  private readonly curated = new Set<string>();
  private readonly partsPickupIds: string[] = [];
  private act: 0 | 1 | 2 | 3 = 0;
  private seenBoss = false;
  private tidiedMarkers = 0;
  private nextUnbuildAt = Number.POSITIVE_INFINITY;
  private unbuilds = 0;
  private readonly unbuildOrder: string[] = [];
  private rackTarget: THREE.Vector3 | null = null;
  private rackStrikeAt = Number.POSITIVE_INFINITY;
  private nextRackAt = Number.POSITIVE_INFINITY;
  private rackArcs = 0;
  private structureDamageEvents = 0;
  private chairPlaced = false;
  private poweredDown = false;
  private persistentKept = false;
  private coreSpawnPending = false;
  private lastAt = 0;
  private homemaker3dState: Homemaker3dState;
  private homemaker3dLoadSerial = 0;
  private homemaker3dModel?: THREE.Object3D;
  private readonly homemaker3dMeshes = new Map<ComponentId, THREE.Mesh>();

  constructor(
    private readonly enemies: () => readonly ClaimJumperEnemy[],
    private readonly spawnEnemy: (position: THREE.Vector3, params: EnemySpawnParams) => ClaimJumperEnemy | null | undefined,
    private readonly recycleEnemy: (enemy: ClaimJumperEnemy) => void,
    private readonly buildings: () => readonly BuildingTarget[],
    private readonly unbuild: (target: BuildingTarget, at: number) => UnbuildResult,
    private readonly damageStructures: (position: THREE.Vector3, radius: number, damage: number, sourceId: number) => number,
    private readonly pickups: () => readonly GoldHolding[],
    private readonly announce: (text: string, title: string) => void,
    private readonly enabled: boolean,
    private readonly suppressBossSpawn: () => void,
    private readonly persistence: HomemakerPersistence,
  ) {
    this.homemaker3dState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
    this.group.name = 'Homemaker9000.Placeholder';
    this.buildPresentation();
    if (this.enabled) this.restorePersistentKept();
  }

  onWaveStarted(wave: number, bossWave: number): void {
    if (!this.enabled || this.persistentKept || !Number.isFinite(bossWave)) return;
    if (wave === bossWave - 2) this.tidiedMarkers = Math.max(this.tidiedMarkers, 1);
    if (wave === bossWave - 1) this.tidiedMarkers = Math.max(this.tidiedMarkers, 2);
    this.syncPresentation();
  }

  onComponentKilled(id: string | undefined, position: THREE.Vector3, at: number): void {
    if (!this.enabled || !COMPONENT_IDS.includes(id as ComponentId)) return;
    const componentId = id as ComponentId;
    this.destroyed.add(componentId);
    if (componentId === 'vac' && this.act === 1) this.startAct2(position, at);
    if (componentId === 'core' && this.act === 2) this.finish(position);
    this.syncPresentation();
  }

  update(at: number): void {
    const delta = Math.max(0, at - this.lastAt);
    this.lastAt = at;
    if (!this.enabled) return;
    if (this.persistentKept) {
      for (const enemy of this.liveComponents()) this.recycleEnemy(enemy);
      return this.syncPresentation();
    }
    if (this.coreSpawnPending && this.act === 2 && !this.poweredDown) {
      this.coreSpawnPending = false;
      this.spawnCore();
    }

    const components = this.liveComponents();
    if (!this.seenBoss && components.some((enemy) => ACT1_IDS.includes(enemy.bossComponentId as typeof ACT1_IDS[number]))) {
      this.startAct1(at, components);
    }
    if (!this.seenBoss || this.poweredDown) return this.syncPresentation();
    if (this.act === 1 && this.component('vac')) this.updateUnbuild(at);
    if ((this.act === 1 || this.act === 2) && this.component('rack')) this.updateRack(at);
    else this.rackTarget = null;
    if (this.act === 2) this.curatePickups(delta);
    this.syncPresentation();
  }

  diagnostics(): HomemakerBossDiagnostics {
    const activePickups = this.activePickups();
    return {
      active: this.seenBoss && !this.poweredDown,
      act: this.act,
      position: { x: round2(this.anchor.x), z: round2(this.anchor.z) },
      tidiedMarkers: this.tidiedMarkers,
      liveComponents: this.liveComponents().map((enemy) => enemy.bossComponentId ?? '').filter(Boolean),
      unbuilds: this.unbuilds,
      unbuildOrder: [...this.unbuildOrder],
      partsStackPickups: this.partsPickupIds.filter((id) => activePickups.some((pickup) => pickup.id === id)).length,
      rackArcs: this.rackArcs,
      rackTelegraphed: this.rackTarget !== null,
      structureDamageEvents: this.structureDamageEvents,
      playerDamageEvents: 0,
      pickupsCurated: this.curated.size,
      loosePickups: activePickups.length,
      pileCenters: this.pileCenters().map((position) => ({ x: round2(position.x), z: round2(position.z) })),
      pictogram: this.poweredDown ? 'DONE' : this.act === 2 ? 'broom' : this.act === 1 ? 'sparkle' : 'none',
      chairPlaced: this.chairPlaced,
      poweredDown: this.poweredDown,
      nonHostile: this.poweredDown,
      kept: this.chairPlaced,
      persistentKept: this.persistentKept,
    };
  }

  captureSuspend(at = this.lastAt): HomemakerBossSuspendSnapshot | null {
    if (!this.enabled || this.persistentKept) return null;
    const remaining = (deadline: number) => Number.isFinite(deadline) ? Math.max(0, deadline - at) : null;
    return {
      act: this.act,
      seenBoss: this.seenBoss,
      tidiedMarkers: this.tidiedMarkers,
      anchor: { x: this.anchor.x, z: this.anchor.z },
      destroyed: [...this.destroyed],
      nextUnbuildIn: remaining(this.nextUnbuildAt),
      unbuilds: this.unbuilds,
      unbuildOrder: [...this.unbuildOrder],
      rackTarget: this.rackTarget ? { x: this.rackTarget.x, z: this.rackTarget.z } : null,
      rackStrikeIn: remaining(this.rackStrikeAt),
      nextRackIn: remaining(this.nextRackAt),
      rackArcs: this.rackArcs,
      structureDamageEvents: this.structureDamageEvents,
      chairPlaced: this.chairPlaced,
      poweredDown: this.poweredDown,
      curated: [...this.curated],
      partsPickupIds: [...this.partsPickupIds],
    };
  }

  restoreSuspend(snapshot: HomemakerBossSuspendSnapshot | null, at: number): boolean {
    if (!this.enabled || !snapshot || this.persistentKept) return true;
    const deadline = (remaining: number | null) => remaining === null ? Number.POSITIVE_INFINITY : at + remaining;
    this.act = snapshot.act;
    this.seenBoss = snapshot.seenBoss;
    this.tidiedMarkers = snapshot.tidiedMarkers;
    this.anchor.set(snapshot.anchor.x, 0, snapshot.anchor.z);
    this.destroyed.clear();
    for (const id of snapshot.destroyed) this.destroyed.add(id);
    this.nextUnbuildAt = deadline(snapshot.nextUnbuildIn);
    this.unbuilds = snapshot.unbuilds;
    this.unbuildOrder.splice(0, this.unbuildOrder.length, ...snapshot.unbuildOrder);
    this.rackTarget = snapshot.rackTarget ? new THREE.Vector3(snapshot.rackTarget.x, 0, snapshot.rackTarget.z) : null;
    this.rackStrikeAt = deadline(snapshot.rackStrikeIn);
    this.nextRackAt = deadline(snapshot.nextRackIn);
    this.rackArcs = snapshot.rackArcs;
    this.structureDamageEvents = snapshot.structureDamageEvents;
    this.chairPlaced = snapshot.chairPlaced;
    this.poweredDown = snapshot.poweredDown;
    this.curated.clear();
    for (const id of snapshot.curated) this.curated.add(id);
    this.partsPickupIds.splice(0, this.partsPickupIds.length, ...snapshot.partsPickupIds);
    this.coreSpawnPending = false;
    this.lastAt = at;
    if (this.act === 2 && !this.component('core')) this.spawnCore();
    this.syncPresentation();
    return true;
  }

  reset(): void {
    this.disposeHomemaker3d(performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off');
    for (const enemy of this.liveComponents()) this.recycleEnemy(enemy);
    this.act = 0;
    this.seenBoss = false;
    this.tidiedMarkers = 0;
    this.nextUnbuildAt = Number.POSITIVE_INFINITY;
    this.unbuilds = 0;
    this.unbuildOrder.length = 0;
    this.partsPickupIds.length = 0;
    this.rackTarget = null;
    this.rackStrikeAt = Number.POSITIVE_INFINITY;
    this.nextRackAt = Number.POSITIVE_INFINITY;
    this.rackArcs = 0;
    this.structureDamageEvents = 0;
    this.chairPlaced = false;
    this.poweredDown = false;
    this.persistentKept = false;
    this.coreSpawnPending = false;
    this.lastAt = 0;
    this.destroyed.clear();
    this.curated.clear();
    if (this.enabled) this.restorePersistentKept();
    this.syncPresentation();
  }

  dispose(): void {
    this.coreSpawnPending = false;
    this.disposeHomemaker3d('disposed');
    disposeObject3D(this.group);
    this.group.clear();
  }

  private startAct1(at: number, components: readonly ClaimJumperEnemy[]): void {
    this.seenBoss = true;
    this.act = 1;
    this.tidiedMarkers = 2;
    this.anchor.set(0, 0, -8);
    for (const enemy of components) {
      const offset = componentOffset(enemy.bossComponentId as ComponentId);
      enemy.scriptMoveTo(this.anchor.x + offset.x, this.anchor.z + offset.z, Balance.homemaker.arrivalSpeed, { ignoreTerrain: true });
    }
    this.nextUnbuildAt = at + Balance.homemaker.unbuildIntervalSeconds;
    this.nextRackAt = at + Balance.homemaker.rackIntervalSeconds;
  }

  private startAct2(position: THREE.Vector3, at: number): void {
    this.act = 2;
    const vacOffset = componentOffset('vac');
    this.anchor.set(position.x - vacOffset.x, 0, position.z - vacOffset.z);
    this.coreSpawnPending = true;
    const rack = this.component('rack');
    rack?.scriptMoveTo(this.anchor.x + componentOffset('rack').x, this.anchor.z, 0, { ignoreTerrain: true });
    this.nextRackAt = at + Balance.homemaker.rackIntervalSeconds * Balance.homemaker.rackAct2CadenceMult;
    this.announce('The loose pieces are being arranged. It is behind schedule.', 'THE MESS');
  }

  private spawnCore(): void {
    this.spawnEnemy(this.anchor.clone(), {
      eliteKind: 'railcar',
      hpScale: Balance.homemaker.componentHp.core / Balance.enemy.hp,
      speedScale: 0,
      visualScale: 1.5,
      contactDamageScale: 0,
      buildingDamageScale: 0,
      supportBuildingDamageScale: 0,
      heroPursuitRange: 0,
      variantId: VARIANT,
      variantLabel: 'The Homemaker-9000',
      tint: '#83ded7',
      bossGroupId: 'e6-glow-mesa:homemaker-core',
      bossGroupSize: 1,
      bossGroupTotalHp: Balance.homemaker.componentHp.core,
      bossComponentId: 'core',
      bossComponentLabel: 'CORE',
      bossDegradeSpeedMult: 1,
    })?.scriptMoveTo(this.anchor.x, this.anchor.z, 0, { ignoreTerrain: true });
  }

  private finish(position: THREE.Vector3): void {
    this.act = 3;
    this.anchor.set(position.x, 0, position.z);
    this.poweredDown = true;
    this.chairPlaced = true;
    this.coreSpawnPending = false;
    this.rackTarget = null;
    for (const enemy of this.liveComponents()) {
      if (enemy.bossComponentId !== 'core') this.recycleEnemy(enemy);
    }
    if (this.persistence.writeAtCeremony({ x: this.anchor.x, z: this.anchor.z })) this.suppressBossSpawn();
    this.announce('One chair. One completed chore. It sits, and the wanting stops.', 'DONE');
  }

  private updateUnbuild(at: number): void {
    if (at < this.nextUnbuildAt) return;
    this.nextUnbuildAt = at + Balance.homemaker.unbuildIntervalSeconds;
    const target = [...this.buildings()]
      .filter((building) => building.active && building.hp > 0 && building.family !== 'megaproject')
      .sort((left, right) => right.hp - left.hp || right.maxHp - left.maxHp || left.family.localeCompare(right.family) || left.index - right.index)[0];
    if (!target) return;
    const result = this.unbuild(target, at);
    if (!result.removed) return;
    this.unbuilds += 1;
    if (this.unbuildOrder.length < 64) this.unbuildOrder.push(`${target.family}:${target.index}`);
    if (result.pickup && this.partsPickupIds.length < Balance.homemaker.partsStackCap) {
      this.partsPickupIds.push(result.pickup.id);
    }
  }

  private updateRack(at: number): void {
    if (this.rackTarget && at >= this.rackStrikeAt) {
      const damage = Balance.homemaker.rackDamage * (this.act === 2 ? Balance.homemaker.rackAct2DamageMult : 1);
      this.structureDamageEvents += this.damageStructures(this.rackTarget, Balance.homemaker.rackRadius, damage, RACK_SOURCE_ID);
      this.rackArcs += 1;
      this.rackTarget = null;
      const cadence = this.act === 2 ? Balance.homemaker.rackAct2CadenceMult : 1;
      this.nextRackAt = at + Balance.homemaker.rackIntervalSeconds * cadence;
    }
    if (this.rackTarget || at < this.nextRackAt) return;
    const targets = this.buildings().filter((building) => building.active && building.hp > 0);
    const target = targets[this.rackArcs % Math.max(1, targets.length)];
    this.rackTarget = target?.position.clone() ?? this.anchor.clone().add(new THREE.Vector3(0, 0, 4));
    this.rackStrikeAt = at + Balance.homemaker.rackTelegraphSeconds;
  }

  private curatePickups(delta: number): void {
    const pickups = this.activePickups();
    const centers = this.pileCenters();
    for (let index = 0; index < pickups.length; index += 1) {
      const pickup = pickups[index]!;
      const center = centers[index % centers.length]!;
      const layer = Math.floor(index / centers.length);
      const targetX = center.x + (layer % 2 === 0 ? -1 : 1) * Math.min(0.42, layer * 0.08);
      const targetZ = center.z + Math.floor(layer / 2) * 0.12;
      const dx = targetX - pickup.position.x;
      const dz = targetZ - pickup.position.z;
      const distance = Math.hypot(dx, dz);
      if (distance <= 0.02) continue;
      const step = Math.min(distance, Balance.homemaker.pileSpeed * delta);
      pickup.position.x += (dx / distance) * step;
      pickup.position.z += (dz / distance) * step;
      this.curated.add(pickup.id);
    }
  }

  private activePickups(): GoldHolding[] {
    return this.pickups().filter((holding): holding is GoldHolding => holding.kind === 'pickup' && holding.active && holding.amount > 0);
  }

  private pileCenters(): [THREE.Vector3, THREE.Vector3] {
    return [
      new THREE.Vector3(this.anchor.x - Balance.homemaker.pileSpacing / 2, 0, this.anchor.z + 2.2),
      new THREE.Vector3(this.anchor.x + Balance.homemaker.pileSpacing / 2, 0, this.anchor.z + 2.2),
    ];
  }

  private liveComponents(): ClaimJumperEnemy[] {
    return this.enemies().filter((enemy) => enemy.isAlive && enemy.variantId === VARIANT);
  }

  private component(id: ComponentId): ClaimJumperEnemy | undefined {
    return this.liveComponents().find((enemy) => enemy.bossComponentId === id);
  }

  private restorePersistentKept(): void {
    const saved = this.persistence.readAtBirth();
    if (!saved) return;
    this.anchor.set(saved.x, 0, saved.z);
    this.act = 3;
    this.chairPlaced = true;
    this.poweredDown = true;
    this.persistentKept = true;
    this.suppressBossSpawn();
    for (const id of COMPONENT_IDS) this.destroyed.add(id);
  }

  private buildPresentation(): void {
    this.machinePrimitive.add(
      box(3.2, 2.5, 3, '#d8e1d2', 0, 1.25, 0),
      box(2.8, 0.65, 1.3, '#5b8a8a', -2.7, 1.5, 0),
      box(2.1, 2.1, 1.1, '#c4883a', 2.5, 1.7, 0),
      cylinder(0.75, 2.4, '#83ded7', 0, 3, 0),
    );
    this.machine.add(this.machinePrimitive, this.chairPrimitive);
    this.rackRing.rotation.x = -Math.PI / 2;
    this.rackRing.position.y = 0.08;
    this.pictogram.position.set(0, 5.6, 0);
    for (const marker of this.tidied) this.group.add(marker);
    for (const stack of this.partsStacks) this.group.add(stack);
    this.group.add(this.machine, this.rackRing, this.pictogram);
    this.syncPresentation();
  }

  private syncPresentation(): void {
    const visible = this.seenBoss || this.chairPlaced;
    if (visible) this.ensureHomemaker3d();
    const components = this.liveComponents();
    const center = this.act >= 2 || this.chairPlaced
      ? this.anchor
      : components.length > 0
      ? components.reduce((sum, enemy) => sum.add(enemy.position), new THREE.Vector3()).multiplyScalar(1 / components.length)
      : this.anchor;
    this.machine.position.set(center.x, Terrain.visualY(center.x, center.z, 0, 2), center.z);
    this.machine.visible = visible;
    const modelMounted = this.homemaker3dState === 'ready' && this.homemaker3dModel?.visible === true;
    this.machinePrimitive.visible = visible && !modelMounted && !this.chairPlaced;
    this.chairPrimitive.visible = this.chairPlaced && !modelMounted;
    this.rackRing.visible = this.rackTarget !== null;
    if (this.rackTarget) this.rackRing.position.set(
      this.rackTarget.x,
      Terrain.visualY(this.rackTarget.x, this.rackTarget.z, 0.08),
      this.rackTarget.z,
    );
    this.pictogram.visible = visible;
    this.pictogram.position.set(center.x, Terrain.visualY(center.x, center.z, 5.6, 2), center.z);
    renderPictogram(this.pictogram, this.poweredDown ? 'DONE' : this.act === 2 ? '🧹' : '✨');
    for (let index = 0; index < this.tidied.length; index += 1) {
      const marker = this.tidied[index]!;
      marker.position.y = Terrain.visualY(marker.position.x, marker.position.z, 0.02);
      marker.visible = index < this.tidiedMarkers && !this.seenBoss;
    }
    const pickups = this.activePickups();
    for (let index = 0; index < this.partsStacks.length; index += 1) {
      const stack = this.partsStacks[index]!;
      const pickup = pickups.find((candidate) => candidate.id === this.partsPickupIds[index]);
      stack.visible = pickup !== undefined;
      if (pickup) stack.position.set(
        pickup.position.x,
        Terrain.visualY(pickup.position.x, pickup.position.z, 0.02),
        pickup.position.z,
      );
    }
    this.updateHomemaker3d();
    this.publishHomemaker3d();
  }

  private ensureHomemaker3d(): void {
    if (this.homemaker3dState !== 'off' && this.homemaker3dState !== 'disposed') return;
    const serial = ++this.homemaker3dLoadSerial;
    this.homemaker3dState = 'loading';
    this.publishHomemaker3d();
    void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      if (serial !== this.homemaker3dLoadSerial) return;
      new GLTFLoader().load(HOMEMAKER_3D_URL, ({ scene }) => {
        if (serial !== this.homemaker3dLoadSerial) return disposeObject3D(scene);
        const meshes = this.inspectHomemaker3d(scene);
        if (!meshes) {
          disposeObject3D(scene);
          this.homemaker3dState = 'failed';
          return this.publishHomemaker3d();
        }
        scene.name = 'Homemaker9000.3d';
        this.homemaker3dModel = scene;
        this.homemaker3dMeshes.clear();
        for (const [id, mesh] of meshes) this.homemaker3dMeshes.set(id, mesh);
        this.machine.add(scene);
        this.homemaker3dState = 'ready';
        this.syncPresentation();
      }, undefined, () => {
        if (serial !== this.homemaker3dLoadSerial) return;
        this.homemaker3dState = 'failed';
        this.publishHomemaker3d();
      });
    }, () => {
      if (serial !== this.homemaker3dLoadSerial) return;
      this.homemaker3dState = 'failed';
      this.publishHomemaker3d();
    });
  }

  private inspectHomemaker3d(model: THREE.Object3D): Map<ComponentId, THREE.Mesh> | null {
    const meshes = new Map<ComponentId, THREE.Mesh>();
    const materials = new Set<THREE.Material>();
    let meshCount = 0;
    let triangles = 0;
    model.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      meshCount += 1;
      triangles += Math.floor((mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position')?.count ?? 0) / 3);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
      for (const id of COMPONENT_IDS) {
        const morph = HOMEMAKER_3D_COMPONENTS[id].morph;
        if (mesh.name === id && mesh.morphTargetDictionary?.[morph] === 0 && mesh.morphTargetInfluences?.length === 1) meshes.set(id, mesh);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    if (meshCount !== 3 || meshes.size !== 3 || materials.size !== 1 || triangles !== HOMEMAKER_3D_TRIANGLES) return null;
    for (const mesh of meshes.values()) {
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.emissiveMap = material.map;
      mesh.material = material;
    }
    for (const material of materials) material.dispose();
    return meshes;
  }

  private updateHomemaker3d(): void {
    if (!this.homemaker3dModel || this.homemaker3dState !== 'ready') return;
    this.homemaker3dModel.visible = this.seenBoss || this.chairPlaced;
    for (const [id, mesh] of this.homemaker3dMeshes) {
      const enemy = this.component(id);
      const damaged = this.chairPlaced || this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= HOMEMAKER_DAMAGE_THRESHOLD);
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = damaged ? 1 : 0;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.set(damaged ? HOMEMAKER_3D_COMPONENTS[id].damageColor : '#fff8e8');
      material.emissiveIntensity = damaged ? 2.6 : 1.8;
    }
  }

  private disposeHomemaker3d(nextState: Homemaker3dState): void {
    this.homemaker3dLoadSerial += 1;
    if (this.homemaker3dModel) {
      this.machine.remove(this.homemaker3dModel);
      disposeObject3D(this.homemaker3dModel);
      this.homemaker3dModel = undefined;
    }
    this.homemaker3dMeshes.clear();
    this.homemaker3dState = nextState;
    this.publishHomemaker3d();
  }

  private publishHomemaker3d(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.dataset.homemaker3dState = this.homemaker3dState;
    canvas.dataset.homemaker3dSource = this.homemaker3dState === 'ready' ? 'glb' : 'placeholder';
    canvas.dataset.homemaker3dMounted = String(this.homemaker3dState === 'ready' && this.homemaker3dModel?.visible === true);
    canvas.dataset.homemaker3dPresentation = this.chairPlaced ? 'chair' : this.seenBoss ? `act-${this.act}` : 'hidden';
    canvas.dataset.homemaker3dDamageStates = JSON.stringify(Object.fromEntries(COMPONENT_IDS.map((id) => {
      const enemy = this.component(id);
      const damaged = this.chairPlaced || this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= HOMEMAKER_DAMAGE_THRESHOLD);
      return [id, damaged ? 'broken' : 'intact'];
    })));
  }
}

export function decodeHomemakerBossSuspend(value: unknown): HomemakerBossSuspendSnapshot | null | false {
  if (value === null || value === undefined) return null;
  if (!isRecord(value)) return false;
  const act = value.act;
  const anchor = finitePoint(value.anchor);
  const rackTarget = value.rackTarget === null ? null : finitePoint(value.rackTarget);
  const destroyed = componentArray(value.destroyed);
  const unbuildOrder = stringArray(value.unbuildOrder, 64);
  const curated = stringArray(value.curated, Balance.steal.pickupCap);
  const partsPickupIds = stringArray(value.partsPickupIds, Balance.homemaker.partsStackCap);
  if (
    (act !== 0 && act !== 1 && act !== 2 && act !== 3)
    || typeof value.seenBoss !== 'boolean'
    || !integerBetween(value.tidiedMarkers, 0, 2)
    || !anchor
    || !destroyed
    || !timer(value.nextUnbuildIn)
    || !integerBetween(value.unbuilds, 0, 1_000_000)
    || !unbuildOrder
    || (value.rackTarget !== null && !rackTarget)
    || !timer(value.rackStrikeIn)
    || !timer(value.nextRackIn)
    || !integerBetween(value.rackArcs, 0, 1_000_000)
    || !integerBetween(value.structureDamageEvents, 0, 1_000_000)
    || typeof value.chairPlaced !== 'boolean'
    || typeof value.poweredDown !== 'boolean'
    || !curated
    || !partsPickupIds
  ) return false;
  return {
    act,
    seenBoss: value.seenBoss,
    tidiedMarkers: value.tidiedMarkers,
    anchor,
    destroyed,
    nextUnbuildIn: value.nextUnbuildIn,
    unbuilds: value.unbuilds,
    unbuildOrder,
    rackTarget,
    rackStrikeIn: value.rackStrikeIn,
    nextRackIn: value.nextRackIn,
    rackArcs: value.rackArcs,
    structureDamageEvents: value.structureDamageEvents,
    chairPlaced: value.chairPlaced,
    poweredDown: value.poweredDown,
    curated,
    partsPickupIds,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finitePoint(value: unknown): { x: number; z: number } | null {
  if (!isRecord(value) || typeof value.x !== 'number' || typeof value.z !== 'number') return null;
  return Number.isFinite(value.x) && Number.isFinite(value.z) ? { x: value.x, z: value.z } : null;
}

function integerBetween(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

function timer(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0);
}

function componentArray(value: unknown): ComponentId[] | null {
  if (!Array.isArray(value) || value.length > COMPONENT_IDS.length) return null;
  const output = value.filter((id): id is ComponentId => COMPONENT_IDS.includes(id as ComponentId));
  return output.length === value.length && new Set(output).size === output.length ? output : null;
}

function stringArray(value: unknown, max: number): string[] | null {
  if (!Array.isArray(value) || value.length > max || !value.every((entry) => typeof entry === 'string' && entry.length <= 128)) return null;
  return [...value];
}

function componentOffset(id: ComponentId): { x: number; z: number } {
  if (id === 'vac') return { x: -2.2, z: 0 };
  if (id === 'rack') return { x: 2.2, z: 0 };
  return { x: 0, z: 0 };
}

function box(width: number, height: number, depth: number, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color, roughness: 0.66, metalness: 0.22 }));
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(radius: number, height: number, color: string, x: number, y: number, z: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.52, metalness: 0.3 }));
  mesh.position.set(x, y, z);
  return mesh;
}

function tidyMarker(x: number): THREE.Group {
  const marker = partsStack();
  marker.name = 'Homemaker9000.OffscreenTidiedMarker';
  marker.position.set(x, 0, -30);
  return marker;
}

function partsStack(): THREE.Group {
  const stack = new THREE.Group();
  stack.name = 'Homemaker9000.PartsStackPickup';
  stack.add(
    box(0.8, 0.18, 0.55, '#c4883a', 0, 0.12, 0),
    box(0.66, 0.18, 0.48, '#83ded7', 0.08, 0.32, 0),
    box(0.52, 0.18, 0.4, '#f5e6c8', -0.06, 0.52, 0),
  );
  stack.visible = false;
  return stack;
}

function chair(): THREE.Group {
  const result = new THREE.Group();
  result.name = 'Homemaker9000.Chair';
  result.add(
    box(2.4, 0.32, 2.2, '#d8e1d2', 0, 1.7, 0),
    box(2.4, 2.8, 0.32, '#5b8a8a', 0, 3, 0.95),
    box(0.3, 1.7, 0.3, '#c4883a', -0.9, 0.85, -0.72),
    box(0.3, 1.7, 0.3, '#c4883a', 0.9, 0.85, -0.72),
    box(0.3, 1.7, 0.3, '#c4883a', -0.9, 0.85, 0.72),
    box(0.3, 1.7, 0.3, '#c4883a', 0.9, 0.85, 0.72),
  );
  result.visible = false;
  return result;
}

function pictogramSprite(): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 128;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(4.8, 1.6, 1);
  sprite.renderOrder = 20;
  sprite.userData.canvas = canvas;
  return sprite;
}

function renderPictogram(sprite: THREE.Sprite, text: string): void {
  if (sprite.userData.text === text) return;
  sprite.userData.text = text;
  const canvas = sprite.userData.canvas as HTMLCanvasElement;
  const context = canvas.getContext('2d')!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#211a16';
  context.strokeStyle = '#83ded7';
  context.lineWidth = 8;
  context.beginPath();
  context.roundRect(6, 6, canvas.width - 12, canvas.height - 12, 20);
  context.fill();
  context.stroke();
  context.fillStyle = '#fff8e8';
  context.font = 'bold 54px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);
  const material = sprite.material as THREE.SpriteMaterial;
  if (material.map) material.map.needsUpdate = true;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
