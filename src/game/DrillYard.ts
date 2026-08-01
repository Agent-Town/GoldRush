import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import type { ContractPracticeMode } from '../meta/ContractFamilies';
import type { WaveSystem } from '../systems/WaveSystem';
import * as Terrain from '../world/Terrain';
import type { Economy } from './Economy';

const INTERACTION_RADIUS = 3;
const TARGET_POSITIONS = [
  [-9, -9],
  [-4.5, -10],
  [0, -9],
  [4.5, -10],
  [9, -9],
] as const;

type TargetKind = 'straw-man' | 'rolling-log';
type TargetState = {
  kind: TargetKind;
  position: THREE.Vector3;
  visual: THREE.Group;
  enemy: ClaimJumperEnemy | null;
  respawnAt: number;
  falls: number;
  respawns: number;
};

export type DrillYardDiagnostics = {
  active: true;
  faucet: { x: number; z: number; grants: number; lastAmount: number };
  bell: { x: number; z: number; rings: number; waveActive: boolean; wavesCompleted: number };
  targets: Array<{
    kind: TargetKind;
    x: number;
    z: number;
    state: 'standing' | 'fallen';
    hp: number;
    maxHp: number;
    falls: number;
    respawns: number;
  }>;
  persistence: {
    scheduledWaves: false;
    scores: false;
    metaProgress: false;
    runHistory: false;
    standings: false;
    tapes: false;
  };
};

export class DrillYard {
  readonly group = new THREE.Group();
  private readonly faucetPosition = new THREE.Vector3(-8, 0, 12);
  private readonly bellPosition = new THREE.Vector3(8, 0, 12);
  private readonly targets: TargetState[];
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly prompt = document.createElement('div');
  private readonly promptTitle = document.createElement('span');
  private readonly actionButton = document.createElement('button');
  private readonly exitButton = document.createElement('button');
  private nearby: 'faucet' | 'bell' | null = null;
  private grants = 0;
  private lastGrant = 0;
  private rings = 0;
  private currentAt = 0;

  constructor(
    private readonly config: ContractPracticeMode,
    private readonly enemies: EnemyPool,
    private readonly economy: Economy,
    private readonly waves: WaveSystem,
    promptStack: HTMLElement,
    private readonly floatText: (position: THREE.Vector3, text: string, color: string) => void,
    private readonly announce: (text: string, title?: string) => void,
    private readonly onExit: () => void,
    private readonly onChanged: () => void,
  ) {
    this.group.name = 'DrillYard';
    this.group.add(this.createAssayTent(), this.createBell());
    this.targets = TARGET_POSITIONS.map(([x, z], index) => {
      const kind: TargetKind = index % 2 === 0 ? 'straw-man' : 'rolling-log';
      const position = new THREE.Vector3(x, 0, z);
      const visual = kind === 'straw-man' ? this.createStrawMan() : this.createRollingLog();
      visual.position.set(x, Terrain.visualY(x, z, 0), z);
      visual.name = kind === 'straw-man' ? 'DrillStrawMan' : 'DrillRollingLog';
      this.group.add(visual);
      return { kind, position, visual, enemy: null, respawnAt: 0, falls: 0, respawns: 0 };
    });
    this.installPrompt(promptStack);
    for (const target of this.targets) this.spawnTarget(target);
  }

  get diagnostics(): DrillYardDiagnostics {
    const manual = this.waves.diagnostics.manual;
    return {
      active: true,
      faucet: { x: this.faucetPosition.x, z: this.faucetPosition.z, grants: this.grants, lastAmount: this.lastGrant },
      bell: {
        x: this.bellPosition.x,
        z: this.bellPosition.z,
        rings: this.rings,
        waveActive: manual.active,
        wavesCompleted: manual.completed,
      },
      targets: this.targets.map((target) => ({
        kind: target.kind,
        x: target.position.x,
        z: target.position.z,
        state: target.enemy?.isAlive ? 'standing' : 'fallen',
        hp: target.enemy?.currentHp ?? 0,
        maxHp: target.enemy?.maxHp ?? 0,
        falls: target.falls,
        respawns: target.respawns,
      })),
      persistence: {
        scheduledWaves: false,
        scores: false,
        metaProgress: false,
        runHistory: false,
        standings: false,
        tapes: false,
      },
    };
  }

  update(at: number, heroPosition: THREE.Vector3): void {
    this.currentAt = at;
    for (const target of this.targets) {
      if (target.enemy && !target.enemy.isAlive) {
        target.enemy = null;
        target.respawnAt = at;
      }
      if (!target.enemy && at >= target.respawnAt) {
        this.spawnTarget(target);
        target.respawns += 1;
      }
    }
    const faucetDistance = flatDistance(heroPosition, this.faucetPosition);
    const bellDistance = flatDistance(heroPosition, this.bellPosition);
    this.nearby = Math.min(faucetDistance, bellDistance) > INTERACTION_RADIUS
      ? null
      : faucetDistance <= bellDistance ? 'faucet' : 'bell';
    this.promptTitle.textContent = this.nearby === 'faucet'
      ? 'Assay tent practice lever'
      : this.nearby === 'bell'
        ? 'Drill Bell'
        : 'The Drill Yard';
    this.actionButton.hidden = this.nearby === null;
    this.actionButton.textContent = this.nearby === 'faucet' ? 'Top up practice gold' : 'Ring one drill wave';
  }

  interact(heroPosition: THREE.Vector3): boolean {
    if (flatDistance(heroPosition, this.faucetPosition) <= INTERACTION_RADIUS) return this.topUp();
    if (flatDistance(heroPosition, this.bellPosition) <= INTERACTION_RADIUS) return this.ringBell();
    return false;
  }

  topUp(): boolean {
    const amount = Math.min(this.config.goldGrant, this.economy.bankCap - this.economy.gold);
    this.lastGrant = Math.max(0, amount);
    if (amount <= 0) {
      this.floatText(this.faucetPosition, 'Practice purse full', '#8b7d3c');
      this.onChanged();
      return true;
    }
    const result = this.economy.apply({
      id: crypto.randomUUID(),
      at: this.currentAt,
      type: 'gold_granted',
      source: 'practice',
      amount,
      practice: true,
    });
    if (!result.ok) return false;
    this.grants += 1;
    this.floatText(this.faucetPosition, `+${amount} practice gold`, '#c4883a');
    this.onChanged();
    return true;
  }

  ringBell(): boolean {
    if (!this.waves.triggerManualWave(this.config.bellWaveSize)) {
      this.announce('Finish the drill wave already in the yard.', 'DRILL BELL');
      return true;
    }
    this.rings += 1;
    this.onChanged();
    return true;
  }

  handleEnemyDamage(enemy: ClaimJumperEnemy, died: boolean, at: number): boolean {
    const target = this.targets.find((candidate) => candidate.enemy === enemy);
    if (!target) return false;
    if (!died) return true;
    target.falls += 1;
    target.visual.rotation.z = target.kind === 'straw-man' ? -Math.PI * 0.45 : Math.PI * 0.3;
    target.enemy = null;
    target.respawnAt = at + this.config.dummyRespawnSeconds;
    this.enemies.recycle(enemy);
    this.floatText(target.position, 'THUNK', '#8b7d3c');
    this.onChanged();
    return true;
  }

  reset(): void {
    for (const target of this.targets) {
      if (target.enemy?.isAlive) this.enemies.recycle(target.enemy);
      target.enemy = null;
      target.respawnAt = 0;
      target.falls = 0;
      target.respawns = 0;
      target.visual.rotation.z = 0;
      this.spawnTarget(target);
    }
    this.grants = 0;
    this.lastGrant = 0;
    this.rings = 0;
  }

  dispose(): void {
    for (const target of this.targets) if (target.enemy?.isAlive) this.enemies.recycle(target.enemy);
    this.prompt.remove();
    this.group.removeFromParent();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
  }

  private spawnTarget(target: TargetState): void {
    target.visual.rotation.z = 0;
    target.enemy = this.enemies.spawn(target.position, {
      speedScale: 0,
      hpScale: 1,
      contactDamageScale: 0,
      buildingDamageScale: 0,
      supportBuildingDamageScale: 0,
      variantId: target.kind === 'straw-man' ? 'drill_straw_target' : 'drill_log_target',
      variantLabel: target.kind === 'straw-man' ? 'Straw Man' : 'Rolling Log',
    });
  }

  private installPrompt(parent: HTMLElement): void {
    this.prompt.className = 'building-context-prompt';
    this.prompt.dataset.testid = 'drill-yard-prompt';
    const icon = document.createElement('span');
    icon.className = 'building-context-prompt__icon';
    icon.textContent = 'D';
    this.promptTitle.className = 'building-context-prompt__title';
    this.actionButton.className = 'building-context-prompt__button building-context-prompt__button--fund';
    this.actionButton.type = 'button';
    this.actionButton.dataset.testid = 'drill-yard-action';
    this.actionButton.addEventListener('click', () => this.nearby === 'faucet' ? this.topUp() : this.nearby === 'bell' && this.ringBell());
    this.exitButton.className = 'building-context-prompt__button';
    this.exitButton.type = 'button';
    this.exitButton.dataset.testid = 'drill-yard-exit';
    this.exitButton.textContent = 'Return to Town';
    this.exitButton.addEventListener('click', this.onExit);
    this.prompt.append(icon, this.promptTitle, this.actionButton, this.exitButton);
    parent.append(this.prompt);
  }

  private createAssayTent(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'DrillAssayTent';
    group.position.set(this.faucetPosition.x, Terrain.visualY(this.faucetPosition.x, this.faucetPosition.z, 0), this.faucetPosition.z);
    const canvas = this.mesh(new THREE.ConeGeometry(2.1, 2.8, 4), new THREE.MeshStandardMaterial({ color: '#d8c08c', roughness: 0.95 }));
    canvas.position.y = 1.35;
    canvas.rotation.y = Math.PI * 0.25;
    const lever = this.mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.45, metalness: 0.42 }));
    lever.position.set(2.2, 0.7, 0);
    lever.rotation.z = -0.45;
    group.add(canvas, lever);
    return group;
  }

  private createBell(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'DrillBell';
    group.position.set(this.bellPosition.x, Terrain.visualY(this.bellPosition.x, this.bellPosition.z, 0), this.bellPosition.z);
    const postMaterial = new THREE.MeshStandardMaterial({ color: '#6a4728', roughness: 0.9 });
    const brass = new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.38, metalness: 0.55 });
    const post = this.mesh(new THREE.CylinderGeometry(0.15, 0.18, 2.8, 8), postMaterial);
    post.position.y = 1.4;
    const arm = this.mesh(new THREE.BoxGeometry(1.3, 0.16, 0.16), postMaterial);
    arm.position.set(-0.5, 2.65, 0);
    const bell = this.mesh(new THREE.ConeGeometry(0.48, 0.72, 18, 1, true), brass);
    bell.position.set(-1, 2.18, 0);
    group.add(post, arm, bell);
    return group;
  }

  private createStrawMan(): THREE.Group {
    const group = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: '#6a4728', roughness: 0.94 });
    const straw = new THREE.MeshStandardMaterial({ color: '#d8ad45', roughness: 1 });
    const post = this.mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.7, 7), wood);
    post.position.y = 1.35;
    const arms = this.mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 7), wood);
    arms.position.y = 1.72;
    arms.rotation.z = Math.PI * 0.5;
    const body = this.mesh(new THREE.ConeGeometry(0.42, 1.1, 7), straw);
    body.position.y = 1.28;
    const head = this.mesh(new THREE.SphereGeometry(0.31, 10, 8), straw);
    head.position.y = 2.05;
    group.add(post, arms, body, head);
    return group;
  }

  private createRollingLog(): THREE.Group {
    const group = new THREE.Group();
    const wood = new THREE.MeshStandardMaterial({ color: '#805034', roughness: 0.96 });
    const brass = new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.5, metalness: 0.25 });
    const log = this.mesh(new THREE.CylinderGeometry(0.48, 0.48, 1.7, 12), wood);
    log.position.y = 0.8;
    log.rotation.z = Math.PI * 0.5;
    const axle = this.mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 8), brass);
    axle.position.y = 0.8;
    axle.rotation.z = Math.PI * 0.5;
    group.add(log, axle);
    return group;
  }

  private mesh<G extends THREE.BufferGeometry, M extends THREE.Material>(geometry: G, material: M): THREE.Mesh<G, M> {
    this.geometries.add(geometry);
    this.materials.add(material);
    return new THREE.Mesh(geometry, material);
  }
}

function flatDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
