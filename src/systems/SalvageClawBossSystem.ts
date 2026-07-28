import * as THREE from 'three';
import type { ClaimJumperEnemy, EnemySpawnParams } from '../entities/Enemy';
import { Balance } from '../game/Balance';
import type { SalvageClawCarcassPayload } from '../game/TileStateStore';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import { disposeObject3D } from '../utils/dispose';
import type { BuildingTarget } from './TargetingSystem';

const VARIANT = 'salvage_claw';
const CORSAIR_VARIANT = 'scrap_corsair';
const GRAPPLE_IDS = ['grapple_port', 'grapple_starboard'] as const;
type GrappleId = typeof GRAPPLE_IDS[number];
type ComponentId = GrappleId | 'winch' | 'anchor_feet';
const COMPONENT_IDS = [...GRAPPLE_IDS, 'winch', 'anchor_feet'] as const;
const MODEL_URL = new URL('../../assets/pilots/salvage-claw-3d/salvage-claw-detail-opus5.glb', import.meta.url).href;
const MODEL_TRIANGLES = 30_100;
const MODEL_COMPONENTS = {
  crown: 'Landing_DarkCrown',
  winch: 'Landing_SprungWinch',
  anchor_feet: 'Landing_SettledAnchorFeet',
} as const;
type ModelComponent = keyof typeof MODEL_COMPONENTS;
type ModelState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';

export type SalvageClawPersistence = Readonly<{
  readAtBirth: () => SalvageClawCarcassPayload | null;
  writeAtCeremony: (payload: SalvageClawCarcassPayload) => void;
}>;

export type SalvageClawBossDiagnostics = {
  active: boolean;
  act: 0 | 1 | 2 | 3;
  crown: 'hidden' | 'orbit' | 'descending' | 'dark';
  winch: 'hidden' | 'intact' | 'broken';
  anchorFeet: 'hidden' | 'intact' | 'broken';
  theftTicks: number;
  stolenPickups: number;
  stolenGold: number;
  tagMarkers: number;
  debrisTelegraphed: boolean;
  debrisImpacts: number;
  grappleAnchors: number;
  grappleLines: number;
  corsairsRappelled: number;
  lift: null | { id: string; family: string; index: number; progress: number; height: number };
  buildingsDropped: number;
  lastDroppedHp: number | null;
  buildingsLiftedAway: number;
  clawPlayerTargets: 0;
  crewDescending: boolean;
  crewDescended: number;
  boltTaken: boolean;
  carcassPresent: boolean;
  persistentCarcass: boolean;
  ledgerEvents: readonly string[];
};

type StolenPickup = { position: THREE.Vector3; amount: number };

/** E8's component boss: paperwork first, then a crown, a winch, and committed feet. */
export class SalvageClawBossSystem {
  readonly group = new THREE.Group();
  private readonly platform = new THREE.Group();
  private readonly primitive = new THREE.Group();
  private readonly tagMarkers = Array.from({ length: Balance.salvageClaw.tagCap }, () => tagMarker());
  private readonly grappleLines = GRAPPLE_IDS.map(() => line('#8b7d3c'));
  private readonly debrisArc = line('#d95f32');
  private readonly debrisRing = new THREE.Mesh(
    new THREE.RingGeometry(1.5, 1.8, 28),
    new THREE.MeshBasicMaterial({ color: '#d95f32', transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false }),
  );
  private readonly liftLine = line('#f5e6c8');
  private readonly liftProxy = box(1, 0.8, 1, '#7a5132');
  private readonly crewMarkers = Array.from({ length: 3 }, (_, index) => box(0.35, 0.75, 0.35, '#5b8a8a', index - 1, 0, 0));
  private readonly anchor = new THREE.Vector3(0, 0, 12);
  private readonly destroyed = new Set<ComponentId>();
  private readonly ledgerEvents: string[] = [];
  private act: 0 | 1 | 2 | 3 = 0;
  private started = false;
  private nextTheftAt = Number.POSITIVE_INFINITY;
  private theftTicks = 0;
  private stolenPickups = 0;
  private stolenGold = 0;
  private tagCount = 0;
  private tagCursor = 0;
  private nextDebrisAt = Number.POSITIVE_INFINITY;
  private debrisEndsAt = Number.POSITIVE_INFINITY;
  private debrisTarget: BuildingTarget | null = null;
  private debrisImpacts = 0;
  private corsairsRappelled = 0;
  private act2StartedAt = Number.POSITIVE_INFINITY;
  private nextLiftAt = Number.POSITIVE_INFINITY;
  private liftStartedAt = Number.POSITIVE_INFINITY;
  private liftEndsAt = Number.POSITIVE_INFINITY;
  private liftTarget: BuildingTarget | null = null;
  private buildingsDropped = 0;
  private lastDroppedHp: number | null = null;
  private buildingsLiftedAway = 0;
  private crewStartedAt = Number.POSITIVE_INFINITY;
  private crewDescended = 0;
  private boltTaken = false;
  private carcassPresent = false;
  private persistentCarcass = false;
  private lastAt = 0;
  private modelState: ModelState;
  private modelLoadSerial = 0;
  private model?: THREE.Object3D;
  private readonly modelMeshes = new Map<ModelComponent, THREE.Mesh>();

  constructor(
    private readonly enemies: () => readonly ClaimJumperEnemy[],
    private readonly spawnEnemy: (position: THREE.Vector3, params: EnemySpawnParams) => ClaimJumperEnemy | null | undefined,
    private readonly recycleEnemy: (enemy: ClaimJumperEnemy) => void,
    private readonly stealPickup: () => StolenPickup | null,
    private readonly findBuilding: () => BuildingTarget | null,
    private readonly suspendBuilding: (target: BuildingTarget, suspended: boolean) => void,
    private readonly damageBuilding: (target: BuildingTarget, amount: number) => number | null,
    private readonly removeBuilding: (target: BuildingTarget, at: number) => boolean,
    private readonly announce: (text: string, title: string) => void,
    private readonly enabled: boolean,
    private readonly persistence: SalvageClawPersistence,
  ) {
    this.modelState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
    this.group.name = 'SalvageClaw.Placeholder';
    this.buildPresentation();
    if (enabled) this.restorePersistentCarcass();
  }

  onWaveStarted(wave: number, at: number): void {
    if (!this.enabled || this.persistentCarcass || this.carcassPresent) return;
    this.restoreFromLiveComponents(at);
    if (!this.started && wave >= Balance.salvageClaw.arriveWave - Balance.salvageClaw.dreadWaves) this.startDread(at);
    if (wave >= Balance.salvageClaw.arriveWave && this.act === 0) this.startAct1(at);
  }

  onComponentKilled(id: string | undefined, position: THREE.Vector3, at: number): void {
    if (!this.enabled || !COMPONENT_IDS.includes(id as ComponentId)) return;
    this.restoreFromLiveComponents(at);
    const componentId = id as ComponentId;
    this.destroyed.add(componentId);
    if (GRAPPLE_IDS.includes(componentId as GrappleId) && GRAPPLE_IDS.every((grapple) => this.destroyed.has(grapple))) this.startAct2(at);
    else if (componentId === 'winch' && this.act === 2) this.startAct3(at);
    else if (componentId === 'anchor_feet' && this.act === 3) this.finishFight(position, at);
  }

  update(at: number): void {
    this.lastAt = at;
    if (!this.persistentCarcass && !this.carcassPresent) this.restoreFromLiveComponents(at);
    if (!this.enabled || this.persistentCarcass || !this.started) return this.syncPresentation();
    if (this.act === 0) this.updateTheft(at);
    if (this.act === 1) this.updateDebris(at);
    if (this.act === 2) this.updateLift(at);
    if (this.carcassPresent) this.updateWarmQuit(at);
    this.syncPresentation();
  }

  diagnostics(): SalvageClawBossDiagnostics {
    const lift = this.liftTarget ? {
      id: this.liftTarget.id,
      family: this.liftTarget.family,
      index: this.liftTarget.index,
      progress: round2(this.liftProgress),
      height: round2(this.liftHeight),
    } : null;
    return {
      active: this.started,
      act: this.act,
      crown: !this.started || this.act === 0 ? 'hidden' : this.act === 1 ? 'orbit' : this.act === 2 ? 'descending' : 'dark',
      winch: this.act < 2 ? 'hidden' : this.destroyed.has('winch') || this.carcassPresent ? 'broken' : 'intact',
      anchorFeet: this.act < 3 ? 'hidden' : this.destroyed.has('anchor_feet') || this.carcassPresent ? 'broken' : 'intact',
      theftTicks: this.theftTicks,
      stolenPickups: this.stolenPickups,
      stolenGold: this.stolenGold,
      tagMarkers: Math.min(this.tagCount, this.tagMarkers.length),
      debrisTelegraphed: this.debrisTarget !== null,
      debrisImpacts: this.debrisImpacts,
      grappleAnchors: GRAPPLE_IDS.filter((id) => !this.destroyed.has(id)).length,
      grappleLines: GRAPPLE_IDS.filter((id) => !this.destroyed.has(id) && this.act === 1).length,
      corsairsRappelled: this.corsairsRappelled,
      lift,
      buildingsDropped: this.buildingsDropped,
      lastDroppedHp: this.lastDroppedHp,
      buildingsLiftedAway: this.buildingsLiftedAway,
      clawPlayerTargets: 0,
      crewDescending: this.carcassPresent && this.crewDescended < this.crewMarkers.length,
      crewDescended: this.crewDescended,
      boltTaken: this.boltTaken,
      carcassPresent: this.carcassPresent,
      persistentCarcass: this.persistentCarcass,
      ledgerEvents: [...this.ledgerEvents],
    };
  }

  reset(): void {
    if (this.liftTarget) this.suspendBuilding(this.liftTarget, false);
    this.disposeModel(performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off');
    for (const enemy of this.liveBossComponents()) this.recycleEnemy(enemy);
    for (const enemy of this.liveCorsairs()) this.recycleEnemy(enemy);
    this.act = 0;
    this.started = false;
    this.nextTheftAt = this.nextDebrisAt = this.debrisEndsAt = this.nextLiftAt = this.liftStartedAt = this.liftEndsAt = Number.POSITIVE_INFINITY;
    this.act2StartedAt = this.crewStartedAt = Number.POSITIVE_INFINITY;
    this.theftTicks = this.stolenPickups = this.stolenGold = this.tagCount = this.tagCursor = 0;
    this.debrisTarget = this.liftTarget = null;
    this.debrisImpacts = this.corsairsRappelled = this.buildingsDropped = this.buildingsLiftedAway = 0;
    this.lastDroppedHp = null;
    this.crewDescended = 0;
    this.boltTaken = this.carcassPresent = this.persistentCarcass = false;
    this.lastAt = 0;
    this.destroyed.clear();
    this.ledgerEvents.length = 0;
    for (const tag of this.tagMarkers) tag.visible = false;
    if (this.enabled) this.restorePersistentCarcass();
    this.syncPresentation();
  }

  dispose(): void {
    this.disposeModel('disposed');
    disposeObject3D(this.group);
    this.group.clear();
  }

  private startDread(at: number): void {
    this.started = true;
    this.nextTheftAt = at + Balance.salvageClaw.theftIntervalSeconds;
    this.announce('Small things begin leaving upward. Each absence has a receipt.', 'THE PAPERWORK');
  }

  private updateTheft(at: number): void {
    if (at < this.nextTheftAt) return;
    this.nextTheftAt = at + Balance.salvageClaw.theftIntervalSeconds;
    this.theftTicks += 1;
    const stolen = this.stealPickup();
    if (!stolen) return;
    this.stolenPickups += 1;
    this.stolenGold += stolen.amount;
    this.placeTag(stolen.position);
    this.ledgerEvents.push(`claw-stamp:pickup:${stolen.amount}`);
  }

  private startAct1(at: number): void {
    this.started = true;
    this.act = 1;
    this.nextDebrisAt = at;
    for (const [index, id] of GRAPPLE_IDS.entries()) {
      const x = this.anchor.x + (index === 0 ? -5 : 5);
      this.spawnComponent(id, new THREE.Vector3(x, 0, this.anchor.z), Balance.salvageClaw.grappleHp, 'GRAPPLE ANCHOR', 'e8-mare-claim:salvage-claw-grapples', 2);
    }
    for (let index = 0; index < Balance.salvageClaw.corsairCount; index += 1) {
      const x = this.anchor.x + (index - (Balance.salvageClaw.corsairCount - 1) / 2) * 2.4;
      const corsair = this.spawnEnemy(new THREE.Vector3(x, 0, this.anchor.z + 1.5), {
        hpScale: 1,
        speedScale: 1.05,
        visualScale: 1,
        variantId: CORSAIR_VARIANT,
        variantLabel: 'Scrap Corsair',
        tint: '#8b7d3c',
      });
      if (corsair) {
        corsair.scriptMoveTo(x, this.anchor.z - 8, corsair.moveSpeed, { ignoreTerrain: true });
        this.corsairsRappelled += 1;
      }
    }
    this.announce('Cut the grapple anchors. The Crown is still too high to hit.', 'THE CROWN');
  }

  private updateDebris(at: number): void {
    if (!this.debrisTarget && at >= this.nextDebrisAt) {
      this.debrisTarget = this.findBuilding();
      this.debrisEndsAt = at + Balance.salvageClaw.debrisTelegraphSeconds;
      if (!this.debrisTarget) this.nextDebrisAt = at + Balance.salvageClaw.debrisIntervalSeconds;
    }
    if (!this.debrisTarget || at < this.debrisEndsAt) return;
    this.damageBuilding(this.debrisTarget, Balance.salvageClaw.debrisDamage);
    this.debrisImpacts += 1;
    this.debrisTarget = null;
    this.nextDebrisAt = at + Balance.salvageClaw.debrisIntervalSeconds;
  }

  private startAct2(at: number): void {
    if (this.act !== 1) return;
    this.act = 2;
    this.debrisTarget = null;
    this.act2StartedAt = at;
    this.nextLiftAt = at;
    this.spawnComponent('winch', this.anchor.clone(), Balance.salvageClaw.winchHp, 'WINCH', 'e8-mare-claim:salvage-claw-winch', 1);
    this.announce('The Winch enters weapon range. Break it while the building is still on the line.', 'THE WINCH');
  }

  private updateLift(at: number): void {
    if (!this.liftTarget && at >= this.nextLiftAt) {
      this.liftTarget = this.findBuilding();
      if (this.liftTarget) {
        this.suspendBuilding(this.liftTarget, true);
        this.liftStartedAt = at;
        this.liftEndsAt = at + Balance.salvageClaw.liftSeconds;
      } else {
        this.nextLiftAt = at + Balance.salvageClaw.liftCooldownSeconds;
      }
    }
    if (!this.liftTarget || at < this.liftEndsAt) return;
    const target = this.liftTarget;
    if (this.removeBuilding(target, at)) {
      this.buildingsLiftedAway += 1;
      this.placeTag(target.position);
      this.ledgerEvents.push(`salvage-tag:${target.family}:${target.index}`);
    }
    this.clearLift(at);
  }

  private startAct3(at: number): void {
    if (this.liftTarget) {
      const damage = Math.min(Balance.salvageClaw.dropDamage, Math.max(0, this.liftTarget.hp - 1));
      const hp = damage > 0 ? this.damageBuilding(this.liftTarget, damage) : this.liftTarget.hp;
      if (hp !== null && hp > 0) {
        this.buildingsDropped += 1;
        this.lastDroppedHp = round2(hp);
        this.ledgerEvents.push(`drop-savable:${this.liftTarget.family}:${this.liftTarget.index}:${round2(hp)}`);
      }
    }
    this.clearLift(at);
    this.act = 3;
    this.spawnComponent('anchor_feet', this.anchor.clone(), Balance.salvageClaw.feetHp, 'ANCHOR-FEET', 'e8-mare-claim:salvage-claw-feet', 1);
    this.announce('The Crown goes dark. The feet commit. The siege turns around.', 'THE ANCHOR-FEET');
  }

  private finishFight(position: THREE.Vector3, at: number): void {
    this.anchor.set(position.x, 0, position.z);
    this.carcassPresent = true;
    for (const enemy of this.liveCorsairs()) this.recycleEnemy(enemy);
    this.crewStartedAt = at;
    this.ledgerEvents.push('crew-descends:good-order');
    this.persistence.writeAtCeremony({ x: this.anchor.x, z: this.anchor.z });
    this.announce('The crew descends in good order. The Claw stays, kept until it becomes a place.', 'THE WARM QUIT');
  }

  private updateWarmQuit(at: number): void {
    const progress = THREE.MathUtils.clamp((at - this.crewStartedAt) / Balance.salvageClaw.crewQuitSeconds, 0, 1);
    this.crewDescended = Math.min(this.crewMarkers.length, Math.floor(progress * (this.crewMarkers.length + 1)));
    if (progress < 1 || this.boltTaken) return;
    this.crewDescended = this.crewMarkers.length;
    this.boltTaken = true;
    this.ledgerEvents.push('one-bolt:for-the-ledger');
  }

  private clearLift(at: number): void {
    if (this.liftTarget) this.suspendBuilding(this.liftTarget, false);
    this.liftTarget = null;
    this.liftStartedAt = this.liftEndsAt = Number.POSITIVE_INFINITY;
    this.nextLiftAt = at + Balance.salvageClaw.liftCooldownSeconds;
  }

  private spawnComponent(id: ComponentId, position: THREE.Vector3, hp: number, label: string, groupId: string, groupSize: number): void {
    this.spawnEnemy(position, {
      hpScale: hp / Balance.enemy.hp,
      speedScale: 1,
      visualScale: 1.25,
      contactDamageScale: 0,
      buildingDamageScale: 0,
      supportBuildingDamageScale: 0,
      heroPursuitRange: 0,
      variantId: VARIANT,
      variantLabel: "The Salvage King's Claw",
      tint: id === 'winch' ? '#c4883a' : id === 'anchor_feet' ? '#5b8a8a' : '#8b7d3c',
      bossGroupId: groupId,
      bossGroupSize: groupSize,
      bossGroupTotalHp: hp * groupSize,
      bossComponentId: id,
      bossComponentLabel: label,
      bossDegradeSpeedMult: 1,
    })?.scriptMoveTo(position.x, position.z, 0, { ignoreTerrain: true });
  }

  private liveBossComponents(): ClaimJumperEnemy[] {
    return this.enemies().filter((enemy) => enemy.isAlive && enemy.variantId === VARIANT);
  }

  private liveCorsairs(): ClaimJumperEnemy[] {
    return this.enemies().filter((enemy) => enemy.isAlive && enemy.variantId === CORSAIR_VARIANT && enemy.variantLabel === 'Scrap Corsair');
  }

  private placeTag(position: THREE.Vector3): void {
    const tag = this.tagMarkers[this.tagCursor % this.tagMarkers.length]!;
    this.tagCursor += 1;
    this.tagCount += 1;
    tag.position.set(position.x, 0.12, position.z);
    tag.visible = true;
  }

  private get liftProgress(): number {
    return this.liftTarget ? THREE.MathUtils.clamp((this.lastAt - this.liftStartedAt) / Balance.salvageClaw.liftSeconds, 0, 1) : 0;
  }

  private get liftHeight(): number {
    return this.liftProgress * Balance.salvageClaw.liftHeight;
  }

  private get platformY(): number {
    if (this.carcassPresent || this.persistentCarcass || this.act === 3) return 0;
    if (this.act === 2) {
      const progress = THREE.MathUtils.clamp((this.lastAt - this.act2StartedAt) / Balance.salvageClaw.descentSeconds, 0, 1);
      return THREE.MathUtils.lerp(Balance.salvageClaw.orbitHeight, Balance.salvageClaw.winchHeight, progress);
    }
    return Balance.salvageClaw.orbitHeight;
  }

  private buildPresentation(): void {
    this.primitive.add(
      cylinder(3.6, 0.75, '#66513b', 0, 1.8, 0),
      cylinder(1.4, 1.4, '#c4883a', 0, 1, 0, Math.PI / 2),
      box(5.8, 0.32, 0.45, '#8b7d3c', 0, 0.4, 0),
      box(0.45, 1.7, 5.8, '#5b8a8a', 0, 0.7, 0),
      box(4.8, 0.85, 4.8, '#4f6570', 0, 2.75, 0),
    );
    this.platform.add(this.primitive);
    this.debrisRing.rotation.x = -Math.PI / 2;
    this.debrisRing.position.y = 0.08;
    this.group.add(this.platform, this.debrisArc, this.debrisRing, this.liftLine, this.liftProxy, ...this.grappleLines, ...this.tagMarkers, ...this.crewMarkers);
    this.syncPresentation();
  }

  private syncPresentation(): void {
    const visible = (this.started && this.act > 0) || this.carcassPresent || this.persistentCarcass;
    if (visible) this.ensureModel();
    const y = this.platformY;
    this.platform.position.set(this.anchor.x, y, this.anchor.z);
    this.platform.visible = visible;
    this.primitive.visible = !(this.modelState === 'ready' && this.model?.visible);
    if (this.model) {
      this.model.position.set(this.anchor.x, y, this.anchor.z);
      this.model.visible = visible;
      this.updateModelMorphs();
    }

    for (const [index, id] of GRAPPLE_IDS.entries()) {
      const x = this.anchor.x + (index === 0 ? -5 : 5);
      const target = new THREE.Vector3(x, 0.2, this.anchor.z);
      setLine(this.grappleLines[index]!, new THREE.Vector3(this.anchor.x, y + 1.2, this.anchor.z), target);
      this.grappleLines[index]!.visible = this.act === 1 && !this.destroyed.has(id);
    }

    const debrisTarget = this.debrisTarget?.position;
    this.debrisArc.visible = Boolean(debrisTarget && this.act === 1);
    this.debrisRing.visible = Boolean(debrisTarget && this.act === 1);
    if (debrisTarget) {
      setLine(this.debrisArc, new THREE.Vector3(this.anchor.x, y + 2.5, this.anchor.z), debrisTarget);
      this.debrisRing.position.set(debrisTarget.x, 0.08, debrisTarget.z);
    }

    const lift = this.liftTarget;
    this.liftLine.visible = Boolean(lift && this.act === 2);
    this.liftProxy.visible = Boolean(lift && this.act === 2);
    if (lift) {
      const liftY = lift.position.y + this.liftHeight;
      setLine(this.liftLine, new THREE.Vector3(this.anchor.x, y + 0.5, this.anchor.z), new THREE.Vector3(lift.position.x, liftY, lift.position.z));
      this.liftProxy.position.set(lift.position.x, liftY, lift.position.z);
      this.liftProxy.scale.set(Math.max(0.8, lift.halfX * 2), 1, Math.max(0.8, lift.halfZ * 2));
    }

    const crewProgress = this.carcassPresent
      ? THREE.MathUtils.clamp((this.lastAt - this.crewStartedAt) / Balance.salvageClaw.crewQuitSeconds, 0, 1)
      : this.persistentCarcass ? 1 : 0;
    for (const [index, crew] of this.crewMarkers.entries()) {
      crew.visible = this.carcassPresent && index >= this.crewDescended;
      crew.position.set(this.anchor.x + index - 1, THREE.MathUtils.lerp(4.5, 0.5, crewProgress), this.anchor.z + 3.2);
    }
    this.publishModelState();
  }

  private ensureModel(): void {
    if (this.modelState !== 'off' && this.modelState !== 'disposed') return;
    const serial = ++this.modelLoadSerial;
    this.modelState = 'loading';
    this.publishModelState();
    void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      if (serial !== this.modelLoadSerial) return;
      new GLTFLoader().load(MODEL_URL, ({ scene }) => {
        if (serial !== this.modelLoadSerial) return disposeObject3D(scene);
        const meshes = this.inspectModel(scene);
        if (!meshes) {
          disposeObject3D(scene);
          this.modelState = 'failed';
          return this.publishModelState();
        }
        scene.name = 'SalvageClaw3d';
        scene.scale.setScalar(0.78);
        this.model = scene;
        this.modelMeshes.clear();
        for (const [id, mesh] of meshes) this.modelMeshes.set(id, mesh);
        this.group.add(scene);
        this.modelState = 'ready';
        this.syncPresentation();
      }, undefined, () => {
        if (serial !== this.modelLoadSerial) return;
        this.modelState = 'failed';
        this.publishModelState();
      });
    }, () => {
      if (serial !== this.modelLoadSerial) return;
      this.modelState = 'failed';
      this.publishModelState();
    });
  }

  private inspectModel(model: THREE.Object3D): Map<ModelComponent, THREE.Mesh> | null {
    const meshes = new Map<ModelComponent, THREE.Mesh>();
    const materials = new Set<THREE.Material>();
    let meshCount = 0;
    let triangles = 0;
    model.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      meshCount += 1;
      triangles += Math.floor((mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position')?.count ?? 0) / 3);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
      for (const id of Object.keys(MODEL_COMPONENTS) as ModelComponent[]) {
        if (mesh.name === id && mesh.morphTargetDictionary?.[MODEL_COMPONENTS[id]] === 0 && mesh.morphTargetInfluences?.length === 1) meshes.set(id, mesh);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    if (meshCount !== 3 || meshes.size !== 3 || materials.size !== 1 || triangles !== MODEL_TRIANGLES) return null;
    for (const mesh of meshes.values()) mesh.material = (mesh.material as THREE.MeshStandardMaterial).clone();
    for (const material of materials) material.dispose();
    return meshes;
  }

  private updateModelMorphs(): void {
    const landed = this.act === 3 || this.carcassPresent || this.persistentCarcass;
    for (const [id, mesh] of this.modelMeshes) {
      const morph = id === 'winch' ? this.destroyed.has('winch') || landed : id === 'anchor_feet' ? landed : landed;
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = morph ? 1 : 0;
    }
  }

  private disposeModel(nextState: ModelState): void {
    this.modelLoadSerial += 1;
    if (this.model) {
      this.group.remove(this.model);
      disposeObject3D(this.model);
      this.model = undefined;
    }
    this.modelMeshes.clear();
    this.modelState = nextState;
    this.publishModelState();
  }

  private publishModelState(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.dataset.salvageClaw3dState = this.modelState;
    canvas.dataset.salvageClaw3dSource = this.modelState === 'ready' ? 'glb' : 'placeholder';
    canvas.dataset.salvageClaw3dMounted = String(this.modelState === 'ready' && this.model?.visible === true);
    canvas.dataset.salvageClaw3dPresentation = this.carcassPresent || this.persistentCarcass ? 'yard' : this.act === 3 ? 'landed' : this.act === 2 ? 'descent' : this.act === 1 ? 'orbit' : 'hidden';
  }

  private restorePersistentCarcass(): void {
    const saved = this.persistence.readAtBirth();
    if (!saved) return;
    this.anchor.set(saved.x, 0, saved.z);
    this.act = 3;
    this.carcassPresent = true;
    this.persistentCarcass = true;
    this.crewDescended = this.crewMarkers.length;
    this.boltTaken = true;
    this.destroyed.add('winch');
    this.destroyed.add('anchor_feet');
  }

  private restoreFromLiveComponents(at: number): void {
    if (!this.enabled) return;
    const components = this.liveBossComponents();
    if (components.length === 0) return;
    const ids = new Set(components.map((enemy) => enemy.bossComponentId));
    this.started = true;
    if (ids.has('anchor_feet') && this.act < 3) {
      this.act = 3;
      this.destroyed.add('winch');
      for (const id of GRAPPLE_IDS) this.destroyed.add(id);
    } else if (ids.has('winch') && this.act < 2) {
      this.act = 2;
      this.act2StartedAt = at;
      this.nextLiftAt = at;
      for (const id of GRAPPLE_IDS) this.destroyed.add(id);
    } else if (this.act === 0) {
      this.act = 1;
      this.nextDebrisAt = at;
      for (const id of GRAPPLE_IDS) if (!ids.has(id)) this.destroyed.add(id);
    }
  }
}

function box(width: number, height: number, depth: number, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.12 }));
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(radius: number, height: number, color: string, x: number, y: number, z: number, rotateZ = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 16), new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.18 }));
  mesh.position.set(x, y, z);
  mesh.rotation.z = rotateZ;
  return mesh;
}

function line(color: string): THREE.Line {
  return new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.72 }));
}

function setLine(target: THREE.Line, from: THREE.Vector3, to: THREE.Vector3): void {
  target.geometry.setFromPoints([from, to]);
}

function tagMarker(): THREE.Group {
  const marker = new THREE.Group();
  marker.name = 'SalvageClaw.ClawStampTag';
  const paper = box(1.35, 0.06, 0.8, '#f5e6c8');
  const claw = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 6, 12, Math.PI * 1.4), new THREE.MeshBasicMaterial({ color: '#7f2633' }));
  claw.rotation.x = Math.PI / 2;
  claw.position.y = 0.06;
  marker.add(paper, claw);
  marker.visible = false;
  return marker;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
