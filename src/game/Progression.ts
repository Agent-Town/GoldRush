import type { Rng } from '../core/Rng';
import type { GameState } from './GameState';
import { Balance } from './Balance';
import { effectiveStats, type EffectiveStats, type UpgradeStacks } from './StatSheet';
import { isUpgradeId, resolveFiller, upgradeDefById, upgradeDefs, type UpgradeDef, type UpgradeId } from './Upgrades';

export type ProgressionSnapshot = {
  level: number;
  xpInto: number;
  xpNeed: number;
  pendingLevels: number;
  offer: string[] | null;
  stacks: Record<string, number>;
  stats: EffectiveStats;
  eligibility: string[];
};

type ProgressionOptions = {
  state: GameState;
  rng: Rng;
  getBeaconCount: () => number;
  getWave: () => number;
  getMaxHp: () => number;
  onStatsChanged: (stats: EffectiveStats, pickedId: UpgradeId | null) => void;
  onGoldGranted?: (amount: number) => void;
  onHeal?: (amount: number) => void;
  /** Test harness (?nolevel): keep XP math, never open the choice overlay. */
  isChoiceDisabled?: () => boolean;
};

export class Progression {
  private levelValue = 1;
  private xpTotal = 0;
  private spentXp = 0;
  private pendingLevelsValue = 0;
  private readonly stacksValue: UpgradeStacks = {};
  private currentOffer: UpgradeDef[] | null = null;
  private statsValue = effectiveStats(this.stacksValue);
  private fillersDisabled = false;

  constructor(private readonly options: ProgressionOptions) {}

  get level(): number {
    return this.levelValue;
  }

  get xpInto(): number {
    return this.xpTotal - this.spentXp;
  }

  get xpNeed(): number {
    return need(this.levelValue);
  }

  get offer(): readonly UpgradeDef[] | null {
    return this.currentOffer;
  }

  get stats(): EffectiveStats {
    return this.statsValue;
  }

  get snapshot(): ProgressionSnapshot {
    return {
      level: this.levelValue,
      xpInto: this.xpInto,
      xpNeed: this.xpNeed,
      pendingLevels: this.pendingLevelsValue,
      offer: this.currentOffer?.map((def) => def.id) ?? null,
      stacks: { ...this.stacksValue },
      stats: this.statsValue,
      eligibility: this.eligibleDefs().map((def) => def.id),
    };
  }

  consumeXpTotal(xpTotal: number): void {
    if (xpTotal <= this.xpTotal) return;
    this.addXp(xpTotal - this.xpTotal);
  }

  debugGrant(amount: number): void {
    this.addXp(amount);
  }

  setFillersDisabled(disabled: boolean): void {
    this.fillersDisabled = disabled;
  }

  applyUpgrade(id: string): boolean {
    if (!isUpgradeId(id)) return false;
    if (!this.currentOffer?.some((def) => def.id === id)) return false;
    const def = upgradeDefById[id];
    const current = this.stacksValue[id] ?? 0;
    if (current >= def.maxStacks) return false;

    this.stacksValue[id] = current + 1;
    this.statsValue = effectiveStats(this.stacksValue);
    this.options.onStatsChanged(this.statsValue, id);
    if (isFiller(def)) {
      const filler = resolveFiller(def, { wave: this.options.getWave(), maxHp: this.options.getMaxHp() });
      if (filler.goldGrant) this.options.onGoldGranted?.(filler.goldGrant);
      if (filler.heal) this.options.onHeal?.(filler.heal);
    }
    this.pendingLevelsValue = Math.max(0, this.pendingLevelsValue - 1);
    this.currentOffer = null;

    if (this.pendingLevelsValue > 0) {
      this.beginChoice();
    } else {
      this.options.state.transition('playing');
    }
    return true;
  }

  reset(): void {
    this.levelValue = 1;
    this.xpTotal = 0;
    this.spentXp = 0;
    this.pendingLevelsValue = 0;
    this.currentOffer = null;
    for (const id of Object.keys(this.stacksValue) as UpgradeId[]) delete this.stacksValue[id];
    this.statsValue = effectiveStats(this.stacksValue);
    this.options.onStatsChanged(this.statsValue, null);
  }

  private addXp(amount: number): void {
    if (amount <= 0) return;
    this.xpTotal += amount;
    this.checkThresholds();
  }

  private checkThresholds(): void {
    while (this.xpTotal - this.spentXp >= need(this.levelValue)) {
      this.spentXp += need(this.levelValue);
      this.levelValue += 1;
      this.pendingLevelsValue += 1;
    }
    if (this.options.isChoiceDisabled?.()) return;
    if (this.pendingLevelsValue > 0 && this.options.state.current === 'playing') this.beginChoice();
  }

  private beginChoice(): void {
    while (this.pendingLevelsValue > 0) {
      const offer = this.rollOffer();
      if (offer.length > 0) {
        this.currentOffer = offer;
        if (this.options.state.current === 'playing') this.options.state.transition('levelup');
        return;
      }
      this.pendingLevelsValue -= 1;
    }
    this.currentOffer = null;
    if (this.options.state.current === 'levelup') this.options.state.transition('playing');
  }

  private rollOffer(): UpgradeDef[] {
    const pool = this.eligibleDefs().filter((def) => !isFiller(def));
    const offer: UpgradeDef[] = [];
    while (offer.length < 3 && pool.length > 0) {
      const index = this.options.rng.int(0, pool.length);
      const [picked] = pool.splice(index, 1);
      if (picked) offer.push(picked);
    }
    if (offer.length < 3) {
      const fillers = this.eligibleDefs().filter((def) => isFiller(def));
      while (offer.length < 3 && fillers.length > 0) {
        const index = this.options.rng.int(0, fillers.length);
        const [picked] = fillers.splice(index, 1);
        if (picked) offer.push(picked);
      }
    }
    return offer;
  }

  private eligibleDefs(): UpgradeDef[] {
    const beaconCount = this.options.getBeaconCount();
    return upgradeDefs.filter((def) => {
      if (isFiller(def) && this.fillersDisabled) return false;
      if (def.id === 'beacon_dynamo' && beaconCount <= 0) return false;
      return (this.stacksValue[def.id] ?? 0) < def.maxStacks;
    });
  }
}

export function need(level: number): number {
  return Balance.xp.needBase + Balance.xp.needStep * (level - 1);
}

function isFiller(def: UpgradeDef): boolean {
  return 'filler' in def && def.filler === true;
}
