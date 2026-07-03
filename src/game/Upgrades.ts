export const upgradeDefs = [
  {
    id: 'double_tap_coil',
    name: 'Double-Tap Coil',
    description: 'A second spring where one sufficed.',
    maxStacks: 3,
    deltas: { fireRateMult: 0.25 },
  },
  {
    id: 'heavy_spark',
    name: 'Heavy Spark Charge',
    description: 'A brighter charge, stamped twice by the assay clerk.',
    maxStacks: 3,
    deltas: { damageMult: 0.3 },
  },
  {
    id: 'long_resonator',
    name: 'Long-Barrel Resonator',
    description: 'A brass throat for sparks that dislike short errands.',
    maxStacks: 2,
    deltas: { rangeMult: 0.2, boltSpeedMult: 0.2 },
  },
  {
    id: 'split_spark',
    name: 'Split Spark',
    description: 'One patent, two signatures, both arriving hot.',
    maxStacks: 2,
    deltas: { volleyBonus: 1 },
  },
  {
    id: 'tinkers_plating',
    name: "Tinker's Plating",
    description: 'Thin brass mercy, fitted under the coat.',
    maxStacks: 3,
    deltas: { maxHpBonus: 25, heal: 25 },
  },
  {
    id: 'spring_heels',
    name: 'Spring Heels',
    description: 'Boot springs filed for urgent claim work.',
    maxStacks: 3,
    deltas: { moveSpeedMult: 0.12 },
  },
  {
    id: 'pan_legend',
    name: 'Pan Like a Legend',
    description: 'A patent rhythm for finding color before doubt.',
    maxStacks: 2,
    deltas: { panTickMult: -0.3 },
  },
  {
    id: 'prospectors_luck',
    name: "Prospector's Luck",
    description: 'A ledger margin where richer seams keep appearing.',
    maxStacks: 2,
    deltas: { seamCapacityBonus: 10, seamRespawnReduction: 5 },
  },
  {
    id: 'beacon_dynamo',
    name: 'Beacon Dynamo',
    description: 'A humming coil that teaches beacons impatience.',
    maxStacks: 2,
    deltas: { beaconFireRateMult: 0.3 },
  },
] as const;

export type UpgradeDef = (typeof upgradeDefs)[number];
export type UpgradeId = UpgradeDef['id'];

export const upgradeDefById: Record<UpgradeId, UpgradeDef> = upgradeDefs.reduce(
  (defs, def) => {
    defs[def.id] = def;
    return defs;
  },
  {} as Record<UpgradeId, UpgradeDef>,
);

export function isUpgradeId(id: string): id is UpgradeId {
  return id in upgradeDefById;
}
