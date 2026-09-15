import * as THREE from 'three';
import { ConvexHull } from 'three/examples/jsm/math/ConvexHull.js';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { activeContract } from '../meta/ContractFamilies';
import { disposeObject3D } from '../utils/dispose';
import * as Terrain from '../world/Terrain';
import type { PowerGraphCommand, PowerNodeSnapshot } from './PowerGraph';

const CRAWLER_VARIANT = 'dynamo_crawler';
const COMPONENT_IDS = ['drain_mast', 'tracks', 'capacitor_bank'] as const;
type CrawlerComponentId = typeof COMPONENT_IDS[number];
const CRAWLER_3D_URL = new URL('../../assets/pilots/crawler-3d/crawler.glb', import.meta.url).href;
const CRAWLER_3D_TRIANGLES = 11_760;
const CRAWLER_3D_SCALE = 3.1;
const CRAWLER_3D_LONGITUDINAL_SHIFT = -0.45;
const CRAWLER_3D_TILT_PIVOT_Y = 1.1;
const CRAWLER_3D_FILL = new THREE.Color('#ffffff');
const CRAWLER_DAMAGE_THRESHOLD = 0.5;
const CRAWLER_3D_COMPONENTS = {
  drain_mast: { mesh: 'drain_mast', morph: 'Damage_ToppledDrainMast', damageColor: '#62d7cd' },
  tracks: { mesh: 'tracks', morph: 'Damage_ShatteredTracks', damageColor: '#d29a48' },
  capacitor_bank: { mesh: 'capacitor_bank', morph: 'Damage_RupturedCapacitorBank', damageColor: '#f2a43b' },
} as const;
type Crawler3dState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';

export type CrawlerBossDiagnostics = {
  active: boolean;
  act: 0 | 1 | 2 | 3;
  flickerEvents: number;
  flickerActive: boolean;
  drainActive: boolean;
  drainWatts: number;
  drainTarget: string | null;
  dialVisible: boolean;
  dialProgress: number;
  bursts: number;
  tracksPinned: boolean;
  overchargeActive: boolean;
  overchargeRemaining: number;
  turretFireRateMult: number;
  wreckRemains: boolean;
  destroyed: CrawlerComponentId[];
  crawler3dState: Crawler3dState;
};

export type CrawlerBossSuspendSnapshot = Readonly<{
  seenBoss: boolean;
  act: 0 | 1 | 2 | 3;
  flickerEvents: number;
  flickerRemaining: number;
  drainActive: boolean;
  drainTarget: string | null;
  drainNodeId: string | null;
  nextBurstIn: number | null;
  bursts: number;
  tracksPinned: boolean;
  overchargeRemaining: number;
  wreckRemains: boolean;
  wreckPosition: { x: number; y: number; z: number };
  destroyed: Array<{ id: CrawlerComponentId; position: { x: number; y: number; z: number } | null }>;
}>;

export class CrawlerBossSystem {
  readonly group = new THREE.Group();
  private readonly componentMeshes = new Map<CrawlerComponentId, THREE.Group>();
  private readonly wreck = new THREE.Group();
  private readonly beam = new THREE.Group();
  private readonly beamTeal = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1, 8), new THREE.MeshBasicMaterial({ color: '#62d7cd' }));
  private readonly beamAmber = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1, 8), new THREE.MeshBasicMaterial({ color: '#f2a43b' }));
  private readonly dial = new THREE.Group();
  private readonly dialPointer = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.72), new THREE.MeshBasicMaterial({ color: '#fff8e8', transparent: true }));
  private seenBoss = false;
  private act: 0 | 1 | 2 | 3 = 0;
  private flickerEvents = 0;
  private flickerUntil = 0;
  private drainActive = false;
  private drainTarget: string | null = null;
  private drainNodeId: string | null = null;
  private nextBurstAt = Number.POSITIVE_INFINITY;
  private bursts = 0;
  private tracksPinned = false;
  private overchargeUntil = 0;
  private wreckRemains = false;
  private lastAt = 0;
  private readonly destroyed = new Set<CrawlerComponentId>();
  private readonly destroyedPositions = new Map<CrawlerComponentId, THREE.Vector3>();
  private crawler3dState: Crawler3dState;
  private crawler3dLoadSerial = 0;
  private crawler3dModel?: THREE.Object3D;
  private crawler3dGroupId: string | null = null;
  private readonly crawler3dMeshes = new Map<CrawlerComponentId, THREE.Mesh>();
  private readonly crawler3dOffsets = new Map<CrawlerComponentId, THREE.Vector3>();
  private readonly crawler3dCenter = new THREE.Vector3();
  private readonly crawler3dCollectorAnchor = new THREE.Vector3();
  private readonly crawler3dDamagedCollectorAnchor = new THREE.Vector3();
  private readonly crawler3dLocalBounds = new Map<CrawlerComponentId, readonly [THREE.Box3, THREE.Box3]>();
  private readonly crawler3dHullPoints = new Map<CrawlerComponentId, readonly [THREE.Vector3[], THREE.Vector3[]]>();
  private readonly crawler3dBarPoints: THREE.Vector3[] = [];
  private readonly crawler3dComponentBounds = new Map<CrawlerComponentId, THREE.Box3>();
  private readonly crawler3dBounds = new THREE.Box3();
  private readonly crawler3dPoint = new THREE.Vector3();
  private readonly crawler3dSupportPoints: THREE.Vector3[] = [];
  private readonly crawler3dSupportHalfSize = new THREE.Vector2();
  private readonly crawler3dUp = new THREE.Vector3(0, 1, 0);
  private readonly crawler3dNormal = new THREE.Vector3();
  private readonly crawler3dTilt = new THREE.Quaternion();
  private crawler3dYaw = 0;

  constructor(
    private readonly enemies: () => readonly ClaimJumperEnemy[],
    private readonly powerNodes: () => readonly PowerNodeSnapshot[],
    private readonly queuePower: (command: PowerGraphCommand) => boolean,
    private readonly launchBurst: (origin: THREE.Vector3, target: THREE.Vector3, damage: number, radius: number) => boolean,
  ) {
    this.crawler3dState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
    this.group.name = 'RivalDynamoCrawler.Placeholder';
    const mast = new THREE.Group();
    mast.add(box(2.2, 0.6, 1.8, '#3f706e', 0, 0.3, 0), cylinder(0.38, 3.8, '#62d7cd', 0, 2.2, 0), box(2.7, 0.22, 0.28, '#d29a48', 0, 3.5, 0));
    const tracks = new THREE.Group();
    tracks.add(box(3.8, 0.75, 2.35, '#51452f', 0, 0.8, 0));
    for (const x of [-1.35, -0.45, 0.45, 1.35]) tracks.add(cylinder(0.38, 0.5, '#b08743', x, 0.38, -0.92).rotateX(Math.PI / 2), cylinder(0.38, 0.5, '#b08743', x, 0.38, 0.92).rotateX(Math.PI / 2));
    const capacitor = new THREE.Group();
    capacitor.add(box(3.2, 0.55, 2.1, '#694b2f', 0, 0.45, 0));
    for (const x of [-1, 0, 1]) capacitor.add(cylinder(0.42, 2.25, '#d89a3d', x, 1.45, 0));
    for (const [id, component] of [['drain_mast', mast], ['tracks', tracks], ['capacitor_bank', capacitor]] as const) {
      component.name = `Crawler.${id}`;
      this.componentMeshes.set(id, component);
      this.group.add(component);
    }
    this.wreck.add(box(5.8, 0.8, 2.7, '#6b4a32', 0, 0.5, 0));
    for (const x of [-1.8, -0.6, 0.6, 1.8]) this.wreck.add(cylinder(0.42, 0.45, '#352d24', x, 0.42, -1).rotateX(Math.PI / 2), cylinder(0.42, 0.45, '#352d24', x, 0.42, 1).rotateX(Math.PI / 2));
    const roost = cylinder(0.38, 2.8, '#5fa9a4', -1.4, 1.7, 0);
    roost.rotation.z = -0.55;
    this.wreck.add(roost, cylinder(0.45, 1.55, '#b56f36', 0.9, 1.15, 0), cylinder(0.45, 1.25, '#b56f36', 1.85, 1, 0));
    this.wreck.name = 'CrawlerWreck.Roost';
    this.beam.name = 'CrawlerDrainBeam.TealToAmber';
    this.beam.add(this.beamTeal, this.beamAmber);
    const dialRing = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.12, 8, 32), new THREE.MeshBasicMaterial({ color: '#ffd95a', transparent: true, depthWrite: false }));
    dialRing.rotation.x = Math.PI / 2;
    this.dialPointer.position.y = 0.05;
    this.dial.add(dialRing, this.dialPointer);
    this.group.add(this.beam, this.dial, this.wreck);
    this.hideTransientPresentation();
    this.publishCrawler3d();
  }

  onWaveStarted(wave: number, bossWave: number, at: number): void {
    if (wave !== bossWave - 2 || this.flickerEvents > 0) return;
    this.flickerEvents = 1;
    this.flickerUntil = at + Balance.crawler.flickerSeconds;
  }

  onComponentKilled(id: string | undefined, position: THREE.Vector3, at: number): void {
    if (!COMPONENT_IDS.includes(id as CrawlerComponentId)) return;
    const componentId = id as CrawlerComponentId;
    this.destroyed.add(componentId);
    this.destroyedPositions.set(componentId, position.clone());
    this.advanceActs(at);
    if (typeof document !== 'undefined' && this.destroyed.size === COMPONENT_IDS.length) this.syncPresentation(at);
  }

  update(at: number): void {
    this.step(at);
    this.syncPresentation(at);
  }

  step(at: number): void {
    this.lastAt = at;
    const components = this.liveComponents();
    if (!this.seenBoss && components.size > 0) {
      this.seenBoss = true;
      this.act = 1;
      this.startDrain();
    }
    if (!this.seenBoss) return;
    for (const id of COMPONENT_IDS) {
      if (!components.has(id) && !this.destroyed.has(id)) this.destroyed.add(id);
    }
    this.advanceActs(at);
    if (this.act === 2 && components.has('capacitor_bank')) this.updateBurst(at, components.get('capacitor_bank')!);
    const mast = components.get('drain_mast');
    this.syncDrainTarget(mast ? this.nearestRelay(mast.position) : null);
  }

  syncPresentation(at: number): void {
    const components = this.liveComponents();
    if (!this.seenBoss) return;
    if (components.size > 0) this.ensureCrawler3d();
    this.updateCrawler3d(components);
    const modelMounted = this.crawler3dState === 'ready' && this.crawler3dGroupId !== null;
    for (const [id, mesh] of this.componentMeshes) {
      const enemy = components.get(id);
      mesh.visible = Boolean(enemy) && !modelMounted;
      if (!enemy) continue;
      mesh.position.copy(enemy.position);
      mesh.position.y = Terrain.visualY(enemy.position.x, enemy.position.z, 0);
    }
    const mast = components.get('drain_mast');
    const target = mast && this.drainTarget
      ? this.powerNodes().find((node) => node.id === this.drainTarget) ?? null
      : null;
    this.beam.visible = this.drainActive && Boolean(mast && target);
    if (mast && target) {
      const start = new THREE.Vector3(target.x, Terrain.visualY(target.x, target.z, 1.8), target.z);
      const end = new THREE.Vector3(mast.position.x, Terrain.visualY(mast.position.x, mast.position.z, 3.2), mast.position.z);
      const mastMesh = this.crawler3dMeshes.get('drain_mast');
      if (modelMounted && mastMesh) {
        end.copy(this.crawler3dCollectorAnchor).lerp(this.crawler3dDamagedCollectorAnchor, mastMesh.morphTargetInfluences?.[0] ?? 0);
        end.applyMatrix4(this.crawler3dModel!.matrixWorld);
      }
      const middle = start.clone().lerp(end, 0.5);
      this.placeBeamSegment(this.beamTeal, start, middle);
      this.placeBeamSegment(this.beamAmber, middle, end);
    }
    const capacitor = components.get('capacitor_bank');
    const dialVisible = this.act === 2 && Boolean(capacitor) && at >= this.nextBurstAt - Balance.crawler.burstDialSeconds;
    this.dial.visible = dialVisible;
    if (capacitor) {
      this.dial.position.set(capacitor.position.x, Terrain.visualY(capacitor.position.x, capacitor.position.z, 2.2), capacitor.position.z);
      const bounds = modelMounted && dialVisible ? this.crawler3dComponentBounds.get('capacitor_bank') : null;
      if (bounds) {
        bounds.getCenter(this.dial.position);
        this.dial.position.y = bounds.max.y + 0.3;
      }
      const progress = THREE.MathUtils.clamp(1 - (this.nextBurstAt - at) / Balance.crawler.burstDialSeconds, 0, 1);
      this.dial.scale.setScalar(0.75 + progress * 0.5);
      this.dialPointer.rotation.y = -Math.PI * 0.75 + progress * Math.PI * 1.5;
    }
    if (this.wreckRemains) {
      const position = this.destroyedPositions.get('capacitor_bank');
      if (position) {
        this.wreck.position.copy(position);
        this.wreck.position.y = Terrain.visualY(position.x, position.z, 0);
      }
    }
    this.wreck.visible = this.wreckRemains;
    this.publishCrawler3d(components);
    if (components.size === 0 && this.crawler3dState !== 'disposed') this.disposeCrawler3d('disposed');
  }

  get lampIntensityMult(): number {
    return this.lastAt < this.flickerUntil ? 0.08 : 1;
  }

  get turretFireRateMult(): number {
    return this.lastAt < this.overchargeUntil ? Balance.crawler.turretFireRateMult : 1;
  }

  get overchargeActive(): boolean {
    return this.lastAt < this.overchargeUntil;
  }

  modelBounds(groupId: string): { bounds: THREE.Box3; points: readonly THREE.Vector3[] } | null {
    return this.crawler3dState === 'ready' && this.crawler3dGroupId === groupId && this.crawler3dModel?.visible
      ? { bounds: this.crawler3dBounds, points: this.crawler3dBarPoints }
      : null;
  }

  restoreWreck(position: THREE.Vector3): void {
    if (this.wreckRemains) return;
    this.seenBoss = true;
    this.act = 3;
    this.drainActive = false;
    this.drainTarget = null;
    this.drainNodeId = null;
    this.tracksPinned = true;
    this.wreckRemains = true;
    for (const id of COMPONENT_IDS) this.destroyed.add(id);
    this.wreck.position.copy(position);
    this.wreck.position.y = Terrain.visualY(position.x, position.z, 0);
    this.wreck.visible = true;
  }

  diagnostics(): CrawlerBossDiagnostics {
    const dialProgress = this.act === 2
      ? THREE.MathUtils.clamp(1 - (this.nextBurstAt - this.lastAt) / Balance.crawler.burstDialSeconds, 0, 1)
      : 0;
    return {
      active: this.seenBoss,
      act: this.act,
      flickerEvents: this.flickerEvents,
      flickerActive: this.lastAt < this.flickerUntil,
      drainActive: this.drainActive,
      drainWatts: this.activeDrainNode()?.allocatedWatts ?? 0,
      drainTarget: this.drainTarget,
      dialVisible: this.act === 2 && this.lastAt >= this.nextBurstAt - Balance.crawler.burstDialSeconds,
      dialProgress,
      bursts: this.bursts,
      tracksPinned: this.tracksPinned,
      overchargeActive: this.lastAt < this.overchargeUntil,
      overchargeRemaining: Math.max(0, this.overchargeUntil - this.lastAt),
      turretFireRateMult: this.turretFireRateMult,
      wreckRemains: this.wreckRemains,
      destroyed: COMPONENT_IDS.filter((id) => this.destroyed.has(id)),
      crawler3dState: this.crawler3dState,
    };
  }

  captureSuspend(at = this.lastAt): CrawlerBossSuspendSnapshot {
    return {
      seenBoss: this.seenBoss,
      act: this.act,
      flickerEvents: this.flickerEvents,
      flickerRemaining: Math.max(0, this.flickerUntil - at),
      drainActive: this.drainActive,
      drainTarget: this.drainTarget,
      drainNodeId: this.drainNodeId,
      nextBurstIn: Number.isFinite(this.nextBurstAt) ? Math.max(0, this.nextBurstAt - at) : null,
      bursts: this.bursts,
      tracksPinned: this.tracksPinned,
      overchargeRemaining: Math.max(0, this.overchargeUntil - at),
      wreckRemains: this.wreckRemains,
      wreckPosition: { x: this.wreck.position.x, y: this.wreck.position.y, z: this.wreck.position.z },
      destroyed: COMPONENT_IDS.filter((id) => this.destroyed.has(id)).map((id) => {
        const position = this.destroyedPositions.get(id);
        return { id, position: position ? { x: position.x, y: position.y, z: position.z } : null };
      }),
    };
  }

  restoreSuspend(snapshot: CrawlerBossSuspendSnapshot | null, at: number): void {
    this.reset();
    if (!snapshot) return;
    this.lastAt = at;
    this.seenBoss = snapshot.seenBoss;
    this.act = snapshot.act;
    this.flickerEvents = snapshot.flickerEvents;
    this.flickerUntil = at + snapshot.flickerRemaining;
    this.drainActive = snapshot.drainActive;
    this.drainTarget = snapshot.drainTarget;
    this.drainNodeId = snapshot.drainNodeId;
    this.nextBurstAt = snapshot.nextBurstIn === null ? Number.POSITIVE_INFINITY : at + snapshot.nextBurstIn;
    this.bursts = snapshot.bursts;
    this.tracksPinned = snapshot.tracksPinned;
    this.overchargeUntil = at + snapshot.overchargeRemaining;
    this.wreckRemains = snapshot.wreckRemains;
    this.wreck.position.set(snapshot.wreckPosition.x, snapshot.wreckPosition.y, snapshot.wreckPosition.z);
    this.wreck.visible = snapshot.wreckRemains;
    for (const entry of snapshot.destroyed) {
      this.destroyed.add(entry.id);
      if (entry.position) this.destroyedPositions.set(entry.id, new THREE.Vector3(entry.position.x, entry.position.y, entry.position.z));
    }
    if (this.drainActive && this.drainNodeId) this.queuePower({ type: 'set-node-online', nodeId: this.drainNodeId, online: true });
    if (this.tracksPinned) this.pinTracks();
  }

  reset(): void {
    if (this.drainNodeId) this.queuePower({ type: 'set-node-online', nodeId: this.drainNodeId, online: false });
    this.disposeCrawler3d(performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off');
    this.seenBoss = false;
    this.act = 0;
    this.flickerEvents = 0;
    this.flickerUntil = 0;
    this.drainActive = false;
    this.drainTarget = null;
    this.drainNodeId = null;
    this.nextBurstAt = Number.POSITIVE_INFINITY;
    this.bursts = 0;
    this.tracksPinned = false;
    this.overchargeUntil = 0;
    this.wreckRemains = false;
    this.lastAt = 0;
    this.destroyed.clear();
    this.destroyedPositions.clear();
    this.hideTransientPresentation();
  }

  dispose(): void {
    this.disposeCrawler3d('disposed');
    this.group.traverse((child) => {
      if (!(child instanceof THREE.Mesh || child instanceof THREE.Line)) return;
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      for (const material of materials) material.dispose();
    });
  }

  private liveComponents(): Map<CrawlerComponentId, ClaimJumperEnemy> {
    const result = new Map<CrawlerComponentId, ClaimJumperEnemy>();
    for (const enemy of this.enemies()) {
      if (!enemy.isAlive || enemy.variantId !== CRAWLER_VARIANT) continue;
      const id = enemy.bossComponentId as CrawlerComponentId;
      if (COMPONENT_IDS.includes(id)) result.set(id, enemy);
    }
    return result;
  }

  private startDrain(): void {
    this.drainActive = true;
  }

  private stopDrain(at: number): void {
    this.drainActive = false;
    if (this.drainNodeId) this.queuePower({ type: 'set-node-online', nodeId: this.drainNodeId, online: false });
    this.drainNodeId = null;
    this.drainTarget = null;
    if (this.act >= 3) return;
    this.act = 2;
    this.nextBurstAt = at + Balance.crawler.burstIntervalSeconds;
  }

  private advanceActs(at: number): void {
    if (!this.destroyed.has('drain_mast')) return;
    if (this.act < 2) this.stopDrain(at);
    if (!this.destroyed.has('tracks')) return;
    if (!this.tracksPinned) this.pinTracks();
    if (!this.destroyed.has('capacitor_bank') || this.act >= 3) return;
    this.act = 3;
    this.stopDrain(at);
    this.overchargeUntil = at + Balance.crawler.overchargeSeconds;
    this.wreckRemains = true;
  }

  private pinTracks(): void {
    this.tracksPinned = true;
    for (const enemy of this.enemies()) {
      if (enemy.isAlive && enemy.variantId === CRAWLER_VARIANT) enemy.scriptMoveTo(enemy.position.x, enemy.position.z, 0, { ignoreTerrain: true });
    }
  }

  private updateBurst(at: number, capacitor: ClaimJumperEnemy): void {
    if (at < this.nextBurstAt) return;
    const position = capacitor.position.clone();
    if (this.launchBurst(position, position, Balance.crawler.burstDamage, Balance.crawler.burstRadius)) this.bursts += 1;
    this.nextBurstAt = at + Balance.crawler.burstIntervalSeconds;
  }

  private ensureCrawler3d(): void {
    if (this.crawler3dState === 'lite' || this.crawler3dState === 'loading' || this.crawler3dState === 'ready' || this.crawler3dState === 'failed') return;
    const serial = ++this.crawler3dLoadSerial;
    this.crawler3dState = 'loading';
    this.publishCrawler3d();
    void import('../assets/AssetLoading').then(({ createGltfLoader }) => {
      if (serial !== this.crawler3dLoadSerial) return;
      createGltfLoader().load(CRAWLER_3D_URL, ({ scene }) => {
        if (serial !== this.crawler3dLoadSerial) {
          disposeObject3D(scene);
          return;
        }
        const meshes = this.inspectCrawler3d(scene);
        if (!meshes) {
          disposeObject3D(scene);
          this.crawler3dState = 'failed';
          this.publishCrawler3d();
          return;
        }
        scene.name = 'RivalDynamoCrawler3d';
        scene.visible = false;
        this.crawler3dModel = scene;
        this.crawler3dMeshes.clear();
        for (const [id, mesh] of meshes) this.crawler3dMeshes.set(id, mesh);
        this.group.add(scene);
        this.crawler3dState = 'ready';
        this.publishCrawler3d();
      }, undefined, () => {
        if (serial !== this.crawler3dLoadSerial) return;
        this.crawler3dState = 'failed';
        this.publishCrawler3d();
      });
    }, () => {
      if (serial !== this.crawler3dLoadSerial) return;
      this.crawler3dState = 'failed';
      this.publishCrawler3d();
    });
  }

  private inspectCrawler3d(model: THREE.Object3D): Map<CrawlerComponentId, THREE.Mesh> | null {
    const meshes = new Map<CrawlerComponentId, THREE.Mesh>();
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
        const contract = CRAWLER_3D_COMPONENTS[id];
        if (mesh.name === contract.mesh && mesh.morphTargetDictionary?.[contract.morph] === 0 && mesh.morphTargetInfluences?.length === 1) meshes.set(id, mesh);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    if (meshCount !== 3 || meshes.size !== 3 || materials.size !== 1 || triangles !== CRAWLER_3D_TRIANGLES) return null;
    const collectorAnchor = meshes.get('drain_mast')!.userData.collectorAnchor as { intact?: unknown; damaged?: unknown } | undefined;
    const isPoint = (value: unknown): value is [number, number, number] => Array.isArray(value)
      && value.length === 3 && value.every((coordinate) => typeof coordinate === 'number' && Number.isFinite(coordinate));
    if (!collectorAnchor || !isPoint(collectorAnchor.intact) || !isPoint(collectorAnchor.damaged)) return null;
    this.crawler3dCollectorAnchor.fromArray(collectorAnchor.intact);
    this.crawler3dDamagedCollectorAnchor.fromArray(collectorAnchor.damaged);
    // Authored anchors and all geometry caches use asset-root coordinates.
    // Production quantization can rebase individual mesh vertices/transforms.
    model.updateWorldMatrix(true, true);
    const worldToAsset = model.matrixWorld.clone().invert();
    const meshToAsset = new THREE.Matrix4();
    const supportPoints = new Map<string, THREE.Vector3>();
    const tracks = meshes.get('tracks')!;
    const trackPositions = tracks.geometry.getAttribute('position');
    meshToAsset.multiplyMatrices(worldToAsset, tracks.matrixWorld);
    this.crawler3dSupportHalfSize.set(0, 0);
    for (let vertex = 0; vertex < trackPositions.count; vertex += 1) {
      this.crawler3dPoint.fromBufferAttribute(trackPositions, vertex).applyMatrix4(meshToAsset);
      if (![this.crawler3dPoint.x, this.crawler3dPoint.y, this.crawler3dPoint.z].every(Number.isFinite)) return null;
      if (this.crawler3dPoint.y >= 0.06) continue;
      const key = `${this.crawler3dPoint.x.toFixed(4)}:${this.crawler3dPoint.z.toFixed(4)}`;
      const previous = supportPoints.get(key);
      if (!previous || previous.y > this.crawler3dPoint.y) supportPoints.set(key, this.crawler3dPoint.clone());
      this.crawler3dSupportHalfSize.x = Math.max(this.crawler3dSupportHalfSize.x, Math.abs(this.crawler3dPoint.x));
      this.crawler3dSupportHalfSize.y = Math.max(this.crawler3dSupportHalfSize.y, Math.abs(this.crawler3dPoint.z));
    }
    if (supportPoints.size === 0 || this.crawler3dSupportHalfSize.x <= 0 || this.crawler3dSupportHalfSize.y <= 0) return null;
    this.crawler3dSupportPoints.splice(0, this.crawler3dSupportPoints.length, ...supportPoints.values());
    for (const [id, mesh] of meshes) {
      meshToAsset.multiplyMatrices(worldToAsset, mesh.matrixWorld);
      const bounds = [new THREE.Box3(), new THREE.Box3()] as const;
      const hullPoints: [THREE.Vector3[], THREE.Vector3[]] = [[], []];
      for (const damaged of [0, 1] as const) {
        const points: THREE.Vector3[] = [];
        mesh.morphTargetInfluences![0] = damaged;
        for (let vertex = 0; vertex < mesh.geometry.getAttribute('position').count; vertex += 1) {
          mesh.getVertexPosition(vertex, this.crawler3dPoint).applyMatrix4(meshToAsset);
          bounds[damaged].expandByPoint(this.crawler3dPoint);
          if (![this.crawler3dPoint.x, this.crawler3dPoint.y, this.crawler3dPoint.z].every(Number.isFinite)) return null;
          points.push(this.crawler3dPoint.clone());
        }
        if (bounds[damaged].min.x >= bounds[damaged].max.x || bounds[damaged].min.y >= bounds[damaged].max.y || bounds[damaged].min.z >= bounds[damaged].max.z) return null;
        const hull = new ConvexHull().setFromPoints(points);
        hullPoints[damaged] = [...new Set(hull.faces.flatMap((face) => [0, 1, 2].map((edge) => face.getEdge(edge).vertex.point)))];
      }
      mesh.morphTargetInfluences![0] = 0;
      this.crawler3dLocalBounds.set(id, bounds);
      this.crawler3dHullPoints.set(id, hullPoints);
      this.crawler3dComponentBounds.set(id, new THREE.Box3());
    }
    for (const mesh of meshes.values()) {
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.emissiveMap = material.map;
      mesh.material = material;
    }
    for (const material of materials) material.dispose();
    return meshes;
  }

  private updateCrawler3d(components: ReadonlyMap<CrawlerComponentId, ClaimJumperEnemy>): void {
    if (!this.crawler3dModel || this.crawler3dState !== 'ready' || components.size === 0) return;
    const anchor = components.values().next().value as ClaimJumperEnemy | undefined;
    if (!anchor?.bossGroupId) return;
    if (this.crawler3dGroupId !== anchor.bossGroupId) {
      const contract = activeContract();
      const baron = contract.twist.baron;
      const route = contract.tileParams.rails?.[baron?.railRouteIndex ?? 0];
      const start = route?.points[0], end = route?.points.at(-1);
      if (baron?.variantId !== CRAWLER_VARIANT || !start || !end) return;
      const length = Math.hypot(end.x - start.x, end.z - start.z);
      if (length < 0.001) return;
      const alongX = (end.x - start.x) / length, alongZ = (end.z - start.z) / length;
      this.crawler3dYaw = Math.atan2(-alongZ, alongX);
      this.crawler3dGroupId = anchor.bossGroupId;
      this.crawler3dOffsets.clear();
      // The complete authored formation survives late loading, reversal and any
      // component loss. Dead positions become stale while surviving routes move.
      const authored = baron.components ?? [];
      const meanAlong = authored.reduce((sum, part, index) => sum + (part.xOffset ?? index * 1.1), 0) / authored.length;
      const meanSide = authored.reduce((sum, part) => sum + (part.zOffset ?? 0), 0) / authored.length;
      for (const [index, part] of authored.entries()) {
        if (!COMPONENT_IDS.includes(part.id as CrawlerComponentId)) continue;
        const along = (part.xOffset ?? index * 1.1) - meanAlong, side = (part.zOffset ?? 0) - meanSide;
        this.crawler3dOffsets.set(part.id as CrawlerComponentId, new THREE.Vector3(alongX * along - alongZ * side, 0, alongZ * along + alongX * side));
      }
    }
    this.crawler3dCenter.set(0, 0, 0);
    for (const [id, enemy] of components) {
      this.crawler3dCenter.add(enemy.position);
      const offset = this.crawler3dOffsets.get(id);
      if (offset) this.crawler3dCenter.sub(offset);
    }
    this.crawler3dCenter.multiplyScalar(1 / components.size);
    this.crawler3dCenter.x += Math.cos(this.crawler3dYaw) * CRAWLER_3D_LONGITUDINAL_SHIFT;
    this.crawler3dCenter.z -= Math.sin(this.crawler3dYaw) * CRAWLER_3D_LONGITUDINAL_SHIFT;
    this.crawler3dModel.position.set(
      this.crawler3dCenter.x,
      0,
      this.crawler3dCenter.z,
    );
    this.crawler3dModel.rotation.set(0, this.crawler3dYaw, 0);
    this.crawler3dModel.scale.setScalar(CRAWLER_3D_SCALE);
    this.groundCrawler3d();
    this.crawler3dModel.visible = true;
    for (const [id, mesh] of this.crawler3dMeshes) {
      const enemy = components.get(id);
      const damaged = this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= CRAWLER_DAMAGE_THRESHOLD);
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = damaged ? 1 : 0;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.copy(CRAWLER_3D_FILL);
      if (damaged) material.emissive.set(CRAWLER_3D_COMPONENTS[id].damageColor).lerp(CRAWLER_3D_FILL, 0.8);
      material.emissiveIntensity = damaged ? 2.2 : 2;
    }
    this.crawler3dModel.updateWorldMatrix(true, true);
    this.crawler3dBounds.makeEmpty();
    let barPointCount = 0;
    for (const [id, mesh] of this.crawler3dMeshes) {
      const bounds = this.crawler3dComponentBounds.get(id)!;
      const damaged = mesh.morphTargetInfluences?.[0] === 1 ? 1 : 0;
      bounds.copy(this.crawler3dLocalBounds.get(id)![damaged]).applyMatrix4(this.crawler3dModel.matrixWorld);
      this.crawler3dBounds.union(bounds);
      for (const point of this.crawler3dHullPoints.get(id)![damaged]) {
        const worldPoint = this.crawler3dBarPoints[barPointCount] ?? (this.crawler3dBarPoints[barPointCount] = new THREE.Vector3());
        worldPoint.copy(point).applyMatrix4(this.crawler3dModel.matrixWorld);
        barPointCount += 1;
      }
    }
    this.crawler3dBarPoints.length = barPointCount;
  }

  private groundCrawler3d(): void {
    const model = this.crawler3dModel!;
    const halfX = this.crawler3dSupportHalfSize.x * CRAWLER_3D_SCALE, halfZ = this.crawler3dSupportHalfSize.y * CRAWLER_3D_SCALE;
    const cos = Math.cos(this.crawler3dYaw), sin = Math.sin(this.crawler3dYaw);
    const height = (x: number, z: number) => Terrain.visualY(model.position.x + cos * x + sin * z, model.position.z - sin * x + cos * z, 0);
    const h00 = height(-halfX, -halfZ), h10 = height(halfX, -halfZ), h01 = height(-halfX, halfZ), h11 = height(halfX, halfZ);
    const slopeX = (h10 + h11 - h00 - h01) / (4 * halfX), slopeZ = (h01 + h11 - h00 - h10) / (4 * halfZ);
    this.crawler3dNormal.set(-slopeX, 1, -slopeZ).normalize();
    this.crawler3dTilt.setFromUnitVectors(this.crawler3dUp, this.crawler3dNormal);
    model.quaternion.multiply(this.crawler3dTilt);
    // Pivot at lower boiler height to keep the mast over its fixed hit zone on
    // slopes. Re-ground the translated footprint; no suspension or mesh stretch.
    this.crawler3dPoint.copy(this.crawler3dUp).applyQuaternion(model.quaternion);
    model.position.x -= this.crawler3dPoint.x * CRAWLER_3D_SCALE * CRAWLER_3D_TILT_PIVOT_Y;
    model.position.z -= this.crawler3dPoint.z * CRAWLER_3D_SCALE * CRAWLER_3D_TILT_PIVOT_Y;
    model.position.y = 0;
    model.updateWorldMatrix(true, true);
    let lift = Number.NEGATIVE_INFINITY;
    // Cache the intact support vertices once; damage debris must not lift the chassis.
    for (const point of this.crawler3dSupportPoints) {
      this.crawler3dPoint.copy(point).applyMatrix4(model.matrixWorld);
      lift = Math.max(lift, Terrain.visualY(this.crawler3dPoint.x, this.crawler3dPoint.z, 0) - this.crawler3dPoint.y);
    }
    model.position.y = lift + 0.025;
  }

  private disposeCrawler3d(nextState: Crawler3dState): void {
    this.crawler3dLoadSerial += 1;
    if (this.crawler3dModel) {
      this.group.remove(this.crawler3dModel);
      disposeObject3D(this.crawler3dModel);
      this.crawler3dModel = undefined;
    }
    this.crawler3dMeshes.clear();
    this.crawler3dOffsets.clear();
    this.crawler3dLocalBounds.clear();
    this.crawler3dHullPoints.clear();
    this.crawler3dBarPoints.length = 0;
    this.crawler3dComponentBounds.clear();
    this.crawler3dBounds.makeEmpty();
    this.crawler3dSupportPoints.length = 0;
    this.crawler3dGroupId = null;
    this.crawler3dState = nextState;
    this.publishCrawler3d();
  }

  private publishCrawler3d(components: ReadonlyMap<CrawlerComponentId, ClaimJumperEnemy> = this.liveComponents()): void {
    if (typeof document === 'undefined') return;
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.dataset.crawler3dState = this.crawler3dState;
    canvas.dataset.crawler3dSource = this.crawler3dState === 'ready' ? 'glb' : 'placeholder';
    canvas.dataset.crawler3dMounted = String(this.crawler3dState === 'ready' && this.crawler3dGroupId !== null);
    canvas.dataset.crawler3dDamageStates = JSON.stringify(Object.fromEntries(COMPONENT_IDS.map((id) => {
      const enemy = components.get(id);
      const damaged = this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= CRAWLER_DAMAGE_THRESHOLD);
      return [id, damaged ? 'broken' : 'intact'];
    })));
  }

  private placeBeamSegment(mesh: THREE.Mesh, start: THREE.Vector3, end: THREE.Vector3): void {
    const direction = end.clone().sub(start);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.scale.set(1, direction.length(), 1);
    mesh.quaternion.setFromUnitVectors(Y_AXIS, direction.normalize());
  }

  private nearestRelay(position: THREE.Vector3): PowerNodeSnapshot | null {
    let nearest: PowerNodeSnapshot | null = null;
    let distance = Number.POSITIVE_INFINITY;
    for (const node of this.powerNodes()) {
      if (node.kind !== 'relay' || !node.online || node.state === 'dark') continue;
      const candidate = Math.hypot(node.x - position.x, node.z - position.z);
      if (candidate >= distance) continue;
      nearest = node;
      distance = candidate;
    }
    return nearest;
  }

  private syncDrainTarget(target: PowerNodeSnapshot | null): void {
    const nextNodeId = this.drainActive && target ? `crawler-drain-${target.id.replace(/^pylon-/, '')}` : null;
    if (this.drainNodeId !== nextNodeId) {
      if (this.drainNodeId) this.queuePower({ type: 'set-node-online', nodeId: this.drainNodeId, online: false });
      if (nextNodeId) this.queuePower({ type: 'set-node-online', nodeId: nextNodeId, online: true });
      this.drainNodeId = nextNodeId;
    }
    this.drainTarget = target?.id ?? null;
  }

  private activeDrainNode(): PowerNodeSnapshot | null {
    if (!this.drainActive || !this.drainNodeId) return null;
    return this.powerNodes().find((node) => node.id === this.drainNodeId) ?? null;
  }

  private hideTransientPresentation(): void {
    for (const mesh of this.componentMeshes.values()) mesh.visible = false;
    this.beam.visible = false;
    this.dial.visible = false;
    this.wreck.visible = false;
  }
}

const Y_AXIS = new THREE.Vector3(0, 1, 0);

function box(width: number, height: number, depth: number, color: string, x: number, y: number, z: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(radius: number, height: number, color: string, x: number, y: number, z: number): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), new THREE.MeshBasicMaterial({ color }));
  mesh.position.set(x, y, z);
  return mesh;
}
