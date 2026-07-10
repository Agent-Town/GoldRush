import { Balance } from './Balance';

export type BuildableId =
  | 'sentry_beacon'
  | 'palisade'
  | 'sluice'
  | 'stockpile'
  | 'turret'
  | 'assay_office'
  | 'lantern_post';
export type BuildPlacement = 'bank' | 'river-adjacent' | 'any';
export type BuildablePowerDef = {
  produces?: number;
  consumes?: number;
  relay?: boolean;
};

export type BuildableDef = {
  id: BuildableId;
  displayName: string;
  blurb?: string | (() => string);
  costCurve: (built: number) => number;
  footprint: { w: number; d: number };
  hpMax: number | null;
  placement: BuildPlacement;
  slotFamily: `building.${BuildableId}`;
  maxCount: number;
  iconSlot: `ui.build.icon.${BuildableId}`;
  portraitSlug?: string;
  rotatable?: boolean;
  power?: BuildablePowerDef;
};

export const buildableDefs: readonly BuildableDef[] = [
  {
    id: 'sentry_beacon',
    displayName: 'Sentry Beacon',
    blurb: () => `Lights the dark and slows what it touches — radius ${formatBuildNumber(Balance.beacon.range)}wu.`,
    costCurve: beaconCost,
    footprint: { w: 1, d: 1 },
    hpMax: Balance.wreck.hp.sentry_beacon,
    placement: 'bank',
    slotFamily: 'building.sentry_beacon',
    maxCount: Balance.beacon.maxCount,
    iconSlot: 'ui.build.icon.sentry_beacon',
    portraitSlug: 'sentry-beacon',
  },
  {
    id: 'palisade',
    displayName: 'Palisade',
    blurb: 'Timber that holds. Bandits break it before you.',
    costCurve: () => Balance.palisade.cost,
    footprint: { w: 1, d: 3 },
    hpMax: Balance.wreck.hp.palisade,
    placement: 'bank',
    slotFamily: 'building.palisade',
    maxCount: Balance.palisade.maxCount,
    iconSlot: 'ui.build.icon.palisade',
    portraitSlug: 'palisade',
    rotatable: true,
  },
  {
    id: 'sluice',
    displayName: 'Sluice Works',
    blurb: () => `Works the river for you — ${formatBuildNumber(Balance.sluice.goldPerCycle)}g per cycle beside water.`,
    costCurve: () => Balance.sluice.cost,
    footprint: { w: 2, d: 1 },
    hpMax: Balance.wreck.hp.sluice,
    placement: 'river-adjacent',
    slotFamily: 'building.sluice',
    maxCount: Balance.sluice.maxCount,
    iconSlot: 'ui.build.icon.sluice',
    portraitSlug: 'sluice-works',
  },
  {
    id: 'stockpile',
    displayName: 'Stockpile Yard',
    blurb: () => `Holds +${formatBuildNumber(Balance.stockpile.capBonus)} gold above the pan cap.`,
    costCurve: () => Balance.stockpile.cost,
    footprint: { w: 1.5, d: 1.5 },
    hpMax: Balance.wreck.hp.stockpile,
    placement: 'bank',
    slotFamily: 'building.stockpile',
    maxCount: Balance.stockpile.maxCount,
    iconSlot: 'ui.build.icon.stockpile',
    portraitSlug: 'stockpile-yard',
  },
  {
    id: 'turret',
    displayName: 'Signal Turret',
    blurb: () => `Spark bolts, line-of-sight, ${formatBuildNumber(Balance.turret.range)}wu range.`,
    costCurve: turretCost,
    footprint: { w: 1, d: 1 },
    hpMax: Balance.wreck.hp.turret,
    placement: 'bank',
    slotFamily: 'building.turret',
    maxCount: Balance.turret.maxCount,
    iconSlot: 'ui.build.icon.turret',
    portraitSlug: 'signal-turret',
  },
  {
    id: 'lantern_post',
    displayName: 'Lantern Post',
    blurb: 'A cheap light-only post for holding the Night Shift.',
    costCurve: () => Balance.lanternPost.cost,
    footprint: { w: 0.8, d: 0.8 },
    hpMax: Balance.wreck.hp.lantern_post,
    placement: 'bank',
    slotFamily: 'building.lantern_post',
    maxCount: Balance.lanternPost.maxCount,
    iconSlot: 'ui.build.icon.lantern_post',
  },
  {
    id: 'assay_office',
    displayName: 'Assay Office',
    blurb: "Write orders; the town's craftsmen answer. One per claim.",
    costCurve: () => Balance.assayOffice.cost,
    footprint: { w: 2, d: 1.5 },
    hpMax: Balance.wreck.hp.assay_office,
    placement: 'river-adjacent',
    slotFamily: 'building.assay_office',
    maxCount: Balance.assayOffice.maxCount,
    iconSlot: 'ui.build.icon.assay_office',
    portraitSlug: 'claim-office',
  },
];

export function getBuildableDef(id: string): BuildableDef | undefined {
  return buildableDefs.find((def) => def.id === id);
}

export function isBuildableId(id: unknown): id is BuildableId {
  return typeof id === 'string' && buildableDefs.some((def) => def.id === id);
}

export function buildableBlurb(def: BuildableDef): string | undefined {
  return typeof def.blurb === 'function' ? def.blurb() : def.blurb;
}

export function buildableTierEffectLine(id: BuildableId, tier = 1): string | undefined {
  if (id === 'palisade') {
    const rung = Balance.tiers.palisade[tier - 1] ?? Balance.tiers.palisade[0];
    return `T${tier}: ${formatBuildNumber(Math.round(Balance.wreck.hp.palisade * rung.maxHpMult))} HP`;
  }
  if (id === 'sluice') {
    const rung = Balance.tiers.sluice[tier - 1] ?? Balance.tiers.sluice[0];
    const cycleSeconds = Balance.sluice.cycleSeconds / Math.max(0.001, rung.panRateMult);
    const yieldPerCycle = Math.max(1, Math.round(Balance.sluice.goldPerCycle * rung.yieldMult));
    return `T${tier}: ${formatBuildNumber(yieldPerCycle)}g every ${formatBuildNumber(cycleSeconds)}s`;
  }
  if (id === 'turret') {
    const rung = Balance.tiers.turret[tier - 1] ?? Balance.tiers.turret[0];
    const damage = Math.round(Balance.turret.damage * rung.damageMult);
    return `T${tier}: ${formatBuildNumber(damage)} damage at ${formatBuildNumber(Balance.turret.fireRate * rung.fireRateMult)}/s`;
  }
  return undefined;
}

export function beaconCost(index: number): number {
  return Math.ceil((Balance.beacon.costBase * Balance.beacon.costGrowth ** index) / 5) * 5;
}

export function turretCost(index: number): number {
  return Math.ceil((Balance.turret.costBase * Balance.turret.costGrowth ** index) / 5) * 5;
}

function formatBuildNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1).replace(/\.0$/, '');
}
