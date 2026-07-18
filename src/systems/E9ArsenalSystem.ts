import * as THREE from 'three';
import type { EventBus, GameEvent } from '../core/EventBus';
import { E9ArsenalPresentation, type E9ArsenalPresentationDiagnostics } from '../entities/E9Arsenal';
import type { ClaimJumperEnemy } from '../entities/Enemy';
import type { EnemyPool } from '../entities/pools';
import { Balance } from '../game/Balance';
import type { CombatSystem, ShooterHandle } from './CombatSystem';
import { WeatherSystem, type WeatherPhase } from './WeatherSystem';

export type E9ArsenalItem = 'stormDraw' | 'stormLance' | 'stormFence' | 'terraformCannon';
type DamagingItem = Exclude<E9ArsenalItem, 'stormFence'>;

export type E9CureArmOutcome = {
  type: 'freed_turned_back' | 'fevered_machine_powered_down' | 'pristine_machine_damaged';
  weapon: DamagingItem;
  enemyId: number;
  variantId: string | null;
  lethal: false;
};

export type E9ArsenalDiagnostics = {
  eraActive: boolean;
  items: E9ArsenalItem[];
  weather: { phase: WeatherPhase; charge: number; capacity: number };
  fires: Record<DamagingItem, number>;
  fenceDeployments: number;
  denialTicks: number;
  pushedDistance: number;
  outcomes: E9CureArmOutcome[];
  presentation: E9ArsenalPresentationDiagnostics;
};

const ITEMS: E9ArsenalItem[] = ['stormDraw', 'stormLance', 'stormFence', 'terraformCannon'];
const OWNER_IDS = {
  stormDraw: 'e9_storm_draw',
  stormLance: 'e9_storm_lance',
  terraformCannon: 'e9_terraform_cannon',
} as const;

export class E9ArsenalSystem {
  readonly group: THREE.Group;

  private readonly presentation = new E9ArsenalPresentation();
  private readonly weather = new WeatherSystem(Balance.e9Arsenal.weather);
  private readonly unregisterShooters: Array<() => void> = [];
  private readonly unsubscribeKill: () => void;
  private readonly lancePositions = Array.from({ length: Balance.turret.maxCount }, () => new THREE.Vector3());
  private readonly fires = { stormDraw: 0, stormLance: 0, terraformCannon: 0 };
  private readonly lastOwnerKills = { stormDraw: 0, stormLance: 0, terraformCannon: 0 };
  private readonly outcomes: E9CureArmOutcome[] = [];
  private charge = 0;
  private fenceDeployments = 0;
  private denialTicks = 0;
  private pushedDistance = 0;
  private lastAt = 0;

  constructor(
    private readonly combat: CombatSystem,
    events: EventBus,
    private readonly enemies: EnemyPool,
    private readonly heroPosition: () => THREE.Vector3,
    private readonly turretPosition: (index: number) => THREE.Vector3 | null,
    private readonly enabled: () => boolean,
    private readonly hasResearch: (id: string) => boolean,
    private readonly onOutcome?: (position: THREE.Vector3, text: string) => void,
  ) {
    this.group = this.presentation.group;
    this.registerShooters();
    this.unsubscribeKill = events.on('enemy_killed', (event) => this.recordOutcome(event));
  }

  update(delta: number, at: number): void {
    this.lastAt = at;
    const active = this.enabled();
    const weather = this.weather.sample(at);
    if (active && weather.phase === 'storm') {
      this.charge = Math.min(Balance.e9Arsenal.weather.chargeCapacity, this.charge + Balance.e9Arsenal.weather.chargePerSecond * delta);
    }
    this.presentation.update(active, this.itemEnabled('stormLance'), at, this.turretPosition, this.enemies.all);
    if (!active) return;

    for (const enemy of this.enemies.all) this.pushFromFence(enemy, delta, at);
  }

  deployFence(position: THREE.Vector3 = this.heroPosition()): boolean {
    if (!this.itemEnabled('stormFence') || !this.presentation.deployFence(position, this.lastAt)) return false;
    this.fenceDeployments += 1;
    return true;
  }

  movementMultiplier(enemy: ClaimJumperEnemy): number {
    if (!this.itemEnabled('stormFence') || !this.presentation.fenceAt(enemy.position, this.lastAt)) return 1;
    this.denialTicks += 1;
    return Balance.e9Arsenal.stormFence.slowMultiplier;
  }

  get diagnostics(): E9ArsenalDiagnostics {
    const eraActive = this.enabled();
    return {
      eraActive,
      items: eraActive ? ITEMS.filter((item) => this.itemEnabled(item)) : [],
      weather: {
        phase: this.weather.sample(this.lastAt).phase,
        charge: round3(this.charge),
        capacity: Balance.e9Arsenal.weather.chargeCapacity,
      },
      fires: { ...this.fires },
      fenceDeployments: this.fenceDeployments,
      denialTicks: this.denialTicks,
      pushedDistance: round3(this.pushedDistance),
      outcomes: [...this.outcomes],
      presentation: this.presentation.diagnostics(this.lastAt),
    };
  }

  reset(): void {
    Object.assign(this.fires, { stormDraw: 0, stormLance: 0, terraformCannon: 0 });
    Object.assign(this.lastOwnerKills, { stormDraw: 0, stormLance: 0, terraformCannon: 0 });
    this.outcomes.length = 0;
    this.charge = 0;
    this.fenceDeployments = 0;
    this.denialTicks = 0;
    this.pushedDistance = 0;
    this.lastAt = 0;
    this.presentation.reset();
  }

  dispose(): void {
    for (const unregister of this.unregisterShooters) unregister();
    this.unsubscribeKill();
    this.presentation.dispose();
  }

  private registerShooters(): void {
    const stormDraw = Balance.e9Arsenal.stormDraw;
    this.unregisterShooters.push(this.combat.registerShooter({
      resumeKey: 'redfields:storm-draw',
      id: OWNER_IDS.stormDraw,
      suspend: false,
      enabled: () => this.itemEnabled('stormDraw') && this.charge >= stormDraw.chargeCost,
      getPos: this.heroPosition,
      range: stormDraw.range,
      cooldown: stormDraw.cooldown,
      damage: stormDraw.damage,
      getDamage: () => Balance.e9Arsenal.stormDraw.damage,
      projSpeed: stormDraw.boltSpeed,
      volley: 1,
      onFire: (at) => {
        this.charge -= Balance.e9Arsenal.stormDraw.chargeCost;
        this.fires.stormDraw += 1;
        const origin = this.heroPosition();
        const target = nearestEnemy(origin, this.enemies.all, Balance.e9Arsenal.stormDraw.range);
        if (target) this.presentation.flashStormDraw(origin, target.position, at);
      },
    }));

    const cannon = Balance.e9Arsenal.terraformCannon;
    this.unregisterShooters.push(this.combat.registerShooter({
      resumeKey: 'redfields:terraform-cannon',
      id: OWNER_IDS.terraformCannon,
      suspend: false,
      kind: 'lob',
      enabled: () => this.itemEnabled('terraformCannon'),
      getPos: this.heroPosition,
      range: cannon.range,
      cooldown: cannon.cooldown,
      damage: cannon.damage,
      getDamage: () => Balance.e9Arsenal.terraformCannon.damage,
      projSpeed: 0,
      volley: 1,
      aoe: { radius: cannon.radius, airTime: cannon.airTime },
      onFire: (at) => {
        this.fires.terraformCannon += 1;
        const origin = this.heroPosition();
        const target = nearestEnemy(origin, this.enemies.all, Balance.e9Arsenal.terraformCannon.range);
        if (target) this.presentation.launchEarth(origin, target.position, at);
      },
    }));

    const lance = Balance.e9Arsenal.stormLance;
    for (let index = 0; index < Balance.turret.maxCount; index += 1) {
      const handle: ShooterHandle = {
        resumeKey: `redfields:storm-lance:${index}`,
        id: OWNER_IDS.stormLance,
        suspend: false,
        enabled: () => this.itemEnabled('stormLance') && this.turretPosition(index) !== null && this.charge >= lance.chargeCost,
        getPos: () => this.lancePosition(index),
        range: lance.range,
        cooldown: lance.cooldown,
        damage: lance.damage,
        getDamage: () => Balance.e9Arsenal.stormLance.damage,
        projSpeed: lance.boltSpeed,
        volley: 1,
        onFire: () => {
          this.charge -= Balance.e9Arsenal.stormLance.chargeCost;
          this.fires.stormLance += 1;
        },
      };
      this.unregisterShooters.push(this.combat.registerShooter(handle));
    }
  }

  private lancePosition(index: number): THREE.Vector3 {
    const source = this.turretPosition(index);
    const target = this.lancePositions[index] ?? this.lancePositions[0]!;
    return source ? target.copy(source) : target.set(10_000, 0, 10_000);
  }

  private pushFromFence(enemy: ClaimJumperEnemy, delta: number, at: number): void {
    if (!enemy.isAlive || !this.itemEnabled('stormFence')) return;
    const field = this.presentation.fenceAt(enemy.position, at);
    if (!field) return;
    let dx = enemy.position.x - field.x;
    let dz = enemy.position.z - field.z;
    const length = Math.hypot(dx, dz);
    if (length < 0.001) {
      dx = 1;
      dz = 0;
    } else {
      dx /= length;
      dz /= length;
    }
    const distance = Balance.e9Arsenal.stormFence.pushPerSecond * delta;
    enemy.position.x += dx * distance;
    enemy.position.z += dz * distance;
    this.pushedDistance += distance;
  }

  private recordOutcome(event: Extract<GameEvent, { type: 'enemy_killed' }>): void {
    const weapon = this.changedKillOwner();
    if (!weapon) return;
    const variantId = event.variantId ?? null;
    const type = event.eliteKind === 'railcar' || variantId === 'old_digger'
      ? 'pristine_machine_damaged'
      : feveredMachine(variantId)
        ? 'fevered_machine_powered_down'
        : 'freed_turned_back';
    this.outcomes.push({ type, weapon, enemyId: event.enemyId, variantId, lethal: false });
    const enemy = this.enemies.all[event.enemyId];
    if (enemy) this.onOutcome?.(enemy.position, type === 'freed_turned_back' ? 'FREED — TURNED BACK' : type === 'fevered_machine_powered_down' ? 'POWERED DOWN' : 'HONEST DAMAGE');
  }

  private changedKillOwner(): DamagingItem | null {
    let changed: DamagingItem | null = null;
    for (const weapon of ['stormDraw', 'stormLance', 'terraformCannon'] as const) {
      const current = this.combat.killsByOwner[OWNER_IDS[weapon]] ?? 0;
      if (current > this.lastOwnerKills[weapon]) changed = weapon;
      this.lastOwnerKills[weapon] = current;
    }
    return changed;
  }

  private itemEnabled(item: E9ArsenalItem): boolean {
    if (!this.enabled()) return false;
    if (item === 'stormDraw') return this.hasResearch('storm_draw');
    if (item === 'stormLance') return this.hasResearch('storm_lance');
    if (item === 'stormFence') return this.hasResearch('storm_fence');
    return this.hasResearch('terraform_cannon');
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
    || variantId?.startsWith('fevered_') === true
    || variantId?.startsWith('lawn_shepherd') === true;
}

function round3(value: number): number {
  return Number(value.toFixed(3));
}
