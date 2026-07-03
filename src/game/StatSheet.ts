import { upgradeDefs, type UpgradeId } from './Upgrades';

export type UpgradeStacks = Partial<Record<UpgradeId, number>>;

export type EffectiveStats = {
  fireRateMult: number;
  damageMult: number;
  rangeMult: number;
  boltSpeedMult: number;
  volleyBonus: number;
  maxHpBonus: number;
  moveSpeedMult: number;
  panTickMult: number;
  seamCapacityBonus: number;
  seamRespawnReduction: number;
  beaconFireRateMult: number;
};

export const baseStats: EffectiveStats = {
  fireRateMult: 1,
  damageMult: 1,
  rangeMult: 1,
  boltSpeedMult: 1,
  volleyBonus: 0,
  maxHpBonus: 0,
  moveSpeedMult: 1,
  panTickMult: 1,
  seamCapacityBonus: 0,
  seamRespawnReduction: 0,
  beaconFireRateMult: 1,
};

export function effectiveStats(stacks: UpgradeStacks): EffectiveStats {
  const stats: EffectiveStats = { ...baseStats };

  for (const def of upgradeDefs) {
    const count = stacks[def.id] ?? 0;
    if (count <= 0) continue;
    const deltas = def.deltas;
    if ('fireRateMult' in deltas) stats.fireRateMult += deltas.fireRateMult * count;
    if ('damageMult' in deltas) stats.damageMult += deltas.damageMult * count;
    if ('rangeMult' in deltas) stats.rangeMult += deltas.rangeMult * count;
    if ('boltSpeedMult' in deltas) stats.boltSpeedMult += deltas.boltSpeedMult * count;
    if ('volleyBonus' in deltas) stats.volleyBonus += deltas.volleyBonus * count;
    if ('maxHpBonus' in deltas) stats.maxHpBonus += deltas.maxHpBonus * count;
    if ('moveSpeedMult' in deltas) stats.moveSpeedMult += deltas.moveSpeedMult * count;
    if ('panTickMult' in deltas) stats.panTickMult += deltas.panTickMult * count;
    if ('seamCapacityBonus' in deltas) stats.seamCapacityBonus += deltas.seamCapacityBonus * count;
    if ('seamRespawnReduction' in deltas) stats.seamRespawnReduction += deltas.seamRespawnReduction * count;
    if ('beaconFireRateMult' in deltas) stats.beaconFireRateMult += deltas.beaconFireRateMult * count;
  }

  return stats;
}
