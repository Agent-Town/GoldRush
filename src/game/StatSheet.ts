import { Balance } from './Balance';
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
  stockpileCapBonus: number;
  beaconFireRateMult: number;
  blastDamageMult: number;
  blastRadiusMult: number;
  blastCooldownMult: number;
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
  stockpileCapBonus: 0,
  beaconFireRateMult: 1,
  blastDamageMult: 1,
  blastRadiusMult: 1,
  blastCooldownMult: 1,
};

export function effectiveStats(stacks: UpgradeStacks): EffectiveStats {
  const stats: EffectiveStats = { ...baseStats };

  for (const def of upgradeDefs) {
    const count = stacks[def.id] ?? 0;
    if (count <= 0) continue;
    const deltas = def.deltas;
    if (deltas.fireRateMult !== undefined) stats.fireRateMult += deltas.fireRateMult * count;
    if (deltas.damageMult !== undefined) stats.damageMult += deltas.damageMult * count;
    if (deltas.rangeMult !== undefined) stats.rangeMult += deltas.rangeMult * count;
    if (deltas.boltSpeedMult !== undefined) stats.boltSpeedMult += deltas.boltSpeedMult * count;
    if (deltas.volleyBonus !== undefined) stats.volleyBonus += deltas.volleyBonus * count;
    if (deltas.maxHpBonus !== undefined) stats.maxHpBonus += deltas.maxHpBonus * count;
    if (deltas.moveSpeedMult !== undefined) stats.moveSpeedMult += deltas.moveSpeedMult * count;
    if (deltas.panTickMult !== undefined) stats.panTickMult += deltas.panTickMult * count;
    if (deltas.seamCapacityBonus !== undefined) stats.seamCapacityBonus += deltas.seamCapacityBonus * count;
    if (deltas.seamRespawnReduction !== undefined) stats.seamRespawnReduction += deltas.seamRespawnReduction * count;
    if (deltas.stockpileCapBonus !== undefined) stats.stockpileCapBonus += deltas.stockpileCapBonus * count;
    if (deltas.beaconFireRateMult !== undefined) stats.beaconFireRateMult += deltas.beaconFireRateMult * count;
    if (deltas.blastDamageMult !== undefined) stats.blastDamageMult += deltas.blastDamageMult * count;
    if (deltas.blastRadiusMult !== undefined) stats.blastRadiusMult += deltas.blastRadiusMult * count;
    if (deltas.blastCooldownMult !== undefined) stats.blastCooldownMult += deltas.blastCooldownMult * count;
  }

  stats.blastRadiusMult = Math.min(stats.blastRadiusMult, Balance.eraCaps.blastRadiusMult);
  stats.seamCapacityBonus = Math.min(stats.seamCapacityBonus, Balance.eraCaps.seamCapacityBonus);
  stats.stockpileCapBonus = Math.min(stats.stockpileCapBonus, Balance.eraCaps.stockpileCapBonus);
  return stats;
}
