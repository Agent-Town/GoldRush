import type { Rng, RngState } from '../core/Rng';
import type { GameState } from './GameState';
import { Balance } from './Balance';
import { effectiveStats, type EffectiveStats, type UpgradeStacks } from './StatSheet';
import {
  craftedOfferLimit,
  isMasteryConversionUnlocked,
  isUpgradeId,
  isUpgradeUnlocked,
  resolveFiller,
  upgradeDefById,
  upgradeDefs,
  type UpgradeDef,
  type UpgradeId,
} from './Upgrades';

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

export type ProgressionSuspendState = {
  level: number;
  xpTotal: number;
  spentXp: number;
  pendingLevels: number;
  offer: string[] | null;
  stacks: Record<string, number>;
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
  hasResearchNode?: (id: string) => boolean;
  getCraftingProfile?: () => string;
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
      stacks: stackSnapshot(this.stacksValue),
      stats: this.statsValue,
      eligibility: this.eligibleDefs().map((def) => def.id),
    };
  }

  captureRngState(): RngState {
    return this.options.rng.snapshot();
  }

  restoreRngState(state: RngState): void {
    this.options.rng.restore(state);
  }

  consumeXpTotal(xpTotal: number): void {
    if (xpTotal <= this.xpTotal) return;
    this.addXp(xpTotal - this.xpTotal);
  }

  debugGrant(amount: number): void {
    this.addXp(amount);
  }

  /** Test-only (?debug __GR_TEST__.maxUpgrades): instantly max every non-filler
   *  upgrade so exhaustion/filler e2e skip the slow ~22-pick UI loop that blows
   *  the sandbox's 45s wall. Recomputes stats; does not fire per-pick effects. */
  maxCoreForTest(): void {
    let changed = true;
    while (changed) {
      changed = false;
      for (const def of this.eligibleDefs()) {
        if (isFiller(def)) continue;
        if ((this.stacksValue[def.id] ?? 0) >= def.maxStacks) continue;
        this.stacksValue[def.id] = def.maxStacks;
        changed = true;
      }
    }
    this.statsValue = effectiveStats(this.stacksValue);
    this.options.onStatsChanged(this.statsValue, null);
  }

  setFillersDisabled(disabled: boolean): void {
    this.fillersDisabled = disabled;
  }

  setStacksForTest(stacks: Partial<Record<UpgradeId, number>>): void {
    const craftingProfile = this.craftingProfile();
    for (const id of Object.keys(this.stacksValue) as UpgradeId[]) delete this.stacksValue[id];
    for (const [id, count] of Object.entries(stacks)) {
      if (!isUpgradeId(id) || typeof count !== 'number' || !Number.isFinite(count) || count <= 0) continue;
      const def = upgradeDefById[id];
      if (!isCraftedProfileVisible(def, craftingProfile)) continue;
      this.stacksValue[id] = Math.min(Math.floor(count), def.maxStacks);
    }
    this.statsValue = effectiveStats(this.stacksValue);
    this.options.onStatsChanged(this.statsValue, null);
  }

  rollOfferForTest(): UpgradeId[] {
    return this.rollOffer().map((def) => def.id);
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
    this.options.rng.reset();
    this.levelValue = 1;
    this.xpTotal = 0;
    this.spentXp = 0;
    this.pendingLevelsValue = 0;
    this.currentOffer = null;
    for (const id of Object.keys(this.stacksValue) as UpgradeId[]) delete this.stacksValue[id];
    this.statsValue = effectiveStats(this.stacksValue);
    this.options.onStatsChanged(this.statsValue, null);
  }

  restoreSuspend(state: ProgressionSuspendState): boolean {
    const offer = state.offer?.map((id) => (isUpgradeId(id) ? upgradeDefById[id] : null)) ?? null;
    if (offer?.some((def) => def === null)) return false;
    if (offer && (state.pendingLevels <= 0 || new Set(state.offer ?? []).size !== offer.length)) return false;

    const stacks: UpgradeStacks = {};
    for (const [id, count] of Object.entries(state.stacks)) {
      if (!isUpgradeId(id) || !Number.isInteger(count) || count < 0) return false;
      const maxStacks = upgradeDefById[id].maxStacks;
      if (Number.isFinite(maxStacks) && count > maxStacks) return false;
      if (count > 0) stacks[id] = count;
    }

    this.levelValue = state.level;
    this.xpTotal = state.xpTotal;
    this.spentXp = state.spentXp;
    this.pendingLevelsValue = state.pendingLevels;
    this.currentOffer = offer as UpgradeDef[] | null;
    for (const id of Object.keys(this.stacksValue) as UpgradeId[]) delete this.stacksValue[id];
    Object.assign(this.stacksValue, stacks);
    this.statsValue = effectiveStats(this.stacksValue);
    this.options.onStatsChanged(this.statsValue, null);
    return true;
  }

  resumeSuspendChoice(): void {
    if (this.currentOffer && this.pendingLevelsValue > 0 && this.options.state.current === 'playing') {
      this.options.state.transition('levelup');
    }
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
      const index = this.pickWeightedIndex(pool);
      const [picked] = pool.splice(index, 1);
      if (picked) {
        offer.push(picked);
        if (craftedCount(offer) >= craftedOfferLimit()) {
          for (let i = pool.length - 1; i >= 0; i -= 1) {
            if (pool[i].crafted) pool.splice(i, 1);
          }
        }
      }
    }
    if (offer.length < 3) {
      const fillers = this.eligibleDefs().filter((def) => isFiller(def));
      while (offer.length < 3 && fillers.length > 0) {
        const index = this.pickWeightedIndex(fillers);
        const [picked] = fillers.splice(index, 1);
        if (picked) offer.push(picked);
      }
    }
    return offer;
  }

  private pickWeightedIndex(pool: UpgradeDef[]): number {
    const total = pool.reduce((sum, def) => sum + this.offerWeight(def, pool), 0);
    let needle = this.options.rng.range(0, total);
    for (let index = 0; index < pool.length; index += 1) {
      needle -= this.offerWeight(pool[index], pool);
      if (needle <= 0) return index;
    }
    return pool.length - 1;
  }

  private offerWeight(def: UpgradeDef, pool: readonly UpgradeDef[]): number {
    if (Balance.offers.investBonus <= 0) return 1;
    const familyCards = pool.filter((candidate) => candidate.iconFamily === def.iconFamily).length;
    const investWeight = Balance.offers.investBonus * this.familyStacks(def.iconFamily);
    const researchWeight =
      def.iconFamily === 'prospecting' && this.options.hasResearchNode?.('assay_grading')
        ? Balance.research.assayGradingProspectingOfferWeightBonus
        : 0;
    return (1 + investWeight + researchWeight) / familyCards;
  }

  private familyStacks(family: string): number {
    return this.visibleUpgradeDefs().reduce(
      (total, def) => total + (def.iconFamily === family ? (this.stacksValue[def.id] ?? 0) : 0),
      0,
    );
  }

  private eligibleDefs(): UpgradeDef[] {
    const beaconCount = this.options.getBeaconCount();
    const hasNode = (id: string) => this.options.hasResearchNode?.(id) === true;
    return this.visibleUpgradeDefs().filter((def) => {
      if (!isUpgradeUnlocked(def, hasNode)) return false;
      if (!isMasteryConversionUnlocked(def, this.stacksValue, this.options.hasResearchNode ? hasNode : undefined)) return false;
      if (isFiller(def) && this.fillersDisabled) return false;
      if (def.minWave !== undefined && this.options.getWave() < def.minWave) return false;
      if (def.id === 'beacon_dynamo' && beaconCount <= 0) return false;
      return (this.stacksValue[def.id] ?? 0) < def.maxStacks;
    });
  }

  private visibleUpgradeDefs(): readonly UpgradeDef[] {
    const craftingProfile = this.craftingProfile();
    return upgradeDefs.filter((def) => isCraftedProfileVisible(def, craftingProfile));
  }

  private craftingProfile(): string {
    return this.options.getCraftingProfile?.() ?? 'local_prospector';
  }
}

export function need(level: number): number {
  return Balance.xp.needBase + Balance.xp.needStep * (level - 1);
}

function isFiller(def: UpgradeDef): boolean {
  return 'filler' in def && def.filler === true;
}

function craftedCount(defs: readonly UpgradeDef[]): number {
  return defs.filter((def) => def.crafted === true).length;
}

function isCraftedProfileVisible(def: UpgradeDef, craftingProfile: string): boolean {
  return def.crafted !== true || def.craftedProfile === craftingProfile;
}

function stackSnapshot(stacks: UpgradeStacks): Record<string, number> {
  const snapshot: Record<string, number> = {};
  for (const [id, count] of Object.entries(stacks)) {
    if (typeof count === 'number') snapshot[id] = count;
  }
  return snapshot;
}
