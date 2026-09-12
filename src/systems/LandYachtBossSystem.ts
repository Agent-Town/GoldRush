import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { activeContract } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';
import type { BuildingTarget } from './TargetingSystem';
import * as Terrain from '../world/Terrain';

const VARIANT = 'land_yacht';
const COMPONENT_IDS = ['wheels', 'crane', 'wheelhouse'] as const;
type LandYachtComponentId = typeof COMPONENT_IDS[number];
type ModelState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';
const MODEL_URL = new URL('../../assets/pilots/land-yacht-3d/land-yacht.glb', import.meta.url).href;
const MODEL_MORPHS = { wheels: 'Damage_BeachedWheels', crane: 'Damage_SlackCrane', wheelhouse: 'Damage_CrackedWheelhouse' } as const;
const MODEL_SCALE = 1.4;
const MODEL_SHIFT = { x: 1.25, z: .15 };
const MODEL_TILT_PIVOT_Y = 1.1;

const intactUrl = new URL('../../assets/raw/boss-land-yacht.png', import.meta.url).href;
const damagedUrl = new URL('../../assets/raw/boss-land-yacht-damage.png', import.meta.url).href;
const PLATE = { width: 1672, height: 941 } as const;
const CROPS: Record<LandYachtComponentId, { x: number; y: number; width: number; height: number; scale: [number, number] }> = {
  wheels: { x: 430, y: 500, width: 970, height: 390, scale: [7.2, 2.9] },
  crane: { x: 360, y: 70, width: 500, height: 470, scale: [4.1, 3.8] },
  wheelhouse: { x: 760, y: 90, width: 560, height: 470, scale: [4.4, 3.7] },
};

export type LandYachtBossSuspendSnapshot = Readonly<{
  seenBoss: boolean;
  act: 0 | 1 | 2 | 3;
  dreadEvents: number;
  dreadRemaining: number;
  orbitDistance: number;
  hasCenter: boolean;
  lastCenter: { x: number; y: number; z: number };
  orbitRouteInstalled: boolean;
  formationAligned: boolean;
  nextLootIn: number | null;
  stolenHeads: number;
  escortsFunded: number;
  beached: boolean;
  nextCraneGrabIn: number | null;
  turretsGrabbed: number;
  bellTaken: boolean;
  gangDeparted: boolean;
  salvageReady: boolean;
  wreckRemains: boolean;
  wreckPosition: { x: number; y: number; z: number };
  destroyed: Array<{ id: LandYachtComponentId; position: { x: number; y: number; z: number } | null }>;
}>;

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
  modelState: ModelState;
  modelMounted: boolean;
  formationAligned: boolean;
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
  private formationAligned = false;
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
  private modelState: ModelState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
  private modelLoadSerial = 0;
  private model?: THREE.Object3D;
  private readonly modelMeshes = new Map<LandYachtComponentId, THREE.Mesh>();
  private readonly modelHulls = new Map<LandYachtComponentId, readonly [THREE.Vector3[], THREE.Vector3[]]>();
  private readonly modelSupports: [THREE.Vector3[], THREE.Vector3[]] = [[], []];
  private readonly modelTargets = new Map<LandYachtComponentId, THREE.Vector3>(COMPONENT_IDS.map(id => [id, new THREE.Vector3()]));
  private readonly modelBoundsBox = new THREE.Box3();
  private readonly modelBarPoints: THREE.Vector3[] = [];
  private readonly modelPoint = new THREE.Vector3();
  private readonly modelUp = new THREE.Vector3(0, 1, 0);
  private readonly modelNormal = new THREE.Vector3();
  private readonly modelTilt = new THREE.Quaternion();

  constructor(
    private readonly enemies: () => readonly ClaimJumperEnemy[],
    private readonly orbitRoute: () => OrbitRoute | null,
    private readonly spawnEscort: (position: THREE.Vector3) => boolean,
    private readonly findCraneTarget: (position: THREE.Vector3, radius: number) => BuildingTarget | null,
    private readonly damageBuilding: (target: BuildingTarget, amount: number) => boolean,
    private readonly callout: (position: THREE.Vector3, text: string) => void,
    private readonly renderPosition: (enemy: ClaimJumperEnemy) => THREE.Vector3 = enemy => enemy.position,
  ) {
    this.group.name = 'LandYacht';
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
      modelState: this.modelState,
      modelMounted: Boolean(this.model?.visible),
      formationAligned: this.formationAligned,
    };
  }

  captureSuspend(at = this.lastAt): LandYachtBossSuspendSnapshot | null {
    if (!this.seenBoss && this.dreadEvents === 0) return null;
    const point = (p: THREE.Vector3) => ({ x: p.x, y: p.y, z: p.z });
    const remaining = (deadline: number) => Number.isFinite(deadline) ? Math.max(0, deadline - at) : null;
    return {
      seenBoss: this.seenBoss, act: this.act,
      dreadEvents: this.dreadEvents, dreadRemaining: Math.max(0, this.dreadUntil - at),
      orbitDistance: this.orbitDistance, hasCenter: this.hasCenter, lastCenter: point(this.lastCenter),
      orbitRouteInstalled: this.orbitRouteInstalled, formationAligned: this.formationAligned, nextLootIn: remaining(this.nextLootAt),
      stolenHeads: this.stolenHeads, escortsFunded: this.escortsFunded, beached: this.beached,
      nextCraneGrabIn: remaining(this.nextCraneGrabAt), turretsGrabbed: this.turretsGrabbed,
      bellTaken: this.bellTaken, gangDeparted: this.gangDeparted,
      salvageReady: this.salvageReady, wreckRemains: this.wreckRemains,
      wreckPosition: point(this.wreck.position),
      destroyed: COMPONENT_IDS.filter((id) => this.destroyed.has(id)).map((id) => {
        const position = this.destroyedPositions.get(id);
        return { id, position: position ? point(position) : null };
      }),
    };
  }

  restoreSuspend(snapshot: LandYachtBossSuspendSnapshot | null, at: number): void {
    this.reset();
    if (!snapshot) return;
    this.lastAt = at;
    this.seenBoss = snapshot.seenBoss;
    this.act = snapshot.act;
    this.dreadEvents = snapshot.dreadEvents;
    this.dreadUntil = at + snapshot.dreadRemaining;
    this.orbitDistance = snapshot.orbitDistance;
    this.hasCenter = snapshot.hasCenter;
    this.lastCenter.set(snapshot.lastCenter.x, snapshot.lastCenter.y, snapshot.lastCenter.z);
    this.orbitRouteInstalled = snapshot.orbitRouteInstalled;
    this.formationAligned = snapshot.formationAligned;
    this.nextLootAt = snapshot.nextLootIn === null ? Number.POSITIVE_INFINITY : at + snapshot.nextLootIn;
    this.stolenHeads = snapshot.stolenHeads;
    this.escortsFunded = snapshot.escortsFunded;
    this.beached = snapshot.beached;
    this.nextCraneGrabAt = snapshot.nextCraneGrabIn === null ? Number.POSITIVE_INFINITY : at + snapshot.nextCraneGrabIn;
    this.turretsGrabbed = snapshot.turretsGrabbed;
    this.bellTaken = snapshot.bellTaken;
    this.gangDeparted = snapshot.gangDeparted;
    this.salvageReady = snapshot.salvageReady;
    this.wreckRemains = snapshot.wreckRemains;
    this.wreck.position.set(snapshot.wreckPosition.x, snapshot.wreckPosition.y, snapshot.wreckPosition.z);
    for (const entry of snapshot.destroyed) {
      this.destroyed.add(entry.id);
      if (entry.position) this.destroyedPositions.set(entry.id, new THREE.Vector3(entry.position.x, entry.position.y, entry.position.z));
    }
    // EnemyPool restores the actual routes before this system. Keep their exact
    // targets and progress, including the zero-speed routes of a beached boss.
    this.syncPresentation(this.liveComponents());
    this.dustColumn.visible = !this.seenBoss && at < this.dreadUntil;
  }

  reset(): void {
    this.disposeModel(performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off');
    this.lastAt = 0;
    this.seenBoss = false;
    this.act = 0;
    this.dreadEvents = 0;
    this.dreadUntil = 0;
    this.orbitDistance = 0;
    this.hasCenter = false;
    this.lastCenter.set(0, 0, 0);
    this.wreck.position.set(0, 0, 0);
    this.orbitRouteInstalled = false;
    this.formationAligned = false;
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
    this.disposeModel('disposed');
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

  private ensureModel(): void {
    if (this.modelState !== 'off') return;
    const serial = ++this.modelLoadSerial;
    this.modelState = 'loading';
    this.publishModel();
    const failed = () => {
      if (serial !== this.modelLoadSerial) return;
      this.modelState = 'failed';
      this.publishModel();
    };
    void import('../assets/AssetLoading').then(({ createGltfLoader }) => {
      if (serial !== this.modelLoadSerial) return;
      createGltfLoader().load(MODEL_URL, ({ scene }) => {
        if (serial !== this.modelLoadSerial) { disposeObject3D(scene); return; }
        try {
          const meshes = this.inspectModel(scene);
          if (!meshes) { disposeObject3D(scene); failed(); return; }
          this.model = scene;
          this.model.name = 'LandYacht3d';
          this.model.visible = false;
          for (const [id, mesh] of meshes) this.modelMeshes.set(id, mesh);
          this.group.add(scene);
          this.modelState = 'ready';
          this.publishModel();
        } catch {
          disposeObject3D(scene);
          this.modelHulls.clear();
          this.modelSupports[0].length = this.modelSupports[1].length = 0;
          failed();
        }
      }, undefined, failed);
    }).catch(failed);
  }

  private inspectModel(model: THREE.Object3D): Map<LandYachtComponentId, THREE.Mesh> | null {
    const meshes = new Map<LandYachtComponentId, THREE.Mesh>();
    const materials = new Set<THREE.MeshStandardMaterial>();
    let meshCount = 0, triangles = 0, invalid = false;
    model.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      meshCount++;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (!material.isMeshStandardMaterial || !material.map || Array.isArray(mesh.material)) { invalid = true; return; }
      materials.add(material);
      triangles += (mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position')?.count ?? 0) / 3;
      const id = mesh.name as LandYachtComponentId;
      if (!COMPONENT_IDS.includes(id) || meshes.has(id) || mesh.morphTargetDictionary?.[MODEL_MORPHS[id]] !== 0 || mesh.morphTargetInfluences?.length !== 1) { invalid = true; return; }
      meshes.set(id, mesh);
      mesh.castShadow = mesh.receiveShadow = true;
    });
    if (invalid || meshCount !== 3 || meshes.size !== 3 || materials.size !== 1 || triangles !== 9613) return null;
    model.updateWorldMatrix(true, true);
    const inverse = model.matrixWorld.clone().invert(), transform = new THREE.Matrix4(), point = new THREE.Vector3();
    const hulls = new Map<LandYachtComponentId, [THREE.Vector3[], THREE.Vector3[]]>();
    const supports: [THREE.Vector3[], THREE.Vector3[]] = [[], []];
    for (const [id, mesh] of meshes) {
      transform.multiplyMatrices(inverse, mesh.matrixWorld);
      const states: [THREE.Vector3[], THREE.Vector3[]] = [[], []];
      for (const damaged of [0, 1] as const) {
        const points: THREE.Vector3[] = [], support = new Map<string, THREE.Vector3>();
        mesh.morphTargetInfluences![0] = damaged;
        for (let vertex = 0; vertex < mesh.geometry.getAttribute('position').count; vertex++) {
          mesh.getVertexPosition(vertex, point).applyMatrix4(transform);
          if (![point.x, point.y, point.z].every(Number.isFinite)) return null;
          points.push(point.clone());
          if (id === 'wheels' && point.y < .08) support.set(`${point.x.toFixed(4)}:${point.y.toFixed(4)}:${point.z.toFixed(4)}`, point.clone());
        }
        const bounds = new THREE.Box3().setFromPoints(points);
        if (bounds.min.x >= bounds.max.x || bounds.min.y >= bounds.max.y || bounds.min.z >= bounds.max.z) return null;
        const hull = new ConvexHull().setFromPoints(points);
        if (hull.faces.length === 0) return null;
        states[damaged] = [...new Set(hull.faces.flatMap(face => [0, 1, 2].map(edge => face.getEdge(edge).vertex.point)))];
        if (id === 'wheels') supports[damaged] = [...support.values()];
      }
      mesh.morphTargetInfluences![0] = 0;
      hulls.set(id, states);
    }
    if (supports.some(points => points.length === 0)) return null;
    for (const [id, mesh] of meshes) {
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.emissiveMap = material.map;
      material.emissive.set('#ffffff');
      material.emissiveIntensity = 1;
      mesh.material = material;
      this.modelHulls.set(id, hulls.get(id)!);
    }
    for (const state of [0, 1] as const) this.modelSupports[state].splice(0, this.modelSupports[state].length, ...supports[state]);
    for (const material of materials) material.dispose();
    return meshes;
  }

  private disposeModel(next: ModelState): void {
    this.modelLoadSerial++;
    if (this.model) { this.group.remove(this.model); disposeObject3D(this.model); this.model = undefined; }
    this.modelMeshes.clear();
    this.modelHulls.clear();
    this.modelSupports[0].length = this.modelSupports[1].length = 0;
    this.modelBoundsBox.makeEmpty();
    this.modelBarPoints.length = 0;
    this.modelState = next;
    this.publishModel();
  }

  private publishModel(): void {
    if (typeof document === 'undefined') return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.dataset.landYacht3dState = this.modelState;
    canvas.dataset.landYacht3dMounted = String(Boolean(this.model?.visible));
  }

  modelBounds(groupId: string): { bounds: THREE.Box3; points: readonly THREE.Vector3[] } | null {
    if (!this.seenBoss || this.wreckRemains) return null;
    const components = this.liveComponents();
    if (![...components.values()].some(enemy => enemy.bossGroupId === groupId)) return null;
    // EnemyPool invokes this after storing every interpolated actor position,
    // before placing the shared bar. Only presentation transforms change here.
    this.syncPresentation(components, true);
    return this.model?.visible ? { bounds: this.modelBoundsBox, points: this.modelBarPoints } : null;
  }

  syncWreckPresentation(): void {
    if (this.wreckRemains) this.syncPresentation(this.liveComponents(), true);
  }

  private syncModel(components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>, interpolated: boolean): boolean {
    const model = this.model;
    if (!model) return false;
    model.visible = false;
    this.modelBoundsBox.makeEmpty();
    if (this.modelState !== 'ready' || !this.formationAligned) { this.publishModel(); return false; }
    const route = this.orbitRoute(), baron = activeContract().twist.baron;
    if (!route || route.radius <= 0 || baron?.variantId !== VARIANT) { this.publishModel(); return false; }
    const authored = baron.components ?? [];
    const offset = (id: LandYachtComponentId) => authored.find(part => part.id === id)?.xOffset;
    const anchorId = COMPONENT_IDS.find(id => components.has(id)) ?? COMPONENT_IDS.find(id => this.destroyedPositions.has(id));
    if (!anchorId) { this.publishModel(); return false; }
    const anchor = components.get(anchorId), anchorOffset = offset(anchorId);
    const position = anchor ? (interpolated ? this.renderPosition(anchor) : anchor.position) : this.destroyedPositions.get(anchorId)!;
    if (anchorOffset === undefined) { this.publishModel(); return false; }
    for (const id of COMPONENT_IDS) {
      const along = offset(id);
      if (along === undefined) { this.publishModel(); return false; }
      const phase = (anchorOffset - along) / route.radius, cos = Math.cos(phase), sin = Math.sin(phase);
      const x = position.x - route.center.x, z = position.z - route.center.z;
      const expected = this.modelTargets.get(id)!;
      expected.set(route.center.x + x * cos - z * sin, 0, route.center.z + x * sin + z * cos);
      const enemy = components.get(id);
      if (enemy) {
        const actual = interpolated ? this.renderPosition(enemy) : enemy.position;
        if (Math.hypot(actual.x - expected.x, actual.z - expected.z) > .08) { this.publishModel(); return false; }
      }
    }
    const wheels = this.modelTargets.get('wheels')!, house = this.modelTargets.get('wheelhouse')!;
    const yaw = Math.atan2(-(house.z - wheels.z), house.x - wheels.x), cos = Math.cos(yaw), sin = Math.sin(yaw);
    model.position.set((wheels.x + house.x) / 2 + cos * MODEL_SHIFT.x + sin * MODEL_SHIFT.z, 0,
      (wheels.z + house.z) / 2 - sin * MODEL_SHIFT.x + cos * MODEL_SHIFT.z);
    model.rotation.set(0, yaw, 0);
    model.scale.setScalar(MODEL_SCALE);
    for (const [id, mesh] of this.modelMeshes) {
      const enemy = components.get(id);
      const damaged = this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= .5);
      mesh.morphTargetInfluences![0] = damaged ? 1 : 0;
      // Keep damaged machinery attached to the rigid hull through salvage.
      mesh.visible = true;
    }
    this.groundModel(yaw);
    model.updateWorldMatrix(true, true);
    let count = 0;
    for (const [id, mesh] of this.modelMeshes) {
      const damaged = mesh.morphTargetInfluences![0] === 1 ? 1 : 0;
      for (const point of this.modelHulls.get(id)![damaged]) {
        const world = this.modelBarPoints[count] ?? (this.modelBarPoints[count] = new THREE.Vector3());
        world.copy(point).applyMatrix4(model.matrixWorld);
        this.modelBoundsBox.expandByPoint(world);
        count++;
      }
    }
    this.modelBarPoints.length = count;
    model.visible = true;
    this.publishModel();
    return true;
  }

  private groundModel(yaw: number): void {
    const model = this.model!, damaged = this.modelMeshes.get('wheels')!.morphTargetInfluences![0] === 1 ? 1 : 0;
    const supports = this.modelSupports[damaged];
    let halfX = 0, halfZ = 0;
    for (const point of supports) { halfX = Math.max(halfX, Math.abs(point.x) * MODEL_SCALE); halfZ = Math.max(halfZ, Math.abs(point.z) * MODEL_SCALE); }
    const cos = Math.cos(yaw), sin = Math.sin(yaw);
    const height = (x: number, z: number) => Terrain.visualY(model.position.x + cos * x + sin * z, model.position.z - sin * x + cos * z, 0);
    const h00 = height(-halfX, -halfZ), h10 = height(halfX, -halfZ), h01 = height(-halfX, halfZ), h11 = height(halfX, halfZ);
    const slopeX = (h10 + h11 - h00 - h01) / (4 * Math.max(.01, halfX));
    const slopeZ = (h01 + h11 - h00 - h10) / (4 * Math.max(.01, halfZ));
    this.modelNormal.set(-slopeX, 1, -slopeZ).normalize();
    this.modelTilt.setFromUnitVectors(this.modelUp, this.modelNormal);
    model.quaternion.multiply(this.modelTilt);
    this.modelPoint.copy(this.modelUp).applyQuaternion(model.quaternion);
    model.position.x -= this.modelPoint.x * MODEL_SCALE * MODEL_TILT_PIVOT_Y;
    model.position.z -= this.modelPoint.z * MODEL_SCALE * MODEL_TILT_PIVOT_Y;
    model.updateWorldMatrix(true, true);
    let lift = -Infinity;
    for (const point of supports) {
      this.modelPoint.copy(point).applyMatrix4(model.matrixWorld);
      lift = Math.max(lift, Terrain.visualY(this.modelPoint.x, this.modelPoint.z, 0) - this.modelPoint.y);
    }
    model.position.y = lift + .025;
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
    const actors = [...components.values()];
    // Preserve serialized orbit progress, including old saves. Presentation must
    // separately reject a legacy overlapping formation rather than teleport it.
    const hasSavedOrbit = actors.every((enemy) => enemy.captureSuspend().scriptedRoute.length === 25);
    if (!hasSavedOrbit) {
      const wheels = components.get('wheels');
      if (wheels && components.size === COMPONENT_IDS.length) {
        const origin = wheels.position.clone();
        const angle = Math.atan2(origin.z - route.center.z, origin.x - route.center.x);
        const offsets = actors.map((enemy) => Math.hypot(enemy.position.x - origin.x, enemy.position.z - origin.z));
        for (let index = 0; index < actors.length; index += 1) {
          const theta = angle - offsets[index]! / route.radius;
          const position = actors[index]!.position;
          position.x = route.center.x + Math.cos(theta) * route.radius;
          position.z = route.center.z + Math.sin(theta) * route.radius;
        }
        this.formationAligned = true;
      }
    }
    for (const enemy of hasSavedOrbit ? [] : actors) {
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

  private syncPresentation(components: ReadonlyMap<LandYachtComponentId, ClaimJumperEnemy>, interpolated = false): void {
    if (components.size > 0 || this.wreckRemains) this.ensureModel();
    const mounted = this.syncModel(components, interpolated);
    this.dustColumn.visible = false;
    for (const [id, pair] of this.componentSprites) {
      const enemy = components.get(id);
      const damaged = Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= 0.5);
      pair.healthy.visible = !mounted && Boolean(enemy) && !damaged;
      pair.damaged.visible = !mounted && Boolean(enemy) && damaged;
      if (!enemy) continue;
      const position = interpolated ? this.renderPosition(enemy) : enemy.position;
      for (const visual of [pair.healthy, pair.damaged]) {
        visual.position.set(position.x, Terrain.visualY(position.x, position.z, CROPS[id].scale[1] * 0.48), position.z);
      }
    }
    for (let index = 0; index < this.derricks.length; index += 1) {
      const marker = this.derricks[index]!;
      marker.visible = this.act === 1 && index >= this.stolenHeads;
      marker.position.y = Terrain.visualY(marker.position.x, marker.position.z, 0);
    }
    this.wreck.visible = !mounted && this.wreckRemains;
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
