import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { PlaybookRecording } from '../playbook/PlaybookFormat';

export const ECHO_JAR_ENTRY_ID = 'the-echo-jar';

const ECHO_SOURCE_ID = -11;

export type EchoBasePiece = Readonly<{
  id: string;
  x: number;
  z: number;
}>;

export type EchoActionSample = Readonly<{
  mx: number;
  my: number;
  actions: readonly string[];
}>;

export type EchoBossDiagnostics = Readonly<{
  active: boolean;
  act: 0 | 1 | 2 | 3;
  trafficLagTicks: 1;
  echoedTraffic: string[];
  stutters: number;
  copiedBuildings: number;
  copiedTurrets: number;
  copiedPatrols: number;
  perimeterProgress: number;
  patternConfidence: number;
  maxPatternConfidence: number;
  familiarStrikes: number;
  novelStrikes: number;
  lastStrike: string | null;
  lastStrikeDamage: number;
  pressureAttacks: number;
  playerDamageEvents: number;
  replayAttacks: number;
  lastReplayedPattern: string | null;
  recordedPatterns: string[];
  struckPatterns: string[];
  captured: boolean;
  jarVisible: boolean;
  persistentJar: boolean;
  killPath: false;
}>;

type EchoPersistence = Readonly<{
  readAtBirth: () => boolean;
  writeAtCeremony: () => boolean;
}>;

type EchoCopy = {
  mesh: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
};

/**
 * E7 STORYBOOK §BOSS — THE ECHO.
 *
 * The boss has no enemy body or HP: its anatomy is the player's choices. The
 * copied base pressures the player through CombatSystem, while actions absent
 * from saved tapes erode pattern-confidence faster. At zero confidence it is
 * kept as a signal mote in a jar. A kill path cannot accidentally emerge.
 */
export class EchoBossSystem {
  readonly group = new THREE.Group();
  private copiesGroup?: THREE.Group;
  private copyGeometry?: THREE.BoxGeometry;
  private copyMaterial?: THREE.MeshStandardMaterial;
  private perimeter?: THREE.Mesh;
  private jar?: THREE.Group;
  private jarGlass?: THREE.Mesh;
  private mote?: THREE.Mesh;
  private readonly copies: EchoCopy[] = [];
  private readonly recordedPatterns = new Set<string>();
  private readonly struckPatterns = new Set<string>();
  private pendingTraffic: string[] = [];
  private echoedTraffic: string[] = [];
  private replaySequence: string[] = [];
  private replayCursor = 0;
  private act: 0 | 1 | 2 | 3 = 0;
  private started = false;
  private captured = false;
  private persistentJar = false;
  private actStartedAt = 0;
  private nextStutterAt = Number.POSITIVE_INFINITY;
  private nextPressureAt = Number.POSITIVE_INFINITY;
  private stutters = 0;
  private copiedTurrets = 0;
  private copiedPatrols = 0;
  private patternConfidence: number = Balance.e7Boss.patternConfidence;
  private familiarStrikes = 0;
  private novelStrikes = 0;
  private lastStrike: string | null = null;
  private lastStrikeDamage = 0;
  private pressureAttacks = 0;
  private playerDamageEvents = 0;
  private replayAttacks = 0;
  private lastReplayedPattern: string | null = null;

  constructor(
    private readonly baseSnapshot: () => readonly EchoBasePiece[],
    private readonly playbooks: () => readonly PlaybookRecording[],
    private readonly damageHero: (amount: number, sourceId: number) => boolean,
    private readonly announce: (text: string, title: string) => void,
    private readonly visualY: (x: number, z: number, base: number) => number,
    private readonly enabled: boolean,
    private readonly persistence: EchoPersistence,
  ) {
    this.group.name = 'TheEcho.Placeholder';
    if (!this.enabled) return;
    this.buildPresentation();
    if (this.persistence.readAtBirth()) this.restoreJar();
    this.syncPresentation(0);
  }

  onWaveStarted(wave: number, at: number): void {
    if (!this.enabled || this.captured || wave < Balance.e7Boss.arriveWave - Balance.e7Boss.dreadWaves) return;
    if (!this.started) this.startDread(at);
    if (wave >= Balance.e7Boss.arriveWave && this.act === 0) this.startMirror(at);
  }

  observe(sample: EchoActionSample, at: number): void {
    if (!this.enabled || this.captured) return;
    const signatures = [movementSignature(sample.mx, sample.my), ...sample.actions].filter(
      (signature): signature is string => Boolean(signature),
    );
    if (this.act === 0 && this.started) {
      this.echoedTraffic = this.pendingTraffic;
      this.pendingTraffic = signatures;
      return;
    }
    if (this.act !== 2) return;
    for (const signature of signatures) {
      if (this.struckPatterns.has(signature)) continue;
      this.struckPatterns.add(signature);
      const familiar = this.recordedPatterns.has(signature);
      const damage = familiar ? Balance.e7Boss.familiarConfidenceDamage : Balance.e7Boss.novelConfidenceDamage;
      this.patternConfidence = Math.max(0, this.patternConfidence - damage);
      this.lastStrike = signature;
      this.lastStrikeDamage = damage;
      if (familiar) this.familiarStrikes += 1;
      else this.novelStrikes += 1;
      if (this.patternConfidence <= 0) {
        this.capture(at);
        return;
      }
    }
  }

  update(at: number): void {
    if (!this.enabled) return;
    if (this.act === 0 && this.started && at >= this.nextStutterAt) {
      this.stutters += 1;
      this.nextStutterAt = at + Balance.e7Boss.dreadStutterIntervalSeconds;
    }
    if (this.act === 1 && at - this.actStartedAt >= Balance.e7Boss.adaptationSeconds) {
      this.act = 2;
      this.actStartedAt = at;
      this.announce('It has learned the last wave. Break the pattern.', 'THE ADAPTATION');
    }
    if ((this.act === 1 || this.act === 2) && at >= this.nextPressureAt) {
      this.nextPressureAt = at + Balance.e7Boss.pressureIntervalSeconds;
      this.pressureAttacks += 1;
      const replayedPattern = this.act === 2 && this.replaySequence.length > 0
        ? this.replaySequence[this.replayCursor % this.replaySequence.length] ?? null
        : null;
      if (replayedPattern) {
        this.replayCursor += 1;
        this.replayAttacks += 1;
        this.lastReplayedPattern = replayedPattern;
      }
      const damage = Balance.e7Boss.pressureDamageBase
        + this.copiedTurrets * Balance.e7Boss.pressureDamagePerTurret
        + this.copiedPatrols * Balance.e7Boss.pressureDamagePerPatrol
        + (replayedPattern ? Balance.e7Boss.replayPatternDamage : 0);
      if (this.damageHero(damage, ECHO_SOURCE_ID)) this.playerDamageEvents += 1;
    }
    this.syncPresentation(at);
  }

  diagnostics(): EchoBossDiagnostics {
    const progress = this.act === 0
      ? 0
      : this.act >= 2
        ? 1
        : THREE.MathUtils.clamp((this.lastPresentationAt - this.actStartedAt)
          / Balance.e7Boss.adaptationSeconds, 0, 1);
    return {
      active: this.started && !this.captured,
      act: this.act,
      trafficLagTicks: 1,
      echoedTraffic: [...this.echoedTraffic],
      stutters: this.stutters,
      copiedBuildings: this.copies.length,
      copiedTurrets: this.copiedTurrets,
      copiedPatrols: this.copiedPatrols,
      perimeterProgress: round2(progress),
      patternConfidence: round2(this.patternConfidence),
      maxPatternConfidence: Balance.e7Boss.patternConfidence,
      familiarStrikes: this.familiarStrikes,
      novelStrikes: this.novelStrikes,
      lastStrike: this.lastStrike,
      lastStrikeDamage: this.lastStrikeDamage,
      pressureAttacks: this.pressureAttacks,
      playerDamageEvents: this.playerDamageEvents,
      replayAttacks: this.replayAttacks,
      lastReplayedPattern: this.lastReplayedPattern,
      recordedPatterns: [...this.recordedPatterns].sort(),
      struckPatterns: [...this.struckPatterns],
      captured: this.captured,
      jarVisible: this.jar?.visible ?? false,
      persistentJar: this.persistentJar,
      killPath: false,
    };
  }

  reset(): void {
    this.clearCopies();
    this.recordedPatterns.clear();
    this.struckPatterns.clear();
    this.pendingTraffic = [];
    this.echoedTraffic = [];
    this.replaySequence = [];
    this.replayCursor = 0;
    this.act = 0;
    this.started = false;
    this.captured = false;
    this.persistentJar = false;
    this.actStartedAt = 0;
    this.nextStutterAt = Number.POSITIVE_INFINITY;
    this.nextPressureAt = Number.POSITIVE_INFINITY;
    this.stutters = 0;
    this.copiedTurrets = 0;
    this.copiedPatrols = 0;
    this.patternConfidence = Balance.e7Boss.patternConfidence;
    this.familiarStrikes = 0;
    this.novelStrikes = 0;
    this.lastStrike = null;
    this.lastStrikeDamage = 0;
    this.pressureAttacks = 0;
    this.playerDamageEvents = 0;
    this.replayAttacks = 0;
    this.lastReplayedPattern = null;
    this.lastPresentationAt = 0;
    if (this.enabled && this.persistence.readAtBirth()) this.restoreJar();
    this.syncPresentation(0);
  }

  dispose(): void {
    this.clearCopies();
    this.copyGeometry?.dispose();
    this.copyMaterial?.dispose();
    this.perimeter?.geometry.dispose();
    if (this.perimeter) (this.perimeter.material as THREE.Material).dispose();
    this.jarGlass?.geometry.dispose();
    if (this.jarGlass) (this.jarGlass.material as THREE.Material).dispose();
    this.mote?.geometry.dispose();
    if (this.mote) (this.mote.material as THREE.Material).dispose();
    this.group.clear();
  }

  private lastPresentationAt = 0;

  private startDread(at: number): void {
    this.started = true;
    this.act = 0;
    this.actStartedAt = at;
    this.nextStutterAt = at;
    this.announce("It's us. Somebody's playing US back.", 'THE DREAD');
  }

  private startMirror(at: number): void {
    this.act = 1;
    this.actStartedAt = at;
    this.nextPressureAt = at + Balance.e7Boss.pressureIntervalSeconds;
    const pieces = this.baseSnapshot().filter((piece) => Number.isFinite(piece.x) && Number.isFinite(piece.z));
    this.copiedTurrets = pieces.filter((piece) => piece.id === 'turret' || piece.id === 'sentry_beacon').length;
    this.loadRecordedPatterns();
    this.replaySequence = [...this.recordedPatterns];
    for (const piece of pieces) this.addCopy(piece);
    this.announce('Your base answers from across the valley. Its perimeter is advancing.', 'THE MIRROR');
  }

  private loadRecordedPatterns(): void {
    const tapes = this.playbooks();
    this.copiedPatrols = tapes.length;
    for (const tape of tapes) {
      for (const entry of tape.entries) {
        const movement = movementSignature(entry.mx, entry.my);
        if (movement) this.recordedPatterns.add(movement);
        for (const action of entry.a) {
          this.recordedPatterns.add(action.type === 'context_action' ? `${action.type}:${action.action}` : action.type);
        }
      }
    }
  }

  private addCopy(piece: EchoBasePiece): void {
    if (!this.copyGeometry || !this.copyMaterial || !this.copiesGroup) return;
    const start = new THREE.Vector3(-piece.x, 0, Balance.e7Boss.mirrorOffsetZ - piece.z);
    const end = start.clone().multiplyScalar(Balance.e7Boss.mirrorApproachScale);
    const mesh = new THREE.Mesh(this.copyGeometry, this.copyMaterial);
    mesh.name = `TheEcho.Copy.${piece.id}`;
    mesh.userData.original = { id: piece.id, x: piece.x, z: piece.z };
    this.copiesGroup.add(mesh);
    this.copies.push({ mesh, start, end });
  }

  private capture(at: number): void {
    this.act = 3;
    this.actStartedAt = at;
    this.captured = true;
    this.started = false;
    this.nextPressureAt = Number.POSITIVE_INFINITY;
    this.persistentJar = this.persistence.writeAtCeremony();
    this.announce('A single bright mote remains. The Calculating House prints one pictogram: a jar.', 'THE JAR');
    this.syncPresentation(at);
  }

  private restoreJar(): void {
    this.act = 3;
    this.captured = true;
    this.persistentJar = true;
    this.patternConfidence = 0;
  }

  private syncPresentation(at: number): void {
    if (!this.enabled || !this.copiesGroup || !this.perimeter || !this.copyMaterial || !this.jar || !this.mote) return;
    this.lastPresentationAt = at;
    const progress = this.act === 1
      ? THREE.MathUtils.clamp((at - this.actStartedAt) / Balance.e7Boss.adaptationSeconds, 0, 1)
      : this.act >= 2 ? 1 : 0;
    this.copiesGroup.visible = this.started && (this.act === 1 || this.act === 2);
    this.perimeter.visible = this.copiesGroup.visible;
    for (const copy of this.copies) {
      copy.mesh.position.lerpVectors(copy.start, copy.end, progress);
      copy.mesh.position.y = this.visualY(copy.mesh.position.x, copy.mesh.position.z, Balance.e7Boss.copyHeight / 2);
    }
    const radius = THREE.MathUtils.lerp(Balance.e7Boss.perimeterStartRadius, Balance.e7Boss.perimeterEndRadius, progress);
    this.perimeter.scale.setScalar(radius);
    this.perimeter.position.y = this.visualY(0, 0, Balance.e7Boss.perimeterLift);
    this.perimeter.rotation.z = at * Balance.e7Boss.perimeterSpin;
    this.copyMaterial.opacity = Balance.e7Boss.copyOpacity * (0.82 + Math.sin(at * 6) * 0.18);
    this.jar.visible = this.captured;
    this.jar.position.set(
      Balance.e7Boss.jarX,
      this.visualY(Balance.e7Boss.jarX, Balance.e7Boss.jarZ, Balance.e7Boss.jarHeight / 2),
      Balance.e7Boss.jarZ,
    );
    this.mote.position.y = Math.sin(at * Balance.e7Boss.jarMoteBobSpeed) * Balance.e7Boss.jarMoteBobHeight;
  }

  private clearCopies(): void {
    for (const copy of this.copies) this.copiesGroup?.remove(copy.mesh);
    this.copies.length = 0;
  }

  private buildPresentation(): void {
    this.copiesGroup = new THREE.Group();
    this.copyGeometry = new THREE.BoxGeometry(Balance.e7Boss.copyWidth, Balance.e7Boss.copyHeight, Balance.e7Boss.copyDepth);
    this.copyMaterial = new THREE.MeshStandardMaterial({
      color: Balance.e7Boss.copyColor,
      emissive: Balance.e7Boss.copyEmissive,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: Balance.e7Boss.copyOpacity,
      depthWrite: false,
    });
    this.perimeter = new THREE.Mesh(
      new THREE.RingGeometry(0.97, 1, 48),
      new THREE.MeshBasicMaterial({
        color: Balance.e7Boss.copyEmissive,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.jar = new THREE.Group();
    this.jarGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.5, Balance.e7Boss.jarHeight, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: Balance.e7Boss.jarGlassColor,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    this.mote = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 8),
      new THREE.MeshStandardMaterial({
        color: Balance.e7Boss.jarMoteColor,
        emissive: Balance.e7Boss.jarMoteColor,
        emissiveIntensity: 1.6,
      }),
    );
    this.copiesGroup.name = 'TheEcho.MirroredBase';
    this.perimeter.name = 'TheEcho.Perimeter';
    this.perimeter.rotation.x = -Math.PI / 2;
    this.jar.name = 'TheEcho.Jar';
    this.jar.add(this.jarGlass, this.mote);
    this.group.add(this.copiesGroup, this.perimeter, this.jar);
  }
}

export function movementSignature(mx: number, my: number): string | null {
  if (Math.hypot(mx, my) < 0.25) return null;
  const octant = Math.round(Math.atan2(my, mx) / (Math.PI / 4));
  return `move:${['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'][(octant + 8) % 8]}`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
