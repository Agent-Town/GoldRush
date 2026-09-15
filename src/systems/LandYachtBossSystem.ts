import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { disposeObject3D } from '../utils/dispose';
import type { BuildingTarget } from './TargetingSystem';
import * as Terrain from '../world/Terrain';

const VARIANT = 'land_yacht';
const COMPONENT_IDS = ['wheels', 'crane', 'wheelhouse'] as const;
type LandYachtComponentId = typeof COMPONENT_IDS[number];

const MODEL_URL = new URL('../../assets/pilots/land-yacht-3d/land-yacht.glb', import.meta.url).href;
const DAMAGE_MORPHS = {
  wheels: 'Damage_BeachedWheels', crane: 'Damage_SlackCrane', wheelhouse: 'Damage_CrackedWheelhouse',
} as const;
type ModelState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';

export type LandYachtBossDiagnostics = Readonly<{
  modelState: ModelState;
  modelMounted: boolean;
  damageStates: Record<LandYachtComponentId, boolean>;
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

type OrbitRoute = Readonly<{ center: Readonly<{ x: number; z: number }>; radius: number; angularSpeed: number }>;

export class LandYachtBossSystem {
  readonly group = new THREE.Group();
  private readonly body = new THREE.Group();
  private readonly components = new Map<LandYachtComponentId, THREE.Group>();
  private modelState: ModelState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
  private modelSerial = 0;
  private model?: THREE.Object3D;
  private readonly modelMeshes = new Map<LandYachtComponentId, THREE.Mesh>();
  private readonly bodyOffsets = new Map<LandYachtComponentId, THREE.Vector3>();
  private readonly damageStates = { wheels: false, crane: false, wheelhouse: false };
  private readonly dustColumn = new THREE.Group();
  private readonly derricks: THREE.Group[] = [];
  private readonly wreckPosition = new THREE.Vector3();
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
    this.group.name = 'LandYacht';
    this.body.name = 'LandYacht.Body';
    for (const id of COMPONENT_IDS) {
      const component = fallbackComponent(id);
      this.components.set(id, component);
      this.body.add(component);
    }
    this.group.add(this.body);

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
    this.group.add(this.dustColumn);
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
      modelState: this.modelState,
      modelMounted: this.modelState === 'ready' && this.body.visible,
      damageStates: { ...this.damageStates },
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
    for (const id of COMPONENT_IDS) this.damageStates[id] = false;
    this.releaseModel(performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off');
    this.bodyOffsets.clear();
    this.body.rotation.set(0, 0, 0);
    this.hidePresentation();
  }

  dispose(): void {
    this.releaseModel('disposed');
    disposeObject3D(this.group);
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
    this.callout(crane.position, 'HEAD STOLEN: ESCORT FUNDED');
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
    this.body.visible = components.size > 0 || this.wreckRemains;
    if (this.body.visible) this.ensureModel();
    const anchor = components.values().next().value as ClaimJumperEnemy | undefined;
    if (this.wreckRemains) {
      // The persistence API supplies this position, but no heading. Use the same
      // authored wreck pose on defeat and restore rather than inventing saved state.
      this.body.position.copy(this.wreckPosition);
      this.body.rotation.y = 0;
    } else if (anchor) {
      // The authored prow points along -X. Retain local component offsets so an
      // early crane/house death cannot drag the moving hull toward its old grave.
      this.body.rotation.y = -Math.PI / 2 - anchor.group.rotation.y;
      const axis = new THREE.Vector3(0, 1, 0);
      if (this.bodyOffsets.size === 0) {
        const center = new THREE.Vector3();
        for (const enemy of components.values()) center.add(enemy.position);
        center.multiplyScalar(1 / components.size);
        for (const [id, enemy] of components) this.bodyOffsets.set(id, enemy.position.clone().sub(center).applyAxisAngle(axis, -this.body.rotation.y));
      }
      this.body.position.set(0, 0, 0);
      for (const [id, enemy] of components) {
        const offset = this.bodyOffsets.get(id)?.clone().applyAxisAngle(axis, this.body.rotation.y) ?? new THREE.Vector3();
        this.body.position.add(enemy.position).sub(offset);
      }
      this.body.position.multiplyScalar(1 / components.size);
    }
    this.body.position.y = Terrain.visualY(this.body.position.x, this.body.position.z, 0);
    for (const id of COMPONENT_IDS) {
      const enemy = components.get(id);
      const damaged = this.wreckRemains || this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= 0.5);
      this.damageStates[id] = damaged;
      const fallback = this.components.get(id)!;
      fallback.visible = this.modelState !== 'ready';
      fallback.scale.y = damaged && id === 'wheels' ? 0.7 : 1;
      fallback.rotation.z = damaged && id !== 'wheels' ? -0.18 : 0;
      const mesh = this.modelMeshes.get(id);
      if (mesh?.morphTargetInfluences) mesh.morphTargetInfluences[0] = damaged ? 1 : 0;
    }
    for (let index = 0; index < this.derricks.length; index += 1) {
      const marker = this.derricks[index]!;
      marker.visible = this.act === 1 && index >= this.stolenHeads;
      marker.position.y = Terrain.visualY(marker.position.x, marker.position.z, 0);
    }
  }

  private placeWreck(position: THREE.Vector3): void {
    this.wreckPosition.copy(position);
    this.syncPresentation(this.liveComponents());
  }

  private hidePresentation(): void {
    this.body.visible = false;
    for (const derrick of this.derricks) derrick.visible = false;
    this.dustColumn.visible = false;
  }

  private ensureModel(): void {
    if (performanceTierDiagnostics().tier === 'lite' && this.modelState !== 'lite') this.releaseModel('lite');
    if (this.modelState !== 'off') return;
    const serial = ++this.modelSerial;
    this.modelState = 'loading';
    void import('../assets/AssetLoading').then(({ createGltfLoader }) => {
      if (serial !== this.modelSerial) return;
      if (performanceTierDiagnostics().tier === 'lite') { this.releaseModel('lite'); return; }
      createGltfLoader().load(MODEL_URL, ({ scene }) => {
        if (serial !== this.modelSerial) { disposeObject3D(scene); return; }
        if (performanceTierDiagnostics().tier === 'lite') {
          disposeObject3D(scene); this.releaseModel('lite'); this.syncPresentation(this.liveComponents()); return;
        }
        const meshes = new Map<LandYachtComponentId, THREE.Mesh>();
        scene.traverse(node => {
          const mesh = node as THREE.Mesh;
          if (!mesh.isMesh) return;
          for (const id of COMPONENT_IDS) if (mesh.name === id && mesh.morphTargetDictionary?.[DAMAGE_MORPHS[id]] === 0 && mesh.morphTargetInfluences?.length === 1) meshes.set(id, mesh);
          mesh.castShadow = mesh.receiveShadow = true;
        });
        if (meshes.size !== COMPONENT_IDS.length) {
          disposeObject3D(scene); this.modelState = 'failed'; return;
        }
        this.model = scene;
        for (const [id, mesh] of meshes) this.modelMeshes.set(id, mesh);
        this.body.add(scene);
        this.modelState = 'ready';
        this.syncPresentation(this.liveComponents());
      }, undefined, () => { if (serial === this.modelSerial) this.modelState = 'failed'; });
    }, () => { if (serial === this.modelSerial) this.modelState = 'failed'; });
  }

  private releaseModel(state: ModelState): void {
    this.modelSerial++;
    if (this.model) { this.body.remove(this.model); disposeObject3D(this.model); this.model = undefined; }
    this.modelMeshes.clear();
    this.modelState = state;
  }
}

// Small geometry fallback for loading, failed assets and LITE; concept-sheet paper never enters the world.
function fallbackComponent(id: LandYachtComponentId): THREE.Group {
  const group = new THREE.Group();
  group.name = `LandYacht.${id}.Fallback`;
  const brass = new THREE.MeshStandardMaterial({ color: '#a47b3c', roughness: 0.9 });
  const add = (geometry: THREE.BufferGeometry, x: number, y: number, z: number): THREE.Mesh => {
    const mesh = new THREE.Mesh(geometry, brass);
    mesh.position.set(-x, y, z); mesh.castShadow = mesh.receiveShadow = true; group.add(mesh); return mesh;
  };
  if (id === 'wheels') {
    add(new THREE.BoxGeometry(8, 1, 3.3), 0, 1.7, 0);
    for (const x of [-2.8, 0, 2.8]) for (const z of [-1.8, 1.8]) add(new THREE.CylinderGeometry(1, 1, 0.45, 12), x, 1, z).rotation.x = Math.PI / 2;
  } else if (id === 'crane') {
    add(new THREE.BoxGeometry(0.5, 3.5, 0.6), 1, 3.6, 0).rotation.z = 0.35;
    add(new THREE.BoxGeometry(3, 0.35, 0.5), 2, 5, 0).rotation.z = 0.35;
    add(new THREE.CylinderGeometry(0.12, 0.12, 2, 6), 3.3, 3.5, 0);
    add(new THREE.BoxGeometry(1, 0.45, 0.8), 3.3, 2.5, 0);
  } else {
    brass.color.set('#4e8582');
    add(new THREE.CylinderGeometry(1.2, 1.2, 2.8, 12), -2, 3.6, 0);
    add(new THREE.ConeGeometry(1.4, 0.6, 12), -2, 5.3, 0);
  }
  return group;
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
