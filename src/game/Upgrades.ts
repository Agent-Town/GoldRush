import { Balance } from './Balance';

export const upgradeDefs = [
  {
    id: 'double_tap_coil',
    name: 'Double-Tap Coil',
    description: 'A second spring where one sufficed.',
    iconFamily: 'firerate',
    maxStacks: 3,
    deltas: { fireRateMult: 0.25 },
  },
  {
    id: 'heavy_spark',
    name: 'Heavy Spark Charge',
    description: 'A brighter charge, stamped twice by the assay clerk.',
    iconFamily: 'damage',
    maxStacks: 3,
    deltas: { damageMult: 0.3 },
  },
  {
    id: 'long_resonator',
    name: 'Long-Barrel Resonator',
    description: 'A brass throat for sparks that dislike short errands.',
    iconFamily: 'range',
    maxStacks: 2,
    deltas: { rangeMult: 0.2, boltSpeedMult: 0.2 },
  },
  {
    id: 'split_spark',
    name: 'Split Spark',
    description: 'One patent, two signatures, both arriving hot.',
    iconFamily: 'volley',
    maxStacks: 2,
    deltas: { volleyBonus: 1 },
  },
  {
    id: 'tinkers_plating',
    name: "Tinker's Plating",
    description: 'Thin brass mercy, fitted under the coat.',
    iconFamily: 'plating',
    maxStacks: 3,
    deltas: { maxHpBonus: 25, heal: 25 },
  },
  {
    id: 'spring_heels',
    name: 'Spring Heels',
    description: 'Boot springs filed for urgent claim work.',
    iconFamily: 'mobility',
    maxStacks: 3,
    deltas: { moveSpeedMult: 0.12 },
  },
  {
    id: 'pan_legend',
    name: 'Pan Like a Legend',
    description: 'A patent rhythm for finding color before doubt.',
    iconFamily: 'panning',
    maxStacks: 2,
    deltas: { panTickMult: -0.3 },
  },
  {
    id: 'prospectors_luck',
    name: "Prospector's Luck",
    description: 'A ledger margin where richer seams keep appearing.',
    iconFamily: 'prospecting',
    maxStacks: 2,
    deltas: { seamCapacityBonus: 10, seamRespawnReduction: 5 },
  },
  {
    id: 'beacon_dynamo',
    name: 'Beacon Dynamo',
    description: 'A humming coil that teaches beacons impatience.',
    iconFamily: 'beacon',
    maxStacks: 2,
    deltas: { beaconFireRateMult: 0.3 },
  },
  {
    id: 'powder_charge',
    name: 'Powder Charge',
    description: 'A tighter powder cup for the charge rig.',
    iconFamily: 'blast',
    maxStacks: 2,
    deltas: { blastDamageMult: 0.25 },
  },
  {
    id: 'wide_ring',
    name: 'Wide Ring',
    description: 'A broader brass collar for the blast pattern.',
    iconFamily: 'blast',
    maxStacks: 2,
    deltas: { blastRadiusMult: 0.15 },
  },
  {
    id: 'quick_fuse',
    name: 'Quick Fuse',
    description: 'Shorter fuse cord, same steady hand.',
    iconFamily: 'blast',
    maxStacks: 2,
    deltas: { blastCooldownMult: -0.15 },
  },
  {
    id: 'assay_bonus',
    name: 'Assay Bonus',
    description: 'A tidy receipt from the Assay Office.',
    iconFamily: 'gold',
    filler: true,
    weight: 1,
    maxStacks: Number.POSITIVE_INFINITY,
    deltas: { goldGrant: 15 },
  },
  {
    id: 'field_dressing',
    name: 'Field Dressing',
    description: 'A practical bandage from the claim kit.',
    iconFamily: 'mend',
    filler: true,
    weight: 1,
    maxStacks: Number.POSITIVE_INFINITY,
    deltas: { heal: 30 },
  },
  {
    id: 'sharpen',
    name: 'Sharpen',
    description: 'A finer point filed onto the spark patent.',
    iconFamily: 'damage',
    filler: true,
    weight: 1,
    maxStacks: Number.POSITIVE_INFINITY,
    deltas: { damageMult: 0.05 },
  },
] as const;

export type UpgradeDef = (typeof upgradeDefs)[number];
export type UpgradeId = UpgradeDef['id'];
type UpgradeDeltas = UpgradeDef['deltas'];
export type ResolvedFiller = { goldGrant?: number; heal?: number; effectText: string };

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

export function upgradeEffect(def: UpgradeDef): string {
  const deltas: UpgradeDeltas = def.deltas;
  const parts: string[] = [];
  if ('fireRateMult' in deltas) parts.push(`+${percent(deltas.fireRateMult)}% fire rate`);
  if ('damageMult' in deltas) parts.push(`+${percent(deltas.damageMult)}% spark damage`);
  if ('rangeMult' in deltas) parts.push(`+${percent(deltas.rangeMult)}% range`);
  if ('boltSpeedMult' in deltas) parts.push(`+${percent(deltas.boltSpeedMult)}% bolt speed`);
  if ('volleyBonus' in deltas) parts.push(`+${deltas.volleyBonus} spark per volley`);
  if ('maxHpBonus' in deltas) parts.push(`+${deltas.maxHpBonus} max HP`);
  if ('heal' in deltas) parts.push(`heals ${deltas.heal}`);
  if ('goldGrant' in deltas) parts.push(`+${deltas.goldGrant} gold now`);
  if ('moveSpeedMult' in deltas) parts.push(`+${percent(deltas.moveSpeedMult)}% move speed`);
  if ('panTickMult' in deltas) parts.push(`${percent(Math.abs(deltas.panTickMult))}% faster panning`);
  if ('seamCapacityBonus' in deltas) parts.push(`+${deltas.seamCapacityBonus} gold per seam`);
  if ('seamRespawnReduction' in deltas) parts.push(`-${deltas.seamRespawnReduction}s seam respawn`);
  if ('beaconFireRateMult' in deltas) parts.push(`+${percent(deltas.beaconFireRateMult)}% beacon fire rate`);
  if ('blastDamageMult' in deltas) parts.push(`+${percent(deltas.blastDamageMult)}% blast damage`);
  if ('blastRadiusMult' in deltas) parts.push(`+${percent(deltas.blastRadiusMult)}% blast radius`);
  if ('blastCooldownMult' in deltas) parts.push(`${percent(Math.abs(deltas.blastCooldownMult))}% faster blast fuse`);
  return parts.join(', ');
}

export function resolveFiller(def: UpgradeDef, ctx: { wave: number; maxHp: number }): ResolvedFiller {
  if (def.id === 'assay_bonus') {
    const goldGrant = Balance.upgrades.assayGoldPerWave * Math.max(1, ctx.wave);
    return { goldGrant, effectText: `+${goldGrant} gold now` };
  }
  if (def.id === 'field_dressing') {
    const heal = Math.round(Balance.upgrades.fieldDressingHealFrac * ctx.maxHp);
    return { heal, effectText: `heals ${heal}` };
  }
  return { effectText: upgradeEffect(def) };
}

function percent(value: number): number {
  return Math.round(value * 100);
}
