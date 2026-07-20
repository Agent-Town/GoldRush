import * as THREE from 'three';
import type { EventBus, GameEvent } from '../core/EventBus';
import { E6ArsenalPresentation, type E6ArsenalPresentationDiagnostics } from '../entities/E6Arsenal';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';
import type { CombatSystem, ShooterHandle } from './CombatSystem';
import type { DecayScheduler } from './DecaySystem';

export type E6ArsenalItem = 'sunlineBeam' | 'sunlineMount' | 'halfLifeCaltrops' | 'tongsThrown';
export type CureArmOutcome = {
  type: 'freed_turned_back' | 'fevered_machine_powered_down' | 'pristine_machine_damaged';
  weapon: Exclude<E6ArsenalItem, 'halfLifeCaltrops'>;
  enemyId: number;
  variantId: string | null;
  lethal: false;
};

export type E6ArsenalDiagnostics = {
  eraActive: boolean;
  items: E6ArsenalItem[];
  fires: Record<Exclude<E6ArsenalItem, 'halfLifeCaltrops'>, number>;
  caltropsDeployments: number;
  denialTicks: number;
  outcomes: CureArmOutcome[];
  presentation: E6ArsenalPresentationDiagnostics;
};

const ITEMS: E6ArsenalItem[] = ['sunlineBeam', 'sunlineMount', 'halfLifeCaltrops', 'tongsThrown'];
const OWNER_IDS = {
  sunlineBeam: 'e6_sunline_beam',
  sunlineMount: 'e6_sunline_mount',
  tongsThrown: 'e6_tongs_thrown',
} as const;

export function e6CureArmForOwner(ownerId: string): Exclude<E6ArsenalItem, 'halfLifeCaltrops'> | null {
  for (const [weapon, id] of Object.entries(OWNER_IDS) as Array<[Exclude<E6ArsenalItem, 'halfLifeCaltrops'>, string]>) {
    if (id === ownerId) return weapon;
  }
  return null;
}

export class E6ArsenalSystem {
  readonly group: THREE.Group;

  private readonly presentation: E6ArsenalPresentation;
  private readonly unregisterShooters: Array<() => void> = [];
  private readonly unsubscribeKill: () => void;
  private readonly mountPositions = Array.from({ length: Balance.turret.maxCount }, () => new THREE.Vector3());
  private readonly fires = { sunlineBeam: 0, sunlineMount: 0, tongsThrown: 0 };
  private readonly lastOwnerKills = { sunlineBeam: 0, sunlineMount: 0, tongsThrown: 0 };
  private readonly outcomes: CureArmOutcome[] = [];
  private caltropsCooldown = 0;
  private caltropsDeployments = 0;
  private denialTicks = 0;

  constructor(
    private readonly combat: CombatSystem,
    events: EventBus,
    decay: DecayScheduler,
    private readonly enemies: EnemyPool,
    private readonly heroPosition: () => THREE.Vector3,
    private readonly turretPosition: (index: number) => THREE.Vector3 | null,
    private readonly enabled: () => boolean,
    private readonly hasResearch: (id: string) => boolean,
    private readonly onOutcome?: (position: THREE.Vector3, text: string) => void,
  ) {
    this.presentation = new E6ArsenalPresentation(decay);
    this.group = this.presentation.group;
    this.registerShooters();
    this.unsubscribeKill = events.on('enemy_killed', (event) => this.recordOutcome(event));
  }

  update(delta: number, at: number): void {
    const active = this.enabled();
    this.presentation.update(active, this.itemEnabled('sunlineMount'), at, this.turretPosition, this.enemies.all);
    if (!active) return;
    this.caltropsCooldown = Math.max(0, this.caltropsCooldown - delta);
    if (this.caltropsCooldown > 0) return;
    const hero = this.heroPosition();
    if (!nearestEnemy(hero, this.enemies.all, Balance.e6Arsenal.halfLifeCaltrops.triggerRange)) return;
    if (this.deployCaltrops(hero)) this.caltropsCooldown = Balance.e6Arsenal.halfLifeCaltrops.cooldown;
  }

  deployCaltrops(position: THREE.Vector3 = this.heroPosition()): boolean {
    if (!this.itemEnabled('halfLifeCaltrops') || !this.presentation.deployCaltrops(position)) return false;
    this.caltropsDeployments += 1;
    return true;
  }

  movementMultiplier(enemy: ClaimJumperEnemy): number {
    if (!this.itemEnabled('halfLifeCaltrops')) return 1;
    const multiplier = this.presentation.movementMultiplier(enemy.position);
    if (multiplier < 1) this.denialTicks += 1;
    return multiplier;
  }

  get diagnostics(): E6ArsenalDiagnostics {
    const eraActive = this.enabled();
    return {
      eraActive,
      items: eraActive ? ITEMS.filter((item) => this.itemEnabled(item)) : [],
      fires: { ...this.fires },
      caltropsDeployments: this.caltropsDeployments,
      denialTicks: this.denialTicks,
      outcomes: [...this.outcomes],
      presentation: this.presentation.diagnostics(),
    };
  }

  reset(): void {
    Object.assign(this.fires, { sunlineBeam: 0, sunlineMount: 0, tongsThrown: 0 });
    Object.assign(this.lastOwnerKills, { sunlineBeam: 0, sunlineMount: 0, tongsThrown: 0 });
    this.outcomes.length = 0;
    this.caltropsCooldown = 0;
    this.caltropsDeployments = 0;
    this.denialTicks = 0;
    this.presentation.reset();
  }

  dispose(): void {
    for (const unregister of this.unregisterShooters) unregister();
    this.unsubscribeKill();
    this.presentation.dispose();
  }

  recordPowerDown(enemy: ClaimJumperEnemy, ownerId: string): boolean {
    const weapon = e6CureArmForOwner(ownerId);
    if (!weapon || !this.enabled()) return false;
    this.addOutcome(enemy, weapon, 'fevered_machine_powered_down');
    return true;
  }

  private registerShooters(): void {
    const beam = Balance.e6Arsenal.sunlineBeam;
    this.unregisterShooters.push(
      this.combat.registerShooter({
        resumeKey: 'atomic:sunline-beam',
        id: OWNER_IDS.sunlineBeam,
        suspend: false,
        enabled: () => this.itemEnabled('sunlineBeam'),
        getPos: this.heroPosition,
        range: beam.range,
        cooldown: beam.cooldown,
        damage: beam.damage,
        getDamage: () => Balance.e6Arsenal.sunlineBeam.damage,
        projSpeed: beam.boltSpeed,
        volley: 1,
        onFire: (at) => {
          this.fires.sunlineBeam += 1;
          const origin = this.heroPosition();
          const target = nearestEnemy(origin, this.enemies.all, Balance.e6Arsenal.sunlineBeam.range);
          if (target) this.presentation.flashBeam(origin, target.position, at);
        },
      }),
    );

    const tongs = Balance.e6Arsenal.tongsThrown;
    this.unregisterShooters.push(
      this.combat.registerShooter({
        resumeKey: 'atomic:tongs-thrown',
        id: OWNER_IDS.tongsThrown,
        suspend: false,
        kind: 'lob',
        enabled: () => this.itemEnabled('tongsThrown'),
        getPos: this.heroPosition,
        range: tongs.range,
        cooldown: tongs.cooldown,
        damage: tongs.damage,
        getDamage: () => Balance.e6Arsenal.tongsThrown.damage,
        projSpeed: 0,
        volley: 1,
        aoe: { radius: tongs.radius, airTime: tongs.airTime },
        onFire: (at) => {
          this.fires.tongsThrown += 1;
          const origin = this.heroPosition();
          const target = nearestEnemy(origin, this.enemies.all, Balance.e6Arsenal.tongsThrown.range);
          if (target) this.presentation.throwTongs(origin, target.position, at);
        },
      }),
    );

    const mount = Balance.e6Arsenal.sunlineMount;
    for (let index = 0; index < Balance.turret.maxCount; index += 1) {
      const handle: ShooterHandle = {
        resumeKey: `atomic:sunline-mount:${index}`,
        id: OWNER_IDS.sunlineMount,
        suspend: false,
        enabled: () => this.itemEnabled('sunlineMount') && this.turretPosition(index) !== null,
        getPos: () => this.mountPosition(index),
        range: mount.range,
        cooldown: mount.cooldown,
        damage: mount.damage,
        getDamage: () => Balance.e6Arsenal.sunlineMount.damage,
        projSpeed: mount.boltSpeed,
        volley: 1,
        onFire: () => { this.fires.sunlineMount += 1; },
      };
      this.unregisterShooters.push(this.combat.registerShooter(handle));
    }
  }

  private mountPosition(index: number): THREE.Vector3 {
    const source = this.turretPosition(index);
    const target = this.mountPositions[index] ?? this.mountPositions[0]!;
    return source ? target.copy(source) : target.set(10_000, 0, 10_000);
  }

  private recordOutcome(event: Extract<GameEvent, { type: 'enemy_killed' }>): void {
    const weapon = this.changedKillOwner();
    if (!weapon) return;
    const variantId = event.variantId ?? null;
    const type = event.eliteKind === 'railcar'
      ? 'pristine_machine_damaged'
      : feveredMachine(variantId)
        ? 'fevered_machine_powered_down'
        : 'freed_turned_back';
    const enemy = this.enemies.all[event.enemyId];
    if (enemy) this.addOutcome(enemy, weapon, type);
  }

  private addOutcome(
    enemy: ClaimJumperEnemy,
    weapon: Exclude<E6ArsenalItem, 'halfLifeCaltrops'>,
    type: CureArmOutcome['type'],
  ): void {
    this.outcomes.push({ type, weapon, enemyId: enemy.id, variantId: enemy.variantId, lethal: false });
    this.onOutcome?.(enemy.position, type === 'freed_turned_back' ? 'FREED — TURNED BACK' : type === 'fevered_machine_powered_down' ? 'POWERED DOWN' : 'PRISTINE IRON');
  }

  private changedKillOwner(): Exclude<E6ArsenalItem, 'halfLifeCaltrops'> | null {
    let changed: Exclude<E6ArsenalItem, 'halfLifeCaltrops'> | null = null;
    for (const weapon of ['sunlineBeam', 'sunlineMount', 'tongsThrown'] as const) {
      const current = this.combat.killsByOwner[OWNER_IDS[weapon]] ?? 0;
      if (current > this.lastOwnerKills[weapon]) changed = weapon;
      this.lastOwnerKills[weapon] = current;
    }
    return changed;
  }

  private itemEnabled(item: E6ArsenalItem): boolean {
    if (!this.enabled()) return false;
    if (item === 'sunlineMount') return this.hasResearch('sunline_mount');
    if (item === 'halfLifeCaltrops') return this.hasResearch('half_life_caltrops');
    return this.hasResearch('sunline_beam');
  }
}

function nearestEnemy(origin: THREE.Vector3, enemies: readonly ClaimJumperEnemy[], range: number): ClaimJumperEnemy | null {
  let nearest: ClaimJumperEnemy | null = null;
  let nearestSq = range * range;
  for (const enemy of enemies) {
    if (!enemy.isAlive) continue;
    const dx = enemy.position.x - origin.x;
    const dz = enemy.position.z - origin.z;
    const distanceSq = dx * dx + dz * dz;
    if (distanceSq >= nearestSq) continue;
    nearest = enemy;
    nearestSq = distanceSq;
  }
  return nearest;
}

function feveredMachine(variantId: string | null): boolean {
  return variantId === 'steam_wrecker'
    || variantId === 'homemaker_9000'
    || variantId?.startsWith('feral_') === true
    || variantId?.startsWith('lawn_shepherd') === true;
}
