import * as THREE from 'three';
import type { ClaimJumperEnemy, EnemySpawnParams } from '../entities/Enemy';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import type { DredgeQueenWreckPayload } from '../game/TileStateStore';
import type { StormWaveEvent } from './StormWaveScheduler';
import { disposeObject3D } from '../utils/dispose';

const VARIANT = 'dredge_queen';
const ESCORT_VARIANT = 'corsair_skiff';
const ESCORT_LABEL = 'Dredge-Queen Escort';
const ACT1_IDS = ['claw', 'paddle_port', 'paddle_starboard'] as const;
const PADDLE_IDS = ['paddle_port', 'paddle_starboard'] as const;
type Act1ComponentId = typeof ACT1_IDS[number];
type ComponentId = Act1ComponentId | 'hold';
const COMPONENT_IDS = [...ACT1_IDS, 'hold'] as const;
const DREDGE_QUEEN_3D_URL = new URL('../../assets/pilots/dredge-queen-3d/dredge-queen.glb', import.meta.url).href;
const DREDGE_QUEEN_3D_TRIANGLES = 11_832;
const DREDGE_QUEEN_DAMAGE_THRESHOLD = 0.5;
const DREDGE_QUEEN_3D_COMPONENTS = {
  claw: { mesh: 'claw', morph: 'Damage_SlackClaw', damageColor: '#5b8a8a' },
  paddle_port: { mesh: 'paddle_port', morph: 'Damage_BrokenPortPaddle', damageColor: '#c4883a' },
  paddle_starboard: { mesh: 'paddle_starboard', morph: 'Damage_BrokenStarboardPaddle', damageColor: '#c4883a' },
  hold: { mesh: 'hold', morph: 'Damage_CrackedLootHold', damageColor: '#7f2633' },
} as const;
type DredgeQueen3dState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';
type WreckSite = Readonly<{ x: number; z: number }>;

/** TP-01: wreck persistence lives on TileStateStore; the boss system only reads at birth and writes at its ceremony. */
export type DredgeQueenWreckPersistence = Readonly<{
  readAtBirth: () => DredgeQueenWreckPayload | null;
  writeAtCeremony: (wreck: DredgeQueenWreckPayload) => void;
}>;

export type DredgeQueenBossDiagnostics = {
  active: boolean;
  act: 0 | 1 | 2 | 3;
  stormFrontWave: number | null;
  approaching: boolean;
  anchored: boolean;
  anchor: { x: number; z: number };
  clawCycleProgress: number;
  clawCycles: number;
  clawInterrupts: number;
  holdLoot: number;
  livePaddles: number;
  act2Locked: boolean;
  repositions: number;
  swatTelegraphed: boolean;
  swats: number;
  escortMultiplier: number;
  escortSkiffs: number;
  escortsExiting: boolean;
  escortsExited: number;
  spillPickups: number;
  crewQuit: boolean;
  hulkPresent: boolean;
  persistentWreck: boolean;
};

export class DredgeQueenBossSystem {
  readonly group = new THREE.Group();
  private readonly barge = new THREE.Group();
  private readonly bargePrimitive = new THREE.Group();
  private readonly wreckMarker = new THREE.Mesh(
    new THREE.RingGeometry(3.5, 4, 32),
    new THREE.MeshBasicMaterial({ color: '#62d7cd', transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false }),
  );
  private readonly cyclePointer = box(0.16, 0.12, 1.7, '#fff0b8');
  private readonly swatRing = new THREE.Mesh(
    new THREE.RingGeometry(Balance.dredgeQueen.swatRadius - 0.2, Balance.dredgeQueen.swatRadius, 32, 1, 0, Math.PI),
    new THREE.MeshBasicMaterial({ color: '#d95f32', transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
  );
  private readonly lootMarkers = Array.from({ length: Balance.dredgeQueen.lootUnits }, (_, index) =>
    box(0.38, 0.38, 0.38, '#ffd56a', (index % 3 - 1) * 0.5, 1.25 + Math.floor(index / 3) * 0.45, 0.25),
  );
  private readonly lootCounter = counterSprite();
  private readonly clawLabel = labelSprite('CLAW', '#73b6ad', 3.1);
  private readonly portLabel = labelSprite('PORT PADDLE', '#f3c66d', 4.2);
  private readonly starboardLabel = labelSprite('STARBOARD PADDLE', '#f3c66d', 4.8);
  private readonly hulk = new THREE.Group();
  private readonly quittingSkiffs: THREE.Group[] = [];
  private act: 0 | 1 | 2 | 3 = 0;
  private started = false;
  private stormFrontWave: number | null = null;
  private approachEndsAt = Number.POSITIVE_INFINITY;
  private cycleStartedAt = Number.POSITIVE_INFINITY;
  private nextCycleAt = Number.POSITIVE_INFINITY;
  private clawCycles = 0;
  private clawInterrupts = 0;
  private holdLoot = 0;
  private cyclesSinceMove = 0;
  private wreckIndex = 0;
  private repositions = 0;
  private lastClawHp: number | null = null;
  private nextSwatAt = Number.POSITIVE_INFINITY;
  private swats = 0;
  private spillPickups = 0;
  private crewQuit = false;
  private escortsExiting = false;
  private escortsExited = 0;
  private escortsToExit = 0;
  private hulkPresent = false;
  private persistentWreck = false;
  private renderedLoot = -1;
  private lastAt = 0;
  private eastExitX = 64;
  private readonly anchor = new THREE.Vector3(36, 0, -20);
  private readonly destroyed = new Set<ComponentId>();
  private dredgeQueen3dState: DredgeQueen3dState;
  private dredgeQueen3dLoadSerial = 0;
  private dredgeQueen3dModel?: THREE.Object3D;
  private readonly dredgeQueen3dMeshes = new Map<ComponentId, THREE.Mesh>();
  private readonly dredgeQueen3dCenter = new THREE.Vector3();

  constructor(
    private readonly enemies: () => readonly ClaimJumperEnemy[],
    private readonly spawnEnemy: (position: THREE.Vector3, params: EnemySpawnParams) => ClaimJumperEnemy | null | undefined,
    private readonly recycleEnemy: (enemy: ClaimJumperEnemy) => void,
    private readonly wreckSites: () => readonly WreckSite[],
    private readonly heroPosition: () => THREE.Vector3,
    private readonly damageHero: (amount: number, sourceId: number) => boolean,
    private readonly spawnPickup: (position: THREE.Vector3, amount: number) => boolean,
    private readonly enabled: boolean,
    private readonly persistence: DredgeQueenWreckPersistence,
  ) {
    this.dredgeQueen3dState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
    this.group.name = 'DredgeQueen.Placeholder';
    this.buildPresentation();
    if (this.enabled) this.restorePersistentWreck();
  }

  onStormWave(event: StormWaveEvent, bossWave: number): boolean {
    if (!this.enabled || this.persistentWreck || event.wave < bossWave || this.act === 3) return false;
    if (!this.started && event.wave === bossWave) this.startApproach(event);
    return this.started;
  }

  onComponentKilled(id: string | undefined, position: THREE.Vector3, at: number): void {
    if (!this.enabled) return;
    if (![...ACT1_IDS, 'hold'].includes(id as ComponentId)) return;
    const componentId = id as ComponentId;
    this.destroyed.add(componentId);
    if (componentId === 'hold' && this.act === 2) this.finishFight(position);
    else this.advanceToAct2(at);
  }

  update(at: number): void {
    const delta = Math.max(0, at - this.lastAt);
    this.lastAt = at;
    if (this.persistentWreck || !this.started) return this.syncPresentation();
    if (this.act === 0 && at >= this.approachEndsAt) this.anchorForAct1(at);
    if (this.act === 1) this.updateDredging(at);
    if (this.act === 2) this.updateDefensiveClaw(at);
    if (this.act === 3) this.updateExitingEscorts(delta);
    this.syncPresentation();
  }

  get escortMultiplier(): number {
    return this.act === 2 ? Balance.dredgeQueen.escortAct2Multiplier : 1;
  }

  diagnostics(): DredgeQueenBossDiagnostics {
    const livePaddles = PADDLE_IDS.filter((id) => !this.destroyed.has(id)).length;
    return {
      active: this.started,
      act: this.act,
      stormFrontWave: this.stormFrontWave,
      approaching: this.act === 0 && this.started,
      anchored: this.act > 0 || this.hulkPresent,
      anchor: { x: round2(this.anchor.x), z: round2(this.anchor.z) },
      clawCycleProgress: round2(this.clawCycleProgress),
      clawCycles: this.clawCycles,
      clawInterrupts: this.clawInterrupts,
      holdLoot: this.holdLoot,
      livePaddles,
      act2Locked: this.act < 2 && this.destroyedPaddleCount < Balance.dredgeQueen.paddlesRequired,
      repositions: this.repositions,
      swatTelegraphed: this.swatTelegraphed,
      swats: this.swats,
      escortMultiplier: this.escortMultiplier,
      escortSkiffs: this.liveEscorts().length,
      escortsExiting: this.escortsExiting,
      escortsExited: this.escortsExited,
      spillPickups: this.spillPickups,
      crewQuit: this.crewQuit,
      hulkPresent: this.hulkPresent,
      persistentWreck: this.persistentWreck,
    };
  }

  reset(): void {
    this.disposeDredgeQueen3d(performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off');
    for (const enemy of this.liveComponents()) this.recycleEnemy(enemy);
    this.clearQuittingSkiffs();
    this.act = 0;
    this.started = false;
    this.stormFrontWave = null;
    this.approachEndsAt = Number.POSITIVE_INFINITY;
    this.cycleStartedAt = Number.POSITIVE_INFINITY;
    this.nextCycleAt = Number.POSITIVE_INFINITY;
    this.clawCycles = 0;
    this.clawInterrupts = 0;
    this.holdLoot = 0;
    this.cyclesSinceMove = 0;
    this.wreckIndex = 0;
    this.repositions = 0;
    this.lastClawHp = null;
    this.nextSwatAt = Number.POSITIVE_INFINITY;
    this.swats = 0;
    this.spillPickups = 0;
    this.crewQuit = false;
    this.escortsExiting = false;
    this.escortsExited = 0;
    this.escortsToExit = 0;
    this.hulkPresent = false;
    this.persistentWreck = false;
    this.lastAt = 0;
    this.destroyed.clear();
    if (this.enabled) this.restorePersistentWreck();
    this.syncPresentation();
  }

  dispose(): void {
    this.disposeDredgeQueen3d('disposed');
    disposeObject3D(this.group);
    this.group.clear();
  }

  private startApproach(event: StormWaveEvent): void {
    const sites = this.wreckSites();
    this.wreckIndex = Math.max(0, sites.length - 1);
    const site = sites[this.wreckIndex];
    if (site) this.anchor.set(site.x, 0, site.z);
    this.started = true;
    this.stormFrontWave = event.wave;
    this.eastExitX = event.toX;
    this.approachEndsAt = event.scheduledAt + Balance.dredgeQueen.approachSeconds;
    for (const [index, id] of ACT1_IDS.entries()) {
      const enemy = this.spawnComponent(id, new THREE.Vector3(event.fromX + 2, 0, this.anchor.z + componentOffset(id).z), false);
      enemy?.scriptMoveTo(this.anchor.x + componentOffset(id).x, this.anchor.z + componentOffset(id).z, (event.toX - event.fromX) / Balance.dredgeQueen.approachSeconds, { ignoreTerrain: true });
      if (enemy) enemy.group.position.z += index * 0.01;
    }
  }

  private anchorForAct1(at: number): void {
    this.act = 1;
    this.pinAtAnchor();
    this.cycleStartedAt = at;
    this.nextCycleAt = at + Balance.dredgeQueen.clawCycleSeconds;
    this.lastClawHp = this.component('claw')?.currentHp ?? null;
  }

  private updateDredging(at: number): void {
    const claw = this.component('claw');
    if (claw && this.lastClawHp !== null && claw.currentHp < this.lastClawHp) {
      this.clawInterrupts += 1;
      this.cycleStartedAt = at;
      this.nextCycleAt = at + Balance.dredgeQueen.clawCycleSeconds;
    }
    this.lastClawHp = claw?.currentHp ?? null;
    if (!claw || at < this.nextCycleAt) return;
    this.clawCycles += 1;
    this.cyclesSinceMove += 1;
    this.holdLoot = Math.min(Balance.dredgeQueen.lootUnits, this.holdLoot + 1);
    this.cycleStartedAt = at;
    this.nextCycleAt = at + Balance.dredgeQueen.clawCycleSeconds;
    if (this.cyclesSinceMove >= Balance.dredgeQueen.repositionEveryCycles && this.livePaddleCount() > 0) this.reposition();
  }

  private reposition(): void {
    const sites = this.wreckSites();
    if (sites.length < 2) return;
    this.cyclesSinceMove = 0;
    this.wreckIndex = (this.wreckIndex + sites.length - 1) % sites.length;
    const next = sites[this.wreckIndex]!;
    this.anchor.set(next.x, 0, next.z);
    this.repositions += 1;
    for (const enemy of this.liveComponents()) {
      const id = enemy.bossComponentId as ComponentId;
      const offset = componentOffset(id);
      enemy.scriptMoveTo(next.x + offset.x, next.z + offset.z, Balance.dredgeQueen.repositionSpeed, { ignoreTerrain: true });
    }
  }

  private advanceToAct2(at: number): void {
    if (this.act !== 1 || this.destroyedPaddleCount < Balance.dredgeQueen.paddlesRequired) return;
    this.act = 2;
    this.nextSwatAt = at + Balance.dredgeQueen.swatIntervalSeconds;
    const claw = this.component('claw');
    if (claw) this.recycleEnemy(claw);
    this.spawnComponent('hold', this.anchor.clone(), true)?.scriptMoveTo(this.anchor.x, this.anchor.z, 0, { ignoreTerrain: true });
    this.spawnAct2Reinforcements();
    // Act-2 dive pressure attaches here once the era's dive verb exists.
  }

  private updateDefensiveClaw(at: number): void {
    if (this.destroyed.has('claw')) return;
    if (at < this.nextSwatAt) return;
    this.nextSwatAt = at + Balance.dredgeQueen.swatIntervalSeconds;
    this.swats += 1;
    const hero = this.heroPosition();
    const dx = hero.x - this.anchor.x;
    const dz = hero.z - this.anchor.z;
    if (dz <= 0 && Math.hypot(dx, dz) <= Balance.dredgeQueen.swatRadius) {
      this.damageHero(Balance.dredgeQueen.swatDamage, this.component('hold')?.id ?? -5);
    }
  }

  private finishFight(position: THREE.Vector3): void {
    this.act = 3;
    this.anchor.set(position.x, 0, position.z);
    this.crewQuit = true;
    this.hulkPresent = true;
    this.escortsExiting = true;
    const escorts = this.liveEscorts();
    this.escortsToExit = escorts.length;
    for (let index = 0; index < this.holdLoot; index += 1) {
      const angle = index * Math.PI * (3 - Math.sqrt(5));
      const radius = Balance.dredgeQueen.spillRadius * Math.sqrt((index + 1) / Math.max(1, this.holdLoot));
      const drop = new THREE.Vector3(position.x + Math.cos(angle) * radius, 0, position.z + Math.sin(angle) * radius);
      if (this.spawnPickup(drop, Balance.dredgeQueen.lootGoldPerUnit)) this.spillPickups += 1;
    }
    for (const [index, escort] of escorts.entries()) {
      const skiff = quittingSkiff();
      skiff.position.set(
        this.anchor.x + 6 + Math.floor(index / 3) * 3.2,
        0,
        this.anchor.z + (index % 3 - 1) * 3.2,
      );
      this.quittingSkiffs.push(skiff);
      this.group.add(skiff);
      this.recycleEnemy(escort);
    }
    if (this.quittingSkiffs.length === 0) this.escortsExiting = false;
    this.persistWreck();
  }

  private updateExitingEscorts(delta: number): void {
    for (let index = this.quittingSkiffs.length - 1; index >= 0; index -= 1) {
      const skiff = this.quittingSkiffs[index]!;
      skiff.position.x += Balance.dredgeQueen.escortExitSpeed * delta;
      if (skiff.position.x < this.eastExitX + 3) continue;
      this.quittingSkiffs.splice(index, 1);
      this.group.remove(skiff);
      disposeObject3D(skiff);
      this.escortsExited += 1;
    }
    if (this.quittingSkiffs.length === 0) {
      this.escortsExited = Math.max(this.escortsExited, this.escortsToExit);
      this.escortsExiting = false;
    }
  }

  private spawnAct2Reinforcements(): void {
    for (let index = 0; index < Balance.dredgeQueen.escortAct2Reinforcements; index += 1) {
      const z = this.anchor.z + (index - (Balance.dredgeQueen.escortAct2Reinforcements - 1) / 2) * 2.4;
      const enemy = this.spawnEnemy(new THREE.Vector3(this.anchor.x - 7, 0, z), {
        hpScale: 1,
        speedScale: 1,
        visualScale: 1.25,
        variantId: ESCORT_VARIANT,
        variantLabel: ESCORT_LABEL,
        tint: '#8f4f32',
      });
      enemy?.scriptMoveTo(this.anchor.x - 4, z, Balance.dredgeQueen.repositionSpeed, { ignoreTerrain: true });
    }
  }

  private spawnComponent(id: ComponentId, position: THREE.Vector3, final: boolean): ClaimJumperEnemy | null | undefined {
    const hp = id === 'hold' ? Balance.dredgeQueen.componentHp.hold
      : id === 'claw' ? Balance.dredgeQueen.componentHp.claw
      : Balance.dredgeQueen.componentHp.paddle;
    const groupId = final ? 'e5-deepwater-claim:dredge-queen-hold' : 'e5-deepwater-claim:dredge-queen-act1';
    const groupSize = final ? 1 : ACT1_IDS.length;
    const totalHp = final ? Balance.dredgeQueen.componentHp.hold
      : Balance.dredgeQueen.componentHp.claw + Balance.dredgeQueen.componentHp.paddle * 2;
    return this.spawnEnemy(position, {
      eliteKind: final ? 'railcar' : undefined,
      hpScale: hp / Balance.enemy.hp,
      speedScale: 1,
      visualScale: 1.35,
      contactDamageScale: 0,
      buildingDamageScale: 0,
      supportBuildingDamageScale: 0,
      heroPursuitRange: 0,
      variantId: VARIANT,
      variantLabel: 'The Dredge-Queen',
      tint: componentColor(id),
      bossGroupId: groupId,
      bossGroupSize: groupSize,
      bossGroupTotalHp: totalHp,
      bossComponentId: id,
      bossComponentLabel: componentLabel(id),
      bossDegradeSpeedMult: 1,
    });
  }

  private pinAtAnchor(): void {
    for (const enemy of this.liveComponents()) {
      const offset = componentOffset(enemy.bossComponentId as ComponentId);
      enemy.scriptMoveTo(this.anchor.x + offset.x, this.anchor.z + offset.z, 0, { ignoreTerrain: true });
    }
  }

  private liveComponents(): ClaimJumperEnemy[] {
    return this.enemies().filter((enemy) => enemy.isAlive && enemy.variantId === VARIANT);
  }

  private component(id: ComponentId): ClaimJumperEnemy | undefined {
    return this.liveComponents().find((enemy) => enemy.bossComponentId === id);
  }

  private livePaddleCount(): number {
    return PADDLE_IDS.filter((id) => !this.destroyed.has(id)).length;
  }

  private get destroyedPaddleCount(): number {
    return PADDLE_IDS.length - this.livePaddleCount();
  }

  private liveEscorts(): ClaimJumperEnemy[] {
    return this.enemies().filter((enemy) => enemy.isAlive
      && enemy.variantId === ESCORT_VARIANT
      && enemy.variantLabel === ESCORT_LABEL);
  }

  private get clawCycleProgress(): number {
    return this.act === 1
      ? THREE.MathUtils.clamp((this.lastAt - this.cycleStartedAt) / Balance.dredgeQueen.clawCycleSeconds, 0, 1)
      : 0;
  }

  private get swatTelegraphed(): boolean {
    return this.act === 2
      && !this.destroyed.has('claw')
      && this.nextSwatAt - this.lastAt <= Balance.dredgeQueen.swatTelegraphSeconds;
  }

  private clearQuittingSkiffs(): void {
    for (const skiff of this.quittingSkiffs) {
      this.group.remove(skiff);
      disposeObject3D(skiff);
    }
    this.quittingSkiffs.length = 0;
  }

  private buildPresentation(): void {
    const clawJaws = new THREE.Group();
    const leftJaw = box(1.35, 0.24, 0.24, '#73b6ad', -4.25, 0.72, -0.42);
    const rightJaw = box(1.35, 0.24, 0.24, '#73b6ad', -4.25, 0.72, 0.42);
    leftJaw.rotation.y = -0.48;
    rightJaw.rotation.y = 0.48;
    clawJaws.add(leftJaw, rightJaw);
    this.bargePrimitive.add(
      box(7.5, 0.9, 3.8, '#51372a', 0, 0.65, 0),
      box(2.2, 1.6, 2.5, '#6a4b35', 2, 1.65, 0),
      cylinder(1.25, 0.65, '#e2a246', -0.3, 0.7, -2.15, Math.PI / 2),
      cylinder(1.25, 0.65, '#e2a246', -0.3, 0.7, 2.15, Math.PI / 2),
      cylinder(1.05, 0.24, '#f3c66d', -0.3, 1.05, -3.05),
      cylinder(1.05, 0.24, '#f3c66d', -0.3, 1.05, 3.05),
      box(0.5, 0.3, 2.2, '#f3c66d', -0.3, 0.7, -2.9),
      box(0.5, 0.3, 2.2, '#f3c66d', -0.3, 0.7, 2.9),
      cylinder(0.18, 4.2, '#8a633b', -2.2, 2.7, 0),
      box(1.8, 1.1, 0.08, '#7f2633', -1.3, 3.5, 0),
      cylinder(0.22, 4.6, '#5b8a8a', -3.4, 2, 0, 0.55),
      clawJaws,
    );
    this.barge.add(this.bargePrimitive, ...this.lootMarkers, this.lootCounter, this.clawLabel, this.portLabel, this.starboardLabel);
    this.lootCounter.position.set(0.7, 4.4, 0);
    this.clawLabel.position.set(-4.5, 3.15, 0);
    this.portLabel.position.set(-0.1, 2.35, -4.25);
    this.starboardLabel.position.set(-0.1, 2.35, 4.25);
    this.wreckMarker.rotation.x = -Math.PI / 2;
    this.wreckMarker.position.y = 0.08;
    this.cyclePointer.position.set(-3.4, 3.4, 0);
    this.swatRing.rotation.x = -Math.PI / 2;
    this.swatRing.position.y = 0.1;
    const brokenBow = box(3.7, 0.7, 4, '#40382f', -2.05, 0.35, 0);
    const brokenStern = box(3.55, 0.7, 3.75, '#40382f', 2.15, 0.28, 0.22);
    brokenStern.rotation.y = 0.1;
    this.hulk.add(
      brokenBow,
      brokenStern,
      box(2.5, 1.1, 2.4, '#544538', 1.8, 1.1, 0),
      cylinder(0.2, 2.8, '#65472f', -2.1, 1.35, 0, 0.42),
      cylinder(0.26, 2.5, '#426d69', -2.9, 0.9, -0.25, 1.05),
      box(0.45, 0.25, 1.8, '#a56f37', -0.4, 0.65, 2.35),
      box(0.8, 0.18, 0.7, '#261f1a', -0.15, 0.2, -0.75),
      box(0.7, 0.16, 0.55, '#5a4634', -0.2, 0.42, 1.1),
    );
    this.group.add(this.wreckMarker, this.barge, this.cyclePointer, this.swatRing, this.hulk);
    this.syncPresentation();
  }

  private syncPresentation(): void {
    const components = this.liveComponents();
    if (this.started || this.hulkPresent) this.ensureDredgeQueen3d();
    const center = components.length > 0
      ? components.reduce((sum, enemy) => sum.add(enemy.position), new THREE.Vector3()).multiplyScalar(1 / components.length)
      : this.anchor;
    this.updateDredgeQueen3d(components, center);
    const modelMounted = this.dredgeQueen3dState === 'ready' && this.dredgeQueen3dModel?.visible === true;
    this.barge.position.set(center.x, 0, center.z);
    this.barge.visible = this.started && this.act < 3;
    this.bargePrimitive.visible = !modelMounted;
    this.wreckMarker.position.set(this.anchor.x, 0.08, this.anchor.z);
    this.wreckMarker.visible = this.started && this.act < 3;
    this.cyclePointer.visible = this.act === 1;
    this.cyclePointer.position.set(center.x - 3.4, 3.4, center.z);
    this.cyclePointer.rotation.y = -Math.PI * 2 * this.clawCycleProgress;
    this.swatRing.position.set(this.anchor.x, 0.1, this.anchor.z);
    this.swatRing.visible = this.swatTelegraphed;
    for (let index = 0; index < this.lootMarkers.length; index += 1) this.lootMarkers[index]!.visible = index < this.holdLoot;
    if (this.renderedLoot !== this.holdLoot) {
      this.renderedLoot = this.holdLoot;
      renderCounter(this.lootCounter, this.holdLoot);
    }
    this.lootCounter.visible = this.act === 1;
    this.clawLabel.visible = this.act === 1 && !this.destroyed.has('claw');
    this.portLabel.visible = this.act === 1 && !this.destroyed.has('paddle_port');
    this.starboardLabel.visible = this.act === 1 && !this.destroyed.has('paddle_starboard');
    this.hulk.position.set(this.anchor.x, 0, this.anchor.z);
    this.hulk.visible = this.hulkPresent && !modelMounted;
    this.publishDredgeQueen3d();
  }

  private ensureDredgeQueen3d(): void {
    if (this.dredgeQueen3dState !== 'off' && this.dredgeQueen3dState !== 'disposed') return;
    const serial = ++this.dredgeQueen3dLoadSerial;
    this.dredgeQueen3dState = 'loading';
    this.publishDredgeQueen3d();
    void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      if (serial !== this.dredgeQueen3dLoadSerial) return;
      new GLTFLoader().load(DREDGE_QUEEN_3D_URL, ({ scene }) => {
        if (serial !== this.dredgeQueen3dLoadSerial) {
          disposeObject3D(scene);
          return;
        }
        const meshes = this.inspectDredgeQueen3d(scene);
        if (!meshes) {
          disposeObject3D(scene);
          this.dredgeQueen3dState = 'failed';
          this.publishDredgeQueen3d();
          return;
        }
        scene.name = 'DredgeQueen3d';
        scene.visible = false;
        this.dredgeQueen3dModel = scene;
        this.dredgeQueen3dMeshes.clear();
        for (const [id, mesh] of meshes) this.dredgeQueen3dMeshes.set(id, mesh);
        this.group.add(scene);
        this.dredgeQueen3dState = 'ready';
        this.syncPresentation();
      }, undefined, () => {
        if (serial !== this.dredgeQueen3dLoadSerial) return;
        this.dredgeQueen3dState = 'failed';
        this.publishDredgeQueen3d();
      });
    }, () => {
      if (serial !== this.dredgeQueen3dLoadSerial) return;
      this.dredgeQueen3dState = 'failed';
      this.publishDredgeQueen3d();
    });
  }

  private inspectDredgeQueen3d(model: THREE.Object3D): Map<ComponentId, THREE.Mesh> | null {
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
        const contract = DREDGE_QUEEN_3D_COMPONENTS[id];
        if (mesh.name === contract.mesh && mesh.morphTargetDictionary?.[contract.morph] === 0 && mesh.morphTargetInfluences?.length === 1) meshes.set(id, mesh);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    if (meshCount !== 4 || meshes.size !== 4 || materials.size !== 1 || triangles !== DREDGE_QUEEN_3D_TRIANGLES) return null;
    for (const mesh of meshes.values()) {
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.emissiveMap = material.map;
      mesh.material = material;
    }
    for (const material of materials) material.dispose();
    return meshes;
  }

  private updateDredgeQueen3d(components: readonly ClaimJumperEnemy[], fallbackCenter: THREE.Vector3): void {
    if (!this.dredgeQueen3dModel || this.dredgeQueen3dState !== 'ready') return;
    this.dredgeQueen3dCenter.copy(this.act >= 2 || this.hulkPresent ? this.anchor : fallbackCenter);
    if (this.act === 1 && components.length > 0) {
      let offsetX = 0;
      let offsetZ = 0;
      for (const enemy of components) {
        const offset = componentOffset(enemy.bossComponentId as ComponentId);
        offsetX += offset.x;
        offsetZ += offset.z;
      }
      this.dredgeQueen3dCenter.x -= offsetX / components.length;
      this.dredgeQueen3dCenter.z -= offsetZ / components.length;
    }
    this.dredgeQueen3dModel.position.set(this.dredgeQueen3dCenter.x, 0, this.dredgeQueen3dCenter.z);
    this.dredgeQueen3dModel.visible = this.started || this.hulkPresent;
    for (const [id, mesh] of this.dredgeQueen3dMeshes) {
      const enemy = components.find((candidate) => candidate.bossComponentId === id);
      const damaged = this.hulkPresent || this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= DREDGE_QUEEN_DAMAGE_THRESHOLD);
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = damaged ? 1 : 0;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.set(damaged ? DREDGE_QUEEN_3D_COMPONENTS[id].damageColor : '#fff8e8');
      material.emissiveIntensity = damaged ? 3 : 2;
    }
  }

  private disposeDredgeQueen3d(nextState: DredgeQueen3dState): void {
    this.dredgeQueen3dLoadSerial += 1;
    if (this.dredgeQueen3dModel) {
      this.group.remove(this.dredgeQueen3dModel);
      disposeObject3D(this.dredgeQueen3dModel);
      this.dredgeQueen3dModel = undefined;
    }
    this.dredgeQueen3dMeshes.clear();
    this.dredgeQueen3dState = nextState;
    this.publishDredgeQueen3d();
  }

  private publishDredgeQueen3d(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.dataset.dredgeQueen3dState = this.dredgeQueen3dState;
    canvas.dataset.dredgeQueen3dSource = this.dredgeQueen3dState === 'ready' ? 'glb' : 'placeholder';
    canvas.dataset.dredgeQueen3dMounted = String(this.dredgeQueen3dState === 'ready' && this.dredgeQueen3dModel?.visible === true);
    canvas.dataset.dredgeQueen3dPresentation = this.hulkPresent ? 'hulk' : this.started ? 'fight' : 'hidden';
    canvas.dataset.dredgeQueen3dDamageStates = JSON.stringify(Object.fromEntries(COMPONENT_IDS.map((id) => {
      const enemy = this.component(id);
      const damaged = this.hulkPresent || this.destroyed.has(id) || Boolean(enemy && enemy.currentHp / Math.max(1, enemy.maxHp) <= DREDGE_QUEEN_DAMAGE_THRESHOLD);
      return [id, damaged ? 'broken' : 'intact'];
    })));
  }

  private persistWreck(): void {
    // Storage failures stay non-fatal inside the store; the current run keeps the hulk either way.
    this.persistence.writeAtCeremony({ x: this.anchor.x, z: this.anchor.z });
  }

  private restorePersistentWreck(): void {
    const saved = this.persistence.readAtBirth();
    if (!saved) return;
    this.anchor.set(saved.x, 0, saved.z);
    this.persistentWreck = true;
    this.hulkPresent = true;
    this.act = 3;
  }
}

function componentOffset(id: ComponentId): { x: number; z: number } {
  if (id === 'paddle_port') return { x: -0.3, z: -2.4 };
  if (id === 'paddle_starboard') return { x: -0.3, z: 2.4 };
  if (id === 'hold') return { x: 1.8, z: 0 };
  return { x: -3.2, z: 0 };
}

function componentLabel(id: ComponentId): string {
  if (id === 'paddle_port') return 'PORT PADDLE';
  if (id === 'paddle_starboard') return 'STARBOARD PADDLE';
  return id.toUpperCase();
}

function componentColor(id: ComponentId): string {
  if (id === 'claw') return '#5b8a8a';
  if (id === 'hold') return '#7f2633';
  return '#c4883a';
}

function box(width: number, height: number, depth: number, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color, roughness: 0.76, metalness: 0.08 }));
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(radius: number, height: number, color: string, x: number, y: number, z: number, rotateZ = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.12 }));
  mesh.position.set(x, y, z);
  mesh.rotation.z = rotateZ;
  return mesh;
}

function quittingSkiff(): THREE.Group {
  const skiff = new THREE.Group();
  skiff.name = 'DredgeQueen.CrewRowsOffWarm';
  const portOar = box(3.4, 0.1, 0.12, '#f0cf83', -0.1, 0.72, 0);
  const starboardOar = box(3.4, 0.1, 0.12, '#f0cf83', 0.15, 0.72, 0);
  portOar.rotation.y = 0.52;
  starboardOar.rotation.y = -0.52;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshStandardMaterial({ color: '#f0ad62', roughness: 0.8 }));
  const bow = new THREE.Mesh(new THREE.ConeGeometry(0.68, 1.35, 3), new THREE.MeshStandardMaterial({ color: '#a85e32', roughness: 0.8 }));
  head.position.set(0, 1.45, 0);
  bow.position.set(1.85, 0.38, 0);
  bow.rotation.z = -Math.PI / 2;
  skiff.add(
    box(3, 0.42, 1.25, '#8b4d2f', 0, 0.32, 0),
    box(3.1, 0.24, 0.18, '#d08a4d', 0, 0.68, -0.58),
    box(3.1, 0.24, 0.18, '#d08a4d', 0, 0.68, 0.58),
    box(0.48, 0.78, 0.45, '#c76b3a', 0, 1.02, 0),
    box(1.45, 0.06, 0.08, '#d8eee9', -2.2, 0.12, -0.28),
    box(1.45, 0.06, 0.08, '#d8eee9', -2.2, 0.12, 0.28),
    portOar,
    starboardOar,
    head,
    bow,
  );
  return skiff;
}

function counterSprite(): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 96;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(4.8, 1.45, 1);
  sprite.renderOrder = 20;
  sprite.userData.counterCanvas = canvas;
  renderCounter(sprite, 0);
  return sprite;
}

function labelSprite(text: string, accent: string, width: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 96;
  const context = canvas.getContext('2d')!;
  context.fillStyle = '#211a16';
  context.strokeStyle = accent;
  context.lineWidth = 8;
  context.beginPath();
  context.roundRect(5, 5, canvas.width - 10, canvas.height - 10, 14);
  context.fill();
  context.stroke();
  context.fillStyle = '#fff3cf';
  context.font = 'bold 34px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(width, 1.05, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function renderCounter(sprite: THREE.Sprite, value: number): void {
  const canvas = sprite.userData.counterCanvas as HTMLCanvasElement | undefined;
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#2b2119';
  context.strokeStyle = '#f3c66d';
  context.lineWidth = 7;
  context.beginPath();
  context.roundRect(5, 5, canvas.width - 10, canvas.height - 10, 16);
  context.fill();
  context.stroke();
  context.fillStyle = '#fff0b8';
  context.font = 'bold 38px Georgia, serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(`HOLD ${value} / ${Balance.dredgeQueen.lootUnits}`, canvas.width / 2, canvas.height / 2 + 1);
  const material = sprite.material as THREE.SpriteMaterial;
  if (material.map) material.map.needsUpdate = true;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
