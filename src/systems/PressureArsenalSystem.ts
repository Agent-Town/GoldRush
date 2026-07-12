import * as THREE from 'three';
import { Balance } from '../game/Balance';
import type { ShooterHandle } from './CombatSystem';
import type { CombatSystem } from './CombatSystem';
import type { PressureSystem } from './PressureSystem';

type WeaponId = 'boilerLance' | 'pressureMortar' | 'skyRocket';

export type PressureArsenalDiagnostics = {
  multiplayerPosture: 'single-player-gated';
  fires: Record<WeaponId, number>;
  pressureSpent: number;
  autoPanSeconds: number;
};

export class PressureArsenalSystem {
  private readonly fires: Record<WeaponId, number> = { boilerLance: 0, pressureMortar: 0, skyRocket: 0 };
  private readonly unsubscribes: Array<() => void> = [];
  private pressureSpent = 0;
  private autoPanSeconds = 0;
  private autoPanSpendProgress = 0;

  constructor(
    combat: CombatSystem,
    private readonly pressure: PressureSystem,
    getPosition: () => THREE.Vector3,
    private readonly hasResearch: (id: string) => boolean,
    private readonly hasBaronMedal: () => boolean,
    private readonly enabled: () => boolean,
  ) {
    const arsenal = Balance.steamworksArsenal;
    this.unsubscribes.push(
      combat.registerShooter(this.shooter('boilerLance', 'boiler_lance', getPosition, {
        range: arsenal.boilerLance.range,
        cooldown: 1 / arsenal.boilerLance.fireRate,
        damage: arsenal.boilerLance.damage,
        projSpeed: arsenal.boilerLance.boltSpeed,
        volley: 3,
        spreadRadians: 0.24,
      }, arsenal.boilerLance.pressureCost)),
      combat.registerShooter(this.shooter('pressureMortar', 'pressure_mortar', getPosition, {
        kind: 'lob',
        range: arsenal.pressureMortar.range,
        cooldown: arsenal.pressureMortar.cooldown,
        damage: arsenal.pressureMortar.damage,
        projSpeed: 0,
        volley: 1,
        aoe: { radius: arsenal.pressureMortar.radius, airTime: arsenal.pressureMortar.airTime },
      }, arsenal.pressureMortar.pressureCost)),
      combat.registerShooter(this.shooter('skyRocket', 'sky_rocket_battery', getPosition, {
        kind: 'lob',
        range: arsenal.skyRocket.range,
        cooldown: arsenal.skyRocket.cooldown,
        damage: arsenal.skyRocket.damage,
        projSpeed: 0,
        volley: arsenal.skyRocket.volley,
        spreadRadius: arsenal.skyRocket.radius * 0.5,
        aoe: { radius: arsenal.skyRocket.radius, airTime: arsenal.skyRocket.airTime },
      }, arsenal.skyRocket.pressureCost)),
    );
  }

  updateAutoPan(delta: number, at: number, channeling: boolean, unlocked: boolean): number {
    if (!this.enabled() || !unlocked || !channeling || this.pressure.stored < Balance.steamworksArsenal.autoPan.pressurePerSecond) {
      this.autoPanSpendProgress = 0;
      return 1;
    }
    this.autoPanSpendProgress += delta;
    while (this.autoPanSpendProgress >= 1) {
      if (!this.spend(Balance.steamworksArsenal.autoPan.pressurePerSecond, at, 'auto_pan')) return 1;
      this.autoPanSpendProgress -= 1;
    }
    if (this.pressure.stored <= 0) return 1;
    this.autoPanSeconds += delta;
    return 1 + Balance.steamworksArsenal.autoPan.panTickMult;
  }

  get turretFireRateMult(): number {
    if (!this.enabled() || !this.hasResearch('boiler_battery')) return 1;
    return Balance.steamworksArsenal.boilerBatteryBands[this.pressure.band === 'empty' ? 'low' : this.pressure.band];
  }

  get diagnostics(): PressureArsenalDiagnostics {
    return {
      multiplayerPosture: 'single-player-gated',
      fires: { ...this.fires },
      pressureSpent: this.pressureSpent,
      autoPanSeconds: Number(this.autoPanSeconds.toFixed(3)),
    };
  }

  reset(): void {
    Object.assign(this.fires, { boilerLance: 0, pressureMortar: 0, skyRocket: 0 });
    this.pressureSpent = 0;
    this.autoPanSeconds = 0;
    this.autoPanSpendProgress = 0;
  }

  dispose(): void {
    for (const unsubscribe of this.unsubscribes) unsubscribe();
  }

  private shooter(
    id: WeaponId,
    researchId: string,
    getPos: () => THREE.Vector3,
    config: Omit<ShooterHandle, 'resumeKey' | 'id' | 'enabled' | 'getPos' | 'onVolleyFired'>,
    pressureCost: number,
  ): ShooterHandle {
    return {
      ...config,
      resumeKey: `steamworks:${id}`,
      id: `steamworks_${id}`,
      suspend: false,
      getPos,
      enabled: () => this.enabled() && this.hasResearch(researchId) && (id !== 'skyRocket' || this.hasBaronMedal()) && this.pressure.stored >= pressureCost,
      onVolleyFired: (at) => {
        if (!this.spend(pressureCost, at, `arsenal_${id}`)) return;
        this.fires[id] += 1;
      },
    };
  }

  private spend(amount: number, at: number, sink: string): boolean {
    if (!this.pressure.spend(amount, at, sink)) return false;
    this.pressureSpent += amount;
    return true;
  }
}
