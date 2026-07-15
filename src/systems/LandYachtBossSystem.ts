import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { Balance } from '../game/Balance';
import type { BuildingTarget } from './TargetingSystem';
import * as Terrain from '../world/Terrain';

const VARIANT = 'land_yacht';
const COMPONENT_IDS = ['wheels', 'crane', 'wheelhouse'] as const;
type LandYachtComponentId = typeof COMPONENT_IDS[number];

const intactUrl = new URL('../../assets/raw/boss-land-yacht.png', import.meta.url).href;
const damagedUrl = new URL('../../assets/raw/boss-land-yacht-damage.png', import.meta.url).href;
const PLATE = { width: 1672, height: 941 } as const;
const CROPS: Record<LandYachtComponentId, { x: number; y: number; width: number; height: number; scale: [number, number] }> = {
  wheels: { x: 430, y: 500, width: 970, height: 390, scale: [7.2, 2.9] },
  crane: { x: 360, y: 70, width: 500, height: 470, scale: [4.1, 3.8] },
  wheelhouse: { x: 760, y: 90, width: 560, height: 470, scale: [4.4, 3.7] },
};

export type LandYachtBossDiagnostics = Readonly<{
  active: boolean;
  act: 0 | 1 | 2 | 3;
  dreadEvents: number;
  dreadVisible: boolean;
  orbiting: boolean;
  orbitDistance: number;
  stolenHeads: number;
  escortsFunded: number;
  beached: boolean;
  craneReach: number;
  turretsGrabbed: number;
  bellTaken: boolean;
  gangDeparted: boolean;
  salvageReady: boolean;
  wreckRemains: boolean;
}>;

type ComponentSprites = { healthy: THREE.Sprite; damaged: THREE.Sprite };
type OrbitRoute = Readonly<{ center: Readonly<{ x: number; z: number }>; radius: number; angularSpeed: number }>;

export class LandYachtBossSystem {
  readonly group = new THREE.Group();
  private readonly componentSprites = new Map<LandYachtComponentId, ComponentSprites>();
  private readonly dustColumn = new THREE.Group();
  private readonly derricks: THREE.Group[] = [];
  private readonly wreck = sprite(damagedUrl, { x: 330, y: 120, width: 1100, height: 760 }, [9.4, 6.5]);
  private readonly destroyed = new Set<LandYachtComponentId>();
  private readonly destroyedPositions = new Map<LandYachtComponentId, THREE.Vector3>();
  private readonly lastCenter = new THREE.Vector3();
  private lastAt = 0;
  private seenBoss = false;
  private act: 0 | 1 | 2 | 3 = 0;
  private dreadEvents = 0;
  private dreadUntil = 0;
  private orbitDistance = 0;
  private hasCenter = false;
  private orbitRouteInstalled = false;
  private nextLootAt = Number.POSITIVE_INFINITY;
  private stolenHeads = 0;
  private escortsFunded = 0;
  private beached = false;
  private nextCraneGrabAt = Number.POSITIVE_INFINITY;
  private turretsGrabbed = 0;
  private bellTaken = false;
  private gangDeparted = false;
  private salvageReady = false;
  private wreckRemains = false;

  constructor(
    private readonly enemies: () => readonly ClaimJumperEnemy[],
    private readonly orbitRoute: () => OrbitRoute | null,
    private readonly spawnEscort: (position: THREE.Vector3) => boolean,
    private readonly findCraneTarget: (position: THREE.Vector3, radius: number) => BuildingTarget | null,
    private readonly damageBuilding: (target: BuildingTarget, amount: number) => boolean,
    private readonly callout: (position: THREE.Vector3, text: string) => void,
  ) {
    this.group.name = 'LandYacht.PlaceholderPlateCrops';
    for (const id of COMPONENT_IDS) {
      const crop = CROPS[id];
      const healthy = sprite(intactUrl, crop, crop.scale);
      const damaged = sprite(damagedUrl, crop, crop.scale);
      healthy.name = `LandYacht.${id}.Intact`;
      damaged.name = `LandYacht.${id}.Damaged`;
      this.componentSprites.set(id, { healthy, damaged });
      this.group.add(healthy, damaged);
    }

    for (let index = 0; index < 4; index += 1) {
      const angle = index * Math.PI * 0.5 + Math.PI * 0.25;
      const marker = derrickMarker();
      marker.position.set(
        Math.cos(angle) * Balance.landYacht.derrickRadius,
        0,
        Math.sin(angle) * Balance.landYacht.derrickRadius,
      );
      marker.rotation.y = -angle;
      marker.name = `LandYacht.DerrickHead.${index + 1}`;
      this.derricks.push(marker);
      this.group.add(marker);
    }

    for (let index = 0; index < 4; index += 1) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.65 + index * 0.2, 10, 7),
        new THREE.MeshBasicMaterial({ color: '#c99052', transparent: true, opacity: 0.3 - index * 0.035, depthWrite: false }),
      );
      puff.position.set(index % 2 === 0 ? -0.25 : 0.25, index * 0.9, 0);
      this.dustColumn.add(puff);
    }
    this.dustColumn.name = 'LandYacht.DreadDustColumn';
    this.dustColumn.position.set(-Balance.landYacht.derrickRadius, 0, 0);
    this.wreck.name = 'LandYacht.WreckSalvage';
    this.group.add(this.dustColumn, this.wreck);
    this.hidePresentation();
  }

  onWaveStarted(wave: number, bossWave: number, at: number, watchtowerReady: boolean): void {
    if (wave !== bossWave - 2 || this.dreadEvents > 0 || !watchtowerReady) return;
    this.dreadEvents = 1;
    this.dreadUntil = at + Balance.landYacht.dreadSeconds;
  }

  onComponentKilled(id: string | undefined, position: THREE.Vector3, at: number): void {
    if (!COMPONENT_IDS.includes(id as LandYachtComponentId)) return;
    const componentId = id as LandYachtComponentId;
    this.destroyed.add(componentId);
    this.destroyedPositions.set(componentId, position.clone());
    this.advanceActs(at, this.liveComponents());
  }

  update(at: number): void {
    this.lastAt = at;
    const components = this.liveComponents();
    if (!this.seenBoss && components.size > 0) {
      this.seenBoss = true;
      this.act = 1;
      this.installOrbitRoute(components);
      this.nextLootAt = at + Balance.landYacht.lootIntervalSeconds;
    }
    if (!this.seenBoss) {
      this.dustColumn.visible = at < this.dreadUntil;
      return;
    }

    for (const id of COMPONENT_IDS) {
      if (!components.has(id) && !this.destroyed.has(id)) this.destroyed.add(id);
    }
    this.advanceActs(at, components);
    if (this.act === 1) this.updateOrbit(at, components);
    if (this.act === 2) this.updateCrane(at, components);
    this.syncPresentation(components);
  }

  restoreWreck(position: THREE.Vector3): void {
    if (this.wreckRemains) return;
    this.seenBoss = true;
    this.act = 3;
    this.beached = true;
    this.bellTaken = true;
    this.gangDeparted = true;
    this.salvageReady = true;
    this.wreckRemains = true;
    for (const id of COMPONENT_IDS) this.destroyed.add(id);
    this.placeWreck(position);
  }

  diagnostics(): LandYachtBossDiagnostics {
    return {
      active: this.seenBoss,
      act: this.act,
      dreadEvents: this.dreadEvents,
      dreadVisible: this.lastAt < this.dreadUntil,
      orbiting: this.act === 1,
      orbitDistance: round2(this.orbitDistance),
      stolenHeads: this.stolenHeads,
      escortsFunded: this.escortsFunded,
      beached: this.beached,
      craneReach: Balance.landYacht.craneReach,
      turretsGrabbed: this.turretsGrabbed,
      bellTaken: this.bellTaken,
      gangDeparted: this.gangDeparted,
      salvageReady: this.salvageReady,
      wreckRemains: this.wreckRemains,
    };
  }

  reset(): void {
    this.lastAt = 0;
    this.seenBoss = false;
    this.act = 0;
    this.dreadEvents = 0;
    this.dreadUntil = 0;
    this.orbitDistance = 0;
    this.hasCenter = false;
    this.orbitRouteInstalled = false;
    this.nextLootAt = Number.POSITIVE_INFINITY;
    this.stolenHeads = 0;
    this.escortsFunded = 0;
    this.beached = false;
    this.nextCraneGrabAt = Number.POSITIVE_INFINITY;
    this.turretsGrabbed = 0;
    this.bellTaken = false;
    this.gangDeparted = false;
    this.salvageReady = false;
    this.wreckRemains = false;
    this.destroyed.clear();
    this.destroyedPositions.clear();
    this.hidePresentation();
  }

  dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Sprite) {
        child.material.map?.dispose();
        child.material.dispose();
      } else if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        for (const material of Array.isArray(child.material) ? child.material : [child.material]) material.dispose();
      }
    });
  }

  private liveComponents(): Map<LandYachtComponentId, ClaimJumperEnemy> {
    const result = new Map<LandYachtComponentId, ClaimJumperEnemy>();
    for (const enemy of this.enemies()) {
      if (!enemy.isAlive || enemy.variantId !== VARIANT) continue;
      const id = enemy.bossComponentId as LandYachtComponentId;
      if (COMPONENT_IDS.includes(id)) result.set(id, enemy);
    }
    return result;
  }

  private advanceActs(at: number, components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>): void {
    if (!this.destroyed.has('wheels')) return;
    if (this.act < 2) {
      this.act = 2;
      this.beached = true;
      this.nextCraneGrabAt = at;
      this.pinComponents(components);
    }
    if (!this.destroyed.has('crane') || !this.destroyed.has('wheelhouse') || this.act >= 3) return;
    this.act = 3;
    this.bellTaken = true;
    this.gangDeparted = true;
    this.salvageReady = true;
    this.wreckRemains = true;
    const position = this.destroyedPositions.get('wheelhouse') ?? this.destroyedPositions.get('wheels') ?? this.lastCenter;
    this.placeWreck(position);
    this.callout(position, 'SALVAGE READY');
  }

  private pinComponents(components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>): void {
    for (const enemy of components.values()) enemy.scriptMoveTo(enemy.position.x, enemy.position.z, 0, { ignoreTerrain: true });
  }

  private installOrbitRoute(components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>): void {
    if (this.orbitRouteInstalled) return;
    const route = this.orbitRoute();
    if (!route || route.radius <= 0 || route.angularSpeed <= 0) return;
    this.orbitRouteInstalled = true;
    for (const enemy of components.values()) {
      const startAngle = Math.atan2(enemy.position.z - route.center.z, enemy.position.x - route.center.x);
      const points = Array.from({ length: 25 }, (_, index) => {
        const angle = startAngle + index * Math.PI * 2 / 24;
        return { x: route.center.x + Math.cos(angle) * route.radius, z: route.center.z + Math.sin(angle) * route.radius };
      });
      enemy.scriptMoveRoute(points, route.radius * route.angularSpeed, { ignoreTerrain: true });
    }
    for (let index = 0; index < this.derricks.length; index += 1) {
      const angle = index * Math.PI * 0.5 + Math.PI * 0.25;
      this.derricks[index]!.position.set(
        route.center.x + Math.cos(angle) * (route.radius + 4),
        0,
        route.center.z + Math.sin(angle) * (route.radius + 4),
      );
    }
  }

  private updateOrbit(at: number, components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>): void {
    if (components.size === 0) return;
    const center = centroid(components.values());
    if (this.hasCenter) this.orbitDistance += center.distanceTo(this.lastCenter);
    this.lastCenter.copy(center);
    this.hasCenter = true;
    if (at < this.nextLootAt || this.stolenHeads >= this.derricks.length) return;
    const crane = components.get('crane');
    if (!crane || !this.spawnEscort(crane.position)) {
      this.nextLootAt = at + 0.25;
      return;
    }
    this.derricks[this.stolenHeads]!.visible = false;
    this.stolenHeads += 1;
    this.escortsFunded += 1;
    this.nextLootAt = at + Balance.landYacht.lootIntervalSeconds;
    this.callout(crane.position, 'HEAD STOLEN — ESCORT FUNDED');
  }

  private updateCrane(at: number, components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>): void {
    const crane = components.get('crane');
    if (!crane || at < this.nextCraneGrabAt) return;
    const target = this.findCraneTarget(crane.position, Balance.landYacht.craneReach);
    this.nextCraneGrabAt = at + Balance.landYacht.craneGrabCooldownSeconds;
    if (!target || !this.damageBuilding(target, target.maxHp)) return;
    this.turretsGrabbed += 1;
    this.callout(target.position, 'CRANE GRAB');
  }

  private syncPresentation(components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>): void {
    this.dustColumn.visible = false;
    for (const [id, pair] of this.componentSprites) {
      const enemy = components.get(id);
      const damaged = Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= 0.5);
      pair.healthy.visible = Boolean(enemy) && !damaged;
      pair.damaged.visible = Boolean(enemy) && damaged;
      if (!enemy) continue;
      for (const visual of [pair.healthy, pair.damaged]) {
        visual.position.set(enemy.position.x, Terrain.visualY(enemy.position.x, enemy.position.z, CROPS[id].scale[1] * 0.48), enemy.position.z);
      }
    }
    for (let index = 0; index < this.derricks.length; index += 1) {
      const marker = this.derricks[index]!;
      marker.visible = this.act === 1 && index >= this.stolenHeads;
      marker.position.y = Terrain.visualY(marker.position.x, marker.position.z, 0);
    }
    this.wreck.visible = this.wreckRemains;
  }

  private placeWreck(position: THREE.Vector3): void {
    this.wreck.position.set(position.x, Terrain.visualY(position.x, position.z, 3.1), position.z);
    this.wreck.visible = true;
  }

  private hidePresentation(): void {
    for (const pair of this.componentSprites.values()) pair.healthy.visible = pair.damaged.visible = false;
    for (const derrick of this.derricks) derrick.visible = false;
    this.dustColumn.visible = false;
    this.wreck.visible = false;
  }
}

function sprite(
  url: string,
  crop: { x: number; y: number; width: number; height: number },
  scale: readonly [number, number],
): THREE.Sprite {
  const texture = new THREE.TextureLoader().load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(crop.width / PLATE.width, crop.height / PLATE.height);
  texture.offset.set(crop.x / PLATE.width, 1 - (crop.y + crop.height) / PLATE.height);
  const result = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false }));
  result.scale.set(scale[0], scale[1], 1);
  result.renderOrder = 4;
  return result;
}

function derrickMarker(): THREE.Group {
  const group = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 2.2, 8), new THREE.MeshBasicMaterial({ color: '#8b7d3c' }));
  mast.position.y = 1.1;
  const head = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.24, 0.3), new THREE.MeshBasicMaterial({ color: '#c4883a' }));
  head.position.set(0.35, 2.05, 0);
  head.rotation.z = -0.28;
  group.add(mast, head);
  return group;
}

function centroid(enemies: Iterable<ClaimJumperEnemy>): THREE.Vector3 {
  const result = new THREE.Vector3();
  let count = 0;
  for (const enemy of enemies) {
    result.add(enemy.position);
    count += 1;
  }
  return count > 0 ? result.multiplyScalar(1 / count) : result;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
