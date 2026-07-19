import * as THREE from 'three';
import type { EventBus } from '../core/EventBus';
import { E7ArsenalView } from '../entities/E7Arsenal';
import { Balance } from '../game/Balance';
import { terrainLineOfSight } from '../sim/TileHeight';
import type { CombatSystem, ShooterHandle } from './CombatSystem';

export type E7ArsenalItem = 'playbook-slaved-spark-rig' | 'beam-relay-turret' | 'signal-jammer' | 'report-rocket';
type E7WeaponId = 'playbookSparkRig' | 'beamRelay' | 'signalJammer' | 'reportRocket';
type CureEvent = {
  type: 'turned-back' | 'powered-down';
  item: E7ArsenalItem;
  enemyId: number;
  variantId: string | null;
};

const ITEMS: readonly E7ArsenalItem[] = [
  'playbook-slaved-spark-rig',
  'beam-relay-turret',
  'signal-jammer',
  'report-rocket',
];
const OWNER_TO_ITEM: Readonly<Record<string, E7ArsenalItem>> = {
  e7_playbook_spark_rig: 'playbook-slaved-spark-rig',
  e7_beam_relay: 'beam-relay-turret',
  e7_signal_jammer: 'signal-jammer',
  e7_report_rocket: 'report-rocket',
};
const MACHINE_VARIANTS = new Set(['steam_wrecker', 'feral_toaster', 'lawn_shepherd', 'rogue_automaton', 'corsair_skiff']);

export type E7ArsenalDiagnostics = {
  enabled: boolean;
  items: readonly E7ArsenalItem[];
  fires: Record<E7WeaponId, number>;
  relayLinks: number;
  activeRelayTurrets: number;
  jammerDeployed: boolean;
  playbookSlaved: boolean;
  turretSilhouetteHeight: number;
  cureEvents: readonly CureEvent[];
  deathEvents: 0;
};

export class E7ArsenalSystem {
  readonly view = new E7ArsenalView();

  private readonly fires: Record<E7WeaponId, number> = { playbookSparkRig: 0, beamRelay: 0, signalJammer: 0, reportRocket: 0 };
  private readonly cureEvents: CureEvent[] = [];
  private readonly seenOwnerKills: Record<string, number> = {};
  private readonly unsubscribes: Array<() => void> = [];
  private readonly jammerPosition = new THREE.Vector3();
  private activeTurrets: readonly { x: number; z: number }[] = [];
  private jammerDeployed = false;

  constructor(
    private readonly combat: CombatSystem,
    events: EventBus,
    private readonly heroPosition: () => THREE.Vector3,
    private readonly playbookActorPosition: () => THREE.Vector3 | null,
    private readonly turretPositions: () => readonly { x: number; z: number }[],
    private readonly enabled: () => boolean,
    private readonly signalRelayLinked?: (id: string) => boolean | undefined,
    private readonly signalRelayCount?: () => number | undefined,
  ) {
    for (let index = 0; index < Balance.turret.maxCount; index += 1) this.registerRelay(index);
    this.registerShooter('signalJammer', {
      resumeKey: 'e7:signal-jammer',
      id: 'e7_signal_jammer',
      enabled: () => this.enabled() && this.jammerDeployed,
      getPos: () => this.jammerPosition,
      canTarget: (enemy) => cureTarget(enemy) && MACHINE_VARIANTS.has(enemy.variantId ?? ''),
      range: Balance.e7Arsenal.signalJammer.range,
      cooldown: 1 / Balance.e7Arsenal.signalJammer.fireRate,
      damage: Balance.e7Arsenal.signalJammer.damage,
      getDamage: () => Balance.e7Arsenal.signalJammer.damage,
      projSpeed: Balance.e7Arsenal.signalJammer.boltSpeed,
      volley: 1,
    });
    this.registerShooter('reportRocket', {
      resumeKey: 'e7:report-rocket',
      id: 'e7_report_rocket',
      kind: 'lob',
      enabled: this.enabled,
      getPos: this.heroPosition,
      canTarget: cureTarget,
      range: Balance.e7Arsenal.reportRocket.range,
      cooldown: Balance.e7Arsenal.reportRocket.cooldown,
      damage: Balance.e7Arsenal.reportRocket.damage,
      getDamage: () => Balance.e7Arsenal.reportRocket.damage,
      projSpeed: 0,
      volley: Balance.e7Arsenal.reportRocket.volley,
      aoe: { radius: Balance.e7Arsenal.reportRocket.radius, airTime: Balance.e7Arsenal.reportRocket.airTime },
    });
    this.unsubscribes.push(events.on('enemy_killed', (event) => this.recordCure(event.enemyId, event.variantId ?? null)));
  }

  recordPlaybookFire(): void {
    if (this.enabled()) this.fires.playbookSparkRig += 1;
  }

  update(at: number): void {
    const active = this.enabled();
    if (active && !this.jammerDeployed) {
      const hero = this.heroPosition();
      this.jammerPosition.set(
        hero.x + Balance.e7Arsenal.signalJammer.deployOffsetX,
        0,
        hero.z + Balance.e7Arsenal.signalJammer.deployOffsetZ,
      );
      this.jammerDeployed = true;
    }
    this.activeTurrets = active ? this.turretPositions() : [];
    this.view.update(active, at, this.activeTurrets, active && this.jammerDeployed ? this.jammerPosition : null);
  }

  get diagnostics(): E7ArsenalDiagnostics {
    const active = this.enabled();
    const turrets = active ? this.activeTurrets : [];
    return {
      enabled: active,
      items: active ? ITEMS : [],
      fires: { ...this.fires },
      relayLinks: this.signalRelayCount?.() ?? relayLinks(turrets),
      activeRelayTurrets: turrets.length,
      jammerDeployed: active && this.jammerDeployed,
      playbookSlaved: active && this.playbookActorPosition() !== null,
      turretSilhouetteHeight: Balance.e7Arsenal.beamRelay.silhouetteHeight,
      cureEvents: [...this.cureEvents],
      deathEvents: 0,
    };
  }

  reset(): void {
    Object.assign(this.fires, { playbookSparkRig: 0, beamRelay: 0, signalJammer: 0, reportRocket: 0 });
    this.cureEvents.length = 0;
    this.activeTurrets = [];
    this.jammerDeployed = false;
    for (const owner of Object.keys(OWNER_TO_ITEM)) this.seenOwnerKills[owner] = this.combat.killsByOwner[owner] ?? 0;
    this.view.reset();
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribes) unsubscribe();
    this.view.dispose();
  }

  private registerRelay(index: number): void {
    const position = new THREE.Vector3();
    this.registerShooter('beamRelay', {
      resumeKey: `e7:beam-relay:${index}`,
      id: 'e7_beam_relay',
      enabled: () => this.enabled() && (this.signalRelayLinked?.(`turret-${index}`) ?? relayTarget(this.activeTurrets, index) !== null),
      getPos: () => {
        const source = this.activeTurrets[index];
        return source ? position.set(source.x, 0, source.z) : position;
      },
      range: Balance.e7Arsenal.beamRelay.range,
      canTarget: cureTarget,
      cooldown: 1 / Balance.e7Arsenal.beamRelay.fireRate,
      damage: Balance.e7Arsenal.beamRelay.damage,
      getDamage: () => Balance.e7Arsenal.beamRelay.damage,
      projSpeed: Balance.e7Arsenal.beamRelay.boltSpeed,
      volley: 1,
    });
  }

  private registerShooter(id: E7WeaponId, handle: ShooterHandle): void {
    handle.suspend = false;
    const onVolleyFired = handle.onVolleyFired;
    handle.onVolleyFired = (at) => {
      onVolleyFired?.(at);
      this.fires[id] += 1;
    };
    this.unsubscribes.push(this.combat.registerShooter(handle));
  }

  private recordCure(enemyId: number, variantId: string | null): void {
    for (const [owner, item] of Object.entries(OWNER_TO_ITEM)) {
      const kills = this.combat.killsByOwner[owner] ?? 0;
      if (kills <= (this.seenOwnerKills[owner] ?? 0)) continue;
      this.seenOwnerKills[owner] = kills;
      this.cureEvents.push({
        type: MACHINE_VARIANTS.has(variantId ?? '') ? 'powered-down' : 'turned-back',
        item,
        enemyId,
        variantId,
      });
      return;
    }
  }
}

function cureTarget(enemy: { eliteKind: unknown; bossGroupId: unknown }): boolean {
  return !enemy.eliteKind && !enemy.bossGroupId;
}

function relayTarget(positions: readonly { x: number; z: number }[], index: number): { x: number; z: number } | null {
  const source = positions[index];
  if (!source) return null;
  return positions.find((target, targetIndex) => targetIndex !== index && terrainLineOfSight(source, target)) ?? null;
}

function relayLinks(positions: readonly { x: number; z: number }[]): number {
  let links = 0;
  for (let index = 0; index < positions.length; index += 1) if (relayTarget(positions, index)) links += 1;
  return Math.floor(links / 2);
}
