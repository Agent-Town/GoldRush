import * as THREE from 'three';
import type { ClaimJumperEnemy, EnemySpawnParams } from '../entities/Enemy';
import { Balance } from '../game/Balance';
import { performanceTierDiagnostics } from '../game/PerformanceTier';
import type { OldDiggerGentlePayload } from '../game/TileStateStore';
import { disposeObject3D } from '../utils/dispose';

const VARIANT = 'old_digger';
const HULL_ID = 'hull';
const DRONE_VARIANT = 'maintenance_drone';
const DRONE_LABEL = 'Maintenance Drone';
const HAZARD_SOURCE_ID = -7;
const OLD_DIGGER_3D_URL = new URL('../../assets/pilots/old-digger-3d/old-digger.glb', import.meta.url).href;
const OLD_DIGGER_3D_TRIANGLES = 7_192;
// E9 §BOSS state law (asset contract): working machine → intact gentle reprogramming.
// No damage or kill morph EXISTS — the model itself refuses the wrong verb.
const OLD_DIGGER_3D_COMPONENTS = {
  bucket_wheels: 'Redemption_GentleBuckets',
  gantry: 'Redemption_SafeGantry',
  tape_deck: 'Redemption_TealTapeDeck',
} as const;
type OldDigger3dNode = keyof typeof OLD_DIGGER_3D_COMPONENTS;
const OLD_DIGGER_3D_NODES = Object.keys(OLD_DIGGER_3D_COMPONENTS) as OldDigger3dNode[];
type OldDigger3dState = 'off' | 'loading' | 'ready' | 'lite' | 'failed' | 'disposed';
const WAYPOINT_EPSILON = 0.8;

export type SurveyPoint = Readonly<{ x: number; z: number }>;

/**
 * THE SWAP consumes a playbook recording (PB-01 tape law): the player's own
 * recorded work, resolved from the profile shelf — or, when none exists, a
 * synthesized survey of the base as built. The fight never blocks on a tape.
 */
export type OldDiggerTape = Readonly<{ source: 'recording' | 'survey'; name: string; hash: string }>;

export type OldDiggerSwapPhase = 'none' | 'reading' | 'redig' | 'done';

/** The gentle flag lives on TileStateStore (W6/TP-01 precedent): read at birth, written once at the swap ceremony. */
export type OldDiggerGentlePersistence = Readonly<{
  readAtBirth: () => OldDiggerGentlePayload | null;
  writeAtCeremony: (payload: OldDiggerGentlePayload) => void;
}>;

export type OldDiggerBossDiagnostics = {
  active: boolean;
  act: 0 | 1 | 2 | 3;
  position: { x: number; z: number };
  surveying: boolean;
  surveyLeg: number;
  surveyLegs: number;
  lastLeg: { from: SurveyPoint; to: SurveyPoint } | null;
  structuresUnmade: number;
  unmakeSweeps: number;
  hullHp: number;
  hullMaxHp: number;
  hullFloorHp: number;
  damageMarks: number;
  killAttemptsAbsorbed: number;
  playerDamageEvents: number;
  boarded: boolean;
  deckProgress: number;
  atTapeDeck: boolean;
  hazardTicks: number;
  dronesAboard: number;
  dronesSpawned: number;
  dismounts: number;
  swapPhase: OldDiggerSwapPhase;
  redigging: boolean;
  tape: OldDiggerTape | null;
  archivedTape: OldDiggerTape | null;
  joinedFleet: boolean;
  gentle: boolean;
  persistentGentle: boolean;
};

/**
 * THE OLD DIGGER (E9 §BOSS, ratified choreography): the boss you cannot kill,
 * only teach. Breaks the component-boss house pattern on purpose — no
 * damage-gated acts, no kill path. Act 1 it UNMAKES (politely, via the build
 * system's own demolition), Act 2 you board it while it works, Act 3 the swap
 * reprograms it with the player's own recorded work.
 */
export class OldDiggerBossSystem {
  readonly group = new THREE.Group();
  private readonly machine = new THREE.Group();
  private readonly machinePrimitive = new THREE.Group();
  private readonly primitiveTapeDeck = box(0.9, 0.7, 0.9, '#6a4b35', 1.9, 2.35, 0);
  private readonly surveyMarker = new THREE.Mesh(
    new THREE.RingGeometry(Balance.oldDigger.unmakeRadius - 0.25, Balance.oldDigger.unmakeRadius, 32),
    new THREE.MeshBasicMaterial({ color: '#c4883a', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  );
  private act: 0 | 1 | 2 | 3 = 0;
  private started = false;
  private surveyIndex = 0;
  private surveyDirection: 1 | -1 = 1;
  private lastLeg: { from: SurveyPoint; to: SurveyPoint } | null = null;
  private nextUnmakeAt = Number.POSITIVE_INFINITY;
  private structuresUnmade = 0;
  private unmakeSweeps = 0;
  private lastHullHp: number | null = null;
  private damageMarks = 0;
  private killAttemptsAbsorbed = 0;
  private playerDamageEvents = 0;
  private boarded = false;
  private deckProgress = 0;
  private nextHazardAt = Number.POSITIVE_INFINITY;
  private hazardTicks = 0;
  private dronesSpawned = 0;
  private nextDroneRespawnAt = Number.POSITIVE_INFINITY;
  private dismounts = 0;
  private swapPhase: OldDiggerSwapPhase = 'none';
  private swapReadEndsAt = Number.POSITIVE_INFINITY;
  private redigTarget: SurveyPoint | null = null;
  private tape: OldDiggerTape | null = null;
  private archivedTape: OldDiggerTape | null = null;
  private gentle = false;
  private persistentGentle = false;
  private readonly restPosition = new THREE.Vector3();
  private lastAt = 0;
  private oldDigger3dState: OldDigger3dState;
  private oldDigger3dLoadSerial = 0;
  private oldDigger3dModel?: THREE.Object3D;
  private readonly oldDigger3dMeshes = new Map<OldDigger3dNode, THREE.Mesh>();

  constructor(
    private readonly enemies: () => readonly ClaimJumperEnemy[],
    private readonly spawnEnemy: (position: THREE.Vector3, params: EnemySpawnParams) => ClaimJumperEnemy | null | undefined,
    private readonly recycleEnemy: (enemy: ClaimJumperEnemy) => void,
    private readonly damageHero: (amount: number, sourceId: number) => boolean,
    /** Boarding slaves the rider to the machine and lands the dismount; the sim stays planar (rendering-only height law). */
    private readonly moveHero: (x: number, z: number) => void,
    /** Unmaking routes through the build system's own demolition path (law: no ad-hoc removal). Returns structures unmade. */
    private readonly unmakeStructuresNear: (position: { x: number; z: number }, radius: number, at: number) => number,
    private readonly announce: (text: string, title: string) => void,
    private readonly resolveTape: () => OldDiggerTape,
    private readonly surveyPath: readonly SurveyPoint[],
    private readonly enabled: boolean,
    private readonly persistence: OldDiggerGentlePersistence,
  ) {
    this.oldDigger3dState = performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off';
    this.group.name = 'OldDigger.Placeholder';
    this.buildPresentation();
    if (this.enabled) this.restorePersistentGentle();
  }

  /** Contract-hook per the DQ precedent: a boss-flagged run arrives with the wave clock, not a kill gate. */
  onWaveStarted(wave: number): void {
    if (!this.enabled || this.started || this.persistentGentle || wave < Balance.oldDigger.arriveWave) return;
    this.startRenovation();
  }

  /**
   * THE NO-KILL LAW: if any damage path ever zeroes the hull, the attempt is
   * absorbed — the machine does not notice. The fight cannot be won wrong.
   */
  onHullKilled(position: THREE.Vector3, at: number): void {
    if (!this.enabled || !this.started || this.gentle) return;
    this.killAttemptsAbsorbed += 1;
    const hull = this.spawnHull(position.clone());
    this.lastHullHp = hull?.currentHp ?? null;
    this.scriptSurveyMove(at);
  }

  update(at: number): void {
    const delta = Math.max(0, at - this.lastAt);
    this.lastAt = at;
    if (!this.enabled) return this.syncPresentation();
    if (this.persistentGentle) {
      const hull = this.hull();
      if (hull) this.recycleEnemy(hull);
      for (const drone of this.liveDrones()) this.recycleEnemy(drone);
      return this.syncPresentation();
    }
    if (!this.started) return this.syncPresentation();
    this.enforceNoKillLaw();
    if (this.act === 1 && this.swapPhase === 'none') this.updateRenovation(at);
    if (this.boarded && this.swapPhase === 'none') this.updateBoarding(at, delta);
    if (this.swapPhase === 'reading' || this.swapPhase === 'redig') this.updateSwap(at);
    this.syncPresentation();
  }

  /**
   * The player-facing verb seam (confirm intent, plain boot — no debug gate):
   * near the working machine it boards; aboard below the deck it dismounts
   * safely. The tape deck itself is Act 3's interaction.
   */
  tryInteract(position: THREE.Vector3, at: number): boolean {
    if (!this.enabled || !this.started || this.gentle || this.swapPhase !== 'none') return false;
    if (this.boarded) {
      if (this.deckProgress >= 1) {
        this.beginSwap(at);
        return true;
      }
      this.dismount();
      return true;
    }
    return this.tryBoard(position, at);
  }

  /** Act 3, THE SWAP: your own recorded work becomes the new tape. It pauses. Reads. */
  private beginSwap(at: number): void {
    this.tape = this.resolveTape();
    this.swapPhase = 'reading';
    this.act = 2;
    this.swapReadEndsAt = at + Balance.oldDigger.readSeconds;
    this.nextUnmakeAt = Number.POSITIVE_INFINITY;
    this.dismount();
    const hull = this.hull();
    if (hull) hull.scriptMoveTo(hull.position.x, hull.position.z, 0, { ignoreTerrain: true });
    this.announce('It pauses. It reads.', 'THE SWAP');
  }

  private updateSwap(at: number): void {
    const hull = this.hull();
    if (!hull) return;
    if (this.swapPhase === 'reading' && at >= this.swapReadEndsAt) {
      this.swapPhase = 'redig';
      // The whole saga holds its breath — and then it TURNS: its last correction, re-dug RIGHT.
      this.redigTarget = this.lastLeg?.from ?? this.surveyPath[0] ?? { x: hull.position.x, z: hull.position.z };
      hull.scriptMoveTo(this.redigTarget.x, this.redigTarget.z, Balance.oldDigger.reDigSpeed, { ignoreTerrain: true });
    }
    if (this.swapPhase === 'redig' && this.redigTarget
      && Math.hypot(hull.position.x - this.redigTarget.x, hull.position.z - this.redigTarget.z) <= WAYPOINT_EPSILON) {
      this.finishSwap(hull);
    }
  }

  /**
   * It joins the fleet (kept machine #5 — this one kept WORKING): hostility off
   * both ways (the hull leaves the enemy roster so the town stops shooting it),
   * the gentle model persists via TileStateStore, and the old tape goes to the
   * archive — annotated, never erased.
   */
  private finishSwap(hull: ClaimJumperEnemy): void {
    this.swapPhase = 'done';
    this.act = 3;
    this.gentle = true;
    this.restPosition.set(hull.position.x, 0, hull.position.z);
    this.recycleEnemy(hull);
    for (const drone of this.liveDrones()) this.recycleEnemy(drone);
    this.archivedTape = this.tape;
    this.persistence.writeAtCeremony({ x: this.restPosition.x, z: this.restPosition.z });
    this.announce('The old tape goes to the archive. It re-digs to the reeve’s charts now, gently, forever.', 'IT JOINS THE FLEET');
  }

  private tryBoard(position: THREE.Vector3, at: number): boolean {
    const hull = this.hull();
    if (!hull || this.act !== 1) return false;
    if (Math.hypot(hull.position.x - position.x, hull.position.z - position.z) > Balance.oldDigger.boardRadius) return false;
    this.boarded = true;
    this.deckProgress = 0;
    this.nextHazardAt = at + Balance.oldDigger.hazardIntervalSeconds;
    this.nextDroneRespawnAt = at + Balance.oldDigger.droneRespawnSeconds;
    for (let index = 0; index < Balance.oldDigger.droneCount; index += 1) this.spawnDrone(index);
    this.announce('Board it while it works. The tape deck waits at its heart.', 'THE BOARDING');
    return true;
  }

  /** Dismount is safe by law (Act 2 gate): the rider lands beside the machine, no fall, no damage. */
  dismount(): void {
    if (!this.boarded) return;
    this.boarded = false;
    this.deckProgress = 0;
    this.nextHazardAt = Number.POSITIVE_INFINITY;
    this.nextDroneRespawnAt = Number.POSITIVE_INFINITY;
    this.dismounts += 1;
    const hull = this.hull();
    if (hull) this.moveHero(hull.position.x + Balance.oldDigger.boardRadius * 0.75, hull.position.z + 1.5);
  }

  private updateBoarding(at: number, delta: number): void {
    const hull = this.hull();
    if (!hull) {
      this.boarded = false;
      return;
    }
    // The rider rides: slaved to the live machine while it keeps executing the survey.
    this.moveHero(hull.position.x, hull.position.z);
    this.deckProgress = Math.min(1, this.deckProgress + delta / Balance.oldDigger.deckClimbSeconds);
    if (at >= this.nextHazardAt) {
      this.nextHazardAt = at + Balance.oldDigger.hazardIntervalSeconds;
      this.hazardTicks += 1;
      // Moving gantries, swinging buckets: the platforming hazard, not an attack.
      this.damageHero(Balance.oldDigger.hazardDamage, hull.id ?? HAZARD_SOURCE_ID);
    }
    if (this.liveDrones().length < Balance.oldDigger.droneCount && at >= this.nextDroneRespawnAt) {
      this.nextDroneRespawnAt = at + Balance.oldDigger.droneRespawnSeconds;
      this.spawnDrone(this.dronesSpawned);
    }
  }

  private spawnDrone(seed: number): void {
    const hull = this.hull();
    if (!hull) return;
    const angle = seed * 2.4 + 0.7;
    const spawned = this.spawnEnemy(
      new THREE.Vector3(hull.position.x + Math.cos(angle) * 2.2, 0, hull.position.z + Math.sin(angle) * 2.2),
      {
        hpScale: Balance.oldDigger.droneHpScale,
        speedScale: 1.1,
        visualScale: 0.9,
        variantId: DRONE_VARIANT,
        variantLabel: DRONE_LABEL,
        tint: '#9aa7ad',
      },
    );
    if (spawned) this.dronesSpawned += 1;
  }

  private liveDrones(): ClaimJumperEnemy[] {
    return this.enemies().filter((enemy) => enemy.isAlive && enemy.variantId === DRONE_VARIANT);
  }

  diagnostics(): OldDiggerBossDiagnostics {
    const hull = this.hull();
    return {
      active: this.started,
      act: this.act,
      position: { x: round2(this.machinePosition().x), z: round2(this.machinePosition().z) },
      surveying: this.act === 1 && !this.gentle,
      surveyLeg: this.surveyIndex,
      surveyLegs: this.surveyPath.length,
      lastLeg: this.lastLeg,
      structuresUnmade: this.structuresUnmade,
      unmakeSweeps: this.unmakeSweeps,
      hullHp: round2(hull?.currentHp ?? 0),
      hullMaxHp: hull?.maxHp ?? Balance.oldDigger.hp,
      hullFloorHp: round2(this.hullFloorHp()),
      damageMarks: round2(this.damageMarks),
      killAttemptsAbsorbed: this.killAttemptsAbsorbed,
      playerDamageEvents: this.playerDamageEvents,
      boarded: this.boarded,
      deckProgress: round2(this.deckProgress),
      atTapeDeck: this.boarded && this.deckProgress >= 1,
      hazardTicks: this.hazardTicks,
      dronesAboard: this.liveDrones().length,
      dronesSpawned: this.dronesSpawned,
      dismounts: this.dismounts,
      swapPhase: this.swapPhase,
      redigging: this.swapPhase === 'redig',
      tape: this.tape,
      archivedTape: this.archivedTape,
      joinedFleet: this.gentle,
      gentle: this.gentle,
      persistentGentle: this.persistentGentle,
    };
  }

  reset(): void {
    this.disposeOldDigger3d(performanceTierDiagnostics().tier === 'lite' ? 'lite' : 'off');
    const hull = this.hull();
    if (hull) this.recycleEnemy(hull);
    for (const drone of this.liveDrones()) this.recycleEnemy(drone);
    this.boarded = false;
    this.deckProgress = 0;
    this.nextHazardAt = Number.POSITIVE_INFINITY;
    this.hazardTicks = 0;
    this.dronesSpawned = 0;
    this.nextDroneRespawnAt = Number.POSITIVE_INFINITY;
    this.dismounts = 0;
    this.swapPhase = 'none';
    this.swapReadEndsAt = Number.POSITIVE_INFINITY;
    this.redigTarget = null;
    this.tape = null;
    this.archivedTape = null;
    this.act = 0;
    this.started = false;
    this.surveyIndex = 0;
    this.surveyDirection = 1;
    this.lastLeg = null;
    this.nextUnmakeAt = Number.POSITIVE_INFINITY;
    this.structuresUnmade = 0;
    this.unmakeSweeps = 0;
    this.lastHullHp = null;
    this.damageMarks = 0;
    this.killAttemptsAbsorbed = 0;
    this.playerDamageEvents = 0;
    this.gentle = false;
    this.persistentGentle = false;
    this.lastAt = 0;
    if (this.enabled) this.restorePersistentGentle();
    this.syncPresentation();
  }

  dispose(): void {
    this.disposeOldDigger3d('disposed');
    disposeObject3D(this.group);
    this.group.clear();
  }

  private hull(): ClaimJumperEnemy | undefined {
    return this.enemies().find((enemy) => enemy.isAlive && enemy.variantId === VARIANT && enemy.bossComponentId === HULL_ID);
  }

  private machinePosition(): THREE.Vector3 {
    return this.hull()?.position ?? this.restPosition;
  }

  private hullFloorHp(): number {
    return Balance.oldDigger.hp * Balance.oldDigger.hpFloorPct;
  }

  private startRenovation(): void {
    const start = this.surveyPath[0] ?? { x: 0, z: 0 };
    this.started = true;
    this.act = 1;
    this.surveyIndex = 0;
    this.surveyDirection = 1;
    this.spawnHull(new THREE.Vector3(start.x, 0, start.z));
    this.lastHullHp = this.hull()?.currentHp ?? null;
    this.nextUnmakeAt = this.lastAt + Balance.oldDigger.unmakeIntervalSeconds;
    this.scriptSurveyMove(this.lastAt);
    this.announce('It arrives still working. It does not attack. It unmakes.', 'THE OLD DIGGER');
  }

  private spawnHull(position: THREE.Vector3): ClaimJumperEnemy | null | undefined {
    return this.spawnEnemy(position, {
      hpScale: Balance.oldDigger.hp / Balance.enemy.hp,
      speedScale: 1,
      visualScale: 1.6,
      contactDamageScale: 0,
      buildingDamageScale: 0,
      supportBuildingDamageScale: 0,
      heroPursuitRange: 0,
      variantId: VARIANT,
      variantLabel: 'The Old Digger',
      tint: '#8a7a5c',
      bossGroupId: 'e9-dome-basin:old-digger',
      bossGroupSize: 1,
      bossGroupTotalHp: Balance.oldDigger.hp,
      bossComponentId: HULL_ID,
      bossComponentLabel: 'THE OLD DIGGER',
      bossDegradeSpeedMult: 1,
    });
  }

  /**
   * Conventional damage barely marks it (choreography law): CombatSystem resolves
   * every hit; afterwards the boss law restores all but a marked fraction, and
   * never lets the hull fall beneath its floor. Too big to kill honestly.
   */
  private enforceNoKillLaw(): void {
    const hull = this.hull();
    if (!hull) return;
    if (this.lastHullHp !== null && hull.currentHp < this.lastHullHp) {
      const delta = this.lastHullHp - hull.currentHp;
      const marked = delta * Balance.oldDigger.conventionalDamageMult;
      this.damageMarks += marked;
      hull.restoreBossHull(Math.max(this.hullFloorHp(), this.lastHullHp - marked));
    }
    this.lastHullHp = hull.currentHp;
  }

  private updateRenovation(at: number): void {
    const hull = this.hull();
    if (!hull) return;
    const target = this.surveyPath[this.surveyIndex];
    if (target && Math.hypot(hull.position.x - target.x, hull.position.z - target.z) <= WAYPOINT_EPSILON) {
      this.advanceSurveyLeg(at);
    }
    if (at >= this.nextUnmakeAt) {
      this.nextUnmakeAt = at + Balance.oldDigger.unmakeIntervalSeconds;
      this.unmakeSweeps += 1;
      this.structuresUnmade += this.unmakeStructuresNear(
        { x: hull.position.x, z: hull.position.z },
        Balance.oldDigger.unmakeRadius,
        at,
      );
    }
  }

  private advanceSurveyLeg(at: number): void {
    const from = this.surveyPath[this.surveyIndex];
    if (this.surveyIndex + this.surveyDirection < 0 || this.surveyIndex + this.surveyDirection >= this.surveyPath.length) {
      // The century-old survey loops forever: it re-digs to the old blueprint until taught.
      this.surveyDirection = this.surveyDirection === 1 ? -1 : 1;
    }
    this.surveyIndex += this.surveyDirection;
    const to = this.surveyPath[this.surveyIndex];
    if (from && to) this.lastLeg = { from, to };
    this.scriptSurveyMove(at);
  }

  private scriptSurveyMove(_at: number): void {
    const hull = this.hull();
    const target = this.surveyPath[this.surveyIndex];
    if (!hull || !target) return;
    hull.scriptMoveTo(target.x, target.z, Balance.oldDigger.surveySpeed, { ignoreTerrain: true });
  }

  private restorePersistentGentle(): void {
    const saved = this.persistence.readAtBirth();
    if (!saved) return;
    this.restPosition.set(saved.x, 0, saved.z);
    this.persistentGentle = true;
    this.gentle = true;
    this.act = 3;
  }

  private buildPresentation(): void {
    const wheelColor = '#a5793f';
    this.machinePrimitive.add(
      box(6.4, 1.2, 2.8, '#5c4a33', 0.6, 0.85, 0),
      box(2.6, 1.4, 2.2, '#6f5233', 2, 1.9, 0),
      cylinder(1.5, 0.5, wheelColor, -2.4, 1.5, -1.15, Math.PI / 2),
      cylinder(1.5, 0.5, wheelColor, -2.4, 1.5, 1.15, Math.PI / 2),
      cylinder(0.16, 4.6, '#8a7a5c', 0.4, 3, -1.1, 0.5),
      cylinder(0.16, 4.6, '#8a7a5c', 0.4, 3, 1.1, -0.5),
      box(3.6, 0.24, 0.5, '#8a7a5c', -0.4, 4, 0),
      this.primitiveTapeDeck,
    );
    this.machine.add(this.machinePrimitive);
    this.surveyMarker.rotation.x = -Math.PI / 2;
    this.surveyMarker.position.y = 0.08;
    this.group.add(this.machine, this.surveyMarker);
    this.syncPresentation();
  }

  private syncPresentation(): void {
    const visible = this.started || this.gentle;
    if (visible) this.ensureOldDigger3d();
    const center = this.machinePosition();
    const modelMounted = this.oldDigger3dState === 'ready' && this.oldDigger3dModel?.visible === true;
    this.machine.position.set(center.x, 0, center.z);
    this.machine.visible = visible;
    this.machinePrimitive.visible = !modelMounted;
    const target = this.surveyPath[this.surveyIndex];
    if (!this.gentle && target) this.machine.rotation.y = Math.atan2(target.x - center.x, target.z - center.z);
    (this.primitiveTapeDeck.material as THREE.MeshStandardMaterial).color.set(this.gentle ? '#62d7cd' : '#6a4b35');
    this.surveyMarker.position.set(center.x, 0.08, center.z);
    this.surveyMarker.visible = this.started && this.act === 1 && !this.gentle;
    this.updateOldDigger3d();
    this.publishOldDigger3d();
  }

  private ensureOldDigger3d(): void {
    if (this.oldDigger3dState !== 'off' && this.oldDigger3dState !== 'disposed') return;
    const serial = ++this.oldDigger3dLoadSerial;
    this.oldDigger3dState = 'loading';
    this.publishOldDigger3d();
    void import('three/examples/jsm/loaders/GLTFLoader.js').then(({ GLTFLoader }) => {
      if (serial !== this.oldDigger3dLoadSerial) return;
      new GLTFLoader().load(OLD_DIGGER_3D_URL, ({ scene }) => {
        if (serial !== this.oldDigger3dLoadSerial) {
          disposeObject3D(scene);
          return;
        }
        const meshes = this.inspectOldDigger3d(scene);
        if (!meshes) {
          disposeObject3D(scene);
          this.oldDigger3dState = 'failed';
          this.publishOldDigger3d();
          return;
        }
        scene.name = 'OldDigger3d';
        scene.visible = false;
        this.oldDigger3dModel = scene;
        this.oldDigger3dMeshes.clear();
        for (const [node, mesh] of meshes) this.oldDigger3dMeshes.set(node, mesh);
        this.machine.add(scene);
        this.oldDigger3dState = 'ready';
        this.syncPresentation();
      }, undefined, () => {
        if (serial !== this.oldDigger3dLoadSerial) return;
        this.oldDigger3dState = 'failed';
        this.publishOldDigger3d();
      });
    }, () => {
      if (serial !== this.oldDigger3dLoadSerial) return;
      this.oldDigger3dState = 'failed';
      this.publishOldDigger3d();
    });
  }

  private inspectOldDigger3d(model: THREE.Object3D): Map<OldDigger3dNode, THREE.Mesh> | null {
    const meshes = new Map<OldDigger3dNode, THREE.Mesh>();
    const materials = new Set<THREE.Material>();
    let meshCount = 0;
    let triangles = 0;
    model.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      meshCount += 1;
      triangles += Math.floor((mesh.geometry.index?.count ?? mesh.geometry.getAttribute('position')?.count ?? 0) / 3);
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
      for (const id of OLD_DIGGER_3D_NODES) {
        const morph = OLD_DIGGER_3D_COMPONENTS[id];
        if (mesh.name === id && mesh.morphTargetDictionary?.[morph] === 0 && mesh.morphTargetInfluences?.length === 1) meshes.set(id, mesh);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    if (meshCount !== 3 || meshes.size !== 3 || materials.size !== 1 || triangles !== OLD_DIGGER_3D_TRIANGLES) return null;
    for (const mesh of meshes.values()) {
      const material = (mesh.material as THREE.MeshStandardMaterial).clone();
      material.emissiveMap = material.map;
      mesh.material = material;
    }
    for (const material of materials) material.dispose();
    return meshes;
  }

  private updateOldDigger3d(): void {
    if (!this.oldDigger3dModel || this.oldDigger3dState !== 'ready') return;
    this.oldDigger3dModel.visible = this.started || this.gentle;
    for (const mesh of this.oldDigger3dMeshes.values()) {
      if (mesh.morphTargetInfluences) mesh.morphTargetInfluences[0] = this.gentle ? 1 : 0;
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.set(this.gentle ? '#62d7cd' : '#fff8e8');
      material.emissiveIntensity = this.gentle ? 2.4 : 2;
    }
  }

  private disposeOldDigger3d(nextState: OldDigger3dState): void {
    this.oldDigger3dLoadSerial += 1;
    if (this.oldDigger3dModel) {
      this.machine.remove(this.oldDigger3dModel);
      disposeObject3D(this.oldDigger3dModel);
      this.oldDigger3dModel = undefined;
    }
    this.oldDigger3dMeshes.clear();
    this.oldDigger3dState = nextState;
    this.publishOldDigger3d();
  }

  private publishOldDigger3d(): void {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    canvas.dataset.oldDigger3dState = this.oldDigger3dState;
    canvas.dataset.oldDigger3dSource = this.oldDigger3dState === 'ready' ? 'glb' : 'placeholder';
    canvas.dataset.oldDigger3dMounted = String(this.oldDigger3dState === 'ready' && this.oldDigger3dModel?.visible === true);
    canvas.dataset.oldDigger3dPresentation = this.gentle ? 'gentle' : this.started ? 'working' : 'hidden';
  }
}

function box(width: number, height: number, depth: number, color: string, x = 0, y = 0, z = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0.1 }));
  mesh.position.set(x, y, z);
  return mesh;
}

function cylinder(radius: number, height: number, color: string, x: number, y: number, z: number, rotateZ = 0): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.14 }));
  mesh.position.set(x, y, z);
  mesh.rotation.z = rotateZ;
  return mesh;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
