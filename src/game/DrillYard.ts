import * as THREE from 'three';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import type { ContractPracticeMode } from '../meta/ContractFamilies';
import type { WaveSystem } from '../systems/WaveSystem';
import type { WorldInfoNoteTarget } from '../ui/WorldInfoNotes';
import * as Terrain from '../world/Terrain';
import type { Economy } from './Economy';

const INTERACTION_RADIUS = 3;
const stationArt = import.meta.glob<string>([
  '../../assets/processed/prop-drill-faucet-station.png',
  '../../assets/processed/prop-drill-bell-post.png',
  '../../assets/processed/prop-straw-man-stand.png',
], { query: '?url', import: 'default', eager: true });

type TargetKind = ContractPracticeMode['targets'][number]['kind'];
type PracticeStation = ContractPracticeMode['stations'][number] & { position: THREE.Vector3 };
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
  /**
   * Filenames whose processed sprite actually loaded and replaced the procedural station.
   * Empty means the art is DORMANT: the eager glob resolved nothing, `applyStationArt`
   * returned early, and the player sees placeholder geometry (F-1437-3 — a rename does this
   * silently). Observable so a plain boot can assert the art is really on screen.
   */
  stationArt: string[];
};

export class DrillYard {
  readonly group = new THREE.Group();
  private readonly stations: PracticeStation[];
  private readonly targets: TargetState[];
  private readonly geometries = new Set<THREE.BufferGeometry>();
  private readonly materials = new Set<THREE.Material>();
  private readonly stationArtLoaded = new Set<string>();
  private readonly textures = new Set<THREE.Texture>();
  private readonly prompt = document.createElement('div');
  private readonly promptTitle = document.createElement('span');
  private readonly actionButton = document.createElement('button');
  private readonly exitButton = document.createElement('button');
  private nearby: PracticeStation | null = null;
  private grants = 0;
  private lastGrant = 0;
  private rings = 0;
  private currentAt = 0;
  private disposed = false;

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
    this.stations = config.stations.map((station) => ({
      ...station,
      position: new THREE.Vector3(station.x, 0, station.z),
    }));
    this.group.add(this.createAssayTent(), this.createBell());
    this.targets = config.targets.map(({ kind, x, z }) => {
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
    const faucetPosition = this.stationPosition('assay_tent_faucet');
    const bellPosition = this.stationPosition('drill_bell');
    return {
      active: true,
      faucet: { x: faucetPosition.x, z: faucetPosition.z, grants: this.grants, lastAmount: this.lastGrant },
      bell: {
        x: bellPosition.x,
        z: bellPosition.z,
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
      stationArt: [...this.stationArtLoaded].sort(),
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
    this.nearby = this.stationAt(heroPosition);
    this.promptTitle.textContent = this.nearby?.id === 'assay_tent_faucet'
      ? 'The county desk lends practice gold.'
      : this.nearby?.id === 'drill_bell'
        ? 'The drill bell calls one practice wave.'
        : 'The Drill Yard';
    this.actionButton.hidden = this.nearby === null;
    this.actionButton.textContent = this.nearby?.id === 'assay_tent_faucet' ? 'Draw practice gold' : 'Ring for a practice wave';
  }

  nearestInfoTarget(position: THREE.Vector3): WorldInfoNoteTarget | null {
    return this.targets.some((target) => target.kind === 'straw-man' && flatDistance(position, target.position) <= INTERACTION_RADIUS)
      ? { objectClass: 'drill_straw_man' }
      : null;
  }

  interact(heroPosition: THREE.Vector3): boolean {
    const station = this.stationAt(heroPosition);
    if (station?.id === 'assay_tent_faucet') return this.topUp();
    if (station?.id === 'drill_bell') return this.ringBell();
    return false;
  }

  topUp(): boolean {
    const faucetPosition = this.stationPosition('assay_tent_faucet');
    const amount = Math.min(this.config.goldGrant, this.economy.bankCap - this.economy.gold);
    this.lastGrant = Math.max(0, amount);
    if (amount <= 0) {
      this.floatText(faucetPosition, 'Practice purse full', '#8b7d3c');
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
    this.floatText(faucetPosition, `+${amount} practice gold`, '#c4883a');
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
    (target.visual.getObjectByName('DrillLogRotor') ?? target.visual).rotation.z = target.kind === 'straw-man' ? -Math.PI * 0.45 : Math.PI * 0.3;
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
      (target.visual.getObjectByName('DrillLogRotor') ?? target.visual).rotation.z = 0;
      this.spawnTarget(target);
    }
    this.grants = 0;
    this.lastGrant = 0;
    this.rings = 0;
  }

  dispose(): void {
    this.disposed = true;
    for (const target of this.targets) if (target.enemy?.isAlive) this.enemies.recycle(target.enemy);
    this.prompt.remove();
    this.group.removeFromParent();
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    for (const texture of this.textures) texture.dispose();
  }

  private spawnTarget(target: TargetState): void {
    (target.visual.getObjectByName('DrillLogRotor') ?? target.visual).rotation.z = 0;
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
    this.actionButton.addEventListener('click', () => this.nearby?.id === 'assay_tent_faucet' ? this.topUp() : this.nearby?.id === 'drill_bell' && this.ringBell());
    this.exitButton.className = 'building-context-prompt__button';
    this.exitButton.type = 'button';
    this.exitButton.dataset.testid = 'drill-yard-exit';
    this.exitButton.textContent = 'Return to Town';
    this.exitButton.addEventListener('click', this.onExit);
    const trainingTag = document.createElement('p');
    trainingTag.className = 'hud-training-tag';
    trainingTag.dataset.testid = 'drill-yard-training-tag';
    trainingTag.textContent = 'DRILL YARD: training';
    this.prompt.append(trainingTag, icon, this.promptTitle, this.actionButton, this.exitButton);
    parent.append(this.prompt);
  }

  private createAssayTent(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'DrillAssayTent';
    const position = this.stationPosition('assay_tent_faucet');
    group.position.set(position.x, Terrain.visualY(position.x, position.z, 0), position.z);
    const parchment = new THREE.MeshStandardMaterial({ color: '#f5e6c8', roughness: 0.96 });
    const wood = new THREE.MeshStandardMaterial({ color: '#6a4728', roughness: 0.9 });
    const crate = this.mesh(new THREE.BoxGeometry(2.3, 1.2, 1.35), parchment);
    crate.position.y = 0.62;
    const topRail = this.mesh(new THREE.BoxGeometry(2.5, 0.16, 1.5), wood);
    topRail.position.y = 1.25;
    const lowerRail = this.mesh(new THREE.BoxGeometry(2.5, 0.14, 1.5), wood);
    lowerRail.position.y = 0.12;
    const lever = this.mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 8), new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.45, metalness: 0.42 }));
    lever.position.set(0, 1.72, 0);
    lever.rotation.z = -0.45;
    group.add(crate, topRail, lowerRail, lever);
    this.applyStationArt(group, 'prop-drill-faucet-station.png', 3.4);
    return group;
  }

  private createBell(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'DrillBell';
    const position = this.stationPosition('drill_bell');
    group.position.set(position.x, Terrain.visualY(position.x, position.z, 0), position.z);
    const postMaterial = new THREE.MeshStandardMaterial({ color: '#6a4728', roughness: 0.9 });
    const brass = new THREE.MeshStandardMaterial({ color: '#c4883a', roughness: 0.38, metalness: 0.55 });
    const post = this.mesh(new THREE.CylinderGeometry(0.15, 0.18, 2.8, 8), postMaterial);
    post.position.y = 1.4;
    const arm = this.mesh(new THREE.BoxGeometry(1.3, 0.16, 0.16), postMaterial);
    arm.position.set(-0.5, 2.65, 0);
    const bell = this.mesh(new THREE.ConeGeometry(0.48, 0.72, 18, 1, true), brass);
    bell.position.set(-1, 2.18, 0);
    group.add(post, arm, bell);
    this.applyStationArt(group, 'prop-drill-bell-post.png', 3.5);
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
    this.applyStationArt(group, 'prop-straw-man-stand.png', 3.1);
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
    const rotor = new THREE.Group();
    rotor.name = 'DrillLogRotor';
    rotor.add(log, axle);
    group.add(rotor);
    const footGeometry = new THREE.BoxGeometry(0.3, 0.14, 0.9);
    const uprightGeometry = new THREE.BoxGeometry(0.22, 0.9, 0.22);
    for (const x of [-0.97, 0.97]) {
      const foot = this.mesh(footGeometry, wood);
      foot.position.set(x, 0.07, 0);
      const upright = this.mesh(uprightGeometry, wood);
      upright.position.set(x, 0.52, 0);
      group.add(foot, upright);
    }
    return group;
  }

  private mesh<G extends THREE.BufferGeometry, M extends THREE.Material>(geometry: G, material: M): THREE.Mesh<G, M> {
    this.geometries.add(geometry);
    this.materials.add(material);
    return new THREE.Mesh(geometry, material);
  }

  private applyStationArt(group: THREE.Group, filename: string, height: number): void {
    const url = stationArt[`../../assets/processed/${filename}`];
    if (!url) return;
    new THREE.TextureLoader().load(url, (texture) => {
      if (this.disposed) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      this.textures.add(texture);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: 0.04, depthWrite: false });
      this.materials.add(material);
      for (const child of group.children) child.visible = false;
      const sprite = new THREE.Sprite(material);
      sprite.name = `DrillStationArt:${filename}`;
      sprite.position.y = height / 2;
      sprite.scale.set(height, height, 1);
      group.add(sprite);
      this.stationArtLoaded.add(filename);
    });
  }

  private stationAt(position: THREE.Vector3): PracticeStation | null {
    let nearest: PracticeStation | null = null;
    let nearestDistance = Infinity;
    for (const station of this.stations) {
      const distance = flatDistance(position, station.position);
      if (distance < nearestDistance) {
        nearest = station;
        nearestDistance = distance;
      }
    }
    return nearestDistance <= INTERACTION_RADIUS ? nearest : null;
  }

  private stationPosition(id: string): THREE.Vector3 {
    const position = this.stations.find((station) => station.id === id)?.position;
    if (!position) throw new Error(`Missing Drill Yard station: ${id}`);
    return position;
  }
}

function flatDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}
